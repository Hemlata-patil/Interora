export type DeadlineStatus = 'UPCOMING' | 'OPEN' | 'CLOSING_SOON' | 'EXPIRED' | 'APPLIED';
export type WorkMode = 'Remote' | 'Hybrid' | 'On-site';

export interface InternshipDeadlineRecord {
  id: string;
  companyName: string;
  companyLogo?: string;
  companyInitials: string;
  role: string;
  description: string;
  skills: string[];
  location: string;
  workMode: WorkMode;
  stipend: string;
  duration: string;
  registrationStart: string; // ISO string
  registrationDeadline: string; // ISO string
  isApplied: boolean;
  applicationStatus?: 'Submitted' | 'Under Review' | 'Selected' | 'Rejected';
  isFeatured?: boolean;
  applicationUrl?: string;
  eligibility: string[];
  experienceLevel: string;
}

export interface InternshipDeadlineSummary {
  totalOpen: number;
  closingSoon: number;
  appliedCount: number;
  expiredCount: number;
}

export interface InternshipDeadlineService {
  getInternshipDeadlines(): Promise<InternshipDeadlineRecord[]>;
  getSummaryMetrics(): Promise<InternshipDeadlineSummary>;
  applyForInternship(id: string): Promise<boolean>;
}