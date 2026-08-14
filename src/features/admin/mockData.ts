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
