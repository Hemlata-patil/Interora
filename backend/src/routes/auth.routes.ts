import { Router } from 'express';
import {
  registerController,
  loginController,
  logoutController,
  meController,
  updateMeController,
} from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

// ─────────────────────────────────────────────────────────────────────────────
// Auth routes — mounted at /api/auth
//
// POST  /api/auth/register → Create account + set session cookie
// POST  /api/auth/login    → Validate credentials + set session cookie
// POST  /api/auth/logout   → Clear session cookie
// GET   /api/auth/me       → Return authenticated user profile (requires auth)
// PATCH /api/auth/me       → Update authenticated user profile (requires auth)
// ─────────────────────────────────────────────────────────────────────────────

const router = Router();

router.post('/register', registerController);
router.post('/login',    loginController);
router.post('/logout',   logoutController);
router.get('/me',        authenticate, meController);
router.patch('/me',      authenticate, updateMeController);

export default router;
