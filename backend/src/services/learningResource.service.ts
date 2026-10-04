import { Prisma } from '@prisma/client';
import prisma from './prisma.service';
import { AppError } from '../middleware/errorHandler';

// ─────────────────────────────────────────────────────────────────────────────
// Types & Interfaces
// ─────────────────────────────────────────────────────────────────────────────

export interface CreateLearningResourceInput {
  title: string;
  category: string;
  resourceType: string;
  skillTag: string;
  url: string;
  description?: string | null;
  isFree?: boolean;
}

export interface UpdateLearningResourceInput {
  title?: string;
  category?: string;
  resourceType?: string;
  skillTag?: string;
  url?: string;
  description?: string | null;
  isFree?: boolean;
}

export interface LearningResourceFilters {
  category?: string;
  resourceType?: string;
  skillTag?: string;
  isFree?: boolean;
  search?: string;
}

export interface CreateProgressInput {
  studentId?: string;
  resourceId: string;
  status?: string;
  progressPercent?: number;
  completedAt?: Date | string | null;
}

export interface UpdateProgressInput {
  status?: string;
  progressPercent?: number;
  completedAt?: Date | string | null;
}

export interface ProgressFilters {
  studentId?: string;
  resourceId?: string;
  status?: string;
}

export interface UserContext {
  id: string;
  role: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Projections
// ─────────────────────────────────────────────────────────────────────────────

const RESOURCE_SELECT = {
  id: true,
  title: true,
  category: true,
  resourceType: true,
  skillTag: true,
  url: true,
  description: true,
  isFree: true,
  createdAt: true,
  _count: {
    select: {
      progressLogs: true,
    },
  },
} as const;

const PROGRESS_DETAIL_SELECT = {
  id: true,
  studentId: true,
  resourceId: true,
  status: true,
  progressPercent: true,
  completedAt: true,
  resource: {
    select: {
      id: true,
      title: true,
      category: true,
      resourceType: true,
      skillTag: true,
      url: true,
      description: true,
      isFree: true,
    },
  },
  student: {
    select: {
      id: true,
      studentId: true,
      course: true,
      departmentId: true,
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
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Scope & Authorization Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Validates whether the caller has permission to view or manage a student's learning progress.
 */
export async function verifyStudentAccess(studentId: string, user: UserContext): Promise<void> {
  if (user.role === 'admin') {
    return;
  }

  if (user.role === 'student') {
    if (studentId !== user.id) {
      throw new AppError(403, 'Students can only access their own learning progress.');
    }
    return;
  }

  if (user.role === 'faculty') {
    const faculty = await prisma.facultyProfile.findUnique({
      where: { id: user.id },
      select: { departmentId: true },
    });

    if (!faculty) {
      throw new AppError(403, 'Faculty profile not found.');
    }

    const student = await prisma.studentProfile.findUnique({
      where: { id: studentId },
      select: {
        departmentId: true,
        facultyMappings: {
          where: { facultyId: user.id },
          select: { id: true },
        },
        assignments: {
          where: { facultyMentorId: user.id },
          select: { id: true },
        },
      },
    });

    if (!student) {
      throw new AppError(404, 'Student not found.');
    }

    const isAssigned = student.facultyMappings.length > 0 || student.assignments.length > 0;
    const isSameDept = student.departmentId === faculty.departmentId;

    if (!isAssigned && !isSameDept) {
      throw new AppError(
        403,
        'You are not authorized to view or manage learning progress for this student.'
      );
    }
    return;
  }

  if (user.role === 'company') {
    const assignment = await prisma.internshipAssignment.findFirst({
      where: {
        studentId,
        companyId: user.id,
      },
      select: { id: true },
    });

    if (!assignment) {
      throw new AppError(
        403,
        'You can only view or manage learning progress for interns hosted by your company.'
      );
    }
    return;
  }

  if (user.role === 'mentor') {
    const assignment = await prisma.internshipAssignment.findFirst({
      where: {
        studentId,
        industryMentorId: user.id,
      },
      select: { id: true },
    });

    if (!assignment) {
      throw new AppError(
        403,
        'You can only view or manage learning progress for interns assigned to you.'
      );
    }
    return;
  }

  throw new AppError(403, 'You do not have permission to access student learning progress.');
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Learning Resource Catalog Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Lists learning resources with optional filtering.
 * All authenticated roles can browse resources.
 */
export async function listLearningResources(
  filters: LearningResourceFilters,
  user: UserContext
) {
  const where: Prisma.LearningResourceWhereInput = {};

  if (filters.category) {
    where.category = { equals: filters.category, mode: 'insensitive' };
  }

  if (filters.resourceType) {
    where.resourceType = { equals: filters.resourceType, mode: 'insensitive' };
  }

  if (filters.skillTag) {
    where.skillTag = { equals: filters.skillTag, mode: 'insensitive' };
  }

  if (filters.isFree !== undefined) {
    where.isFree = filters.isFree;
  }

  if (filters.search && filters.search.trim()) {
    const term = filters.search.trim();
    where.OR = [
      { title: { contains: term, mode: 'insensitive' } },
      { skillTag: { contains: term, mode: 'insensitive' } },
      { description: { contains: term, mode: 'insensitive' } },
      { category: { contains: term, mode: 'insensitive' } },
    ];
  }

  // If the caller is a student, attach their personal progress record
  if (user.role === 'student') {
    return prisma.learningResource.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        ...RESOURCE_SELECT,
        progressLogs: {
          where: { studentId: user.id },
          select: {
            id: true,
            status: true,
            progressPercent: true,
            completedAt: true,
          },
        },
      },
    });
  }

  return prisma.learningResource.findMany({
    where,
    orderBy: { createdAt: 'desc', title: 'asc' },
    select: RESOURCE_SELECT,
  });
}

/**
 * Gets a single learning resource by ID.
 */
export async function getLearningResourceById(id: string, user: UserContext) {
  const resource = await prisma.learningResource.findUnique({
    where: { id },
    select: {
      ...RESOURCE_SELECT,
      progressLogs:
        user.role === 'student'
          ? {
              where: { studentId: user.id },
              select: {
                id: true,
                status: true,
                progressPercent: true,
                completedAt: true,
              },
            }
          : false,
    },
  });

  if (!resource) {
    throw new AppError(404, 'Learning resource not found.');
  }

  return resource;
}

/**
 * Creates a new learning resource in the catalog.
 * Allowed: Faculty, Mentor, Company, Admin.
 */
export async function createLearningResource(
  input: CreateLearningResourceInput,
  user: UserContext
) {
  if (user.role === 'student') {
    throw new AppError(403, 'Students are not authorized to create learning resources.');
  }

  return prisma.learningResource.create({
    data: {
      title: input.title.trim(),
      category: input.category.trim(),
      resourceType: input.resourceType.trim(),
      skillTag: input.skillTag.trim(),
      url: input.url.trim(),
      description: input.description?.trim() || null,
      isFree: input.isFree !== undefined ? input.isFree : true,
    },
    select: RESOURCE_SELECT,
  });
}

/**
 * Updates an existing learning resource.
 * Allowed: Faculty, Mentor, Company, Admin.
 */
export async function updateLearningResource(
  id: string,
  input: UpdateLearningResourceInput,
  user: UserContext
) {
  if (user.role === 'student') {
    throw new AppError(403, 'Students are not authorized to update learning resources.');
  }

  const existing = await prisma.learningResource.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existing) {
    throw new AppError(404, 'Learning resource not found.');
  }

  const data: Prisma.LearningResourceUpdateInput = {};

  if (input.title !== undefined) data.title = input.title.trim();
  if (input.category !== undefined) data.category = input.category.trim();
  if (input.resourceType !== undefined) data.resourceType = input.resourceType.trim();
  if (input.skillTag !== undefined) data.skillTag = input.skillTag.trim();
  if (input.url !== undefined) data.url = input.url.trim();
  if (input.description !== undefined) data.description = input.description?.trim() || null;
  if (input.isFree !== undefined) data.isFree = input.isFree;

  return prisma.learningResource.update({
    where: { id },
    data,
    select: RESOURCE_SELECT,
  });
}

/**
 * Deletes a learning resource and cascades its progress logs within a transaction.
 * Allowed: Faculty, Admin.
 */
export async function deleteLearningResource(id: string, user: UserContext) {
  if (user.role !== 'admin' && user.role !== 'faculty') {
    throw new AppError(403, 'Only faculty and administrators can delete learning resources.');
  }

  const existing = await prisma.learningResource.findUnique({
    where: { id },
    select: { id: true, title: true },
  });

  if (!existing) {
    throw new AppError(404, 'Learning resource not found.');
  }

  return prisma.$transaction(async (tx) => {
    // Delete progress logs first if not handled by cascade
    await tx.studentLearningProgress.deleteMany({
      where: { resourceId: id },
    });

    return tx.learningResource.delete({
      where: { id },
      select: { id: true, title: true },
    });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Student Learning Progress Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Lists learning progress records scoped by caller role and filters.
 */
export async function listStudentLearningProgress(
  filters: ProgressFilters,
  user: UserContext
) {
  const where: Prisma.StudentLearningProgressWhereInput = {};

  if (user.role === 'student') {
    // Students can ONLY view their own progress records
    where.studentId = user.id;
  } else if (filters.studentId) {
    // Verify authorized access to specific student
    await verifyStudentAccess(filters.studentId, user);
    where.studentId = filters.studentId;
  } else if (user.role === 'faculty') {
    // Fetch all students in faculty's department or supervised by them
    const faculty = await prisma.facultyProfile.findUnique({
      where: { id: user.id },
      select: { departmentId: true },
    });

    if (faculty) {
      where.student = {
        OR: [
          { departmentId: faculty.departmentId },
          { facultyMappings: { some: { facultyId: user.id } } },
          { assignments: { some: { facultyMentorId: user.id } } },
        ],
      };
    }
  } else if (user.role === 'company') {
    where.student = {
      assignments: { some: { companyId: user.id } },
    };
  } else if (user.role === 'mentor') {
    where.student = {
      assignments: { some: { industryMentorId: user.id } },
    };
  } else if (user.role !== 'admin') {
    throw new AppError(403, 'You do not have permission to view student learning progress.');
  }

  if (filters.resourceId) {
    where.resourceId = filters.resourceId;
  }

  if (filters.status) {
    where.status = filters.status;
  }

  return prisma.studentLearningProgress.findMany({
    where,
    orderBy: [{ progressPercent: 'desc' }, { completedAt: 'desc' }],
    select: PROGRESS_DETAIL_SELECT,
  });
}

/**
 * Gets a single learning progress record by ID.
 */
export async function getStudentLearningProgressById(id: string, user: UserContext) {
  const progress = await prisma.studentLearningProgress.findUnique({
    where: { id },
    select: PROGRESS_DETAIL_SELECT,
  });

  if (!progress) {
    throw new AppError(404, 'Learning progress record not found.');
  }

  await verifyStudentAccess(progress.studentId, user);

  return progress;
}

/**
 * Creates a new learning progress record.
 * - Students can create progress for themselves.
 * - Faculty/Mentor/Company/Admin can recommend or assign progress to a student within their scope.
 * - Prevents duplicate records by checking the unique compound key (studentId, resourceId).
 */
export async function createStudentLearningProgress(
  input: CreateProgressInput,
  user: UserContext
) {
  let targetStudentId: string;

  if (user.role === 'student') {
    if (input.studentId && input.studentId !== user.id) {
      throw new AppError(403, 'Students can only create progress records for themselves.');
    }
    targetStudentId = user.id;
  } else {
    if (!input.studentId) {
      throw new AppError(400, 'studentId is required when creating progress for a student.');
    }
    targetStudentId = input.studentId;
    await verifyStudentAccess(targetStudentId, user);
  }

  // Verify student profile exists
  const student = await prisma.studentProfile.findUnique({
    where: { id: targetStudentId },
    select: { id: true },
  });

  if (!student) {
    throw new AppError(404, 'Student profile not found.');
  }

  // Verify resource exists
  const resource = await prisma.learningResource.findUnique({
    where: { id: input.resourceId },
    select: { id: true },
  });

  if (!resource) {
    throw new AppError(404, 'Learning resource not found.');
  }

  // Prevent duplicate progress records (unique constraint on studentId, resourceId)
  const existing = await prisma.studentLearningProgress.findUnique({
    where: {
      studentId_resourceId: {
        studentId: targetStudentId,
        resourceId: input.resourceId,
      },
    },
  });

  if (existing) {
    throw new AppError(
      409,
      'A progress record for this student and resource already exists. Use PATCH to update it.'
    );
  }

  const progressPercent = Math.min(100, Math.max(0, input.progressPercent ?? 0));
  const status = input.status?.trim() || (progressPercent === 100 ? 'completed' : 'recommended');

  let completedAt: Date | null = null;
  if (input.completedAt) {
    completedAt = new Date(input.completedAt);
  } else if (progressPercent === 100 || status === 'completed') {
    completedAt = new Date();
  }

  return prisma.studentLearningProgress.create({
    data: {
      studentId: targetStudentId,
      resourceId: input.resourceId,
      status,
      progressPercent,
      completedAt,
    },
    select: PROGRESS_DETAIL_SELECT,
  });
}

/**
 * Upserts a student's learning progress for a specific resource.
 * Convenience endpoint particularly useful for student interactive learning sessions.
 */
export async function upsertStudentLearningProgress(
  resourceId: string,
  input: UpdateProgressInput & { studentId?: string },
  user: UserContext
) {
  let targetStudentId: string;

  if (user.role === 'student') {
    targetStudentId = user.id;
  } else {
    if (!input.studentId) {
      throw new AppError(400, 'studentId is required for this operation.');
    }
    targetStudentId = input.studentId;
    await verifyStudentAccess(targetStudentId, user);
  }

  // Verify resource exists
  const resource = await prisma.learningResource.findUnique({
    where: { id: resourceId },
    select: { id: true },
  });

  if (!resource) {
    throw new AppError(404, 'Learning resource not found.');
  }

  // Verify student profile exists
  const student = await prisma.studentProfile.findUnique({
    where: { id: targetStudentId },
    select: { id: true },
  });

  if (!student) {
    throw new AppError(404, 'Student profile not found.');
  }

  return prisma.$transaction(async (tx) => {
    const existing = await tx.studentLearningProgress.findUnique({
      where: {
        studentId_resourceId: {
          studentId: targetStudentId,
          resourceId,
        },
      },
    });

    const progressPercent =
      input.progressPercent !== undefined
        ? Math.min(100, Math.max(0, input.progressPercent))
        : existing?.progressPercent ?? 0;

    let status = input.status?.trim() || existing?.status || 'in_progress';
    if (progressPercent === 100 && (!input.status || input.status === 'in_progress')) {
      status = 'completed';
    }

    let completedAt: Date | null | undefined = undefined;
    if (input.completedAt !== undefined) {
      completedAt = input.completedAt ? new Date(input.completedAt) : null;
    } else if (progressPercent === 100 || status === 'completed') {
      completedAt = existing?.completedAt ?? new Date();
    } else if (progressPercent < 100 && status !== 'completed' && existing?.completedAt) {
      completedAt = null;
    }

    return tx.studentLearningProgress.upsert({
      where: {
        studentId_resourceId: {
          studentId: targetStudentId,
          resourceId,
        },
      },
      create: {
        studentId: targetStudentId,
        resourceId,
        status,
        progressPercent,
        completedAt: completedAt ?? (progressPercent === 100 ? new Date() : null),
      },
      update: {
        status,
        progressPercent,
        completedAt,
      },
      select: PROGRESS_DETAIL_SELECT,
    });
  });
}

/**
 * Updates an existing learning progress record.
 */
export async function updateStudentLearningProgress(
  id: string,
  input: UpdateProgressInput,
  user: UserContext
) {
  const existing = await prisma.studentLearningProgress.findUnique({
    where: { id },
    select: {
      id: true,
      studentId: true,
      status: true,
      progressPercent: true,
      completedAt: true,
    },
  });

  if (!existing) {
    throw new AppError(404, 'Learning progress record not found.');
  }

  await verifyStudentAccess(existing.studentId, user);

  const data: Prisma.StudentLearningProgressUpdateInput = {};

  if (input.status !== undefined) {
    const trimmed = input.status.trim();
    if (!trimmed) throw new AppError(400, 'status cannot be empty.');
    data.status = trimmed;
  }

  if (input.progressPercent !== undefined) {
    data.progressPercent = Math.min(100, Math.max(0, input.progressPercent));
  }

  // Handle completedAt timestamp logically
  const newPercent = input.progressPercent !== undefined ? input.progressPercent : existing.progressPercent;
  const newStatus = input.status !== undefined ? input.status.trim() : existing.status;

  if (input.completedAt !== undefined) {
    data.completedAt = input.completedAt ? new Date(input.completedAt) : null;
  } else if ((newPercent === 100 || newStatus === 'completed') && !existing.completedAt) {
    data.completedAt = new Date();
  } else if (newPercent < 100 && newStatus !== 'completed' && existing.completedAt) {
    data.completedAt = null;
  }

  return prisma.studentLearningProgress.update({
    where: { id },
    data,
    select: PROGRESS_DETAIL_SELECT,
  });
}

/**
 * Deletes a learning progress record.
 * Allowed: The student who owns it, faculty in scope, or admin.
 */
export async function deleteStudentLearningProgress(id: string, user: UserContext) {
  const existing = await prisma.studentLearningProgress.findUnique({
    where: { id },
    select: { id: true, studentId: true },
  });

  if (!existing) {
    throw new AppError(404, 'Learning progress record not found.');
  }

  await verifyStudentAccess(existing.studentId, user);

  return prisma.studentLearningProgress.delete({
    where: { id },
    select: { id: true, studentId: true, resourceId: true },
  });
}
