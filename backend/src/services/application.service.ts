import { Prisma, ApplicationStatus } from '@prisma/client';
import prisma from './prisma.service';
import { AppError } from '../middleware/errorHandler';

// ─────────────────────────────────────────────────────────────────────────────
// Types & Interfaces
// ─────────────────────────────────────────────────────────────────────────────

export interface CreateApplicationInput {
  internshipId: string;
  coverLetter?: string | null;
  resumeUrl?: string | null;
}

export interface UpdateApplicationStatusInput {
  status: ApplicationStatus;
  companyRemarks?: string | null;
}

export interface UserContext {
  id: string;
  role: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Select Projections
// ─────────────────────────────────────────────────────────────────────────────

const APPLICATION_DETAIL_SELECT = {
  id: true,
  internshipId: true,
  studentId: true,
  coverLetter: true,
  resumeUrl: true,
  status: true,
  facultyRating: true,
  facultyFeedback: true,
  facultyReviewedAt: true,
  facultyReviewedById: true,
  allocatorMatchScore: true,
  allocatorScoreBreakdown: true,
  companyRemarks: true,
  appliedAt: true,
  updatedAt: true,
  internship: {
    select: {
      id: true,
      companyId: true,
      title: true,
      industryDomain: true,
      location: true,
      workMode: true,
      internshipType: true,
      duration: true,
      stipend: true,
      status: true,
      applicationDeadline: true,
      vacancies: true,
      company: {
        select: {
          id: true,
          companyName: true,
          industryDomain: true,
          website: true,
        },
      },
    },
  },
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
  assignment: {
    select: {
      id: true,
      status: true,
      startDate: true,
      endDate: true,
    },
  },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// 1. Student Views Own Applications: GET /api/applications/my
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns all applications submitted by the authenticated student,
 * ordered newest first.
 */
export async function getStudentApplications(studentId: string) {
  return prisma.studentApplication.findMany({
    where: { studentId },
    orderBy: { appliedAt: 'desc' },
    select: {
      id: true,
      internshipId: true,
      studentId: true,
      coverLetter: true,
      resumeUrl: true,
      status: true,
      facultyRating: true,
      facultyFeedback: true,
      facultyReviewedAt: true,
      companyRemarks: true,
      appliedAt: true,
      updatedAt: true,
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
          company: {
            select: {
              id: true,
              companyName: true,
              industryDomain: true,
              website: true,
            },
          },
        },
      },
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Student Applies: POST /api/applications
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Submits an application for an open internship posting.
 *
 * Enforces business rules:
 * - Student profile must exist in database
 * - Posting must exist, be 'open', and deadline not passed
 * - Posting must have remaining vacancies
 * - Student cannot apply twice to the same posting (returns 409)
 */
export async function createApplication(input: CreateApplicationInput, studentId: string) {
  // 1. Verify student profile exists
  const student = await prisma.studentProfile.findUnique({
    where: { id: studentId },
    select: { id: true, resumeUrl: true },
  });

  if (!student) {
    throw new AppError(
      400,
      'Student profile not found. Please ensure your student profile is set up before applying.'
    );
  }

  // 2. Verify posting exists and is open
  const posting = await prisma.internshipPosting.findUnique({
    where: { id: input.internshipId },
    select: {
      id: true,
      title: true,
      status: true,
      vacancies: true,
      applicationDeadline: true,
    },
  });

  if (!posting) {
    throw new AppError(404, 'Internship posting not found.');
  }

  if (posting.status !== 'open') {
    throw new AppError(
      400,
      `Cannot apply to posting "${posting.title}" because it is currently ${posting.status}.`
    );
  }

  // 3. Verify application deadline has not expired
  if (posting.applicationDeadline && posting.applicationDeadline < new Date()) {
    throw new AppError(
      400,
      `The application deadline for "${posting.title}" passed on ${posting.applicationDeadline.toISOString().slice(0, 10)}.`
    );
  }

  // 4. Verify posting has remaining vacancies
  if (posting.vacancies !== undefined && posting.vacancies > 0) {
    const selectedCount = await prisma.studentApplication.count({
      where: {
        internshipId: posting.id,
        status: 'selected',
      },
    });

    if (selectedCount >= posting.vacancies) {
      throw new AppError(
        400,
        `This internship posting has no remaining vacancies (${selectedCount}/${posting.vacancies} positions filled).`
      );
    }
  }

  // 5. Prevent duplicate application
  const existing = await prisma.studentApplication.findUnique({
    where: {
      internshipId_studentId: {
        internshipId: input.internshipId,
        studentId,
      },
    },
  });

  if (existing) {
    throw new AppError(
      409,
      'You have already submitted an application for this internship position.'
    );
  }

  // 6. Create application
  try {
    return await prisma.studentApplication.create({
      data: {
        internshipId: input.internshipId,
        studentId,
        coverLetter: input.coverLetter ?? null,
        resumeUrl: input.resumeUrl ?? student.resumeUrl ?? null,
        status: 'submitted',
      },
      select: {
        id: true,
        internshipId: true,
        studentId: true,
        coverLetter: true,
        resumeUrl: true,
        status: true,
        appliedAt: true,
        internship: {
          select: {
            id: true,
            title: true,
            company: {
              select: {
                id: true,
                companyName: true,
              },
            },
          },
        },
      },
    });
  } catch (err: unknown) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2002') {
        throw new AppError(
          409,
          'You have already submitted an application for this internship position.'
        );
      }
    }
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. View Single Application: GET /api/applications/:id
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Retrieves a single application by ID with student, posting, and company info.
 * Enforces role-based authorization:
 * - Student can view only their own application
 * - Company can view only applications for its postings
 * - Admin can view any application
 */
export async function getApplicationById(id: string, user: UserContext) {
  const application = await prisma.studentApplication.findUnique({
    where: { id },
    select: APPLICATION_DETAIL_SELECT,
  });

  if (!application) {
    throw new AppError(404, 'Application not found.');
  }

  if (user.role === 'student' && application.studentId !== user.id) {
    throw new AppError(404, 'Application not found.');
  }

  if (user.role === 'company' && application.internship.companyId !== user.id) {
    throw new AppError(403, 'You are not authorized to view applications for another company.');
  }

  return application;
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Company/Admin Views Applications for Posting:
//    GET /api/postings/:postingId/applications
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns all applications for a given internship posting.
 * Company can view only its own posting's applications; admin can view any.
 */
export async function getPostingApplications(postingId: string, user: UserContext) {
  const posting = await prisma.internshipPosting.findUnique({
    where: { id: postingId },
    select: { id: true, companyId: true, title: true },
  });

  if (!posting) {
    throw new AppError(404, 'Internship posting not found.');
  }

  if (user.role === 'company' && posting.companyId !== user.id) {
    throw new AppError(
      403,
      'You are not authorized to view applications for another company\'s posting.'
    );
  }

  return prisma.studentApplication.findMany({
    where: { internshipId: postingId },
    orderBy: { appliedAt: 'desc' },
    select: {
      id: true,
      internshipId: true,
      studentId: true,
      coverLetter: true,
      resumeUrl: true,
      status: true,
      facultyRating: true,
      facultyFeedback: true,
      facultyReviewedAt: true,
      allocatorMatchScore: true,
      allocatorScoreBreakdown: true,
      companyRemarks: true,
      appliedAt: true,
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
      assignment: {
        select: {
          id: true,
          status: true,
          startDate: true,
          endDate: true,
        },
      },
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Update Application Status: PATCH /api/applications/:id/status
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Updates application status and optional company remarks.
 * Company can update only its own posting's applications; admin can update any.
 *
 * If transitioning to 'selected', verifies remaining vacancy capacity.
 */
export async function updateApplicationStatus(
  id: string,
  input: UpdateApplicationStatusInput,
  user: UserContext
) {
  const application = await prisma.studentApplication.findUnique({
    where: { id },
    select: {
      id: true,
      internshipId: true,
      status: true,
      internship: {
        select: {
          id: true,
          companyId: true,
          title: true,
          vacancies: true,
        },
      },
    },
  });

  if (!application) {
    throw new AppError(404, 'Application not found.');
  }

  if (user.role === 'company' && application.internship.companyId !== user.id) {
    throw new AppError(
      403,
      'You are not authorized to update applications for another company\'s posting.'
    );
  }

  // Vacancy check if transitioning to 'selected'
  if (input.status === 'selected' && application.status !== 'selected') {
    const selectedCount = await prisma.studentApplication.count({
      where: {
        internshipId: application.internshipId,
        status: 'selected',
        id: { not: application.id },
      },
    });

    if (selectedCount >= application.internship.vacancies) {
      throw new AppError(
        400,
        `Cannot select applicant: this posting has already reached its maximum vacancies (${application.internship.vacancies}).`
      );
    }
  }

  const data: Prisma.StudentApplicationUpdateInput = {
    status: input.status,
  };
  if (input.companyRemarks !== undefined) {
    data.companyRemarks = input.companyRemarks;
  }

  try {
    return await prisma.studentApplication.update({
      where: { id },
      data,
      select: {
        id: true,
        internshipId: true,
        studentId: true,
        status: true,
        companyRemarks: true,
        updatedAt: true,
      },
    });
  } catch (err: unknown) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2025') {
        throw new AppError(404, 'Application not found.');
      }
    }
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Student Withdraws Application: PATCH /api/applications/:id/withdraw
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Allows a student to withdraw their own application.
 * Prevents withdrawal if an assignment has already been created.
 */
export async function withdrawApplication(id: string, studentId: string) {
  const application = await prisma.studentApplication.findUnique({
    where: { id },
    select: {
      id: true,
      studentId: true,
      status: true,
      assignment: {
        select: { id: true, status: true },
      },
    },
  });

  if (!application) {
    throw new AppError(404, 'Application not found.');
  }

  if (application.studentId !== studentId) {
    throw new AppError(403, 'You are not authorized to withdraw another student\'s application.');
  }

  if (application.status === 'withdrawn') {
    throw new AppError(400, 'This application has already been withdrawn.');
  }

  if (application.assignment) {
    throw new AppError(
      409,
      'Cannot withdraw application because an active internship assignment has already been established.'
    );
  }

  try {
    return await prisma.studentApplication.update({
      where: { id },
      data: { status: 'withdrawn' },
      select: {
        id: true,
        internshipId: true,
        studentId: true,
        status: true,
        updatedAt: true,
      },
    });
  } catch (err: unknown) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2025') {
        throw new AppError(404, 'Application not found.');
      }
    }
    throw err;
  }
}
