import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import type { UserRole } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// JWT utilities.
//
// The token payload is intentionally minimal — only the data needed for
// identity and access-control decisions on every request.  Profile details
// (fullName, accountStatus, etc.) are loaded from the database when needed.
//
// Payload fields:
//   sub   — Profile UUID (primary key)
//   email — Used to populate req.user without a DB call on every request
//   role  — Used by requireRole() middleware
// ─────────────────────────────────────────────────────────────────────────────

export interface TokenPayload {
  sub: string;      // profile UUID
  email: string;
  role: UserRole;
}

/**
 * Signs a JWT with the configured secret and expiry.
 * Never log or expose the returned token in server output.
 */
export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    issuer: 'interora-backend',
    audience: 'interora-client',
  });
}

/**
 * Verifies a JWT and returns its payload.
 * Throws a JsonWebTokenError or TokenExpiredError on failure —
 * the auth middleware catches these and returns HTTP 401.
 */
export function verifyToken(token: string): TokenPayload {
  const decoded = jwt.verify(token, env.JWT_SECRET, {
    issuer: 'interora-backend',
    audience: 'interora-client',
  });

  if (
    typeof decoded === 'string' ||
    !decoded ||
    typeof decoded.sub !== 'string' ||
    typeof decoded.email !== 'string' ||
    typeof decoded.role !== 'string'
  ) {
    throw new Error('Malformed token payload');
  }

  return {
    sub: decoded.sub,
    email: decoded.email,
    role: decoded.role as UserRole,
  };
}
