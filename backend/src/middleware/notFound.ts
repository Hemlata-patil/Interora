import { Request, Response, NextFunction } from 'express';
import type { ApiError } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// 404 middleware — catches any request that did not match a registered route.
// Must be registered AFTER all routes but BEFORE errorHandler.
// ─────────────────────────────────────────────────────────────────────────────

export function notFound(req: Request, res: Response, _next: NextFunction): void {
  const body: ApiError = {
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  };
  res.status(404).json(body);
}
