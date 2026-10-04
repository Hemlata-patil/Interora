import { Prisma, AttendanceStatus } from '@prisma/client';
import prisma from './prisma.service';
import { AppError } from '../middleware/errorHandler';

// ─────────────────────────────────────────────────────────────────────────────
// Types & Interfaces
// ─────────────────────────────────────────────────────────────────────────────

export interface CreateAttendanceInput {
  assignmentId: string;
  attendanceDate?: string | Date;
  status: AttendanceStatus;
  checkInTime?: string | Date | null;
  checkInPhotoUrl?: string | null;
  checkInLat?: number | null;
  checkInLng?: number | null;
  checkInAddress?: string | null;
  checkOutTime?: string | Date | null;
  checkOutPhotoUrl?: string | null;
  checkOutLat?: number | null;
  checkOutLng?: number | null;
  checkOutAddress?: string | null;
  workingHours?: number | null;
  geoVerified?: boolean;
  facultyOverride?: boolean;
  overrideReason?: string | null;
}

export interface UpdateAttendanceInput {
  status?: AttendanceStatus;
  checkInTime?: string | Date | null;
  checkInPhotoUrl?: string | null;
  checkInLat?: number | null;
  checkInLng?: number | null;
  checkInAddress?: string | null;
  checkOutTime?: string | Date | null;
  checkOutPhotoUrl?: string | null;
  checkOutLat?: number | null;
  checkOutLng?: number | null;
  checkOutAddress?: string | null;
  workingHours?: number | null;
  geoVerified?: boolean;
  facultyOverride?: boolean;
  overrideReason?: string | null;
}

export interface AttendanceFilters {
  assignmentId?: string;
  startDate?: string | Date;
  endDate?: string | Date;
  status?: AttendanceStatus;
}

export interface UserContext {
  id: string;
  role: string;
}

export interface StudentCheckInInput {
  assignmentId?: string;
  checkInPhotoUrl?: string | null;
  checkInLat?: number | null;
  checkInLng?: number | null;
  checkInAddress?: string | null;
}

export interface StudentCheckOutInput {
  assignmentId?: string;
  checkOutPhotoUrl?: string | null;
  checkOutLat?: number | null;
  checkOutLng?: number | null;
  checkOutAddress?: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Projections
// ─────────────────────────────────────────────────────────────────────────────

const ATTENDANCE_DETAIL_SELECT = {
  id: true,
  assignmentId: true,
  attendanceDate: true,
  status: true,
  checkInTime: true,
  checkInPhotoUrl: true,
  checkInLat: true,
  checkInLng: true,
  checkInAddress: true,
  checkOutTime: true,
  checkOutPhotoUrl: true,
  checkOutLat: true,
  checkOutLng: true,
  checkOutAddress: true,
  workingHours: true,
  geoVerified: true,
  facultyOverride: true,
  overrideById: true,
  overrideReason: true,
  createdAt: true,
  assignment: {
    select: {
      id: true,
      studentId: true,
      companyId: true,
      internshipId: true,
      facultyMentorId: true,
      industryMentorId: true,
      status: true,
      internship: {
        select: {
          id: true,
          title: true,
          workMode: true,
        },
      },
      company: {
        select: {
          id: true,
          companyName: true,
        },
      },
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
    },
  },
  overrideBy: {
    select: {
      id: true,
      facultyId: true,
      designation: true,
      profile: {
        select: {
          id: true,
          fullName: true,
        },
      },
    },
  },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function normalizeDate(d?: string | Date): Date {
  if (!d) {
    const today = new Date();
    return new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
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

// ─────────────────────────────────────────────────────────────────────────────
// 1. Student Views Own Attendance: GET /api/attendance/my
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns attendance records for the authenticated student across their
 * internship assignments, ordered newest date first.
 */
export async function getStudentAttendance(studentId: string, filters: AttendanceFilters = {}) {
  const where: Prisma.AttendanceRecordWhereInput = {
    assignment: {
      studentId,
    },
  };

  if (filters.assignmentId) {
    where.assignmentId = filters.assignmentId;
  }

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.startDate || filters.endDate) {
    where.attendanceDate = {};
    if (filters.startDate) {
      where.attendanceDate.gte = normalizeDate(filters.startDate);
    }
    if (filters.endDate) {
      where.attendanceDate.lte = normalizeDate(filters.endDate);
    }
  }

  return prisma.attendanceRecord.findMany({
    where,
    orderBy: { attendanceDate: 'desc' },
    select: ATTENDANCE_DETAIL_SELECT,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 1b. Student Self Check-in: POST /api/attendance/check-in
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Records attendance check-in for the authenticated student.
 * Rules:
 * - Student identity is derived exclusively from user.id
 * - Validates assignment exists, belongs to this student, and is in 'active' status
 * - Enforces single check-in per calendar day via DB unique constraint & lookup
 * - Photo URL & location are stored without fabricating unverified data
 */
export async function studentCheckIn(studentId: string, input: StudentCheckInInput) {
  let assignment;

  if (input.assignmentId) {
    assignment = await prisma.internshipAssignment.findUnique({
      where: { id: input.assignmentId },
      select: { id: true, studentId: true, status: true },
    });

    if (!assignment) {
      throw new AppError(404, 'Internship assignment not found.');
    }

    if (assignment.studentId !== studentId) {
      throw new AppError(403, 'You are not authorized to check in for this assignment.');
    }
  } else {
    assignment = await prisma.internshipAssignment.findFirst({
      where: {
        studentId,
        status: 'active',
      },
      select: { id: true, studentId: true, status: true },
    });

    if (!assignment) {
      throw new AppError(400, 'No active internship assignment found for attendance check-in.');
    }
  }

  // Lifecycle check
  if (assignment.status !== 'active') {
    throw new AppError(
      400,
      `Cannot check in for an assignment in "${assignment.status}" status. Only active assignments are eligible for attendance.`
    );
  }

  const attendanceDate = normalizeDate(new Date());

  // Duplicate check
  const existing = await prisma.attendanceRecord.findUnique({
    where: {
      assignmentId_attendanceDate: {
        assignmentId: assignment.id,
        attendanceDate,
      },
    },
  });

  if (existing) {
    throw new AppError(
      409,
      `Attendance check-in has already been recorded for today (${attendanceDate.toISOString().slice(0, 10)}).`
    );
  }

  const now = new Date();
  const geoVerified = Boolean(
    input.checkInLat !== null &&
    input.checkInLng !== null &&
    input.checkInLat !== undefined &&
    input.checkInLng !== undefined
  );

  try {
    return await prisma.attendanceRecord.create({
      data: {
        assignmentId: assignment.id,
        attendanceDate,
        status: 'present',
        checkInTime: now,
        checkInPhotoUrl: input.checkInPhotoUrl ?? null,
        checkInLat: input.checkInLat ?? null,
        checkInLng: input.checkInLng ?? null,
        checkInAddress: input.checkInAddress ?? null,
        geoVerified,
      },
      select: ATTENDANCE_DETAIL_SELECT,
    });
  } catch (err: unknown) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      throw new AppError(
        409,
        `Attendance check-in has already been recorded for today (${attendanceDate.toISOString().slice(0, 10)}).`
      );
    }
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 1c. Student Self Check-out: POST /api/attendance/check-out
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Records attendance check-out for the authenticated student.
 * Rules:
 * - Student identity is derived exclusively from user.id
 * - Validates assignment exists, belongs to this student, and is in 'active' status
 * - Requires existing check-in record for today
 * - Prevents duplicate check-out
 * - Computes workingHours from checkInTime
 */
export async function studentCheckOut(studentId: string, input: StudentCheckOutInput) {
  let assignment;

  if (input.assignmentId) {
    assignment = await prisma.internshipAssignment.findUnique({
      where: { id: input.assignmentId },
      select: { id: true, studentId: true, status: true },
    });

    if (!assignment) {
      throw new AppError(404, 'Internship assignment not found.');
    }

    if (assignment.studentId !== studentId) {
      throw new AppError(403, 'You are not authorized to check out for this assignment.');
    }
  } else {
    assignment = await prisma.internshipAssignment.findFirst({
      where: {
        studentId,
        status: 'active',
      },
      select: { id: true, studentId: true, status: true },
    });

    if (!assignment) {
      throw new AppError(400, 'No active internship assignment found for attendance check-out.');
    }
  }

  const attendanceDate = normalizeDate(new Date());

  const todayRecord = await prisma.attendanceRecord.findUnique({
    where: {
      assignmentId_attendanceDate: {
        assignmentId: assignment.id,
        attendanceDate,
      },
    },
  });

  if (!todayRecord) {
    throw new AppError(400, 'No check-in record found for today. You must check in before checking out.');
  }

  if (todayRecord.checkOutTime) {
    throw new AppError(409, 'Attendance check-out has already been recorded for today.');
  }

  const now = new Date();
  let workingHours = 0;
  if (todayRecord.checkInTime) {
    const diffHours = (now.getTime() - todayRecord.checkInTime.getTime()) / (1000 * 60 * 60);
    workingHours = diffHours > 0 ? Math.round(diffHours * 100) / 100 : 0;
  }

  return await prisma.attendanceRecord.update({
    where: { id: todayRecord.id },
    data: {
      checkOutTime: now,
      checkOutPhotoUrl: input.checkOutPhotoUrl ?? null,
      checkOutLat: input.checkOutLat ?? null,
      checkOutLng: input.checkOutLng ?? null,
      checkOutAddress: input.checkOutAddress ?? null,
      workingHours: new Prisma.Decimal(workingHours),
    },
    select: ATTENDANCE_DETAIL_SELECT,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Assignment Attendance: GET /api/assignments/:assignmentId/attendance
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns attendance records for a specific assignment.
 * Enforces role authorization:
 * - Student assigned to the internship
 * - Host company owner
 * - Assigned faculty mentor
 * - Assigned industry mentor
 * - Admin
 */
export async function getAssignmentAttendance(
  assignmentId: string,
  user: UserContext,
  filters: AttendanceFilters = {}
) {
  const assignment = await prisma.internshipAssignment.findUnique({
    where: { id: assignmentId },
    select: {
      id: true,
      studentId: true,
      companyId: true,
      facultyMentorId: true,
      industryMentorId: true,
    },
  });

  if (!assignment) {
    throw new AppError(404, 'Internship assignment not found.');
  }

  const isStudent = user.role === 'student' && assignment.studentId === user.id;
  const isCompany = user.role === 'company' && assignment.companyId === user.id;
  const isFaculty = user.role === 'faculty' && assignment.facultyMentorId === user.id;
  const isMentor = user.role === 'mentor' && assignment.industryMentorId === user.id;
  const isAdmin = user.role === 'admin';

  if (!isStudent && !isCompany && !isFaculty && !isMentor && !isAdmin) {
    throw new AppError(
      403,
      'You are not authorized to view attendance records for this assignment.'
    );
  }

  const where: Prisma.AttendanceRecordWhereInput = {
    assignmentId,
  };

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.startDate || filters.endDate) {
    where.attendanceDate = {};
    if (filters.startDate) {
      where.attendanceDate.gte = normalizeDate(filters.startDate);
    }
    if (filters.endDate) {
      where.attendanceDate.lte = normalizeDate(filters.endDate);
    }
  }

  return prisma.attendanceRecord.findMany({
    where,
    orderBy: { attendanceDate: 'desc' },
    select: ATTENDANCE_DETAIL_SELECT,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Get Attendance by ID: GET /api/attendance/:id
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Retrieves a single attendance record by ID and verifies caller authorization.
 */
export async function getAttendanceById(id: string, user: UserContext) {
  const record = await prisma.attendanceRecord.findUnique({
    where: { id },
    select: ATTENDANCE_DETAIL_SELECT,
  });

  if (!record) {
    throw new AppError(404, 'Attendance record not found.');
  }

  const assignment = record.assignment;
  const isStudent = user.role === 'student' && assignment.studentId === user.id;
  const isCompany = user.role === 'company' && assignment.companyId === user.id;
  const isFaculty = user.role === 'faculty' && assignment.facultyMentorId === user.id;
  const isMentor = user.role === 'mentor' && assignment.industryMentorId === user.id;
  const isAdmin = user.role === 'admin';

  if (!isStudent && !isCompany && !isFaculty && !isMentor && !isAdmin) {
    throw new AppError(
      403,
      'You are not authorized to view this attendance record.'
    );
  }

  return record;
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Create Attendance: POST /api/attendance
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Creates an attendance record for an assignment.
 * Allowed roles: company owner, assigned faculty mentor, admin.
 *
 * Rules:
 * - Assignment must exist and be in valid lifecycle status (not terminated/suspended)
 * - Caller must be authorized for this assignment
 * - Prevents duplicate entry for the same (assignmentId, attendanceDate)
 */
export async function createAttendance(input: CreateAttendanceInput, user: UserContext) {
  const assignment = await prisma.internshipAssignment.findUnique({
    where: { id: input.assignmentId },
    select: {
      id: true,
      studentId: true,
      companyId: true,
      facultyMentorId: true,
      status: true,
    },
  });

  if (!assignment) {
    throw new AppError(404, 'Internship assignment not found.');
  }

  // Authorization check
  const isCompany = user.role === 'company' && assignment.companyId === user.id;
  const isFaculty = user.role === 'faculty' && assignment.facultyMentorId === user.id;
  const isAdmin = user.role === 'admin';

  if (!isCompany && !isFaculty && !isAdmin) {
    throw new AppError(
      403,
      'You are not authorized to create attendance for this assignment.'
    );
  }

  // Lifecycle check
  if (assignment.status === 'terminated' || assignment.status === 'suspended') {
    throw new AppError(
      400,
      `Cannot record attendance for an assignment in "${assignment.status}" status.`
    );
  }

  const attendanceDate = normalizeDate(input.attendanceDate);

  // Duplicate check
  const existing = await prisma.attendanceRecord.findUnique({
    where: {
      assignmentId_attendanceDate: {
        assignmentId: assignment.id,
        attendanceDate,
      },
    },
  });

  if (existing) {
    throw new AppError(
      409,
      `An attendance record already exists for this assignment on ${attendanceDate.toISOString().slice(0, 10)}. Please use PATCH to modify.`
    );
  }

  // Check-in and Check-out timestamps
  const checkInTime = input.checkInTime ? new Date(input.checkInTime) : null;
  const checkOutTime = input.checkOutTime ? new Date(input.checkOutTime) : null;

  // Compute working hours if not provided but both timestamps exist
  let workingHours = input.workingHours !== undefined && input.workingHours !== null ? input.workingHours : 0;
  if (!workingHours && checkInTime && checkOutTime) {
    const diffHours = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);
    workingHours = diffHours > 0 ? Math.round(diffHours * 100) / 100 : 0;
  }

  const isOverride = user.role === 'faculty' || Boolean(input.facultyOverride);
  const overrideById = isOverride && user.role === 'faculty' ? user.id : null;

  try {
    return await prisma.attendanceRecord.create({
      data: {
        assignmentId: assignment.id,
        attendanceDate,
        status: input.status,
        checkInTime,
        checkInPhotoUrl: input.checkInPhotoUrl ?? null,
        checkInLat: input.checkInLat ?? null,
        checkInLng: input.checkInLng ?? null,
        checkInAddress: input.checkInAddress ?? null,
        checkOutTime,
        checkOutPhotoUrl: input.checkOutPhotoUrl ?? null,
        checkOutLat: input.checkOutLat ?? null,
        checkOutLng: input.checkOutLng ?? null,
        checkOutAddress: input.checkOutAddress ?? null,
        workingHours: new Prisma.Decimal(workingHours),
        geoVerified: input.geoVerified ?? false,
        facultyOverride: isOverride,
        overrideById,
        overrideReason: input.overrideReason ?? null,
      },
      select: ATTENDANCE_DETAIL_SELECT,
    });
  } catch (err: unknown) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2002') {
        throw new AppError(
          409,
          'An attendance record already exists for this assignment on the specified date.'
        );
      }
    }
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Update Attendance: PATCH /api/attendance/:id
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Updates an attendance record.
 * Allowed roles: company owner, assigned faculty mentor, admin.
 */
export async function updateAttendance(
  id: string,
  input: UpdateAttendanceInput,
  user: UserContext
) {
  const record = await prisma.attendanceRecord.findUnique({
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

  if (!record) {
    throw new AppError(404, 'Attendance record not found.');
  }

  const isCompany = user.role === 'company' && record.assignment.companyId === user.id;
  const isFaculty = user.role === 'faculty' && record.assignment.facultyMentorId === user.id;
  const isAdmin = user.role === 'admin';

  if (!isCompany && !isFaculty && !isAdmin) {
    throw new AppError(
      403,
      'You are not authorized to update this attendance record.'
    );
  }

  const data: Prisma.AttendanceRecordUpdateInput = {};

  if (input.status !== undefined) data.status = input.status;
  if (input.checkInTime !== undefined) {
    data.checkInTime = input.checkInTime ? new Date(input.checkInTime) : null;
  }
  if (input.checkInPhotoUrl !== undefined) data.checkInPhotoUrl = input.checkInPhotoUrl;
  if (input.checkInLat !== undefined) data.checkInLat = input.checkInLat;
  if (input.checkInLng !== undefined) data.checkInLng = input.checkInLng;
  if (input.checkInAddress !== undefined) data.checkInAddress = input.checkInAddress;
  if (input.checkOutTime !== undefined) {
    data.checkOutTime = input.checkOutTime ? new Date(input.checkOutTime) : null;
  }
  if (input.checkOutPhotoUrl !== undefined) data.checkOutPhotoUrl = input.checkOutPhotoUrl;
  if (input.checkOutLat !== undefined) data.checkOutLat = input.checkOutLat;
  if (input.checkOutLng !== undefined) data.checkOutLng = input.checkOutLng;
  if (input.checkOutAddress !== undefined) data.checkOutAddress = input.checkOutAddress;
  if (input.workingHours !== undefined) {
    data.workingHours = input.workingHours !== null ? new Prisma.Decimal(input.workingHours) : new Prisma.Decimal(0);
  }
  if (input.geoVerified !== undefined) data.geoVerified = input.geoVerified;
  if (input.overrideReason !== undefined) data.overrideReason = input.overrideReason;

  if (user.role === 'faculty' || input.facultyOverride) {
    data.facultyOverride = true;
    if (user.role === 'faculty') {
      data.overrideBy = { connect: { id: user.id } };
    }
  }

  try {
    return await prisma.attendanceRecord.update({
      where: { id },
      data,
      select: ATTENDANCE_DETAIL_SELECT,
    });
  } catch (err: unknown) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2025') {
        throw new AppError(404, 'Attendance record not found.');
      }
    }
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Attendance Summary: GET /api/attendance/summary/:assignmentId
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Computes an attendance summary for an assignment.
 * Returns total records, counts by status, total working hours, and percentage.
 */
export async function getAttendanceSummary(assignmentId: string, user: UserContext) {
  const assignment = await prisma.internshipAssignment.findUnique({
    where: { id: assignmentId },
    select: {
      id: true,
      studentId: true,
      companyId: true,
      facultyMentorId: true,
      industryMentorId: true,
      internship: {
        select: { title: true },
      },
      student: {
        select: {
          studentId: true,
          profile: { select: { fullName: true } },
        },
      },
    },
  });

  if (!assignment) {
    throw new AppError(404, 'Internship assignment not found.');
  }

  const isStudent = user.role === 'student' && assignment.studentId === user.id;
  const isCompany = user.role === 'company' && assignment.companyId === user.id;
  const isFaculty = user.role === 'faculty' && assignment.facultyMentorId === user.id;
  const isMentor = user.role === 'mentor' && assignment.industryMentorId === user.id;
  const isAdmin = user.role === 'admin';

  if (!isStudent && !isCompany && !isFaculty && !isMentor && !isAdmin) {
    throw new AppError(
      403,
      'You are not authorized to view the attendance summary for this assignment.'
    );
  }

  const records = await prisma.attendanceRecord.findMany({
    where: { assignmentId },
    orderBy: { attendanceDate: 'desc' },
    select: {
      id: true,
      attendanceDate: true,
      status: true,
      workingHours: true,
      checkInTime: true,
      checkOutTime: true,
    },
  });

  let presentCount = 0;
  let absentCount = 0;
  let lateCount = 0;
  let halfDayCount = 0;
  let leaveCount = 0;
  let totalHours = 0;

  for (const r of records) {
    if (r.status === 'present') presentCount++;
    else if (r.status === 'absent') absentCount++;
    else if (r.status === 'late') lateCount++;
    else if (r.status === 'half_day') halfDayCount++;
    else if (r.status === 'leave') leaveCount++;

    if (r.workingHours) {
      totalHours += Number(r.workingHours);
    }
  }

  const totalRecords = records.length;
  // Effective presence: present = 1, late = 1, half_day = 0.5
  const effectivePresence = presentCount + lateCount + halfDayCount * 0.5;
  const attendancePercentage =
    totalRecords > 0 ? Math.round((effectivePresence / totalRecords) * 1000) / 10 : 100;

  return {
    assignmentId,
    studentName: assignment.student.profile.fullName,
    studentRollNumber: assignment.student.studentId,
    internshipTitle: assignment.internship.title,
    totalRecords,
    presentCount,
    absentCount,
    lateCount,
    halfDayCount,
    leaveCount,
    totalWorkingHours: Math.round(totalHours * 100) / 100,
    attendancePercentage,
    recentRecords: records.slice(0, 5),
  };
}

/**
 * 8. List Attendance Records scoped by caller role: GET /api/attendance
 * - student: only student's attendance records
 * - company: all attendance records for company's internship assignments
 * - faculty: all attendance records for faculty-supervised students
 * - mentor: all attendance records for mentor's assigned interns
 * - admin: all attendance records system-wide
 */
export async function listAttendanceRecords(
  user: UserContext,
  filters: AttendanceFilters = {}
) {
  const where: Prisma.AttendanceRecordWhereInput = {};
  const assignmentWhere: Prisma.InternshipAssignmentWhereInput = {};

  if (user.role === 'student') {
    assignmentWhere.studentId = user.id;
  } else if (user.role === 'company') {
    assignmentWhere.companyId = user.id;
  } else if (user.role === 'faculty') {
    assignmentWhere.facultyMentorId = user.id;
  } else if (user.role === 'mentor') {
    assignmentWhere.industryMentorId = user.id;
  } else if (user.role !== 'admin') {
    throw new AppError(403, 'You do not have permission to view attendance records.');
  }

  if (filters.assignmentId) {
    where.assignmentId = filters.assignmentId;
  }

  if (Object.keys(assignmentWhere).length > 0) {
    where.assignment = assignmentWhere;
  }

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.startDate || filters.endDate) {
    where.attendanceDate = {};
    if (filters.startDate) {
      where.attendanceDate.gte = normalizeDate(filters.startDate);
    }
    if (filters.endDate) {
      where.attendanceDate.lte = normalizeDate(filters.endDate);
    }
  }

  return prisma.attendanceRecord.findMany({
    where,
    orderBy: { attendanceDate: 'desc' },
    select: ATTENDANCE_DETAIL_SELECT,
  });
}
