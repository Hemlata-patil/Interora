import { Router } from 'express';
import {
  listNotificationsController,
  getUnreadCountController,
  getNotificationByIdController,
  markNotificationAsReadController,
  markAllNotificationsAsReadController,
  deleteNotificationController,
  createNotificationController,
} from '../controllers/notification.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

// ─────────────────────────────────────────────────────────────────────────────
// Notification Routes — mounted at /api/notifications
// ─────────────────────────────────────────────────────────────────────────────

const notificationRouter = Router();

// List notifications belonging to authenticated user
notificationRouter.get('/', authenticate, listNotificationsController);

// Get unread notification count
notificationRouter.get('/unread-count', authenticate, getUnreadCountController);

// Mark all unread notifications as read (supporting both /read-all and /mark-all-read)
notificationRouter.patch('/read-all', authenticate, markAllNotificationsAsReadController);
notificationRouter.patch('/mark-all-read', authenticate, markAllNotificationsAsReadController);

// Individual notification operations
notificationRouter.get('/:id', authenticate, getNotificationByIdController);
notificationRouter.patch('/:id/read', authenticate, markNotificationAsReadController);
notificationRouter.delete('/:id', authenticate, deleteNotificationController);

// Admin-only dispatch for broadcast/system announcements
notificationRouter.post('/', authenticate, requireRole('admin'), createNotificationController);

export default notificationRouter;
