import { Prisma, NotificationCategory, PriorityLevel } from '@prisma/client';
import prisma from './prisma.service';
import { AppError } from '../middleware/errorHandler';

// ─────────────────────────────────────────────────────────────────────────────
// Types & Interfaces
// ─────────────────────────────────────────────────────────────────────────────

export interface UserContext {
  id: string;
  role: string;
}

export interface NotificationFilters {
  read?: boolean;
  category?: NotificationCategory;
  priority?: PriorityLevel;
  limit?: number;
}

export interface CreateNotificationInput {
  recipientId: string;
  category: NotificationCategory;
  title: string;
  message: string;
  priority?: PriorityLevel;
  actionUrl?: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Projections
// ─────────────────────────────────────────────────────────────────────────────

const NOTIFICATION_SELECT = {
  id: true,
  recipientId: true,
  category: true,
  title: true,
  message: true,
  priority: true,
  actionUrl: true,
  read: true,
  createdAt: true,
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Service Methods
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Lists notifications strictly belonging to the authenticated user.
 */
export async function listUserNotifications(
  filters: NotificationFilters,
  user: UserContext
) {
  const where: Prisma.NotificationWhereInput = {
    recipientId: user.id,
  };

  if (filters.read !== undefined) {
    where.read = filters.read;
  }

  if (filters.category) {
    where.category = filters.category;
  }

  if (filters.priority) {
    where.priority = filters.priority;
  }

  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: filters.limit && filters.limit > 0 ? filters.limit : undefined,
      select: NOTIFICATION_SELECT,
    }),
    prisma.notification.count({
      where: {
        recipientId: user.id,
        read: false,
      },
    }),
  ]);

  return {
    unreadCount,
    notifications,
  };
}

/**
 * Gets the total count of unread notifications for the authenticated user.
 */
export async function getUnreadNotificationCount(user: UserContext): Promise<number> {
  return prisma.notification.count({
    where: {
      recipientId: user.id,
      read: false,
    },
  });
}

/**
 * Gets a single notification by ID.
 * Strictly prevents information leaks by returning 404 if the notification does not exist or belongs to another user.
 */
export async function getNotificationById(id: string, user: UserContext) {
  const notification = await prisma.notification.findFirst({
    where: {
      id,
      recipientId: user.id,
    },
    select: NOTIFICATION_SELECT,
  });

  if (!notification) {
    throw new AppError(404, 'Notification not found.');
  }

  return notification;
}

/**
 * Marks a specific notification as read.
 * Guaranteed to only update notifications belonging to the caller.
 */
export async function markNotificationAsRead(id: string, user: UserContext) {
  const existing = await prisma.notification.findFirst({
    where: {
      id,
      recipientId: user.id,
    },
    select: { id: true, read: true },
  });

  if (!existing) {
    throw new AppError(404, 'Notification not found.');
  }

  if (existing.read) {
    return prisma.notification.findUniqueOrThrow({
      where: { id },
      select: NOTIFICATION_SELECT,
    });
  }

  return prisma.notification.update({
    where: { id },
    data: { read: true },
    select: NOTIFICATION_SELECT,
  });
}

/**
 * Marks all unread notifications belonging to the authenticated user as read.
 * Uses a single efficient updateMany operation.
 */
export async function markAllNotificationsAsRead(user: UserContext) {
  const result = await prisma.notification.updateMany({
    where: {
      recipientId: user.id,
      read: false,
    },
    data: {
      read: true,
    },
  });

  return {
    updatedCount: result.count,
  };
}

/**
 * Deletes a notification belonging to the authenticated user.
 */
export async function deleteNotification(id: string, user: UserContext) {
  const existing = await prisma.notification.findFirst({
    where: {
      id,
      recipientId: user.id,
    },
    select: { id: true },
  });

  if (!existing) {
    throw new AppError(404, 'Notification not found.');
  }

  return prisma.notification.delete({
    where: { id },
    select: { id: true, title: true },
  });
}

/**
 * Internal service method to create and dispatch a notification to a user.
 * Reusable by other modules (e.g. applications, evaluations, PPO offers, risk flags).
 */
export async function createNotification(input: CreateNotificationInput) {
  // Validate that the recipient profile exists
  const recipient = await prisma.profile.findUnique({
    where: { id: input.recipientId },
    select: { id: true },
  });

  if (!recipient) {
    throw new AppError(404, 'Notification recipient profile not found.');
  }

  const title = input.title.trim();
  const message = input.message.trim();

  if (!title) throw new AppError(400, 'Notification title cannot be empty.');
  if (!message) throw new AppError(400, 'Notification message cannot be empty.');

  return prisma.notification.create({
    data: {
      recipientId: input.recipientId,
      category: input.category,
      title,
      message,
      priority: input.priority || 'medium',
      actionUrl: input.actionUrl?.trim() || null,
      read: false,
      createdAt: new Date(),
    },
    select: NOTIFICATION_SELECT,
  });
}
