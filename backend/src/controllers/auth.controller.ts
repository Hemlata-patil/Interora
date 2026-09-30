import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';
import { registerSchema, loginSchema, parseSchema } from '../validators/auth.validators';
import { buildCookieOptions, buildClearCookieOptions, parseExpiryToMs } from '../utils/cookie';
import { env } from '../config/env';
import { AppError } from '../middleware/errorHandler';
import type { ApiSuccess, ApiError } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// Auth controller — thin orchestration layer.
//
// Responsibilities:
//   1. Parse + validate request body via Zod
//   2. Delegate to authService
//   3. Set / clear the HTTP-only cookie
//   4. Return a safe JSON response (never includes passwordHash)
//
// Error handling:
//   All thrown AppErrors are caught by the centralised errorHandler middleware.
// ─────────────────────────────────────────────────────────────────────────────

// ── POST /api/auth/register ────────────────────────────────────────────────────

export async function registerController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // 1. Validate input
    const parsed = parseSchema(registerSchema, req.body);
    if (!parsed.success) {
      const body: ApiError = { success: false, message: 'Validation failed', errors: parsed.errors };
      res.status(400).json(body);
      return;
    }

    // 2. Register user (hashes password, creates Profile + sub-profile)
    const { user, token } = await authService.register(parsed.data);

    // 3. Set HTTP-only session cookie
    const maxAge = parseExpiryToMs(env.JWT_EXPIRES_IN);
    res.cookie(env.COOKIE_NAME, token, buildCookieOptions(maxAge));

    // 4. Return safe user — no passwordHash
    const body: ApiSuccess<typeof user> = {
      success: true,
      message:
        user.accountStatus === 'pending'
          ? 'Account created. It is pending admin approval.'
          : 'Account created successfully.',
      data: user,
    };
    res.status(201).json(body);
  } catch (err) {
    next(err);
  }
}

// ── POST /api/auth/login ───────────────────────────────────────────────────────

export async function loginController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // 1. Validate input
    const parsed = parseSchema(loginSchema, req.body);
    if (!parsed.success) {
      const body: ApiError = { success: false, message: 'Validation failed', errors: parsed.errors };
      res.status(400).json(body);
      return;
    }

    // 2. Validate credentials + issue token
    const { user, token } = await authService.login(parsed.data);

    // 3. Set HTTP-only session cookie
    const maxAge = parseExpiryToMs(env.JWT_EXPIRES_IN);
    res.cookie(env.COOKIE_NAME, token, buildCookieOptions(maxAge));

    // 4. Return safe user
    const body: ApiSuccess<typeof user> = {
      success: true,
      message: 'Login successful.',
      data: user,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

// ── POST /api/auth/logout ──────────────────────────────────────────────────────

export async function logoutController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Clear the session cookie by setting maxAge to 0
    res.cookie(env.COOKIE_NAME, '', buildClearCookieOptions());

    const body: ApiSuccess = {
      success: true,
      message: 'Logged out successfully.',
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

// ── GET /api/auth/me ───────────────────────────────────────────────────────────

export async function meController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // req.user is populated by the authenticate() middleware
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    // Load fresh profile data from the database (token may be older than last update)
    const user = await authService.getCurrentUser(req.user.id);

    const body: ApiSuccess<typeof user> = {
      success: true,
      data: user,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}
