import bcrypt from 'bcryptjs';
import { AppRole, AccountStatus } from '@prisma/client';
import prisma from './prisma.service';
import { signToken } from '../utils/jwt';
import { AppError } from '../middleware/errorHandler';
import type { UserRole } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// Auth service — business logic for registration, login, and session management.
//
// Rules (mirroring the Supabase handle_new_user() trigger):
//   - 'student' accounts are created immediately ACTIVE.
//   - 'company' accounts are created as PENDING, awaiting admin approval.
//   - Faculty / admin accounts are NOT self-registerable via this service.
//
// Security rules:
//   - Passwords are hashed with bcrypt (12 rounds).
//   - passwordHash is NEVER returned in any public response.
//   - Generic error messages are used for auth failures to prevent enumeration.
// ─────────────────────────────────────────────────────────────────────────────

const BCRYPT_ROUNDS = 12;

// ── Public types ──────────────────────────────────────────────────────────────

/** Safe user object — never includes passwordHash. */
export interface SafeUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  accountStatus: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
  role?: 'student' | 'company';
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResult {
  user: SafeUser;
  token: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Strips passwordHash and returns only safe public fields. */
function toSafeUser(profile: {
  id: string;
  email: string;
  fullName: string;
  role: AppRole;
  accountStatus: AccountStatus;
  createdAt: Date;
  updatedAt: Date;
}): SafeUser {
  return {
    id: profile.id,
    email: profile.email,
    fullName: profile.fullName,
    role: profile.role as UserRole,
    accountStatus: profile.accountStatus,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
  };
}

// ── Register ──────────────────────────────────────────────────────────────────

/**
 * Registers a new user, hashes their password, and returns a signed JWT.
 *
 * Creates:
 *   - Profile row (all roles)
 *   - StudentProfile row  (when role = 'student')
 *   - CompanyProfile row  (when role = 'company')
 *
 * Mirrors the logic in the Supabase handle_new_user() trigger so the data
 * model stays consistent when migrating to this backend.
 */
export async function register(payload: RegisterPayload): Promise<AuthResult> {
  const { email, password, fullName, role = 'student' } = payload;

  // 1. Duplicate email check
  const existing = await prisma.profile.findUnique({ where: { email } });
  if (existing) {
    throw new AppError(409, 'An account with this email already exists.');
  }

  // 2. Hash password (never store plaintext)
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  // 3. Determine initial account status (mirrors Supabase trigger)
  const accountStatus: AccountStatus =
    role === 'company' ? AccountStatus.pending : AccountStatus.active;

  // 4. Create Profile + extended sub-profile in a single transaction
  const profile = await prisma.$transaction(async (tx) => {
    const newProfile = await tx.profile.create({
      data: {
        email,
        fullName,
        role: role as AppRole,
        accountStatus,
        passwordHash,
      },
    });

    if (role === 'student') {
      // Create StudentProfile with sensible defaults (mirrors trigger)
      await tx.studentProfile.create({
        data: {
          id: newProfile.id,
          studentId: `STU-${newProfile.id.substring(0, 8).toUpperCase()}`,
          department: 'CSE',
          course: 'B.Tech Computer Science',
          yearSemester: '3rd Year / 6th Sem',
          skills: [],
        },
      });
    } else if (role === 'company') {
      // Create CompanyProfile with minimal pending defaults (mirrors trigger)
      // Full company details are filled in by the company after approval.
      await tx.companyProfile.create({
        data: {
          id: newProfile.id,
          companyName: fullName, // placeholder; company updates this in their profile
          contactPerson: fullName,
          officialEmail: email,
          industryDomain: 'Software & Cloud Services',
          approvalStatus: 'pending',
        },
      });
    }

    return newProfile;
  });

  // 5. Issue JWT
  const token = signToken({
    sub: profile.id,
    email: profile.email,
    role: profile.role as UserRole,
  });

  return { user: toSafeUser(profile), token };
}

// ── Login ─────────────────────────────────────────────────────────────────────

/**
 * Validates credentials and returns a signed JWT.
 *
 * Uses a generic error message for all auth failures to prevent
 * credential enumeration attacks (timing-safe by design).
 */
export async function login(payload: LoginPayload): Promise<AuthResult> {
  const { email, password } = payload;

  // Generic error reused for all failure branches — do NOT vary the message
  const AUTH_ERROR = new AppError(401, 'Invalid email or password.');

  // 1. Find profile by email
  const profile = await prisma.profile.findUnique({ where: { email } });
  if (!profile) {
    // Run a dummy bcrypt to maintain consistent response time (timing attack prevention)
    await bcrypt.hash(password, BCRYPT_ROUNDS);
    throw AUTH_ERROR;
  }

  // 2. Check that a password hash exists (new backend users only).
  //    If null, log internally for observability and throw the generic AUTH_ERROR
  //    after a dummy hash to prevent user enumeration and timing attacks.
  if (!profile.passwordHash) {
    console.warn(`[Auth] Login attempted for account without password hash (legacy/unmigrated): ${email}`);
    await bcrypt.hash(password, BCRYPT_ROUNDS);
    throw AUTH_ERROR;
  }

  // 3. Compare password (timing-safe via bcrypt internals)
  const isValid = await bcrypt.compare(password, profile.passwordHash);
  if (!isValid) {
    throw AUTH_ERROR;
  }

  // 4. Block inactive accounts AFTER password verification
  //    (avoids revealing account existence via different errors)
  if (profile.accountStatus === AccountStatus.inactive) {
    throw new AppError(401, 'Your account has been deactivated. Please contact support.');
  }

  // 5. Issue JWT (pending company accounts get a token but will be blocked by route guards)
  const token = signToken({
    sub: profile.id,
    email: profile.email,
    role: profile.role as UserRole,
  });

  return { user: toSafeUser(profile), token };
}

// ── Get current user ──────────────────────────────────────────────────────────

/**
 * Loads the full profile for an authenticated user by their ID.
 * Called by GET /api/auth/me after auth middleware has verified the token.
 */
export async function getCurrentUser(userId: string): Promise<SafeUser> {
  const profile = await prisma.profile.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      accountStatus: true,
      createdAt: true,
      updatedAt: true,
      // passwordHash intentionally NOT selected
    },
  });

  if (!profile) {
    throw new AppError(401, 'Authenticated user not found. Please log in again.');
  }

  return {
    id: profile.id,
    email: profile.email,
    fullName: profile.fullName,
    role: profile.role as UserRole,
    accountStatus: profile.accountStatus,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
  };
}
