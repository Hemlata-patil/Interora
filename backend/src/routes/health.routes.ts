import { Router } from 'express';
import { healthCheck } from '../controllers/health.controller';

// ─────────────────────────────────────────────────────────────────────────────
// Health route — GET /api/health
// Public endpoint, no auth required.
// ─────────────────────────────────────────────────────────────────────────────

const router = Router();

router.get('/', healthCheck);

export default router;
