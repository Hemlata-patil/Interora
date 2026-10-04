import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as learningService from '../services/learningResource.service';
import { AppError } from '../middleware/errorHandler';
import type { ApiSuccess, ApiError } from '../types';

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

const createLearningResourceSchema = z.object({
  title: z
    .string({ required_error: 'title is required' })
    .trim()
    .min(1, 'title cannot be empty')
    .max(200, 'title cannot exceed 200 characters'),
  category: z
    .string({ required_error: 'category is required' })
    .trim()
    .min(1, 'category cannot be empty')
    .max(100, 'category cannot exceed 100 characters'),
  resourceType: z
    .string({ required_error: 'resourceType is required' })
    .trim()
    .min(1, 'resourceType cannot be empty')
    .max(50, 'resourceType cannot exceed 50 characters'),
  skillTag: z
    .string({ required_error: 'skillTag is required' })
    .trim()
    .min(1, 'skillTag cannot be empty')
    .max(100, 'skillTag cannot exceed 100 characters'),
  url: z
    .string({ required_error: 'url is required' })
    .trim()
    .url('url must be a valid URL'),
  description: z.string().trim().max(2000, 'description cannot exceed 2000 characters').optional().nullable(),
  isFree: z.boolean().optional(),
});

const updateLearningResourceSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'title cannot be empty')
    .max(200, 'title cannot exceed 200 characters')
    .optional(),
  category: z
    .string()
    .trim()
    .min(1, 'category cannot be empty')
    .max(100, 'category cannot exceed 100 characters')
    .optional(),
  resourceType: z
    .string()
    .trim()
    .min(1, 'resourceType cannot be empty')
    .max(50, 'resourceType cannot exceed 50 characters')
    .optional(),
  skillTag: z
    .string()
    .trim()
    .min(1, 'skillTag cannot be empty')
    .max(100, 'skillTag cannot exceed 100 characters')
    .optional(),
  url: z.string().trim().url('url must be a valid URL').optional(),
  description: z.string().trim().max(2000, 'description cannot exceed 2000 characters').optional().nullable(),
  isFree: z.boolean().optional(),
});

const createProgressSchema = z.object({
  resourceId: z
    .string({ required_error: 'resourceId is required' })
    .uuid('Invalid resourceId format. Expected a valid UUID.'),
  studentId: z
    .string()
    .uuid('Invalid studentId format. Expected a valid UUID.')
    .optional(),
  status: z
    .string()
    .trim()
    .min(1, 'status cannot be empty')
    .max(30, 'status cannot exceed 30 characters')
    .optional(),
  progressPercent: z
    .number()
    .int('progressPercent must be an integer')
    .min(0, 'progressPercent must be between 0 and 100')
    .max(100, 'progressPercent must be between 0 and 100')
    .optional(),
  completedAt: z
    .string()
    .datetime({ offset: true })
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD format'))
    .optional()
    .nullable(),
});

const updateProgressSchema = z.object({
  status: z
    .string()
    .trim()
    .min(1, 'status cannot be empty')
    .max(30, 'status cannot exceed 30 characters')
    .optional(),
  progressPercent: z
    .number()
    .int('progressPercent must be an integer')
    .min(0, 'progressPercent must be between 0 and 100')
    .max(100, 'progressPercent must be between 0 and 100')
    .optional(),
  completedAt: z
    .string()
    .datetime({ offset: true })
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD format'))
    .optional()
    .nullable(),
});

const upsertProgressSchema = z.object({
  studentId: z
    .string()
    .uuid('Invalid studentId format. Expected a valid UUID.')
    .optional(),
  status: z
    .string()
    .trim()
    .min(1, 'status cannot be empty')
    .max(30, 'status cannot exceed 30 characters')
    .optional(),
  progressPercent: z
    .number()
    .int('progressPercent must be an integer')
    .min(0, 'progressPercent must be between 0 and 100')
    .max(100, 'progressPercent must be between 0 and 100')
    .optional(),
  completedAt: z
    .string()
    .datetime({ offset: true })
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD format'))
    .optional()
    .nullable(),
});

// ─────────────────────────────────────────────────────────────────────────────
// 1. Learning Resource Catalog Handlers
// ─────────────────────────────────────────────────────────────────────────────

export async function listLearningResourcesController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const { category, resourceType, skillTag, isFree, search } = req.query;

    const filters: learningService.LearningResourceFilters = {};

    if (typeof category === 'string' && category.trim()) {
      filters.category = category.trim();
    }

    if (typeof resourceType === 'string' && resourceType.trim()) {
      filters.resourceType = resourceType.trim();
    }

    if (typeof skillTag === 'string' && skillTag.trim()) {
      filters.skillTag = skillTag.trim();
    }

    if (isFree === 'true') {
      filters.isFree = true;
    } else if (isFree === 'false') {
      filters.isFree = false;
    }

    if (typeof search === 'string' && search.trim()) {
      filters.search = search.trim();
    }

    const resources = await learningService.listLearningResources(filters, {
      id: req.user.id,
      role: req.user.role,
    });

    const body: ApiSuccess<typeof resources> = {
      success: true,
      data: resources,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

export async function getLearningResourceByIdController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const id = extractParam(req, 'id');
    const resource = await learningService.getLearningResourceById(id, {
      id: req.user.id,
      role: req.user.role,
    });

    const body: ApiSuccess<typeof resource> = {
      success: true,
      data: resource,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

export async function createLearningResourceController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const parsed = createLearningResourceSchema.safeParse(req.body);
    if (!parsed.success) {
      const body: ApiError = {
        success: false,
        message: 'Validation failed',
        errors: formatZodErrors(parsed.error),
      };
      res.status(400).json(body);
      return;
    }

    const resource = await learningService.createLearningResource(parsed.data, {
      id: req.user.id,
      role: req.user.role,
    });

    const body: ApiSuccess<typeof resource> = {
      success: true,
      message: 'Learning resource created successfully.',
      data: resource,
    };
    res.status(201).json(body);
  } catch (err) {
    next(err);
  }
}

export async function updateLearningResourceController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const id = extractParam(req, 'id');
    const parsed = updateLearningResourceSchema.safeParse(req.body);
    if (!parsed.success) {
      const body: ApiError = {
        success: false,
        message: 'Validation failed',
        errors: formatZodErrors(parsed.error),
      };
      res.status(400).json(body);
      return;
    }

    const resource = await learningService.updateLearningResource(id, parsed.data, {
      id: req.user.id,
      role: req.user.role,
    });

    const body: ApiSuccess<typeof resource> = {
      success: true,
      message: 'Learning resource updated successfully.',
      data: resource,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

export async function deleteLearningResourceController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const id = extractParam(req, 'id');
    const deleted = await learningService.deleteLearningResource(id, {
      id: req.user.id,
      role: req.user.role,
    });

    const body: ApiSuccess<typeof deleted> = {
      success: true,
      message: `Learning resource '${deleted.title}' deleted successfully.`,
      data: deleted,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Student Learning Progress Handlers
// ─────────────────────────────────────────────────────────────────────────────

export async function listStudentLearningProgressController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const { studentId, resourceId, status } = req.query;

    const filters: learningService.ProgressFilters = {};

    if (typeof studentId === 'string' && UUID_REGEX.test(studentId)) {
      filters.studentId = studentId;
    }

    if (typeof resourceId === 'string' && UUID_REGEX.test(resourceId)) {
      filters.resourceId = resourceId;
    }

    if (typeof status === 'string' && status.trim()) {
      filters.status = status.trim();
    }

    const records = await learningService.listStudentLearningProgress(filters, {
      id: req.user.id,
      role: req.user.role,
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

export async function getMyLearningProgressController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    if (req.user.role !== 'student') {
      throw new AppError(403, 'This endpoint is for students only. Use GET /api/learning-progress instead.');
    }

    const { resourceId, status } = req.query;
    const filters: learningService.ProgressFilters = {
      studentId: req.user.id,
    };

    if (typeof resourceId === 'string' && UUID_REGEX.test(resourceId)) {
      filters.resourceId = resourceId;
    }

    if (typeof status === 'string' && status.trim()) {
      filters.status = status.trim();
    }

    const records = await learningService.listStudentLearningProgress(filters, {
      id: req.user.id,
      role: req.user.role,
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

export async function getStudentLearningProgressByIdController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const id = extractParam(req, 'id');
    const record = await learningService.getStudentLearningProgressById(id, {
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

export async function createStudentLearningProgressController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const parsed = createProgressSchema.safeParse(req.body);
    if (!parsed.success) {
      const body: ApiError = {
        success: false,
        message: 'Validation failed',
        errors: formatZodErrors(parsed.error),
      };
      res.status(400).json(body);
      return;
    }

    const record = await learningService.createStudentLearningProgress(parsed.data, {
      id: req.user.id,
      role: req.user.role,
    });

    const body: ApiSuccess<typeof record> = {
      success: true,
      message: 'Learning progress recorded successfully.',
      data: record,
    };
    res.status(201).json(body);
  } catch (err) {
    next(err);
  }
}

export async function upsertResourceProgressController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const resourceId = extractParam(req, 'resourceId');
    const parsed = upsertProgressSchema.safeParse(req.body);
    if (!parsed.success) {
      const body: ApiError = {
        success: false,
        message: 'Validation failed',
        errors: formatZodErrors(parsed.error),
      };
      res.status(400).json(body);
      return;
    }

    const record = await learningService.upsertStudentLearningProgress(
      resourceId,
      parsed.data,
      {
        id: req.user.id,
        role: req.user.role,
      }
    );

    const body: ApiSuccess<typeof record> = {
      success: true,
      message: 'Learning progress updated successfully.',
      data: record,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

export async function updateStudentLearningProgressController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const id = extractParam(req, 'id');
    const parsed = updateProgressSchema.safeParse(req.body);
    if (!parsed.success) {
      const body: ApiError = {
        success: false,
        message: 'Validation failed',
        errors: formatZodErrors(parsed.error),
      };
      res.status(400).json(body);
      return;
    }

    const record = await learningService.updateStudentLearningProgress(
      id,
      parsed.data,
      {
        id: req.user.id,
        role: req.user.role,
      }
    );

    const body: ApiSuccess<typeof record> = {
      success: true,
      message: 'Learning progress updated successfully.',
      data: record,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

export async function deleteStudentLearningProgressController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const id = extractParam(req, 'id');
    const deleted = await learningService.deleteStudentLearningProgress(id, {
      id: req.user.id,
      role: req.user.role,
    });

    const body: ApiSuccess<typeof deleted> = {
      success: true,
      message: 'Learning progress record deleted successfully.',
      data: deleted,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}
