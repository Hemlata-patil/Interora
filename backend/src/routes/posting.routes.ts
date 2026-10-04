import { Router, Request, Response, NextFunction } from 'express';
import {
  listMarketplacePostingsController,
  getPostingByIdController,
  createPostingController,
  updatePostingController,
  deletePostingController,
  createTaskTemplateController,
  updateTaskTemplateController,
  deleteTaskTemplateController,
  createMilestoneTemplateController,
  updateMilestoneTemplateController,
  deleteMilestoneTemplateController,
} from '../controllers/posting.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { env } from '../config/env';
import { verifyToken } from '../utils/jwt';
import prisma from '../services/prisma.service';
import type { UserRole } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// Optional Authentication Middleware
// Allows public visitors to view marketplace postings while populating
// req.user for authenticated users (enabling company owners/admins to view drafts).
// ─────────────────────────────────────────────────────────────────────────────

async function optionalAuthenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const token: string | undefined = req.cookies?.[env.COOKIE_NAME];
  if (!token) {
    return next();
  }

  try {
    const payload = verifyToken(token);
    const profile = await prisma.profile.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        role: true,
        accountStatus: true,
      },
    });

    if (profile && profile.accountStatus !== 'inactive') {
      req.user = {
        id: profile.id,
        email: profile.email,
        role: profile.role as UserRole,
      };
    }
  } catch {
    // If the token is invalid or expired, continue as unauthenticated guest
  }

  next();
}

// ─────────────────────────────────────────────────────────────────────────────
// Router Definition — mounted at /api/postings
// ─────────────────────────────────────────────────────────────────────────────

const router = Router();

// ── Public / Student marketplace browsing ────────────────────────────────────
router.get('/', optionalAuthenticate, listMarketplacePostingsController);
router.get('/:id', optionalAuthenticate, getPostingByIdController);

// ── Company / Admin posting management ───────────────────────────────────────
router.post('/', authenticate, requireRole('company', 'admin'), createPostingController);
router.patch('/:id', authenticate, requireRole('company', 'admin'), updatePostingController);
router.delete('/:id', authenticate, requireRole('company', 'admin'), deletePostingController);

// ── Task Template APIs ───────────────────────────────────────────────────────
router.post(
  '/:postingId/task-templates',
  authenticate,
  requireRole('company', 'admin'),
  createTaskTemplateController
);
router.patch(
  '/:postingId/task-templates/:templateId',
  authenticate,
  requireRole('company', 'admin'),
  updateTaskTemplateController
);
router.delete(
  '/:postingId/task-templates/:templateId',
  authenticate,
  requireRole('company', 'admin'),
  deleteTaskTemplateController
);

// ── Milestone Template APIs ──────────────────────────────────────────────────
router.post(
  '/:postingId/milestone-templates',
  authenticate,
  requireRole('company', 'admin'),
  createMilestoneTemplateController
);
router.patch(
  '/:postingId/milestone-templates/:templateId',
  authenticate,
  requireRole('company', 'admin'),
  updateMilestoneTemplateController
);
router.delete(
  '/:postingId/milestone-templates/:templateId',
  authenticate,
  requireRole('company', 'admin'),
  deleteMilestoneTemplateController
);

export default router;
