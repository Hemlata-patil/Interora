export interface JourneyMilestone {
  id: string;
  title: string;
  date: string;
  description: string;
  status: 'COMPLETED' | 'CURRENT' | 'UPCOMING';
}

export interface ImportantDate {
  id: string;
  title: string;
  date: string;
  iconName: string;
}

export interface WeeklyTimelineStep {
  weekNumber: number;
  title: string;
  status: 'COMPLETED' | 'CURRENT' | 'UPCOMING';
}

export interface InternshipJourneyMetrics {
  totalDays: number;
  daysCompleted: number;
  daysRemaining: number;
  progressPercentage: number;
  currentWeek: number;
  totalWeeks: number;
  statusText: string;
}

export const calculateJourneyMetrics = (startDateIso: string, endDateIso: string): InternshipJourneyMetrics => {
  const start = new Date(startDateIso).getTime();
  const end = new Date(endDateIso).getTime();
  const now = new Date().getTime();

  const totalMs = end - start;
  const totalDays = Math.max(1, Math.round(totalMs / (1000 * 60 * 60 * 24)));
  const totalWeeks = Math.max(1, Math.ceil(totalDays / 7));

  if (now < start) {
    const daysUntilStart = Math.ceil((start - now) / (1000 * 60 * 60 * 24));
    return {
      totalDays,
      daysCompleted: 0,
      daysRemaining: totalDays,
      progressPercentage: 0,
      currentWeek: 0,
      totalWeeks,
      statusText: `Starts in ${daysUntilStart} days`,
    };
  }

  if (now >= end) {
    return {
      totalDays,
      daysCompleted: totalDays,
      daysRemaining: 0,
      progressPercentage: 100,
      currentWeek: totalWeeks,
      totalWeeks,
      statusText: 'Internship Completed',
    };
  }

  const elapsedMs = now - start;
  const daysCompleted = Math.min(totalDays, Math.max(0, Math.floor(elapsedMs / (1000 * 60 * 60 * 24))));
  const daysRemaining = totalDays - daysCompleted;
  const progressPercentage = Math.min(100, Math.max(0, Math.round((elapsedMs / totalMs) * 100)));
  const currentWeek = Math.min(totalWeeks, Math.max(1, Math.ceil((daysCompleted + 1) / 7)));

  return {
    totalDays,
    daysCompleted,
    daysRemaining,
    progressPercentage,
    currentWeek,
    totalWeeks,
    statusText: `Day ${daysCompleted + 1} of ${totalDays} (${progressPercentage}%)`,
  };
};

export const generateWeeklyTimeline = (startDateIso: string, endDateIso: string): WeeklyTimelineStep[] => {
  const metrics = calculateJourneyMetrics(startDateIso, endDateIso);
  const steps: WeeklyTimelineStep[] = [];

  const weekTitles = [
    'Orientation & Onboarding',
    'Environment & Codebase Setup',
    'Core Feature Development',
    'API Integration & State Refactoring',
    'Testing & Bug Resolution',
    'Performance Optimization & Review',
    'Final Project Demonstration',
    'Final Submission & Evaluation',
  ];

  for (let i = 1; i <= metrics.totalWeeks; i++) {
    let status: 'COMPLETED' | 'CURRENT' | 'UPCOMING' = 'UPCOMING';
    if (i < metrics.currentWeek) {
      status = 'COMPLETED';
    } else if (i === metrics.currentWeek) {
      status = 'CURRENT';
    }

    const titleIndex = (i - 1) % weekTitles.length;
    steps.push({
      weekNumber: i,
      title: weekTitles[titleIndex],
      status,
    });
  }

  return steps;
};