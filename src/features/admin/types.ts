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
