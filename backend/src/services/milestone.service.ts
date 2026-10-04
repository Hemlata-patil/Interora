import { Prisma, MilestoneStatus } from '@prisma/client';
import prisma from './prisma.service';
import { AppError } from '../middleware/errorHandler';

// ─────────────────────────────────────────────────────────────────────────────
// Types & Interfaces
// ─────────────────────────────────────────────────────────────────────────────

export interface CreateMilestoneInput {
  assignmentId: string;
  templateId?: string | null;
  title: string;
  description?: string | null;
  targetDate: string | Date;
  status?: MilestoneStatus;
}

export interface UpdateMilestoneInput {
  title?: string;
  description?: string | null;
  targetDate?: string | Date | null;
  status?: MilestoneStatus;
  completedAt?: string | Date | null;
}

export interface UpdateMilestoneStatusInput {
  status: MilestoneStatus;
}

export interface MilestoneFilters {
  assignmentId?: string;
  status?: MilestoneStatus;
  studentId?: string;
  dueStartDate?: string | Date;
  dueEndDate?: string | Date;
}

export interface UserContext {
  id: string;
  role: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Projections
// ─────────────────────────────────────────────────────────────────────────────

const MILESTONE_DETAIL_SELECT = {
  id: true,
  assignmentId: true,
  templateId: true,
  title: true,
  description: true,
  targetDate: true,
  completedAt: true,
  status: true,
  verifiedById: true,
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
  template: {
    select: {
      id: true,
      title: true,
      description: true,
      sequenceOrder: true,
    },
  },
  verifiedBy: {
    select: {
      id: true,
      fullName: true,
      role: true,
      email: true,
    },
  },
} as const;

function normalizeDate(d?: string | Date | null): Date | null {
  if (!d) return null;
  if (typeof d === 'string') {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(d);
    if (match) {
      return new Date(
        Date.UTC(parseInt(match[1], 10), parseInt(match[2], 10) - 1, parseInt(match[3], 10))
      );
    }
    const parsed = new Date(d);
    return new Date(
      Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate())
    );
  }
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. List Milestones: GET /api/milestones
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns milestones scoped to the caller's role and authorization.
 */
export async function listMilestones(filters: MilestoneFilters, user: UserContext) {
  const where: Prisma.MilestoneWhereInput = {};
  const assignmentWhere: Prisma.InternshipAssignmentWhereInput = {};

  // Scope enforcement
  if (user.role === 'student') {
    assignmentWhere.studentId = user.id;
  } else if (user.role === 'company') {
    assignmentWhere.companyId = user.id;
  } else if (user.role === 'faculty') {
    assignmentWhere.facultyMentorId = user.id;
  } else if (user.role === 'mentor') {
    assignmentWhere.industryMentorId = user.id;
  } else if (user.role !== 'admin') {
    throw new AppError(403, 'You do not have permission to view milestones.');
  }

  // Filters
  if (filters.assignmentId) {
    where.assignmentId = filters.assignmentId;
  }

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.studentId && (user.role === 'admin' || user.role === 'company' || user.role === 'faculty' || user.role === 'mentor')) {
    assignmentWhere.studentId = filters.studentId;
  }

  if (Object.keys(assignmentWhere).length > 0) {
    where.assignment = assignmentWhere;
  }

  if (filters.dueStartDate || filters.dueEndDate) {
    where.targetDate = {};
    if (filters.dueStartDate) {
      where.targetDate.gte = normalizeDate(filters.dueStartDate) ?? undefined;
    }
    if (filters.dueEndDate) {
      where.targetDate.lte = normalizeDate(filters.dueEndDate) ?? undefined;
    }
  }

  return prisma.milestone.findMany({
    where,
    orderBy: { targetDate: 'asc' },
    select: {
      id: true,
      assignmentId: true,
      templateId: true,
      title: true,
      description: true,
      targetDate: true,
      completedAt: true,
      status: true,
      verifiedById: true,
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
      template: {
        select: {
          id: true,
          title: true,
          sequenceOrder: true,
        },
      },
      verifiedBy: {
        select: {
          id: true,
          fullName: true,
          role: true,
        },
      },
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Get Milestone by ID: GET /api/milestones/:id
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Retrieves a single milestone and enforces assignment-level authorization.
 */
export async function getMilestoneById(id: string, user: UserContext) {
  const milestone = await prisma.milestone.findUnique({
    where: { id },
    select: MILESTONE_DETAIL_SELECT,
  });

  if (!milestone) {
    throw new AppError(404, 'Milestone not found.');
  }

  const assignment = milestone.assignment;
  const isStudent = user.role === 'student' && assignment.studentId === user.id;
  const isCompany = user.role === 'company' && assignment.companyId === user.id;
  const isFaculty = user.role === 'faculty' && assignment.facultyMentorId === user.id;
  const isMentor = user.role === 'mentor' && assignment.industryMentorId === user.id;
  const isAdmin = user.role === 'admin';

  if (!isStudent && !isCompany && !isFaculty && !isMentor && !isAdmin) {
    throw new AppError(403, 'You are not authorized to view this milestone.');
  }

  return milestone;
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Create Milestone: POST /api/milestones
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Creates an operational milestone under an active internship assignment.
 * Allowed: company owner, supervising faculty mentor, admin.
 */
export async function createMilestone(input: CreateMilestoneInput, user: UserContext) {
  const assignment = await prisma.internshipAssignment.findUnique({
    where: { id: input.assignmentId },
    select: {
      id: true,
      studentId: true,
      companyId: true,
      internshipId: true,
      facultyMentorId: true,
      status: true,
    },
  });

  if (!assignment) {
    throw new AppError(404, 'Internship assignment not found.');
  }

  const isCompany = user.role === 'company' && assignment.companyId === user.id;
  const isFaculty = user.role === 'faculty' && assignment.facultyMentorId === user.id;
  const isAdmin = user.role === 'admin';

  if (!isCompany && !isFaculty && !isAdmin) {
    throw new AppError(
      403,
      'You are not authorized to create milestones for this assignment.'
    );
  }

  if (assignment.status === 'terminated' || assignment.status === 'completed') {
    throw new AppError(
      400,
      `Cannot create milestones for an assignment in "${assignment.status}" status.`
    );
  }

  let finalTitle = input.title;
  let finalDescription = input.description;

  // If template is specified, verify it belongs to the assignment's posting
  if (input.templateId) {
    const template = await prisma.internshipMilestoneTemplate.findUnique({
      where: { id: input.templateId },
      select: {
        id: true,
        internshipId: true,
        title: true,
        description: true,
      },
    });

    if (!template) {
      throw new AppError(404, 'Milestone template not found.');
    }

    if (template.internshipId !== assignment.internshipId) {
      throw new AppError(
        400,
        'Milestone template does not belong to the internship posting of this assignment.'
      );
    }

    if (!finalTitle && template.title) {
      finalTitle = template.title;
    }
    if (finalDescription === undefined && template.description) {
      finalDescription = template.description;
    }
  }

  if (!finalTitle || finalTitle.trim().length === 0) {
    throw new AppError(400, 'Milestone title cannot be empty.');
  }

  const targetDate = normalizeDate(input.targetDate);
  if (!targetDate) {
    throw new AppError(400, 'A valid targetDate is required.');
  }

  return prisma.milestone.create({
    data: {
      assignmentId: assignment.id,
      templateId: input.templateId ?? null,
      title: finalTitle.trim(),
      description: finalDescription ?? null,
      targetDate,
      status: input.status ?? 'pending',
    },
    select: MILESTONE_DETAIL_SELECT,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Update Milestone: PATCH /api/milestones/:id
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Updates milestone fields (title, description, targetDate, status, completedAt).
 * Allowed: company owner, supervising faculty mentor, admin.
 */
export async function updateMilestone(
  id: string,
  input: UpdateMilestoneInput,
  user: UserContext
) {
  const milestone = await prisma.milestone.findUnique({
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

  if (!milestone) {
    throw new AppError(404, 'Milestone not found.');
  }

  const isCompany = user.role === 'company' && milestone.assignment.companyId === user.id;
  const isFaculty = user.role === 'faculty' && milestone.assignment.facultyMentorId === user.id;
  const isMentor = user.role === 'mentor' && milestone.assignment.industryMentorId === user.id;
  const isAdmin = user.role === 'admin';

  if (!isCompany && !isFaculty && !isMentor && !isAdmin) {
    throw new AppError(403, 'You are not authorized to update this milestone.');
  }

  const data: Prisma.MilestoneUpdateInput = {};

  if (input.title !== undefined) data.title = input.title.trim();
  if (input.description !== undefined) data.description = input.description;
  if (input.targetDate !== undefined) data.targetDate = normalizeDate(input.targetDate)!;
  if (input.status !== undefined) {
    data.status = input.status;
    if (input.status === 'completed' && !milestone.completedAt && input.completedAt === undefined) {
      data.completedAt = new Date();
      data.verifiedBy = { connect: { id: user.id } };
    } else if (input.status !== 'completed' && milestone.status === 'completed') {
      data.completedAt = null;
      data.verifiedBy = { disconnect: true };
    }
  }
  if (input.completedAt !== undefined) {
    data.completedAt = input.completedAt ? new Date(input.completedAt) : null;
  }

  return prisma.milestone.update({
    where: { id },
    data,
    select: MILESTONE_DETAIL_SELECT,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Update Milestone Status: PATCH /api/milestones/:id/status
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Updates milestone status.
 * Allowed:
 * - Student assigned to the assignment: can transition from pending -> in_progress
 * - Company owner, supervising faculty mentor, admin: full status lifecycle, verified on completion
 */
export async function updateMilestoneStatus(
  id: string,
  input: UpdateMilestoneStatusInput,
  user: UserContext
) {
  const milestone = await prisma.milestone.findUnique({
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

  if (!milestone) {
    throw new AppError(404, 'Milestone not found.');
  }

  const isStudent = user.role === 'student' && milestone.assignment.studentId === user.id;
  const isCompany = user.role === 'company' && milestone.assignment.companyId === user.id;
  const isFaculty = user.role === 'faculty' && milestone.assignment.facultyMentorId === user.id;
  const isMentor = user.role === 'mentor' && milestone.assignment.industryMentorId === user.id;
  const isAdmin = user.role === 'admin';

  if (!isStudent && !isCompany && !isFaculty && !isMentor && !isAdmin) {
    throw new AppError(403, 'You are not authorized to modify this milestone status.');
  }

  // Student permission constraint: only allowed to advance from pending to in_progress
  if (isStudent && !isCompany && !isFaculty && !isMentor && !isAdmin) {
    if (input.status !== 'in_progress') {
      throw new AppError(
        403,
        'Students can only update milestone status to "in_progress". Completion requires mentor or company verification.'
      );
    }
  }

  const data: Prisma.MilestoneUpdateInput = {
    status: input.status,
  };

  if (input.status === 'completed') {
    data.completedAt = milestone.completedAt ?? new Date();
    if (!isStudent) {
      data.verifiedBy = { connect: { id: user.id } };
    }
  } else if (milestone.status === 'completed') {
    data.completedAt = null;
    data.verifiedBy = { disconnect: true };
  }

  return prisma.milestone.update({
    where: { id },
    data,
    select: MILESTONE_DETAIL_SELECT,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Delete Milestone: DELETE /api/milestones/:id
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Deletes a milestone.
 * Allowed: company owner, supervising faculty mentor, admin.
 * Safe deletion: blocked if milestone is already completed or verified.
 */
export async function deleteMilestone(id: string, user: UserContext) {
  const milestone = await prisma.milestone.findUnique({
    where: { id },
    include: {
      assignment: {
        select: {
          companyId: true,
          facultyMentorId: true,
        },
      },
    },
  });

  if (!milestone) {
    throw new AppError(404, 'Milestone not found.');
  }

  const isCompany = user.role === 'company' && milestone.assignment.companyId === user.id;
  const isFaculty = user.role === 'faculty' && milestone.assignment.facultyMentorId === user.id;
  const isAdmin = user.role === 'admin';

  if (!isCompany && !isFaculty && !isAdmin) {
    throw new AppError(403, 'You are not authorized to delete this milestone.');
  }

  if (milestone.status === 'completed' || milestone.verifiedById) {
    throw new AppError(
      409,
      'Cannot delete a completed or verified milestone. Archival status adjustment is recommended.'
    );
  }

  await prisma.milestone.delete({
    where: { id },
  });

  return { id, deleted: true };
}
