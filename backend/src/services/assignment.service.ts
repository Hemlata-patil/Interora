import { Prisma, AssignmentStatus } from '@prisma/client';
import prisma from './prisma.service';
import { AppError } from '../middleware/errorHandler';

// ─────────────────────────────────────────────────────────────────────────────
// Types & Interfaces
// ─────────────────────────────────────────────────────────────────────────────

export interface CreateAssignmentInput {
  applicationId: string;
  startDate?: string | Date;
  endDate?: string | Date;
  facultyMentorId?: string;
  industryMentorId?: string;
  status?: AssignmentStatus;
}

export interface UpdateAssignmentInput {
  startDate?: string | Date;
  endDate?: string | Date;
  actualCompletionDate?: string | Date | null;
  facultyMentorId?: string;
  industryMentorId?: string;
  status?: AssignmentStatus;
  terminationReason?: string | null;
}

export interface UpdateAssignmentStatusInput {
  status: AssignmentStatus;
  terminationReason?: string | null;
  actualCompletionDate?: string | Date | null;
}

export interface AssignmentFilters {
  status?: AssignmentStatus;
  studentId?: string;
  companyId?: string;
  internshipId?: string;
}

export interface UserContext {
  id: string;
  role: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Projections
// ─────────────────────────────────────────────────────────────────────────────

const ASSIGNMENT_DETAIL_SELECT = {
  id: true,
  applicationId: true,
  studentId: true,
  companyId: true,
  internshipId: true,
  facultyMentorId: true,
  industryMentorId: true,
  startDate: true,
  endDate: true,
  actualCompletionDate: true,
  status: true,
  terminationReason: true,
  createdAt: true,
  updatedAt: true,
  student: {
    select: {
      id: true,
      studentId: true,
      course: true,
      batchYear: true,
      batchDivision: true,
      currentSemester: true,
      cgpa: true,
      skills: true,
      resumeUrl: true,
      department: {
        select: {
          id: true,
          code: true,
          name: true,
        },
      },
      profile: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          avatarUrl: true,
        },
      },
    },
  },
  internship: {
    select: {
      id: true,
      title: true,
      industryDomain: true,
      location: true,
      workMode: true,
      internshipType: true,
      duration: true,
      stipend: true,
      status: true,
      applicationDeadline: true,
    },
  },
  company: {
    select: {
      id: true,
      companyName: true,
      industryDomain: true,
      contactPerson: true,
      officialEmail: true,
      phone: true,
      website: true,
    },
  },
  facultyMentor: {
    select: {
      id: true,
      facultyId: true,
      designation: true,
      cabinLocation: true,
      officePhone: true,
      profile: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
        },
      },
    },
  },
  industryMentor: {
    select: {
      id: true,
      designation: true,
      corporateDepartment: true,
      expertiseAreas: true,
      profile: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
        },
      },
    },
  },
  application: {
    select: {
      id: true,
      status: true,
      coverLetter: true,
      resumeUrl: true,
      appliedAt: true,
    },
  },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// 1. Create Assignment: POST /api/assignments
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Creates an operational internship assignment from a selected student application.
 *
 * Rules:
 * - Application must exist and be in 'selected' status
 * - Requester must be authorized (admin or host company owner)
 * - No duplicate assignment for this application (1:1 constraint)
 * - Student must not already have an active/upcoming assignment
 * - Resolves valid facultyMentorId and industryMentorId
 * - Uses a Prisma transaction for atomic assignment creation
 */
export async function createAssignment(input: CreateAssignmentInput, user: UserContext) {
  // 1. Fetch application with posting, student, and existing assignment
  const application = await prisma.studentApplication.findUnique({
    where: { id: input.applicationId },
    include: {
      internship: {
        select: {
          id: true,
          companyId: true,
          title: true,
          duration: true,
        },
      },
      student: {
        select: {
          id: true,
          departmentId: true,
        },
      },
      assignment: {
        select: { id: true },
      },
    },
  });

  if (!application) {
    throw new AppError(404, 'Student application not found.');
  }

  // 2. Company authorization check
  if (user.role === 'company' && application.internship.companyId !== user.id) {
    throw new AppError(
      403,
      'You are not authorized to create assignments for another company\'s postings.'
    );
  }

  // 3. Application status check: must be selected
  if (application.status !== 'selected') {
    throw new AppError(
      400,
      `Application must be in "selected" status before creating an assignment. Current status: "${application.status}".`
    );
  }

  // 4. Check if an assignment already exists for this application
  if (application.assignment) {
    throw new AppError(
      409,
      `An assignment (${application.assignment.id}) has already been established for this application.`
    );
  }

  // 5. Check if the student already has an active or upcoming assignment
  const activeAssignment = await prisma.internshipAssignment.findFirst({
    where: {
      studentId: application.studentId,
      status: { in: ['upcoming', 'active'] },
    },
    select: { id: true, status: true },
  });

  if (activeAssignment) {
    throw new AppError(
      409,
      `Student already has an ${activeAssignment.status} internship assignment (${activeAssignment.id}).`
    );
  }

  // 6. Resolve Faculty Mentor
  let facultyMentorId = input.facultyMentorId;
  if (facultyMentorId) {
    const faculty = await prisma.facultyProfile.findUnique({
      where: { id: facultyMentorId },
      select: { id: true },
    });
    if (!faculty) {
      throw new AppError(404, 'Specified faculty mentor profile does not exist.');
    }
  } else {
    // Attempt auto-resolution: check existing supervisor assignment or department faculty
    const facAssign = await prisma.facultyStudentAssignment.findFirst({
      where: { studentId: application.studentId },
      select: { facultyId: true },
    });
    if (facAssign) {
      facultyMentorId = facAssign.facultyId;
    } else {
      const deptFaculty = await prisma.facultyProfile.findFirst({
        where: { departmentId: application.student.departmentId },
        select: { id: true },
      });
      if (deptFaculty) {
        facultyMentorId = deptFaculty.id;
      }
    }
  }

  if (!facultyMentorId) {
    throw new AppError(
      400,
      'facultyMentorId is required: no faculty mentor could be automatically resolved for this student.'
    );
  }

  // 7. Resolve Industry Mentor
  let industryMentorId = input.industryMentorId;
  if (industryMentorId) {
    const indMentor = await prisma.industryMentorProfile.findUnique({
      where: { id: industryMentorId },
      select: { id: true, companyId: true },
    });
    if (!indMentor) {
      throw new AppError(404, 'Specified industry mentor profile does not exist.');
    }
    if (indMentor.companyId !== application.internship.companyId) {
      throw new AppError(
        400,
        'Specified industry mentor does not belong to the host company.'
      );
    }
  } else {
    // Attempt auto-resolution: find mentor registered under the company
    const compMentor = await prisma.industryMentorProfile.findFirst({
      where: { companyId: application.internship.companyId },
      select: { id: true },
    });
    if (compMentor) {
      industryMentorId = compMentor.id;
    }
  }

  if (!industryMentorId) {
    throw new AppError(
      400,
      'industryMentorId is required: no industry mentor could be automatically resolved for this company.'
    );
  }

  // 8. Dates & Status
  const startDate = input.startDate ? new Date(input.startDate) : new Date();
  const endDate = input.endDate
    ? new Date(input.endDate)
    : new Date(startDate.getTime() + 90 * 24 * 60 * 60 * 1000);

  if (endDate < startDate) {
    throw new AppError(400, 'End date cannot be earlier than start date.');
  }

  const initialStatus = input.status ?? 'upcoming';

  // 9. Atomic Creation via Prisma Transaction
  try {
    return await prisma.$transaction(async (tx) => {
      const created = await tx.internshipAssignment.create({
        data: {
          applicationId: application.id,
          studentId: application.studentId,
          companyId: application.internship.companyId,
          internshipId: application.internshipId,
          facultyMentorId: facultyMentorId!,
          industryMentorId: industryMentorId!,
          startDate,
          endDate,
          status: initialStatus,
        },
        select: ASSIGNMENT_DETAIL_SELECT,
      });

      return created;
    });
  } catch (err: unknown) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2002') {
        throw new AppError(409, 'An assignment already exists for this application.');
      }
    }
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. List Assignments: GET /api/assignments
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns assignments filtered by caller authorization and optional query params.
 */
export async function listAssignments(filters: AssignmentFilters, user: UserContext) {
  const where: Prisma.InternshipAssignmentWhereInput = {};

  // Role-based scope enforcement
  if (user.role === 'student') {
    where.studentId = user.id;
  } else if (user.role === 'company') {
    where.companyId = user.id;
  } else if (user.role === 'faculty') {
    where.facultyMentorId = user.id;
  } else if (user.role === 'mentor') {
    where.industryMentorId = user.id;
  } else if (user.role !== 'admin') {
    throw new AppError(403, 'You do not have permission to view assignments.');
  }

  // Apply filters
  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.studentId && (user.role === 'admin' || user.role === 'company' || user.role === 'faculty')) {
    where.studentId = filters.studentId;
  }

  if (filters.companyId && user.role === 'admin') {
    where.companyId = filters.companyId;
  }

  if (filters.internshipId) {
    where.internshipId = filters.internshipId;
  }

  return prisma.internshipAssignment.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    select: ASSIGNMENT_DETAIL_SELECT,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Get Assignment by ID: GET /api/assignments/:id
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Retrieves a single assignment and enforces role-based authorization at the service layer.
 */
export async function getAssignmentById(id: string, user: UserContext) {
  const assignment = await prisma.internshipAssignment.findUnique({
    where: { id },
    select: ASSIGNMENT_DETAIL_SELECT,
  });

  if (!assignment) {
    throw new AppError(404, 'Internship assignment not found.');
  }

  if (user.role === 'student' && assignment.studentId !== user.id) {
    throw new AppError(403, 'You are not authorized to view another student\'s assignment.');
  }

  if (user.role === 'company' && assignment.companyId !== user.id) {
    throw new AppError(403, 'You are not authorized to view assignments for another company.');
  }

  if (user.role === 'faculty' && assignment.facultyMentorId !== user.id) {
    throw new AppError(403, 'You are not authorized to view this assignment.');
  }

  if (user.role === 'mentor' && assignment.industryMentorId !== user.id) {
    throw new AppError(403, 'You are not authorized to view this assignment.');
  }

  return assignment;
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Update Assignment: PATCH /api/assignments/:id
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Updates assignment details (dates, mentors, status, termination reason).
 * Allowed for admin and the host company owner.
 */
export async function updateAssignment(
  id: string,
  input: UpdateAssignmentInput,
  user: UserContext
) {
  const assignment = await prisma.internshipAssignment.findUnique({
    where: { id },
    select: {
      id: true,
      companyId: true,
      startDate: true,
      endDate: true,
    },
  });

  if (!assignment) {
    throw new AppError(404, 'Internship assignment not found.');
  }

  if (user.role === 'company' && assignment.companyId !== user.id) {
    throw new AppError(
      403,
      'You are not authorized to update assignments for another company.'
    );
  }

  const data: Prisma.InternshipAssignmentUpdateInput = {};

  const effectiveStart = input.startDate ? new Date(input.startDate) : assignment.startDate;
  const effectiveEnd = input.endDate ? new Date(input.endDate) : assignment.endDate;

  if (input.startDate !== undefined) {
    data.startDate = effectiveStart;
  }

  if (input.endDate !== undefined) {
    data.endDate = effectiveEnd;
  }

  if (effectiveEnd < effectiveStart) {
    throw new AppError(400, 'End date cannot be earlier than start date.');
  }

  if (input.actualCompletionDate !== undefined) {
    data.actualCompletionDate = input.actualCompletionDate
      ? new Date(input.actualCompletionDate)
      : null;
  }

  if (input.status !== undefined) {
    data.status = input.status;
  }

  if (input.terminationReason !== undefined) {
    data.terminationReason = input.terminationReason;
  }

  if (input.facultyMentorId !== undefined) {
    const faculty = await prisma.facultyProfile.findUnique({
      where: { id: input.facultyMentorId },
      select: { id: true },
    });
    if (!faculty) {
      throw new AppError(404, 'Specified faculty mentor profile does not exist.');
    }
    data.facultyMentor = { connect: { id: input.facultyMentorId } };
  }

  if (input.industryMentorId !== undefined) {
    const indMentor = await prisma.industryMentorProfile.findUnique({
      where: { id: input.industryMentorId },
      select: { id: true, companyId: true },
    });
    if (!indMentor) {
      throw new AppError(404, 'Specified industry mentor profile does not exist.');
    }
    if (indMentor.companyId !== assignment.companyId) {
      throw new AppError(
        400,
        'Specified industry mentor does not belong to the host company.'
      );
    }
    data.industryMentor = { connect: { id: input.industryMentorId } };
  }

  try {
    return await prisma.internshipAssignment.update({
      where: { id },
      data,
      select: ASSIGNMENT_DETAIL_SELECT,
    });
  } catch (err: unknown) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2025') {
        throw new AppError(404, 'Internship assignment not found.');
      }
    }
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Update Status: PATCH /api/assignments/:id/status
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Updates assignment status and handles lifecycle transitions:
 * - 'completed': sets actualCompletionDate if not provided
 * - 'terminated': stores terminationReason
 */
export async function updateAssignmentStatus(
  id: string,
  input: UpdateAssignmentStatusInput,
  user: UserContext
) {
  const assignment = await prisma.internshipAssignment.findUnique({
    where: { id },
    select: { id: true, companyId: true, status: true },
  });

  if (!assignment) {
    throw new AppError(404, 'Internship assignment not found.');
  }

  if (user.role === 'company' && assignment.companyId !== user.id) {
    throw new AppError(
      403,
      'You are not authorized to update assignments for another company.'
    );
  }

  const data: Prisma.InternshipAssignmentUpdateInput = {
    status: input.status,
  };

  if (input.status === 'completed') {
    data.actualCompletionDate = input.actualCompletionDate
      ? new Date(input.actualCompletionDate)
      : new Date();
  }

  if (input.status === 'terminated') {
    if (input.terminationReason) {
      data.terminationReason = input.terminationReason;
    }
  }

  try {
    return await prisma.internshipAssignment.update({
      where: { id },
      data,
      select: ASSIGNMENT_DETAIL_SELECT,
    });
  } catch (err: unknown) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2025') {
        throw new AppError(404, 'Internship assignment not found.');
      }
    }
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Delete Assignment: DELETE /api/assignments/:id
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Safely deletes an assignment if and only if zero operational child records
 * reference it (attendance, tasks, milestones, work logs, weekly reports,
 * evaluations, certificates, PPO).
 *
 * Returns HTTP 409 if dependent records exist.
 */
export async function deleteAssignment(id: string, user: UserContext) {
  const assignment = await prisma.internshipAssignment.findUnique({
    where: { id },
    select: {
      id: true,
      companyId: true,
      status: true,
      _count: {
        select: {
          attendanceRecords: true,
          tasks: true,
          milestones: true,
          workLogs: true,
          weeklyReports: true,
          evaluations: true,
          healthSnapshots: true,
          riskFlags: true,
        },
      },
      ppoOffer: { select: { id: true } },
      certificate: { select: { id: true } },
    },
  });

  if (!assignment) {
    throw new AppError(404, 'Internship assignment not found.');
  }

  if (user.role === 'company' && assignment.companyId !== user.id) {
    throw new AppError(
      403,
      'You are not authorized to delete assignments for another company.'
    );
  }

  const depCount =
    assignment._count.attendanceRecords +
    assignment._count.tasks +
    assignment._count.milestones +
    assignment._count.workLogs +
    assignment._count.weeklyReports +
    assignment._count.evaluations +
    assignment._count.healthSnapshots +
    assignment._count.riskFlags +
    (assignment.ppoOffer ? 1 : 0) +
    (assignment.certificate ? 1 : 0);

  if (depCount > 0) {
    throw new AppError(
      409,
      `Cannot delete assignment because it has ${depCount} dependent operational record(s) (attendance, tasks, milestones, logs, or evaluations). Consider transitioning status to "terminated" instead.`
    );
  }

  try {
    await prisma.internshipAssignment.delete({ where: { id } });
    return { id, message: 'Assignment deleted successfully.' };
  } catch (err: unknown) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2025') {
        throw new AppError(404, 'Internship assignment not found.');
      }
    }
    throw err;
  }
}
