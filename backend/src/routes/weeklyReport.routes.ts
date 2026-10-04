import { Router } from 'express';
import {
  listWeeklyReportsController,
  getWeeklyReportByIdController,
  createWeeklyReportController,
  updateWeeklyReportController,
  updateWeeklyReportStatusController,
  deleteWeeklyReportController,
} from '../controllers/weeklyReport.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

// ─────────────────────────────────────────────────────────────────────────────
// Weekly Report Routes — mounted at /api/weekly-reports
// ─────────────────────────────────────────────────────────────────────────────

const router = Router();

// ── 1. List weekly reports ───────────────────────────────────────────────────
// Scoped to caller's role (student, company, faculty, mentor, admin)
router.get('/', authenticate, listWeeklyReportsController);

// ── 2. Get weekly report by ID ───────────────────────────────────────────────
// Enforces assignment-level authorization & includes week's work logs
router.get('/:id', authenticate, getWeeklyReportByIdController);

// ── 3. Create weekly report ──────────────────────────────────────────────────
// Allowed: assigned student, admin
router.post(
  '/',
  authenticate,
  requireRole('student', 'admin'),
  createWeeklyReportController
);

// ── 4. Update weekly report fields ───────────────────────────────────────────
// Allowed: student (draft/submitted), company/faculty (mentor feedback), admin
router.patch(
  '/:id',
  authenticate,
  requireRole('student', 'company', 'faculty', 'admin'),
  updateWeeklyReportController
);

// ── 5. Update weekly report status ───────────────────────────────────────────
// Allowed: student (draft -> submitted), company/faculty/admin (submitted -> reviewed)
router.patch(
  '/:id/status',
  authenticate,
  requireRole('student', 'company', 'faculty', 'admin'),
  updateWeeklyReportStatusController
);

// ── 6. Delete weekly report ──────────────────────────────────────────────────
// Allowed: student (draft only), admin
router.delete(
  '/:id',
  authenticate,
  requireRole('student', 'admin'),
  deleteWeeklyReportController
);

export default router;
