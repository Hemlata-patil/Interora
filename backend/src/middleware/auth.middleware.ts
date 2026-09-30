import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { AppError } from './errorHandler';
import { env } from '../config/env';
import prisma from '../services/prisma.service';
import type { UserRole } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// Auth middleware.
//
// authenticate():
//   1. Reads the JWT from the HTTP-only cookie.
//   2. Verifies the JWT signature and expiry.
//   3. Queries the CURRENT Profile from the database using the token's `sub`.
//   4. Attaches the DB-authoritative identity to req.user.
//
//   The JWT is used only to establish the user's ID — role and accountStatus
//   are always read from the database so that:
//     - A deactivated account is blocked immediately (no need to wait for token expiry).
//     - A role change takes effect immediately on the next request.
//
// requireRole(...roles):
//   Returns a middleware that checks req.user.role against the allowed list.
//   Must be used AFTER authenticate().
//   API is unchanged from Phase 1.
//
// Usage in routes:
//   router.get('/me', authenticate, meController);
//   router.post('/admin/action', authenticate, requireRole('admin'), handler);
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Verifies the session cookie, loads the current Profile from the database,
 * and attaches DB-authoritative identity to req.user.
 *
 * Returns HTTP 401 for:
 *   - Missing or invalid cookie / JWT
 *   - Profile not found in the database
 *   - Account status is 'inactive'
 *
 * Pending company accounts are allowed through — business-operation routes
 * enforce further restrictions at the route level.
 */
export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // ── Step 1: Read and verify the JWT from the HTTP-only cookie ─────────────
    const token: string | undefined = req.cookies?.[env.COOKIE_NAME];

    if (!token) {
      throw new AppError(401, 'Authentication required. Please log in.');
    }

    // Throws JsonWebTokenError or TokenExpiredError on failure
    const payload = verifyToken(token);

    // ── Step 2: Load the authoritative Profile from the database ──────────────
    // We use only `payload.sub` (the profile UUID) from the token.
    // Role and accountStatus come exclusively from the current DB record.
    const profile = await prisma.profile.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        role: true,
        accountStatus: true,
      },
    });

    if (!profile) {
      // Token is valid but the account no longer exists in the database
      throw new AppError(401, 'Account not found. Please log in again.');
    }

    // ── Step 3: Enforce account status ────────────────────────────────────────
    // Only 'inactive' is blocked here.
    // 'pending' (company awaiting approval) is intentionally allowed through —
    // route-level guards control what pending accounts may actually do.
    if (profile.accountStatus === 'inactive') {
      throw new AppError(401, 'Your account has been deactivated. Please contact support.');
    }

    // ── Step 4: Attach DB-authoritative identity to the request ───────────────
    req.user = {
      id: profile.id,
      email: profile.email,
      role: profile.role as UserRole, // sourced from DB, not from JWT
    };

    next();
  } catch (err) {
    // Translate JWT-specific errors into clean 401s without leaking internals
    if (err instanceof AppError) {
      next(err);
    } else if (err instanceof Error) {
      if (err.name === 'TokenExpiredError') {
        next(new AppError(401, 'Your session has expired. Please log in again.'));
      } else {
        next(new AppError(401, 'Invalid session. Please log in again.'));
      }
    } else {
      next(new AppError(401, 'Authentication failed.'));
    }
  }
}

/**
 * Role-based access control middleware factory.
 *
 * Returns a middleware that allows the request through only if the
 * authenticated user's role is in the permitted list.
 *
 * MUST be used after authenticate().
 * API unchanged from Phase 1.
 *
 * @example
 *   router.post('/companies/:id/approve', authenticate, requireRole('admin'), handler);
 */
export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError(401, 'Authentication required.'));
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(403, `Access denied. Required role: ${allowedRoles.join(' or ')}.`)
      );
    }
    next();
  };
}
