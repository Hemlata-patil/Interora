import { Router } from 'express';
import {
  getDashboardController,
  getFacultyController,
  getStudentsController,
  assignFacultyController,
  createFacultyController,
  deactivateFacultyController,
  getInternshipsController,
  getProgressController
} from '../controllers/hod.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const hodRouter = Router();

hodRouter.use(authenticate, requireRole('hod'));

hodRouter.get('/dashboard', getDashboardController);
hodRouter.get('/faculty', getFacultyController);
hodRouter.post('/faculty', createFacultyController);
hodRouter.patch('/faculty/:id/status', deactivateFacultyController);
hodRouter.get('/students', getStudentsController);
hodRouter.get('/internships', getInternshipsController);
hodRouter.get('/progress', getProgressController);
hodRouter.post('/faculty-assignment', assignFacultyController);

export default hodRouter;
