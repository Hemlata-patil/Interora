export type StudentInternshipStatus =
  | 'NOT_INTERN'
  | 'APPLICATION_PENDING'
  | 'SELECTED'
  | 'ACTIVE'
  | 'COMPLETED';

export type InternshipMode = 'OFFLINE' | 'ONLINE' | 'HYBRID';

export interface StudentInternshipRecord {
  id: string;
  title: string;
  companyName: string;
  companyLogo?: string;
  companyInitials: string;
  mode: InternshipMode;
  venueAddress?: string;
  startDate: string; // ISO date
  endDate: string; // ISO date
  facultyMentorName: string;
  facultyMentorEmail: string;
  industryMentorName?: string;
  industryMentorEmail?: string;
  industryMentorRole?: string;
  status: StudentInternshipStatus;
}

export interface StudentProfileState {
  studentId: string;
  studentName: string;
  studentEmail: string;
  currentStatus: StudentInternshipStatus;
  activeInternshipId?: string;
  internships: StudentInternshipRecord[];
}