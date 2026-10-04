import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as worklogService from '../services/worklog.service';
import { AppError } from '../middleware/errorHandler';
import type { ApiSuccess, ApiError } from '../types';

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

const createWorkLogSchema = z.object({
  assignmentId: z
    .string({ required_error: 'assignmentId is required' })
    .uuid('Invalid assignmentId format. Expected a valid UUID.'),
  taskId: z
    .string()
    .uuid('Invalid taskId format. Expected a valid UUID.')
    .optional()
    .nullable(),
  taskTitle: z
    .string()
    .trim()
    .max(200, 'taskTitle cannot exceed 200 characters')
    .optional(),
  logDate: z
    .string()
    .datetime({ offset: true })
    .or(z.string().regex(datePattern, 'Expected YYYY-MM-DD format'))
    .optional()
    .nullable(),
  hoursWorked: z
    .number()
    .min(0.25, 'Hours worked must be at least 0.25')
    .max(24, 'Hours worked cannot exceed 24 hours per day')
    .optional(),
  completedWork: z
    .string({ required_error: 'completedWork is required' })
    .trim()
    .min(1, 'completedWork cannot be empty')
    .max(5000, 'completedWork cannot exceed 5000 characters'),
  blockers: z.string().trim().max(1000).optional().nullable(),
  nextPlan: z.string().trim().max(1000).optional().nullable(),
});

const updateWorkLogSchema = z.object({
  taskId: z
    .string()
    .uuid('Invalid taskId format. Expected a valid UUID.')
    .optional()
    .nullable(),
  taskTitle: z
    .string()
    .trim()
    .min(1, 'taskTitle cannot be empty')
    .max(200, 'taskTitle cannot exceed 200 characters')
    .optional(),
  logDate: z
    .string()
    .datetime({ offset: true })
    .or(z.string().regex(datePattern, 'Expected YYYY-MM-DD format'))
    .optional()
    .nullable(),
  hoursWorked: z
    .number()
    .min(0.25, 'Hours worked must be at least 0.25')
    .max(24, 'Hours worked cannot exceed 24 hours per day')
    .optional(),
  completedWork: z
    .string()
    .trim()
    .min(1, 'completedWork cannot be empty')
    .max(5000, 'completedWork cannot exceed 5000 characters')
    .optional(),
  blockers: z.string().trim().max(1000).optional().nullable(),
  nextPlan: z.string().trim().max(1000).optional().nullable(),
});

// ─────────────────────────────────────────────────────────────────────────────
// 1. GET /api/work-logs — List Work Logs
// ─────────────────────────────────────────────────────────────────────────────

export async function listWorkLogsController(
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
      taskTitle,
      startDate,
      endDate,
    } = req.query;

    const filters: worklogService.WorkLogFilters = {};

    if (typeof assignmentId === 'string' && UUID_REGEX.test(assignmentId)) {
      filters.assignmentId = assignmentId;
    }

    if (typeof studentId === 'string' && UUID_REGEX.test(studentId)) {
      filters.studentId = studentId;
    }

    if (typeof taskTitle === 'string' && taskTitle.trim().length > 0) {
      filters.taskTitle = taskTitle.trim();
    }

    if (typeof startDate === 'string') {
      filters.startDate = startDate;
    }

    if (typeof endDate === 'string') {
      filters.endDate = endDate;
    }

    const workLogs = await worklogService.listWorkLogs(filters, {
      id: req.user.id,
      role: req.user.role,
    });

    const body: ApiSuccess<typeof workLogs> = {
      success: true,
      data: workLogs,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. GET /api/work-logs/:id — Get Work Log by ID
// ─────────────────────────────────────────────────────────────────────────────

export async function getWorkLogByIdController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const id = extractParam(req, 'id');
    const workLog = await worklogService.getWorkLogById(id, {
      id: req.user.id,
      role: req.user.role,
    });

    const body: ApiSuccess<typeof workLog> = {
      success: true,
      data: workLog,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. POST /api/work-logs — Create Work Log
// ─────────────────────────────────────────────────────────────────────────────

export async function createWorkLogController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const parsed = createWorkLogSchema.safeParse(req.body);
    if (!parsed.success) {
      const body: ApiError = {
        success: false,
        message: 'Validation failed',
        errors: formatZodErrors(parsed.error),
      };
      res.status(400).json(body);
      return;
    }

    const workLog = await worklogService.createWorkLog(parsed.data, {
      id: req.user.id,
      role: req.user.role,
    });

    const body: ApiSuccess<typeof workLog> = {
      success: true,
      message: 'Work log recorded successfully.',
      data: workLog,
    };
    res.status(201).json(body);
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. PATCH /api/work-logs/:id — Update Work Log
// ─────────────────────────────────────────────────────────────────────────────

export async function updateWorkLogController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const id = extractParam(req, 'id');
    const parsed = updateWorkLogSchema.safeParse(req.body);
    if (!parsed.success) {
      const body: ApiError = {
        success: false,
        message: 'Validation failed',
        errors: formatZodErrors(parsed.error),
      };
      res.status(400).json(body);
      return;
    }

    const workLog = await worklogService.updateWorkLog(id, parsed.data, {
      id: req.user.id,
      role: req.user.role,
    });

    const body: ApiSuccess<typeof workLog> = {
      success: true,
      message: 'Work log updated successfully.',
      data: workLog,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. DELETE /api/work-logs/:id — Delete Work Log
// ─────────────────────────────────────────────────────────────────────────────

export async function deleteWorkLogController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const id = extractParam(req, 'id');
    const result = await worklogService.deleteWorkLog(id, {
      id: req.user.id,
      role: req.user.role,
    });

    const body: ApiSuccess<typeof result> = {
      success: true,
      message: 'Work log deleted successfully.',
      data: result,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}
