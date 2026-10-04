import { Router } from 'express';
import {
  listPPOOffersController,
  getPPOOfferByIdController,
  createPPOOfferController,
  updatePPOOfferController,
  respondToPPOOfferController,
  deletePPOOfferController,
} from '../controllers/ppoOffer.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

// ─────────────────────────────────────────────────────────────────────────────
// PPO Offer Routes — mounted at /api/ppo-offers
// ─────────────────────────────────────────────────────────────────────────────

const ppoOfferRouter = Router();

// List PPO offers (scoped by role / ownership)
ppoOfferRouter.get('/', authenticate, listPPOOffersController);

// Get single PPO offer by ID
ppoOfferRouter.get('/:id', authenticate, getPPOOfferByIdController);

// Create PPO offer (Company hosting assignment, or Admin)
ppoOfferRouter.post(
  '/',
  authenticate,
  requireRole('company', 'admin'),
  createPPOOfferController
);

// Update PPO offer terms or status (Company, Admin)
ppoOfferRouter.patch(
  '/:id',
  authenticate,
  requireRole('company', 'admin'),
  updatePPOOfferController
);

// Student response to an offered PPO (accept / decline)
ppoOfferRouter.post(
  '/:id/respond',
  authenticate,
  requireRole('student'),
  respondToPPOOfferController
);

// Delete PPO offer (Admin anytime, Company only if draft)
ppoOfferRouter.delete(
  '/:id',
  authenticate,
  requireRole('company', 'admin'),
  deletePPOOfferController
);

export default ppoOfferRouter;
