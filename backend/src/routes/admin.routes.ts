import { Router } from 'express';
import {
  getAdminMetricsController,
  listCompaniesController,
  createCompanyController,
  approveCompanyController,
  rejectCompanyController,
  sendCompanyInvitationController,
  listFacultyController,
  createFacultyController,
  updateFacultyController,
  deleteFacultyController,
  listAdminApplicationsController,
  listAdminUsersController,
} from '../controllers/admin.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

// ─────────────────────────────────────────────────────────────────────────────
// Admin Routes — mounted at /api/admin
// All routes strictly require authentication and 'admin' role.
// ─────────────────────────────────────────────────────────────────────────────

const adminRouter = Router();

// Protect all admin routes
adminRouter.use(authenticate, requireRole('admin'));

// ── Metrics ──────────────────────────────────────────────────────────────────
adminRouter.get('/metrics', getAdminMetricsController);

// ── Applications Oversight ───────────────────────────────────────────────────
adminRouter.get('/applications', listAdminApplicationsController);

// ── Users Directory ──────────────────────────────────────────────────────────
adminRouter.get('/users', listAdminUsersController);

// ── Companies Oversight & Approvals ──────────────────────────────────────────
adminRouter.get('/companies', listCompaniesController);
adminRouter.post('/companies', createCompanyController);
adminRouter.patch('/companies/:id/approval', approveCompanyController);
adminRouter.patch('/companies/:id/rejection', rejectCompanyController);
adminRouter.post('/companies/:id/invite', sendCompanyInvitationController);

// ── Faculty & Mentors Oversight ──────────────────────────────────────────────
adminRouter.get('/faculty', listFacultyController);
adminRouter.post('/faculty', createFacultyController);
adminRouter.patch('/faculty/:id', updateFacultyController);
adminRouter.delete('/faculty/:id', deleteFacultyController);

export default adminRouter;

