import { Router } from 'express';
import {
  listEvaluationsController,
  getEvaluationByIdController,
  createEvaluationController,
  updateEvaluationController,
  updateEvaluationStatusController,
  deleteEvaluationController,
} from '../controllers/evaluation.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

// ─────────────────────────────────────────────────────────────────────────────
// Evaluation Routes — mounted at /api/evaluations
// ─────────────────────────────────────────────────────────────────────────────

const router = Router();

// ── 1. List evaluations ──────────────────────────────────────────────────────
// Scoped to caller's role (student, company, faculty, mentor, admin)
router.get('/', authenticate, listEvaluationsController);

// ── 2. Get evaluation by ID ──────────────────────────────────────────────────
// Enforces assignment-level authorization
router.get('/:id', authenticate, getEvaluationByIdController);

// ── 3. Create evaluation ─────────────────────────────────────────────────────
// Allowed: company owner, supervising faculty, industry mentor, admin (students forbidden)
router.post(
  '/',
  authenticate,
  requireRole('company', 'faculty', 'mentor', 'admin'),
  createEvaluationController
);

// ── 4. Update evaluation fields ──────────────────────────────────────────────
// Allowed: evaluator, faculty mentor, admin
router.patch(
  '/:id',
  authenticate,
  requireRole('company', 'faculty', 'mentor', 'admin'),
  updateEvaluationController
);

// ── 5. Update evaluation status / verification ───────────────────────────────
// Allowed: evaluator (submit), faculty mentor / admin (cross-verify or request corrections)
router.patch(
  '/:id/status',
  authenticate,
  requireRole('company', 'faculty', 'mentor', 'admin'),
  updateEvaluationStatusController
);

// ── 6. Delete evaluation ─────────────────────────────────────────────────────
// Allowed: evaluator (draft only), admin
router.delete(
  '/:id',
  authenticate,
  requireRole('company', 'faculty', 'mentor', 'admin'),
  deleteEvaluationController
);

export default router;
