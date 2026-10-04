import { Router } from 'express';
import {
  listPlacementReadinessSnapshotsController,
  getLatestPlacementReadinessController,
  getPlacementReadinessByIdController,
  calculatePlacementReadinessController,
  recalculatePlacementReadinessController,
  deletePlacementReadinessController,
} from '../controllers/placementReadiness.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

// ─────────────────────────────────────────────────────────────────────────────
// Placement Readiness Routes — mounted at /api/placement-readiness
// ─────────────────────────────────────────────────────────────────────────────

const placementReadinessRouter = Router();

// List snapshots (scoped by user role / ownership)
placementReadinessRouter.get('/', authenticate, listPlacementReadinessSnapshotsController);
placementReadinessRouter.get('/snapshots', authenticate, listPlacementReadinessSnapshotsController);

// Latest snapshot for a student
placementReadinessRouter.get('/latest', authenticate, getLatestPlacementReadinessController);

// Single snapshot by ID
placementReadinessRouter.get('/:id', authenticate, getPlacementReadinessByIdController);

// Calculate and generate a new snapshot from existing operational metrics
placementReadinessRouter.post('/calculate', authenticate, calculatePlacementReadinessController);

// Recalculate an existing snapshot in-place
placementReadinessRouter.post('/:id/recalculate', authenticate, recalculatePlacementReadinessController);

// Delete snapshot (Admin only)
placementReadinessRouter.delete('/:id', authenticate, requireRole('admin'), deletePlacementReadinessController);

export default placementReadinessRouter;
