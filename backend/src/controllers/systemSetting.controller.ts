import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import * as settingService from '../services/systemSetting.service';
import { AppError } from '../middleware/errorHandler';
import type { ApiSuccess, ApiError } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// Parameter & Error Validation Helpers
// ─────────────────────────────────────────────────────────────────────────────

function extractKeyParam(req: Request): string {
  const raw = req.params.key;
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value || typeof value !== 'string' || value.trim().length === 0) {
    throw new AppError(400, 'Setting key parameter is required.');
  }
  return value.trim();
}

function extractIp(req: Request): string | null {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim().slice(0, 45);
  }
  return req.ip?.slice(0, 45) || req.socket.remoteAddress?.slice(0, 45) || null;
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

const SETTING_KEY_REGEX = /^[a-zA-Z0-9._-]+$/;

const createSystemSettingSchema = z.object({
  key: z
    .string({ required_error: 'key is required' })
    .trim()
    .min(1, 'key cannot be empty')
    .max(100, 'key cannot exceed 100 characters')
    .regex(
      SETTING_KEY_REGEX,
      'key may only contain alphanumeric characters, dots, underscores, and dashes.'
    ),
  value: z.custom<Prisma.InputJsonValue>((v) => v !== undefined, {
    message: 'value is required',
  }),
  category: z
    .string()
    .trim()
    .min(1, 'category cannot be empty')
    .max(50, 'category cannot exceed 50 characters')
    .optional(),
  description: z.string().trim().max(500, 'description cannot exceed 500 characters').optional().nullable(),
});

const updateSystemSettingSchema = z.object({
  value: z.custom<Prisma.InputJsonValue>((v) => v !== undefined).optional(),
  category: z
    .string()
    .trim()
    .min(1, 'category cannot be empty')
    .max(50, 'category cannot exceed 50 characters')
    .optional(),
  description: z.string().trim().max(500, 'description cannot exceed 500 characters').optional().nullable(),
}).refine(
  (data) => data.value !== undefined || data.category !== undefined || data.description !== undefined,
  { message: 'At least one field (value, category, description) must be provided for update.' }
);

const listQuerySchema = z.object({
  category: z.string().trim().optional(),
  search: z.string().trim().optional(),
  includeSensitive: z.preprocess((val) => val === 'true' || val === true, z.boolean()).optional(),
});

// ─────────────────────────────────────────────────────────────────────────────
// Controllers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/system-settings — List system settings. Admin only.
 */
export async function listSystemSettingsController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }
    if (req.user.role !== 'admin') {
      throw new AppError(403, 'Access denied. System settings are restricted to administrators.');
    }

    const parsedQuery = listQuerySchema.safeParse(req.query);
    if (!parsedQuery.success) {
      const body: ApiError = {
        success: false,
        message: 'Validation failed',
        errors: formatZodErrors(parsedQuery.error),
      };
      res.status(400).json(body);
      return;
    }

    const settings = await settingService.listSystemSettings(parsedQuery.data);

    const body: ApiSuccess<typeof settings> = {
      success: true,
      data: settings,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/system-settings/:key — Get a single setting by key. Admin only.
 */
export async function getSystemSettingByKeyController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }
    if (req.user.role !== 'admin') {
      throw new AppError(403, 'Access denied. System settings are restricted to administrators.');
    }

    const key = extractKeyParam(req);
    const includeSensitive = req.query.includeSensitive !== 'false';

    const setting = await settingService.getSystemSettingByKey(key, { includeSensitive });

    const body: ApiSuccess<typeof setting> = {
      success: true,
      data: setting,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/system-settings — Create a system setting. Admin only.
 */
export async function createSystemSettingController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }
    if (req.user.role !== 'admin') {
      throw new AppError(403, 'Access denied. System settings are restricted to administrators.');
    }

    const parsed = createSystemSettingSchema.safeParse(req.body);
    if (!parsed.success) {
      const body: ApiError = {
        success: false,
        message: 'Validation failed',
        errors: formatZodErrors(parsed.error),
      };
      res.status(400).json(body);
      return;
    }

    const ipAddress = extractIp(req);
    const setting = await settingService.createSystemSetting(
      parsed.data,
      { id: req.user.id, role: req.user.role },
      { ipAddress }
    );

    const body: ApiSuccess<typeof setting> = {
      success: true,
      message: `System setting '${setting.key}' created successfully.`,
      data: setting,
    };
    res.status(201).json(body);
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/system-settings/:key — Update an existing system setting. Admin only.
 */
export async function updateSystemSettingController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }
    if (req.user.role !== 'admin') {
      throw new AppError(403, 'Access denied. System settings are restricted to administrators.');
    }

    const key = extractKeyParam(req);
    const parsed = updateSystemSettingSchema.safeParse(req.body);
    if (!parsed.success) {
      const body: ApiError = {
        success: false,
        message: 'Validation failed',
        errors: formatZodErrors(parsed.error),
      };
      res.status(400).json(body);
      return;
    }

    const ipAddress = extractIp(req);
    const updated = await settingService.updateSystemSetting(
      key,
      parsed.data,
      { id: req.user.id, role: req.user.role },
      { ipAddress }
    );

    const body: ApiSuccess<typeof updated> = {
      success: true,
      message: `System setting '${updated.key}' updated successfully.`,
      data: updated,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/system-settings/:key — Delete a system setting. Admin only.
 */
export async function deleteSystemSettingController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }
    if (req.user.role !== 'admin') {
      throw new AppError(403, 'Access denied. System settings are restricted to administrators.');
    }

    const key = extractKeyParam(req);
    const ipAddress = extractIp(req);

    const result = await settingService.deleteSystemSetting(
      key,
      { id: req.user.id, role: req.user.role },
      { ipAddress }
    );

    const body: ApiSuccess<typeof result> = {
      success: true,
      message: result.message,
      data: result,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}
