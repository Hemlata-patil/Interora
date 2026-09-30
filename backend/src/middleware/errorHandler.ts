import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';
import type { ApiError } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// Centralised error-handling middleware.
//
// Express identifies error-handling middleware by the 4-argument signature
// (err, req, res, next). It must be registered LAST in app.ts.
//
// Usage — throw from any route/controller:
//   throw new AppError(404, 'Resource not found');
//   or: next(new AppError(400, 'Validation failed'));
// ─────────────────────────────────────────────────────────────────────────────

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(statusCode: number, message: string, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err instanceof AppError ? err.statusCode : 500;

  const body: ApiError = {
    success: false,
    message: err.message || 'Internal Server Error',
  };

  // Include stack trace in development only
  if (env.isDevelopment) {
    body.stack = err.stack;
  }

  // Log server errors
  if (statusCode >= 500) {
    console.error(`[ERROR] ${req.method} ${req.path} →`, err);
  }

  res.status(statusCode).json(body);
}
