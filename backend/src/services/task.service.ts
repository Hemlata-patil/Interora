import { Prisma, TaskStatus, PriorityLevel, SubmissionReviewStatus } from '@prisma/client';
import prisma from './prisma.service';
import { AppError } from '../middleware/errorHandler';

// ─────────────────────────────────────────────────────────────────────────────
// Types & Interfaces
// ─────────────────────────────────────────────────────────────────────────────

export interface CreateTaskInput {
  assignmentId: string;
  templateId?: string | null;
  title: string;
  description?: string | null;
  requiredSkills?: string[];
  priority?: PriorityLevel;
  dueDate?: string | Date | null;
  status?: TaskStatus;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  requiredSkills?: string[];
  priority?: PriorityLevel;
  dueDate?: string | Date | null;
  status?: TaskStatus;
}

export interface UpdateTaskStatusInput {
  status: TaskStatus;
}

export interface CreateTaskSubmissionInput {
  proofUrl: string;
  submissionText?: string | null;
}

export interface ReviewTaskSubmissionInput {
  reviewStatus: SubmissionReviewStatus;
  feedback?: string | null;
}

export interface TaskFilters {
  assignmentId?: string;
  status?: TaskStatus;
  priority?: PriorityLevel;
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

const TASK_DETAIL_SELECT = {
  id: true,
  assignmentId: true,
  templateId: true,
  assignedById: true,
  title: true,
  description: true,
  requiredSkills: true,
  priority: true,
  dueDate: true,
  status: true,
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
      priority: true,
      expectedDays: true,
    },
  },
  assignedBy: {
    select: {
      id: true,
      fullName: true,
      role: true,
      email: true,
    },
  },
  submissions: {
    select: {
      id: true,
      taskId: true,
      submittedById: true,
      submissionText: true,
      proofUrl: true,
      submittedAt: true,
      reviewStatus: true,
      reviewedById: true,
      feedback: true,
      reviewedAt: true,
      submittedBy: {
        select: {
          id: true,
          studentId: true,
          profile: {
            select: {
              id: true,
              fullName: true,
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
    orderBy: { submittedAt: 'desc' as const },
  },
} as const;

function normalizeDueDate(d?: string | Date | null): Date | null {
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
// 1. List Tasks: GET /api/tasks
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns tasks scoped to the caller's role and authorization.
 */
export async function listTasks(filters: TaskFilters, user: UserContext) {
  const where: Prisma.TaskWhereInput = {};
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
    throw new AppError(403, 'You do not have permission to view tasks.');
  }

  // Filters
  if (filters.assignmentId) {
    where.assignmentId = filters.assignmentId;
  }

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.priority) {
    where.priority = filters.priority;
  }

  if (filters.studentId && (user.role === 'admin' || user.role === 'company' || user.role === 'faculty')) {
    assignmentWhere.studentId = filters.studentId;
  }

  if (Object.keys(assignmentWhere).length > 0) {
    where.assignment = assignmentWhere;
  }

  if (filters.dueStartDate || filters.dueEndDate) {
    where.dueDate = {};
    if (filters.dueStartDate) {
      where.dueDate.gte = normalizeDueDate(filters.dueStartDate) ?? undefined;
    }
    if (filters.dueEndDate) {
      where.dueDate.lte = normalizeDueDate(filters.dueEndDate) ?? undefined;
    }
  }

  return prisma.task.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      assignmentId: true,
      templateId: true,
      assignedById: true,
      title: true,
      description: true,
      requiredSkills: true,
      priority: true,
      dueDate: true,
      status: true,
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
        },
      },
      assignedBy: {
        select: {
          id: true,
          fullName: true,
          role: true,
        },
      },
      _count: {
        select: {
          submissions: true,
        },
      },
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Get Task by ID: GET /api/tasks/:id
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Retrieves a single task and enforces assignment-level authorization.
 */
export async function getTaskById(id: string, user: UserContext) {
  const task = await prisma.task.findUnique({
    where: { id },
    select: TASK_DETAIL_SELECT,
  });

  if (!task) {
    throw new AppError(404, 'Task not found.');
  }

  const assignment = task.assignment;
  const isStudent = user.role === 'student' && assignment.studentId === user.id;
  const isCompany = user.role === 'company' && assignment.companyId === user.id;
  const isFaculty = user.role === 'faculty' && assignment.facultyMentorId === user.id;
  const isMentor = user.role === 'mentor' && assignment.industryMentorId === user.id;
  const isAdmin = user.role === 'admin';

  if (!isStudent && !isCompany && !isFaculty && !isMentor && !isAdmin) {
    throw new AppError(403, 'You are not authorized to view this task.');
  }

  return task;
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Create Task: POST /api/tasks
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Creates an operational task under an active internship assignment.
 * Allowed: company owner, supervising faculty mentor, admin.
 */
export async function createTask(input: CreateTaskInput, user: UserContext) {
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
      'You are not authorized to create tasks for this assignment.'
    );
  }

  if (assignment.status === 'terminated' || assignment.status === 'completed') {
    throw new AppError(
      400,
      `Cannot create tasks for an assignment in "${assignment.status}" status.`
    );
  }

  let finalTitle = input.title;
  let finalDescription = input.description;
  let finalPriority = input.priority ?? 'medium';

  // If template is specified, verify it belongs to the assignment's posting
  if (input.templateId) {
    const template = await prisma.internshipTaskTemplate.findUnique({
      where: { id: input.templateId },
      select: {
        id: true,
        internshipId: true,
        title: true,
        description: true,
        priority: true,
      },
    });

    if (!template) {
      throw new AppError(404, 'Task template not found.');
    }

    if (template.internshipId !== assignment.internshipId) {
      throw new AppError(
        400,
        'Task template does not belong to the internship posting of this assignment.'
      );
    }

    if (!finalTitle && template.title) {
      finalTitle = template.title;
    }
    if (finalDescription === undefined && template.description) {
      finalDescription = template.description;
    }
    if (!input.priority && template.priority) {
      finalPriority = template.priority;
    }
  }

  if (!finalTitle || finalTitle.trim().length === 0) {
    throw new AppError(400, 'Task title cannot be empty.');
  }

  const dueDate = normalizeDueDate(input.dueDate);

  return prisma.task.create({
    data: {
      assignmentId: assignment.id,
      templateId: input.templateId ?? null,
      assignedById: user.id,
      title: finalTitle.trim(),
      description: finalDescription ?? null,
      requiredSkills: input.requiredSkills ?? [],
      priority: finalPriority,
      dueDate,
      status: input.status ?? 'assigned',
    },
    select: TASK_DETAIL_SELECT,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Update Task: PATCH /api/tasks/:id
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Updates task fields (title, description, skills, priority, dueDate, status).
 * Allowed: company owner, supervising faculty mentor, admin.
 */
export async function updateTask(id: string, input: UpdateTaskInput, user: UserContext) {
  const task = await prisma.task.findUnique({
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

  if (!task) {
    throw new AppError(404, 'Task not found.');
  }

  const isCompany = user.role === 'company' && task.assignment.companyId === user.id;
  const isFaculty = user.role === 'faculty' && task.assignment.facultyMentorId === user.id;
  const isAdmin = user.role === 'admin';

  if (!isCompany && !isFaculty && !isAdmin) {
    throw new AppError(403, 'You are not authorized to update this task.');
  }

  const data: Prisma.TaskUpdateInput = {};

  if (input.title !== undefined) data.title = input.title.trim();
  if (input.description !== undefined) data.description = input.description;
  if (input.requiredSkills !== undefined) data.requiredSkills = input.requiredSkills;
  if (input.priority !== undefined) data.priority = input.priority;
  if (input.dueDate !== undefined) data.dueDate = normalizeDueDate(input.dueDate);
  if (input.status !== undefined) data.status = input.status;

  return prisma.task.update({
    where: { id },
    data,
    select: TASK_DETAIL_SELECT,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Update Task Status: PATCH /api/tasks/:id/status
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Updates task status.
 * Allowed:
 * - Student assigned to the task (can transition from assigned -> in_progress)
 * - Company owner, supervising faculty mentor, admin (full status lifecycle)
 */
export async function updateTaskStatus(
  id: string,
  input: UpdateTaskStatusInput,
  user: UserContext
) {
  const task = await prisma.task.findUnique({
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

  if (!task) {
    throw new AppError(404, 'Task not found.');
  }

  const isStudent = user.role === 'student' && task.assignment.studentId === user.id;
  const isCompany = user.role === 'company' && task.assignment.companyId === user.id;
  const isFaculty = user.role === 'faculty' && task.assignment.facultyMentorId === user.id;
  const isAdmin = user.role === 'admin';

  if (!isStudent && !isCompany && !isFaculty && !isAdmin) {
    throw new AppError(403, 'You are not authorized to modify this task status.');
  }

  // Student permission constraint: only allowed to advance to in_progress
  if (isStudent && !isCompany && !isFaculty && !isAdmin) {
    if (input.status !== 'in_progress') {
      throw new AppError(
        403,
        'Students can only update task status to "in_progress". Submit work to change status to "submitted".'
      );
    }
  }

  return prisma.task.update({
    where: { id },
    data: { status: input.status },
    select: TASK_DETAIL_SELECT,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Submit Task Work: POST /api/tasks/:taskId/submissions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Submits work proof for a task.
 * Allowed: Assigned student only.
 */
export async function createTaskSubmission(
  taskId: string,
  input: CreateTaskSubmissionInput,
  studentId: string
) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      assignment: {
        select: {
          studentId: true,
          status: true,
        },
      },
    },
  });

  if (!task) {
    throw new AppError(404, 'Task not found.');
  }

  if (task.assignment.studentId !== studentId) {
    throw new AppError(
      403,
      'You are not authorized to submit work for another student\'s task.'
    );
  }

  if (task.status === 'closed') {
    throw new AppError(400, 'Cannot submit work for a closed task.');
  }

  // Atomically create submission and transition task status to 'submitted'
  return prisma.$transaction(async (tx) => {
    const submission = await tx.taskSubmission.create({
      data: {
        taskId,
        submittedById: studentId,
        submissionText: input.submissionText ?? null,
        proofUrl: input.proofUrl,
        reviewStatus: 'pending',
      },
      include: {
        task: {
          select: { id: true, title: true, status: true },
        },
        submittedBy: {
          select: {
            id: true,
            studentId: true,
            profile: { select: { fullName: true } },
          },
        },
      },
    });

    if (task.status === 'assigned' || task.status === 'in_progress') {
      await tx.task.update({
        where: { id: taskId },
        data: { status: 'submitted' },
      });
    }

    return submission;
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. View Submissions: GET /api/tasks/:taskId/submissions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns all submissions for a task.
 * Allowed: Assigned student, host company owner, faculty mentor, industry mentor, admin.
 */
export async function getTaskSubmissions(taskId: string, user: UserContext) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
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

  if (!task) {
    throw new AppError(404, 'Task not found.');
  }

  const assignment = task.assignment;
  const isStudent = user.role === 'student' && assignment.studentId === user.id;
  const isCompany = user.role === 'company' && assignment.companyId === user.id;
  const isFaculty = user.role === 'faculty' && assignment.facultyMentorId === user.id;
  const isMentor = user.role === 'mentor' && assignment.industryMentorId === user.id;
  const isAdmin = user.role === 'admin';

  if (!isStudent && !isCompany && !isFaculty && !isMentor && !isAdmin) {
    throw new AppError(
      403,
      'You are not authorized to view submissions for this task.'
    );
  }

  return prisma.taskSubmission.findMany({
    where: { taskId },
    orderBy: { submittedAt: 'desc' },
    select: {
      id: true,
      taskId: true,
      submittedById: true,
      submissionText: true,
      proofUrl: true,
      submittedAt: true,
      reviewStatus: true,
      reviewedById: true,
      feedback: true,
      reviewedAt: true,
      submittedBy: {
        select: {
          id: true,
          studentId: true,
          profile: {
            select: {
              fullName: true,
              email: true,
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
// 8. Review Submission: PATCH /api/tasks/:taskId/submissions/:submissionId
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Reviews a task submission.
 * Allowed: Host company owner, supervising faculty mentor, admin.
 */
export async function reviewTaskSubmission(
  taskId: string,
  submissionId: string,
  input: ReviewTaskSubmissionInput,
  user: UserContext
) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
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

  if (!task) {
    throw new AppError(404, 'Task not found.');
  }

  const isCompany = user.role === 'company' && task.assignment.companyId === user.id;
  const isFaculty = user.role === 'faculty' && task.assignment.facultyMentorId === user.id;
  const isAdmin = user.role === 'admin';
  let isMentor = false;
  if (user.role === 'mentor') {
    const mentorProfile = await prisma.industryMentorProfile.findUnique({
      where: { id: user.id },
    });
    isMentor = !!mentorProfile && task.assignment.industryMentorId === user.id;
  }

  if (!isCompany && !isFaculty && !isMentor && !isAdmin) {
    throw new AppError(
      403,
      'You are not authorized to review submissions for this task.'
    );
  }

  const submission = await prisma.taskSubmission.findUnique({
    where: { id: submissionId },
  });

  if (!submission) {
    throw new AppError(404, 'Task submission not found.');
  }

  if (submission.taskId !== taskId) {
    throw new AppError(400, 'Submission does not belong to the specified task.');
  }

  if (submission.reviewStatus === input.reviewStatus) {
    throw new AppError(
      400,
      `Task submission is already in '${input.reviewStatus}' status. Repeated invalid transition rejected.`
    );
  }

  return prisma.$transaction(async (tx) => {
    const updated = await tx.taskSubmission.update({
      where: { id: submissionId },
      data: {
        reviewStatus: input.reviewStatus,
        feedback: input.feedback ?? null,
        reviewedById: user.id,
        reviewedAt: new Date(),
      },
      select: {
        id: true,
        taskId: true,
        reviewStatus: true,
        feedback: true,
        reviewedAt: true,
        reviewedById: true,
        reviewedBy: {
          select: {
            id: true,
            fullName: true,
            role: true,
          },
        },
      },
    });

    // If verified, advance task status to 'reviewed'
    if (input.reviewStatus === 'verified' && task.status === 'submitted') {
      await tx.task.update({
        where: { id: taskId },
        data: { status: 'reviewed' },
      });
    }

    return updated;
  });
}
