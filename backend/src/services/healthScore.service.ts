import { Prisma, RiskLevel } from '@prisma/client';
import prisma from './prisma.service';
import { AppError } from '../middleware/errorHandler';

// ─────────────────────────────────────────────────────────────────────────────
// Types & Interfaces
// ─────────────────────────────────────────────────────────────────────────────

export interface CalculateHealthScoreInput {
  assignmentId: string;
  snapshotDate?: string | Date;
}

export interface CreateRiskFlagInput {
  assignmentId: string;
  riskLevel: RiskLevel;
  signalReason: string;
  interventionNotes?: string | null;
}

export interface UpdateRiskFlagInput {
  riskLevel?: RiskLevel;
  signalReason?: string;
  resolved?: boolean;
  interventionNotes?: string | null;
}

export interface HealthScoreFilters {
  assignmentId?: string;
  studentId?: string;
  riskStatus?: RiskLevel;
  startDate?: string | Date;
  endDate?: string | Date;
}

export interface RiskFlagFilters {
  assignmentId?: string;
  studentId?: string;
  riskLevel?: RiskLevel;
  resolved?: boolean;
}

export interface UserContext {
  id: string;
  role: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Projections & Helper Functions
// ─────────────────────────────────────────────────────────────────────────────

const SNAPSHOT_DETAIL_SELECT = {
  id: true,
  assignmentId: true,
  snapshotDate: true,
  attendanceScore: true,
  taskCompletionScore: true,
  milestoneScore: true,
  workLogScore: true,
  compositeScore: true,
  riskStatus: true,
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
} as const;

const RISK_FLAG_DETAIL_SELECT = {
  id: true,
  assignmentId: true,
  riskLevel: true,
  signalReason: true,
  detectedAt: true,
  resolved: true,
  resolvedAt: true,
  interventionNotes: true,
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

// ─────────────────────────────────────────────────────────────────────────────
// 1. List Health Score Snapshots: GET /api/health-scores
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns health-score snapshots scoped to caller's role.
 */
export async function listHealthScoreSnapshots(
  filters: HealthScoreFilters,
  user: UserContext
) {
  const where: Prisma.HealthScoreSnapshotWhereInput = {};
  const assignmentWhere: Prisma.InternshipAssignmentWhereInput = {};

  // Scope enforcement
  if (user.role === 'student') {
    assignmentWhere.studentId = user.id;
  } else if (user.role === 'company') {
    assignmentWhere.companyId = user.id;
  } else if (user.role === 'faculty') {
    assignmentWhere.OR = [
      { facultyMentorId: user.id },
      { student: { facultyMappings: { some: { facultyId: user.id } } } },
    ];
  } else if (user.role === 'mentor') {
    assignmentWhere.industryMentorId = user.id;
  } else if (user.role !== 'admin') {
    throw new AppError(403, 'You do not have permission to view health score snapshots.');
  }

  // Filters
  if (filters.assignmentId) {
    where.assignmentId = filters.assignmentId;
  }

  if (filters.studentId && (user.role === 'admin' || user.role === 'company' || user.role === 'faculty')) {
    assignmentWhere.studentId = filters.studentId;
  }

  if (Object.keys(assignmentWhere).length > 0) {
    where.assignment = assignmentWhere;
  }

  if (filters.riskStatus) {
    where.riskStatus = filters.riskStatus;
  }

  if (filters.startDate || filters.endDate) {
    where.snapshotDate = {};
    if (filters.startDate) {
      where.snapshotDate.gte = normalizeDate(filters.startDate);
    }
    if (filters.endDate) {
      where.snapshotDate.lte = normalizeDate(filters.endDate);
    }
  }

  return prisma.healthScoreSnapshot.findMany({
    where,
    orderBy: { snapshotDate: 'desc' },
    select: {
      id: true,
      assignmentId: true,
      snapshotDate: true,
      attendanceScore: true,
      taskCompletionScore: true,
      milestoneScore: true,
      workLogScore: true,
      compositeScore: true,
      riskStatus: true,
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
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Get Health Score Snapshot by ID: GET /api/health-scores/:id
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Retrieves a single snapshot with full assignment relations.
 */
export async function getHealthScoreSnapshotById(id: string, user: UserContext) {
  const snapshot = await prisma.healthScoreSnapshot.findUnique({
    where: { id },
    select: SNAPSHOT_DETAIL_SELECT,
  });

  if (!snapshot) {
    throw new AppError(404, 'Health score snapshot not found.');
  }

  const assignment = snapshot.assignment;
  const isStudent = user.role === 'student' && assignment.studentId === user.id;
  const isCompany = user.role === 'company' && assignment.companyId === user.id;
  const isFaculty = user.role === 'faculty' && assignment.facultyMentorId === user.id;
  const isMentor = user.role === 'mentor' && assignment.industryMentorId === user.id;
  const isAdmin = user.role === 'admin';

  if (!isStudent && !isCompany && !isFaculty && !isMentor && !isAdmin) {
    throw new AppError(403, 'You are not authorized to view this health score snapshot.');
  }

  return snapshot;
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Calculate and Save Health Score Snapshot: POST /api/health-scores/calculate
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Derives operational health scores from persisted records:
 * - Attendance (30%): (present + 0.5*half_day + 0.8*late + 0.8*leave) / totalDays * 100
 * - Tasks (30%): (reviewed/closed*1.0 + submitted*0.75 + in_progress*0.4 + assigned*0.1) / totalTasks * 100
 * - Milestones (25%): (completed*1.0 + in_progress*0.5 + delayed*0.2) / totalMilestones * 100
 * - Work Logs (15%): (avgHoursRatio*0.6 + frequencyRatio*0.4) * 100
 *
 * Composite: 0.30*attendance + 0.30*tasks + 0.25*milestones + 0.15*worklogs
 *
 * Risk Status:
 * - high_risk: composite < 60 OR attendance < 60
 * - needs_attention: composite < 75 OR taskCompletion < 60 OR milestone < 50
 * - on_track: otherwise
 *
 * Automatically creates an active RiskFlag if high_risk or needs_attention occurs.
 */
export async function calculateAndSaveHealthScore(
  input: CalculateHealthScoreInput,
  user: UserContext
) {
  if (user.role === 'student') {
    throw new AppError(403, 'Students cannot calculate or modify health score snapshots.');
  }

  const assignment = await prisma.internshipAssignment.findUnique({
    where: { id: input.assignmentId },
    select: {
      id: true,
      studentId: true,
      companyId: true,
      facultyMentorId: true,
      industryMentorId: true,
      status: true,
      startDate: true,
      endDate: true,
    },
  });

  if (!assignment) {
    throw new AppError(404, 'Internship assignment not found.');
  }

  const isCompany = user.role === 'company' && assignment.companyId === user.id;
  const isFaculty = user.role === 'faculty' && assignment.facultyMentorId === user.id;
  const isMentor = user.role === 'mentor' && assignment.industryMentorId === user.id;
  const isAdmin = user.role === 'admin';

  if (!isCompany && !isFaculty && !isMentor && !isAdmin) {
    throw new AppError(403, 'You are not authorized to calculate health scores for this assignment.');
  }

  const targetDate = normalizeDate(input.snapshotDate);

  // 1. Attendance Score Calculation
  const attendanceRecords = await prisma.attendanceRecord.findMany({
    where: { assignmentId: assignment.id },
  });

  let attendanceScore = new Prisma.Decimal('100.00');
  if (attendanceRecords.length > 0) {
    let presentPoints = 0;
    for (const r of attendanceRecords) {
      if (r.status === 'present') presentPoints += 1.0;
      else if (r.status === 'half_day') presentPoints += 0.5;
      else if (r.status === 'late') presentPoints += 0.8;
      else if (r.status === 'leave') presentPoints += 0.8;
    }
    const pct = Math.min(100, Math.max(0, (presentPoints / attendanceRecords.length) * 100));
    attendanceScore = new Prisma.Decimal(pct.toFixed(2));
  }

  // 2. Task Completion Score Calculation
  const tasks = await prisma.task.findMany({
    where: { assignmentId: assignment.id },
  });

  let taskCompletionScore = new Prisma.Decimal('100.00');
  if (tasks.length > 0) {
    let taskPoints = 0;
    for (const t of tasks) {
      if (t.status === 'reviewed' || t.status === 'closed') taskPoints += 1.0;
      else if (t.status === 'submitted') taskPoints += 0.75;
      else if (t.status === 'in_progress') taskPoints += 0.4;
      else if (t.status === 'assigned') taskPoints += 0.1;
    }
    const pct = Math.min(100, Math.max(0, (taskPoints / tasks.length) * 100));
    taskCompletionScore = new Prisma.Decimal(pct.toFixed(2));
  }

  // 3. Milestone Score Calculation
  const milestones = await prisma.milestone.findMany({
    where: { assignmentId: assignment.id },
  });

  let milestoneScore = new Prisma.Decimal('100.00');
  if (milestones.length > 0) {
    let milestonePoints = 0;
    for (const m of milestones) {
      if (m.status === 'completed') milestonePoints += 1.0;
      else if (m.status === 'in_progress') milestonePoints += 0.5;
      else if (m.status === 'delayed') milestonePoints += 0.2;
    }
    const pct = Math.min(100, Math.max(0, (milestonePoints / milestones.length) * 100));
    milestoneScore = new Prisma.Decimal(pct.toFixed(2));
  }

  // 4. Work Log Score Calculation
  const workLogs = await prisma.workLog.findMany({
    where: { assignmentId: assignment.id },
  });

  let workLogScore = new Prisma.Decimal('100.00');
  if (workLogs.length > 0) {
    const totalHours = workLogs.reduce((sum, w) => sum + Number(w.hoursWorked), 0);
    const avgHours = totalHours / workLogs.length;
    const hoursRatio = Math.min(1.0, avgHours / 8.0);
    const totalExpectedDays = attendanceRecords.length > 0 ? attendanceRecords.length : workLogs.length;
    const frequencyRatio = Math.min(1.0, workLogs.length / Math.max(1, totalExpectedDays));
    const pct = Math.min(100, Math.max(0, (hoursRatio * 0.6 + frequencyRatio * 0.4) * 100));
    workLogScore = new Prisma.Decimal(pct.toFixed(2));
  } else if (attendanceRecords.length > 3) {
    workLogScore = new Prisma.Decimal('20.00');
  }

  // 5. Composite Score Calculation
  const compositeNum =
    Number(attendanceScore) * 0.30 +
    Number(taskCompletionScore) * 0.30 +
    Number(milestoneScore) * 0.25 +
    Number(workLogScore) * 0.15;
  const compositeScore = new Prisma.Decimal(compositeNum.toFixed(2));

  // 6. Risk Status & Signal Determination
  let riskStatus: RiskLevel = 'on_track';
  const signals: string[] = [];

  if (Number(attendanceScore) < 60) {
    signals.push(`Severe attendance deficit (${attendanceScore}%)`);
  } else if (Number(attendanceScore) < 75) {
    signals.push(`Low attendance (${attendanceScore}%)`);
  }

  if (Number(taskCompletionScore) < 40) {
    signals.push(`Severe task completion delay (${taskCompletionScore}%)`);
  } else if (Number(taskCompletionScore) < 60) {
    signals.push(`Lagging task deliverables (${taskCompletionScore}%)`);
  }

  if (Number(milestoneScore) < 50 && milestones.length > 0) {
    signals.push(`Project milestones behind schedule (${milestoneScore}%)`);
  }

  if (Number(compositeScore) < 60 || Number(attendanceScore) < 60) {
    riskStatus = 'high_risk';
  } else if (Number(compositeScore) < 75 || signals.length > 0) {
    riskStatus = 'needs_attention';
  }

  // Execute in transaction to upsert snapshot and synchronize risk flag
  return prisma.$transaction(async (tx) => {
    const snapshot = await tx.healthScoreSnapshot.upsert({
      where: {
        assignmentId_snapshotDate: {
          assignmentId: assignment.id,
          snapshotDate: targetDate,
        },
      },
      create: {
        assignmentId: assignment.id,
        snapshotDate: targetDate,
        attendanceScore,
        taskCompletionScore,
        milestoneScore,
        workLogScore,
        compositeScore,
        riskStatus,
      },
      update: {
        attendanceScore,
        taskCompletionScore,
        milestoneScore,
        workLogScore,
        compositeScore,
        riskStatus,
      },
      select: SNAPSHOT_DETAIL_SELECT,
    });

    // If risk status is elevated, ensure an unresolved RiskFlag is registered
    if (riskStatus !== 'on_track') {
      const activeFlag = await tx.riskFlag.findFirst({
        where: {
          assignmentId: assignment.id,
          resolved: false,
          riskLevel: riskStatus,
        },
      });

      if (!activeFlag) {
        await tx.riskFlag.create({
          data: {
            assignmentId: assignment.id,
            riskLevel: riskStatus,
            signalReason:
              signals.join('; ') || `Composite score dropped to ${compositeScore}%`,
            detectedAt: new Date(),
          },
        });
      }
    }

    return snapshot;
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. List Risk Flags: GET /api/risk-flags
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns risk flags scoped to caller's role.
 */
export async function listRiskFlags(
  filters: RiskFlagFilters,
  user: UserContext
) {
  const where: Prisma.RiskFlagWhereInput = {};
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
    throw new AppError(403, 'You do not have permission to view risk flags.');
  }

  // Filters
  if (filters.assignmentId) {
    where.assignmentId = filters.assignmentId;
  }

  if (filters.studentId && (user.role === 'admin' || user.role === 'company' || user.role === 'faculty')) {
    assignmentWhere.studentId = filters.studentId;
  }

  if (Object.keys(assignmentWhere).length > 0) {
    where.assignment = assignmentWhere;
  }

  if (filters.riskLevel) {
    where.riskLevel = filters.riskLevel;
  }

  if (filters.resolved !== undefined) {
    where.resolved = filters.resolved;
  }

  return prisma.riskFlag.findMany({
    where,
    orderBy: { detectedAt: 'desc' },
    select: {
      id: true,
      assignmentId: true,
      riskLevel: true,
      signalReason: true,
      detectedAt: true,
      resolved: true,
      resolvedAt: true,
      interventionNotes: true,
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
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Get Risk Flag by ID: GET /api/risk-flags/:id
// ─────────────────────────────────────────────────────────────────────────────

export async function getRiskFlagById(id: string, user: UserContext) {
  const flag = await prisma.riskFlag.findUnique({
    where: { id },
    select: RISK_FLAG_DETAIL_SELECT,
  });

  if (!flag) {
    throw new AppError(404, 'Risk flag not found.');
  }

  const assignment = flag.assignment;
  const isStudent = user.role === 'student' && assignment.studentId === user.id;
  const isCompany = user.role === 'company' && assignment.companyId === user.id;
  const isFaculty = user.role === 'faculty' && assignment.facultyMentorId === user.id;
  const isMentor = user.role === 'mentor' && assignment.industryMentorId === user.id;
  const isAdmin = user.role === 'admin';

  if (!isStudent && !isCompany && !isFaculty && !isMentor && !isAdmin) {
    throw new AppError(403, 'You are not authorized to view this risk flag.');
  }

  return flag;
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Create Risk Flag: POST /api/risk-flags
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Manually logs a risk flag.
 * Allowed: Faculty, Company, Industry Mentor, Admin.
 */
export async function createRiskFlag(
  input: CreateRiskFlagInput,
  user: UserContext
) {
  if (user.role === 'student') {
    throw new AppError(403, 'Students are not authorized to create risk flags.');
  }

  const assignment = await prisma.internshipAssignment.findUnique({
    where: { id: input.assignmentId },
    select: {
      id: true,
      companyId: true,
      facultyMentorId: true,
      industryMentorId: true,
      status: true,
    },
  });

  if (!assignment) {
    throw new AppError(404, 'Internship assignment not found.');
  }

  const isCompany = user.role === 'company' && assignment.companyId === user.id;
  const isFaculty = user.role === 'faculty' && assignment.facultyMentorId === user.id;
  const isMentor = user.role === 'mentor' && assignment.industryMentorId === user.id;
  const isAdmin = user.role === 'admin';

  if (!isCompany && !isFaculty && !isMentor && !isAdmin) {
    throw new AppError(403, 'You are not authorized to raise risk flags for this assignment.');
  }

  // Prevent duplicate unresolved risk flags for the same assignment and reason
  const existing = await prisma.riskFlag.findFirst({
    where: {
      assignmentId: assignment.id,
      riskLevel: input.riskLevel,
      signalReason: input.signalReason.trim(),
      resolved: false,
    },
  });

  if (existing) {
    throw new AppError(
      409,
      'An active unresolved risk flag with identical risk level and reason already exists.'
    );
  }

  return prisma.riskFlag.create({
    data: {
      assignmentId: assignment.id,
      riskLevel: input.riskLevel,
      signalReason: input.signalReason.trim(),
      interventionNotes: input.interventionNotes?.trim() || null,
      detectedAt: new Date(),
      resolved: false,
    },
    select: RISK_FLAG_DETAIL_SELECT,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. Update / Resolve Risk Flag: PATCH /api/risk-flags/:id
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Updates a risk flag or marks it resolved with intervention notes.
 * Allowed: Faculty, Company, Industry Mentor, Admin.
 */
export async function updateRiskFlag(
  id: string,
  input: UpdateRiskFlagInput,
  user: UserContext
) {
  if (user.role === 'student') {
    throw new AppError(403, 'Students are not authorized to update risk flags.');
  }

  const flag = await prisma.riskFlag.findUnique({
    where: { id },
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

  if (!flag) {
    throw new AppError(404, 'Risk flag not found.');
  }

  const isCompany = user.role === 'company' && flag.assignment.companyId === user.id;
  const isFaculty = user.role === 'faculty' && flag.assignment.facultyMentorId === user.id;
  const isMentor = user.role === 'mentor' && flag.assignment.industryMentorId === user.id;
  const isAdmin = user.role === 'admin';

  if (!isCompany && !isFaculty && !isMentor && !isAdmin) {
    throw new AppError(403, 'You are not authorized to update this risk flag.');
  }

  const data: Prisma.RiskFlagUpdateInput = {};

  if (input.riskLevel !== undefined) {
    data.riskLevel = input.riskLevel;
  }

  if (input.signalReason !== undefined) {
    const trimmed = input.signalReason.trim();
    if (!trimmed) throw new AppError(400, 'signalReason cannot be empty.');
    data.signalReason = trimmed;
  }

  if (input.interventionNotes !== undefined) {
    data.interventionNotes = input.interventionNotes ? input.interventionNotes.trim() : null;
  }

  if (input.resolved !== undefined) {
    data.resolved = input.resolved;
    if (input.resolved && !flag.resolved) {
      data.resolvedAt = new Date();
    } else if (!input.resolved && flag.resolved) {
      data.resolvedAt = null;
    }
  }

  return prisma.riskFlag.update({
    where: { id },
    data,
    select: RISK_FLAG_DETAIL_SELECT,
  });
}
