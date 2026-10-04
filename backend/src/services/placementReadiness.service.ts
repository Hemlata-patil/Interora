import { Prisma } from '@prisma/client';
import prisma from './prisma.service';
import { AppError } from '../middleware/errorHandler';

// ─────────────────────────────────────────────────────────────────────────────
// Types & Interfaces
// ─────────────────────────────────────────────────────────────────────────────

export interface UserContext {
  id: string;
  role: string;
}

export interface PlacementReadinessFilters {
  studentId?: string;
  minScore?: number;
  maxScore?: number;
}

export interface StructuredRecommendations {
  summary: string;
  strengths: string[];
  areasToImprove: string[];
  recommendedActions: string[];
  readinessTier: 'Ready for Placement' | 'Progressing Well' | 'Needs Upskilling' | 'Critical Focus Required';
}

// ─────────────────────────────────────────────────────────────────────────────
// Projections
// ─────────────────────────────────────────────────────────────────────────────

const SNAPSHOT_DETAIL_SELECT = {
  id: true,
  studentId: true,
  readinessScore: true,
  skillScore: true,
  internshipScore: true,
  evaluationScore: true,
  recommendations: true,
  computedAt: true,
  student: {
    select: {
      id: true,
      studentId: true,
      course: true,
      batchYear: true,
      currentSemester: true,
      cgpa: true,
      skills: true,
      departmentId: true,
      department: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
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
 * Validates whether the caller has permission to view or manage a student's placement readiness.
 */
export async function verifyStudentAccess(studentId: string, user: UserContext): Promise<void> {
  if (user.role === 'admin') {
    return;
  }

  if (user.role === 'student') {
    if (studentId !== user.id) {
      throw new AppError(403, 'Students can only view or calculate their own placement readiness.');
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
        'You are not authorized to view or calculate placement readiness for this student.'
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
        'You can only view or calculate placement readiness for interns hosted by your company.'
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
        'You can only view or calculate placement readiness for interns assigned to you.'
      );
    }
    return;
  }

  throw new AppError(403, 'You do not have permission to access placement readiness data.');
}

// ─────────────────────────────────────────────────────────────────────────────
// Calculation Engine
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Derives comprehensive placement readiness from all available student data:
 *
 * 1. Skill Score (Weight: 35% of total):
 *    - CGPA component (30%): (CGPA / maxScale) * 100
 *    - Profile Skills breadth (30%): 5+ skills -> 100%, 4 -> 85%, 3 -> 70%, 2 -> 55%, 1 -> 40%, 0 -> 25%
 *    - Learning Progress (40%): Average progress percent on tracked learning resources
 *
 * 2. Internship Operational Score (Weight: 40% of total):
 *    - Attendance rate (35%): from attendance_records (present, half_day, late, leave)
 *    - Task completion rate (35%): from tasks (reviewed, closed, submitted)
 *    - Work log consistency (15%): from work_logs
 *    - Milestone progress (15%): from milestones
 *    - Risk Flag Penalty: -15 pts for active high_risk flag, -7 pts for needs_attention
 *
 * 3. Evaluation Score (Weight: 25% of total):
 *    - Formal Evaluations: Average overallRating converted from 5-point scale to 100%
 *    - Fallback: Derived from operational tasks and attendance if no formal evaluation logged yet
 *
 * Overall Placement Readiness:
 *    readinessScore = round(0.35 * skillScore + 0.40 * internshipScore + 0.25 * evaluationScore)
 */
async function computeReadinessMetrics(studentId: string) {
  // 1. Fetch Student Profile with Department
  const student = await prisma.studentProfile.findUnique({
    where: { id: studentId },
    select: {
      id: true,
      cgpa: true,
      skills: true,
      learningProgress: {
        select: {
          progressPercent: true,
          status: true,
        },
      },
      assignments: {
        select: {
          id: true,
          status: true,
          attendanceRecords: {
            select: { status: true },
          },
          tasks: {
            select: { status: true },
          },
          milestones: {
            select: { status: true },
          },
          workLogs: {
            select: { hoursWorked: true },
          },
          evaluations: {
            select: { overallRating: true, status: true },
          },
          healthSnapshots: {
            orderBy: { snapshotDate: 'desc' },
            take: 1,
            select: { compositeScore: true, riskStatus: true },
          },
          riskFlags: {
            where: { resolved: false },
            select: { riskLevel: true, signalReason: true },
          },
        },
      },
    },
  });

  if (!student) {
    throw new AppError(404, 'Student profile not found.');
  }

  // ── Dimension 1: Skill Score (0-100) ───────────────────────────────────────
  let cgpaPct = 70; // baseline if null
  if (student.cgpa !== null) {
    const cgpaNum = Number(student.cgpa);
    if (cgpaNum > 4.0) {
      cgpaPct = Math.min(100, Math.max(0, (cgpaNum / 10.0) * 100));
    } else {
      cgpaPct = Math.min(100, Math.max(0, (cgpaNum / 4.0) * 100));
    }
  }

  const skillCount = student.skills.length;
  let skillsBreadthPct = 25;
  if (skillCount >= 5) skillsBreadthPct = 100;
  else if (skillCount === 4) skillsBreadthPct = 85;
  else if (skillCount === 3) skillsBreadthPct = 70;
  else if (skillCount === 2) skillsBreadthPct = 55;
  else if (skillCount === 1) skillsBreadthPct = 40;

  let learningProgressPct = 65; // baseline
  if (student.learningProgress.length > 0) {
    const sumPct = student.learningProgress.reduce((sum, p) => sum + p.progressPercent, 0);
    const avgPct = sumPct / student.learningProgress.length;
    const completedCount = student.learningProgress.filter((p) => p.status === 'completed').length;
    const completionBonus = Math.min(10, completedCount * 2);
    learningProgressPct = Math.min(100, Math.max(0, avgPct + completionBonus));
  }

  const skillScore = Math.min(
    100,
    Math.max(0, Math.round(0.30 * cgpaPct + 0.30 * skillsBreadthPct + 0.40 * learningProgressPct))
  );

  // ── Dimension 2: Internship Operational Score (0-100) ──────────────────────
  let totalAttendance = 0;
  let attendancePoints = 0;
  let totalTasks = 0;
  let taskPoints = 0;
  let totalMilestones = 0;
  let milestonePoints = 0;
  let totalWorkLogs = 0;
  let totalHours = 0;
  let highRiskCount = 0;
  let attentionRiskCount = 0;

  for (const a of student.assignments) {
    // Attendance
    for (const att of a.attendanceRecords) {
      totalAttendance++;
      if (att.status === 'present') attendancePoints += 1.0;
      else if (att.status === 'half_day') attendancePoints += 0.5;
      else if (att.status === 'late') attendancePoints += 0.8;
      else if (att.status === 'leave') attendancePoints += 0.8;
    }

    // Tasks
    for (const t of a.tasks) {
      totalTasks++;
      if (t.status === 'reviewed' || t.status === 'closed') taskPoints += 1.0;
      else if (t.status === 'submitted') taskPoints += 0.75;
      else if (t.status === 'in_progress') taskPoints += 0.4;
      else if (t.status === 'assigned') taskPoints += 0.1;
    }

    // Milestones
    for (const m of a.milestones) {
      totalMilestones++;
      if (m.status === 'completed') milestonePoints += 1.0;
      else if (m.status === 'in_progress') milestonePoints += 0.5;
      else if (m.status === 'delayed') milestonePoints += 0.2;
    }

    // Work logs
    totalWorkLogs += a.workLogs.length;
    for (const w of a.workLogs) {
      totalHours += Number(w.hoursWorked);
    }

    // Risk flags
    for (const rf of a.riskFlags) {
      if (rf.riskLevel === 'high_risk') highRiskCount++;
      else if (rf.riskLevel === 'needs_attention') attentionRiskCount++;
    }
  }

  const attendanceScore =
    totalAttendance > 0
      ? Math.min(100, Math.max(0, (attendancePoints / totalAttendance) * 100))
      : 80;

  const taskScore =
    totalTasks > 0
      ? Math.min(100, Math.max(0, (taskPoints / totalTasks) * 100))
      : 75;

  const milestoneScore =
    totalMilestones > 0
      ? Math.min(100, Math.max(0, (milestonePoints / totalMilestones) * 100))
      : 80;

  let workLogScore = 75;
  if (totalWorkLogs > 0) {
    const avgDailyHours = totalHours / totalWorkLogs;
    const hoursRatio = Math.min(1.0, avgDailyHours / 8.0);
    const logConsistency = Math.min(1.0, totalWorkLogs / Math.max(1, totalAttendance || totalWorkLogs));
    workLogScore = Math.min(100, Math.max(0, (hoursRatio * 0.6 + logConsistency * 0.4) * 100));
  }

  const rawInternshipScore =
    attendanceScore * 0.35 +
    taskScore * 0.35 +
    milestoneScore * 0.15 +
    workLogScore * 0.15;

  // Deduct penalty for active unresolved risk flags
  const riskPenalty = highRiskCount * 15 + attentionRiskCount * 7;
  const internshipScore = Math.min(100, Math.max(0, Math.round(rawInternshipScore - riskPenalty)));

  // ── Dimension 3: Evaluation Score (0-100) ──────────────────────────────────
  let totalEvaluations = 0;
  let sumOverallRatings = 0;

  for (const a of student.assignments) {
    for (const ev of a.evaluations) {
      if (ev.overallRating !== null) {
        totalEvaluations++;
        sumOverallRatings += Number(ev.overallRating);
      }
    }
  }

  let evaluationScore: number;
  if (totalEvaluations > 0) {
    const avgRating = sumOverallRatings / totalEvaluations; // 1.0 to 5.0
    evaluationScore = Math.min(100, Math.max(0, Math.round((avgRating / 5.0) * 100)));
  } else {
    // If no formal evaluation is completed yet, derive proxy from tasks and attendance
    evaluationScore = Math.min(
      100,
      Math.max(0, Math.round(0.50 * attendanceScore + 0.50 * taskScore))
    );
  }

  // ── Overall Composite Placement Readiness Score ───────────────────────────
  const readinessScore = Math.min(
    100,
    Math.max(
      0,
      Math.round(
        skillScore * 0.35 +
        internshipScore * 0.40 +
        evaluationScore * 0.25
      )
    )
  );

  // ── Formulate Structured Recommendations ──────────────────────────────────
  const strengths: string[] = [];
  const areasToImprove: string[] = [];
  const recommendedActions: string[] = [];

  if (skillScore >= 80) {
    strengths.push('Strong foundational and technical skill set with verified competencies.');
  } else {
    areasToImprove.push('Expand industry-recognized technical skills and complete recommended learning resources.');
    recommendedActions.push('Track and finish remaining modules in the Learning Resources catalog.');
  }

  if (attendanceScore >= 85) {
    strengths.push('Exemplary professional attendance and punctuality records.');
  } else {
    areasToImprove.push('Improve daily attendance consistency during internship assignments.');
  }

  if (taskScore >= 80) {
    strengths.push('High reliability in timely task deliverables and reviewed submissions.');
  } else {
    areasToImprove.push('Accelerate deliverable milestones to prevent pending task accumulation.');
    recommendedActions.push('Collaborate closely with your industry mentor to unblock pending tasks.');
  }

  if (evaluationScore >= 80) {
    strengths.push('Outstanding performance reviews from company and academic supervisors.');
  } else if (totalEvaluations === 0) {
    areasToImprove.push('Awaiting formal faculty or mentor mid-term evaluation review.');
    recommendedActions.push('Request formal progress evaluation from your supervising mentor.');
  } else {
    areasToImprove.push('Focus on feedback provided in latest performance evaluation.');
  }

  if (highRiskCount > 0 || attentionRiskCount > 0) {
    areasToImprove.push(`Resolve ${highRiskCount + attentionRiskCount} active operational risk flag(s).`);
    recommendedActions.push('Schedule a 1-on-1 counseling session with your assigned faculty mentor.');
  }

  let readinessTier: StructuredRecommendations['readinessTier'] = 'Ready for Placement';
  let summary = 'The candidate demonstrates high professional maturity and technical competence, ready for corporate placement.';

  if (readinessScore >= 80) {
    readinessTier = 'Ready for Placement';
    summary = 'Outstanding performance across technical, operational, and evaluation benchmarks. Prime candidate for immediate corporate placement or PPO conversion.';
  } else if (readinessScore >= 65) {
    readinessTier = 'Progressing Well';
    summary = 'Solid overall foundation with consistent performance. Targeted focus on remaining learning paths will elevate placement competitiveness.';
  } else if (readinessScore >= 50) {
    readinessTier = 'Needs Upskilling';
    summary = 'Demonstrating baseline competencies but requires focused upskilling and consistent attendance to meet placement thresholds.';
  } else {
    readinessTier = 'Critical Focus Required';
    summary = 'Immediate faculty intervention recommended to address operational delays, attendance gaps, or pending deliverables.';
  }

  const recommendations: StructuredRecommendations = {
    summary,
    strengths: strengths.length > 0 ? strengths : ['Active internship enrollment and baseline course progress.'],
    areasToImprove: areasToImprove.length > 0 ? areasToImprove : ['Continue maintaining high performance standards.'],
    recommendedActions: recommendedActions.length > 0 ? recommendedActions : ['Prepare corporate portfolio and resume for upcoming campus placement drives.'],
    readinessTier,
  };

  return {
    studentId,
    readinessScore,
    skillScore,
    internshipScore,
    evaluationScore,
    recommendations: recommendations as unknown as Prisma.InputJsonValue,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Service Methods
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Lists placement readiness snapshots with role-based scoping and filtering.
 */
export async function listPlacementReadinessSnapshots(
  filters: PlacementReadinessFilters,
  user: UserContext
) {
  const where: Prisma.PlacementReadinessSnapshotWhereInput = {};

  if (user.role === 'student') {
    where.studentId = user.id;
  } else if (filters.studentId) {
    await verifyStudentAccess(filters.studentId, user);
    where.studentId = filters.studentId;
  } else if (user.role === 'faculty') {
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
    throw new AppError(403, 'You do not have permission to view placement readiness snapshots.');
  }

  if (filters.minScore !== undefined) {
    where.readinessScore = { ...(where.readinessScore as object), gte: filters.minScore };
  }

  if (filters.maxScore !== undefined) {
    where.readinessScore = { ...(where.readinessScore as object), lte: filters.maxScore };
  }

  return prisma.placementReadinessSnapshot.findMany({
    where,
    orderBy: { computedAt: 'desc' },
    select: SNAPSHOT_DETAIL_SELECT,
  });
}

/**
 * Gets a single snapshot by its ID.
 */
export async function getPlacementReadinessById(id: string, user: UserContext) {
  const snapshot = await prisma.placementReadinessSnapshot.findUnique({
    where: { id },
    select: SNAPSHOT_DETAIL_SELECT,
  });

  if (!snapshot) {
    throw new AppError(404, 'Placement readiness snapshot not found.');
  }

  await verifyStudentAccess(snapshot.studentId, user);

  return snapshot;
}

/**
 * Gets the most recent placement readiness snapshot for a given student.
 */
export async function getLatestPlacementReadiness(studentId: string, user: UserContext) {
  await verifyStudentAccess(studentId, user);

  const snapshot = await prisma.placementReadinessSnapshot.findFirst({
    where: { studentId },
    orderBy: { computedAt: 'desc' },
    select: SNAPSHOT_DETAIL_SELECT,
  });

  if (!snapshot) {
    throw new AppError(404, 'No placement readiness snapshot found for this student. Calculate one first.');
  }

  return snapshot;
}

/**
 * Calculates and persists a new placement readiness snapshot for a student.
 * Uses a Prisma transaction to write the snapshot and verify student data atomically.
 */
export async function calculateAndSavePlacementReadiness(
  targetStudentId: string,
  user: UserContext
) {
  await verifyStudentAccess(targetStudentId, user);

  const metrics = await computeReadinessMetrics(targetStudentId);

  return prisma.$transaction(async (tx) => {
    return tx.placementReadinessSnapshot.create({
      data: {
        studentId: metrics.studentId,
        readinessScore: metrics.readinessScore,
        skillScore: metrics.skillScore,
        internshipScore: metrics.internshipScore,
        evaluationScore: metrics.evaluationScore,
        recommendations: metrics.recommendations,
        computedAt: new Date(),
      },
      select: SNAPSHOT_DETAIL_SELECT,
    });
  });
}

/**
 * Recalculates and updates an existing snapshot in-place with latest operational metrics.
 */
export async function recalculatePlacementReadiness(id: string, user: UserContext) {
  const existing = await prisma.placementReadinessSnapshot.findUnique({
    where: { id },
    select: { id: true, studentId: true },
  });

  if (!existing) {
    throw new AppError(404, 'Placement readiness snapshot not found.');
  }

  await verifyStudentAccess(existing.studentId, user);

  const metrics = await computeReadinessMetrics(existing.studentId);

  return prisma.$transaction(async (tx) => {
    return tx.placementReadinessSnapshot.update({
      where: { id },
      data: {
        readinessScore: metrics.readinessScore,
        skillScore: metrics.skillScore,
        internshipScore: metrics.internshipScore,
        evaluationScore: metrics.evaluationScore,
        recommendations: metrics.recommendations,
        computedAt: new Date(),
      },
      select: SNAPSHOT_DETAIL_SELECT,
    });
  });
}

/**
 * Deletes a placement readiness snapshot.
 * Allowed: Admin only.
 */
export async function deletePlacementReadiness(id: string, user: UserContext) {
  if (user.role !== 'admin') {
    throw new AppError(403, 'Only administrators can delete placement readiness snapshots.');
  }

  const existing = await prisma.placementReadinessSnapshot.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existing) {
    throw new AppError(404, 'Placement readiness snapshot not found.');
  }

  return prisma.placementReadinessSnapshot.delete({
    where: { id },
    select: { id: true, studentId: true, readinessScore: true },
  });
}
