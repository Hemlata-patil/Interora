import { Router } from 'express';
import {
  listTasksController,
  getTaskByIdController,
  createTaskController,
  updateTaskController,
  updateTaskStatusController,
  createTaskSubmissionController,
  getTaskSubmissionsController,
  reviewTaskSubmissionController,
} from '../controllers/task.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

// ─────────────────────────────────────────────────────────────────────────────
// Task Routes — mounted at /api/tasks
// ─────────────────────────────────────────────────────────────────────────────

const router = Router();

// ── 1. Task listing ──────────────────────────────────────────────────────────
// Scoped to caller's role (student, company, faculty, mentor, admin)
router.get('/', authenticate, listTasksController);

// ── 2. Get task by ID ────────────────────────────────────────────────────────
// Enforces assignment-level authorization
router.get('/:id', authenticate, getTaskByIdController);

// ── 3. Create task ───────────────────────────────────────────────────────────
// Allowed: company owner, supervising faculty mentor, admin
router.post(
  '/',
  authenticate,
  requireRole('company', 'faculty', 'admin'),
  createTaskController
);

// ── 4. Update task fields ────────────────────────────────────────────────────
// Allowed: company owner, supervising faculty mentor, admin
router.patch(
  '/:id',
  authenticate,
  requireRole('company', 'faculty', 'admin'),
  updateTaskController
);

// ── 5. Update task status ────────────────────────────────────────────────────
// Allowed: assigned student (assigned -> in_progress), company, faculty, admin
router.patch(
  '/:id/status',
  authenticate,
  requireRole('student', 'company', 'faculty', 'admin'),
  updateTaskStatusController
);

// ── 6. Student task submission ───────────────────────────────────────────────
// Allowed: assigned student only
router.post(
  '/:taskId/submissions',
  authenticate,
  requireRole('student'),
  createTaskSubmissionController
);

// ── 7. View submissions ──────────────────────────────────────────────────────
// Allowed: student, company, faculty, mentor, admin
router.get(
  '/:taskId/submissions',
  authenticate,
  requireRole('student', 'company', 'faculty', 'mentor', 'admin'),
  getTaskSubmissionsController
);

// ── 8. Review submission ─────────────────────────────────────────────────────
// Allowed: company owner, supervising faculty mentor, admin
router.patch(
  '/:taskId/submissions/:submissionId',
  authenticate,
  requireRole('company', 'faculty', 'mentor', 'admin'),
  reviewTaskSubmissionController
);

export default router;
