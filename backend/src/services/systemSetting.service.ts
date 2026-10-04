import { Prisma } from '@prisma/client';
import crypto from 'crypto';
import prisma from './prisma.service';
import { AppError } from '../middleware/errorHandler';
import { createAuditLog } from './auditLog.service';

// ─────────────────────────────────────────────────────────────────────────────
// Types & Interfaces
// ─────────────────────────────────────────────────────────────────────────────

export interface UserContext {
  id: string;
  role: string;
}

export interface RequestContext {
  ipAddress?: string | null;
}

export interface SystemSettingFilters {
  category?: string;
  search?: string;
  includeSensitive?: boolean;
}

export interface CreateSystemSettingInput {
  key: string;
  value: Prisma.InputJsonValue;
  category?: string;
  description?: string | null;
}

export interface UpdateSystemSettingInput {
  value?: Prisma.InputJsonValue;
  category?: string;
  description?: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const SENSITIVE_SETTING_PATTERNS = [
  'secret',
  'password',
  'token',
  'private_key',
  'privatekey',
  'credential',
  'apikey',
  'api_key',
];

export function isSensitiveKey(key: string): boolean {
  const lower = key.toLowerCase();
  return SENSITIVE_SETTING_PATTERNS.some((pattern) => lower.includes(pattern));
}

export function maskSensitiveValue(value: unknown): unknown {
  if (value === null || value === undefined) return value;
  if (typeof value === 'string') return '********';
  if (typeof value === 'object') {
    if (Array.isArray(value)) return value.map(maskSensitiveValue);
    const masked: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (isSensitiveKey(k)) {
        masked[k] = '********';
      } else if (typeof v === 'object' && v !== null) {
        masked[k] = maskSensitiveValue(v);
      } else {
        masked[k] = v;
      }
    }
    return masked;
  }
  return '********';
}

/**
 * Deterministically maps a setting key to a valid UUID format for AuditLog foreign keys.
 */
export function keyToUuid(key: string): string {
  const hash = crypto.createHash('md5').update(key).digest('hex');
  return [
    hash.slice(0, 8),
    hash.slice(8, 12),
    hash.slice(12, 16),
    hash.slice(16, 20),
    hash.slice(20, 32),
  ].join('-');
}

// ─────────────────────────────────────────────────────────────────────────────
// Projections
// ─────────────────────────────────────────────────────────────────────────────

const SYSTEM_SETTING_SELECT = {
  key: true,
  value: true,
  category: true,
  description: true,
  updatedAt: true,
  updatedById: true,
  updatedBy: {
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
    },
  },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Service Methods
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Lists system settings with optional category and search filters.
 * Admin only.
 * If includeSensitive is false, values of sensitive keys are redacted.
 */
export async function listSystemSettings(filters: SystemSettingFilters = {}) {
  const where: Prisma.SystemSettingWhereInput = {};

  if (filters.category) {
    where.category = {
      equals: filters.category.trim(),
      mode: 'insensitive',
    };
  }

  if (filters.search) {
    const q = filters.search.trim();
    where.OR = [
      { key: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
    ];
  }

  const settings = await prisma.systemSetting.findMany({
    where,
    orderBy: [
      { category: 'asc' },
      { key: 'asc' },
    ],
    select: SYSTEM_SETTING_SELECT,
  });

  if (filters.includeSensitive) {
    return settings;
  }

  // Mask sensitive setting values in general listing
  return settings.map((s) => {
    if (isSensitiveKey(s.key)) {
      return {
        ...s,
        value: maskSensitiveValue(s.value) as Prisma.JsonValue,
      };
    }
    return s;
  });
}

/**
 * Gets a single system setting by key.
 * Admin only.
 */
export async function getSystemSettingByKey(key: string, options: { includeSensitive?: boolean } = {}) {
  const normalizedKey = key.trim();
  const setting = await prisma.systemSetting.findUnique({
    where: { key: normalizedKey },
    select: SYSTEM_SETTING_SELECT,
  });

  if (!setting) {
    throw new AppError(404, `System setting '${normalizedKey}' not found.`);
  }

  if (options.includeSensitive === false && isSensitiveKey(setting.key)) {
    return {
      ...setting,
      value: maskSensitiveValue(setting.value) as Prisma.JsonValue,
    };
  }

  return setting;
}

/**
 * Creates a new system setting.
 * Admin only. Enforces unique key constraint and records audit log.
 */
export async function createSystemSetting(
  input: CreateSystemSettingInput,
  user: UserContext,
  ctx: RequestContext = {}
) {
  const normalizedKey = input.key.trim();

  // Check for duplicate key
  const existing = await prisma.systemSetting.findUnique({
    where: { key: normalizedKey },
    select: { key: true },
  });

  if (existing) {
    throw new AppError(409, `System setting with key '${normalizedKey}' already exists.`);
  }

  const category = input.category ? input.category.trim() : 'general';
  const description = input.description ? input.description.trim() : null;

  const setting = await prisma.systemSetting.create({
    data: {
      key: normalizedKey,
      value: input.value,
      category,
      description,
      updatedById: user.id,
      updatedAt: new Date(),
    },
    select: SYSTEM_SETTING_SELECT,
  });

  // Audit Log integration
  try {
    await createAuditLog({
      actorId: user.id,
      action: 'SYSTEM_SETTING_CREATED',
      entityType: 'SystemSetting',
      entityId: keyToUuid(normalizedKey),
      details: {
        settingKey: normalizedKey,
        category,
        description,
        value: isSensitiveKey(normalizedKey) ? '[REDACTED]' : input.value,
      },
      ipAddress: ctx.ipAddress,
    });
  } catch (auditErr) {
    // Non-blocking for audit logging
    console.error('Failed to record system setting creation audit log:', auditErr);
  }

  return setting;
}

/**
 * Updates an existing system setting.
 * Admin only. Records audit log.
 */
export async function updateSystemSetting(
  key: string,
  input: UpdateSystemSettingInput,
  user: UserContext,
  ctx: RequestContext = {}
) {
  const normalizedKey = key.trim();

  const existing = await prisma.systemSetting.findUnique({
    where: { key: normalizedKey },
    select: SYSTEM_SETTING_SELECT,
  });

  if (!existing) {
    throw new AppError(404, `System setting '${normalizedKey}' not found.`);
  }

  const data: Prisma.SystemSettingUpdateInput = {
    updatedBy: { connect: { id: user.id } },
    updatedAt: new Date(),
  };

  const changes: Record<string, unknown> = {};

  if (input.value !== undefined) {
    data.value = input.value;
    changes.valueUpdated = true;
  }

  if (input.category !== undefined) {
    const cat = input.category.trim();
    data.category = cat;
    changes.category = { from: existing.category, to: cat };
  }

  if (input.description !== undefined) {
    const desc = input.description ? input.description.trim() : null;
    data.description = desc;
    changes.description = { from: existing.description, to: desc };
  }

  const updated = await prisma.systemSetting.update({
    where: { key: normalizedKey },
    data,
    select: SYSTEM_SETTING_SELECT,
  });

  // Audit Log integration
  try {
    await createAuditLog({
      actorId: user.id,
      action: 'SYSTEM_SETTING_UPDATED',
      entityType: 'SystemSetting',
      entityId: keyToUuid(normalizedKey),
      details: {
        settingKey: normalizedKey,
        changes,
      },
      ipAddress: ctx.ipAddress,
    });
  } catch (auditErr) {
    console.error('Failed to record system setting update audit log:', auditErr);
  }

  return updated;
}

/**
 * Deletes a system setting.
 * Admin only. Records audit log.
 */
export async function deleteSystemSetting(
  key: string,
  user: UserContext,
  ctx: RequestContext = {}
) {
  const normalizedKey = key.trim();

  const existing = await prisma.systemSetting.findUnique({
    where: { key: normalizedKey },
    select: { key: true, category: true },
  });

  if (!existing) {
    throw new AppError(404, `System setting '${normalizedKey}' not found.`);
  }

  await prisma.systemSetting.delete({
    where: { key: normalizedKey },
  });

  // Audit Log integration
  try {
    await createAuditLog({
      actorId: user.id,
      action: 'SYSTEM_SETTING_DELETED',
      entityType: 'SystemSetting',
      entityId: keyToUuid(normalizedKey),
      details: {
        settingKey: normalizedKey,
        category: existing.category,
      },
      ipAddress: ctx.ipAddress,
    });
  } catch (auditErr) {
    console.error('Failed to record system setting deletion audit log:', auditErr);
  }

  return {
    key: normalizedKey,
    message: `System setting '${normalizedKey}' deleted successfully.`,
  };
}

/**
 * Internal helper to read a setting value in other backend services with a fallback.
 */
export async function getSettingValue<T = unknown>(key: string, defaultValue?: T): Promise<T | undefined> {
  const setting = await prisma.systemSetting.findUnique({
    where: { key },
    select: { value: true },
  });

  if (!setting) {
    return defaultValue;
  }

  return setting.value as T;
}
