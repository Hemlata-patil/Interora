import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as ppoService from '../services/ppoOffer.service';
import { AppError } from '../middleware/errorHandler';
import type { ApiSuccess, ApiError } from '../types';
import type { PPOStatus, AdminApprovalStatus, StudentResponseStatus } from '@prisma/client';

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

const ppoStatusEnum = z.enum(['draft', 'offered', 'under_consideration', 'not_converted'], {
  errorMap: () => ({ message: 'status must be one of: draft, offered, under_consideration, not_converted' }),
});

const adminApprovalEnum = z.enum(['pending', 'approved', 'rejected'], {
  errorMap: () => ({ message: 'adminApprovalStatus must be one of: pending, approved, rejected' }),
});

const studentResponseEnum = z.enum(['accepted', 'declined'], {
  errorMap: () => ({ message: "response must be 'accepted' or 'declined'" }),
});

const createPPOOfferSchema = z.object({
  assignmentId: z
    .string({ required_error: 'assignmentId is required' })
    .uuid('Invalid assignmentId format. Expected a valid UUID.'),
  studentId: z
    .string()
    .uuid('Invalid studentId format. Expected a valid UUID.')
    .optional(),
  positionTitle: z
    .string({ required_error: 'positionTitle is required' })
    .trim()
    .min(1, 'positionTitle cannot be empty')
    .max(150, 'positionTitle cannot exceed 150 characters'),
  salaryPackage: z
    .string({ required_error: 'salaryPackage is required' })
    .trim()
    .min(1, 'salaryPackage cannot be empty')
    .max(100, 'salaryPackage cannot exceed 100 characters'),
  joiningDate: z
    .string()
    .datetime({ offset: true })
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD format'))
    .optional()
    .nullable(),
  location: z.string().trim().max(150, 'location cannot exceed 150 characters').optional().nullable(),
  bondTerms: z.string().trim().max(2000, 'bondTerms cannot exceed 2000 characters').optional().nullable(),
  offerLetterUrl: z.string().trim().url('offerLetterUrl must be a valid URL').optional().nullable(),
  status: ppoStatusEnum.optional(),
});

const updatePPOOfferSchema = z.object({
  positionTitle: z
    .string()
    .trim()
    .min(1, 'positionTitle cannot be empty')
    .max(150, 'positionTitle cannot exceed 150 characters')
    .optional(),
  salaryPackage: z
    .string()
    .trim()
    .min(1, 'salaryPackage cannot be empty')
    .max(100, 'salaryPackage cannot exceed 100 characters')
    .optional(),
  joiningDate: z
    .string()
    .datetime({ offset: true })
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD format'))
    .optional()
    .nullable(),
  location: z.string().trim().max(150, 'location cannot exceed 150 characters').optional().nullable(),
  bondTerms: z.string().trim().max(2000, 'bondTerms cannot exceed 2000 characters').optional().nullable(),
  offerLetterUrl: z.string().trim().url('offerLetterUrl must be a valid URL').optional().nullable(),
  status: ppoStatusEnum.optional(),
  adminApprovalStatus: adminApprovalEnum.optional(),
});

const respondPPOOfferSchema = z.object({
  response: studentResponseEnum,
});

// ─────────────────────────────────────────────────────────────────────────────
// Controllers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/ppo-offers — List PPO offers scoped to user role.
 */
export async function listPPOOffersController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const {
      studentId,
      companyId,
      assignmentId,
      status,
      adminApprovalStatus,
      studentResponse,
    } = req.query;

    const filters: ppoService.PPOOfferFilters = {};

    if (typeof studentId === 'string' && UUID_REGEX.test(studentId)) {
      filters.studentId = studentId;
    }

    if (typeof companyId === 'string' && UUID_REGEX.test(companyId)) {
      filters.companyId = companyId;
    }

    if (typeof assignmentId === 'string' && UUID_REGEX.test(assignmentId)) {
      filters.assignmentId = assignmentId;
    }

    if (
      typeof status === 'string' &&
      ['draft', 'offered', 'under_consideration', 'not_converted'].includes(status)
    ) {
      filters.status = status as PPOStatus;
    }

    if (
      typeof adminApprovalStatus === 'string' &&
      ['pending', 'approved', 'rejected'].includes(adminApprovalStatus)
    ) {
      filters.adminApprovalStatus = adminApprovalStatus as AdminApprovalStatus;
    }

    if (
      typeof studentResponse === 'string' &&
      ['pending', 'accepted', 'declined'].includes(studentResponse)
    ) {
      filters.studentResponse = studentResponse as StudentResponseStatus;
    }

    const offers = await ppoService.listPPOOffers(filters, {
      id: req.user.id,
      role: req.user.role,
    });

    const body: ApiSuccess<typeof offers> = {
      success: true,
      data: offers,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/ppo-offers/:id — Get a single PPO offer.
 */
export async function getPPOOfferByIdController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const id = extractParam(req, 'id');
    const offer = await ppoService.getPPOOfferById(id, {
      id: req.user.id,
      role: req.user.role,
    });

    const body: ApiSuccess<typeof offer> = {
      success: true,
      data: offer,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/ppo-offers — Create a new PPO offer.
 */
export async function createPPOOfferController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const parsed = createPPOOfferSchema.safeParse(req.body);
    if (!parsed.success) {
      const body: ApiError = {
        success: false,
        message: 'Validation failed',
        errors: formatZodErrors(parsed.error),
      };
      res.status(400).json(body);
      return;
    }

    const offer = await ppoService.createPPOOffer(parsed.data, {
      id: req.user.id,
      role: req.user.role,
    });

    const body: ApiSuccess<typeof offer> = {
      success: true,
      message: 'PPO offer created successfully.',
      data: offer,
    };
    res.status(201).json(body);
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/ppo-offers/:id — Update PPO offer terms or status.
 */
export async function updatePPOOfferController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const id = extractParam(req, 'id');
    const parsed = updatePPOOfferSchema.safeParse(req.body);
    if (!parsed.success) {
      const body: ApiError = {
        success: false,
        message: 'Validation failed',
        errors: formatZodErrors(parsed.error),
      };
      res.status(400).json(body);
      return;
    }

    const offer = await ppoService.updatePPOOffer(id, parsed.data, {
      id: req.user.id,
      role: req.user.role,
    });

    const body: ApiSuccess<typeof offer> = {
      success: true,
      message: 'PPO offer updated successfully.',
      data: offer,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/ppo-offers/:id/respond — Student accepts or declines the offer.
 */
export async function respondToPPOOfferController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const id = extractParam(req, 'id');
    const parsed = respondPPOOfferSchema.safeParse(req.body);
    if (!parsed.success) {
      const body: ApiError = {
        success: false,
        message: 'Validation failed',
        errors: formatZodErrors(parsed.error),
      };
      res.status(400).json(body);
      return;
    }

    const offer = await ppoService.respondToPPOOffer(id, parsed.data, {
      id: req.user.id,
      role: req.user.role,
    });

    const body: ApiSuccess<typeof offer> = {
      success: true,
      message: `PPO offer successfully ${parsed.data.response}.`,
      data: offer,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/ppo-offers/:id — Delete a PPO offer (draft only or admin).
 */
export async function deletePPOOfferController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const id = extractParam(req, 'id');
    const deleted = await ppoService.deletePPOOffer(id, {
      id: req.user.id,
      role: req.user.role,
    });

    const body: ApiSuccess<typeof deleted> = {
      success: true,
      message: `PPO offer '${deleted.positionTitle}' deleted successfully.`,
      data: deleted,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}
