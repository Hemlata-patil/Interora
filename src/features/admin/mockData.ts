import type { AdminDashboardData } from './types';

const mockData: AdminDashboardData = {
  stats: {
    totalStudents: 12450,
    totalFaculty: 420,
    totalCompanies: 156,
    totalInternships: 342,
    totalApplications: 1589,
    certificatesIssued: 4850,
  },
  internshipOverview: {
    active: 184,
    pending: 45,
    completed: 113,
  },
  departments: [
    {
      id: 'd1',
      name: 'Computer Science & Engineering',
      studentsCount: 3200,
      facultyCount: 85,
      status: 'Active',
    },
    {
      id: 'd2',
      name: 'Mechanical Engineering',
      studentsCount: 1800,
      facultyCount: 60,
      status: 'Active',
    },
    {
      id: 'd3',
      name: 'Information Technology',
      studentsCount: 2400,
      facultyCount: 75,
      status: 'Active',
    },
    {
      id: 'd4',
      name: 'Civil Engineering',
      studentsCount: 1200,
      facultyCount: 45,
      status: 'Pending',
    },
  ],
  recentActivities: [
    {
      id: 'a1',
      type: 'Company Registration',
      description: 'TechFlow Systems completed verification.',
      timestamp: '2 hours ago',
      status: 'Success',
    },
    {
      id: 'a2',
      type: 'Internship Posted',
      description: 'Google added "Software Engineering Intern".',
      timestamp: '5 hours ago',
      status: 'Success',
    },
    {
      id: 'a3',
      type: 'Application Submitted',
      description: 'Rahul Sharma applied for Data Science Intern.',
      timestamp: '1 day ago',
      status: 'Pending',
    },
    {
      id: 'a4',
      type: 'Certificate Issued',
      description: 'Batch 2024 - Web Development track.',
      timestamp: '2 days ago',
      status: 'Success',
    },
  ],
};

export const fetchAdminDashboardData = async (shouldFail = false, isEmpty = false): Promise<AdminDashboardData | null> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) {
        reject(new Error('Failed to fetch admin data'));
      } else if (isEmpty) {
        resolve(null);
      } else {
        resolve(mockData);
      }
    }, 800); // simulate network delay
  });
};

export const mockUsers: import('@/types').UserProfile[] = [
  {
    id: 'u1',
    email: 'john.doe@student.edu',
    fullName: 'John Doe',
    role: 'student',
    department: 'Computer Science',
  },
  {
    id: 'u2',
    email: 'jane.smith@student.edu',
    fullName: 'Jane Smith',
    role: 'student',
    department: 'Mechanical Engineering',
  },
  {
    id: 'u3',
    email: 'dr.brown@university.edu',
    fullName: 'Dr. Robert Brown',
    role: 'faculty',
    department: 'Information Technology',
  },
  {
    id: 'u4',
    email: 'hr@techflow.com',
    fullName: 'TechFlow HR',
    role: 'company',
    organization: 'TechFlow Systems',
  },
  {
    id: 'u5',
    email: 'admin@interora.edu',
    fullName: 'System Administrator',
    role: 'admin',
  },
];

export const fetchAdminUsers = async (shouldFail = false, isEmpty = false): Promise<import('@/types').UserProfile[]> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) {
        reject(new Error('Failed to fetch users'));
      } else if (isEmpty) {
        resolve([]);
      } else {
        resolve(mockUsers);
      }
    }, 800);
  });
};

export const fetchAdminOversight = async (shouldFail = false, isEmpty = false): Promise<import('./types').AdminOversightData | null> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) {
        reject(new Error('Failed to fetch oversight data'));
      } else if (isEmpty) {
        resolve(null);
      } else {
        resolve({
          stats: {
            totalInternships: 48,
            activeInternships: 32,
            pendingInternships: 10,
            completedInternships: 6,
            totalApplications: 450,
            pendingApplications: 120,
            approvedApplications: 250,
            rejectedApplications: 80,
          },
          internships: [
            {
              id: 'int-1',
              title: 'Software Engineering Intern',
              companyName: 'TechFlow Systems',
              location: 'Remote',
              stipend: '$3000/mo',
              duration: '3 Months',
              requiredSkills: ['React', 'TypeScript'],
              status: 'open',
              createdAt: '2026-08-01',
              applicationCount: 45,
            },
            {
              id: 'int-2',
              title: 'Data Science Intern',
              companyName: 'Analytics Corp',
              location: 'New York, NY',
              stipend: '$4000/mo',
              duration: '6 Months',
              requiredSkills: ['Python', 'SQL'],
              status: 'closed',
              createdAt: '2026-07-15',
              applicationCount: 120,
            }
          ],
          applications: [
            {
              id: 'app-1',
              internshipTitle: 'Software Engineering Intern',
              companyName: 'TechFlow Systems',
              appliedDate: '2026-08-10',
              status: 'under_review',
            },
            {
              id: 'app-2',
              internshipTitle: 'Data Science Intern',
              companyName: 'Analytics Corp',
              appliedDate: '2026-08-05',
              status: 'faculty_approved',
            }
          ]
        });
      }
    }, 800);
  });
};

export const fetchAdminOrganizations = async (shouldFail = false, isEmpty = false): Promise<import('./types').AdminOrganizationsData | null> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) {
        reject(new Error('Failed to fetch organizations data'));
      } else if (isEmpty) {
        resolve(null);
      } else {
        resolve({
          stats: {
            totalCompanies: 156,
            activeCompanies: 142,
            pendingVerifications: 12,
            totalDepartments: 8,
            activeDepartments: 8,
          },
          companies: [
            {
              id: 'comp-1',
              name: 'TechFlow Systems',
              industry: 'Software Development',
              verified: true,
              activeInternshipsCount: 5,
              totalInternsHired: 12,
              status: 'Active',
            },
            {
              id: 'comp-2',
              name: 'Analytics Corp',
              industry: 'Data Science',
              verified: true,
              activeInternshipsCount: 2,
              totalInternsHired: 8,
              status: 'Active',
            },
            {
              id: 'comp-3',
              name: 'Future FinTech',
              industry: 'Financial Services',
              verified: false,
              activeInternshipsCount: 0,
              totalInternsHired: 0,
              status: 'Pending',
            }
          ],
          departments: [
            {
              id: 'd1',
              name: 'Computer Science & Engineering',
              headOfDepartment: 'Dr. Alan Turing',
              totalStudents: 3200,
              totalFaculty: 85,
              status: 'Active',
            },
            {
              id: 'd2',
              name: 'Electrical Engineering',
              headOfDepartment: 'Dr. Nikola Tesla',
              totalStudents: 1500,
              totalFaculty: 45,
              status: 'Active',
            },
            {
              id: 'd3',
              name: 'Mechanical Engineering',
              headOfDepartment: 'Dr. James Watt',
              totalStudents: 2100,
              totalFaculty: 60,
              status: 'Active',
            }
          ]
        });
      }
    }, 800);
  });
};

export const fetchAdminCertificates = async (shouldFail = false, isEmpty = false): Promise<import('./types').AdminCertificateData | null> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) {
        reject(new Error('Failed to fetch certificates data'));
      } else if (isEmpty) {
        resolve(null);
      } else {
        resolve({
          stats: {
            totalIssued: 4850,
            validCertificates: 4845,
            revokedCertificates: 5,
          },
          certificates: [
            {
              id: 'CERT-2026-0810-14A',
              studentName: 'Alice Johnson',
              internshipTitle: 'Software Engineering Intern',
              companyName: 'TechFlow Systems',
              issueDate: '2026-08-10',
              status: 'Valid',
            },
            {
              id: 'CERT-2026-0805-92B',
              studentName: 'Bob Smith',
              internshipTitle: 'Data Science Intern',
              companyName: 'Analytics Corp',
              issueDate: '2026-08-05',
              status: 'Valid',
            },
            {
              id: 'CERT-2026-0720-33C',
              studentName: 'Charlie Davis',
              internshipTitle: 'Frontend Developer Intern',
              companyName: 'Future FinTech',
              issueDate: '2026-07-20',
              status: 'Revoked',
            }
          ]
        });
      }
    }, 800);
  });
};

export const fetchAdminAnalytics = async (shouldFail = false, isEmpty = false): Promise<import('./types').AdminAnalyticsData | null> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) {
        reject(new Error('Failed to fetch analytics data'));
      } else if (isEmpty) {
        resolve(null);
      } else {
        resolve({
          systemHealth: {
            activeUsers: 12450,
            storageUsedGB: 850.5,
            computeLoadPercent: 62,
          },
          aiMetrics: {
            recommendationsGenerated: 8540,
            profileAnalyses: 3210,
            apiCreditsUsed: 42500,
            apiCreditsTotal: 100000,
          },
          platformGrowth: {
            studentGrowthPercent: 12.5,
            facultyGrowthPercent: 4.2,
            companyGrowthPercent: 8.7,
          },
          recentAiActivity: [
            {
              id: 'ai-act-1',
              action: 'Skill Gap Analysis',
              targetUser: 'Alice Johnson',
              timestamp: '2 mins ago',
              status: 'Success'
            },
            {
              id: 'ai-act-2',
              action: 'Resume Parsing',
              targetUser: 'Bob Smith',
              timestamp: '15 mins ago',
              status: 'Processing'
            },
            {
              id: 'ai-act-3',
              action: 'Internship Matching',
              targetUser: 'Charlie Davis',
              timestamp: '1 hour ago',
              status: 'Success'
            }
          ]
        });
      }
    }, 800);
  });
};
