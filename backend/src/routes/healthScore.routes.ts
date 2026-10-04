import { Router } from 'express';
import {
  listHealthScoreSnapshotsController,
  getHealthScoreSnapshotByIdController,
  calculateHealthScoreController,
  listRiskFlagsController,
  getRiskFlagByIdController,
  createRiskFlagController,
  updateRiskFlagController,
} from '../controllers/healthScore.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

// ─────────────────────────────────────────────────────────────────────────────
// Health Score Routes — mounted at /api/health-scores
// ─────────────────────────────────────────────────────────────────────────────

const healthScoreRouter = Router();

// ── Health Score Snapshots ───────────────────────────────────────────────────
healthScoreRouter.get('/', authenticate, listHealthScoreSnapshotsController);
healthScoreRouter.get('/snapshots', authenticate, listHealthScoreSnapshotsController);
healthScoreRouter.get('/:id', authenticate, getHealthScoreSnapshotByIdController);
healthScoreRouter.post(
  '/calculate',
  authenticate,
  requireRole('company', 'faculty', 'mentor', 'admin'),
  calculateHealthScoreController
);

// ─────────────────────────────────────────────────────────────────────────────
// Risk Flag Routes — mounted at /api/risk-flags
// ─────────────────────────────────────────────────────────────────────────────

export const riskFlagRouter = Router();

riskFlagRouter.get('/', authenticate, listRiskFlagsController);
riskFlagRouter.get('/:id', authenticate, getRiskFlagByIdController);
riskFlagRouter.post(
  '/',
  authenticate,
  requireRole('company', 'faculty', 'mentor', 'admin'),
  createRiskFlagController
);
riskFlagRouter.patch(
  '/:id',
  authenticate,
  requireRole('company', 'faculty', 'mentor', 'admin'),
  updateRiskFlagController
);

export default healthScoreRouter;
