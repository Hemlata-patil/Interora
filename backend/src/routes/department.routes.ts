import { Router } from 'express';
import {
  listDepartmentsController,
  getDepartmentByIdController,
  createDepartmentController,
  updateDepartmentController,
  deleteDepartmentController,
} from '../controllers/department.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

// ─────────────────────────────────────────────────────────────────────────────
// Department Routes — /api/departments
// ─────────────────────────────────────────────────────────────────────────────

const router = Router();

// ── Read routes ───────────────────────────────────────────────────────────────
// Listing departments is public to support registration and department discovery
router.get('/', listDepartmentsController);
router.get('/:id', authenticate, getDepartmentByIdController);

// ── Admin-only management routes ──────────────────────────────────────────────
router.post('/', authenticate, requireRole('admin'), createDepartmentController);
router.patch('/:id', authenticate, requireRole('admin'), updateDepartmentController);
router.delete('/:id', authenticate, requireRole('admin'), deleteDepartmentController);

export default router;
