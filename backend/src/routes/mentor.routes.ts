import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import {
  getMentorDashboardMetricsController,
  getMentorInternsController,
  getMentorTasksController,
  updateMentorTaskReviewController,
} from '../controllers/mentor.controller';

const router = Router();

// Enforce authentication and role boundary on all mentor endpoints
router.use(authenticate, requireRole('mentor', 'company', 'admin'));

// 1. Company Mentor Dashboard Metrics
router.get('/metrics', getMentorDashboardMetricsController);

// 2. Assigned Interns List
router.get('/interns', getMentorInternsController);

// 3. Logged Intern Tasks
router.get('/tasks', getMentorTasksController);

// 4. Task Review Verification (POST and PATCH supported)
router.post('/tasks/:taskId/review', updateMentorTaskReviewController);
router.patch('/tasks/:taskId/review', updateMentorTaskReviewController);

export default router;
