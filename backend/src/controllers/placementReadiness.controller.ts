import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as placementService from '../services/placementReadiness.service';
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

const calculateSnapshotSchema = z.object({
  studentId: z
    .string()
    .uuid('Invalid studentId format. Expected a valid UUID.')
    .optional(),
});

// ─────────────────────────────────────────────────────────────────────────────
// Handlers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/placement-readiness — List placement readiness snapshots.
 */
export async function listPlacementReadinessSnapshotsController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const { studentId, minScore, maxScore } = req.query;

    const filters: placementService.PlacementReadinessFilters = {};

    if (typeof studentId === 'string' && UUID_REGEX.test(studentId)) {
      filters.studentId = studentId;
    }

    if (typeof minScore === 'string' && !isNaN(Number(minScore))) {
      filters.minScore = parseInt(minScore, 10);
    }

    if (typeof maxScore === 'string' && !isNaN(Number(maxScore))) {
      filters.maxScore = parseInt(maxScore, 10);
    }

    const snapshots = await placementService.listPlacementReadinessSnapshots(filters, {
      id: req.user.id,
      role: req.user.role,
    });

    const body: ApiSuccess<typeof snapshots> = {
      success: true,
      data: snapshots,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/placement-readiness/latest — Get latest readiness snapshot for student.
 */
export async function getLatestPlacementReadinessController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    let targetStudentId = req.user.id;
    if (req.user.role !== 'student') {
      const qStudentId = req.query.studentId;
      if (typeof qStudentId !== 'string' || !UUID_REGEX.test(qStudentId)) {
        throw new AppError(400, 'Query parameter studentId (valid UUID) is required for non-student roles.');
      }
      targetStudentId = qStudentId;
    }

    const snapshot = await placementService.getLatestPlacementReadiness(targetStudentId, {
      id: req.user.id,
      role: req.user.role,
    });

    const body: ApiSuccess<typeof snapshot> = {
      success: true,
      data: snapshot,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/placement-readiness/:id — Get a snapshot by ID.
 */
export async function getPlacementReadinessByIdController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const id = extractParam(req, 'id');
    const snapshot = await placementService.getPlacementReadinessById(id, {
      id: req.user.id,
      role: req.user.role,
    });

    const body: ApiSuccess<typeof snapshot> = {
      success: true,
      data: snapshot,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/placement-readiness/calculate — Generate a new snapshot from current persisted operational metrics.
 */
export async function calculatePlacementReadinessController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const parsed = calculateSnapshotSchema.safeParse(req.body);
    if (!parsed.success) {
      const body: ApiError = {
        success: false,
        message: 'Validation failed',
        errors: formatZodErrors(parsed.error),
      };
      res.status(400).json(body);
      return;
    }

    let targetStudentId = req.user.id;
    if (req.user.role !== 'student') {
      if (!parsed.data.studentId) {
        throw new AppError(400, 'studentId is required in request body.');
      }
      targetStudentId = parsed.data.studentId;
    } else if (parsed.data.studentId && parsed.data.studentId !== req.user.id) {
      throw new AppError(403, 'Students can only calculate placement readiness for themselves.');
    }

    const snapshot = await placementService.calculateAndSavePlacementReadiness(targetStudentId, {
      id: req.user.id,
      role: req.user.role,
    });

    const body: ApiSuccess<typeof snapshot> = {
      success: true,
      message: 'Placement readiness snapshot calculated and recorded successfully.',
      data: snapshot,
    };
    res.status(201).json(body);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/placement-readiness/:id/recalculate — Recalculates an existing snapshot in-place.
 */
export async function recalculatePlacementReadinessController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const id = extractParam(req, 'id');
    const snapshot = await placementService.recalculatePlacementReadiness(id, {
      id: req.user.id,
      role: req.user.role,
    });

    const body: ApiSuccess<typeof snapshot> = {
      success: true,
      message: 'Placement readiness snapshot recalculated successfully.',
      data: snapshot,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/placement-readiness/:id — Delete a snapshot (Admin only).
 */
export async function deletePlacementReadinessController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const id = extractParam(req, 'id');
    const deleted = await placementService.deletePlacementReadiness(id, {
      id: req.user.id,
      role: req.user.role,
    });

    const body: ApiSuccess<typeof deleted> = {
      success: true,
      message: 'Placement readiness snapshot deleted successfully.',
      data: deleted,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}
