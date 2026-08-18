export interface CareerAnalysisInput {
  student: {
    name: string;
    education: string;
    targetCareer?: string;
  };
  skills: {
    technical: string[];
    tools: string[];
    languages: string[];
  };
  internship: {
    role: string;
    company: string;
    workMode: string;
    duration: string;
  };
  performance: {
    attendancePercentage: number;
    taskCompletionPercentage: number;
    milestoneCompletionPercentage: number;
    mentorEvaluationScore: number;
    totalHoursLogged: number;
  };
  milestones: {
    completedCount: number;
    totalCount: number;
    currentMilestoneTitle?: string;
  };
  evaluations: {
    technicalSkillsScore: number;
    problemSolvingScore: number;
    communicationScore: number;
    professionalismScore: number;
    mentorFeedback: string;
    strengths: string[];
    improvementAreas: string[];
  };
}

export interface SkillGapItem {
  skill: string;
  importance: 'High' | 'Medium' | 'Low';
  reason: string;
}

export interface CareerRecommendationItem {
  career: string;
  fit: 'High Fit' | 'Moderate Fit' | 'Potential Match';
  reason: string;
}

export interface LearningRecommendationItem {
  topic: string;
  priority: 'High' | 'Medium' | 'Low';
  reason: string;
}

export interface AICareerAnalysisResult {
  summary: string;
  strengths: string[];
  improvementAreas: string[];
  skillGaps: SkillGapItem[];
  careerRecommendations: CareerRecommendationItem[];
  learningRecommendations: LearningRecommendationItem[];
  nextSteps: string[];
  timestamp?: string;
  isDemo?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}