import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as certService from '../services/certificate.service';
import { AppError } from '../middleware/errorHandler';
import type { ApiSuccess, ApiError } from '../types';
import type { CertificateStatus } from '@prisma/client';

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

const certStatusEnum = z.enum(['active', 'revoked', 'reissued'], {
  errorMap: () => ({ message: 'status must be one of: active, revoked, reissued' }),
});

const issueCertificateSchema = z.object({
  assignmentId: z
    .string({ required_error: 'assignmentId is required' })
    .uuid('Invalid assignmentId format. Expected a valid UUID.'),
  certificateNumber: z.string().trim().max(100, 'certificateNumber cannot exceed 100 characters').optional(),
  qrToken: z.string().trim().max(100, 'qrToken cannot exceed 100 characters').optional(),
  certificateUrl: z.string().trim().url('certificateUrl must be a valid URL').optional().nullable(),
  issueDate: z
    .string()
    .datetime({ offset: true })
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD format'))
    .optional()
    .nullable(),
  signatoryName: z
    .string({ required_error: 'signatoryName is required' })
    .trim()
    .min(1, 'signatoryName cannot be empty')
    .max(150, 'signatoryName cannot exceed 150 characters'),
  signatoryTitle: z
    .string({ required_error: 'signatoryTitle is required' })
    .trim()
    .min(1, 'signatoryTitle cannot be empty')
    .max(150, 'signatoryTitle cannot exceed 150 characters'),
});

const updateCertificateSchema = z.object({
  certificateUrl: z.string().trim().url('certificateUrl must be a valid URL').optional().nullable(),
  issueDate: z
    .string()
    .datetime({ offset: true })
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD format'))
    .optional()
    .nullable(),
  signatoryName: z.string().trim().min(1, 'signatoryName cannot be empty').max(150).optional(),
  signatoryTitle: z.string().trim().min(1, 'signatoryTitle cannot be empty').max(150).optional(),
  status: certStatusEnum.optional(),
  revocationReason: z.string().trim().max(1000).optional().nullable(),
});

const revokeCertificateSchema = z.object({
  revocationReason: z
    .string({ required_error: 'revocationReason is required' })
    .trim()
    .min(1, 'revocationReason cannot be empty')
    .max(1000, 'revocationReason cannot exceed 1000 characters'),
});

// ─────────────────────────────────────────────────────────────────────────────
// Controllers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/certificates — List certificates with role-based scoping.
 */
export async function listCertificatesController(
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
      certificateNumber,
    } = req.query;

    const filters: certService.CertificateFilters = {};

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
      ['active', 'revoked', 'reissued'].includes(status)
    ) {
      filters.status = status as CertificateStatus;
    }

    if (typeof certificateNumber === 'string' && certificateNumber.trim()) {
      filters.certificateNumber = certificateNumber.trim();
    }

    const certificates = await certService.listCertificates(filters, {
      id: req.user.id,
      role: req.user.role,
    });

    const body: ApiSuccess<typeof certificates> = {
      success: true,
      data: certificates,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/certificates/:id — Get a single certificate by ID.
 */
export async function getCertificateByIdController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const id = extractParam(req, 'id');
    const certificate = await certService.getCertificateById(id, {
      id: req.user.id,
      role: req.user.role,
    });

    const body: ApiSuccess<typeof certificate> = {
      success: true,
      data: certificate,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/certificates — Issue a new certificate.
 */
export async function issueCertificateController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const parsed = issueCertificateSchema.safeParse(req.body);
    if (!parsed.success) {
      const body: ApiError = {
        success: false,
        message: 'Validation failed',
        errors: formatZodErrors(parsed.error),
      };
      res.status(400).json(body);
      return;
    }

    const certificate = await certService.issueCertificate(parsed.data, {
      id: req.user.id,
      role: req.user.role,
    });

    const body: ApiSuccess<typeof certificate> = {
      success: true,
      message: 'Certificate issued successfully.',
      data: certificate,
    };
    res.status(201).json(body);
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/certificates/:id — Update certificate metadata.
 */
export async function updateCertificateController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const id = extractParam(req, 'id');
    const parsed = updateCertificateSchema.safeParse(req.body);
    if (!parsed.success) {
      const body: ApiError = {
        success: false,
        message: 'Validation failed',
        errors: formatZodErrors(parsed.error),
      };
      res.status(400).json(body);
      return;
    }

    const certificate = await certService.updateCertificate(id, parsed.data, {
      id: req.user.id,
      role: req.user.role,
    });

    const body: ApiSuccess<typeof certificate> = {
      success: true,
      message: 'Certificate updated successfully.',
      data: certificate,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/certificates/:id/revoke — Revoke a certificate.
 */
export async function revokeCertificateController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const id = extractParam(req, 'id');
    const parsed = revokeCertificateSchema.safeParse(req.body);
    if (!parsed.success) {
      const body: ApiError = {
        success: false,
        message: 'Validation failed',
        errors: formatZodErrors(parsed.error),
      };
      res.status(400).json(body);
      return;
    }

    const certificate = await certService.revokeCertificate(id, parsed.data, {
      id: req.user.id,
      role: req.user.role,
    });

    const body: ApiSuccess<typeof certificate> = {
      success: true,
      message: `Certificate '${certificate.certificateNumber}' revoked successfully.`,
      data: certificate,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/certificates/verify/:token — Public/Authenticated certificate verification.
 */
export async function verifyCertificateController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const rawToken = req.params.token || req.query.token || req.query.number;
    const token = Array.isArray(rawToken) ? rawToken[0] : rawToken;

    if (!token || typeof token !== 'string') {
      throw new AppError(400, 'Verification token or certificate number is required.');
    }

    const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.ip || null;
    const userAgent = (req.headers['user-agent'] as string) || null;

    const result = await certService.verifyCertificate(token, {
      ipAddress,
      userAgent,
    });

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

/**
 * GET /api/certificates/:id/logs — List verification logs for a certificate.
 */
export async function listCertificateVerificationLogsController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const id = extractParam(req, 'id');
    const logs = await certService.listCertificateVerificationLogs(id, {
      id: req.user.id,
      role: req.user.role,
    });

    const body: ApiSuccess<typeof logs> = {
      success: true,
      data: logs,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}
