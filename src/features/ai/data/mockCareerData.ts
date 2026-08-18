import type { AICareerAnalysisResult } from '../types/aiCareer';

export const fallbackMockCareerAnalysis: AICareerAnalysisResult = {
  summary:
    'Alex demonstrates strong technical capabilities in frontend React development and TypeScript state management. Performance metrics show consistent attendance (92%) and high problem-solving scores (9.0/10). To transition effectively into a Senior Full-Stack Software Engineer role, focus on expanding backend API integration and automated testing practices.',
  strengths: [
    'Strong React.js component architecture & UI design system implementation',
    'High problem-solving capabilities verified by mentor evaluation (9.0/10)',
    'Disciplined daily task tracking and work log updates (41 hrs logged)',
  ],
  improvementAreas: [
    'Backend API development (Node.js/Express & database integrations)',
    'Automated integration and unit testing coverage (Jest / React Testing Library)',
    'Technical inline code documentation and API contract design',
  ],
  skillGaps: [
    {
      skill: 'Node.js & Express.js',
      importance: 'High',
      reason: 'Essential for building end-to-end full-stack applications beyond frontend UI.',
    },
    {
      skill: 'PostgreSQL / Supabase ORM',
      importance: 'High',
      reason: 'Required for database schema management, relational data queries, and persistent storage.',
    },
    {
      skill: 'Jest / Testing Library',
      importance: 'Medium',
      reason: 'Increases code reliability and prevents UI component regressions.',
    },
  ],
  careerRecommendations: [
    {
      career: 'Frontend Engineer',
      fit: 'High Fit',
      reason: 'Strong foundation in React, TypeScript, and Tailwind CSS matching current industry roles.',
    },
    {
      career: 'Full Stack Software Developer',
      fit: 'High Fit',
      reason: 'Natural growth trajectory with target learning in Node.js and SQL persistence layers.',
    },
    {
      career: 'UI/UX Systems Developer',
      fit: 'Moderate Fit',
      reason: 'Excellent design system consistency and component modularity demonstrated in current tasks.',
    },
  ],
  learningRecommendations: [
    {
      topic: 'REST API & Node.js Backend Fundamentals',
      priority: 'High',
      reason: 'Bridge the gap between frontend state management and backend database services.',
    },
    {
      topic: 'Database Design & SQL / Supabase Integration',
      priority: 'High',
      reason: 'Learn data modeling, indexing, and persistent authentication hooks.',
    },
    {
      topic: 'Automated Frontend Testing & CI/CD Pipelines',
      priority: 'Medium',
      reason: 'Improve code quality and maintainability in production repositories.',
    },
  ],
  nextSteps: [
    'Complete current Phase 3 milestone: Core Component Integration & State Refactoring.',
    'Build a full-stack REST API side project using Node.js and PostgreSQL/Supabase.',
    'Incorporate automated unit test specs into existing React component libraries.',
    'Schedule a follow-up review with host mentor Sarah Jenkins to refine backend roadmap.',
  ],
  isDemo: true,
};