import { initialMockInternships, type Internship } from './mockInternships';

export type InternshipRecord = Internship;

export interface ActiveInternshipDetails {
  id: string;
  internshipId: string;
  internshipTitle: string;
  internshipType?: string;
  companyName: string;
  companyInitials?: string;
  location?: string;
  workMode: 'On-site' | 'Remote' | 'Hybrid';
  duration: string;
  stipend: string;
  startDate: string;
  endDate: string;
  currentPhase: string;
  progressPercentage: number;
  completedMilestones?: number;
  totalMilestones?: number;
  nextMilestone?: string;
  nextMilestoneDate?: string;
  mentorName?: string;
  mentorRole?: string;
  mentorEmail?: string;
  facultyMentor: string;
  industryMentor: string;
  journeyPhases?: { name: string; status: 'completed' | 'current' | 'upcoming' }[];
  phases: { name: string; status: 'completed' | 'current' | 'upcoming' }[];
}

export const mockActiveInternshipsList: ActiveInternshipDetails[] = [
  {
    id: 'active_int_01',
    internshipId: 'int_01',
    internshipTitle: 'Full Stack React Developer Intern',
    internshipType: 'Full-time',
    companyName: 'TechCorp Solutions',
    companyInitials: 'TC',
    location: 'Bangalore, India',
    workMode: 'Hybrid',
    duration: '6 Months',
    stipend: 'â‚¹25,000 / month',
    startDate: '2026-08-01',
    endDate: '2027-01-31',
    currentPhase: 'Sprint 3: Dynamic Layout & Component Refactoring',
    progressPercentage: 45,
    completedMilestones: 2,
    totalMilestones: 4,
    nextMilestone: 'Sprint 3 Code Delivery & Component Testing',
    nextMilestoneDate: 'Aug 25, 2026',
    mentorName: 'Sarah Jenkins',
    mentorRole: 'Senior Technical Lead & Host Mentor',
    mentorEmail: 'sarah.jenkins@techcorp.com',
    facultyMentor: 'Dr. Rajesh Sharma',
    industryMentor: 'Sarah Jenkins (Tech Lead)',
    journeyPhases: [
      { name: 'Sprint 1: Onboarding & Architecture setup', status: 'completed' },
      { name: 'Sprint 2: REST API Integration & Auth UI', status: 'completed' },
      { name: 'Sprint 3: Dynamic Layout & Component Refactoring', status: 'current' },
      { name: 'Sprint 4: End-to-End Testing & Performance Polish', status: 'upcoming' },
    ],
    phases: [
      { name: 'Sprint 1: Onboarding & Architecture setup', status: 'completed' },
      { name: 'Sprint 2: REST API Integration & Auth UI', status: 'completed' },
      { name: 'Sprint 3: Dynamic Layout & Component Refactoring', status: 'current' },
      { name: 'Sprint 4: End-to-End Testing & Performance Polish', status: 'upcoming' },
    ],
  },
  {
    id: 'active_int_02',
    internshipId: 'int_02',
    internshipTitle: 'AI / Machine Learning Engineering Intern',
    internshipType: 'Part-time',
    companyName: 'DataMind AI Research',
    companyInitials: 'DM',
    location: 'Remote',
    workMode: 'Remote',
    duration: '3 Months',
    stipend: 'â‚¹30,000 / month',
    startDate: '2026-08-10',
    endDate: '2026-11-10',
    currentPhase: 'Phase 1: Dataset Preprocessing & Feature Pipeline',
    progressPercentage: 15,
    completedMilestones: 1,
    totalMilestones: 3,
    nextMilestone: 'Baseline PyTorch Model Training',
    nextMilestoneDate: 'Sep 05, 2026',
    mentorName: 'David Chen',
    mentorRole: 'Lead AI Scientist',
    mentorEmail: 'david.chen@datamind.ai',
    facultyMentor: 'Dr. Rajesh Sharma',
    industryMentor: 'David Chen (Lead Scientist)',
    journeyPhases: [
      { name: 'Phase 1: Dataset Preprocessing', status: 'current' },
      { name: 'Phase 2: Model Architecture', status: 'upcoming' },
      { name: 'Phase 3: Deployment', status: 'upcoming' },
    ],
    phases: [
      { name: 'Phase 1: Dataset Preprocessing', status: 'current' },
      { name: 'Phase 2: Model Architecture', status: 'upcoming' },
      { name: 'Phase 3: Deployment', status: 'upcoming' },
    ],
  },
];

export const mockActiveInternshipData: ActiveInternshipDetails = mockActiveInternshipsList[0];
export type ActiveInternshipData = ActiveInternshipDetails;