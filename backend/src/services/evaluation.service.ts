import { Prisma, EvaluationType, EvaluationStatus, AppRole } from '@prisma/client';
import prisma from './prisma.service';
import { AppError } from '../middleware/errorHandler';

// ─────────────────────────────────────────────────────────────────────────────
// Types & Interfaces
// ─────────────────────────────────────────────────────────────────────────────

export interface CreateEvaluationInput {
  assignmentId: string;
  evaluationType: EvaluationType;
  evaluationPeriod: string;
  technicalSkills: number;
  qualityOfWork: number;
  problemSolving: number;
  communication: number;
  teamwork: number;
  professionalism: number;
  timeManagement: number;
  initiative: number;
  overallRating?: number | string;
  strengths?: string | null;
  improvementAreas?: string | null;
  comments?: string | null;
  status?: EvaluationStatus;
}

export interface UpdateEvaluationInput {
  evaluationPeriod?: string;
  technicalSkills?: number;
  qualityOfWork?: number;
  problemSolving?: number;
  communication?: number;
  teamwork?: number;
  professionalism?: number;
  timeManagement?: number;
  initiative?: number;
  overallRating?: number | string;
  strengths?: string | null;
  improvementAreas?: string | null;
  comments?: string | null;
  discrepancyNotes?: string | null;
}

export interface UpdateEvaluationStatusInput {
  status: EvaluationStatus;
  discrepancyNotes?: string | null;
}

export interface EvaluationFilters {
  assignmentId?: string;
  studentId?: string;
  evaluationType?: EvaluationType;
  status?: EvaluationStatus;
  crossVerified?: boolean;
}

export interface UserContext {
  id: string;
  role: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Projections & Helper Functions
// ─────────────────────────────────────────────────────────────────────────────

const EVALUATION_DETAIL_SELECT = {
  id: true,
  assignmentId: true,
  evaluatorId: true,
  evaluatorRole: true,
  evaluationType: true,
  evaluationPeriod: true,
  technicalSkills: true,
  qualityOfWork: true,
  problemSolving: true,
  communication: true,
  teamwork: true,
  professionalism: true,
  timeManagement: true,
  initiative: true,
  overallRating: true,
  strengths: true,
  improvementAreas: true,
  comments: true,
  status: true,
  crossVerified: true,
  crossVerifiedById: true,
  crossVerifiedAt: true,
  discrepancyNotes: true,
  createdAt: true,
  updatedAt: true,
  assignment: {
    select: {
      id: true,
      studentId: true,
      companyId: true,
      internshipId: true,
      facultyMentorId: true,
      industryMentorId: true,
      status: true,
      student: {
        select: {
          id: true,
          studentId: true,
          course: true,
          profile: {
            select: {
              id: true,
              fullName: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
      },
      company: {
        select: {
          id: true,
          companyName: true,
          industryDomain: true,
          website: true,
        },
      },
      internship: {
        select: {
          id: true,
          title: true,
          workMode: true,
        },
      },
    },
  },
  evaluator: {
    select: {
      id: true,
      fullName: true,
      role: true,
      email: true,
      avatarUrl: true,
    },
  },
  crossVerifiedBy: {
    select: {
      id: true,
      facultyId: true,
      profile: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
    },
  },
} as const;

function computeOverallRating(scores: {
  technicalSkills: number;
  qualityOfWork: number;
  problemSolving: number;
  communication: number;
  teamwork: number;
  professionalism: number;
  timeManagement: number;
  initiative: number;
}): Prisma.Decimal {
  const sum =
    scores.technicalSkills +
    scores.qualityOfWork +
    scores.problemSolving +
    scores.communication +
    scores.teamwork +
    scores.professionalism +
    scores.timeManagement +
    scores.initiative;
  const avg = Math.round((sum / 8) * 10) / 10;
  return new Prisma.Decimal(avg.toFixed(1));
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. List Evaluations: GET /api/evaluations
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns evaluations scoped to caller's role.
 */
export async function listEvaluations(
  filters: EvaluationFilters,
  user: UserContext
) {
  const where: Prisma.EvaluationWhereInput = {};
  const assignmentWhere: Prisma.InternshipAssignmentWhereInput = {};

  // Scope enforcement
  if (user.role === 'student') {
    assignmentWhere.studentId = user.id;
  } else if (user.role === 'company') {
    assignmentWhere.companyId = user.id;
  } else if (user.role === 'faculty') {
    assignmentWhere.OR = [
      { facultyMentorId: user.id },
      { student: { facultyMappings: { some: { facultyId: user.id } } } },
    ];
  } else if (user.role === 'mentor') {
    assignmentWhere.industryMentorId = user.id;
  } else if (user.role !== 'admin') {
    throw new AppError(403, 'You do not have permission to view evaluations.');
  }

  // Filters
  if (filters.assignmentId) {
    where.assignmentId = filters.assignmentId;
  }

  if (filters.studentId && (user.role === 'admin' || user.role === 'company' || user.role === 'faculty' || user.role === 'mentor')) {
    assignmentWhere.studentId = filters.studentId;
  }

  if (Object.keys(assignmentWhere).length > 0) {
    where.assignment = assignmentWhere;
  }

  if (filters.evaluationType) {
    where.evaluationType = filters.evaluationType;
  }

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.crossVerified !== undefined) {
    where.crossVerified = filters.crossVerified;
  }

  return prisma.evaluation.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      assignmentId: true,
      evaluatorId: true,
      evaluatorRole: true,
      evaluationType: true,
      evaluationPeriod: true,
      overallRating: true,
      status: true,
      crossVerified: true,
      createdAt: true,
      updatedAt: true,
      assignment: {
        select: {
          id: true,
          studentId: true,
          companyId: true,
          internshipId: true,
          student: {
            select: {
              id: true,
              studentId: true,
              profile: {
                select: {
                  id: true,
                  fullName: true,
                  avatarUrl: true,
                },
              },
            },
          },
          company: {
            select: {
              companyName: true,
            },
          },
          internship: {
            select: {
              title: true,
            },
          },
        },
      },
      evaluator: {
        select: {
          id: true,
          fullName: true,
          role: true,
        },
      },
      crossVerifiedBy: {
        select: {
          id: true,
          facultyId: true,
          profile: {
            select: {
              fullName: true,
            },
          },
        },
      },
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Get Evaluation by ID: GET /api/evaluations/:id
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Retrieves a single evaluation and enforces assignment-level authorization.
 */
export async function getEvaluationById(id: string, user: UserContext) {
  const evaluation = await prisma.evaluation.findUnique({
    where: { id },
    select: EVALUATION_DETAIL_SELECT,
  });

  if (!evaluation) {
    throw new AppError(404, 'Evaluation not found.');
  }

  const assignment = evaluation.assignment;
  const isStudent = user.role === 'student' && assignment.studentId === user.id;
  const isCompany = user.role === 'company' && assignment.companyId === user.id;
  const isFaculty = user.role === 'faculty' && assignment.facultyMentorId === user.id;
  const isMentor = user.role === 'mentor' && assignment.industryMentorId === user.id;
  const isAdmin = user.role === 'admin';

  if (!isStudent && !isCompany && !isFaculty && !isMentor && !isAdmin) {
    throw new AppError(403, 'You are not authorized to view this evaluation.');
  }

  return evaluation;
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Create Evaluation: POST /api/evaluations
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Creates an evaluation for an internship assignment.
 * Allowed: Company, Faculty, Industry Mentor, Admin.
 * Students cannot evaluate themselves.
 */
export async function createEvaluation(
  input: CreateEvaluationInput,
  user: UserContext
) {
  if (user.role === 'student') {
    throw new AppError(403, 'Students are not permitted to create evaluations.');
  }

  const assignment = await prisma.internshipAssignment.findUnique({
    where: { id: input.assignmentId },
    select: {
      id: true,
      studentId: true,
      companyId: true,
      facultyMentorId: true,
      industryMentorId: true,
      status: true,
    },
  });

  if (!assignment) {
    throw new AppError(404, 'Internship assignment not found.');
  }

  const isCompany = user.role === 'company' && assignment.companyId === user.id;
  let isFaculty = user.role === 'faculty' && assignment.facultyMentorId === user.id;
  if (!isFaculty && user.role === 'faculty') {
    const supervised = await prisma.facultyStudentAssignment.findFirst({
      where: { facultyId: user.id, studentId: assignment.studentId },
    });
    if (supervised) isFaculty = true;
  }
  const isMentor = user.role === 'mentor' && assignment.industryMentorId === user.id;
  const isAdmin = user.role === 'admin';

  if (!isCompany && !isFaculty && !isMentor && !isAdmin) {
    throw new AppError(
      403,
      'You are not authorized to evaluate this assignment.'
    );
  }

  if (assignment.status === 'terminated' || assignment.status === 'suspended') {
    throw new AppError(
      400,
      `Cannot evaluate an assignment in "${assignment.status}" status.`
    );
  }

  const overallRating =
    input.overallRating !== undefined
      ? new Prisma.Decimal(Number(input.overallRating).toFixed(1))
      : computeOverallRating({
          technicalSkills: input.technicalSkills,
          qualityOfWork: input.qualityOfWork,
          problemSolving: input.problemSolving,
          communication: input.communication,
          teamwork: input.teamwork,
          professionalism: input.professionalism,
          timeManagement: input.timeManagement,
          initiative: input.initiative,
        });

  return prisma.evaluation.create({
    data: {
      assignmentId: assignment.id,
      evaluatorId: user.id,
      evaluatorRole: user.role as AppRole,
      evaluationType: input.evaluationType,
      evaluationPeriod: input.evaluationPeriod.trim(),
      technicalSkills: input.technicalSkills,
      qualityOfWork: input.qualityOfWork,
      problemSolving: input.problemSolving,
      communication: input.communication,
      teamwork: input.teamwork,
      professionalism: input.professionalism,
      timeManagement: input.timeManagement,
      initiative: input.initiative,
      overallRating,
      strengths: input.strengths?.trim() || null,
      improvementAreas: input.improvementAreas?.trim() || null,
      comments: input.comments?.trim() || null,
      status: input.status ?? 'draft',
    },
    select: EVALUATION_DETAIL_SELECT,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Update Evaluation: PATCH /api/evaluations/:id
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Updates an evaluation.
 * Allowed: Original evaluator (while draft/correction_required) or Admin.
 */
export async function updateEvaluation(
  id: string,
  input: UpdateEvaluationInput,
  user: UserContext
) {
  const evaluation = await prisma.evaluation.findUnique({
    where: { id },
    include: {
      assignment: {
        select: {
          companyId: true,
          facultyMentorId: true,
          industryMentorId: true,
        },
      },
    },
  });

  if (!evaluation) {
    throw new AppError(404, 'Evaluation not found.');
  }

  const isEvaluator = evaluation.evaluatorId === user.id;
  const isFaculty = user.role === 'faculty' && evaluation.assignment.facultyMentorId === user.id;
  const isAdmin = user.role === 'admin';

  if (!isEvaluator && !isFaculty && !isAdmin) {
    throw new AppError(403, 'You are not authorized to update this evaluation.');
  }

  if (evaluation.status === 'verified' && !isAdmin) {
    throw new AppError(
      409,
      'Cannot update an evaluation that has already been verified.'
    );
  }

  const data: Prisma.EvaluationUpdateInput = {};

  if (input.evaluationPeriod !== undefined) {
    data.evaluationPeriod = input.evaluationPeriod.trim();
  }
  if (input.technicalSkills !== undefined) data.technicalSkills = input.technicalSkills;
  if (input.qualityOfWork !== undefined) data.qualityOfWork = input.qualityOfWork;
  if (input.problemSolving !== undefined) data.problemSolving = input.problemSolving;
  if (input.communication !== undefined) data.communication = input.communication;
  if (input.teamwork !== undefined) data.teamwork = input.teamwork;
  if (input.professionalism !== undefined) data.professionalism = input.professionalism;
  if (input.timeManagement !== undefined) data.timeManagement = input.timeManagement;
  if (input.initiative !== undefined) data.initiative = input.initiative;

  // Recompute overallRating if dimensions changed
  if (
    input.technicalSkills !== undefined ||
    input.qualityOfWork !== undefined ||
    input.problemSolving !== undefined ||
    input.communication !== undefined ||
    input.teamwork !== undefined ||
    input.professionalism !== undefined ||
    input.timeManagement !== undefined ||
    input.initiative !== undefined
  ) {
    if (input.overallRating !== undefined) {
      data.overallRating = new Prisma.Decimal(Number(input.overallRating).toFixed(1));
    } else {
      data.overallRating = computeOverallRating({
        technicalSkills: input.technicalSkills ?? evaluation.technicalSkills,
        qualityOfWork: input.qualityOfWork ?? evaluation.qualityOfWork,
        problemSolving: input.problemSolving ?? evaluation.problemSolving,
        communication: input.communication ?? evaluation.communication,
        teamwork: input.teamwork ?? evaluation.teamwork,
        professionalism: input.professionalism ?? evaluation.professionalism,
        timeManagement: input.timeManagement ?? evaluation.timeManagement,
        initiative: input.initiative ?? evaluation.initiative,
      });
    }
  } else if (input.overallRating !== undefined) {
    data.overallRating = new Prisma.Decimal(Number(input.overallRating).toFixed(1));
  }

  if (input.strengths !== undefined) {
    data.strengths = input.strengths ? input.strengths.trim() : null;
  }
  if (input.improvementAreas !== undefined) {
    data.improvementAreas = input.improvementAreas ? input.improvementAreas.trim() : null;
  }
  if (input.comments !== undefined) {
    data.comments = input.comments ? input.comments.trim() : null;
  }
  if (input.discrepancyNotes !== undefined) {
    data.discrepancyNotes = input.discrepancyNotes ? input.discrepancyNotes.trim() : null;
  }

  return prisma.evaluation.update({
    where: { id },
    data,
    select: EVALUATION_DETAIL_SELECT,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Update Evaluation Status: PATCH /api/evaluations/:id/status
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Transitions evaluation status:
 * - Evaluator: draft -> submitted or pending_verification
 * - Faculty: submitted/pending_verification -> verified (setting crossVerified: true)
 *   or -> correction_required (with discrepancy notes)
 */
export async function updateEvaluationStatus(
  id: string,
  input: UpdateEvaluationStatusInput,
  user: UserContext
) {
  const evaluation = await prisma.evaluation.findUnique({
    where: { id },
    include: {
      assignment: {
        select: {
          studentId: true,
          companyId: true,
          facultyMentorId: true,
          industryMentorId: true,
        },
      },
    },
  });

  if (!evaluation) {
    throw new AppError(404, 'Evaluation not found.');
  }

  const isEvaluator = evaluation.evaluatorId === user.id;
  let isFaculty = user.role === 'faculty' && evaluation.assignment.facultyMentorId === user.id;
  if (!isFaculty && user.role === 'faculty') {
    const supervised = await prisma.facultyStudentAssignment.findFirst({
      where: { facultyId: user.id, studentId: evaluation.assignment.studentId },
    });
    if (supervised) isFaculty = true;
  }
  const isAdmin = user.role === 'admin';

  if (!isEvaluator && !isFaculty && !isAdmin) {
    throw new AppError(
      403,
      'You are not authorized to transition the status of this evaluation.'
    );
  }

  const data: Prisma.EvaluationUpdateInput = {
    status: input.status,
  };

  if (input.status === 'verified') {
    if (!isFaculty && !isAdmin) {
      throw new AppError(
        403,
        'Only faculty mentors or administrators can verify an evaluation.'
      );
    }
    data.crossVerified = true;
    data.crossVerifiedAt = new Date();
    data.crossVerifiedBy = { connect: { id: user.id } };
    if (input.discrepancyNotes !== undefined) {
      data.discrepancyNotes = input.discrepancyNotes ? input.discrepancyNotes.trim() : null;
    }
  } else if (input.status === 'correction_required') {
    if (!isFaculty && !isAdmin) {
      throw new AppError(
        403,
        'Only faculty mentors or administrators can request corrections.'
      );
    }
    data.crossVerified = false;
    data.crossVerifiedAt = null;
    data.crossVerifiedBy = { disconnect: true };
    if (input.discrepancyNotes !== undefined) {
      data.discrepancyNotes = input.discrepancyNotes ? input.discrepancyNotes.trim() : null;
    }
  } else if (input.status === 'draft') {
    data.crossVerified = false;
    data.crossVerifiedAt = null;
    data.crossVerifiedBy = { disconnect: true };
  }

  return prisma.evaluation.update({
    where: { id },
    data,
    select: EVALUATION_DETAIL_SELECT,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Delete Evaluation: DELETE /api/evaluations/:id
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Deletes an evaluation.
 * Allowed: Evaluator (only while draft), Admin.
 * Finalized/verified evaluations return 409 Conflict.
 */
export async function deleteEvaluation(id: string, user: UserContext) {
  const evaluation = await prisma.evaluation.findUnique({
    where: { id },
  });

  if (!evaluation) {
    throw new AppError(404, 'Evaluation not found.');
  }

  const isEvaluator = evaluation.evaluatorId === user.id;
  const isAdmin = user.role === 'admin';

  if (!isEvaluator && !isAdmin) {
    throw new AppError(403, 'You are not authorized to delete this evaluation.');
  }

  if (evaluation.status === 'verified' || evaluation.status === 'submitted' || evaluation.status === 'pending_verification') {
    throw new AppError(
      409,
      `Cannot delete an evaluation in "${evaluation.status}" status. Only draft evaluations may be deleted.`
    );
  }

  await prisma.evaluation.delete({
    where: { id },
  });

  return { id, deleted: true };
}
