import { Router } from 'express';
import {
  getMyAttendanceController,
  checkInAttendanceController,
  checkOutAttendanceController,
  getAssignmentAttendanceController,
  getAttendanceByIdController,
  createAttendanceController,
  updateAttendanceController,
  getAttendanceSummaryController,
  listAttendanceRecordsController,
} from '../controllers/attendance.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

// ─────────────────────────────────────────────────────────────────────────────
// Attendance Routes — mounted at /api/attendance
// ─────────────────────────────────────────────────────────────────────────────

const router = Router();

// ── Scoped List Attendance (All authenticated roles) ─────────────────────────
router.get('/', authenticate, listAttendanceRecordsController);

// ── Student Attendance ───────────────────────────────────────────────────────
router.get('/my', authenticate, requireRole('student'), getMyAttendanceController);
router.post('/check-in', authenticate, requireRole('student'), checkInAttendanceController);
router.post('/check-out', authenticate, requireRole('student'), checkOutAttendanceController);

// ── Summary & Assignment Attendance ──────────────────────────────────────────
router.get('/summary/:assignmentId', authenticate, getAttendanceSummaryController);
router.get('/assignment/:assignmentId', authenticate, getAssignmentAttendanceController);

// ── Individual Attendance Record Read ────────────────────────────────────────
router.get('/:id', authenticate, getAttendanceByIdController);

// ── Attendance Logging & Updates (Company, Faculty, Admin) ───────────────────
router.post(
  '/',
  authenticate,
  requireRole('company', 'faculty', 'admin'),
  createAttendanceController
);
router.patch(
  '/:id',
  authenticate,
  requireRole('company', 'faculty', 'admin'),
  updateAttendanceController
);

export default router;
