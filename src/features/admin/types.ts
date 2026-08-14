export interface PlatformStats {
  totalStudents: number;
  totalFaculty: number;
  totalCompanies: number;
  totalInternships: number;
  totalApplications: number;
  certificatesIssued: number;
}

export interface InternshipOverview {
  active: number;
  pending: number;
  completed: number;
}

export interface DepartmentSummary {
  id: string;
  name: string;
  studentsCount: number;
  facultyCount: number;
  status: 'Active' | 'Inactive' | 'Pending';
}

export interface RecentActivity {
  id: string;
  type: 'Company Registration' | 'Internship Posted' | 'Application Submitted' | 'Certificate Issued';
  description: string;
  timestamp: string;
  status?: 'Success' | 'Pending' | 'Warning';
}

export interface AdminDashboardData {
  stats: PlatformStats;
  internshipOverview: InternshipOverview;
  departments: DepartmentSummary[];
  recentActivities: RecentActivity[];
}

import type { InternshipListing, ApplicationRecord } from '@/types';

export interface AdminInternshipListing extends InternshipListing {
  applicationCount: number;
}

export interface AdminOversightStats {
  totalInternships: number;
  activeInternships: number;
  pendingInternships: number;
  completedInternships: number;
  totalApplications: number;
  pendingApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
}

export interface AdminOversightData {
  stats: AdminOversightStats;
  internships: AdminInternshipListing[];
  applications: ApplicationRecord[];
}
