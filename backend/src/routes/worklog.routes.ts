import { Router } from 'express';
import {
  listWorkLogsController,
  getWorkLogByIdController,
  createWorkLogController,
  updateWorkLogController,
  deleteWorkLogController,
} from '../controllers/worklog.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

// ─────────────────────────────────────────────────────────────────────────────
// Work Log Routes — mounted at /api/work-logs
// ─────────────────────────────────────────────────────────────────────────────

const router = Router();

// ── 1. List work logs ────────────────────────────────────────────────────────
// Scoped to caller's role (student, company, faculty, mentor, admin)
router.get('/', authenticate, listWorkLogsController);

// ── 2. Get work log by ID ────────────────────────────────────────────────────
// Enforces assignment-level authorization
router.get('/:id', authenticate, getWorkLogByIdController);

// ── 3. Create work log ───────────────────────────────────────────────────────
// Primary creator: assigned student (or company / admin)
router.post(
  '/',
  authenticate,
  requireRole('student', 'company', 'admin'),
  createWorkLogController
);

// ── 4. Update work log ───────────────────────────────────────────────────────
// Allowed: assigned student, company owner, faculty, admin
router.patch(
  '/:id',
  authenticate,
  requireRole('student', 'company', 'faculty', 'admin'),
  updateWorkLogController
);

// ── 5. Delete work log ───────────────────────────────────────────────────────
// Allowed: assigned student, company owner, admin
// Safe deletion enforced in service layer
router.delete(
  '/:id',
  authenticate,
  requireRole('student', 'company', 'admin'),
  deleteWorkLogController
);

export default router;
