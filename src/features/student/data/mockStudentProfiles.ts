import type { StudentInternshipStatus } from '../types/studentJourneyTypes';
import { mockActiveInternshipsList, type ActiveInternshipDetails } from '@/features/internships/data/mockActiveInternship';

export interface StudentLifecycleProfile {
  id: string;
  name: string;
  email: string;
  status: StudentInternshipStatus;
  activeInternships: ActiveInternshipDetails[];
  hasApplied: boolean;
}

export const mockStudentProfiles: StudentLifecycleProfile[] = [
  {
    id: 'student_01',
    name: 'Alex Johnson (Non-Intern)',
    email: 'alex.johnson@student.edu',
    status: 'NOT_INTERN',
    activeInternships: [],
    hasApplied: false,
  },
  {
    id: 'student_02',
    name: 'Blake Smith (Application Pending)',
    email: 'blake.smith@student.edu',
    status: 'APPLICATION_PENDING',
    activeInternships: [],
    hasApplied: true,
  },
  {
    id: 'student_03',
    name: 'Chris Lee (Selected - Pre-Start)',
    email: 'chris.lee@student.edu',
    status: 'SELECTED',
    activeInternships: [
      {
        ...mockActiveInternshipsList[0],
        startDate: '2026-09-01', // Starts next month
        endDate: '2027-02-28',
      },
    ],
    hasApplied: true,
  },
  {
    id: 'student_04',
    name: 'Diana Prince (Active Multi-Intern)',
    email: 'diana.prince@student.edu',
    status: 'ACTIVE',
    activeInternships: mockActiveInternshipsList, // Hybrid + Remote
    hasApplied: true,
  },
  {
    id: 'student_05',
    name: 'Evan Wright (Completed Intern)',
    email: 'evan.wright@student.edu',
    status: 'COMPLETED',
    activeInternships: [
      {
        ...mockActiveInternshipsList[0],
        startDate: '2026-01-01',
        endDate: '2026-07-31',
        progressPercentage: 100,
        currentPhase: 'Program Completed & Evaluated',
      },
    ],
    hasApplied: true,
  },
];