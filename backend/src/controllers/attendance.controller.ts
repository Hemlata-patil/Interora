import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as attendanceService from '../services/attendance.service';
import { AppError } from '../middleware/errorHandler';
import type { ApiSuccess, ApiError } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// Parameter Extraction & Validation Helpers
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

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

const attendanceStatusEnum = z.enum(
  ['present', 'absent', 'late', 'half_day', 'leave'],
  {
    errorMap: () => ({
      message: 'Status must be one of: present, absent, late, half_day, leave',
    }),
  }
);

const createAttendanceSchema = z.object({
  assignmentId: z
    .string({ required_error: 'assignmentId is required' })
    .uuid('Invalid assignmentId format. Expected a valid UUID.'),
  attendanceDate: z
    .string()
    .datetime({ offset: true })
    .or(z.string().regex(datePattern, 'Expected YYYY-MM-DD format'))
    .optional(),
  status: attendanceStatusEnum,
  checkInTime: z.string().datetime({ offset: true }).optional().nullable(),
  checkInPhotoUrl: z.string().trim().max(1000).optional().nullable(),
  checkInLat: z.number().min(-90).max(90).optional().nullable(),
  checkInLng: z.number().min(-180).max(180).optional().nullable(),
  checkInAddress: z.string().trim().max(500).optional().nullable(),
  checkOutTime: z.string().datetime({ offset: true }).optional().nullable(),
  checkOutPhotoUrl: z.string().trim().max(1000).optional().nullable(),
  checkOutLat: z.number().min(-90).max(90).optional().nullable(),
  checkOutLng: z.number().min(-180).max(180).optional().nullable(),
  checkOutAddress: z.string().trim().max(500).optional().nullable(),
  workingHours: z.number().min(0).max(24).optional().nullable(),
  geoVerified: z.boolean().optional(),
  facultyOverride: z.boolean().optional(),
  overrideReason: z.string().trim().max(500).optional().nullable(),
});

const updateAttendanceSchema = z.object({
  status: attendanceStatusEnum.optional(),
  checkInTime: z.string().datetime({ offset: true }).optional().nullable(),
  checkInPhotoUrl: z.string().trim().max(1000).optional().nullable(),
  checkInLat: z.number().min(-90).max(90).optional().nullable(),
  checkInLng: z.number().min(-180).max(180).optional().nullable(),
  checkInAddress: z.string().trim().max(500).optional().nullable(),
  checkOutTime: z.string().datetime({ offset: true }).optional().nullable(),
  checkOutPhotoUrl: z.string().trim().max(1000).optional().nullable(),
  checkOutLat: z.number().min(-90).max(90).optional().nullable(),
  checkOutLng: z.number().min(-180).max(180).optional().nullable(),
  checkOutAddress: z.string().trim().max(500).optional().nullable(),
  workingHours: z.number().min(0).max(24).optional().nullable(),
  geoVerified: z.boolean().optional(),
  facultyOverride: z.boolean().optional(),
  overrideReason: z.string().trim().max(500).optional().nullable(),
});

const studentCheckInSchema = z.object({
  assignmentId: z
    .string()
    .uuid('Invalid assignmentId format. Expected a valid UUID.')
    .optional(),
  checkInPhotoUrl: z.string().trim().max(1000).optional().nullable(),
  checkInLat: z.number().min(-90).max(90).optional().nullable(),
  checkInLng: z.number().min(-180).max(180).optional().nullable(),
  checkInAddress: z.string().trim().max(500).optional().nullable(),
});

const studentCheckOutSchema = z.object({
  assignmentId: z
    .string()
    .uuid('Invalid assignmentId format. Expected a valid UUID.')
    .optional(),
  checkOutPhotoUrl: z.string().trim().max(1000).optional().nullable(),
  checkOutLat: z.number().min(-90).max(90).optional().nullable(),
  checkOutLng: z.number().min(-180).max(180).optional().nullable(),
  checkOutAddress: z.string().trim().max(500).optional().nullable(),
});

// ─────────────────────────────────────────────────────────────────────────────
// 1. GET /api/attendance/my (Student only)
// ─────────────────────────────────────────────────────────────────────────────

export async function checkInAttendanceController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const parsed = studentCheckInSchema.safeParse(req.body);
    if (!parsed.success) {
      const body: ApiError = {
        success: false,
        message: 'Validation failed',
        errors: formatZodErrors(parsed.error),
      };
      res.status(400).json(body);
      return;
    }

    const record = await attendanceService.studentCheckIn(req.user.id, parsed.data);
    const body: ApiSuccess<typeof record> = {
      success: true,
      message: 'Attendance checked in successfully.',
      data: record,
    };
    res.status(201).json(body);
  } catch (err) {
    next(err);
  }
}

export async function checkOutAttendanceController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const parsed = studentCheckOutSchema.safeParse(req.body);
    if (!parsed.success) {
      const body: ApiError = {
        success: false,
        message: 'Validation failed',
        errors: formatZodErrors(parsed.error),
      };
      res.status(400).json(body);
      return;
    }

    const record = await attendanceService.studentCheckOut(req.user.id, parsed.data);
    const body: ApiSuccess<typeof record> = {
      success: true,
      message: 'Attendance checked out successfully.',
      data: record,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

export async function getMyAttendanceController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const assignmentId = typeof req.query.assignmentId === 'string' ? req.query.assignmentId : undefined;
    const startDate = typeof req.query.startDate === 'string' ? req.query.startDate : undefined;
    const endDate = typeof req.query.endDate === 'string' ? req.query.endDate : undefined;
    const statusParam = typeof req.query.status === 'string' ? req.query.status : undefined;
    const status =
      statusParam && ['present', 'absent', 'late', 'half_day', 'leave'].includes(statusParam)
        ? (statusParam as any)
        : undefined;

    const records = await attendanceService.getStudentAttendance(req.user.id, {
      assignmentId,
      startDate,
      endDate,
      status,
    });

    const body: ApiSuccess<typeof records> = {
      success: true,
      data: records,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. GET /api/assignments/:assignmentId/attendance
// ─────────────────────────────────────────────────────────────────────────────

export async function getAssignmentAttendanceController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const assignmentId = extractParam(req, 'assignmentId');
    const startDate = typeof req.query.startDate === 'string' ? req.query.startDate : undefined;
    const endDate = typeof req.query.endDate === 'string' ? req.query.endDate : undefined;
    const statusParam = typeof req.query.status === 'string' ? req.query.status : undefined;
    const status =
      statusParam && ['present', 'absent', 'late', 'half_day', 'leave'].includes(statusParam)
        ? (statusParam as any)
        : undefined;

    const records = await attendanceService.getAssignmentAttendance(
      assignmentId,
      {
        id: req.user.id,
        role: req.user.role,
      },
      {
        startDate,
        endDate,
        status,
      }
    );

    const body: ApiSuccess<typeof records> = {
      success: true,
      data: records,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. GET /api/attendance/:id
// ─────────────────────────────────────────────────────────────────────────────

export async function getAttendanceByIdController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const id = extractParam(req, 'id');
    const record = await attendanceService.getAttendanceById(id, {
      id: req.user.id,
      role: req.user.role,
    });

    const body: ApiSuccess<typeof record> = {
      success: true,
      data: record,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. POST /api/attendance (Company, Faculty, Admin)
// ─────────────────────────────────────────────────────────────────────────────

export async function createAttendanceController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const parsed = createAttendanceSchema.safeParse(req.body);
    if (!parsed.success) {
      const body: ApiError = {
        success: false,
        message: 'Validation failed',
        errors: formatZodErrors(parsed.error),
      };
      res.status(400).json(body);
      return;
    }

    const record = await attendanceService.createAttendance(parsed.data, {
      id: req.user.id,
      role: req.user.role,
    });

    const body: ApiSuccess<typeof record> = {
      success: true,
      message: 'Attendance record created successfully.',
      data: record,
    };
    res.status(201).json(body);
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. PATCH /api/attendance/:id (Company, Faculty, Admin)
// ─────────────────────────────────────────────────────────────────────────────

export async function updateAttendanceController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const id = extractParam(req, 'id');
    const parsed = updateAttendanceSchema.safeParse(req.body);
    if (!parsed.success) {
      const body: ApiError = {
        success: false,
        message: 'Validation failed',
        errors: formatZodErrors(parsed.error),
      };
      res.status(400).json(body);
      return;
    }

    const updated = await attendanceService.updateAttendance(id, parsed.data, {
      id: req.user.id,
      role: req.user.role,
    });

    const body: ApiSuccess<typeof updated> = {
      success: true,
      message: 'Attendance record updated successfully.',
      data: updated,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. GET /api/attendance/summary/:assignmentId
// ─────────────────────────────────────────────────────────────────────────────

export async function getAttendanceSummaryController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const assignmentId = extractParam(req, 'assignmentId');
    const summary = await attendanceService.getAttendanceSummary(assignmentId, {
      id: req.user.id,
      role: req.user.role,
    });

    const body: ApiSuccess<typeof summary> = {
      success: true,
      data: summary,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. GET /api/attendance (List scoped records)
// ─────────────────────────────────────────────────────────────────────────────

export async function listAttendanceRecordsController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const assignmentId = typeof req.query.assignmentId === 'string' ? req.query.assignmentId : undefined;
    const startDate = typeof req.query.startDate === 'string' ? req.query.startDate : undefined;
    const endDate = typeof req.query.endDate === 'string' ? req.query.endDate : undefined;
    const statusParam = typeof req.query.status === 'string' ? req.query.status : undefined;
    const status =
      statusParam && ['present', 'absent', 'late', 'half_day', 'leave'].includes(statusParam)
        ? (statusParam as any)
        : undefined;

    const records = await attendanceService.listAttendanceRecords(
      {
        id: req.user.id,
        role: req.user.role,
      },
      {
        assignmentId,
        startDate,
        endDate,
        status,
      }
    );

    const body: ApiSuccess<typeof records> = {
      success: true,
      data: records,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}


