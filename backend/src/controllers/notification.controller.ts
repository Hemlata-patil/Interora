import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as notifService from '../services/notification.service';
import { AppError } from '../middleware/errorHandler';
import type { ApiSuccess, ApiError } from '../types';
import type { NotificationCategory, PriorityLevel } from '@prisma/client';

// ─────────────────────────────────────────────────────────────────────────────
// Parameter & Error Validation Helpers
// ─────────────────────────────────────────────────────────────────────────────

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function extractParam(req: Request, paramName: string): string {
  const raw = req.params[paramName];
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value || !UUID_REGEX.test(value)) {
    throw new AppError(400, `Invalid ${paramName} format. Expected a valid UUID.`);
  }
  return value;
}

function formatZodErrors(error: z.ZodError): Record<string, string[]> {
  const errors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const field = issue.path.join('.') || '_';
    if (!errors[field]) errors[field] = [];
    errors[field].push(issue.message);
  }
  return errors;
}

// ─────────────────────────────────────────────────────────────────────────────
// Validation Schemas
// ─────────────────────────────────────────────────────────────────────────────

const categoryEnum = z.enum([
  'applications',
  'interns',
  'tasks',
  'milestones',
  'evaluations',
  'ppo',
  'certificates',
  'risk',
  'system',
], {
  errorMap: () => ({
    message: 'category must be one of: applications, interns, tasks, milestones, evaluations, ppo, certificates, risk, system',
  }),
});

const priorityEnum = z.enum(['low', 'medium', 'high', 'urgent'], {
  errorMap: () => ({ message: 'priority must be one of: low, medium, high, urgent' }),
});

const createNotificationSchema = z.object({
  recipientId: z
    .string({ required_error: 'recipientId is required' })
    .uuid('Invalid recipientId format. Expected a valid UUID.'),
  category: categoryEnum,
  title: z
    .string({ required_error: 'title is required' })
    .trim()
    .min(1, 'title cannot be empty')
    .max(200, 'title cannot exceed 200 characters'),
  message: z
    .string({ required_error: 'message is required' })
    .trim()
    .min(1, 'message cannot be empty'),
  priority: priorityEnum.optional(),
  actionUrl: z.string().trim().max(255, 'actionUrl cannot exceed 255 characters').optional().nullable(),
});

// ─────────────────────────────────────────────────────────────────────────────
// Controllers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/notifications — List notifications for the authenticated user.
 */
export async function listNotificationsController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const { read, category, priority, limit } = req.query;

    const filters: notifService.NotificationFilters = {};

    if (read === 'true') {
      filters.read = true;
    } else if (read === 'false') {
      filters.read = false;
    }

    if (
      typeof category === 'string' &&
      [
        'applications',
        'interns',
        'tasks',
        'milestones',
        'evaluations',
        'ppo',
        'certificates',
        'risk',
        'system',
      ].includes(category)
    ) {
      filters.category = category as NotificationCategory;
    }

    if (
      typeof priority === 'string' &&
      ['low', 'medium', 'high', 'urgent'].includes(priority)
    ) {
      filters.priority = priority as PriorityLevel;
    }

    if (typeof limit === 'string' && !isNaN(Number(limit))) {
      filters.limit = parseInt(limit, 10);
    }

    const result = await notifService.listUserNotifications(filters, {
      id: req.user.id,
      role: req.user.role,
    });

    const body: ApiSuccess<typeof result> = {
      success: true,
      data: result,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/notifications/unread-count — Get total unread count for badge indicators.
 */
export async function getUnreadCountController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const count = await notifService.getUnreadNotificationCount({
      id: req.user.id,
      role: req.user.role,
    });

    const body: ApiSuccess<{ unreadCount: number }> = {
      success: true,
      data: { unreadCount: count },
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/notifications/:id — Get a single notification by ID.
 */
export async function getNotificationByIdController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const id = extractParam(req, 'id');
    const notification = await notifService.getNotificationById(id, {
      id: req.user.id,
      role: req.user.role,
    });

    const body: ApiSuccess<typeof notification> = {
      success: true,
      data: notification,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/notifications/:id/read — Mark one notification as read.
 */
export async function markNotificationAsReadController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const id = extractParam(req, 'id');
    const updated = await notifService.markNotificationAsRead(id, {
      id: req.user.id,
      role: req.user.role,
    });

    const body: ApiSuccess<typeof updated> = {
      success: true,
      message: 'Notification marked as read.',
      data: updated,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/notifications/read-all — Mark all unread notifications as read.
 */
export async function markAllNotificationsAsReadController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const result = await notifService.markAllNotificationsAsRead({
      id: req.user.id,
      role: req.user.role,
    });

    const body: ApiSuccess<typeof result> = {
      success: true,
      message: `${result.updatedCount} notification(s) marked as read.`,
      data: result,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/notifications/:id — Delete a notification.
 */
export async function deleteNotificationController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const id = extractParam(req, 'id');
    const deleted = await notifService.deleteNotification(id, {
      id: req.user.id,
      role: req.user.role,
    });

    const body: ApiSuccess<typeof deleted> = {
      success: true,
      message: 'Notification deleted successfully.',
      data: deleted,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/notifications — Admin broadcast or targeted system notification dispatch.
 */
export async function createNotificationController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const parsed = createNotificationSchema.safeParse(req.body);
    if (!parsed.success) {
      const body: ApiError = {
        success: false,
        message: 'Validation failed',
        errors: formatZodErrors(parsed.error),
      };
      res.status(400).json(body);
      return;
    }

    const notification = await notifService.createNotification(parsed.data);

    const body: ApiSuccess<typeof notification> = {
      success: true,
      message: 'Notification dispatched successfully.',
      data: notification,
    };
    res.status(201).json(body);
  } catch (err) {
    next(err);
  }
}
