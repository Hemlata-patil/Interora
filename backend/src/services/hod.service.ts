import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';
import bcrypt from 'bcryptjs';

const BCRYPT_ROUNDS = 10;

const prisma = new PrismaClient();

export async function getDashboardMetrics(hodId: string) {
  // Find department managed by this HOD
  const department = await prisma.department.findFirst({
    where: { headOfDepartmentId: hodId }
  });

  if (!department) {
    throw new AppError(404, 'HOD is not assigned to any department.');
  }

  const [totalFaculty, totalStudents, unassignedStudents, totalInterns, activeInternships] = await Promise.all([
    prisma.facultyProfile.count({ where: { departmentId: department.id } }),
    prisma.studentProfile.count({ where: { departmentId: department.id } }),
    prisma.studentProfile.count({
      where: {
        departmentId: department.id,
        facultyMappings: { none: {} }
      }
    }),
    prisma.studentProfile.count({
      where: {
        departmentId: department.id,
        assignments: { some: {} }
      }
    }),
    prisma.internshipAssignment.count({
      where: {
        status: 'active',
        student: { departmentId: department.id }
      }
    })
  ]);

  return {
    totalFaculty,
    totalStudents,
    unassignedStudents,
    assignedStudents: totalStudents - unassignedStudents,
    totalInterns,
    activeInternships,
    departmentName: department.name
  };
}

export async function getDepartmentFaculty(hodId: string) {
  const department = await prisma.department.findFirst({
    where: { headOfDepartmentId: hodId }
  });
  if (!department) throw new AppError(404, 'No department assigned.');

  return prisma.facultyProfile.findMany({
    where: { departmentId: department.id },
    include: {
      profile: {
        select: { fullName: true, email: true, accountStatus: true }
      }
    }
  });
}

export async function getDepartmentStudents(hodId: string) {
  const department = await prisma.department.findFirst({
    where: { headOfDepartmentId: hodId }
  });
  if (!department) throw new AppError(404, 'No department assigned.');

  return prisma.studentProfile.findMany({
    where: { departmentId: department.id },
    include: {
      profile: {
        select: { fullName: true, email: true }
      },
      facultyMappings: {
        include: {
          faculty: {
            include: { profile: { select: { fullName: true } } }
          }
        }
      }
    }
  });
}

export async function getDepartmentInternships(hodId: string) {
  const department = await prisma.department.findFirst({
    where: { headOfDepartmentId: hodId }
  });
  if (!department) throw new AppError(404, 'No department assigned.');

  return prisma.internshipAssignment.findMany({
    where: {
      student: { departmentId: department.id }
    },
    include: {
      student: {
        include: { profile: { select: { fullName: true, email: true } } }
      },
      company: { select: { companyName: true, industryDomain: true } },
      facultyMentor: {
        include: { profile: { select: { fullName: true } } }
      }
    }
  });
}

export async function getDepartmentStudentProgress(hodId: string) {
  const department = await prisma.department.findFirst({
    where: { headOfDepartmentId: hodId }
  });
  if (!department) throw new AppError(404, 'No department assigned.');

  return prisma.studentProfile.findMany({
    where: { departmentId: department.id },
    include: {
      profile: { select: { fullName: true, email: true } },
      assignments: {
        include: {
          company: { select: { companyName: true } },
          facultyMentor: { include: { profile: { select: { fullName: true } } } },
          tasks: { select: { id: true, status: true } },
          milestones: { select: { id: true, status: true } },
          evaluations: { select: { id: true, overallRating: true } },
          workLogs: { select: { id: true } },
          attendanceRecords: { select: { id: true, status: true } },
          internship: { select: { title: true } }
        }
      }
    }
  });
}

export async function assignFacultyToStudent(hodId: string, studentId: string, facultyId: string) {
  const department = await prisma.department.findFirst({
    where: { headOfDepartmentId: hodId }
  });
  if (!department) throw new AppError(404, 'No department assigned.');

  // Validate student is in dept
  const student = await prisma.studentProfile.findFirst({
    where: { id: studentId, departmentId: department.id }
  });
  if (!student) throw new AppError(404, 'Student not found in this department.');

  // Validate faculty is in dept
  const faculty = await prisma.facultyProfile.findFirst({
    where: { id: facultyId, departmentId: department.id }
  });
  if (!faculty) throw new AppError(404, 'Faculty not found in this department.');

  // Check if exists
  const existing = await prisma.facultyStudentAssignment.findFirst({
    where: { studentId, facultyId }
  });
  
  if (existing) {
    return existing;
  }

  return prisma.facultyStudentAssignment.create({
    data: {
      studentId,
      facultyId
    }
  });
}

export interface CreateFacultyInput {
  name: string;
  email: string;
  designation?: string;
  phone?: string;
  password?: string;
}

export async function createDepartmentFaculty(hodId: string, input: CreateFacultyInput) {
  const department = await prisma.department.findFirst({
    where: { headOfDepartmentId: hodId }
  });
  if (!department) throw new AppError(404, 'No department assigned.');

  const cleanEmail = input.email.trim().toLowerCase();
  
  const existingProfile = await prisma.profile.findUnique({
    where: { email: cleanEmail },
  });
  if (existingProfile) {
    throw new AppError(409, 'An account with this email already exists.');
  }

  const passwordHash = await bcrypt.hash(input.password || 'faculty@123', BCRYPT_ROUNDS);

  const result = await prisma.$transaction(async (tx) => {
    const profile = await tx.profile.create({
      data: {
        email: cleanEmail,
        fullName: input.name.trim(),
        role: 'faculty',
        accountStatus: 'active',
        passwordHash,
        phone: input.phone?.trim() || null,
      },
    });

    const faculty = await tx.facultyProfile.create({
      data: {
        id: profile.id,
        facultyId: profile.id,
        departmentId: department.id,
        designation: input.designation?.trim() || 'Professor',
      },
    });

    return { profile, faculty };
  });

  return {
    id: result.profile.id,
    name: result.profile.fullName,
    email: result.profile.email,
  };
}

export async function updateFacultyStatus(hodId: string, facultyId: string, status: string) {
  const department = await prisma.department.findFirst({
    where: { headOfDepartmentId: hodId }
  });
  if (!department) throw new AppError(404, 'No department assigned.');

  // Verify faculty belongs to HOD's department
  const faculty = await prisma.facultyProfile.findFirst({
    where: { id: facultyId, departmentId: department.id }
  });
  if (!faculty) throw new AppError(404, 'Faculty not found in your department.');

  return prisma.profile.update({
    where: { id: facultyId },
    data: { accountStatus: status }
  });
}
