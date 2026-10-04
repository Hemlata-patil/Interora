import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import {
  getCompanyMentorsController,
  createCompanyMentorController,
  updateCompanyMentorController,
  assignCompanyMentorController,
} from '../controllers/company.controller';

const router = Router();

// Enforce authentication and company role boundary
router.use(authenticate, requireRole('company', 'admin'));

// Mentor Management
router.get('/mentors', getCompanyMentorsController);
router.post('/mentors', createCompanyMentorController);
router.patch('/mentors/:id', updateCompanyMentorController);
router.post('/mentors/:id/assign', assignCompanyMentorController);

export default router;
