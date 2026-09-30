import dotenv from 'dotenv';
import path from 'path';

// Load .env from the backend/ root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// ─────────────────────────────────────────────────────────────────────────────
// Validated environment configuration.
// All variables are read once at startup and exported as typed constants.
// Add any new env var here — never read process.env outside this file.
// ─────────────────────────────────────────────────────────────────────────────

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`[env] Missing required environment variable: ${key}`);
  }
  return value;
}

function optionalEnv(key: string, fallback: string): string {
  return process.env[key] ?? fallback;
}

export const env = {
  /** PostgreSQL connection string for the new traditional backend DB */
  DATABASE_URL: requireEnv('DATABASE_URL'),

  /** Express server port */
  PORT: parseInt(optionalEnv('PORT', '3001'), 10),

  /** Runtime environment */
  NODE_ENV: optionalEnv('NODE_ENV', 'development'),

  /** URL of the Vite frontend (used for CORS origin) */
  FRONTEND_URL: optionalEnv('FRONTEND_URL', 'http://localhost:5173'),

  /** JWT signing secret — must be at least 64 characters in production */
  JWT_SECRET: requireEnv('JWT_SECRET'),

  /** JWT expiry duration string, e.g. '7d', '24h' */
  JWT_EXPIRES_IN: optionalEnv('JWT_EXPIRES_IN', '7d'),

  /** Name of the HTTP-only session cookie */
  COOKIE_NAME: optionalEnv('COOKIE_NAME', 'interora_session'),

  /** Derived boolean helpers */
  get isProduction() {
    return this.NODE_ENV === 'production';
  },
  get isDevelopment() {
    return this.NODE_ENV === 'development';
  },
} as const;
