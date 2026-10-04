import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as milestoneService from '../services/milestone.service';
import { AppError } from '../middleware/errorHandler';
import type { ApiSuccess, ApiError } from '../types';
import type { MilestoneStatus } from '@prisma/client';

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

const milestoneStatusEnum = z.enum(
  ['pending', 'in_progress', 'delayed', 'completed'],
  {
    errorMap: () => ({
      message: 'Status must be one of: pending, in_progress, delayed, completed',
    }),
  }
);

const createMilestoneSchema = z.object({
  assignmentId: z
    .string({ required_error: 'assignmentId is required' })
    .uuid('Invalid assignmentId format. Expected a valid UUID.'),
  templateId: z
    .string()
    .uuid('Invalid templateId format. Expected a valid UUID.')
    .optional()
    .nullable(),
  title: z
    .string({ required_error: 'Title is required' })
    .trim()
    .min(1, 'Title cannot be empty')
    .max(200, 'Title cannot exceed 200 characters'),
  description: z.string().trim().max(5000).optional().nullable(),
  targetDate: z
    .string({ required_error: 'targetDate is required' })
    .datetime({ offset: true })
    .or(z.string().regex(datePattern, 'Expected YYYY-MM-DD format')),
  status: milestoneStatusEnum.optional(),
});

const updateMilestoneSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title cannot be empty')
    .max(200, 'Title cannot exceed 200 characters')
    .optional(),
  description: z.string().trim().max(5000).optional().nullable(),
  targetDate: z
    .string()
    .datetime({ offset: true })
    .or(z.string().regex(datePattern, 'Expected YYYY-MM-DD format'))
    .optional()
    .nullable(),
  status: milestoneStatusEnum.optional(),
  completedAt: z
    .string()
    .datetime({ offset: true })
    .or(z.string().regex(datePattern, 'Expected YYYY-MM-DD format'))
    .optional()
    .nullable(),
});

const updateMilestoneStatusSchema = z.object({
  status: milestoneStatusEnum,
});

// ─────────────────────────────────────────────────────────────────────────────
// 1. GET /api/milestones — List Milestones
// ─────────────────────────────────────────────────────────────────────────────

export async function listMilestonesController(
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
      status,
      studentId,
      dueStartDate,
      dueEndDate,
    } = req.query;

    const filters: milestoneService.MilestoneFilters = {};

    if (typeof assignmentId === 'string' && UUID_REGEX.test(assignmentId)) {
      filters.assignmentId = assignmentId;
    }

    if (
      typeof status === 'string' &&
      ['pending', 'in_progress', 'delayed', 'completed'].includes(status)
    ) {
      filters.status = status as MilestoneStatus;
    }

    if (typeof studentId === 'string' && UUID_REGEX.test(studentId)) {
      filters.studentId = studentId;
    }

    if (typeof dueStartDate === 'string') {
      filters.dueStartDate = dueStartDate;
    }

    if (typeof dueEndDate === 'string') {
      filters.dueEndDate = dueEndDate;
    }

    const milestones = await milestoneService.listMilestones(filters, {
      id: req.user.id,
      role: req.user.role,
    });

    const body: ApiSuccess<typeof milestones> = {
      success: true,
      data: milestones,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. GET /api/milestones/:id — Get Milestone by ID
// ─────────────────────────────────────────────────────────────────────────────

export async function getMilestoneByIdController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const id = extractParam(req, 'id');
    const milestone = await milestoneService.getMilestoneById(id, {
      id: req.user.id,
      role: req.user.role,
    });

    const body: ApiSuccess<typeof milestone> = {
      success: true,
      data: milestone,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. POST /api/milestones — Create Milestone
// ─────────────────────────────────────────────────────────────────────────────

export async function createMilestoneController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const parsed = createMilestoneSchema.safeParse(req.body);
    if (!parsed.success) {
      const body: ApiError = {
        success: false,
        message: 'Validation failed',
        errors: formatZodErrors(parsed.error),
      };
      res.status(400).json(body);
      return;
    }

    const milestone = await milestoneService.createMilestone(parsed.data, {
      id: req.user.id,
      role: req.user.role,
    });

    const body: ApiSuccess<typeof milestone> = {
      success: true,
      message: 'Milestone created successfully.',
      data: milestone,
    };
    res.status(201).json(body);
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. PATCH /api/milestones/:id — Update Milestone
// ─────────────────────────────────────────────────────────────────────────────

export async function updateMilestoneController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const id = extractParam(req, 'id');
    const parsed = updateMilestoneSchema.safeParse(req.body);
    if (!parsed.success) {
      const body: ApiError = {
        success: false,
        message: 'Validation failed',
        errors: formatZodErrors(parsed.error),
      };
      res.status(400).json(body);
      return;
    }

    const milestone = await milestoneService.updateMilestone(id, parsed.data, {
      id: req.user.id,
      role: req.user.role,
    });

    const body: ApiSuccess<typeof milestone> = {
      success: true,
      message: 'Milestone updated successfully.',
      data: milestone,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. PATCH /api/milestones/:id/status — Update Milestone Status
// ─────────────────────────────────────────────────────────────────────────────

export async function updateMilestoneStatusController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const id = extractParam(req, 'id');
    const parsed = updateMilestoneStatusSchema.safeParse(req.body);
    if (!parsed.success) {
      const body: ApiError = {
        success: false,
        message: 'Validation failed',
        errors: formatZodErrors(parsed.error),
      };
      res.status(400).json(body);
      return;
    }

    const milestone = await milestoneService.updateMilestoneStatus(id, parsed.data, {
      id: req.user.id,
      role: req.user.role,
    });

    const body: ApiSuccess<typeof milestone> = {
      success: true,
      message: 'Milestone status updated successfully.',
      data: milestone,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. DELETE /api/milestones/:id — Delete Milestone
// ─────────────────────────────────────────────────────────────────────────────

export async function deleteMilestoneController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const id = extractParam(req, 'id');
    const result = await milestoneService.deleteMilestone(id, {
      id: req.user.id,
      role: req.user.role,
    });

    const body: ApiSuccess<typeof result> = {
      success: true,
      message: 'Milestone deleted successfully.',
      data: result,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}
