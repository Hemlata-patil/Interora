import { Router } from 'express';
import {
  getMyApplicationsController,
  createApplicationController,
  getApplicationByIdController,
  getPostingApplicationsController,
  updateApplicationStatusController,
  withdrawApplicationController,
} from '../controllers/application.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

// ─────────────────────────────────────────────────────────────────────────────
// Application Routes — mounted at /api/applications
// ─────────────────────────────────────────────────────────────────────────────

const router = Router();

// ── Student application management ───────────────────────────────────────────
router.get('/my', authenticate, requireRole('student'), getMyApplicationsController);
router.post('/', authenticate, requireRole('student'), createApplicationController);
router.patch('/:id/withdraw', authenticate, requireRole('student'), withdrawApplicationController);

// ── Company / Admin view applications for a posting ──────────────────────────
router.get(
  '/posting/:postingId',
  authenticate,
  requireRole('company', 'admin'),
  getPostingApplicationsController
);

// ── Shared single application view & status management ───────────────────────
router.get('/:id', authenticate, getApplicationByIdController);
router.patch(
  '/:id/status',
  authenticate,
  requireRole('company', 'admin'),
  updateApplicationStatusController
);

export default router;
