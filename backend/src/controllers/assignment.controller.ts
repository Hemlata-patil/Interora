import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as assignmentService from '../services/assignment.service';
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

const createAssignmentSchema = z.object({
  applicationId: z
    .string({ required_error: 'applicationId is required' })
    .uuid('Invalid applicationId format. Expected a valid UUID.'),
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
  facultyMentorId: z
    .string()
    .uuid('Invalid facultyMentorId format. Expected a valid UUID.')
    .optional(),
  industryMentorId: z
    .string()
    .uuid('Invalid industryMentorId format. Expected a valid UUID.')
    .optional(),
  status: z
    .enum(['upcoming', 'active', 'completed', 'terminated', 'suspended'])
    .optional(),
});

const updateAssignmentSchema = z.object({
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
  actualCompletionDate: z
    .string()
    .datetime({ offset: true })
    .or(z.string().regex(datePattern, 'Expected YYYY-MM-DD format'))
    .optional()
    .nullable(),
  facultyMentorId: z
    .string()
    .uuid('Invalid facultyMentorId format. Expected a valid UUID.')
    .optional(),
  industryMentorId: z
    .string()
    .uuid('Invalid industryMentorId format. Expected a valid UUID.')
    .optional(),
  status: z
    .enum(['upcoming', 'active', 'completed', 'terminated', 'suspended'])
    .optional(),
  terminationReason: z
    .string()
    .trim()
    .max(1000, 'Termination reason cannot exceed 1000 characters')
    .optional()
    .nullable(),
});

const updateAssignmentStatusSchema = z.object({
  status: z.enum(['upcoming', 'active', 'completed', 'terminated', 'suspended'], {
    errorMap: () => ({
      message:
        'Status must be one of: upcoming, active, completed, terminated, suspended',
    }),
  }),
  terminationReason: z
    .string()
    .trim()
    .max(1000, 'Termination reason cannot exceed 1000 characters')
    .optional()
    .nullable(),
  actualCompletionDate: z
    .string()
    .datetime({ offset: true })
    .or(z.string().regex(datePattern, 'Expected YYYY-MM-DD format'))
    .optional()
    .nullable(),
});

// ─────────────────────────────────────────────────────────────────────────────
// 1. POST /api/assignments (Company Owner or Admin)
// ─────────────────────────────────────────────────────────────────────────────

export async function createAssignmentController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const parsed = createAssignmentSchema.safeParse(req.body);
    if (!parsed.success) {
      const body: ApiError = {
        success: false,
        message: 'Validation failed',
        errors: formatZodErrors(parsed.error),
      };
      res.status(400).json(body);
      return;
    }

    const assignment = await assignmentService.createAssignment(parsed.data, {
      id: req.user.id,
      role: req.user.role,
    });

    const body: ApiSuccess<typeof assignment> = {
      success: true,
      message: 'Internship assignment created successfully.',
      data: assignment,
    };
    res.status(201).json(body);
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. GET /api/assignments (Authenticated)
// ─────────────────────────────────────────────────────────────────────────────

export async function listAssignmentsController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const statusParam = req.query.status as string | undefined;
    const validStatus =
      statusParam &&
      ['upcoming', 'active', 'completed', 'terminated', 'suspended'].includes(
        statusParam
      )
        ? (statusParam as any)
        : undefined;

    const studentId = typeof req.query.studentId === 'string' ? req.query.studentId : undefined;
    const companyId = typeof req.query.companyId === 'string' ? req.query.companyId : undefined;
    const internshipId =
      typeof req.query.internshipId === 'string' ? req.query.internshipId : undefined;

    const assignments = await assignmentService.listAssignments(
      {
        status: validStatus,
        studentId,
        companyId,
        internshipId,
      },
      {
        id: req.user.id,
        role: req.user.role,
      }
    );

    const body: ApiSuccess<typeof assignments> = {
      success: true,
      data: assignments,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. GET /api/assignments/:id (Authenticated)
// ─────────────────────────────────────────────────────────────────────────────

export async function getAssignmentByIdController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const id = extractParam(req, 'id');
    const assignment = await assignmentService.getAssignmentById(id, {
      id: req.user.id,
      role: req.user.role,
    });

    const body: ApiSuccess<typeof assignment> = {
      success: true,
      data: assignment,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. PATCH /api/assignments/:id (Company Owner or Admin)
// ─────────────────────────────────────────────────────────────────────────────

export async function updateAssignmentController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const id = extractParam(req, 'id');
    const parsed = updateAssignmentSchema.safeParse(req.body);
    if (!parsed.success) {
      const body: ApiError = {
        success: false,
        message: 'Validation failed',
        errors: formatZodErrors(parsed.error),
      };
      res.status(400).json(body);
      return;
    }

    const updated = await assignmentService.updateAssignment(id, parsed.data, {
      id: req.user.id,
      role: req.user.role,
    });

    const body: ApiSuccess<typeof updated> = {
      success: true,
      message: 'Internship assignment updated successfully.',
      data: updated,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. PATCH /api/assignments/:id/status (Company Owner or Admin)
// ─────────────────────────────────────────────────────────────────────────────

export async function updateAssignmentStatusController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const id = extractParam(req, 'id');
    const parsed = updateAssignmentStatusSchema.safeParse(req.body);
    if (!parsed.success) {
      const body: ApiError = {
        success: false,
        message: 'Validation failed',
        errors: formatZodErrors(parsed.error),
      };
      res.status(400).json(body);
      return;
    }

    const updated = await assignmentService.updateAssignmentStatus(
      id,
      parsed.data,
      {
        id: req.user.id,
        role: req.user.role,
      }
    );

    const body: ApiSuccess<typeof updated> = {
      success: true,
      message: 'Assignment status updated successfully.',
      data: updated,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. DELETE /api/assignments/:id (Company Owner or Admin)
// ─────────────────────────────────────────────────────────────────────────────

export async function deleteAssignmentController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const id = extractParam(req, 'id');
    const result = await assignmentService.deleteAssignment(id, {
      id: req.user.id,
      role: req.user.role,
    });

    const body: ApiSuccess<typeof result> = {
      success: true,
      message: 'Assignment deleted successfully.',
      data: result,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}
