export interface StudentSkill {
  id: string;
  name: string;
  category: 'technical' | 'soft' | 'domain';
  level: 'beginner' | 'intermediate' | 'advanced';
}

export interface StudentProfileData {
  fullName: string;
  email: string;
  phone: string;
  institution: string;
  degree: string;
  department: string;
  yearSemester: string;
  cgpa: string;
  skills: StudentSkill[];
  resumeFileName: string;
  resumeHeadline: string;
  interests: string[];
  preferredRoles: string[];
  preferredLocations: string[];
  availability: string;
}

export interface ActiveInternshipData {
  id: string;
  title: string;
  companyName: string;
  mentorName: string;
  mentorEmail: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'upcoming' | 'completed' | 'none';
  progressPercentage: number;
  currentMilestone: string;
  completedTasks: number;
  totalTasks: number;
  attendancePercentage: number;
  healthScore: number;
}

export interface ApplicationSummaryData {
  total: number;
  underReview: number;
  facultyApproved: number;
  selected: number;
  rejected: number;
  recentApplications: {
    id: string;
    title: string;
    company: string;
    appliedDate: string;
    status: 'applied' | 'under_review' | 'faculty_approved' | 'selected' | 'rejected';
  }[];
}

export interface UpcomingActionItem {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  type: 'task' | 'profile' | 'log' | 'application';
  linkPath: string;
}

export const initialStudentProfileData: StudentProfileData = {
  fullName: 'Alex Johnson',
  email: 'alex.johnson@student.edu',
  phone: '+91 98765 43210',
  institution: 'G.H. Raisoni College of Engineering',
  degree: 'Bachelor of Technology (B.Tech)',
  department: 'Computer Science & Engineering',
  yearSemester: '3rd Year / 6th Semester',
  cgpa: '8.75 / 10.0',
  skills: [
    { id: 's1', name: 'React.js', category: 'technical', level: 'advanced' },
    { id: 's2', name: 'TypeScript', category: 'technical', level: 'intermediate' },
    { id: 's3', name: 'Tailwind CSS', category: 'technical', level: 'advanced' },
    { id: 's4', name: 'Node.js & Express', category: 'technical', level: 'intermediate' },
    { id: 's5', name: 'PostgreSQL & Supabase', category: 'technical', level: 'beginner' },
    { id: 's6', name: 'Agile & Teamwork', category: 'soft', level: 'advanced' },
  ],
  resumeFileName: 'Alex_Johnson_Resume_2026.pdf',
  resumeHeadline: 'Aspiring Full Stack Engineer passionate about React, TypeScript, and Scalable Web Applications.',
  interests: ['Full Stack Development', 'Frontend Architecture', 'Cloud Solutions'],
  preferredRoles: ['Software Engineering Intern', 'Frontend Developer Intern', 'Web Developer Intern'],
  preferredLocations: ['Remote', 'Pune', 'Bangalore', 'Hybrid'],
  availability: 'Immediate (Summer Internship 2026)',
};

export const initialActiveInternshipData: ActiveInternshipData = {
  id: 'int_2026_01',
  title: 'Frontend Web Development Intern',
  companyName: 'TechCorp Solutions',
  mentorName: 'Sarah Jenkins (Senior Frontend Lead)',
  mentorEmail: 'sarah.j@techcorp.io',
  startDate: '2026-06-01',
  endDate: '2026-08-31',
  status: 'active',
  progressPercentage: 65,
  currentMilestone: 'Phase 3: Component Integration & State Refactoring',
  completedTasks: 12,
  totalTasks: 16,
  attendancePercentage: 94,
  healthScore: 92,
};

export const initialApplicationSummaryData: ApplicationSummaryData = {
  total: 4,
  underReview: 1,
  facultyApproved: 1,
  selected: 1,
  rejected: 1,
  recentApplications: [
    {
      id: 'app_01',
      title: 'Frontend Web Development Intern',
      company: 'TechCorp Solutions',
      appliedDate: '2026-05-15',
      status: 'selected',
    },
    {
      id: 'app_02',
      title: 'Full Stack React Engineer Intern',
      company: 'InnovateX Labs',
      appliedDate: '2026-05-18',
      status: 'faculty_approved',
    },
    {
      id: 'app_03',
      title: 'UI/UX & Frontend Associate Intern',
      company: 'CloudScale Systems',
      appliedDate: '2026-05-20',
      status: 'under_review',
    },
    {
      id: 'app_04',
      title: 'Backend Node.js Intern',
      company: 'DataFlow Inc',
      appliedDate: '2026-05-10',
      status: 'rejected',
    },
  ],
};

export const initialUpcomingActionsData: UpcomingActionItem[] = [
  {
    id: 'act_01',
    title: 'Submit Daily Work Log',
    description: 'Log progress for component integration sprint',
    dueDate: 'Today, 6:00 PM',
    type: 'log',
    linkPath: '/student/attendance',
  },
  {
    id: 'act_02',
    title: 'Complete Profile Details',
    description: 'Add GitHub profile and project links to reach 100% completion',
    dueDate: 'In 2 days',
    type: 'profile',
    linkPath: '/student/profile',
  },
  {
    id: 'act_03',
    title: 'Review Application Status',
    description: 'Check faculty review status for InnovateX Labs application',
    dueDate: 'Tomorrow, 5:00 PM',
    type: 'application',
    linkPath: '/student/applications',
  },
];