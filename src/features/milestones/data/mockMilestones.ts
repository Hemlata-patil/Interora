export type MilestoneStatus = 'completed' | 'current' | 'upcoming';
export type EvaluationStatus = 'completed' | 'upcoming';

export interface MilestoneRecord {
  id: string;
  title: string;
  description: string;
  phase: string;
  status: MilestoneStatus;
  startDate: string;
  dueDate: string;
  completedDate?: string;
  totalTasks: number;
  completedTasks: number;
  mentorName: string;
}

export interface EvaluationRecord {
  id: string;
  title: string;
  type: 'Mid-Term Review' | 'Final Evaluation';
  status: EvaluationStatus;
  evaluationDate?: string;
  evaluatorName?: string;
  evaluatorRole?: string;
  technicalSkills?: number; // Out of 10
  problemSolving?: number; // Out of 10
  communication?: number; // Out of 10
  professionalism?: number; // Out of 10
  feedback?: string;
  strengths?: string[];
  areasForImprovement?: string[];
}

export const initialMockMilestones: MilestoneRecord[] = [
  {
    id: 'ms_01',
    title: 'Orientation & Workspace Onboarding',
    description: 'Onboarding, repo access, workspace setup, and mentor introduction.',
    phase: 'Phase 1',
    status: 'completed',
    startDate: '2026-06-01',
    dueDate: '2026-06-15',
    completedDate: '2026-06-14',
    totalTasks: 5,
    completedTasks: 5,
    mentorName: 'Sarah Jenkins',
  },
  {
    id: 'ms_02',
    title: 'Foundational Tasks & UI Refactoring',
    description: 'Initial codebase familiarization, fixing layout issues, component refactoring.',
    phase: 'Phase 2',
    status: 'completed',
    startDate: '2026-06-16',
    dueDate: '2026-07-05',
    completedDate: '2026-07-04',
    totalTasks: 8,
    completedTasks: 8,
    mentorName: 'Sarah Jenkins',
  },
  {
    id: 'ms_03',
    title: 'Core Component Integration & State Refactoring',
    description: 'Building modern React components, TypeScript interfaces, and API integrations.',
    phase: 'Phase 3',
    status: 'current',
    startDate: '2026-07-06',
    dueDate: '2026-08-20',
    totalTasks: 20,
    completedTasks: 13,
    mentorName: 'Sarah Jenkins',
  },
  {
    id: 'ms_04',
    title: 'Mid-Term Evaluation & Code Quality Review',
    description: 'Faculty mentor review and industry performance evaluation.',
    phase: 'Phase 4',
    status: 'upcoming',
    startDate: '2026-08-21',
    dueDate: '2026-08-28',
    totalTasks: 6,
    completedTasks: 0,
    mentorName: 'Sarah Jenkins',
  },
  {
    id: 'ms_05',
    title: 'Final Report & Internship Graduation',
    description: 'Final work log submission, project demonstration, and certificate issuance.',
    phase: 'Phase 5',
    status: 'upcoming',
    startDate: '2026-08-29',
    dueDate: '2026-08-31',
    totalTasks: 4,
    completedTasks: 0,
    mentorName: 'Sarah Jenkins',
  },
];

export const initialMockEvaluations: EvaluationRecord[] = [
  {
    id: 'eval_01',
    title: 'Mid-Term Performance Evaluation',
    type: 'Mid-Term Review',
    status: 'completed',
    evaluationDate: '2026-08-14',
    evaluatorName: 'Sarah Jenkins',
    evaluatorRole: 'Senior Frontend Lead (TechCorp Solutions)',
    technicalSkills: 8.5,
    problemSolving: 9.0,
    communication: 8.0,
    professionalism: 9.0,
    feedback: 'Alex has shown exceptional growth in React component modularization and TypeScript design system practices. Consistently completes assigned sprint tasks ahead of schedule.',
    strengths: [
      'Strong frontend React & TypeScript implementation',
      'Good problem-solving ability in component state management',
      'Consistent daily task completion & work log updates',
    ],
    areasForImprovement: [
      'Automated integration testing coverage',
      'Writing technical inline documentation',
    ],
  },
  {
    id: 'eval_02',
    title: 'Final Internship Assessment & Graduation',
    type: 'Final Evaluation',
    status: 'upcoming',
  },
];

// Helper calculations
export const calculateMilestoneProgress = (m: MilestoneRecord): number => {
  if (m.totalTasks === 0) return 0;
  return Math.round((m.completedTasks / m.totalTasks) * 100);
};

export const calculateOverallProgress = (milestones: MilestoneRecord[]): {
  overallPercentage: number;
  completedCount: number;
  totalCount: number;
  currentMilestone?: MilestoneRecord;
} => {
  const totalCount = milestones.length;
  const completedCount = milestones.filter((m) => m.status === 'completed').length;
  const currentMilestone = milestones.find((m) => m.status === 'current');

  if (totalCount === 0) {
    return { overallPercentage: 0, completedCount: 0, totalCount: 0 };
  }

  // Weight progress across milestones
  const totalProgressSum = milestones.reduce((sum, m) => {
    if (m.status === 'completed') return sum + 100;
    if (m.status === 'current') return sum + calculateMilestoneProgress(m);
    return sum;
  }, 0);

  const overallPercentage = Math.round(totalProgressSum / totalCount);

  return {
    overallPercentage,
    completedCount,
    totalCount,
    currentMilestone,
  };
};

export const calculateOverallEvaluationScore = (evalRecord: EvaluationRecord): number => {
  if (
    evalRecord.technicalSkills === undefined ||
    evalRecord.problemSolving === undefined ||
    evalRecord.communication === undefined ||
    evalRecord.professionalism === undefined
  ) {
    return 0;
  }

  const sum =
    evalRecord.technicalSkills +
    evalRecord.problemSolving +
    evalRecord.communication +
    evalRecord.professionalism;

  return Math.round((sum / 4) * 10) / 10;
};