import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as evaluationService from '../services/evaluation.service';
import { AppError } from '../middleware/errorHandler';
import type { ApiSuccess, ApiError } from '../types';
import type { EvaluationType, EvaluationStatus } from '@prisma/client';

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

const evaluationTypeEnum = z.enum(['mid_term', 'final'], {
  errorMap: () => ({ message: 'evaluationType must be mid_term or final' }),
});

const evaluationStatusEnum = z.enum(
  ['draft', 'submitted', 'pending_verification', 'verified', 'correction_required'],
  {
    errorMap: () => ({
      message:
        'status must be one of: draft, submitted, pending_verification, verified, correction_required',
    }),
  }
);

const scoreDimension = z
  .number({ required_error: 'Score is required' })
  .int('Score must be an integer')
  .min(1, 'Score must be at least 1')
  .max(5, 'Score cannot exceed 5');

const optionalScoreDimension = z
  .number()
  .int('Score must be an integer')
  .min(1, 'Score must be at least 1')
  .max(5, 'Score cannot exceed 5')
  .optional();

const createEvaluationSchema = z.object({
  assignmentId: z
    .string({ required_error: 'assignmentId is required' })
    .uuid('Invalid assignmentId format. Expected a valid UUID.'),
  evaluationType: evaluationTypeEnum,
  evaluationPeriod: z
    .string({ required_error: 'evaluationPeriod is required' })
    .trim()
    .min(1, 'evaluationPeriod cannot be empty')
    .max(50, 'evaluationPeriod cannot exceed 50 characters'),
  technicalSkills: scoreDimension,
  qualityOfWork: scoreDimension,
  problemSolving: scoreDimension,
  communication: scoreDimension,
  teamwork: scoreDimension,
  professionalism: scoreDimension,
  timeManagement: scoreDimension,
  initiative: scoreDimension,
  overallRating: z.number().min(1).max(5).optional(),
  strengths: z.string().trim().max(2000).optional().nullable(),
  improvementAreas: z.string().trim().max(2000).optional().nullable(),
  comments: z.string().trim().max(2000).optional().nullable(),
  status: evaluationStatusEnum.optional(),
});

const updateEvaluationSchema = z.object({
  evaluationPeriod: z
    .string()
    .trim()
    .min(1, 'evaluationPeriod cannot be empty')
    .max(50, 'evaluationPeriod cannot exceed 50 characters')
    .optional(),
  technicalSkills: optionalScoreDimension,
  qualityOfWork: optionalScoreDimension,
  problemSolving: optionalScoreDimension,
  communication: optionalScoreDimension,
  teamwork: optionalScoreDimension,
  professionalism: optionalScoreDimension,
  timeManagement: optionalScoreDimension,
  initiative: optionalScoreDimension,
  overallRating: z.number().min(1).max(5).optional(),
  strengths: z.string().trim().max(2000).optional().nullable(),
  improvementAreas: z.string().trim().max(2000).optional().nullable(),
  comments: z.string().trim().max(2000).optional().nullable(),
  discrepancyNotes: z.string().trim().max(2000).optional().nullable(),
});

const updateEvaluationStatusSchema = z.object({
  status: evaluationStatusEnum,
  discrepancyNotes: z.string().trim().max(2000).optional().nullable(),
});

// ─────────────────────────────────────────────────────────────────────────────
// 1. GET /api/evaluations — List Evaluations
// ─────────────────────────────────────────────────────────────────────────────

export async function listEvaluationsController(
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
      evaluationType,
      status,
      crossVerified,
    } = req.query;

    const filters: evaluationService.EvaluationFilters = {};

    if (typeof assignmentId === 'string' && UUID_REGEX.test(assignmentId)) {
      filters.assignmentId = assignmentId;
    }

    if (typeof studentId === 'string' && UUID_REGEX.test(studentId)) {
      filters.studentId = studentId;
    }

    if (
      typeof evaluationType === 'string' &&
      ['mid_term', 'final'].includes(evaluationType)
    ) {
      filters.evaluationType = evaluationType as EvaluationType;
    }

    if (
      typeof status === 'string' &&
      [
        'draft',
        'submitted',
        'pending_verification',
        'verified',
        'correction_required',
      ].includes(status)
    ) {
      filters.status = status as EvaluationStatus;
    }

    if (crossVerified === 'true') {
      filters.crossVerified = true;
    } else if (crossVerified === 'false') {
      filters.crossVerified = false;
    }

    const evaluations = await evaluationService.listEvaluations(filters, {
      id: req.user.id,
      role: req.user.role,
    });

    const body: ApiSuccess<typeof evaluations> = {
      success: true,
      data: evaluations,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. GET /api/evaluations/:id — Get Evaluation by ID
// ─────────────────────────────────────────────────────────────────────────────

export async function getEvaluationByIdController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const id = extractParam(req, 'id');
    const evaluation = await evaluationService.getEvaluationById(id, {
      id: req.user.id,
      role: req.user.role,
    });

    const body: ApiSuccess<typeof evaluation> = {
      success: true,
      data: evaluation,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. POST /api/evaluations — Create Evaluation
// ─────────────────────────────────────────────────────────────────────────────

export async function createEvaluationController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const parsed = createEvaluationSchema.safeParse(req.body);
    if (!parsed.success) {
      const body: ApiError = {
        success: false,
        message: 'Validation failed',
        errors: formatZodErrors(parsed.error),
      };
      res.status(400).json(body);
      return;
    }

    const evaluation = await evaluationService.createEvaluation(parsed.data, {
      id: req.user.id,
      role: req.user.role,
    });

    const body: ApiSuccess<typeof evaluation> = {
      success: true,
      message: 'Evaluation created successfully.',
      data: evaluation,
    };
    res.status(201).json(body);
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. PATCH /api/evaluations/:id — Update Evaluation
// ─────────────────────────────────────────────────────────────────────────────

export async function updateEvaluationController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const id = extractParam(req, 'id');
    const parsed = updateEvaluationSchema.safeParse(req.body);
    if (!parsed.success) {
      const body: ApiError = {
        success: false,
        message: 'Validation failed',
        errors: formatZodErrors(parsed.error),
      };
      res.status(400).json(body);
      return;
    }

    const evaluation = await evaluationService.updateEvaluation(id, parsed.data, {
      id: req.user.id,
      role: req.user.role,
    });

    const body: ApiSuccess<typeof evaluation> = {
      success: true,
      message: 'Evaluation updated successfully.',
      data: evaluation,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. PATCH /api/evaluations/:id/status — Update Evaluation Status
// ─────────────────────────────────────────────────────────────────────────────

export async function updateEvaluationStatusController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const id = extractParam(req, 'id');
    const parsed = updateEvaluationStatusSchema.safeParse(req.body);
    if (!parsed.success) {
      const body: ApiError = {
        success: false,
        message: 'Validation failed',
        errors: formatZodErrors(parsed.error),
      };
      res.status(400).json(body);
      return;
    }

    const evaluation = await evaluationService.updateEvaluationStatus(
      id,
      parsed.data,
      {
        id: req.user.id,
        role: req.user.role,
      }
    );

    const body: ApiSuccess<typeof evaluation> = {
      success: true,
      message: 'Evaluation status updated successfully.',
      data: evaluation,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. DELETE /api/evaluations/:id — Delete Evaluation
// ─────────────────────────────────────────────────────────────────────────────

export async function deleteEvaluationController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const id = extractParam(req, 'id');
    const result = await evaluationService.deleteEvaluation(id, {
      id: req.user.id,
      role: req.user.role,
    });

    const body: ApiSuccess<typeof result> = {
      success: true,
      message: 'Evaluation deleted successfully.',
      data: result,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}
