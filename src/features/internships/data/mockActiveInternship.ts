import { mockInternships, type InternshipRecord } from './mockInternships';

export interface ActiveInternshipDetails {
  internshipId: string;
  internshipTitle: string;
  companyName: string;
  location: string;
  workMode: 'Remote' | 'Hybrid' | 'On-site';
  internshipType: 'Full-time' | 'Part-time';
  startDate: string;
  endDate: string;
  duration: string;
  status: 'Active' | 'Upcoming' | 'Completed' | 'Suspended';
  mentorName: string;
  mentorRole: string;
  mentorEmail: string;
  progressPercentage: number;
  currentPhase: string;
  totalMilestones: number;
  completedMilestones: number;
  nextMilestone: string;
  nextMilestoneDate: string;
  journeyPhases: {
    title: string;
    description: string;
    status: 'completed' | 'current' | 'upcoming';
  }[];
}

const baseInternship: InternshipRecord = mockInternships[0]; // Frontend React Development Intern at TechCorp Solutions

export const mockActiveInternshipData: ActiveInternshipDetails = {
  internshipId: baseInternship.id,
  internshipTitle: baseInternship.title,
  companyName: baseInternship.companyName,
  location: baseInternship.location,
  workMode: baseInternship.workMode,
  internshipType: baseInternship.internshipType,
  startDate: '2026-06-01',
  endDate: '2026-08-31',
  duration: baseInternship.duration,
  status: 'Active',
  mentorName: 'Sarah Jenkins',
  mentorRole: 'Senior Frontend Engineering Lead',
  mentorEmail: 'sarah.jenkins@techcorp.io',
  progressPercentage: 65,
  currentPhase: 'Phase 3: Component Integration & State Refactoring',
  totalMilestones: 4,
  completedMilestones: 2,
  nextMilestone: 'Submit Project Prototype & Integration Tests',
  nextMilestoneDate: '2026-08-20',
  journeyPhases: [
    {
      title: 'Orientation & Environment Setup',
      description: 'Onboarding, repo access, workspace setup, and mentor introduction.',
      status: 'completed',
    },
    {
      title: 'Foundational Tasks & Bug Fixes',
      description: 'Initial codebase familiarization, fixing layout issues, component refactoring.',
      status: 'completed',
    },
    {
      title: 'Core Project Development',
      description: 'Building modern React components, TypeScript interfaces, and API integrations.',
      status: 'current',
    },
    {
      title: 'Evaluation & Mid-Term Review',
      description: 'Faculty mentor review and industry performance evaluation.',
      status: 'upcoming',
    },
    {
      title: 'Final Report & Graduation',
      description: 'Final work log submission, project demonstration, and certificate issuance.',
      status: 'upcoming',
    },
  ],
};