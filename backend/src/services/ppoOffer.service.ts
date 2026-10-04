import { Prisma, PPOStatus, AdminApprovalStatus, StudentResponseStatus } from '@prisma/client';
import prisma from './prisma.service';
import { AppError } from '../middleware/errorHandler';

// ─────────────────────────────────────────────────────────────────────────────
// Types & Interfaces
// ─────────────────────────────────────────────────────────────────────────────

export interface UserContext {
  id: string;
  role: string;
}

export interface CreatePPOOfferInput {
  assignmentId: string;
  studentId?: string;
  positionTitle: string;
  salaryPackage: string;
  joiningDate?: string | Date | null;
  location?: string | null;
  bondTerms?: string | null;
  offerLetterUrl?: string | null;
  status?: PPOStatus;
}

export interface UpdatePPOOfferInput {
  positionTitle?: string;
  salaryPackage?: string;
  joiningDate?: string | Date | null;
  location?: string | null;
  bondTerms?: string | null;
  offerLetterUrl?: string | null;
  status?: PPOStatus;
  adminApprovalStatus?: AdminApprovalStatus;
}

export interface RespondPPOOfferInput {
  response: 'accepted' | 'declined';
}

export interface PPOOfferFilters {
  studentId?: string;
  companyId?: string;
  assignmentId?: string;
  status?: PPOStatus;
  adminApprovalStatus?: AdminApprovalStatus;
  studentResponse?: StudentResponseStatus;
}

// ─────────────────────────────────────────────────────────────────────────────
// Projections & Date Helpers
// ─────────────────────────────────────────────────────────────────────────────

const PPO_OFFER_DETAIL_SELECT = {
  id: true,
  assignmentId: true,
  studentId: true,
  companyId: true,
  positionTitle: true,
  salaryPackage: true,
  joiningDate: true,
  location: true,
  bondTerms: true,
  offerLetterUrl: true,
  status: true,
  adminApprovalStatus: true,
  approvedById: true,
  studentResponse: true,
  responseDate: true,
  createdAt: true,
  updatedAt: true,
  assignment: {
    select: {
      id: true,
      status: true,
      startDate: true,
      endDate: true,
      internshipId: true,
      facultyMentorId: true,
      industryMentorId: true,
      internship: {
        select: {
          id: true,
          title: true,
          workMode: true,
          internshipType: true,
        },
      },
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
  company: {
    select: {
      id: true,
      companyName: true,
      industryDomain: true,
      website: true,
      officialEmail: true,
    },
  },
  approvedBy: {
    select: {
      id: true,
      fullName: true,
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
// Authorization & Access Control
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Validates read access to an existing PPO offer based on user role and ownership.
 */
export async function verifyPPOOfferReadAccess(
  offer: {
    id: string;
    studentId: string;
    companyId: string;
    assignment: {
      facultyMentorId: string | null;
      industryMentorId: string | null;
    };
    student: {
      departmentId: string;
    };
  },
  user: UserContext
): Promise<void> {
  if (user.role === 'admin') return;

  if (user.role === 'student') {
    if (offer.studentId !== user.id) {
      throw new AppError(403, 'Students can only view PPO offers made directly to them.');
    }
    return;
  }

  if (user.role === 'company') {
    if (offer.companyId !== user.id) {
      throw new AppError(403, 'Companies can only view PPO offers issued by their company.');
    }
    return;
  }

  if (user.role === 'mentor') {
    if (offer.assignment.industryMentorId !== user.id) {
      throw new AppError(403, 'You can only view PPO offers for interns assigned to your mentorship.');
    }
    return;
  }

  if (user.role === 'faculty') {
    if (offer.assignment.facultyMentorId === user.id) {
      return;
    }

    const faculty = await prisma.facultyProfile.findUnique({
      where: { id: user.id },
      select: { departmentId: true },
    });

    if (faculty && faculty.departmentId === offer.student.departmentId) {
      return;
    }

    throw new AppError(
      403,
      'You are not authorized to view this PPO offer. Student is outside your academic supervision scope.'
    );
  }

  throw new AppError(403, 'You do not have permission to view this PPO offer.');
}

// ─────────────────────────────────────────────────────────────────────────────
// Service Methods
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Lists PPO offers with role-based scoping and filters.
 */
export async function listPPOOffers(
  filters: PPOOfferFilters,
  user: UserContext
) {
  const where: Prisma.PPOOfferWhereInput = {};

  // Scope enforcement
  if (user.role === 'student') {
    where.studentId = user.id;
  } else if (user.role === 'company') {
    where.companyId = user.id;
  } else if (user.role === 'faculty') {
    const faculty = await prisma.facultyProfile.findUnique({
      where: { id: user.id },
      select: { departmentId: true },
    });

    if (faculty) {
      where.OR = [
        { assignment: { facultyMentorId: user.id } },
        { student: { departmentId: faculty.departmentId } },
      ];
    }
  } else if (user.role === 'mentor') {
    where.assignment = { industryMentorId: user.id };
  } else if (user.role !== 'admin') {
    throw new AppError(403, 'You do not have permission to view PPO offers.');
  }

  // Filters
  if (filters.studentId && (user.role === 'admin' || user.role === 'company' || user.role === 'faculty')) {
    where.studentId = filters.studentId;
  }

  if (filters.companyId && (user.role === 'admin' || user.role === 'faculty')) {
    where.companyId = filters.companyId;
  }

  if (filters.assignmentId) {
    where.assignmentId = filters.assignmentId;
  }

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.adminApprovalStatus) {
    where.adminApprovalStatus = filters.adminApprovalStatus;
  }

  if (filters.studentResponse) {
    where.studentResponse = filters.studentResponse;
  }

  return prisma.pPOOffer.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    select: PPO_OFFER_DETAIL_SELECT,
  });
}

/**
 * Gets a single PPO offer by its ID.
 */
export async function getPPOOfferById(id: string, user: UserContext) {
  const offer = await prisma.pPOOffer.findUnique({
    where: { id },
    select: PPO_OFFER_DETAIL_SELECT,
  });

  if (!offer) {
    throw new AppError(404, 'PPO offer not found.');
  }

  await verifyPPOOfferReadAccess(offer, user);

  return offer;
}

/**
 * Creates a new PPO offer.
 * Allowed: Company hosting the assignment, or Admin.
 */
export async function createPPOOffer(
  input: CreatePPOOfferInput,
  user: UserContext
) {
  if (user.role !== 'company' && user.role !== 'admin') {
    throw new AppError(403, 'Only companies and administrators can create PPO offers.');
  }

  // 1. Validate internship assignment
  const assignment = await prisma.internshipAssignment.findUnique({
    where: { id: input.assignmentId },
    select: {
      id: true,
      studentId: true,
      companyId: true,
      status: true,
      internshipId: true,
    },
  });

  if (!assignment) {
    throw new AppError(404, 'Internship assignment not found.');
  }

  // 2. Validate company ownership
  if (user.role === 'company' && assignment.companyId !== user.id) {
    throw new AppError(403, 'You can only issue PPO offers for internship assignments hosted by your company.');
  }

  // 3. Ensure student relationship consistency
  if (input.studentId && input.studentId !== assignment.studentId) {
    throw new AppError(
      400,
      'Provided studentId does not match the intern assigned to this internship assignment.'
    );
  }

  // 4. Verify uniqueness (@@unique([assignmentId]))
  const existing = await prisma.pPOOffer.findUnique({
    where: { assignmentId: assignment.id },
    select: { id: true, status: true },
  });

  if (existing) {
    throw new AppError(
      409,
      'A PPO offer has already been created for this internship assignment. Only one PPO offer is permitted per assignment.'
    );
  }

  const joiningDate = normalizeDate(input.joiningDate);
  const status: PPOStatus = input.status || 'draft';

  return prisma.$transaction(async (tx) => {
    return tx.pPOOffer.create({
      data: {
        assignmentId: assignment.id,
        studentId: assignment.studentId,
        companyId: assignment.companyId,
        positionTitle: input.positionTitle.trim(),
        salaryPackage: input.salaryPackage.trim(),
        joiningDate,
        location: input.location?.trim() || null,
        bondTerms: input.bondTerms?.trim() || null,
        offerLetterUrl: input.offerLetterUrl?.trim() || null,
        status,
        adminApprovalStatus: 'pending',
        studentResponse: 'pending',
      },
      select: PPO_OFFER_DETAIL_SELECT,
    });
  });
}

/**
 * Updates PPO offer details or status.
 * Allowed: Issuing company (details/status), Admin (details/approval/status).
 */
export async function updatePPOOffer(
  id: string,
  input: UpdatePPOOfferInput,
  user: UserContext
) {
  if (user.role === 'student') {
    throw new AppError(403, 'Students cannot edit PPO offer terms. Use the response endpoint instead.');
  }

  const offer = await prisma.pPOOffer.findUnique({
    where: { id },
    select: {
      id: true,
      companyId: true,
      status: true,
      adminApprovalStatus: true,
      studentResponse: true,
    },
  });

  if (!offer) {
    throw new AppError(404, 'PPO offer not found.');
  }

  if (user.role === 'company' && offer.companyId !== user.id) {
    throw new AppError(403, 'You can only update PPO offers created by your company.');
  }

  const data: Prisma.PPOOfferUpdateInput = {};

  // Company can edit offer terms
  if (input.positionTitle !== undefined) {
    const trimmed = input.positionTitle.trim();
    if (!trimmed) throw new AppError(400, 'positionTitle cannot be empty.');
    data.positionTitle = trimmed;
  }

  if (input.salaryPackage !== undefined) {
    const trimmed = input.salaryPackage.trim();
    if (!trimmed) throw new AppError(400, 'salaryPackage cannot be empty.');
    data.salaryPackage = trimmed;
  }

  if (input.joiningDate !== undefined) {
    data.joiningDate = normalizeDate(input.joiningDate);
  }

  if (input.location !== undefined) {
    data.location = input.location ? input.location.trim() : null;
  }

  if (input.bondTerms !== undefined) {
    data.bondTerms = input.bondTerms ? input.bondTerms.trim() : null;
  }

  if (input.offerLetterUrl !== undefined) {
    data.offerLetterUrl = input.offerLetterUrl ? input.offerLetterUrl.trim() : null;
  }

  if (input.status !== undefined) {
    data.status = input.status;
  }

  // Admin approval status can only be modified by Admins
  if (input.adminApprovalStatus !== undefined) {
    if (user.role !== 'admin') {
      throw new AppError(403, 'Only administrators can update the adminApprovalStatus of a PPO offer.');
    }
    data.adminApprovalStatus = input.adminApprovalStatus;
    if (input.adminApprovalStatus === 'approved') {
      data.approvedBy = { connect: { id: user.id } };
    } else if (input.adminApprovalStatus === 'rejected') {
      data.approvedBy = { connect: { id: user.id } };
    }
  }

  return prisma.$transaction(async (tx) => {
    return tx.pPOOffer.update({
      where: { id },
      data,
      select: PPO_OFFER_DETAIL_SELECT,
    });
  });
}

/**
 * Handles student response to an offered PPO (accept or decline).
 */
export async function respondToPPOOffer(
  id: string,
  input: RespondPPOOfferInput,
  user: UserContext
) {
  if (user.role !== 'student') {
    throw new AppError(403, 'Only the designated student can respond to a PPO offer.');
  }

  const offer = await prisma.pPOOffer.findUnique({
    where: { id },
    select: {
      id: true,
      studentId: true,
      status: true,
      adminApprovalStatus: true,
      studentResponse: true,
    },
  });

  if (!offer) {
    throw new AppError(404, 'PPO offer not found.');
  }

  if (offer.studentId !== user.id) {
    throw new AppError(403, 'You can only respond to PPO offers addressed to you.');
  }

  if (offer.status !== 'offered') {
    throw new AppError(
      400,
      `Cannot respond to this PPO offer. Current offer status is '${offer.status}', expected 'offered'.`
    );
  }

  if (offer.adminApprovalStatus === 'rejected') {
    throw new AppError(400, 'This PPO offer has been rejected by administration and is no longer actionable.');
  }

  if (offer.studentResponse !== 'pending') {
    throw new AppError(
      400,
      `You have already submitted a response ('${offer.studentResponse}') for this PPO offer.`
    );
  }

  const responseStatus: StudentResponseStatus = input.response;

  return prisma.$transaction(async (tx) => {
    return tx.pPOOffer.update({
      where: { id },
      data: {
        studentResponse: responseStatus,
        responseDate: new Date(),
      },
      select: PPO_OFFER_DETAIL_SELECT,
    });
  });
}

/**
 * Deletes a PPO offer.
 * Allowed: Admin (anytime), or Company (only when offer is still in 'draft' status).
 */
export async function deletePPOOffer(id: string, user: UserContext) {
  const offer = await prisma.pPOOffer.findUnique({
    where: { id },
    select: {
      id: true,
      companyId: true,
      status: true,
      positionTitle: true,
    },
  });

  if (!offer) {
    throw new AppError(404, 'PPO offer not found.');
  }

  if (user.role === 'admin') {
    return prisma.pPOOffer.delete({
      where: { id },
      select: { id: true, positionTitle: true },
    });
  }

  if (user.role === 'company') {
    if (offer.companyId !== user.id) {
      throw new AppError(403, 'You can only delete PPO offers created by your company.');
    }

    if (offer.status !== 'draft') {
      throw new AppError(
        400,
        `Cannot delete PPO offer in '${offer.status}' status. Only offers in 'draft' status can be deleted.`
      );
    }

    return prisma.pPOOffer.delete({
      where: { id },
      select: { id: true, positionTitle: true },
    });
  }

  throw new AppError(403, 'You do not have permission to delete PPO offers.');
}
