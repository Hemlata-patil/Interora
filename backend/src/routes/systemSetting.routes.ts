import { Router } from 'express';
import {
  listSystemSettingsController,
  getSystemSettingByKeyController,
  createSystemSettingController,
  updateSystemSettingController,
  deleteSystemSettingController,
} from '../controllers/systemSetting.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

// ─────────────────────────────────────────────────────────────────────────────
// System Setting Routes — mounted at /api/system-settings
//
// System settings govern runtime configuration across the Interora platform.
// All endpoints are strictly restricted to administrators.
// ─────────────────────────────────────────────────────────────────────────────

const systemSettingRouter = Router();

// Apply authentication and admin role requirement to all system setting routes
systemSettingRouter.use(authenticate, requireRole('admin'));

// List system settings
systemSettingRouter.get('/', listSystemSettingsController);

// Get single setting by key
systemSettingRouter.get('/:key', getSystemSettingByKeyController);

// Create a new system setting
systemSettingRouter.post('/', createSystemSettingController);

// Update an existing system setting
systemSettingRouter.patch('/:key', updateSystemSettingController);

// Delete a system setting
systemSettingRouter.delete('/:key', deleteSystemSettingController);

export default systemSettingRouter;
