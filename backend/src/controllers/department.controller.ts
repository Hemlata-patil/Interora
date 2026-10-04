import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as departmentService from '../services/department.service';
import { AppError } from '../middleware/errorHandler';
import type { ApiSuccess, ApiError } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// Department Controller — request parsing, validation, and HTTP dispatching.
// ─────────────────────────────────────────────────────────────────────────────

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function extractIdParam(req: Request): string {
  const raw = req.params.id;
  const id = Array.isArray(raw) ? raw[0] : raw;
  if (!id || !UUID_REGEX.test(id)) {
    throw new AppError(400, 'Invalid department ID format. Expected a valid UUID.');
  }
  return id;
}

// ── Validation schemas ────────────────────────────────────────────────────────

const createDepartmentSchema = z.object({
  code: z
    .string({ required_error: 'Department code is required' })
    .trim()
    .min(1, 'Department code cannot be empty')
    .max(20, 'Department code cannot exceed 20 characters'),
  name: z
    .string({ required_error: 'Department name is required' })
    .trim()
    .min(1, 'Department name cannot be empty')
    .max(150, 'Department name cannot exceed 150 characters'),
  program: z
    .string()
    .trim()
    .max(50, 'Program cannot exceed 50 characters')
    .optional(),
  headOfDepartmentId: z
    .string()
    .uuid('Invalid headOfDepartmentId format. Expected a valid UUID.')
    .nullable()
    .optional(),
});

const updateDepartmentSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, 'Department code cannot be empty')
    .max(20, 'Department code cannot exceed 20 characters')
    .optional(),
  name: z
    .string()
    .trim()
    .min(1, 'Department name cannot be empty')
    .max(150, 'Department name cannot exceed 150 characters')
    .optional(),
  program: z
    .string()
    .trim()
    .max(50, 'Program cannot exceed 50 characters')
    .optional(),
  headOfDepartmentId: z
    .string()
    .uuid('Invalid headOfDepartmentId format. Expected a valid UUID.')
    .nullable()
    .optional(),
});

// ── GET /api/departments ──────────────────────────────────────────────────────

export async function listDepartmentsController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const sortBy = req.query.sortBy === 'code' ? 'code' : 'name';
    const sortOrder = req.query.sortOrder === 'desc' ? 'desc' : 'asc';

    const departments = await departmentService.listDepartments({ sortBy, sortOrder });

    const body: ApiSuccess<typeof departments> = {
      success: true,
      data: departments,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

// ── GET /api/departments/:id ──────────────────────────────────────────────────

export async function getDepartmentByIdController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = extractIdParam(req);
    const department = await departmentService.getDepartmentById(id);

    const body: ApiSuccess<typeof department> = {
      success: true,
      data: department,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

// ── POST /api/departments (Admin only) ────────────────────────────────────────

export async function createDepartmentController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const parsed = createDepartmentSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path.join('.') || '_';
        if (!errors[field]) errors[field] = [];
        errors[field].push(issue.message);
      }
      const body: ApiError = {
        success: false,
        message: 'Validation failed',
        errors,
      };
      res.status(400).json(body);
      return;
    }

    const department = await departmentService.createDepartment(parsed.data);

    const body: ApiSuccess<typeof department> = {
      success: true,
      message: 'Department created successfully.',
      data: department,
    };
    res.status(201).json(body);
  } catch (err) {
    next(err);
  }
}

// ── PATCH /api/departments/:id (Admin only) ───────────────────────────────────

export async function updateDepartmentController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = extractIdParam(req);

    const parsed = updateDepartmentSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path.join('.') || '_';
        if (!errors[field]) errors[field] = [];
        errors[field].push(issue.message);
      }
      const body: ApiError = {
        success: false,
        message: 'Validation failed',
        errors,
      };
      res.status(400).json(body);
      return;
    }

    const department = await departmentService.updateDepartment(id, parsed.data);

    const body: ApiSuccess<typeof department> = {
      success: true,
      message: 'Department updated successfully.',
      data: department,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

// ── DELETE /api/departments/:id (Admin only) ──────────────────────────────────

export async function deleteDepartmentController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = extractIdParam(req);

    const result = await departmentService.deleteDepartment(id);

    const body: ApiSuccess<typeof result> = {
      success: true,
      message: 'Department deleted successfully.',
      data: result,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}
