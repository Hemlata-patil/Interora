import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as facultyService from '../services/faculty.service';
import { AppError } from '../middleware/errorHandler';
import type { ApiSuccess } from '../types';

// ── Validation Helpers & Schemas ──────────────────────────────────────────────

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function extractStudentIdParam(req: Request): string {
  const rawId = req.params.studentId;
  const studentId = Array.isArray(rawId) ? rawId[0] : rawId;
  if (!studentId || !uuidRegex.test(studentId)) {
    throw new AppError(400, 'Invalid student ID parameter. Must be a valid UUID.');
  }
  return studentId;
}

const createGuidanceNoteSchema = z.object({
  category: z.string().trim().max(100).optional().default('Mentorship Note'),
  note: z
    .string({ required_error: 'Note content is required' })
    .trim()
    .min(1, 'Note content cannot be empty')
    .max(2000, 'Note content cannot exceed 2000 characters'),
});

// ── Controllers ───────────────────────────────────────────────────────────────

/** GET /api/faculty/metrics */
export async function getFacultyMetricsController(
  req: Request,
  res: Response<ApiSuccess>,
  next: NextFunction
): Promise<void> {
  try {
    const facultyUserId = req.user!.id;
    const userRole = req.user!.role;
    const data = await facultyService.getFacultyDashboardMetrics(facultyUserId, userRole);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

/** GET /api/faculty/assigned-students */
export async function getAssignedStudentsController(
  req: Request,
  res: Response<ApiSuccess>,
  next: NextFunction
): Promise<void> {
  try {
    const facultyUserId = req.user!.id;
    const userRole = req.user!.role;
    const data = await facultyService.getAssignedStudents(facultyUserId, userRole);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

/** GET /api/faculty/attendance */
export async function getFacultyAttendanceController(
  req: Request,
  res: Response<ApiSuccess>,
  next: NextFunction
): Promise<void> {
  try {
    const facultyUserId = req.user!.id;
    const userRole = req.user!.role;
    const data = await facultyService.getFacultyAttendanceMonitoring(facultyUserId, userRole);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

/** GET /api/faculty/students/:studentId/guidance-notes */
export async function getGuidanceNotesController(
  req: Request,
  res: Response<ApiSuccess>,
  next: NextFunction
): Promise<void> {
  try {
    const facultyUserId = req.user!.id;
    const userRole = req.user!.role;
    const studentId = extractStudentIdParam(req);
    const data = await facultyService.getStudentGuidanceNotes(facultyUserId, userRole, studentId);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

/** POST /api/faculty/students/:studentId/guidance-notes */
export async function createGuidanceNoteController(
  req: Request,
  res: Response<ApiSuccess>,
  next: NextFunction
): Promise<void> {
  try {
    const facultyUserId = req.user!.id;
    const userRole = req.user!.role;
    const studentId = extractStudentIdParam(req);
    const input = createGuidanceNoteSchema.parse(req.body);
    const data = await facultyService.createStudentGuidanceNote(
      facultyUserId,
      userRole,
      studentId,
      input
    );
    res.status(201).json({
      success: true,
      message: 'Guidance note logged successfully.',
      data,
    });
  } catch (err) {
    next(err);
  }
}

const applicationDecisionSchema = z.object({
  decision: z.enum(['approve', 'reject']),
  rating: z.number().min(1).max(5).optional(),
});

/** GET /api/faculty/applications */
export async function getFacultyApplicationsController(
  req: Request,
  res: Response<ApiSuccess>,
  next: NextFunction
): Promise<void> {
  try {
    const facultyUserId = req.user!.id;
    const userRole = req.user!.role;
    const data = await facultyService.getFacultyApplications(facultyUserId, userRole);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

function extractIdParam(req: Request): string {
  const rawId = req.params.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  if (!id || !uuidRegex.test(id)) {
    throw new AppError(400, 'Invalid ID parameter. Must be a valid UUID.');
  }
  return id;
}

/** POST /api/faculty/applications/:id/decision */
export async function facultyApplicationDecisionController(
  req: Request,
  res: Response<ApiSuccess>,
  next: NextFunction
): Promise<void> {
  try {
    const facultyUserId = req.user!.id;
    const userRole = req.user!.role;
    const applicationId = extractIdParam(req);
    const parsed = applicationDecisionSchema.parse(req.body);

    const data = await facultyService.recordFacultyApplicationDecision(
      facultyUserId,
      userRole,
      applicationId,
      parsed.decision,
      parsed.rating
    );

    res.status(200).json({
      success: true,
      message: `Application ${parsed.decision === 'approve' ? 'approved' : 'rejected'} successfully.`,
      data,
    });
  } catch (err) {
    next(err);
  }
}

