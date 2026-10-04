import { Prisma, CertificateStatus } from '@prisma/client';
import crypto from 'crypto';
import prisma from './prisma.service';
import { AppError } from '../middleware/errorHandler';

// ─────────────────────────────────────────────────────────────────────────────
// Types & Interfaces
// ─────────────────────────────────────────────────────────────────────────────

export interface UserContext {
  id: string;
  role: string;
}

export interface IssueCertificateInput {
  assignmentId: string;
  certificateNumber?: string;
  qrToken?: string;
  certificateUrl?: string | null;
  issueDate?: string | Date | null;
  signatoryName: string;
  signatoryTitle: string;
}

export interface UpdateCertificateInput {
  certificateUrl?: string | null;
  issueDate?: string | Date | null;
  signatoryName?: string;
  signatoryTitle?: string;
  status?: CertificateStatus;
  revocationReason?: string | null;
}

export interface RevokeCertificateInput {
  revocationReason: string;
}

export interface CertificateFilters {
  studentId?: string;
  companyId?: string;
  assignmentId?: string;
  status?: CertificateStatus;
  certificateNumber?: string;
}

export interface VerificationContext {
  ipAddress?: string | null;
  userAgent?: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Projections & Date Helpers
// ─────────────────────────────────────────────────────────────────────────────

const CERTIFICATE_DETAIL_SELECT = {
  id: true,
  assignmentId: true,
  studentId: true,
  companyId: true,
  certificateNumber: true,
  qrToken: true,
  certificateUrl: true,
  issueDate: true,
  signatoryName: true,
  signatoryTitle: true,
  status: true,
  revocationReason: true,
  createdAt: true,
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
    },
  },
  _count: {
    select: {
      verificationLogs: true,
    },
  },
} as const;

const PUBLIC_VERIFICATION_SELECT = {
  id: true,
  certificateNumber: true,
  qrToken: true,
  issueDate: true,
  signatoryName: true,
  signatoryTitle: true,
  status: true,
  revocationReason: true,
  student: {
    select: {
      studentId: true,
      course: true,
      profile: {
        select: {
          fullName: true,
        },
      },
    },
  },
  company: {
    select: {
      companyName: true,
      industryDomain: true,
      website: true,
    },
  },
  assignment: {
    select: {
      startDate: true,
      endDate: true,
      internship: {
        select: {
          title: true,
          workMode: true,
        },
      },
    },
  },
} as const;

function normalizeDate(d?: string | Date | null): Date {
  if (!d) {
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  }
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

function generateCertificateNumber(): string {
  const year = new Date().getFullYear();
  const randomHex = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `INT-${year}-${randomHex}`;
}

function generateQrToken(): string {
  return `VERIF-${crypto.randomBytes(16).toString('hex')}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Authorization Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Validates read access to a certificate according to user role and relationships.
 */
export async function verifyCertificateReadAccess(
  certificate: {
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
    if (certificate.studentId !== user.id) {
      throw new AppError(403, 'Students can only view certificates issued to them.');
    }
    return;
  }

  if (user.role === 'company') {
    if (certificate.companyId !== user.id) {
      throw new AppError(403, 'Companies can only view certificates issued by their company.');
    }
    return;
  }

  if (user.role === 'mentor') {
    if (certificate.assignment.industryMentorId !== user.id) {
      throw new AppError(403, 'You can only view certificates for interns under your mentorship.');
    }
    return;
  }

  if (user.role === 'faculty') {
    if (certificate.assignment.facultyMentorId === user.id) {
      return;
    }

    const faculty = await prisma.facultyProfile.findUnique({
      where: { id: user.id },
      select: { departmentId: true },
    });

    if (faculty && faculty.departmentId === certificate.student.departmentId) {
      return;
    }

    throw new AppError(
      403,
      'You are not authorized to view this certificate. Student is outside your academic supervision scope.'
    );
  }

  throw new AppError(403, 'You do not have permission to view this certificate.');
}

// ─────────────────────────────────────────────────────────────────────────────
// Service Methods
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Lists certificates with role-based scoping and filters.
 */
export async function listCertificates(
  filters: CertificateFilters,
  user: UserContext
) {
  const where: Prisma.CertificateWhereInput = {};

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
    throw new AppError(403, 'You do not have permission to view certificates.');
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

  if (filters.certificateNumber) {
    where.certificateNumber = { contains: filters.certificateNumber, mode: 'insensitive' };
  }

  return prisma.certificate.findMany({
    where,
    orderBy: { issueDate: 'desc' },
    select: CERTIFICATE_DETAIL_SELECT,
  });
}

/**
 * Gets a single certificate by its ID.
 */
export async function getCertificateById(id: string, user: UserContext) {
  const certificate = await prisma.certificate.findUnique({
    where: { id },
    select: CERTIFICATE_DETAIL_SELECT,
  });

  if (!certificate) {
    throw new AppError(404, 'Certificate not found.');
  }

  await verifyCertificateReadAccess(certificate, user);

  return certificate;
}

/**
 * Issues a new certificate for an internship assignment.
 * Allowed: Issuing company or Administrator.
 */
export async function issueCertificate(
  input: IssueCertificateInput,
  user: UserContext
) {
  if (user.role !== 'company' && user.role !== 'admin') {
    throw new AppError(403, 'Only companies and administrators can issue certificates.');
  }

  // 1. Verify internship assignment
  const assignment = await prisma.internshipAssignment.findUnique({
    where: { id: input.assignmentId },
    select: {
      id: true,
      studentId: true,
      companyId: true,
      status: true,
    },
  });

  if (!assignment) {
    throw new AppError(404, 'Internship assignment not found.');
  }

  // 2. Validate company ownership
  if (user.role === 'company' && assignment.companyId !== user.id) {
    throw new AppError(403, 'You can only issue certificates for internship assignments hosted by your company.');
  }

  // 3. Verify uniqueness on assignmentId (@@unique([assignmentId]))
  const existing = await prisma.certificate.findUnique({
    where: { assignmentId: assignment.id },
    select: { id: true, certificateNumber: true },
  });

  if (existing) {
    throw new AppError(
      409,
      `A certificate (${existing.certificateNumber}) has already been issued for this internship assignment.`
    );
  }

  const certificateNumber = input.certificateNumber?.trim() || generateCertificateNumber();
  const qrToken = input.qrToken?.trim() || generateQrToken();
  const issueDate = normalizeDate(input.issueDate);

  // 4. Verify certificateNumber uniqueness if custom
  const existingNumber = await prisma.certificate.findUnique({
    where: { certificateNumber },
    select: { id: true },
  });

  if (existingNumber) {
    throw new AppError(409, `Certificate number '${certificateNumber}' is already in use.`);
  }

  return prisma.$transaction(async (tx) => {
    return tx.certificate.create({
      data: {
        assignmentId: assignment.id,
        studentId: assignment.studentId,
        companyId: assignment.companyId,
        certificateNumber,
        qrToken,
        certificateUrl: input.certificateUrl?.trim() || null,
        issueDate,
        signatoryName: input.signatoryName.trim(),
        signatoryTitle: input.signatoryTitle.trim(),
        status: 'active',
      },
      select: CERTIFICATE_DETAIL_SELECT,
    });
  });
}

/**
 * Updates certificate metadata (signatory, URL, issue date).
 * Allowed: Issuing company or Administrator.
 */
export async function updateCertificate(
  id: string,
  input: UpdateCertificateInput,
  user: UserContext
) {
  if (user.role === 'student') {
    throw new AppError(403, 'Students are not authorized to update certificates.');
  }

  const cert = await prisma.certificate.findUnique({
    where: { id },
    select: {
      id: true,
      companyId: true,
      status: true,
    },
  });

  if (!cert) {
    throw new AppError(404, 'Certificate not found.');
  }

  if (user.role === 'company' && cert.companyId !== user.id) {
    throw new AppError(403, 'You can only update certificates issued by your company.');
  }

  const data: Prisma.CertificateUpdateInput = {};

  if (input.signatoryName !== undefined) {
    const trimmed = input.signatoryName.trim();
    if (!trimmed) throw new AppError(400, 'signatoryName cannot be empty.');
    data.signatoryName = trimmed;
  }

  if (input.signatoryTitle !== undefined) {
    const trimmed = input.signatoryTitle.trim();
    if (!trimmed) throw new AppError(400, 'signatoryTitle cannot be empty.');
    data.signatoryTitle = trimmed;
  }

  if (input.certificateUrl !== undefined) {
    data.certificateUrl = input.certificateUrl ? input.certificateUrl.trim() : null;
  }

  if (input.issueDate !== undefined) {
    data.issueDate = normalizeDate(input.issueDate);
  }

  if (input.status !== undefined) {
    data.status = input.status;
    if (input.status === 'revoked') {
      if (!input.revocationReason || !input.revocationReason.trim()) {
        throw new AppError(400, 'revocationReason is required when revoking a certificate.');
      }
      data.revocationReason = input.revocationReason.trim();
    } else if (input.status === 'active') {
      data.revocationReason = null;
    }
  }

  return prisma.$transaction(async (tx) => {
    return tx.certificate.update({
      where: { id },
      data,
      select: CERTIFICATE_DETAIL_SELECT,
    });
  });
}

/**
 * Revokes a certificate with an explicit reason.
 * Allowed: Issuing company or Administrator.
 */
export async function revokeCertificate(
  id: string,
  input: RevokeCertificateInput,
  user: UserContext
) {
  if (user.role !== 'company' && user.role !== 'admin') {
    throw new AppError(403, 'Only companies and administrators can revoke certificates.');
  }

  const cert = await prisma.certificate.findUnique({
    where: { id },
    select: {
      id: true,
      companyId: true,
      status: true,
      certificateNumber: true,
    },
  });

  if (!cert) {
    throw new AppError(404, 'Certificate not found.');
  }

  if (user.role === 'company' && cert.companyId !== user.id) {
    throw new AppError(403, 'You can only revoke certificates issued by your company.');
  }

  if (cert.status === 'revoked') {
    throw new AppError(400, `Certificate '${cert.certificateNumber}' is already revoked.`);
  }

  const reason = input.revocationReason.trim();
  if (!reason) {
    throw new AppError(400, 'revocationReason cannot be empty.');
  }

  return prisma.$transaction(async (tx) => {
    return tx.certificate.update({
      where: { id },
      data: {
        status: 'revoked',
        revocationReason: reason,
      },
      select: CERTIFICATE_DETAIL_SELECT,
    });
  });
}

/**
 * Verifies a certificate using its verification token (qrToken) or certificateNumber.
 * Atomically creates a verification audit log in `CertificateVerificationLog`.
 */
export async function verifyCertificate(
  identifier: string,
  context: VerificationContext
) {
  const token = identifier.trim();
  if (!token) {
    throw new AppError(400, 'Verification token or certificate number is required.');
  }

  // Look up by qrToken or certificateNumber
  const certificate = await prisma.certificate.findFirst({
    where: {
      OR: [
        { qrToken: token },
        { certificateNumber: token },
      ],
    },
    select: {
      ...PUBLIC_VERIFICATION_SELECT,
      qrToken: true,
    },
  });

  if (!certificate) {
    throw new AppError(404, 'No matching certificate found for the provided verification code.');
  }

  // Log verification attempt atomically
  await prisma.certificateVerificationLog.create({
    data: {
      certificateId: certificate.id,
      qrToken: certificate.qrToken,
      scannedAt: new Date(),
      ipAddress: context.ipAddress?.slice(0, 45) || null,
      userAgent: context.userAgent?.slice(0, 500) || null,
    },
  });

  const isValid = certificate.status === 'active' || certificate.status === 'reissued';

  return {
    isValid,
    status: certificate.status,
    message: isValid
      ? 'Certificate is authentic and valid.'
      : `Certificate is currently ${certificate.status}. ${certificate.revocationReason ? `Reason: ${certificate.revocationReason}` : ''}`,
    certificate: {
      certificateNumber: certificate.certificateNumber,
      issueDate: certificate.issueDate,
      signatoryName: certificate.signatoryName,
      signatoryTitle: certificate.signatoryTitle,
      studentName: certificate.student.profile.fullName,
      studentRoll: certificate.student.studentId,
      course: certificate.student.course,
      companyName: certificate.company.companyName,
      internshipTitle: certificate.assignment.internship.title,
      workMode: certificate.assignment.internship.workMode,
      startDate: certificate.assignment.startDate,
      endDate: certificate.assignment.endDate,
      revocationReason: certificate.revocationReason,
    },
  };
}

/**
 * Lists verification logs for a specific certificate.
 * Allowed: Administrator, issuing Company, or Student recipient.
 */
export async function listCertificateVerificationLogs(
  certificateId: string,
  user: UserContext
) {
  const cert = await prisma.certificate.findUnique({
    where: { id: certificateId },
    select: {
      id: true,
      studentId: true,
      companyId: true,
    },
  });

  if (!cert) {
    throw new AppError(404, 'Certificate not found.');
  }

  if (user.role === 'student' && cert.studentId !== user.id) {
    throw new AppError(403, 'Students can only view verification logs for their own certificates.');
  }

  if (user.role === 'company' && cert.companyId !== user.id) {
    throw new AppError(403, 'Companies can only view logs for certificates issued by their company.');
  }

  if (user.role !== 'admin' && user.role !== 'company' && user.role !== 'student') {
    throw new AppError(403, 'You do not have permission to view verification logs.');
  }

  return prisma.certificateVerificationLog.findMany({
    where: { certificateId },
    orderBy: { scannedAt: 'desc' },
    select: {
      id: true,
      certificateId: true,
      qrToken: true,
      scannedAt: true,
      ipAddress: true,
      userAgent: true,
    },
  });
}
