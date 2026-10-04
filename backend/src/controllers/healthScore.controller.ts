import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as healthScoreService from '../services/healthScore.service';
import { AppError } from '../middleware/errorHandler';
import type { ApiSuccess, ApiError } from '../types';
import type { RiskLevel } from '@prisma/client';

// ─────────────────────────────────────────────────────────────────────────────
// Parameter Extraction & Validation Helpers
// ─────────────────────────────────────────────────────────────────────────────

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const datePattern = /^\d{4}-\d{2}-\d{2}$/;

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

const riskLevelEnum = z.enum(['on_track', 'needs_attention', 'high_risk'], {
  errorMap: () => ({
    message: 'riskLevel must be one of: on_track, needs_attention, high_risk',
  }),
});

const calculateHealthScoreSchema = z.object({
  assignmentId: z
    .string({ required_error: 'assignmentId is required' })
    .uuid('Invalid assignmentId format. Expected a valid UUID.'),
  snapshotDate: z
    .string()
    .datetime({ offset: true })
    .or(z.string().regex(datePattern, 'Expected YYYY-MM-DD format'))
    .optional(),
});

const createRiskFlagSchema = z.object({
  assignmentId: z
    .string({ required_error: 'assignmentId is required' })
    .uuid('Invalid assignmentId format. Expected a valid UUID.'),
  riskLevel: riskLevelEnum,
  signalReason: z
    .string({ required_error: 'signalReason is required' })
    .trim()
    .min(1, 'signalReason cannot be empty')
    .max(500, 'signalReason cannot exceed 500 characters'),
  interventionNotes: z.string().trim().max(2000).optional().nullable(),
});

const updateRiskFlagSchema = z.object({
  riskLevel: riskLevelEnum.optional(),
  signalReason: z
    .string()
    .trim()
    .min(1, 'signalReason cannot be empty')
    .max(500, 'signalReason cannot exceed 500 characters')
    .optional(),
  resolved: z.boolean().optional(),
  interventionNotes: z.string().trim().max(2000).optional().nullable(),
});

// ─────────────────────────────────────────────────────────────────────────────
// 1. GET /api/health-scores — List Snapshots
// ─────────────────────────────────────────────────────────────────────────────

export async function listHealthScoreSnapshotsController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const {
      assignmentId,
      studentId,
      riskStatus,
      startDate,
      endDate,
    } = req.query;

    const filters: healthScoreService.HealthScoreFilters = {};

    if (typeof assignmentId === 'string' && UUID_REGEX.test(assignmentId)) {
      filters.assignmentId = assignmentId;
    }

    if (typeof studentId === 'string' && UUID_REGEX.test(studentId)) {
      filters.studentId = studentId;
    }

    if (
      typeof riskStatus === 'string' &&
      ['on_track', 'needs_attention', 'high_risk'].includes(riskStatus)
    ) {
      filters.riskStatus = riskStatus as RiskLevel;
    }

    if (typeof startDate === 'string') {
      filters.startDate = startDate;
    }

    if (typeof endDate === 'string') {
      filters.endDate = endDate;
    }

    const snapshots = await healthScoreService.listHealthScoreSnapshots(filters, {
      id: req.user.id,
      role: req.user.role,
    });

    const body: ApiSuccess<typeof snapshots> = {
      success: true,
      data: snapshots,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. GET /api/health-scores/:id — Get Snapshot by ID
// ─────────────────────────────────────────────────────────────────────────────

export async function getHealthScoreSnapshotByIdController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const id = extractParam(req, 'id');
    const snapshot = await healthScoreService.getHealthScoreSnapshotById(id, {
      id: req.user.id,
      role: req.user.role,
    });

    const body: ApiSuccess<typeof snapshot> = {
      success: true,
      data: snapshot,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. POST /api/health-scores/calculate — Calculate & Save Snapshot
// ─────────────────────────────────────────────────────────────────────────────

export async function calculateHealthScoreController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const parsed = calculateHealthScoreSchema.safeParse(req.body);
    if (!parsed.success) {
      const body: ApiError = {
        success: false,
        message: 'Validation failed',
        errors: formatZodErrors(parsed.error),
      };
      res.status(400).json(body);
      return;
    }

    const snapshot = await healthScoreService.calculateAndSaveHealthScore(
      parsed.data,
      {
        id: req.user.id,
        role: req.user.role,
      }
    );

    const body: ApiSuccess<typeof snapshot> = {
      success: true,
      message: 'Health score calculated and saved successfully.',
      data: snapshot,
    };
    res.status(201).json(body);
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. GET /api/risk-flags — List Risk Flags
// ─────────────────────────────────────────────────────────────────────────────

export async function listRiskFlagsController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const {
      assignmentId,
      studentId,
      riskLevel,
      resolved,
    } = req.query;

    const filters: healthScoreService.RiskFlagFilters = {};

    if (typeof assignmentId === 'string' && UUID_REGEX.test(assignmentId)) {
      filters.assignmentId = assignmentId;
    }

    if (typeof studentId === 'string' && UUID_REGEX.test(studentId)) {
      filters.studentId = studentId;
    }

    if (
      typeof riskLevel === 'string' &&
      ['on_track', 'needs_attention', 'high_risk'].includes(riskLevel)
    ) {
      filters.riskLevel = riskLevel as RiskLevel;
    }

    if (resolved === 'true') {
      filters.resolved = true;
    } else if (resolved === 'false') {
      filters.resolved = false;
    }

    const flags = await healthScoreService.listRiskFlags(filters, {
      id: req.user.id,
      role: req.user.role,
    });

    const body: ApiSuccess<typeof flags> = {
      success: true,
      data: flags,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. GET /api/risk-flags/:id — Get Risk Flag by ID
// ─────────────────────────────────────────────────────────────────────────────

export async function getRiskFlagByIdController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const id = extractParam(req, 'id');
    const flag = await healthScoreService.getRiskFlagById(id, {
      id: req.user.id,
      role: req.user.role,
    });

    const body: ApiSuccess<typeof flag> = {
      success: true,
      data: flag,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. POST /api/risk-flags — Create Risk Flag
// ─────────────────────────────────────────────────────────────────────────────

export async function createRiskFlagController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const parsed = createRiskFlagSchema.safeParse(req.body);
    if (!parsed.success) {
      const body: ApiError = {
        success: false,
        message: 'Validation failed',
        errors: formatZodErrors(parsed.error),
      };
      res.status(400).json(body);
      return;
    }

    const flag = await healthScoreService.createRiskFlag(parsed.data, {
      id: req.user.id,
      role: req.user.role,
    });

    const body: ApiSuccess<typeof flag> = {
      success: true,
      message: 'Risk flag created successfully.',
      data: flag,
    };
    res.status(201).json(body);
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. PATCH /api/risk-flags/:id — Update / Resolve Risk Flag
// ─────────────────────────────────────────────────────────────────────────────

export async function updateRiskFlagController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const id = extractParam(req, 'id');
    const parsed = updateRiskFlagSchema.safeParse(req.body);
    if (!parsed.success) {
      const body: ApiError = {
        success: false,
        message: 'Validation failed',
        errors: formatZodErrors(parsed.error),
      };
      res.status(400).json(body);
      return;
    }

    const flag = await healthScoreService.updateRiskFlag(id, parsed.data, {
      id: req.user.id,
      role: req.user.role,
    });

    const body: ApiSuccess<typeof flag> = {
      success: true,
      message: 'Risk flag updated successfully.',
      data: flag,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}
