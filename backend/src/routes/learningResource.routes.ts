import { Router } from 'express';
import {
  listLearningResourcesController,
  getLearningResourceByIdController,
  createLearningResourceController,
  updateLearningResourceController,
  deleteLearningResourceController,
  listStudentLearningProgressController,
  getMyLearningProgressController,
  getStudentLearningProgressByIdController,
  createStudentLearningProgressController,
  upsertResourceProgressController,
  updateStudentLearningProgressController,
  deleteStudentLearningProgressController,
} from '../controllers/learningResource.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

// ─────────────────────────────────────────────────────────────────────────────
// Learning Resource Routes — mounted at /api/learning-resources
// ─────────────────────────────────────────────────────────────────────────────

const learningResourceRouter = Router();

// Catalog browsing (all authenticated users)
learningResourceRouter.get('/', authenticate, listLearningResourcesController);
learningResourceRouter.get('/:id', authenticate, getLearningResourceByIdController);

// Manage catalog resources (faculty, company, mentor, admin)
learningResourceRouter.post(
  '/',
  authenticate,
  requireRole('company', 'faculty', 'mentor', 'admin'),
  createLearningResourceController
);
learningResourceRouter.patch(
  '/:id',
  authenticate,
  requireRole('company', 'faculty', 'mentor', 'admin'),
  updateLearningResourceController
);
learningResourceRouter.delete(
  '/:id',
  authenticate,
  requireRole('faculty', 'admin'),
  deleteLearningResourceController
);

// Progress shortcut for a specific resource
learningResourceRouter.post(
  '/:resourceId/progress',
  authenticate,
  upsertResourceProgressController
);

// ─────────────────────────────────────────────────────────────────────────────
// Student Learning Progress Routes — mounted at /api/learning-progress
// ─────────────────────────────────────────────────────────────────────────────

export const learningProgressRouter = Router();

// Student shortcut for their own progress
learningProgressRouter.get('/my', authenticate, requireRole('student'), getMyLearningProgressController);

// List progress records (scoped by role / ownership)
learningProgressRouter.get('/', authenticate, listStudentLearningProgressController);

// Single progress record by ID
learningProgressRouter.get('/:id', authenticate, getStudentLearningProgressByIdController);

// Create progress record (student for self, faculty/mentor/company/admin for intern)
learningProgressRouter.post('/', authenticate, createStudentLearningProgressController);

// Update progress (progressPercent, status, completedAt)
learningProgressRouter.patch('/:id', authenticate, updateStudentLearningProgressController);

// Delete progress record
learningProgressRouter.delete('/:id', authenticate, deleteStudentLearningProgressController);

export default learningResourceRouter;
