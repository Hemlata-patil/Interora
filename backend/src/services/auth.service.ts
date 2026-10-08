import bcrypt from 'bcryptjs';
import { AppRole, AccountStatus, CompanyStatus, Prisma } from '@prisma/client';
import prisma from './prisma.service';
import { signToken } from '../utils/jwt';
import { AppError } from '../middleware/errorHandler';
import type { UserRole } from '../types';
import type { UpdateProfileInput } from '../validators/auth.validators';

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
  phone?: string | null;
  avatarUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
  companyProfile?: {
    id?: string;
    companyName: string;
    approvalStatus: string;
    verified: boolean;
    industryDomain?: string;
    contactPerson?: string;
    officialEmail?: string;
    phone?: string;
    website?: string | null;
    companyAddress?: string | null;
    geoLat?: number | null;
    geoLng?: number | null;
    geoFenceRadiusM?: number;
    approvedAt?: Date | null;
    rejectionReason?: string | null;
  } | null;
  studentProfile?: {
    studentId: string;
    departmentId: string;
    course: string;
    batchYear: string;
    batchDivision: string;
    currentSemester: string;
    cgpa: string | null;
    skills: string[];
    resumeUrl: string | null;
  } | null;
  facultyProfile?: {
    facultyId: string;
    designation: string;
    cabinLocation?: string | null;
    officePhone?: string | null;
    department?: {
      id: string;
      name: string;
      code: string;
    } | null;
  } | null;
  departmentName?: string | null;
}

export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
  role?: 'student' | 'company';
  departmentId?: string;
  departmentCode?: string;
  phone?: string;
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
  companyProfile?: {
    companyName: string;
    approvalStatus: string;
    verified: boolean;
  } | null;
}): SafeUser {
  return {
    id: profile.id,
    email: profile.email,
    fullName: profile.fullName,
    role: profile.role as UserRole,
    accountStatus: profile.accountStatus,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
    companyProfile: profile.companyProfile ?? null,
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
      // Resolve department safely without generating invalid foreign keys
      let departmentId = payload.departmentId;

      if (!departmentId && payload.departmentCode) {
        const byCode = await tx.department.findUnique({
          where: { code: payload.departmentCode },
          select: { id: true },
        });
        if (byCode) departmentId = byCode.id;
      }

      if (!departmentId) {
        const defaultDept = await tx.department.findFirst({
          where: { code: 'CSE' },
          select: { id: true },
        });
        if (defaultDept) {
          departmentId = defaultDept.id;
        } else {
          const anyDept = await tx.department.findFirst({ select: { id: true } });
          if (anyDept) {
            departmentId = anyDept.id;
          } else {
            const created = await tx.department.upsert({
              where: { code: 'CSE' },
              update: {},
              create: {
                code: 'CSE',
                name: 'Computer Science and Engineering',
                program: 'B.Tech',
              },
              select: { id: true },
            });
            departmentId = created.id;
          }
        }
      }

      // Create StudentProfile with sensible defaults aligned with 35-model schema
      await tx.studentProfile.create({
        data: {
          id: newProfile.id,
          studentId: `STU-${newProfile.id.substring(0, 8).toUpperCase()}`,
          departmentId,
          course: 'B.Tech Computer Science',
          batchYear: '2026',
          batchDivision: 'CS1',
          currentSemester: '6th Semester',
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
          phone: payload.phone ?? 'N/A',
          industryDomain: 'Software & Cloud Services',
          approvalStatus: CompanyStatus.pending,
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
      phone: true,
      avatarUrl: true,
      createdAt: true,
      updatedAt: true,
      companyProfile: {
        select: {
          id: true,
          companyName: true,
          industryDomain: true,
          contactPerson: true,
          officialEmail: true,
          phone: true,
          website: true,
          companyAddress: true,
          geoLat: true,
          geoLng: true,
          geoFenceRadiusM: true,
          approvalStatus: true,
          verified: true,
          approvedAt: true,
          rejectionReason: true,
        },
      },
      studentProfile: {
        select: {
          studentId: true,
          departmentId: true,
          course: true,
          batchYear: true,
          batchDivision: true,
          currentSemester: true,
          cgpa: true,
          skills: true,
          resumeUrl: true,
        },
      },
      facultyProfile: {
        select: {
          facultyId: true,
          designation: true,
          cabinLocation: true,
          officePhone: true,
          department: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      },
      headOfDepartments: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
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
    phone: profile.phone ?? null,
    avatarUrl: profile.avatarUrl ?? null,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
    companyProfile: profile.companyProfile ?? null,
    studentProfile: profile.studentProfile
      ? {
          studentId: profile.studentProfile.studentId,
          departmentId: profile.studentProfile.departmentId,
          course: profile.studentProfile.course,
          batchYear: profile.studentProfile.batchYear,
          batchDivision: profile.studentProfile.batchDivision,
          currentSemester: profile.studentProfile.currentSemester,
          cgpa: profile.studentProfile.cgpa ? profile.studentProfile.cgpa.toString() : null,
          skills: profile.studentProfile.skills,
          resumeUrl: profile.studentProfile.resumeUrl ?? null,
        }
      : null,
    facultyProfile: profile.facultyProfile
      ? {
          facultyId: profile.facultyProfile.facultyId,
          designation: profile.facultyProfile.designation,
          cabinLocation: profile.facultyProfile.cabinLocation,
          officePhone: profile.facultyProfile.officePhone,
          department: profile.facultyProfile.department,
        }
      : null,
    departmentName: profile.headOfDepartments?.[0]?.name ?? null,
  };
}

// ── Update current user profile ──────────────────────────────────────────────

/**
 * Updates permitted profile fields for the authenticated user.
 * Called by PATCH /api/auth/me.
 *
 * Rules:
 * - User identity is strictly derived from req.user.id.
 * - Only approved profile and sub-profile fields may be modified.
 * - Protected administrative and auth fields (role, email, accountStatus) cannot be updated.
 * - Changes are persisted via Prisma transaction.
 */
export async function updateCurrentUser(
  userId: string,
  payload: UpdateProfileInput
): Promise<SafeUser> {
  const profile = await prisma.profile.findUnique({
    where: { id: userId },
    include: { studentProfile: true, facultyProfile: true, companyProfile: true },
  });

  if (!profile) {
    throw new AppError(401, 'Authenticated user not found. Please log in again.');
  }

  // 1. Prepare Base Profile updates
  const profileData: Prisma.ProfileUpdateInput = {};
  if (payload.fullName !== undefined) profileData.fullName = payload.fullName;
  if (payload.phone !== undefined) profileData.phone = payload.phone;
  if (payload.avatarUrl !== undefined) profileData.avatarUrl = payload.avatarUrl;

  // 2. Prepare Student Profile updates if user has a studentProfile
  const studentData: Prisma.StudentProfileUpdateInput = {};
  if (payload.course !== undefined) studentData.course = payload.course;
  if (payload.currentSemester !== undefined) studentData.currentSemester = String(payload.currentSemester);
  if (payload.batchYear !== undefined) studentData.batchYear = String(payload.batchYear);
  if (payload.batchDivision !== undefined) studentData.batchDivision = payload.batchDivision;
  if (payload.skills !== undefined) studentData.skills = payload.skills;
  if (payload.resumeUrl !== undefined) studentData.resumeUrl = payload.resumeUrl;

  // 3. Prepare Faculty Profile updates if user has a facultyProfile
  const facultyData: Prisma.FacultyProfileUpdateInput = {};
  if (payload.designation !== undefined) facultyData.designation = payload.designation;
  if (payload.cabinLocation !== undefined) facultyData.cabinLocation = payload.cabinLocation;
  if (payload.officePhone !== undefined) facultyData.officePhone = payload.officePhone;

  // 4. Prepare Company Profile updates if user has a companyProfile
  const companyData: Prisma.CompanyProfileUpdateInput = {};
  if (payload.companyName !== undefined) companyData.companyName = payload.companyName;
  if (payload.industryDomain !== undefined) companyData.industryDomain = payload.industryDomain;
  if (payload.contactPerson !== undefined) companyData.contactPerson = payload.contactPerson;
  if (payload.website !== undefined) companyData.website = payload.website;
  if (payload.companyAddress !== undefined) companyData.companyAddress = payload.companyAddress;
  if (payload.geoLat !== undefined) companyData.geoLat = payload.geoLat;
  if (payload.geoLng !== undefined) companyData.geoLng = payload.geoLng;
  if (payload.geoFenceRadiusM !== undefined) companyData.geoFenceRadiusM = payload.geoFenceRadiusM;

  await prisma.$transaction(async (tx) => {
    if (Object.keys(profileData).length > 0) {
      await tx.profile.update({
        where: { id: userId },
        data: profileData,
      });
    }

    if (profile.studentProfile && Object.keys(studentData).length > 0) {
      await tx.studentProfile.update({
        where: { id: userId },
        data: studentData,
      });
    }

    if (profile.facultyProfile && Object.keys(facultyData).length > 0) {
      await tx.facultyProfile.update({
        where: { id: userId },
        data: facultyData,
      });
    }

    if (profile.companyProfile && Object.keys(companyData).length > 0) {
      await tx.companyProfile.update({
        where: { id: userId },
        data: companyData,
      });
    }
  });

  return getCurrentUser(userId);
}
