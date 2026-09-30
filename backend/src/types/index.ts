// ─────────────────────────────────────────────────────────────────────────────
// src/types/index.ts
//
// Shared TypeScript types for the backend.
// These are intentionally separate from the frontend types — they represent
// the canonical server-side data shapes.
// ─────────────────────────────────────────────────────────────────────────────

// ── User / Auth ───────────────────────────────────────────────────────────────

export type UserRole = 'student' | 'faculty' | 'company' | 'industry_mentor' | 'admin';

export type AccountStatus = 'pending' | 'active' | 'inactive';

export type CompanyApprovalStatus = 'pending' | 'approved' | 'rejected' | 'inactive';

/**
 * The payload embedded inside the JWT and attached to req.user after
 * auth middleware validates the cookie.
 */
export interface JwtPayload {
  sub: string;        // profile UUID
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

/**
 * Typed extension of Express Request — added by authMiddleware.
 * Declared in src/types/express/index.d.ts so Express picks it up globally.
 */
export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
}

// ── API Response shapes ───────────────────────────────────────────────────────

export interface ApiSuccess<T = unknown> {
  success: true;
  message?: string;
  data?: T;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
  stack?: string;
}

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError;

// ── Pagination ────────────────────────────────────────────────────────────────

export interface PaginationMeta {
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  meta: PaginationMeta;
}

// ── Cookie options (used when setting the HTTP-only session cookie) ────────────

export interface CookieOptions {
  httpOnly: true;
  secure: boolean;
  sameSite: 'strict' | 'lax' | 'none';
  maxAge: number;
  path: string;
}
