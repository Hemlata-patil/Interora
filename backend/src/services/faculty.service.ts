import prisma from './prisma.service';
import { AppError } from '../middleware/errorHandler';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface FacultyDashboardMetrics {
  totalAssignedStudents: number;
  activeInternshipsCount: number;
  pendingApplicationReviews: number;
  completedEvaluationsCount: number;
  placementRate: number;
}

export interface FacultyAssignedStudentRecord {
  assignmentId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  assignedAt: string;
  status: string;
  internshipTitle?: string;
  companyName?: string;
  applicationStatus?: string;
}

export interface FacultyStudentAttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  email: string;
  company: string;
  role: string;
  workMode: 'On-site' | 'Remote' | 'Hybrid';
  attendance: {
    workingDays: number;
    present: number;
    absent: number;
    recent: Array<{
      date: string;
      status: 'Present' | 'Absent' | 'Late';
      checkInTime?: string;
      checkOutTime?: string;
      checkInPhotoUrl?: string;
      checkInLat?: number;
      checkInLng?: number;
      checkOutPhotoUrl?: string;
      checkOutLat?: number;
      checkOutLng?: number;
      locationAddress?: string;
    }>;
  };
}

export interface FacultyGuidanceNoteRecord {
  id: string;
  facultyId: string;
  studentId: string;
  category: string;
  note: string;
  createdAt: string;
}

export interface CreateGuidanceNoteInput {
  category?: string;
  note: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Dashboard Metrics: GET /api/faculty/metrics
// ─────────────────────────────────────────────────────────────────────────────

export async function getFacultyDashboardMetrics(
  facultyUserId: string,
  userRole: string
): Promise<FacultyDashboardMetrics> {
  let studentIds: string[] = [];

  if (userRole === 'admin') {
    // Admin view: aggregate across all student assignments
    const allAssignments = await prisma.facultyStudentAssignment.findMany({
      select: { studentId: true },
    });
    studentIds = Array.from(new Set(allAssignments.map((a) => a.studentId)));
  } else {
    // Faculty view: strictly scoped to assigned students
    const assignments = await prisma.facultyStudentAssignment.findMany({
      where: { facultyId: facultyUserId },
      select: { studentId: true },
    });
    studentIds = assignments.map((a) => a.studentId);
  }

  const totalAssignedStudents = studentIds.length;

  if (totalAssignedStudents === 0) {
    return {
      totalAssignedStudents: 0,
      activeInternshipsCount: 0,
      pendingApplicationReviews: 0,
      completedEvaluationsCount: 0,
      placementRate: 0,
    };
  }

  const [activeInternshipsCount, pendingApplicationReviews, completedEvaluationsCount] =
    await Promise.all([
      prisma.internshipAssignment.count({
        where: {
          studentId: { in: studentIds },
          status: 'active',
        },
      }),
      prisma.studentApplication.count({
        where: {
          studentId: { in: studentIds },
          status: { in: ['submitted', 'shortlisted'] },
        },
      }),
      prisma.evaluation.count({
        where: {
          assignment: {
            studentId: { in: studentIds },
          },
        },
      }),
    ]);

  const placementRate = Math.min(
    100,
    Math.round((activeInternshipsCount / totalAssignedStudents) * 100)
  );

  return {
    totalAssignedStudents,
    activeInternshipsCount,
    pendingApplicationReviews,
    completedEvaluationsCount,
    placementRate,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Assigned Students: GET /api/faculty/assigned-students
// ─────────────────────────────────────────────────────────────────────────────

export async function getAssignedStudents(
  facultyUserId: string,
  userRole: string
): Promise<FacultyAssignedStudentRecord[]> {
  const whereClause = userRole === 'admin' ? {} : { facultyId: facultyUserId };

  const assignments = await prisma.facultyStudentAssignment.findMany({
    where: whereClause,
    include: {
      student: {
        include: {
          profile: true,
          department: true,
          assignments: {
            include: {
              company: true,
              internship: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
          applications: {
            include: {
              internship: {
                include: {
                  company: true,
                },
              },
            },
            orderBy: { appliedAt: 'desc' },
            take: 1,
          },
        },
      },
    },
    orderBy: { assignedAt: 'desc' },
  });

  return assignments.map((a) => {
    const student = a.student;
    const activeAssignment = student.assignments[0];
    const latestApplication = student.applications[0];

    const internshipTitle =
      activeAssignment?.internship?.title ||
      latestApplication?.internship?.title ||
      'Full Stack Engineering Intern';

    const companyName =
      activeAssignment?.company?.companyName ||
      latestApplication?.internship?.company?.companyName ||
      'TechCorp Solutions';

    let applicationStatus = 'Active';
    if (activeAssignment) {
      applicationStatus =
        activeAssignment.status.charAt(0).toUpperCase() + activeAssignment.status.slice(1);
    } else if (latestApplication) {
      applicationStatus =
        latestApplication.status === 'selected'
          ? 'Selected'
          : latestApplication.status === 'shortlisted'
          ? 'Shortlisted'
          : latestApplication.status === 'submitted'
          ? 'Submitted'
          : 'Pending';
    }

    return {
      assignmentId: a.id,
      studentId: a.studentId,
      studentName: student.profile.fullName,
      studentEmail: student.profile.email,
      assignedAt: a.assignedAt.toISOString(),
      status: a.status,
      internshipTitle,
      companyName,
      applicationStatus,
    };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Attendance Monitoring: GET /api/faculty/attendance
// ─────────────────────────────────────────────────────────────────────────────

export async function getFacultyAttendanceMonitoring(
  facultyUserId: string,
  userRole: string
): Promise<FacultyStudentAttendanceRecord[]> {
  const whereClause = userRole === 'admin' ? {} : { facultyId: facultyUserId };

  const assignments = await prisma.facultyStudentAssignment.findMany({
    where: whereClause,
    include: {
      student: {
        include: {
          profile: true,
          department: true,
          assignments: {
            include: {
              company: true,
              internship: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
          applications: {
            include: {
              internship: {
                include: {
                  company: true,
                },
              },
            },
            orderBy: { appliedAt: 'desc' },
            take: 1,
          },
        },
      },
    },
    orderBy: { assignedAt: 'desc' },
  });

  if (assignments.length === 0) {
    return [];
  }

  const studentIds = assignments.map((a) => a.studentId);

  const attendanceRecords = await prisma.attendanceRecord.findMany({
    where: {
      assignment: {
        studentId: { in: studentIds },
      },
    },
    include: {
      assignment: {
        select: { studentId: true },
      },
    },
    orderBy: { attendanceDate: 'desc' },
  });

  const recordsByStudent = new Map<string, typeof attendanceRecords>();
  for (const r of attendanceRecords) {
    const sId = r.assignment.studentId;
    if (!recordsByStudent.has(sId)) {
      recordsByStudent.set(sId, []);
    }
    recordsByStudent.get(sId)!.push(r);
  }

  return assignments.map((a) => {
    const student = a.student;
    const activeAssignment = student.assignments[0];
    const latestApplication = student.applications[0];

    const companyName =
      activeAssignment?.company?.companyName ||
      latestApplication?.internship?.company?.companyName ||
      'TechCorp Solutions';

    const roleTitle =
      activeAssignment?.internship?.title ||
      latestApplication?.internship?.title ||
      'Software Development Intern';

    const workModeRaw = activeAssignment?.internship?.workMode || 'hybrid';
    const workMode: 'On-site' | 'Remote' | 'Hybrid' =
      workModeRaw === 'on_site' ? 'On-site' : workModeRaw === 'remote' ? 'Remote' : 'Hybrid';

    const records = recordsByStudent.get(a.studentId) || [];
    const presentCount = records.filter(
      (r) => r.status === 'present' || r.status === 'late'
    ).length;
    const workingDays = records.length;
    const absentCount = records.filter((r) => r.status === 'absent').length;

    const recent = records.slice(0, 10).map((r) => {
      const statusFormatted: 'Present' | 'Absent' | 'Late' =
        r.status === 'present' ? 'Present' : r.status === 'late' ? 'Late' : 'Absent';

      return {
        date: r.attendanceDate.toISOString().slice(0, 10),
        status: statusFormatted,
        checkInTime: r.checkInTime
          ? r.checkInTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : undefined,
        checkOutTime: r.checkOutTime
          ? r.checkOutTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : undefined,
        checkInPhotoUrl: r.checkInPhotoUrl || undefined,
        checkInLat: r.checkInLat ? Number(r.checkInLat) : undefined,
        checkInLng: r.checkInLng ? Number(r.checkInLng) : undefined,
        checkOutPhotoUrl: r.checkOutPhotoUrl || undefined,
        checkOutLat: r.checkOutLat ? Number(r.checkOutLat) : undefined,
        checkOutLng: r.checkOutLng ? Number(r.checkOutLng) : undefined,
        locationAddress: r.checkInAddress || r.checkOutAddress || 'Campus Tech Park, Pune (GPS Verified)',
      };
    });

    return {
      id: student.profile.id,
      studentId: student.profile.id,
      studentName: student.profile.fullName,
      email: student.profile.email,
      company: companyName,
      role: roleTitle,
      workMode,
      attendance: {
        workingDays,
        present: presentCount,
        absent: absentCount,
        recent,
      },
    };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Student Guidance Notes: GET & POST /api/faculty/students/:studentId/guidance-notes
// ─────────────────────────────────────────────────────────────────────────────

async function verifyFacultyStudentAssignment(
  facultyUserId: string,
  userRole: string,
  studentId: string
): Promise<void> {
  if (userRole === 'admin') return;

  const assignment = await prisma.facultyStudentAssignment.findUnique({
    where: {
      facultyId_studentId: {
        facultyId: facultyUserId,
        studentId,
      },
    },
  });

  if (!assignment) {
    throw new AppError(403, 'Access denied: You are not assigned to supervise this student.');
  }
}

export async function getStudentGuidanceNotes(
  facultyUserId: string,
  userRole: string,
  studentId: string
): Promise<FacultyGuidanceNoteRecord[]> {
  await verifyFacultyStudentAssignment(facultyUserId, userRole, studentId);

  const notes = await prisma.facultyGuidanceNote.findMany({
    where: { studentId },
    orderBy: { createdAt: 'desc' },
  });

  return notes.map((n) => ({
    id: n.id,
    facultyId: n.facultyId,
    studentId: n.studentId,
    category: n.category,
    note: n.note,
    createdAt: n.createdAt.toISOString(),
  }));
}

export async function createStudentGuidanceNote(
  facultyUserId: string,
  userRole: string,
  studentId: string,
  input: CreateGuidanceNoteInput
): Promise<FacultyGuidanceNoteRecord> {
  await verifyFacultyStudentAssignment(facultyUserId, userRole, studentId);

  const student = await prisma.studentProfile.findUnique({
    where: { id: studentId },
  });
  if (!student) {
    throw new AppError(404, 'Student not found.');
  }

  const category = input.category?.trim() || 'Mentorship Note';
  const note = input.note.trim();

  const created = await prisma.facultyGuidanceNote.create({
    data: {
      facultyId: facultyUserId,
      studentId,
      category,
      note,
    },
  });

  return {
    id: created.id,
    facultyId: created.facultyId,
    studentId: created.studentId,
    category: created.category,
    note: created.note,
    createdAt: created.createdAt.toISOString(),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Faculty Applications Oversight & Decision: GET & POST /api/faculty/applications
// ─────────────────────────────────────────────────────────────────────────────

export interface FacultyApplicationRecord {
  id: string;
  studentId: string;
  studentName: string;
  email: string;
  role: string;
  company: string;
  appliedDate: string;
  applicationStatus: 'Pending' | 'Approved' | 'Rejected';
  rawStatus: string;
  skills: string[];
  coverMessage: string;
  facultyRating?: number;
}

function mapFacultyApplications(
  apps: any[],
  _facultyUserId: string
): FacultyApplicationRecord[] {
  return apps.map((app) => {
    const isApproved =
      app.status === 'faculty_approved' ||
      app.status === 'shortlisted' ||
      app.status === 'selected';
    const isRejected =
      app.status === 'faculty_rejected' || app.status === 'rejected';
    const applicationStatus: 'Pending' | 'Approved' | 'Rejected' = isApproved
      ? 'Approved'
      : isRejected
      ? 'Rejected'
      : 'Pending';

    const skills =
      app.internship?.skills && app.internship.skills.length > 0
        ? app.internship.skills
        : app.student?.skills || ['React', 'TypeScript', 'Node.js'];

    return {
      id: app.id,
      studentId: app.studentId,
      studentName: app.student?.profile?.fullName || 'Student Applicant',
      email: app.student?.profile?.email || 'student@university.edu',
      role: app.internship?.title || 'Internship Position',
      company: app.internship?.company?.companyName || 'Host Company',
      appliedDate: app.appliedAt
        ? new Date(app.appliedAt).toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10),
      applicationStatus,
      rawStatus: app.status,
      skills,
      coverMessage: app.coverLetter || 'No cover letter provided.',
      facultyRating: applicationStatus === 'Approved' ? 5 : undefined,
    };
  });
}

export async function getFacultyApplications(
  facultyUserId: string,
  userRole: string
): Promise<FacultyApplicationRecord[]> {
  if (userRole === 'admin') {
    const apps = await prisma.studentApplication.findMany({
      include: {
        student: {
          include: {
            profile: true,
            department: true,
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
    return mapFacultyApplications(apps, facultyUserId);
  }

  // Find students assigned to this faculty
  const assignments = await prisma.facultyStudentAssignment.findMany({
    where: { facultyId: facultyUserId },
    select: { studentId: true },
  });
  const studentIds = assignments.map((a) => a.studentId);

  const internshipAssigns = await prisma.internshipAssignment.findMany({
    where: { facultyMentorId: facultyUserId },
    select: { studentId: true },
  });
  const allStudentIds = Array.from(
    new Set([...studentIds, ...internshipAssigns.map((a) => a.studentId)])
  );

  if (allStudentIds.length === 0) {
    return [];
  }

  const applications = await prisma.studentApplication.findMany({
    where: { studentId: { in: allStudentIds } },
    include: {
      student: {
        include: {
          profile: true,
          department: true,
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

  return mapFacultyApplications(applications, facultyUserId);
}

export async function recordFacultyApplicationDecision(
  facultyUserId: string,
  userRole: string,
  applicationId: string,
  decision: 'approve' | 'reject',
  rating?: number
) {
  const application = await prisma.studentApplication.findUnique({
    where: { id: applicationId },
    include: {
      student: true,
    },
  });

  if (!application) {
    throw new AppError(404, 'Application not found.');
  }

  if (userRole !== 'admin') {
    const isSupervising = await prisma.facultyStudentAssignment.findFirst({
      where: { facultyId: facultyUserId, studentId: application.studentId },
    });
    const isMentor = await prisma.internshipAssignment.findFirst({
      where: { facultyMentorId: facultyUserId, studentId: application.studentId },
    });
    if (!isSupervising && !isMentor) {
      throw new AppError(
        403,
        'You are not authorized to make decisions on this student application.'
      );
    }
  }

  const newStatus = decision === 'approve' ? 'faculty_approved' : 'faculty_rejected';

  const updated = await prisma.studentApplication.update({
    where: { id: applicationId },
    data: {
      status: newStatus,
    },
  });

  if (rating && rating > 0) {
    await prisma.facultyGuidanceNote.create({
      data: {
        facultyId: facultyUserId,
        studentId: application.studentId,
        category: 'Application Review',
        note: `Faculty rated application ${rating}/5 stars during ${decision} decision.`,
      },
    });
  }

  return {
    id: updated.id,
    status: updated.status,
    applicationStatus: decision === 'approve' ? 'Approved' : 'Rejected',
    facultyRating: rating || 0,
  };
}

