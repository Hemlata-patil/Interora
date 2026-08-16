export type ResourceType = 'VIDEO' | 'DOCUMENT' | 'ARTICLE';
export type ResourceDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';
export type PreparationCategoryKey =
  | 'Technical Skills'
  | 'DSA'
  | 'Database / SQL'
  | 'HR & Behavioral'
  | 'Project Interview'
  | 'Resume & Communication';

export interface CareerResource {
  id: string;
  title: string;
  description: string;
  type: ResourceType;
  url: string;
  thumbnail?: string;
  topic: string;
  skill: string;
  category: PreparationCategoryKey;
  careerRoles: string[];
  difficulty: ResourceDifficulty;
  duration?: string;
  provider: string;
  tags: string[];
  isFeatured?: boolean;
  isRecommended?: boolean;
  completed?: boolean;
  isSaved?: boolean;
  progressPercent?: number; // For partial progress tracking
}

export interface StudentCareerProfile {
  name: string;
  areaOfInterest: string;
  skills: string[];
  targetCareerRole: string;
  currentInternshipRole?: string;
}

export interface CategoryProgress {
  category: PreparationCategoryKey;
  completedCount: number;
  totalCount: number;
  percentage: number;
}

export interface PreparationProgress {
  overallPercentage: number;
  completedCount: number;
  totalCount: number;
  categories: CategoryProgress[];
}

export interface RecommendedNextStep {
  id: string;
  topic: string;
  priority: 'High' | 'Medium' | 'Low';
  reason: string;
  category: PreparationCategoryKey;
}

export interface InterviewQuestion {
  id: string;
  category: PreparationCategoryKey;
  question: string;
  targetRole: string;
  difficulty: ResourceDifficulty;
  sampleKeyPoints: string[];
}

export interface RoadmapStep {
  week: number;
  title: string;
  category: PreparationCategoryKey;
  status: 'completed' | 'current' | 'upcoming';
  description: string;
}