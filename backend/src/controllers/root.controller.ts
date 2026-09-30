import { Request, Response } from 'express';
import type { ApiSuccess } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// Root controller.
// Responds to GET / with a minimal identification payload.
// ─────────────────────────────────────────────────────────────────────────────

export function rootHandler(_req: Request, res: Response): void {
  const body: ApiSuccess<{ phase: string }> = {
    success: true,
    message: 'Interora Backend is running',
    data: {
      phase: 'Phase 0',
    },
  };
  res.status(200).json(body);
}
