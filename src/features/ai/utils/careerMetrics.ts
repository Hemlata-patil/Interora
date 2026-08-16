import { mockActiveInternshipData } from '@/features/internships/data/mockActiveInternship';
import { mockAttendanceHistory, calculateAttendanceMetrics } from '@/features/attendance/data/mockAttendance';
import { initialMockMilestones, initialMockEvaluations, calculateOverallProgress, calculateOverallEvaluationScore } from '@/features/milestones/data/mockMilestones';
import { initialMockTasks, initialMockWorkLogs } from '@/features/tasks/data/mockTasks';
import type { CareerAnalysisInput } from '../types/aiCareer';

export interface CareerReadinessResult {
  score: number;
  level: 'Excellent' | 'Strong' | 'Developing' | 'Needs Improvement';
  breakdown: {
    attendanceContribution: number;
    taskContribution: number;
    milestoneContribution: number;
    evaluationContribution: number;
    workLogContribution: number;
  };
}

export const calculateCareerReadiness = (input: CareerAnalysisInput): CareerReadinessResult => {
  // Normalize each metric to 0-100
  const attendanceScore = input.performance.attendancePercentage; // 0-100
  const taskScore = input.performance.taskCompletionPercentage; // 0-100
  const milestoneScore = input.performance.milestoneCompletionPercentage; // 0-100

  // Evaluation score is out of 10 -> scale to 0-100
  const evalScore = Math.min(100, Math.max(0, input.performance.mentorEvaluationScore * 10));

  // Work log consistency: ratio of total hours against target ~40 hrs for current stage
  const workLogScore = Math.min(100, Math.round((input.performance.totalHoursLogged / 40) * 100));

  // Weighted calculation (15% + 25% + 25% + 25% + 10% = 100%)
  const attendanceContribution = attendanceScore * 0.15;
  const taskContribution = taskScore * 0.25;
  const milestoneContribution = milestoneScore * 0.25;
  const evaluationContribution = evalScore * 0.25;
  const workLogContribution = workLogScore * 0.10;

  const rawScore = attendanceContribution + taskContribution + milestoneContribution + evaluationContribution + workLogContribution;
  const score = Math.round(rawScore);

  let level: CareerReadinessResult['level'] = 'Developing';
  if (score >= 90) level = 'Excellent';
  else if (score >= 75) level = 'Strong';
  else if (score >= 60) level = 'Developing';
  else level = 'Needs Improvement';

  return {
    score,
    level,
    breakdown: {
      attendanceContribution: Math.round(attendanceContribution),
      taskContribution: Math.round(taskContribution),
      milestoneContribution: Math.round(milestoneContribution),
      evaluationContribution: Math.round(evaluationContribution),
      workLogContribution: Math.round(workLogContribution),
    },
  };
};

export const getNormalizedStudentInput = (): CareerAnalysisInput => {
  const activeInternship = mockActiveInternshipData;
  const attendanceMetrics = calculateAttendanceMetrics(mockAttendanceHistory);
  const milestoneMetrics = calculateOverallProgress(initialMockMilestones);

  const totalTasks = initialMockTasks.length;
  const completedTasks = initialMockTasks.filter((t) => t.status === 'Completed').length;
  const taskCompletionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const totalHoursLogged = initialMockWorkLogs.reduce((acc, curr) => acc + curr.hoursWorked, 0);

  const midEval = initialMockEvaluations.find((e) => e.type === 'Mid-Term Review');
  const evalScore = midEval ? calculateOverallEvaluationScore(midEval) : 8.6;

  return {
    student: {
      name: 'Alex Johnson',
      education: 'B.S. Computer Science (Senior Year)',
      targetCareer: 'Full Stack Software Engineer',
    },
    skills: {
      technical: ['React.js', 'TypeScript', 'JavaScript (ES6+)', 'Tailwind CSS', 'HTML5/CSS3'],
      tools: ['Git', 'Vite', 'VS Code', 'Chrome DevTools', 'Postman'],
      languages: ['TypeScript', 'JavaScript', 'HTML/CSS', 'Python (Basic)'],
    },
    internship: {
      role: activeInternship ? activeInternship.internshipTitle : 'Frontend React Development Intern',
      company: activeInternship ? activeInternship.companyName : 'TechCorp Solutions',
      workMode: activeInternship ? activeInternship.workMode : 'Remote',
      duration: activeInternship ? activeInternship.duration : '3 Months',
    },
    performance: {
      attendancePercentage: attendanceMetrics.attendancePercentage,
      taskCompletionPercentage,
      milestoneCompletionPercentage: milestoneMetrics.overallPercentage,
      mentorEvaluationScore: evalScore,
      totalHoursLogged,
    },
    milestones: {
      completedCount: milestoneMetrics.completedCount,
      totalCount: milestoneMetrics.totalCount,
      currentMilestoneTitle: milestoneMetrics.currentMilestone?.title,
    },
    evaluations: {
      technicalSkillsScore: midEval?.technicalSkills || 8.5,
      problemSolvingScore: midEval?.problemSolving || 9.0,
      communicationScore: midEval?.communication || 8.0,
      professionalismScore: midEval?.professionalism || 9.0,
      mentorFeedback: midEval?.feedback || 'Strong frontend React & TypeScript implementation.',
      strengths: midEval?.strengths || ['React component design', 'Consistent daily tasks'],
      improvementAreas: midEval?.areasForImprovement || ['Automated integration testing', 'Inline API docs'],
    },
  };
};