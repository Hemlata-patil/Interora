import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as weeklyReportService from '../services/weeklyReport.service';
import { AppError } from '../middleware/errorHandler';
import type { ApiSuccess, ApiError } from '../types';
import type { ReportStatus } from '@prisma/client';

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

const reportStatusEnum = z.enum(['draft', 'submitted', 'reviewed'], {
  errorMap: () => ({
    message: 'Status must be one of: draft, submitted, reviewed',
  }),
});

const createWeeklyReportSchema = z.object({
  assignmentId: z
    .string({ required_error: 'assignmentId is required' })
    .uuid('Invalid assignmentId format. Expected a valid UUID.'),
  weekNumber: z
    .number({ required_error: 'weekNumber is required' })
    .int('weekNumber must be an integer')
    .min(1, 'weekNumber must be at least 1')
    .max(52, 'weekNumber cannot exceed 52'),
  startDate: z
    .string({ required_error: 'startDate is required' })
    .datetime({ offset: true })
    .or(z.string().regex(datePattern, 'Expected YYYY-MM-DD format')),
  endDate: z
    .string({ required_error: 'endDate is required' })
    .datetime({ offset: true })
    .or(z.string().regex(datePattern, 'Expected YYYY-MM-DD format')),
  aiDraftContent: z.string().trim().max(10000).optional().nullable(),
  finalContent: z.string().trim().max(10000).optional().nullable(),
  status: reportStatusEnum.optional(),
});

const updateWeeklyReportSchema = z.object({
  startDate: z
    .string()
    .datetime({ offset: true })
    .or(z.string().regex(datePattern, 'Expected YYYY-MM-DD format'))
    .optional(),
  endDate: z
    .string()
    .datetime({ offset: true })
    .or(z.string().regex(datePattern, 'Expected YYYY-MM-DD format'))
    .optional(),
  aiDraftContent: z.string().trim().max(10000).optional().nullable(),
  finalContent: z.string().trim().max(10000).optional().nullable(),
  mentorFeedback: z.string().trim().max(2000).optional().nullable(),
});

const updateWeeklyReportStatusSchema = z.object({
  status: reportStatusEnum,
  mentorFeedback: z.string().trim().max(2000).optional().nullable(),
});

// ─────────────────────────────────────────────────────────────────────────────
// 1. GET /api/weekly-reports — List Weekly Reports
// ─────────────────────────────────────────────────────────────────────────────

export async function listWeeklyReportsController(
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
      status,
      weekNumber,
      startDate,
      endDate,
    } = req.query;

    const filters: weeklyReportService.WeeklyReportFilters = {};

    if (typeof assignmentId === 'string' && UUID_REGEX.test(assignmentId)) {
      filters.assignmentId = assignmentId;
    }

    if (typeof studentId === 'string' && UUID_REGEX.test(studentId)) {
      filters.studentId = studentId;
    }

    if (
      typeof status === 'string' &&
      ['draft', 'submitted', 'reviewed'].includes(status)
    ) {
      filters.status = status as ReportStatus;
    }

    if (typeof weekNumber === 'string') {
      const parsedWeek = parseInt(weekNumber, 10);
      if (!isNaN(parsedWeek) && parsedWeek > 0) {
        filters.weekNumber = parsedWeek;
      }
    }

    if (typeof startDate === 'string') {
      filters.startDate = startDate;
    }

    if (typeof endDate === 'string') {
      filters.endDate = endDate;
    }

    const reports = await weeklyReportService.listWeeklyReports(filters, {
      id: req.user.id,
      role: req.user.role,
    });

    const body: ApiSuccess<typeof reports> = {
      success: true,
      data: reports,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. GET /api/weekly-reports/:id — Get Weekly Report by ID
// ─────────────────────────────────────────────────────────────────────────────

export async function getWeeklyReportByIdController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const id = extractParam(req, 'id');
    const report = await weeklyReportService.getWeeklyReportById(id, {
      id: req.user.id,
      role: req.user.role,
    });

    const body: ApiSuccess<typeof report> = {
      success: true,
      data: report,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. POST /api/weekly-reports — Create Weekly Report
// ─────────────────────────────────────────────────────────────────────────────

export async function createWeeklyReportController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const parsed = createWeeklyReportSchema.safeParse(req.body);
    if (!parsed.success) {
      const body: ApiError = {
        success: false,
        message: 'Validation failed',
        errors: formatZodErrors(parsed.error),
      };
      res.status(400).json(body);
      return;
    }

    const report = await weeklyReportService.createWeeklyReport(parsed.data, {
      id: req.user.id,
      role: req.user.role,
    });

    const body: ApiSuccess<typeof report> = {
      success: true,
      message: 'Weekly report created successfully.',
      data: report,
    };
    res.status(201).json(body);
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. PATCH /api/weekly-reports/:id — Update Weekly Report
// ─────────────────────────────────────────────────────────────────────────────

export async function updateWeeklyReportController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const id = extractParam(req, 'id');
    const parsed = updateWeeklyReportSchema.safeParse(req.body);
    if (!parsed.success) {
      const body: ApiError = {
        success: false,
        message: 'Validation failed',
        errors: formatZodErrors(parsed.error),
      };
      res.status(400).json(body);
      return;
    }

    const report = await weeklyReportService.updateWeeklyReport(id, parsed.data, {
      id: req.user.id,
      role: req.user.role,
    });

    const body: ApiSuccess<typeof report> = {
      success: true,
      message: 'Weekly report updated successfully.',
      data: report,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. PATCH /api/weekly-reports/:id/status — Update Weekly Report Status
// ─────────────────────────────────────────────────────────────────────────────

export async function updateWeeklyReportStatusController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const id = extractParam(req, 'id');
    const parsed = updateWeeklyReportStatusSchema.safeParse(req.body);
    if (!parsed.success) {
      const body: ApiError = {
        success: false,
        message: 'Validation failed',
        errors: formatZodErrors(parsed.error),
      };
      res.status(400).json(body);
      return;
    }

    const report = await weeklyReportService.updateWeeklyReportStatus(
      id,
      parsed.data,
      {
        id: req.user.id,
        role: req.user.role,
      }
    );

    const body: ApiSuccess<typeof report> = {
      success: true,
      message: 'Weekly report status updated successfully.',
      data: report,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. DELETE /api/weekly-reports/:id — Delete Weekly Report
// ─────────────────────────────────────────────────────────────────────────────

export async function deleteWeeklyReportController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const id = extractParam(req, 'id');
    const result = await weeklyReportService.deleteWeeklyReport(id, {
      id: req.user.id,
      role: req.user.role,
    });

    const body: ApiSuccess<typeof result> = {
      success: true,
      message: 'Weekly report deleted successfully.',
      data: result,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}
