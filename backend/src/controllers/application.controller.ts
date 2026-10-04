import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as applicationService from '../services/application.service';
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

const createApplicationSchema = z.object({
  internshipId: z
    .string({ required_error: 'internshipId is required' })
    .uuid('Invalid internshipId format. Expected a valid UUID.'),
  coverLetter: z
    .string()
    .trim()
    .max(5000, 'Cover letter cannot exceed 5000 characters')
    .optional()
    .nullable(),
  resumeUrl: z
    .string()
    .trim()
    .max(500, 'Resume URL cannot exceed 500 characters')
    .optional()
    .nullable(),
});

const updateApplicationStatusSchema = z.object({
  status: z.enum(
    [
      'submitted',
      'faculty_review',
      'faculty_approved',
      'faculty_rejected',
      'shortlisted',
      'selected',
      'rejected',
      'withdrawn',
    ],
    {
      errorMap: () => ({
        message:
          'Status must be one of: submitted, faculty_review, faculty_approved, faculty_rejected, shortlisted, selected, rejected, withdrawn',
      }),
    }
  ),
  companyRemarks: z
    .string()
    .trim()
    .max(1000, 'Company remarks cannot exceed 1000 characters')
    .optional()
    .nullable(),
});

// ─────────────────────────────────────────────────────────────────────────────
// 1. GET /api/applications/my (Student only)
// ─────────────────────────────────────────────────────────────────────────────

export async function getMyApplicationsController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const applications = await applicationService.getStudentApplications(req.user.id);

    const body: ApiSuccess<typeof applications> = {
      success: true,
      data: applications,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. POST /api/applications (Student only)
// ─────────────────────────────────────────────────────────────────────────────

export async function createApplicationController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const parsed = createApplicationSchema.safeParse(req.body);
    if (!parsed.success) {
      const body: ApiError = {
        success: false,
        message: 'Validation failed',
        errors: formatZodErrors(parsed.error),
      };
      res.status(400).json(body);
      return;
    }

    const application = await applicationService.createApplication(
      parsed.data,
      req.user.id
    );

    const body: ApiSuccess<typeof application> = {
      success: true,
      message: 'Application submitted successfully.',
      data: application,
    };
    res.status(201).json(body);
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. GET /api/applications/:id (Student, Company Owner, or Admin)
// ─────────────────────────────────────────────────────────────────────────────

export async function getApplicationByIdController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const id = extractParam(req, 'id');
    const application = await applicationService.getApplicationById(id, {
      id: req.user.id,
      role: req.user.role,
    });

    const body: ApiSuccess<typeof application> = {
      success: true,
      data: application,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. GET /api/postings/:postingId/applications (Company Owner or Admin)
// ─────────────────────────────────────────────────────────────────────────────

export async function getPostingApplicationsController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const postingId = extractParam(req, 'postingId');
    const applications = await applicationService.getPostingApplications(postingId, {
      id: req.user.id,
      role: req.user.role,
    });

    const body: ApiSuccess<typeof applications> = {
      success: true,
      data: applications,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. PATCH /api/applications/:id/status (Company Owner or Admin)
// ─────────────────────────────────────────────────────────────────────────────

export async function updateApplicationStatusController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const id = extractParam(req, 'id');
    const parsed = updateApplicationStatusSchema.safeParse(req.body);
    if (!parsed.success) {
      const body: ApiError = {
        success: false,
        message: 'Validation failed',
        errors: formatZodErrors(parsed.error),
      };
      res.status(400).json(body);
      return;
    }

    const updated = await applicationService.updateApplicationStatus(
      id,
      parsed.data,
      {
        id: req.user.id,
        role: req.user.role,
      }
    );

    const body: ApiSuccess<typeof updated> = {
      success: true,
      message: 'Application status updated successfully.',
      data: updated,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. PATCH /api/applications/:id/withdraw (Student only)
// ─────────────────────────────────────────────────────────────────────────────

export async function withdrawApplicationController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const id = extractParam(req, 'id');
    const result = await applicationService.withdrawApplication(id, req.user.id);

    const body: ApiSuccess<typeof result> = {
      success: true,
      message: 'Application withdrawn successfully.',
      data: result,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}
