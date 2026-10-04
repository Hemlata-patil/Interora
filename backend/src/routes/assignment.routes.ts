import { Router } from 'express';
import {
  createAssignmentController,
  listAssignmentsController,
  getAssignmentByIdController,
  updateAssignmentController,
  updateAssignmentStatusController,
  deleteAssignmentController,
} from '../controllers/assignment.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

// ─────────────────────────────────────────────────────────────────────────────
// Assignment Routes — mounted at /api/assignments
// ─────────────────────────────────────────────────────────────────────────────

const router = Router();

// ── Authenticated Read Operations ─────────────────────────────────────────────
router.get('/', authenticate, listAssignmentsController);
router.get('/:id', authenticate, getAssignmentByIdController);

// ── Company / Admin Management Operations ─────────────────────────────────────
router.post('/', authenticate, requireRole('company', 'admin'), createAssignmentController);
router.patch('/:id', authenticate, requireRole('company', 'admin'), updateAssignmentController);
router.patch(
  '/:id/status',
  authenticate,
  requireRole('company', 'admin'),
  updateAssignmentStatusController
);
router.delete('/:id', authenticate, requireRole('company', 'admin'), deleteAssignmentController);

export default router;
