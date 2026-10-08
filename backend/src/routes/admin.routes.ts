import { Router } from 'express';
import {
  getAdminMetricsController, getAdminFilterOptionsController, exportAdminMetricsExcelController,
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
  createHODController,
  updateHODController,
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
adminRouter.get('/metrics/filters', getAdminFilterOptionsController);
adminRouter.get('/metrics/export', exportAdminMetricsExcelController);

// ── Applications Oversight ───────────────────────────────────────────────────
adminRouter.get('/applications', listAdminApplicationsController);

// ── Users Directory ──────────────────────────────────────────────────────────
adminRouter.get('/users', listAdminUsersController);
adminRouter.post('/hod', createHODController);
adminRouter.patch('/hod/:id', updateHODController);

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

