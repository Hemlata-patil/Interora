import bcrypt from 'bcryptjs';
import prisma from './prisma.service';
import { AppError } from '../middleware/errorHandler';

const BCRYPT_ROUNDS = 12;

export interface CreateCompanyMentorInput {
  name: string;
  email: string;
  phone?: string;
  department?: string;
  designation: string;
  expertiseAreas?: string[];
  password?: string;
}

export interface UpdateCompanyMentorInput {
  name?: string;
  phone?: string;
  department?: string;
  designation?: string;
  status?: string;
  expertiseAreas?: string[];
}

export async function getCompanyMentors(companyUserId: string) {
  const mentors = await prisma.industryMentorProfile.findMany({
    where: { companyId: companyUserId },
    include: {
      profile: true,
      assignedInternships: {
        include: {
          internship: {
            select: { id: true, title: true, status: true },
          },
          student: {
            include: {
              profile: { select: { fullName: true, email: true } },
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return mentors.map((m) => {
    const primaryInternship = m.assignedInternships[0]?.internship || null;
    return {
      id: m.id,
      name: m.profile.fullName,
      email: m.profile.email,
      phone: m.profile.phone || '',
      department: m.corporateDepartment || '',
      designation: m.designation,
      status: m.profile.accountStatus === 'active' ? 'Active' : 'Inactive',
      expertiseAreas: m.expertiseAreas,
      assignedInternships: m.assignedInternships.map((a) => ({
        assignmentId: a.id,
        internshipId: a.internship.id,
        title: a.internship.title,
        status: a.internship.status,
        studentName: a.student.profile.fullName,
        studentEmail: a.student.profile.email,
      })),
      assignedInternship: primaryInternship,
      assignedInternsCount: m.assignedInternships.length,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
    };
  });
}

export async function createCompanyMentor(
  companyUserId: string,
  input: CreateCompanyMentorInput
) {
  const company = await prisma.companyProfile.findUnique({
    where: { id: companyUserId },
  });
  if (!company) {
    throw new AppError(404, 'Company profile not found.');
  }

  const existingUser = await prisma.profile.findUnique({
    where: { email: input.email.toLowerCase().trim() },
  });
  if (existingUser) {
    throw new AppError(409, 'A user with this email address already exists.');
  }

  const defaultPassword = input.password || 'Mentor@123';
  const passwordHash = await bcrypt.hash(defaultPassword, BCRYPT_ROUNDS);

  const result = await prisma.$transaction(async (tx) => {
    const profile = await tx.profile.create({
      data: {
        email: input.email.toLowerCase().trim(),
        fullName: input.name.trim(),
        role: 'mentor',
        accountStatus: 'active',
        phone: input.phone?.trim() || null,
        passwordHash,
      },
    });

    const mentorProfile = await tx.industryMentorProfile.create({
      data: {
        id: profile.id,
        companyId: companyUserId,
        designation: input.designation.trim(),
        corporateDepartment: input.department?.trim() || null,
        expertiseAreas: input.expertiseAreas || [],
      },
      include: {
        profile: true,
      },
    });

    return mentorProfile;
  });

  return {
    id: result.id,
    name: result.profile.fullName,
    email: result.profile.email,
    phone: result.profile.phone || '',
    department: result.corporateDepartment || '',
    designation: result.designation,
    status: 'Active',
    expertiseAreas: result.expertiseAreas,
    assignedInternships: [],
    assignedInternship: null,
    assignedInternsCount: 0,
    createdAt: result.createdAt,
    updatedAt: result.updatedAt,
  };
}

export async function updateCompanyMentor(
  companyUserId: string,
  mentorId: string,
  input: UpdateCompanyMentorInput
) {
  const mentor = await prisma.industryMentorProfile.findFirst({
    where: { id: mentorId, companyId: companyUserId },
    include: { profile: true },
  });

  if (!mentor) {
    throw new AppError(404, 'Mentor not found or does not belong to your company.');
  }

  await prisma.$transaction(async (tx) => {
    const profileData: any = {};
    if (input.name !== undefined) profileData.fullName = input.name.trim();
    if (input.phone !== undefined) profileData.phone = input.phone.trim() || null;
    if (input.status !== undefined) {
      profileData.accountStatus = input.status.toLowerCase() === 'active' ? 'active' : 'inactive';
    }

    if (Object.keys(profileData).length > 0) {
      await tx.profile.update({
        where: { id: mentorId },
        data: profileData,
      });
    }

    const mentorData: any = {};
    if (input.designation !== undefined) mentorData.designation = input.designation.trim();
    if (input.department !== undefined) mentorData.corporateDepartment = input.department.trim() || null;
    if (input.expertiseAreas !== undefined) mentorData.expertiseAreas = input.expertiseAreas;

    if (Object.keys(mentorData).length > 0) {
      await tx.industryMentorProfile.update({
        where: { id: mentorId },
        data: mentorData,
      });
    }
  });

  const updatedMentors = await getCompanyMentors(companyUserId);
  const found = updatedMentors.find((m) => m.id === mentorId);
  return found || null;
}

export async function assignMentorToInternship(
  companyUserId: string,
  mentorId: string,
  internshipId?: string | null
) {
  const mentor = await prisma.industryMentorProfile.findFirst({
    where: { id: mentorId, companyId: companyUserId },
  });

  if (!mentor) {
    throw new AppError(404, 'Mentor not found or does not belong to your company.');
  }

  if (internshipId) {
    const posting = await prisma.internshipPosting.findFirst({
      where: { id: internshipId, companyId: companyUserId },
    });
    if (!posting) {
      throw new AppError(404, 'Internship posting not found or does not belong to your company.');
    }

    // Reassign assignments for this internship under this company to this mentor
    await prisma.internshipAssignment.updateMany({
      where: {
        internshipId,
        companyId: companyUserId,
      },
      data: {
        industryMentorId: mentorId,
      },
    });
  }

  return {
    success: true,
    message: 'Internship mentor assignment updated successfully.',
  };
}
