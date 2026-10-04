import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as companyService from '../services/company.service';
import { AppError } from '../middleware/errorHandler';
import type { ApiSuccess, ApiError } from '../types';

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

const createMentorSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(150),
  email: z.string().trim().email('Invalid email address'),
  phone: z.string().trim().max(30).optional().nullable(),
  department: z.string().trim().max(100).optional().nullable(),
  designation: z.string().trim().min(2, 'Designation is required').max(100),
  expertiseAreas: z.array(z.string().trim()).optional(),
  password: z.string().min(6).max(100).optional(),
});

const updateMentorSchema = z.object({
  name: z.string().trim().min(2).max(150).optional(),
  phone: z.string().trim().max(30).optional().nullable(),
  department: z.string().trim().max(100).optional().nullable(),
  designation: z.string().trim().min(2).max(100).optional(),
  status: z.string().trim().optional(),
  expertiseAreas: z.array(z.string().trim()).optional(),
});

const assignMentorSchema = z.object({
  internshipId: z.string().uuid().optional().nullable(),
});

export async function getCompanyMentorsController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const mentors = await companyService.getCompanyMentors(req.user.id);
    const body: ApiSuccess<typeof mentors> = {
      success: true,
      data: mentors,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

export async function createCompanyMentorController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const parsed = createMentorSchema.safeParse(req.body);
    if (!parsed.success) {
      const body: ApiError = {
        success: false,
        message: 'Validation failed',
        errors: formatZodErrors(parsed.error),
      };
      res.status(400).json(body);
      return;
    }

    const mentor = await companyService.createCompanyMentor(req.user.id, {
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone || undefined,
      department: parsed.data.department || undefined,
      designation: parsed.data.designation,
      expertiseAreas: parsed.data.expertiseAreas,
      password: parsed.data.password,
    });

    const body: ApiSuccess<typeof mentor> = {
      success: true,
      message: 'Industry mentor created successfully.',
      data: mentor,
    };
    res.status(201).json(body);
  } catch (err) {
    next(err);
  }
}

export async function updateCompanyMentorController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const mentorId = extractParam(req, 'id');
    const parsed = updateMentorSchema.safeParse(req.body);
    if (!parsed.success) {
      const body: ApiError = {
        success: false,
        message: 'Validation failed',
        errors: formatZodErrors(parsed.error),
      };
      res.status(400).json(body);
      return;
    }

    const updated = await companyService.updateCompanyMentor(req.user.id, mentorId, {
      name: parsed.data.name,
      phone: parsed.data.phone || undefined,
      department: parsed.data.department || undefined,
      designation: parsed.data.designation,
      status: parsed.data.status,
      expertiseAreas: parsed.data.expertiseAreas,
    });

    const body: ApiSuccess<typeof updated> = {
      success: true,
      message: 'Mentor updated successfully.',
      data: updated,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

export async function assignCompanyMentorController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const mentorId = extractParam(req, 'id');
    const parsed = assignMentorSchema.safeParse(req.body);
    if (!parsed.success) {
      const body: ApiError = {
        success: false,
        message: 'Validation failed',
        errors: formatZodErrors(parsed.error),
      };
      res.status(400).json(body);
      return;
    }

    const result = await companyService.assignMentorToInternship(
      req.user.id,
      mentorId,
      parsed.data.internshipId
    );

    const body: ApiSuccess<typeof result> = {
      success: true,
      message: result.message,
      data: result,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}
