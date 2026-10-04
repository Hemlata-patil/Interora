import { Prisma } from '@prisma/client';
import prisma from './prisma.service';
import { AppError } from '../middleware/errorHandler';

// ─────────────────────────────────────────────────────────────────────────────
// Types & Interfaces
// ─────────────────────────────────────────────────────────────────────────────

export interface CreateAuditLogInput {
  actorId?: string | null;
  action: string;
  entityType: string;
  entityId: string;
  details?: Record<string, unknown> | Prisma.InputJsonValue | null;
  ipAddress?: string | null;
}

export interface AuditLogFilters {
  actorId?: string;
  action?: string;
  entityType?: string;
  entityId?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Security Helpers: Sensitive Data Sanitization
// ─────────────────────────────────────────────────────────────────────────────

const SENSITIVE_KEY_PATTERNS = [
  'password',
  'passwordhash',
  'password_hash',
  'token',
  'accesstoken',
  'access_token',
  'refreshtoken',
  'refresh_token',
  'secret',
  'authorization',
  'cookie',
  'apikey',
  'api_key',
  'privatekey',
  'private_key',
];

/**
 * Recursively strips sensitive fields (passwords, tokens, secrets) from audit metadata.
 */
export function sanitizeAuditDetails(value: unknown): unknown {
  if (value === null || value === undefined) {
    return value;
  }
  if (typeof value !== 'object') {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeAuditDetails);
  }
  const sanitized: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    const lowerKey = k.toLowerCase().replace(/[^a-z0-9]/g, '');
    const isSensitive = SENSITIVE_KEY_PATTERNS.some((pattern) =>
      lowerKey.includes(pattern)
    );
    if (isSensitive) {
      sanitized[k] = '[REDACTED]';
    } else if (typeof v === 'object' && v !== null) {
      sanitized[k] = sanitizeAuditDetails(v);
    } else {
      sanitized[k] = v;
    }
  }
  return sanitized;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// ─────────────────────────────────────────────────────────────────────────────
// Projections
// ─────────────────────────────────────────────────────────────────────────────

const AUDIT_LOG_SELECT = {
  id: true,
  actorId: true,
  action: true,
  entityType: true,
  entityId: true,
  details: true,
  ipAddress: true,
  createdAt: true,
  actor: {
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      avatarUrl: true,
    },
  },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Service Methods
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Records an immutable audit log entry.
 * Can be invoked internally across backend services.
 */
export async function createAuditLog(input: CreateAuditLogInput) {
  const action = input.action.trim();
  const entityType = input.entityType.trim();

  if (!action) {
    throw new AppError(400, 'Audit log action is required.');
  }
  if (action.length > 100) {
    throw new AppError(400, 'Audit log action cannot exceed 100 characters.');
  }

  if (!entityType) {
    throw new AppError(400, 'Audit log entityType is required.');
  }
  if (entityType.length > 50) {
    throw new AppError(400, 'Audit log entityType cannot exceed 50 characters.');
  }

  if (!input.entityId || !UUID_REGEX.test(input.entityId)) {
    throw new AppError(400, 'Audit log entityId must be a valid UUID.');
  }

  let actorId: string | null = null;
  if (input.actorId) {
    if (!UUID_REGEX.test(input.actorId)) {
      throw new AppError(400, 'Audit log actorId must be a valid UUID.');
    }
    // Verify actor exists to satisfy foreign key constraint if provided
    const actorExists = await prisma.profile.findUnique({
      where: { id: input.actorId },
      select: { id: true },
    });
    if (actorExists) {
      actorId = actorExists.id;
    }
  }

  const cleanIp = input.ipAddress ? input.ipAddress.slice(0, 45).trim() : null;
  const sanitizedDetails = input.details !== undefined && input.details !== null
    ? (sanitizeAuditDetails(input.details) as Prisma.InputJsonValue)
    : Prisma.JsonNull;

  return prisma.auditLog.create({
    data: {
      actorId,
      action,
      entityType,
      entityId: input.entityId,
      details: sanitizedDetails,
      ipAddress: cleanIp,
    },
    select: AUDIT_LOG_SELECT,
  });
}

/**
 * Lists audit logs with pagination and filters. Admin only.
 * Logs are ordered newest first (createdAt: 'desc').
 */
export async function listAuditLogs(filters: AuditLogFilters) {
  const where: Prisma.AuditLogWhereInput = {};

  if (filters.actorId) {
    if (!UUID_REGEX.test(filters.actorId)) {
      throw new AppError(400, 'Invalid actorId format. Expected a valid UUID.');
    }
    where.actorId = filters.actorId;
  }

  if (filters.action) {
    where.action = {
      contains: filters.action.trim(),
      mode: 'insensitive',
    };
  }

  if (filters.entityType) {
    where.entityType = {
      equals: filters.entityType.trim(),
      mode: 'insensitive',
    };
  }

  if (filters.entityId) {
    if (!UUID_REGEX.test(filters.entityId)) {
      throw new AppError(400, 'Invalid entityId format. Expected a valid UUID.');
    }
    where.entityId = filters.entityId;
  }

  if (filters.startDate || filters.endDate) {
    where.createdAt = {};
    if (filters.startDate) {
      where.createdAt.gte = filters.startDate;
    }
    if (filters.endDate) {
      where.createdAt.lte = filters.endDate;
    }
  }

  const page = Math.max(1, filters.page || 1);
  const limit = Math.min(100, Math.max(1, filters.limit || 50));
  const skip = (page - 1) * limit;

  const [total, logs] = await Promise.all([
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      select: AUDIT_LOG_SELECT,
    }),
  ]);

  const totalPages = Math.ceil(total / limit) || 1;

  return {
    logs,
    total,
    page,
    limit,
    totalPages,
  };
}

/**
 * Gets a single audit log by ID. Admin only.
 */
export async function getAuditLogById(id: string) {
  if (!UUID_REGEX.test(id)) {
    throw new AppError(400, 'Invalid audit log id format. Expected a valid UUID.');
  }

  const log = await prisma.auditLog.findUnique({
    where: { id },
    select: AUDIT_LOG_SELECT,
  });

  if (!log) {
    throw new AppError(404, 'Audit log not found.');
  }

  return log;
}
