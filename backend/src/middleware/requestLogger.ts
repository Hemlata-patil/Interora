import { Request, Response, NextFunction } from 'express';

// ─────────────────────────────────────────────────────────────────────────────
// Basic request logger middleware.
//
// Logs every incoming request with method, path, status code and response time.
// In production, swap this for a structured logger (e.g., winston + morgan).
// ─────────────────────────────────────────────────────────────────────────────

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  const { method, originalUrl } = req;

  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const color =
      status >= 500 ? '\x1b[31m' // red
      : status >= 400 ? '\x1b[33m' // yellow
      : status >= 300 ? '\x1b[36m' // cyan
      : '\x1b[32m';               // green
    const reset = '\x1b[0m';

    console.log(
      `${color}[${new Date().toISOString()}] ${method} ${originalUrl} → ${status} (${duration}ms)${reset}`
    );
  });

  next();
}
