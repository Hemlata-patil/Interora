export type UserRole = 'student' | 'faculty' | 'company' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string;
  department?: string;
  organization?: string;
}

export type ApplicationStatus = 'applied' | 'under_review' | 'faculty_approved' | 'rejected' | 'selected';

export type InternshipStatus = 'upcoming' | 'active' | 'completed' | 'cancelled';

export interface InternshipListing {
  id: string;
  title: string;
  companyName: string;
  location: string;
  stipend: string;
  duration: string;
  requiredSkills: string[];
  status: 'open' | 'closed';
  createdAt: string;
}

export interface ApplicationRecord {
  id: string;
  internshipTitle: string;
  companyName: string;
  appliedDate: string;
  status: ApplicationStatus;
}
