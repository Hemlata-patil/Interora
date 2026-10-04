import prisma from './prisma.service';
import { AppError } from '../middleware/errorHandler';
import { SubmissionReviewStatus, Prisma } from '@prisma/client';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface CompanyMentorDashboardMetrics {
  totalInterns: number;
  totalTasks: number;
  completedTasks: number;
  pendingReviews: number;
  verifiedTasks: number;
}

export interface CompanyMentorInternRecord {
  assignmentId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  internshipTitle: string;
  companyName: string;
  status: string;
  assignedAt: string;
}

export interface CompanyMentorTaskRecord {
  id: string;
  title: string;
  description: string;
  studentId: string;
  studentName: string;
  dueDate: string;
  completed: boolean;
  reviewStatus: string;
}

export interface UpdateMentorTaskReviewInput {
  reviewStatus: string;
  feedback?: string | null;
}

interface MentorScope {
  isAll: boolean;
  companyId?: string;
  industryMentorId?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Resolve Scope & Verify Ownership
// ─────────────────────────────────────────────────────────────────────────────

async function resolveMentorScope(user: { id: string; role: string }): Promise<MentorScope> {
  if (user.role === 'admin') {
    return { isAll: true };
  }
  if (user.role === 'company') {
    return { isAll: false, companyId: user.id };
  }
  if (user.role === 'mentor') {
    const mentorProfile = await prisma.industryMentorProfile.findUnique({
      where: { id: user.id },
    });
    if (!mentorProfile) {
      throw new AppError(403, 'No active industry mentor profile found for this user.');
    }
    return {
      isAll: false,
      industryMentorId: user.id,
    };
  }
  throw new AppError(403, 'You do not have permission to access mentor resources.');
}

function buildAssignmentWhere(scope: MentorScope): Prisma.InternshipAssignmentWhereInput {
  if (scope.isAll) {
    return {};
  }
  if (scope.industryMentorId) {
    return { industryMentorId: scope.industryMentorId };
  }
  if (scope.companyId) {
    return { companyId: scope.companyId };
  }
  return { id: '00000000-0000-0000-0000-000000000000' };
}

function normalizeReviewStatus(rawStatus: string): SubmissionReviewStatus {
  const normalized = rawStatus.trim().toLowerCase().replace(/\s+/g, '_');
  if (normalized === 'verified') {
    return SubmissionReviewStatus.verified;
  }
  if (normalized === 'correction_required') {
    return SubmissionReviewStatus.correction_required;
  }
  if (normalized === 'rejected') {
    return SubmissionReviewStatus.rejected;
  }
  if (normalized === 'pending') {
    return SubmissionReviewStatus.pending;
  }
  throw new AppError(
    400,
    "Invalid review status. Allowed values: 'Verified' or 'Correction Required'."
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Dashboard Metrics: GET /api/mentor/metrics
// ─────────────────────────────────────────────────────────────────────────────

export async function getMentorDashboardMetrics(user: {
  id: string;
  role: string;
}): Promise<CompanyMentorDashboardMetrics> {
  const scope = await resolveMentorScope(user);
  const assignmentWhere = buildAssignmentWhere(scope);

  const assignments = await prisma.internshipAssignment.findMany({
    where: assignmentWhere,
    select: {
      id: true,
      studentId: true,
      tasks: {
        select: {
          id: true,
          status: true,
          submissions: {
            orderBy: { submittedAt: 'desc' },
            take: 1,
            select: {
              reviewStatus: true,
            },
          },
        },
      },
    },
  });

  const totalInterns = assignments.length;
  let totalTasks = 0;
  let completedTasks = 0;
  let pendingReviews = 0;
  let verifiedTasks = 0;

  for (const assign of assignments) {
    for (const task of assign.tasks) {
      totalTasks++;
      const hasSubmissions = task.submissions.length > 0;
      const latestSub = hasSubmissions ? task.submissions[0] : null;
      const isCompleted =
        task.status === 'submitted' ||
        task.status === 'reviewed' ||
        task.status === 'closed' ||
        hasSubmissions;

      if (isCompleted) {
        completedTasks++;
        const isVerified =
          latestSub?.reviewStatus === SubmissionReviewStatus.verified ||
          task.status === 'reviewed';

        if (isVerified) {
          verifiedTasks++;
        } else {
          pendingReviews++;
        }
      }
    }
  }

  return {
    totalInterns,
    totalTasks,
    completedTasks,
    pendingReviews,
    verifiedTasks,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Mentor Interns: GET /api/mentor/interns
// ─────────────────────────────────────────────────────────────────────────────

export async function getMentorInterns(user: {
  id: string;
  role: string;
}): Promise<CompanyMentorInternRecord[]> {
  const scope = await resolveMentorScope(user);
  const assignmentWhere = buildAssignmentWhere(scope);

  const assignments = await prisma.internshipAssignment.findMany({
    where: assignmentWhere,
    include: {
      student: {
        include: {
          profile: true,
        },
      },
      internship: true,
      company: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  if (assignments.length > 0) {
    return assignments.map((a) => {
      const studentProfile = a.student?.profile;
      return {
        assignmentId: a.id,
        studentId: a.studentId,
        studentName: studentProfile?.fullName || 'Assigned Intern',
        studentEmail: studentProfile?.email || 'intern@interora.app',
        internshipTitle: a.internship?.title || 'Active Role',
        companyName: a.company?.companyName || 'Host Company',
        status:
          a.status === 'active'
            ? 'Active'
            : a.status.charAt(0).toUpperCase() + a.status.slice(1),
        assignedAt: a.createdAt.toISOString(),
      };
    });
  }

  // Fallback: If no direct assignments exist yet, check selected applications for authorized company (company role only)
  if (user.role === 'company' && scope.companyId) {
    const selectedApps = await prisma.studentApplication.findMany({
      where: {
        status: 'selected',
        internship: {
          companyId: scope.companyId,
        },
      },
      include: {
        student: {
          include: {
            profile: true,
          },
        },
        internship: {
          include: {
            company: true,
          },
        },
      },
      orderBy: { appliedAt: 'desc' },
    });

    return selectedApps.map((app) => ({
      assignmentId: `app_${app.id}`,
      studentId: app.studentId,
      studentName: app.student?.profile?.fullName || 'Active Intern Candidate',
      studentEmail: app.student?.profile?.email || 'intern@interora.app',
      internshipTitle: app.internship?.title || 'Active Role',
      companyName: app.internship?.company?.companyName || 'Host Company',
      status: 'Active',
      assignedAt: app.appliedAt.toISOString(),
    }));
  }

  return [];
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Mentor Tasks: GET /api/mentor/tasks
// ─────────────────────────────────────────────────────────────────────────────

export async function getMentorTasks(user: {
  id: string;
  role: string;
}): Promise<CompanyMentorTaskRecord[]> {
  const scope = await resolveMentorScope(user);
  const assignmentWhere = buildAssignmentWhere(scope);

  const tasks = await prisma.task.findMany({
    where: {
      assignment: assignmentWhere,
    },
    include: {
      assignment: {
        include: {
          student: {
            include: {
              profile: true,
            },
          },
        },
      },
      submissions: {
        orderBy: { submittedAt: 'desc' },
        take: 1,
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return tasks.map((t) => {
    const latestSub = t.submissions[0];
    const isCompleted =
      t.status === 'submitted' ||
      t.status === 'reviewed' ||
      t.status === 'closed' ||
      t.submissions.length > 0;

    let reviewStatus = 'Not Submitted';
    if (latestSub) {
      if (latestSub.reviewStatus === SubmissionReviewStatus.verified) {
        reviewStatus = 'Verified';
      } else if (latestSub.reviewStatus === SubmissionReviewStatus.correction_required) {
        reviewStatus = 'Correction Required';
      } else if (latestSub.reviewStatus === SubmissionReviewStatus.rejected) {
        reviewStatus = 'Rejected';
      } else {
        reviewStatus = 'Pending Review';
      }
    } else if (t.status === 'reviewed') {
      reviewStatus = 'Verified';
    } else if (t.status === 'submitted') {
      reviewStatus = 'Pending Review';
    }

    return {
      id: t.id,
      title: t.title,
      description: t.description || 'Sprint deliverable item',
      studentId: t.assignment.studentId,
      studentName: t.assignment.student?.profile?.fullName || 'Assigned Intern',
      dueDate: t.dueDate ? t.dueDate.toISOString().slice(0, 10) : '2026-08-31',
      completed: isCompleted,
      reviewStatus,
    };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Update Mentor Task Review: POST / PATCH /api/mentor/tasks/:taskId/review
// ─────────────────────────────────────────────────────────────────────────────

export async function updateMentorTaskReview(
  taskId: string,
  input: UpdateMentorTaskReviewInput,
  user: { id: string; role: string }
) {
  const targetStatus = normalizeReviewStatus(input.reviewStatus);

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      assignment: {
        select: {
          id: true,
          companyId: true,
          industryMentorId: true,
          studentId: true,
        },
      },
      submissions: {
        orderBy: { submittedAt: 'desc' },
      },
    },
  });

  if (!task) {
    throw new AppError(404, 'Task not found.');
  }

  // Authorization and strict cross-company protection
  if (user.role === 'company') {
    if (task.assignment.companyId !== user.id) {
      throw new AppError(
        403,
        'Cross-company review rejected: you do not have authorization to review tasks for another company.'
      );
    }
  } else if (user.role === 'mentor') {
    const mentorProfile = await prisma.industryMentorProfile.findUnique({
      where: { id: user.id },
    });
    if (!mentorProfile) {
      throw new AppError(403, 'You do not have an active industry mentor profile.');
    }
    const isAuthorized = task.assignment.industryMentorId === user.id;

    if (!isAuthorized) {
      throw new AppError(
        403,
        'Cross-mentor review rejected: you do not have authorization to review tasks assigned to another mentor.'
      );
    }
  } else if (user.role !== 'admin') {
    throw new AppError(403, 'You do not have permission to review tasks.');
  }

  // Prevent repeated invalid transitions
  const latestSubmission = task.submissions[0];
  if (latestSubmission && latestSubmission.reviewStatus === targetStatus) {
    throw new AppError(
      400,
      `Task review is already in '${targetStatus}' status. Repeated invalid transition rejected.`
    );
  }

  return prisma.$transaction(async (tx) => {
    let submissionId: string;

    if (latestSubmission) {
      submissionId = latestSubmission.id;
      await tx.taskSubmission.update({
        where: { id: latestSubmission.id },
        data: {
          reviewStatus: targetStatus,
          feedback: input.feedback?.trim() || 'Reviewed by host mentor.',
          reviewedById: user.id,
          reviewedAt: new Date(),
        },
      });
    } else {
      // Create a submission record to capture the review safely in PostgreSQL
      const newSub = await tx.taskSubmission.create({
        data: {
          taskId,
          submittedById: task.assignment.studentId,
          proofUrl: 'mentor-direct-verification',
          submissionText: 'Direct deliverable verification by host mentor.',
          reviewStatus: targetStatus,
          feedback: input.feedback?.trim() || 'Reviewed by host mentor.',
          reviewedById: user.id,
          reviewedAt: new Date(),
        },
      });
      submissionId = newSub.id;
    }

    // Advance or adjust Task status according to review outcome
    if (targetStatus === SubmissionReviewStatus.verified) {
      await tx.task.update({
        where: { id: taskId },
        data: { status: 'reviewed' },
      });
    } else if (targetStatus === SubmissionReviewStatus.correction_required) {
      await tx.task.update({
        where: { id: taskId },
        data: { status: 'in_progress' },
      });
    }

    return {
      success: true,
      taskId,
      submissionId,
      reviewStatus:
        targetStatus === SubmissionReviewStatus.verified
          ? 'Verified'
          : targetStatus === SubmissionReviewStatus.correction_required
          ? 'Correction Required'
          : targetStatus,
      reviewedAt: new Date(),
    };
  });
}
