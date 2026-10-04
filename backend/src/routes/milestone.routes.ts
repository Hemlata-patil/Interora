import { Router } from 'express';
import {
  listMilestonesController,
  getMilestoneByIdController,
  createMilestoneController,
  updateMilestoneController,
  updateMilestoneStatusController,
  deleteMilestoneController,
} from '../controllers/milestone.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

// ─────────────────────────────────────────────────────────────────────────────
// Milestone Routes — mounted at /api/milestones
// ─────────────────────────────────────────────────────────────────────────────

const router = Router();

// ── 1. List milestones ───────────────────────────────────────────────────────
// Scoped to caller's role (student, company, faculty, mentor, admin)
router.get('/', authenticate, listMilestonesController);

// ── 2. Get milestone by ID ───────────────────────────────────────────────────
// Enforces assignment-level authorization
router.get('/:id', authenticate, getMilestoneByIdController);

// ── 3. Create milestone ──────────────────────────────────────────────────────
// Allowed: company owner, supervising faculty mentor, admin
router.post(
  '/',
  authenticate,
  requireRole('company', 'faculty', 'admin'),
  createMilestoneController
);

// ── 4. Update milestone fields ───────────────────────────────────────────────
// Allowed: company owner, supervising faculty mentor, industry mentor, admin
router.patch(
  '/:id',
  authenticate,
  requireRole('company', 'faculty', 'mentor', 'admin'),
  updateMilestoneController
);

// ── 5. Update milestone status ───────────────────────────────────────────────
// Allowed: student (pending -> in_progress), company, faculty, industry mentor, admin
router.patch(
  '/:id/status',
  authenticate,
  requireRole('student', 'company', 'faculty', 'mentor', 'admin'),
  updateMilestoneStatusController
);

// ── 6. Delete milestone ──────────────────────────────────────────────────────
// Allowed: company owner, supervising faculty mentor, admin
// Safe deletion enforced in service layer (conflicts on completed/verified)
router.delete(
  '/:id',
  authenticate,
  requireRole('company', 'faculty', 'admin'),
  deleteMilestoneController
);

export default router;
