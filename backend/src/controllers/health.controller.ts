import { Request, Response } from 'express';
import type { ApiSuccess } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// Health check controller.
// Returns a simple JSON payload confirming the server is running.
// Called by GET /api/health.
// ─────────────────────────────────────────────────────────────────────────────

export function healthCheck(_req: Request, res: Response): void {
  const body: ApiSuccess<{ timestamp: string; uptime: number }> = {
    success: true,
    message: 'Interora backend is running',
    data: {
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
    },
  };
  res.status(200).json(body);
}
