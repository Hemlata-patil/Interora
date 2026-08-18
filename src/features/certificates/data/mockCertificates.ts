import { mockActiveInternshipData } from '@/features/internships/data/mockActiveInternship';
import { mockAttendanceHistory, calculateAttendanceMetrics } from '@/features/attendance/data/mockAttendance';
import { initialMockMilestones, initialMockEvaluations, calculateOverallProgress } from '@/features/milestones/data/mockMilestones';
import { initialMockTasks } from '@/features/tasks/data/mockTasks';

export type CertificateStatus = 'Not Eligible' | 'Eligible' | 'Issued';

export interface CertificateRequirement {
  id: string;
  name: string;
  currentValue: string;
  requiredValue: string;
  isMet: boolean;
}

export interface CertificateRecord {
  id: string;
  certificateNumber: string;
  studentName: string;
  internshipId: string;
  internshipTitle: string;
  companyName: string;
  startDate: string;
  endDate: string;
  issueDate?: string;
  status: CertificateStatus;
  isEligible: boolean;
  attendancePercentage: number;
  milestoneCompletionPercentage: number;
  taskCompletionPercentage: number;
  evaluationCompleted: boolean;
  evaluationScore: number;
  skills: string[];
  requirements: CertificateRequirement[];
}

export const calculateCertificateData = (): CertificateRecord | null => {
  const activeInternship = mockActiveInternshipData;
  if (!activeInternship) return null;

  // Derive attendance metrics from Phase 5 data
  const attendanceMetrics = calculateAttendanceMetrics(mockAttendanceHistory);

  // Derive milestone progress from Phase 7 data
  const milestoneProgress = calculateOverallProgress(initialMockMilestones);

  // Derive task completion metrics from Phase 6 data
  const totalTasks = initialMockTasks.length;
  const completedTasks = initialMockTasks.filter((t) => t.status === 'Completed').length;
  const taskCompletionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Derive evaluation status from Phase 7 data
  const finalEval = initialMockEvaluations.find((e) => e.type === 'Final Evaluation');
  const midEval = initialMockEvaluations.find((e) => e.type === 'Mid-Term Review');
  const evaluationCompleted = Boolean(finalEval && finalEval.status === 'completed');
  const evaluationScore = midEval ? 8.6 : 0;

  // Requirements checklist
  const requirements: CertificateRequirement[] = [
    {
      id: 'req_01',
      name: 'Attendance Requirement',
      currentValue: `${attendanceMetrics.attendancePercentage}%`,
      requiredValue: '>= 75%',
      isMet: attendanceMetrics.attendancePercentage >= 75,
    },
    {
      id: 'req_02',
      name: 'Required Tasks Completion',
      currentValue: `${completedTasks} / ${totalTasks} tasks (${taskCompletionPercentage}%)`,
      requiredValue: '100% Tasks',
      isMet: taskCompletionPercentage === 100,
    },
    {
      id: 'req_03',
      name: 'Milestone Progression',
      currentValue: `${milestoneProgress.completedCount} / ${milestoneProgress.totalCount} milestones (${milestoneProgress.overallPercentage}%)`,
      requiredValue: '100% Milestones',
      isMet: milestoneProgress.completedCount === milestoneProgress.totalCount,
    },
    {
      id: 'req_04',
      name: 'Final Mentor Evaluation',
      currentValue: evaluationCompleted ? 'Completed' : 'Pending Mentor Review',
      requiredValue: 'Completed Evaluation',
      isMet: evaluationCompleted,
    },
  ];

  const isEligible = requirements.every((r) => r.isMet);
  const status: CertificateStatus = isEligible ? 'Eligible' : 'Not Eligible';

  return {
    id: 'cert_2026_101',
    certificateNumber: 'INT-2026-8849-TECH',
    studentName: 'Alex Johnson',
    internshipId: activeInternship.internshipId,
    internshipTitle: activeInternship.internshipTitle,
    companyName: activeInternship.companyName,
    startDate: activeInternship.startDate,
    endDate: activeInternship.endDate,
    issueDate: isEligible ? '2026-08-31' : undefined,
    status,
    isEligible,
    attendancePercentage: attendanceMetrics.attendancePercentage,
    milestoneCompletionPercentage: milestoneProgress.overallPercentage,
    taskCompletionPercentage,
    evaluationCompleted,
    evaluationScore,
    skills: ['React.js', 'TypeScript', 'Tailwind CSS', 'REST API', 'Frontend Architecture'],
    requirements,
  };
};