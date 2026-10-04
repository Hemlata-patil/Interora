import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as postingService from '../services/posting.service';
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

const createPostingSchema = z.object({
  title: z
    .string({ required_error: 'Title is required' })
    .trim()
    .min(1, 'Title cannot be empty')
    .max(200, 'Title cannot exceed 200 characters'),
  description: z
    .string({ required_error: 'Description is required' })
    .trim()
    .min(1, 'Description cannot be empty'),
  industryDomain: z
    .string({ required_error: 'Industry domain is required' })
    .trim()
    .min(1, 'Industry domain cannot be empty')
    .max(100, 'Industry domain cannot exceed 100 characters'),
  location: z
    .string()
    .trim()
    .max(150, 'Location cannot exceed 150 characters')
    .optional(),
  workMode: z.enum(['on_site', 'remote', 'hybrid'], {
    errorMap: () => ({ message: 'Work mode must be one of: on_site, remote, hybrid' }),
  }),
  internshipType: z.enum(['full_time', 'part_time'], {
    errorMap: () => ({ message: 'Internship type must be one of: full_time, part_time' }),
  }),
  duration: z
    .string({ required_error: 'Duration is required' })
    .trim()
    .min(1, 'Duration cannot be empty')
    .max(50, 'Duration cannot exceed 50 characters'),
  stipend: z
    .union([
      z.number().nonnegative('Stipend cannot be negative'),
      z.string().trim().max(100, 'Stipend cannot exceed 100 characters'),
    ])
    .optional()
    .transform((v) => (v !== undefined ? String(v) : undefined)),
  eligibility: z
    .string()
    .trim()
    .max(255, 'Eligibility cannot exceed 255 characters')
    .optional(),
  vacancies: z
    .number({ required_error: 'Vacancies count is required' })
    .int('Vacancies must be an integer')
    .positive('Vacancies must be at least 1'),
  skills: z
    .array(z.string().trim().min(1, 'Skill tag cannot be empty'))
    .optional(),
  applicationDeadline: z
    .string()
    .datetime({ offset: true })
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD format'))
    .optional()
    .nullable(),
  status: z.enum(['draft', 'open', 'closed', 'archived']).optional(),
  companyId: z.string().uuid('Invalid companyId format. Expected a valid UUID.').optional(),
});

const updatePostingSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title cannot be empty')
    .max(200, 'Title cannot exceed 200 characters')
    .optional(),
  description: z.string().trim().min(1, 'Description cannot be empty').optional(),
  industryDomain: z
    .string()
    .trim()
    .min(1, 'Industry domain cannot be empty')
    .max(100, 'Industry domain cannot exceed 100 characters')
    .optional(),
  location: z
    .string()
    .trim()
    .max(150, 'Location cannot exceed 150 characters')
    .optional(),
  workMode: z.enum(['on_site', 'remote', 'hybrid']).optional(),
  internshipType: z.enum(['full_time', 'part_time']).optional(),
  duration: z
    .string()
    .trim()
    .min(1, 'Duration cannot be empty')
    .max(50, 'Duration cannot exceed 50 characters')
    .optional(),
  stipend: z
    .union([
      z.number().nonnegative('Stipend cannot be negative'),
      z.string().trim().max(100, 'Stipend cannot exceed 100 characters'),
    ])
    .optional()
    .transform((v) => (v !== undefined ? String(v) : undefined)),
  eligibility: z
    .string()
    .trim()
    .max(255, 'Eligibility cannot exceed 255 characters')
    .optional(),
  vacancies: z
    .number()
    .int('Vacancies must be an integer')
    .positive('Vacancies must be at least 1')
    .optional(),
  skills: z
    .array(z.string().trim().min(1, 'Skill tag cannot be empty'))
    .optional(),
  applicationDeadline: z
    .string()
    .datetime({ offset: true })
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD format'))
    .optional()
    .nullable(),
  status: z.enum(['draft', 'open', 'closed', 'archived']).optional(),
  companyId: z.string().uuid('Invalid companyId format. Expected a valid UUID.').optional(),
});

const createTaskTemplateSchema = z.object({
  title: z
    .string({ required_error: 'Task template title is required' })
    .trim()
    .min(1, 'Title cannot be empty')
    .max(200, 'Title cannot exceed 200 characters'),
  description: z.string().trim().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  expectedDays: z.number().int().positive('expectedDays must be a positive integer').optional(),
});

const updateTaskTemplateSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title cannot be empty')
    .max(200, 'Title cannot exceed 200 characters')
    .optional(),
  description: z.string().trim().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  expectedDays: z.number().int().positive('expectedDays must be a positive integer').optional(),
});

const createMilestoneTemplateSchema = z.object({
  title: z
    .string({ required_error: 'Milestone template title is required' })
    .trim()
    .min(1, 'Title cannot be empty')
    .max(200, 'Title cannot exceed 200 characters'),
  description: z.string().trim().optional(),
  sequenceOrder: z
    .number({ required_error: 'sequenceOrder is required' })
    .int('sequenceOrder must be an integer')
    .positive('sequenceOrder must be greater than 0'),
});

const updateMilestoneTemplateSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title cannot be empty')
    .max(200, 'Title cannot exceed 200 characters')
    .optional(),
  description: z.string().trim().optional(),
  sequenceOrder: z
    .number()
    .int('sequenceOrder must be an integer')
    .positive('sequenceOrder must be greater than 0')
    .optional(),
});

// ─────────────────────────────────────────────────────────────────────────────
// 1. GET /api/postings
// ─────────────────────────────────────────────────────────────────────────────

export async function listMarketplacePostingsController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const industryDomain = typeof req.query.industryDomain === 'string' ? req.query.industryDomain : undefined;
    const workMode =
      req.query.workMode === 'on_site' || req.query.workMode === 'remote' || req.query.workMode === 'hybrid'
        ? req.query.workMode
        : undefined;
    const internshipType =
      req.query.internshipType === 'full_time' || req.query.internshipType === 'part_time'
        ? req.query.internshipType
        : undefined;
    const search = typeof req.query.search === 'string' ? req.query.search : undefined;
    const scope = req.query.scope === 'mine' ? 'mine' : undefined;
    const status = typeof req.query.status === 'string' ? (req.query.status as any) : undefined;
    const companyId = typeof req.query.companyId === 'string' ? req.query.companyId : undefined;

    const user = req.user ? { id: req.user.id, role: req.user.role } : undefined;

    const postings = await postingService.listMarketplacePostings(
      {
        industryDomain,
        workMode,
        internshipType,
        search,
        scope,
        status,
        companyId,
      },
      user
    );

    const body: ApiSuccess<typeof postings> = {
      success: true,
      data: postings,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. GET /api/postings/:id
// ─────────────────────────────────────────────────────────────────────────────

export async function getPostingByIdController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = extractParam(req, 'id');
    const user = req.user ? { id: req.user.id, role: req.user.role } : undefined;

    const posting = await postingService.getPostingById(id, user);

    const body: ApiSuccess<typeof posting> = {
      success: true,
      data: posting,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. POST /api/postings (Company or Admin)
// ─────────────────────────────────────────────────────────────────────────────

export async function createPostingController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const parsed = createPostingSchema.safeParse(req.body);
    if (!parsed.success) {
      const body: ApiError = {
        success: false,
        message: 'Validation failed',
        errors: formatZodErrors(parsed.error),
      };
      res.status(400).json(body);
      return;
    }

    const posting = await postingService.createPosting(parsed.data, {
      id: req.user.id,
      role: req.user.role,
    });

    const body: ApiSuccess<typeof posting> = {
      success: true,
      message: 'Internship posting created successfully.',
      data: posting,
    };
    res.status(201).json(body);
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. PATCH /api/postings/:id (Company Owner or Admin)
// ─────────────────────────────────────────────────────────────────────────────

export async function updatePostingController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const id = extractParam(req, 'id');
    const parsed = updatePostingSchema.safeParse(req.body);
    if (!parsed.success) {
      const body: ApiError = {
        success: false,
        message: 'Validation failed',
        errors: formatZodErrors(parsed.error),
      };
      res.status(400).json(body);
      return;
    }

    const updated = await postingService.updatePosting(id, parsed.data, {
      id: req.user.id,
      role: req.user.role,
    });

    const body: ApiSuccess<typeof updated> = {
      success: true,
      message: 'Internship posting updated successfully.',
      data: updated,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. DELETE /api/postings/:id (Company Owner or Admin)
// ─────────────────────────────────────────────────────────────────────────────

export async function deletePostingController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const id = extractParam(req, 'id');
    const result = await postingService.deletePosting(id, {
      id: req.user.id,
      role: req.user.role,
    });

    const body: ApiSuccess<typeof result> = {
      success: true,
      message: 'Internship posting deleted successfully.',
      data: result,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Task Template Handlers
// ─────────────────────────────────────────────────────────────────────────────

export async function createTaskTemplateController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const postingId = extractParam(req, 'postingId');
    const parsed = createTaskTemplateSchema.safeParse(req.body);
    if (!parsed.success) {
      const body: ApiError = {
        success: false,
        message: 'Validation failed',
        errors: formatZodErrors(parsed.error),
      };
      res.status(400).json(body);
      return;
    }

    const template = await postingService.createTaskTemplate(postingId, parsed.data, {
      id: req.user.id,
      role: req.user.role,
    });

    const body: ApiSuccess<typeof template> = {
      success: true,
      message: 'Task template created successfully.',
      data: template,
    };
    res.status(201).json(body);
  } catch (err) {
    next(err);
  }
}

export async function updateTaskTemplateController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const postingId = extractParam(req, 'postingId');
    const templateId = extractParam(req, 'templateId');

    const parsed = updateTaskTemplateSchema.safeParse(req.body);
    if (!parsed.success) {
      const body: ApiError = {
        success: false,
        message: 'Validation failed',
        errors: formatZodErrors(parsed.error),
      };
      res.status(400).json(body);
      return;
    }

    const updated = await postingService.updateTaskTemplate(
      postingId,
      templateId,
      parsed.data,
      {
        id: req.user.id,
        role: req.user.role,
      }
    );

    const body: ApiSuccess<typeof updated> = {
      success: true,
      message: 'Task template updated successfully.',
      data: updated,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

export async function deleteTaskTemplateController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const postingId = extractParam(req, 'postingId');
    const templateId = extractParam(req, 'templateId');

    const result = await postingService.deleteTaskTemplate(postingId, templateId, {
      id: req.user.id,
      role: req.user.role,
    });

    const body: ApiSuccess<typeof result> = {
      success: true,
      message: 'Task template deleted successfully.',
      data: result,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. Milestone Template Handlers
// ─────────────────────────────────────────────────────────────────────────────

export async function createMilestoneTemplateController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const postingId = extractParam(req, 'postingId');
    const parsed = createMilestoneTemplateSchema.safeParse(req.body);
    if (!parsed.success) {
      const body: ApiError = {
        success: false,
        message: 'Validation failed',
        errors: formatZodErrors(parsed.error),
      };
      res.status(400).json(body);
      return;
    }

    const template = await postingService.createMilestoneTemplate(postingId, parsed.data, {
      id: req.user.id,
      role: req.user.role,
    });

    const body: ApiSuccess<typeof template> = {
      success: true,
      message: 'Milestone template created successfully.',
      data: template,
    };
    res.status(201).json(body);
  } catch (err) {
    next(err);
  }
}

export async function updateMilestoneTemplateController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const postingId = extractParam(req, 'postingId');
    const templateId = extractParam(req, 'templateId');

    const parsed = updateMilestoneTemplateSchema.safeParse(req.body);
    if (!parsed.success) {
      const body: ApiError = {
        success: false,
        message: 'Validation failed',
        errors: formatZodErrors(parsed.error),
      };
      res.status(400).json(body);
      return;
    }

    const updated = await postingService.updateMilestoneTemplate(
      postingId,
      templateId,
      parsed.data,
      {
        id: req.user.id,
        role: req.user.role,
      }
    );

    const body: ApiSuccess<typeof updated> = {
      success: true,
      message: 'Milestone template updated successfully.',
      data: updated,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

export async function deleteMilestoneTemplateController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const postingId = extractParam(req, 'postingId');
    const templateId = extractParam(req, 'templateId');

    const result = await postingService.deleteMilestoneTemplate(postingId, templateId, {
      id: req.user.id,
      role: req.user.role,
    });

    const body: ApiSuccess<typeof result> = {
      success: true,
      message: 'Milestone template deleted successfully.',
      data: result,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}
