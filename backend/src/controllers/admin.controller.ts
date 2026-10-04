import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as adminService from '../services/admin.service';
import { AppError } from '../middleware/errorHandler';
import type { ApiSuccess } from '../types';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function extractIdParam(req: Request, paramName = 'id'): string {
  const raw = req.params[paramName];
  const id = Array.isArray(raw) ? raw[0] : raw;
  if (!id || !UUID_REGEX.test(id)) {
    throw new AppError(400, `Invalid ${paramName} format. Expected a valid UUID.`);
  }
  return id;
}

// ── Validation Schemas ────────────────────────────────────────────────────────

const createCompanySchema = z.object({
  companyName: z
    .string({ required_error: 'Company name is required' })
    .trim()
    .min(1, 'Company name cannot be empty')
    .max(200, 'Company name cannot exceed 200 characters'),
  industryDomain: z.string().trim().max(100).optional(),
  contactPerson: z
    .string({ required_error: 'Contact person is required' })
    .trim()
    .min(1, 'Contact person cannot be empty')
    .max(150),
  email: z
    .string({ required_error: 'Official email is required' })
    .email('A valid email address is required')
    .trim()
    .toLowerCase(),
  phone: z.string().trim().max(30).optional(),
  website: z.string().trim().max(255).optional(),
  status: z.enum(['Approved', 'Pending']).optional().default('Approved'),
  tempPassword: z.string().min(6).optional(),
});

const rejectCompanySchema = z.object({
  reason: z.string().trim().max(500).optional(),
});

const createFacultySchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .trim()
    .min(1, 'Name cannot be empty')
    .max(150),
  email: z
    .string({ required_error: 'Email is required' })
    .email('A valid email address is required')
    .trim()
    .toLowerCase(),
  facultyId: z
    .string({ required_error: 'Faculty ID is required' })
    .trim()
    .min(1, 'Faculty ID cannot be empty')
    .max(50),
  department: z
    .string({ required_error: 'Department is required' })
    .trim()
    .min(1, 'Department cannot be empty'),
  designation: z.string().trim().max(100).optional(),
  phone: z.string().trim().max(30).optional(),
  password: z.string().min(6).optional(),
  batch: z.string().trim().max(20).optional(),
});

const updateFacultySchema = z.object({
  name: z.string().trim().min(1).max(150).optional(),
  department: z.string().trim().min(1).optional(),
  designation: z.string().trim().max(100).optional(),
  phone: z.string().trim().max(30).optional(),
  status: z.enum(['Active', 'Inactive']).optional(),
});

// ── Controllers ───────────────────────────────────────────────────────────────

/** GET /api/admin/metrics */
export async function getAdminMetricsController(
  _req: Request,
  res: Response<ApiSuccess>,
  next: NextFunction
): Promise<void> {
  try {
    const data = await adminService.getAdminMetrics();
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

/** GET /api/admin/companies */
export async function listCompaniesController(
  _req: Request,
  res: Response<ApiSuccess>,
  next: NextFunction
): Promise<void> {
  try {
    const data = await adminService.listCompanies();
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

/** POST /api/admin/companies */
export async function createCompanyController(
  req: Request,
  res: Response<ApiSuccess>,
  next: NextFunction
): Promise<void> {
  try {
    const input = createCompanySchema.parse(req.body);
    const data = await adminService.createCompany(input);
    res.status(201).json({
      success: true,
      message: `Company "${data.companyName}" successfully registered.`,
      data,
    });
  } catch (err) {
    next(err);
  }
}

/** PATCH /api/admin/companies/:id/approval */
export async function approveCompanyController(
  req: Request,
  res: Response<ApiSuccess>,
  next: NextFunction
): Promise<void> {
  try {
    const companyId = extractIdParam(req);
    const data = await adminService.approveCompany(companyId);
    res.status(200).json({
      success: true,
      message: 'Company registration approved successfully.',
      data,
    });
  } catch (err) {
    next(err);
  }
}

/** PATCH /api/admin/companies/:id/rejection */
export async function rejectCompanyController(
  req: Request,
  res: Response<ApiSuccess>,
  next: NextFunction
): Promise<void> {
  try {
    const companyId = extractIdParam(req);
    const parsed = rejectCompanySchema.parse(req.body);
    const data = await adminService.rejectCompany(companyId, parsed.reason);
    res.status(200).json({
      success: true,
      message: 'Company registration rejected.',
      data,
    });
  } catch (err) {
    next(err);
  }
}

/** POST /api/admin/companies/:id/invite */
export async function sendCompanyInvitationController(
  req: Request,
  res: Response<ApiSuccess>,
  next: NextFunction
): Promise<void> {
  try {
    const companyId = extractIdParam(req);
    const { companyName, officialEmail } = req.body || {};
    const data = await adminService.sendCompanyInvitation(companyId, companyName, officialEmail);
    res.status(200).json({
      success: true,
      message: data.message,
      data,
    });
  } catch (err) {
    next(err);
  }
}

/** GET /api/admin/faculty */
export async function listFacultyController(
  _req: Request,
  res: Response<ApiSuccess>,
  next: NextFunction
): Promise<void> {
  try {
    const data = await adminService.listFacultyMentors();
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

/** POST /api/admin/faculty */
export async function createFacultyController(
  req: Request,
  res: Response<ApiSuccess>,
  next: NextFunction
): Promise<void> {
  try {
    const input = createFacultySchema.parse(req.body);
    const data = await adminService.createFacultyMentor(input);
    res.status(201).json({
      success: true,
      message: `Faculty mentor "${data.name}" successfully registered.`,
      data,
    });
  } catch (err) {
    next(err);
  }
}

/** PATCH /api/admin/faculty/:id */
export async function updateFacultyController(
  req: Request,
  res: Response<ApiSuccess>,
  next: NextFunction
): Promise<void> {
  try {
    const id = extractIdParam(req);
    const input = updateFacultySchema.parse(req.body);
    const data = await adminService.updateFacultyMentor(id, input);
    res.status(200).json({
      success: true,
      message: 'Faculty mentor updated successfully.',
      data,
    });
  } catch (err) {
    next(err);
  }
}

/** DELETE /api/admin/faculty/:id */
export async function deleteFacultyController(
  req: Request,
  res: Response<ApiSuccess>,
  next: NextFunction
): Promise<void> {
  try {
    const id = extractIdParam(req);
    await adminService.deleteFacultyMentor(id);
    res.status(200).json({
      success: true,
      message: 'Faculty mentor deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
}

/** GET /api/admin/applications */
export async function listAdminApplicationsController(
  _req: Request,
  res: Response<ApiSuccess>,
  next: NextFunction
): Promise<void> {
  try {
    const data = await adminService.listAdminApplications();
    res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
}

/** GET /api/admin/users */
export async function listAdminUsersController(
  _req: Request,
  res: Response<ApiSuccess>,
  next: NextFunction
): Promise<void> {
  try {
    const data = await adminService.listAdminUsers();
    res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
}

