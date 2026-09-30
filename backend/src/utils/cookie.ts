import { env } from '../config/env';
import type { CookieOptions } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// Cookie helper utilities.
//
// The JWT is stored exclusively in an HTTP-only cookie.
// Frontend JavaScript can never read it — it is transparently sent by the
// browser on every same-origin request.
//
// Security properties:
//   httpOnly: true    → JS cannot access the cookie (prevents XSS theft)
//   secure: true      → HTTPS only in production
//   sameSite: strict  → CSRF protection in production
//   sameSite: lax     → Allows navigation links to work in development
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns standardised, security-hardened options for setting the session cookie.
 * @param maxAgeMs — Cookie lifetime in milliseconds
 */
export function buildCookieOptions(maxAgeMs: number): CookieOptions {
  return {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: env.isProduction ? 'strict' : 'lax',
    maxAge: maxAgeMs,
    path: '/',
  };
}

/**
 * Returns options to immediately expire and clear the session cookie.
 * Used on logout.
 */
export function buildClearCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: env.isProduction ? 'strict' : 'lax',
    maxAge: 0,
    path: '/',
  };
}

/**
 * Parses a JWT_EXPIRES_IN-style string (e.g. '7d', '24h', '60m', '3600s')
 * into an equivalent millisecond value for use in cookie maxAge.
 */
export function parseExpiryToMs(expiry: string): number {
  const unit = expiry.slice(-1);
  const value = parseInt(expiry.slice(0, -1), 10);
  if (isNaN(value) || value <= 0) return 7 * 24 * 60 * 60 * 1000; // fallback: 7d
  switch (unit) {
    case 'd': return value * 24 * 60 * 60 * 1000;
    case 'h': return value * 60 * 60 * 1000;
    case 'm': return value * 60 * 1000;
    case 's': return value * 1000;
    default:  return 7 * 24 * 60 * 60 * 1000;
  }
}
