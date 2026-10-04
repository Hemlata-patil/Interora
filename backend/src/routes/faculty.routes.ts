import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import {
  getFacultyMetricsController,
  getAssignedStudentsController,
  getFacultyAttendanceController,
  getGuidanceNotesController,
  createGuidanceNoteController,
  getFacultyApplicationsController,
  facultyApplicationDecisionController,
} from '../controllers/faculty.controller';

const router = Router();

// Enforce authentication and role boundary on all faculty endpoints
router.use(authenticate, requireRole('faculty', 'admin'));

// 1. Faculty Dashboard Metrics
router.get('/metrics', getFacultyMetricsController);

// 2. Assigned Students List
router.get('/assigned-students', getAssignedStudentsController);

// 3. Faculty Attendance Monitoring (strictly supervised students)
router.get('/attendance', getFacultyAttendanceController);

// 4. Student Guidance Notes (assignment verified)
router.get('/students/:studentId/guidance-notes', getGuidanceNotesController);
router.post('/students/:studentId/guidance-notes', createGuidanceNoteController);

// 5. Faculty Applications Review & Decision (supervised students)
router.get('/applications', getFacultyApplicationsController);
router.post('/applications/:id/decision', facultyApplicationDecisionController);

export default router;
