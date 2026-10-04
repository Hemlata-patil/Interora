import { Prisma, ReportStatus } from '@prisma/client';
import prisma from './prisma.service';
import { AppError } from '../middleware/errorHandler';

// ─────────────────────────────────────────────────────────────────────────────
// Types & Interfaces
// ─────────────────────────────────────────────────────────────────────────────

export interface CreateWeeklyReportInput {
  assignmentId: string;
  weekNumber: number;
  startDate: string | Date;
  endDate: string | Date;
  aiDraftContent?: string | null;
  finalContent?: string | null;
  status?: ReportStatus;
}

export interface UpdateWeeklyReportInput {
  startDate?: string | Date;
  endDate?: string | Date;
  aiDraftContent?: string | null;
  finalContent?: string | null;
  mentorFeedback?: string | null;
}

export interface UpdateWeeklyReportStatusInput {
  status: ReportStatus;
  mentorFeedback?: string | null;
}

export interface WeeklyReportFilters {
  assignmentId?: string;
  studentId?: string;
  status?: ReportStatus;
  weekNumber?: number;
  startDate?: string | Date;
  endDate?: string | Date;
}

export interface UserContext {
  id: string;
  role: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Projections & Helpers
// ─────────────────────────────────────────────────────────────────────────────

const WEEKLY_REPORT_SELECT = {
  id: true,
  assignmentId: true,
  weekNumber: true,
  startDate: true,
  endDate: true,
  aiDraftContent: true,
  finalContent: true,
  status: true,
  submittedAt: true,
  mentorFeedback: true,
  reviewedAt: true,
  reviewedById: true,
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
  reviewedBy: {
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
// 1. List Weekly Reports: GET /api/weekly-reports
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns weekly reports scoped to caller's role.
 */
export async function listWeeklyReports(
  filters: WeeklyReportFilters,
  user: UserContext
) {
  const where: Prisma.WeeklyReportWhereInput = {};
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
    throw new AppError(403, 'You do not have permission to view weekly reports.');
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

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.weekNumber !== undefined) {
    where.weekNumber = filters.weekNumber;
  }

  if (filters.startDate || filters.endDate) {
    if (filters.startDate) {
      where.startDate = { gte: normalizeDate(filters.startDate)! };
    }
    if (filters.endDate) {
      where.endDate = { lte: normalizeDate(filters.endDate)! };
    }
  }

  return prisma.weeklyReport.findMany({
    where,
    orderBy: { weekNumber: 'desc' },
    select: {
      id: true,
      assignmentId: true,
      weekNumber: true,
      startDate: true,
      endDate: true,
      aiDraftContent: true,
      finalContent: true,
      status: true,
      submittedAt: true,
      mentorFeedback: true,
      reviewedAt: true,
      reviewedById: true,
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
      reviewedBy: {
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
// 2. Get Weekly Report by ID: GET /api/weekly-reports/:id
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Retrieves a single weekly report, verifies authorization,
 * and fetches the work logs for that week's date range.
 */
export async function getWeeklyReportById(id: string, user: UserContext) {
  const report = await prisma.weeklyReport.findUnique({
    where: { id },
    select: WEEKLY_REPORT_SELECT,
  });

  if (!report) {
    throw new AppError(404, 'Weekly report not found.');
  }

  const assignment = report.assignment;
  const isStudent = user.role === 'student' && assignment.studentId === user.id;
  const isCompany = user.role === 'company' && assignment.companyId === user.id;
  const isFaculty = user.role === 'faculty' && assignment.facultyMentorId === user.id;
  const isMentor = user.role === 'mentor' && assignment.industryMentorId === user.id;
  const isAdmin = user.role === 'admin';

  if (!isStudent && !isCompany && !isFaculty && !isMentor && !isAdmin) {
    throw new AppError(403, 'You are not authorized to view this weekly report.');
  }

  // Fetch the work logs for this assignment during this report's week period
  const workLogs = await prisma.workLog.findMany({
    where: {
      assignmentId: report.assignmentId,
      logDate: {
        gte: report.startDate,
        lte: report.endDate,
      },
    },
    orderBy: { logDate: 'asc' },
    select: {
      id: true,
      logDate: true,
      hoursWorked: true,
      taskTitle: true,
      completedWork: true,
      blockers: true,
      nextPlan: true,
    },
  });

  return {
    ...report,
    workLogs,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Create Weekly Report: POST /api/weekly-reports
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Creates a weekly report.
 * Allowed: assigned student (or admin).
 */
export async function createWeeklyReport(
  input: CreateWeeklyReportInput,
  user: UserContext
) {
  const assignment = await prisma.internshipAssignment.findUnique({
    where: { id: input.assignmentId },
    select: {
      id: true,
      studentId: true,
      companyId: true,
      internshipId: true,
      status: true,
    },
  });

  if (!assignment) {
    throw new AppError(404, 'Internship assignment not found.');
  }

  const isStudent = user.role === 'student' && assignment.studentId === user.id;
  const isAdmin = user.role === 'admin';

  if (!isStudent && !isAdmin) {
    throw new AppError(
      403,
      'You are not authorized to create a weekly report for this assignment.'
    );
  }

  if (assignment.status === 'terminated' || assignment.status === 'suspended') {
    throw new AppError(
      400,
      `Cannot create a weekly report for an assignment in "${assignment.status}" status.`
    );
  }

  // Check unique constraint: @@unique([assignmentId, weekNumber])
  const existing = await prisma.weeklyReport.findUnique({
    where: {
      assignmentId_weekNumber: {
        assignmentId: assignment.id,
        weekNumber: input.weekNumber,
      },
    },
  });

  if (existing) {
    throw new AppError(
      409,
      `A weekly report for week ${input.weekNumber} already exists for this assignment.`
    );
  }

  const startDate = normalizeDate(input.startDate);
  const endDate = normalizeDate(input.endDate);

  if (!startDate || !endDate) {
    throw new AppError(400, 'Valid startDate and endDate are required.');
  }

  if (startDate > endDate) {
    throw new AppError(400, 'startDate cannot be after endDate.');
  }

  let aiDraft = input.aiDraftContent?.trim();

  // If aiDraftContent is not supplied, auto-synthesize from the week's work logs
  if (!aiDraft) {
    const logs = await prisma.workLog.findMany({
      where: {
        assignmentId: assignment.id,
        logDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { logDate: 'asc' },
    });

    if (logs.length > 0) {
      const totalHours = logs.reduce(
        (sum, l) => sum + Number(l.hoursWorked),
        0
      );
      const tasksSummary = logs
        .map(
          (l, i) =>
            `${i + 1}. ${l.taskTitle} (${Number(l.hoursWorked)} hrs): ${l.completedWork}`
        )
        .join('\n');
      aiDraft = `Week ${input.weekNumber} Automated Synthesis (${logs.length} work logs recorded, ${totalHours.toFixed(1)} total hours):\n${tasksSummary}`;
    } else {
      aiDraft = `Weekly Report for Week ${input.weekNumber}: Deliverables and activities conducted during this sprint period.`;
    }
  }

  const initialStatus = input.status ?? 'draft';
  const submittedAt = initialStatus === 'submitted' ? new Date() : null;

  return prisma.weeklyReport.create({
    data: {
      assignmentId: assignment.id,
      weekNumber: input.weekNumber,
      startDate,
      endDate,
      aiDraftContent: aiDraft,
      finalContent: input.finalContent ? input.finalContent.trim() : aiDraft,
      status: initialStatus,
      submittedAt,
    },
    select: WEEKLY_REPORT_SELECT,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Update Weekly Report: PATCH /api/weekly-reports/:id
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Updates a weekly report.
 * - Student: can update finalContent, aiDraftContent, startDate, endDate while report is in 'draft' or 'submitted'.
 * - Company / Faculty / Admin: can update mentorFeedback, finalContent.
 */
export async function updateWeeklyReport(
  id: string,
  input: UpdateWeeklyReportInput,
  user: UserContext
) {
  const report = await prisma.weeklyReport.findUnique({
    where: { id },
    include: {
      assignment: {
        select: {
          studentId: true,
          companyId: true,
          facultyMentorId: true,
        },
      },
    },
  });

  if (!report) {
    throw new AppError(404, 'Weekly report not found.');
  }

  const isStudent = user.role === 'student' && report.assignment.studentId === user.id;
  const isCompany = user.role === 'company' && report.assignment.companyId === user.id;
  const isFaculty = user.role === 'faculty' && report.assignment.facultyMentorId === user.id;
  const isAdmin = user.role === 'admin';

  if (!isStudent && !isCompany && !isFaculty && !isAdmin) {
    throw new AppError(403, 'You are not authorized to update this weekly report.');
  }

  if (isStudent && report.status === 'reviewed') {
    throw new AppError(409, 'Cannot edit a weekly report that has already been reviewed.');
  }

  const data: Prisma.WeeklyReportUpdateInput = {};

  if (input.finalContent !== undefined) {
    data.finalContent = input.finalContent ? input.finalContent.trim() : null;
  }

  if (input.aiDraftContent !== undefined && (isStudent || isAdmin)) {
    data.aiDraftContent = input.aiDraftContent ? input.aiDraftContent.trim() : report.aiDraftContent;
  }

  if (input.startDate !== undefined && (isStudent || isAdmin)) {
    const start = normalizeDate(input.startDate);
    if (!start) throw new AppError(400, 'Invalid startDate format.');
    data.startDate = start;
  }

  if (input.endDate !== undefined && (isStudent || isAdmin)) {
    const end = normalizeDate(input.endDate);
    if (!end) throw new AppError(400, 'Invalid endDate format.');
    data.endDate = end;
  }

  if (input.mentorFeedback !== undefined && (isCompany || isFaculty || isAdmin)) {
    data.mentorFeedback = input.mentorFeedback ? input.mentorFeedback.trim() : null;
  }

  return prisma.weeklyReport.update({
    where: { id },
    data,
    select: WEEKLY_REPORT_SELECT,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Update Weekly Report Status: PATCH /api/weekly-reports/:id/status
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Updates status of weekly report:
 * - Student: draft -> submitted
 * - Company / Faculty / Admin: submitted -> reviewed (or revision to draft)
 */
export async function updateWeeklyReportStatus(
  id: string,
  input: UpdateWeeklyReportStatusInput,
  user: UserContext
) {
  const report = await prisma.weeklyReport.findUnique({
    where: { id },
    include: {
      assignment: {
        select: {
          studentId: true,
          companyId: true,
          facultyMentorId: true,
        },
      },
    },
  });

  if (!report) {
    throw new AppError(404, 'Weekly report not found.');
  }

  const isStudent = user.role === 'student' && report.assignment.studentId === user.id;
  const isCompany = user.role === 'company' && report.assignment.companyId === user.id;
  const isFaculty = user.role === 'faculty' && report.assignment.facultyMentorId === user.id;
  const isAdmin = user.role === 'admin';

  if (!isStudent && !isCompany && !isFaculty && !isAdmin) {
    throw new AppError(403, 'You are not authorized to update this report status.');
  }

  if (isStudent && !isCompany && !isFaculty && !isAdmin) {
    if (input.status !== 'submitted') {
      throw new AppError(
        403,
        'Students can only transition weekly report status to "submitted".'
      );
    }
  }

  const data: Prisma.WeeklyReportUpdateInput = {
    status: input.status,
  };

  if (input.status === 'submitted') {
    data.submittedAt = report.submittedAt ?? new Date();
  } else if (input.status === 'reviewed') {
    data.reviewedAt = new Date();
    data.reviewedBy = { connect: { id: user.id } };
    if (input.mentorFeedback !== undefined) {
      data.mentorFeedback = input.mentorFeedback ? input.mentorFeedback.trim() : null;
    }
  } else if (input.status === 'draft') {
    data.reviewedAt = null;
    data.reviewedBy = { disconnect: true };
  }

  return prisma.weeklyReport.update({
    where: { id },
    data,
    select: WEEKLY_REPORT_SELECT,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Delete Weekly Report: DELETE /api/weekly-reports/:id
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Deletes a weekly report.
 * Allowed: Student (only while draft), Admin.
 * Rejects submitted/reviewed reports with 409 Conflict.
 */
export async function deleteWeeklyReport(id: string, user: UserContext) {
  const report = await prisma.weeklyReport.findUnique({
    where: { id },
    include: {
      assignment: {
        select: {
          studentId: true,
        },
      },
    },
  });

  if (!report) {
    throw new AppError(404, 'Weekly report not found.');
  }

  const isStudent = user.role === 'student' && report.assignment.studentId === user.id;
  const isAdmin = user.role === 'admin';

  if (!isStudent && !isAdmin) {
    throw new AppError(403, 'You are not authorized to delete this weekly report.');
  }

  if (report.status === 'submitted' || report.status === 'reviewed') {
    throw new AppError(
      409,
      `Cannot delete a weekly report in "${report.status}" status. Only draft reports may be deleted.`
    );
  }

  await prisma.weeklyReport.delete({
    where: { id },
  });

  return { id, deleted: true };
}
