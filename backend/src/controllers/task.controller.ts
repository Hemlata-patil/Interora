import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as taskService from '../services/task.service';
import { AppError } from '../middleware/errorHandler';
import type { ApiSuccess, ApiError } from '../types';
import type { TaskStatus, PriorityLevel, SubmissionReviewStatus } from '@prisma/client';

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

const taskStatusEnum = z.enum(
  ['assigned', 'in_progress', 'submitted', 'reviewed', 'closed'],
  {
    errorMap: () => ({
      message: 'Status must be one of: assigned, in_progress, submitted, reviewed, closed',
    }),
  }
);

const priorityLevelEnum = z.enum(
  ['low', 'medium', 'high', 'urgent'],
  {
    errorMap: () => ({
      message: 'Priority must be one of: low, medium, high, urgent',
    }),
  }
);

const submissionReviewStatusEnum = z.enum(
  ['pending', 'verified', 'correction_required', 'rejected'],
  {
    errorMap: () => ({
      message: 'Review status must be one of: pending, verified, correction_required, rejected',
    }),
  }
);

const createTaskSchema = z.object({
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
    .max(255, 'Title cannot exceed 255 characters'),
  description: z.string().trim().max(5000).optional().nullable(),
  requiredSkills: z.array(z.string().trim()).optional(),
  priority: priorityLevelEnum.optional(),
  dueDate: z
    .string()
    .datetime({ offset: true })
    .or(z.string().regex(datePattern, 'Expected YYYY-MM-DD format'))
    .optional()
    .nullable(),
  status: taskStatusEnum.optional(),
});

const updateTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title cannot be empty')
    .max(255, 'Title cannot exceed 255 characters')
    .optional(),
  description: z.string().trim().max(5000).optional().nullable(),
  requiredSkills: z.array(z.string().trim()).optional(),
  priority: priorityLevelEnum.optional(),
  dueDate: z
    .string()
    .datetime({ offset: true })
    .or(z.string().regex(datePattern, 'Expected YYYY-MM-DD format'))
    .optional()
    .nullable(),
  status: taskStatusEnum.optional(),
});

const updateTaskStatusSchema = z.object({
  status: taskStatusEnum,
});

const createTaskSubmissionSchema = z.object({
  proofUrl: z
    .string({ required_error: 'proofUrl is required' })
    .trim()
    .min(1, 'proofUrl cannot be empty')
    .max(1000, 'proofUrl cannot exceed 1000 characters'),
  submissionText: z.string().trim().max(5000).optional().nullable(),
});

const reviewTaskSubmissionSchema = z.object({
  reviewStatus: submissionReviewStatusEnum,
  feedback: z.string().trim().max(2000).optional().nullable(),
});

// ─────────────────────────────────────────────────────────────────────────────
// 1. GET /api/tasks — List Tasks
// ─────────────────────────────────────────────────────────────────────────────

export async function listTasksController(
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
      priority,
      studentId,
      dueStartDate,
      dueEndDate,
    } = req.query;

    const filters: taskService.TaskFilters = {};

    if (typeof assignmentId === 'string' && UUID_REGEX.test(assignmentId)) {
      filters.assignmentId = assignmentId;
    }

    if (
      typeof status === 'string' &&
      ['assigned', 'in_progress', 'submitted', 'reviewed', 'closed'].includes(status)
    ) {
      filters.status = status as TaskStatus;
    }

    if (
      typeof priority === 'string' &&
      ['low', 'medium', 'high', 'urgent'].includes(priority)
    ) {
      filters.priority = priority as PriorityLevel;
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

    const tasks = await taskService.listTasks(filters, {
      id: req.user.id,
      role: req.user.role,
    });

    const body: ApiSuccess<typeof tasks> = {
      success: true,
      data: tasks,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. GET /api/tasks/:id — Get Task by ID
// ─────────────────────────────────────────────────────────────────────────────

export async function getTaskByIdController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const id = extractParam(req, 'id');
    const task = await taskService.getTaskById(id, {
      id: req.user.id,
      role: req.user.role,
    });

    const body: ApiSuccess<typeof task> = {
      success: true,
      data: task,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. POST /api/tasks — Create Task
// ─────────────────────────────────────────────────────────────────────────────

export async function createTaskController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const parsed = createTaskSchema.safeParse(req.body);
    if (!parsed.success) {
      const body: ApiError = {
        success: false,
        message: 'Validation failed',
        errors: formatZodErrors(parsed.error),
      };
      res.status(400).json(body);
      return;
    }

    const task = await taskService.createTask(parsed.data, {
      id: req.user.id,
      role: req.user.role,
    });

    const body: ApiSuccess<typeof task> = {
      success: true,
      message: 'Task created successfully.',
      data: task,
    };
    res.status(201).json(body);
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. PATCH /api/tasks/:id — Update Task
// ─────────────────────────────────────────────────────────────────────────────

export async function updateTaskController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const id = extractParam(req, 'id');
    const parsed = updateTaskSchema.safeParse(req.body);
    if (!parsed.success) {
      const body: ApiError = {
        success: false,
        message: 'Validation failed',
        errors: formatZodErrors(parsed.error),
      };
      res.status(400).json(body);
      return;
    }

    const task = await taskService.updateTask(id, parsed.data, {
      id: req.user.id,
      role: req.user.role,
    });

    const body: ApiSuccess<typeof task> = {
      success: true,
      message: 'Task updated successfully.',
      data: task,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. PATCH /api/tasks/:id/status — Update Task Status
// ─────────────────────────────────────────────────────────────────────────────

export async function updateTaskStatusController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const id = extractParam(req, 'id');
    const parsed = updateTaskStatusSchema.safeParse(req.body);
    if (!parsed.success) {
      const body: ApiError = {
        success: false,
        message: 'Validation failed',
        errors: formatZodErrors(parsed.error),
      };
      res.status(400).json(body);
      return;
    }

    const task = await taskService.updateTaskStatus(id, parsed.data, {
      id: req.user.id,
      role: req.user.role,
    });

    const body: ApiSuccess<typeof task> = {
      success: true,
      message: 'Task status updated successfully.',
      data: task,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. POST /api/tasks/:taskId/submissions — Create Task Submission
// ─────────────────────────────────────────────────────────────────────────────

export async function createTaskSubmissionController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const taskId = extractParam(req, 'taskId');
    const parsed = createTaskSubmissionSchema.safeParse(req.body);
    if (!parsed.success) {
      const body: ApiError = {
        success: false,
        message: 'Validation failed',
        errors: formatZodErrors(parsed.error),
      };
      res.status(400).json(body);
      return;
    }

    const submission = await taskService.createTaskSubmission(
      taskId,
      parsed.data,
      req.user.id
    );

    const body: ApiSuccess<typeof submission> = {
      success: true,
      message: 'Work submitted successfully.',
      data: submission,
    };
    res.status(201).json(body);
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. GET /api/tasks/:taskId/submissions — View Submissions
// ─────────────────────────────────────────────────────────────────────────────

export async function getTaskSubmissionsController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const taskId = extractParam(req, 'taskId');
    const submissions = await taskService.getTaskSubmissions(taskId, {
      id: req.user.id,
      role: req.user.role,
    });

    const body: ApiSuccess<typeof submissions> = {
      success: true,
      data: submissions,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. PATCH /api/tasks/:taskId/submissions/:submissionId — Review Submission
// ─────────────────────────────────────────────────────────────────────────────

export async function reviewTaskSubmissionController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const taskId = extractParam(req, 'taskId');
    const submissionId = extractParam(req, 'submissionId');
    const parsed = reviewTaskSubmissionSchema.safeParse(req.body);
    if (!parsed.success) {
      const body: ApiError = {
        success: false,
        message: 'Validation failed',
        errors: formatZodErrors(parsed.error),
      };
      res.status(400).json(body);
      return;
    }

    const submission = await taskService.reviewTaskSubmission(
      taskId,
      submissionId,
      parsed.data,
      {
        id: req.user.id,
        role: req.user.role,
      }
    );

    const body: ApiSuccess<typeof submission> = {
      success: true,
      message: 'Submission reviewed successfully.',
      data: submission,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}
