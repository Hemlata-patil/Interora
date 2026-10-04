import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as auditService from '../services/auditLog.service';
import { AppError } from '../middleware/errorHandler';
import type { ApiSuccess, ApiError, PaginatedResponse } from '../types';

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

const listAuditLogsQuerySchema = z.object({
  actorId: z
    .string()
    .uuid('Invalid actorId format. Expected a valid UUID.')
    .optional(),
  action: z.string().trim().max(100, 'action filter cannot exceed 100 characters').optional(),
  entityType: z.string().trim().max(50, 'entityType filter cannot exceed 50 characters').optional(),
  entityId: z
    .string()
    .uuid('Invalid entityId format. Expected a valid UUID.')
    .optional(),
  startDate: z
    .string()
    .datetime({ offset: true, message: 'startDate must be a valid ISO 8601 datetime.' })
    .optional()
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'startDate must be YYYY-MM-DD or ISO 8601.').optional()),
  endDate: z
    .string()
    .datetime({ offset: true, message: 'endDate must be a valid ISO 8601 datetime.' })
    .optional()
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'endDate must be YYYY-MM-DD or ISO 8601.').optional()),
  page: z.coerce.number().int().min(1, 'page must be >= 1').default(1),
  limit: z.coerce.number().int().min(1, 'limit must be >= 1').max(100, 'limit cannot exceed 100').default(50),
});

// ─────────────────────────────────────────────────────────────────────────────
// Controllers (Admin Only, Read-Only)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/audit-logs — List audit logs with pagination and filters.
 * Admin only.
 */
export async function listAuditLogsController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }
    if (req.user.role !== 'admin') {
      throw new AppError(403, 'Access denied. Audit logs are restricted to administrators.');
    }

    const parsedQuery = listAuditLogsQuerySchema.safeParse(req.query);
    if (!parsedQuery.success) {
      const body: ApiError = {
        success: false,
        message: 'Validation failed',
        errors: formatZodErrors(parsedQuery.error),
      };
      res.status(400).json(body);
      return;
    }

    const { actorId, action, entityType, entityId, startDate, endDate, page, limit } = parsedQuery.data;

    let parsedStart: Date | undefined;
    if (startDate) {
      const d = new Date(startDate);
      if (isNaN(d.getTime())) {
        throw new AppError(400, 'Invalid startDate format.');
      }
      parsedStart = d;
    }

    let parsedEnd: Date | undefined;
    if (endDate) {
      const d = new Date(endDate);
      if (isNaN(d.getTime())) {
        throw new AppError(400, 'Invalid endDate format.');
      }
      // If date only (e.g. YYYY-MM-DD), set to end of day
      if (endDate.length === 10) {
        d.setUTCHours(23, 59, 59, 999);
      }
      parsedEnd = d;
    }

    const result = await auditService.listAuditLogs({
      actorId,
      action,
      entityType,
      entityId,
      startDate: parsedStart,
      endDate: parsedEnd,
      page,
      limit,
    });

    const response: PaginatedResponse<(typeof result.logs)[number]> = {
      success: true,
      data: result.logs,
      meta: {
        total: result.total,
        page: result.page,
        perPage: result.limit,
        totalPages: result.totalPages,
      },
    };

    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/audit-logs/:id — Get a single audit log by ID.
 * Admin only.
 */
export async function getAuditLogByIdController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }
    if (req.user.role !== 'admin') {
      throw new AppError(403, 'Access denied. Audit logs are restricted to administrators.');
    }

    const id = extractParam(req, 'id');
    const log = await auditService.getAuditLogById(id);

    const body: ApiSuccess<typeof log> = {
      success: true,
      data: log,
    };

    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}
