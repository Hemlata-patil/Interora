import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as mentorService from '../services/mentor.service';
import { AppError } from '../middleware/errorHandler';
import type { ApiSuccess, ApiError } from '../types';

// ── Validation Helpers & Schemas ──────────────────────────────────────────────

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function extractTaskIdParam(req: Request): string {
  const rawId = req.params.taskId;
  const taskId = Array.isArray(rawId) ? rawId[0] : rawId;
  if (!taskId || !UUID_REGEX.test(taskId)) {
    throw new AppError(400, 'Invalid task ID parameter. Must be a valid UUID.');
  }
  return taskId;
}

const updateTaskReviewSchema = z.object({
  reviewStatus: z
    .string({ required_error: 'reviewStatus is required' })
    .trim()
    .min(1, 'reviewStatus cannot be empty'),
  feedback: z.string().trim().max(2000).optional().nullable(),
});

function formatZodErrors(error: z.ZodError): Record<string, string[]> {
  const errors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const field = issue.path.join('.') || '_';
    if (!errors[field]) errors[field] = [];
    errors[field].push(issue.message);
  }
  return errors;
}

// ── Controllers ───────────────────────────────────────────────────────────────

/** GET /api/mentor/metrics */
export async function getMentorDashboardMetricsController(
  req: Request,
  res: Response<ApiSuccess>,
  next: NextFunction
): Promise<void> {
  try {
    const user = req.user!;
    const data = await mentorService.getMentorDashboardMetrics(user);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

/** GET /api/mentor/interns */
export async function getMentorInternsController(
  req: Request,
  res: Response<ApiSuccess>,
  next: NextFunction
): Promise<void> {
  try {
    const user = req.user!;
    const data = await mentorService.getMentorInterns(user);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

/** GET /api/mentor/tasks */
export async function getMentorTasksController(
  req: Request,
  res: Response<ApiSuccess>,
  next: NextFunction
): Promise<void> {
  try {
    const user = req.user!;
    const data = await mentorService.getMentorTasks(user);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

/** POST / PATCH /api/mentor/tasks/:taskId/review */
export async function updateMentorTaskReviewController(
  req: Request,
  res: Response<ApiSuccess | ApiError>,
  next: NextFunction
): Promise<void> {
  try {
    const taskId = extractTaskIdParam(req);
    const parsed = updateTaskReviewSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: formatZodErrors(parsed.error),
      });
      return;
    }

    const user = req.user!;
    const data = await mentorService.updateMentorTaskReview(taskId, parsed.data, user);
    res.status(200).json({
      success: true,
      message: 'Task review updated successfully.',
      data,
    });
  } catch (err) {
    next(err);
  }
}
