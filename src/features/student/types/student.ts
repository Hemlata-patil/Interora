import type { StudentInternshipStatus } from './studentJourneyTypes';
import type { ActiveInternshipDetails } from '@/features/internships/data/mockActiveInternship';

export interface StudentEducation {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  graduationYear: string;
  cgpa?: string;
}

export interface StudentProfileDomain {
  id: string;
  fullName: string;
  email: string;
  mobile?: string;
  profilePhotoUrl?: string;
  profileCompletionPercentage: number;
  education: StudentEducation;
  skills: string[];
  careerGoals: string[];
  resumeUrl?: string;
  resumeFileName?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  lifecycleStatus: StudentInternshipStatus;
  facultyMentorId?: string;
  facultyMentorName?: string;
  activeInternships: ActiveInternshipDetails[];
  createdAt: string;
  updatedAt: string;
}