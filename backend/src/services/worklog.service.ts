import { Prisma } from '@prisma/client';
import prisma from './prisma.service';
import { AppError } from '../middleware/errorHandler';

// ─────────────────────────────────────────────────────────────────────────────
// Types & Interfaces
// ─────────────────────────────────────────────────────────────────────────────

export interface CreateWorkLogInput {
  assignmentId: string;
  taskId?: string | null;
  taskTitle?: string;
  logDate?: string | Date | null;
  hoursWorked?: number | string;
  completedWork: string;
  blockers?: string | null;
  nextPlan?: string | null;
}

export interface UpdateWorkLogInput {
  taskId?: string | null;
  taskTitle?: string;
  logDate?: string | Date | null;
  hoursWorked?: number | string;
  completedWork?: string;
  blockers?: string | null;
  nextPlan?: string | null;
}

export interface WorkLogFilters {
  assignmentId?: string;
  studentId?: string;
  taskTitle?: string;
  startDate?: string | Date;
  endDate?: string | Date;
}

export interface UserContext {
  id: string;
  role: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Projections & Date Normalization
// ─────────────────────────────────────────────────────────────────────────────

const WORKLOG_DETAIL_SELECT = {
  id: true,
  assignmentId: true,
  logDate: true,
  hoursWorked: true,
  taskTitle: true,
  completedWork: true,
  blockers: true,
  nextPlan: true,
  createdAt: true,
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
// 1. List Work Logs: GET /api/work-logs
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns work logs scoped to the caller's role and authorization.
 */
export async function listWorkLogs(filters: WorkLogFilters, user: UserContext) {
  const where: Prisma.WorkLogWhereInput = {};
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
    throw new AppError(403, 'You do not have permission to view work logs.');
  }

  // Filters
  if (filters.assignmentId) {
    where.assignmentId = filters.assignmentId;
  }

  if (filters.studentId && (user.role === 'admin' || user.role === 'company' || user.role === 'faculty')) {
    assignmentWhere.studentId = filters.studentId;
  }

  if (Object.keys(assignmentWhere).length > 0) {
    where.assignment = assignmentWhere;
  }

  if (filters.taskTitle) {
    where.taskTitle = { contains: filters.taskTitle, mode: 'insensitive' };
  }

  if (filters.startDate || filters.endDate) {
    where.logDate = {};
    if (filters.startDate) {
      where.logDate.gte = normalizeDate(filters.startDate) ?? undefined;
    }
    if (filters.endDate) {
      where.logDate.lte = normalizeDate(filters.endDate) ?? undefined;
    }
  }

  return prisma.workLog.findMany({
    where,
    orderBy: { logDate: 'desc' },
    select: {
      id: true,
      assignmentId: true,
      logDate: true,
      hoursWorked: true,
      taskTitle: true,
      completedWork: true,
      blockers: true,
      nextPlan: true,
      createdAt: true,
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
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Get Work Log by ID: GET /api/work-logs/:id
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Retrieves a single work log and enforces assignment-level authorization.
 */
export async function getWorkLogById(id: string, user: UserContext) {
  const workLog = await prisma.workLog.findUnique({
    where: { id },
    select: WORKLOG_DETAIL_SELECT,
  });

  if (!workLog) {
    throw new AppError(404, 'Work log not found.');
  }

  const assignment = workLog.assignment;
  const isStudent = user.role === 'student' && assignment.studentId === user.id;
  const isCompany = user.role === 'company' && assignment.companyId === user.id;
  const isFaculty = user.role === 'faculty' && assignment.facultyMentorId === user.id;
  const isMentor = user.role === 'mentor' && assignment.industryMentorId === user.id;
  const isAdmin = user.role === 'admin';

  if (!isStudent && !isCompany && !isFaculty && !isMentor && !isAdmin) {
    throw new AppError(403, 'You are not authorized to view this work log.');
  }

  return workLog;
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Create Work Log: POST /api/work-logs
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Creates an operational work log under an active internship assignment.
 * Allowed: assigned student, admin, or company.
 */
export async function createWorkLog(input: CreateWorkLogInput, user: UserContext) {
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

  const isStudent = user.role === 'student' && assignment.studentId === user.id;
  const isCompany = user.role === 'company' && assignment.companyId === user.id;
  const isAdmin = user.role === 'admin';

  if (!isStudent && !isCompany && !isAdmin) {
    throw new AppError(
      403,
      'You are not authorized to create work logs for this assignment.'
    );
  }

  if (assignment.status === 'terminated' || assignment.status === 'suspended') {
    throw new AppError(
      400,
      `Cannot log work for an assignment in "${assignment.status}" status.`
    );
  }

  let finalTaskTitle = input.taskTitle?.trim();

  // If taskId is provided, verify it belongs to the same assignment
  if (input.taskId) {
    const task = await prisma.task.findUnique({
      where: { id: input.taskId },
      select: {
        id: true,
        assignmentId: true,
        title: true,
      },
    });

    if (!task) {
      throw new AppError(404, 'Task not found.');
    }

    if (task.assignmentId !== assignment.id) {
      throw new AppError(
        400,
        'Specified task does not belong to the internship assignment.'
      );
    }

    if (!finalTaskTitle) {
      finalTaskTitle = task.title;
    }
  }

  if (!finalTaskTitle || finalTaskTitle.length === 0) {
    throw new AppError(400, 'taskTitle is required.');
  }

  const logDate = normalizeDate(input.logDate) ?? new Date();
  const hoursWorked = input.hoursWorked !== undefined ? new Prisma.Decimal(input.hoursWorked) : new Prisma.Decimal(8.0);

  return prisma.workLog.create({
    data: {
      assignmentId: assignment.id,
      logDate,
      hoursWorked,
      taskTitle: finalTaskTitle,
      completedWork: input.completedWork.trim(),
      blockers: input.blockers?.trim() || 'None',
      nextPlan: input.nextPlan?.trim() || 'Continue deliverables',
    },
    select: WORKLOG_DETAIL_SELECT,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Update Work Log: PATCH /api/work-logs/:id
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Updates a work log.
 * Allowed: assigned student, company owner, or admin.
 */
export async function updateWorkLog(
  id: string,
  input: UpdateWorkLogInput,
  user: UserContext
) {
  const workLog = await prisma.workLog.findUnique({
    where: { id },
    include: {
      assignment: {
        select: {
          id: true,
          studentId: true,
          companyId: true,
          facultyMentorId: true,
          status: true,
        },
      },
    },
  });

  if (!workLog) {
    throw new AppError(404, 'Work log not found.');
  }

  const isStudent = user.role === 'student' && workLog.assignment.studentId === user.id;
  const isCompany = user.role === 'company' && workLog.assignment.companyId === user.id;
  const isFaculty = user.role === 'faculty' && workLog.assignment.facultyMentorId === user.id;
  const isAdmin = user.role === 'admin';

  if (!isStudent && !isCompany && !isFaculty && !isAdmin) {
    throw new AppError(403, 'You are not authorized to update this work log.');
  }

  if (workLog.assignment.status === 'terminated' || workLog.assignment.status === 'completed') {
    throw new AppError(
      400,
      `Cannot update work logs for an assignment in "${workLog.assignment.status}" status.`
    );
  }

  const data: Prisma.WorkLogUpdateInput = {};

  if (input.taskId) {
    const task = await prisma.task.findUnique({
      where: { id: input.taskId },
      select: {
        id: true,
        assignmentId: true,
        title: true,
      },
    });

    if (!task) {
      throw new AppError(404, 'Task not found.');
    }

    if (task.assignmentId !== workLog.assignment.id) {
      throw new AppError(
        400,
        'Specified task does not belong to the internship assignment.'
      );
    }

    if (input.taskTitle === undefined) {
      data.taskTitle = task.title;
    }
  }

  if (input.taskTitle !== undefined) {
    const trimmed = input.taskTitle.trim();
    if (!trimmed) {
      throw new AppError(400, 'taskTitle cannot be empty.');
    }
    data.taskTitle = trimmed;
  }

  if (input.logDate !== undefined) {
    const normalized = normalizeDate(input.logDate);
    if (!normalized) {
      throw new AppError(400, 'A valid logDate is required.');
    }
    data.logDate = normalized;
  }

  if (input.hoursWorked !== undefined) {
    data.hoursWorked = new Prisma.Decimal(input.hoursWorked);
  }

  if (input.completedWork !== undefined) {
    const trimmed = input.completedWork.trim();
    if (!trimmed) {
      throw new AppError(400, 'completedWork cannot be empty.');
    }
    data.completedWork = trimmed;
  }

  if (input.blockers !== undefined) {
    data.blockers = input.blockers ? input.blockers.trim() : 'None';
  }

  if (input.nextPlan !== undefined) {
    data.nextPlan = input.nextPlan ? input.nextPlan.trim() : 'Continue deliverables';
  }

  return prisma.workLog.update({
    where: { id },
    data,
    select: WORKLOG_DETAIL_SELECT,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Delete Work Log: DELETE /api/work-logs/:id
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Deletes a work log.
 * Allowed: assigned student, company owner, or admin.
 * Safe deletion: blocked if assignment is terminated or completed.
 */
export async function deleteWorkLog(id: string, user: UserContext) {
  const workLog = await prisma.workLog.findUnique({
    where: { id },
    include: {
      assignment: {
        select: {
          studentId: true,
          companyId: true,
          status: true,
        },
      },
    },
  });

  if (!workLog) {
    throw new AppError(404, 'Work log not found.');
  }

  const isStudent = user.role === 'student' && workLog.assignment.studentId === user.id;
  const isCompany = user.role === 'company' && workLog.assignment.companyId === user.id;
  const isAdmin = user.role === 'admin';

  if (!isStudent && !isCompany && !isAdmin) {
    throw new AppError(403, 'You are not authorized to delete this work log.');
  }

  if (workLog.assignment.status === 'terminated' || workLog.assignment.status === 'completed') {
    throw new AppError(
      409,
      `Cannot delete historical work logs for an assignment in "${workLog.assignment.status}" status.`
    );
  }

  await prisma.workLog.delete({
    where: { id },
  });

  return { id, deleted: true };
}
