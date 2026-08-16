import type {
  CareerResource,
  StudentCareerProfile,
  PreparationProgress,
  CategoryProgress,
  PreparationCategoryKey,
  RecommendedNextStep,
} from '../types/careerPrep';

export const calculatePreparationProgress = (resources: CareerResource[]): PreparationProgress => {
  const totalCount = resources.length;
  const completedCount = resources.filter((r) => r.completed).length;
  const overallPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Key tracking categories matching PreparationCategoryKey
  const categoryKeys: PreparationCategoryKey[] = [
    'Technical Skills',
    'DSA',
    'Database / SQL',
    'HR & Behavioral',
    'Project Interview',
    'Resume & Communication',
  ];

  const categories: CategoryProgress[] = categoryKeys.map((key) => {
    const matchedResources = resources.filter((r) => r.category === key);
    const total = matchedResources.length;
    const completed = matchedResources.filter((r) => r.completed).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      category: key,
      completedCount: completed,
      totalCount: total,
      percentage,
    };
  });

  return {
    overallPercentage,
    completedCount,
    totalCount,
    categories,
  };
};

export interface RecommendedResourceItem {
  resource: CareerResource;
  score: number;
  reason: string;
}

export const getRecommendedResources = (
  resources: CareerResource[],
  profile: StudentCareerProfile
): RecommendedResourceItem[] => {
  const scoredItems = resources.map((r) => {
    let score = 0;
    const reasons: string[] = [];

    // 1. Skill Match (+3)
    const matchesSkill = profile.skills.some(
      (s) => s.toLowerCase() === r.skill.toLowerCase() || r.tags.some((t) => t.toLowerCase() === s.toLowerCase())
    );
    if (matchesSkill) {
      score += 3;
      reasons.push(`Matches your ${r.skill} skill`);
    }

    // 2. Target Career Role Match (+3)
    const matchesRole = r.careerRoles.some(
      (role) => role.toLowerCase() === profile.targetCareerRole.toLowerCase()
    );
    if (matchesRole) {
      score += 3;
      reasons.push(`Targeted for ${profile.targetCareerRole}`);
    }

    // 3. Area of Interest / Topic Match (+2)
    if (profile.areaOfInterest && r.topic.toLowerCase().includes(profile.areaOfInterest.toLowerCase().split(' ')[0])) {
      score += 2;
      reasons.push(`Aligns with your interest in ${profile.areaOfInterest}`);
    }

    // 4. Featured Status (+1)
    if (r.isFeatured) {
      score += 1;
    }

    // 5. Uncompleted Preference (+1)
    if (!r.completed) {
      score += 1;
    }

    const primaryReason =
      reasons.length > 0
        ? reasons[0]
        : `Useful preparation for ${r.topic} interviews`;

    return {
      resource: r,
      score,
      reason: primaryReason,
    };
  });

  // Sort descending by score
  return scoredItems
    .filter((item) => item.score > 1)
    .sort((a, b) => b.score - a.score);
};

export const getWhatShouldIPrepareNext = (
  resources: CareerResource[],
  profile: StudentCareerProfile
): RecommendedNextStep[] => {
  const steps: RecommendedNextStep[] = [];

  // Category completion check
  const progress = calculatePreparationProgress(resources);
  const dsaCat = progress.categories.find((c) => c.category === 'DSA');
  const techCat = progress.categories.find((c) => c.category === 'Technical Skills');
  const sqlCat = progress.categories.find((c) => c.category === 'Database / SQL');
  const hrCat = progress.categories.find((c) => c.category === 'HR & Behavioral');
  const projCat = progress.categories.find((c) => c.category === 'Project Interview');

  if (dsaCat && dsaCat.percentage < 100) {
    steps.push({
      id: 'step_1',
      topic: 'Data Structures & Algorithms',
      priority: 'High',
      reason: `Your target role as ${profile.targetCareerRole} requires strong problem-solving skills in coding assessments.`,
      category: 'DSA',
    });
  }

  if (techCat && techCat.percentage < 100) {
    steps.push({
      id: 'step_2',
      topic: 'React.js & TypeScript Deep Dive',
      priority: 'High',
      reason: `Matches your current internship role (${profile.currentInternshipRole || 'Frontend React Intern'}) and career goal.`,
      category: 'Technical Skills',
    });
  }

  if (sqlCat && sqlCat.percentage < 100) {
    steps.push({
      id: 'step_3',
      topic: 'SQL Queries & Relational Join Operations',
      priority: 'Medium',
      reason: 'Frequently required across technical software engineering interviews.',
      category: 'Database / SQL',
    });
  }

  if (hrCat && hrCat.percentage < 100) {
    steps.push({
      id: 'step_4',
      topic: 'HR & Behavioral Questions (STAR Method)',
      priority: 'Medium',
      reason: 'Interview preparation is incomplete without practicing behavioral responses.',
      category: 'HR & Behavioral',
    });
  }

  if (projCat && projCat.percentage < 100) {
    steps.push({
      id: 'step_5',
      topic: 'Project Demonstration & Technical Articulation',
      priority: 'High',
      reason: 'Learn how to articulate architectural decisions made during your internship.',
      category: 'Project Interview',
    });
  }

  return steps;
};