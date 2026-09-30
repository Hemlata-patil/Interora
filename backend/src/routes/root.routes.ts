import { Router } from 'express';
import { rootHandler } from '../controllers/root.controller';

// ─────────────────────────────────────────────────────────────────────────────
// Root route — GET /
// Mounted directly on the app (not under /api prefix).
// ─────────────────────────────────────────────────────────────────────────────

const router = Router();

router.get('/', rootHandler);

export default router;
