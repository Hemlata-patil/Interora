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

export interface CompanyOversightRecord {
  id: string;
  name: string;
  industry: string;
  verified: boolean;
  activeInternshipsCount: number;
  totalInternsHired: number;
  status: 'Active' | 'Pending' | 'Suspended';
}

export interface DepartmentOversightRecord {
  id: string;
  name: string;
  headOfDepartment: string;
  totalStudents: number;
  totalFaculty: number;
  status: 'Active' | 'Inactive';
}

export interface AdminOrganizationsStats {
  totalCompanies: number;
  activeCompanies: number;
  pendingVerifications: number;
  totalDepartments: number;
  activeDepartments: number;
}

export interface AdminOrganizationsData {
  stats: AdminOrganizationsStats;
  companies: CompanyOversightRecord[];
  departments: DepartmentOversightRecord[];
}

export interface AdminCertificateRecord {
  id: string;
  studentName: string;
  internshipTitle: string;
  companyName: string;
  issueDate: string;
  status: 'Valid' | 'Revoked';
}

export interface AdminCertificateStats {
  totalIssued: number;
  validCertificates: number;
  revokedCertificates: number;
}

export interface AdminCertificateData {
  stats: AdminCertificateStats;
  certificates: AdminCertificateRecord[];
}
