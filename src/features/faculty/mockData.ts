export type ApplicationStatus = 'Pending' | 'Approved' | 'Rejected' | 'Needs Improvement' | 'Pending Guidance';
export type InternshipStatus = 'Active' | 'At Risk' | 'Completed' | 'Not Started';
export type WorkMode = 'On-site' | 'Remote' | 'Hybrid';
export type DailyAttendanceStatus = 'Present' | 'Absent';

export interface Milestone {
  title: string;
  completed: boolean;
  dueDate?: string;
}

export interface TimelineEvent {
  date: string;
  event: string;
}

export interface DailyAttendance {
  date: string;
  status: DailyAttendanceStatus;
}

export interface AttendanceRecord {
  present: number;
  absent: number;
  workingDays: number;
  recent: DailyAttendance[];
}

export interface CompanyEvaluation {
  technicalSkills: number;
  communication: number;
  professionalism: number;
  problemSolving: number;
  overallRating: number;
  writtenFeedback: string;
  submittedBy: string;
  submittedDate: string;
  cross_verified: boolean;
  cross_verified_by?: string;
  cross_verified_at?: string;
  cross_verification_note?: string;
}

export interface FacultyEvaluation {
  technicalSkills: number;
  communication: number;
  professionalism: number;
  problemSolving: number;
  overallRating: number;
  writtenFeedback: string;
  status: 'Pending' | 'Completed';
  lastEvaluated?: string;
}

export interface SharedStudentData {
  id: string;
  studentId: string;
  studentName: string;
  email: string;
  skills: string[];
  company: string;
  role: string;
  department: 'CSE' | 'IT' | 'AIML' | 'ECE';
  batchYear: string;
  workMode: WorkMode;
  
  // Application fields
  appliedDate: string;
  applicationStatus: ApplicationStatus;
  coverMessage: string;
  
  // Internship fields
  internshipStatus: InternshipStatus;
  startDate: string;
  endDate: string;
  internshipDuration: string;
  currentStage: string;
  progressPercentage: number;
  lastActivity: string;
  riskIndicator: string;
  milestones: Milestone[];
  timeline: TimelineEvent[];

  // Attendance
  attendance: AttendanceRecord;

  // Additional dashboard fields
  crossVerificationStatus?: 'Pending' | 'Approved' | 'Not Required';
  evaluationStatus?: 'Pending' | 'In Progress' | 'Completed' | 'Not Started';
  placementStatus?: 'Not Placed' | 'In Progress' | 'Placed';
  companyEvaluation?: CompanyEvaluation;
  facultyEvaluation?: FacultyEvaluation;
}

export const mockFacultyStudents: SharedStudentData[] = [
  {
    id: 'stu-sarah',
    studentId: 'ID-84920',
    studentName: 'Sarah Smith',
    email: 's.smith@university.edu',
    role: 'Data Science Intern',
    department: 'CSE',
    batchYear: '2024',
    company: 'DataCorp',
    workMode: 'On-site',
    skills: ['Python', 'Pandas', 'Machine Learning'],
    appliedDate: '2023-10-22',
    applicationStatus: 'Approved',
    coverMessage: 'My background in statistical modeling makes me a great fit for this internship.',
    internshipStatus: 'Active',
    startDate: '2023-11-01',
    endDate: '2024-02-28',
    internshipDuration: '16 weeks',
    currentStage: 'Environment Setup',
    progressPercentage: 15,
    lastActivity: '2 hours ago',
    riskIndicator: 'None',
    milestones: [
      { title: 'Internship Started', completed: true, dueDate: '2023-11-01' },
      { title: 'Environment Setup', completed: true, dueDate: '2023-11-05' },
      { title: 'Midpoint Review', completed: false, dueDate: '2023-12-15' },
      { title: 'Final Submission', completed: false, dueDate: '2024-02-15' },
      { title: 'Internship Completed', completed: false, dueDate: '2024-02-28' }
    ],
    timeline: [
      { date: '2023-10-22', event: 'Application Submitted' },
      { date: '2023-10-28', event: 'Application Approved' },
      { date: '2023-11-01', event: 'Internship Started' }
    ],
    attendance: {
      present: 46,
      absent: 4,
      workingDays: 50,
      recent: [
        { date: 'Aug 12', status: 'Present' },
        { date: 'Aug 13', status: 'Present' },
        { date: 'Aug 14', status: 'Absent' },
        { date: 'Aug 15', status: 'Present' },
      ]
    },
    crossVerificationStatus: 'Approved',
    evaluationStatus: 'Completed',
    placementStatus: 'Placed',
    companyEvaluation: {
      technicalSkills: 4.5,
      communication: 4.0,
      professionalism: 5.0,
      problemSolving: 4.5,
      overallRating: 4.5,
      writtenFeedback: 'Sarah has shown excellent progress in understanding our data pipelines.',
      submittedBy: 'John Doe',
      submittedDate: '2023-11-20',
      cross_verified: true,
      cross_verified_by: 'Faculty Mentor',
      cross_verified_at: '2023-11-22'
    },
    facultyEvaluation: {
      technicalSkills: 4.0,
      communication: 4.5,
      professionalism: 5.0,
      problemSolving: 4.0,
      overallRating: 4.4,
      writtenFeedback: 'Sarah has consistently met the internship requirements and actively participates in discussions.',
      status: 'Completed',
      lastEvaluated: '2023-11-25'
    }
  },
  {
    id: 'stu-rahul',
    studentId: 'ID-73819',
    studentName: 'Rahul Sharma',
    email: 'rahul.s@university.edu',
    skills: ['React', 'Node.js', 'MongoDB'],
    company: 'TechFlow',
    department: 'IT',
    batchYear: '2024',
    role: 'Frontend Developer Intern',
    workMode: 'Remote',
    appliedDate: '2023-08-15',
    applicationStatus: 'Needs Improvement',
    coverMessage: 'Excited to join the TechFlow frontend team.',
    internshipStatus: 'Not Started',
    startDate: '2023-09-01',
    endDate: '2023-12-15',
    internshipDuration: '14 weeks',
    currentStage: 'Pending Start',
    progressPercentage: 0,
    lastActivity: 'Never',
    riskIndicator: 'None',
    milestones: [
      { title: 'Internship Started', completed: false, dueDate: '2023-09-01' },
      { title: 'Initial Task Completed', completed: false, dueDate: '2023-09-15' },
    ],
    timeline: [
      { date: '2023-08-15', event: 'Application Submitted' }
    ],
    attendance: {
      present: 43,
      absent: 7,
      workingDays: 50,
      recent: [
        { date: 'Aug 12', status: 'Present' },
        { date: 'Aug 13', status: 'Absent' },
        { date: 'Aug 14', status: 'Present' },
        { date: 'Aug 15', status: 'Present' },
      ]
    },
    crossVerificationStatus: 'Pending',
    evaluationStatus: 'Pending',
    placementStatus: 'Not Placed',
    companyEvaluation: {
      technicalSkills: 3.5,
      communication: 3.0,
      professionalism: 4.0,
      problemSolving: 3.5,
      overallRating: 3.5,
      writtenFeedback: 'Rahul is learning quickly but needs to improve his React component structuring.',
      submittedBy: 'Jane Smith',
      submittedDate: '2023-09-10',
      cross_verified: false
    }
  },
  {
    id: 'stu-priya',
    studentId: 'ID-59201',
    studentName: 'Priya Shah',
    email: 'priya.shah@university.edu',
    skills: ['Python', 'Pandas', 'SQL'],
    company: 'DataCorp',
    department: 'AIML',
    batchYear: '2025',
    role: 'Data Analyst Intern',
    workMode: 'Hybrid',
    appliedDate: '2023-07-20',
    applicationStatus: 'Approved',
    coverMessage: 'Ready to contribute to DataCorp analytics.',
    internshipStatus: 'At Risk',
    startDate: '2023-08-15',
    endDate: '2023-11-30',
    internshipDuration: '15 weeks',
    currentStage: 'Data Cleaning',
    progressPercentage: 45,
    lastActivity: '4 days ago',
    riskIndicator: 'Missed weekly log',
    milestones: [
      { title: 'Internship Started', completed: true, dueDate: '2023-08-15' },
      { title: 'Data Cleaning Script', completed: true, dueDate: '2023-08-30' },
      { title: 'Midpoint Review', completed: false, dueDate: '2023-10-01' },
    ],
    timeline: [
      { date: '2023-07-20', event: 'Application Submitted' },
      { date: '2023-07-25', event: 'Application Approved' },
      { date: '2023-08-15', event: 'Internship Started' },
      { date: '2023-09-10', event: 'Missed weekly update' }
    ],
    attendance: {
      present: 33,
      absent: 17,
      workingDays: 50,
      recent: [
        { date: 'Aug 12', status: 'Absent' },
        { date: 'Aug 13', status: 'Absent' },
        { date: 'Aug 14', status: 'Present' },
        { date: 'Aug 15', status: 'Absent' },
      ]
    },
    crossVerificationStatus: 'Approved',
    evaluationStatus: 'In Progress',
    placementStatus: 'In Progress',
    facultyEvaluation: {
      technicalSkills: 0,
      communication: 0,
      professionalism: 0,
      problemSolving: 0,
      overallRating: 0,
      writtenFeedback: '',
      status: 'Pending'
    }
  },
  {
    id: 'stu-aman',
    studentId: 'ID-10293',
    studentName: 'Aman Patel',
    email: 'aman.p@university.edu',
    skills: ['Docker', 'AWS', 'Linux'],
    company: 'CloudScale',
    department: 'CSE',
    batchYear: '2024',
    role: 'DevOps Intern',
    workMode: 'On-site',
    appliedDate: '2023-05-10',
    applicationStatus: 'Approved',
    coverMessage: 'Passionate about infrastructure and automation.',
    internshipStatus: 'Completed',
    startDate: '2023-06-01',
    endDate: '2023-08-31',
    internshipDuration: '12 weeks',
    currentStage: 'Completed',
    progressPercentage: 100,
    lastActivity: '1 month ago',
    riskIndicator: 'None',
    milestones: [
      { title: 'Internship Started', completed: true, dueDate: '2023-06-01' },
      { title: 'Midpoint Review', completed: true, dueDate: '2023-07-15' },
      { title: 'Final Submission', completed: true, dueDate: '2023-08-15' },
      { title: 'Internship Completed', completed: true, dueDate: '2023-08-31' }
    ],
    timeline: [
      { date: '2023-05-10', event: 'Application Submitted' },
      { date: '2023-05-15', event: 'Application Approved' },
      { date: '2023-06-01', event: 'Internship Started' },
      { date: '2023-08-31', event: 'Internship Completed successfully' }
    ],
    attendance: {
      present: 48,
      absent: 2,
      workingDays: 50,
      recent: [
        { date: 'Aug 12', status: 'Present' },
        { date: 'Aug 13', status: 'Present' },
        { date: 'Aug 14', status: 'Present' },
        { date: 'Aug 15', status: 'Present' },
      ]
    },
    crossVerificationStatus: 'Not Required',
    evaluationStatus: 'Completed',
    placementStatus: 'Placed',
    companyEvaluation: {
      technicalSkills: 5.0,
      communication: 4.5,
      professionalism: 4.8,
      problemSolving: 5.0,
      overallRating: 4.8,
      writtenFeedback: 'Aman is a stellar intern, demonstrating advanced knowledge of CI/CD.',
      submittedBy: 'Alice Johnson',
      submittedDate: '2023-08-30',
      cross_verified: true,
      cross_verified_by: 'Faculty Mentor',
      cross_verified_at: '2023-09-02'
    },
    facultyEvaluation: {
      technicalSkills: 5.0,
      communication: 4.0,
      professionalism: 5.0,
      problemSolving: 4.5,
      overallRating: 4.6,
      writtenFeedback: 'Aman is a reliable student who demonstrates high technical competence.',
      status: 'Completed',
      lastEvaluated: '2023-09-05'
    }
  },
  {
    id: 'stu-sneha',
    studentId: 'ID-44920',
    studentName: 'Sneha Joshi',
    email: 'sneha.j@university.edu',
    skills: ['Figma', 'Prototyping', 'User Research'],
    company: 'CreativeSpace',
    department: 'ECE',
    batchYear: '2025',
    role: 'UX Design Intern',
    workMode: 'Remote',
    appliedDate: '2023-08-22',
    applicationStatus: 'Pending',
    coverMessage: 'I have a keen eye for user-centered design.',
    internshipStatus: 'Not Started',
    startDate: '2023-09-15',
    endDate: '2023-12-31',
    internshipDuration: '15 weeks',
    currentStage: 'Pending Start',
    progressPercentage: 0,
    lastActivity: 'Never',
    riskIndicator: 'None',
    milestones: [
      { title: 'Internship Started', completed: false, dueDate: '2023-09-15' },
    ],
    timeline: [
      { date: '2023-08-22', event: 'Application Submitted' }
    ],
    attendance: {
      present: 44,
      absent: 6,
      workingDays: 50,
      recent: [
        { date: 'Aug 12', status: 'Present' },
        { date: 'Aug 13', status: 'Present' },
        { date: 'Aug 14', status: 'Present' },
        { date: 'Aug 15', status: 'Absent' },
      ]
    },
    crossVerificationStatus: 'Pending',
    evaluationStatus: 'Pending',
    placementStatus: 'Not Placed',
    companyEvaluation: {
      technicalSkills: 4.0,
      communication: 4.5,
      professionalism: 4.0,
      problemSolving: 3.5,
      overallRating: 4.0,
      writtenFeedback: 'Sneha has great design instincts. Looking forward to her mockups.',
      submittedBy: 'Bob Builder',
      submittedDate: '2023-09-20',
      cross_verified: false
    }
  }
];

export interface CompanyProfileData {
  id: string;
  companyName: string;
  industry: string;
  description: string;
  logo: string;
  contactPerson: string;
  email: string;
  phone: string;
  website: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
}

export let mockCompanyProfile: CompanyProfileData | null = null;

export const setMockCompanyProfile = (profile: CompanyProfileData | null) => {
  mockCompanyProfile = profile;
};

export type InternshipListingStatus = 'draft' | 'published' | 'closed';

export interface InternshipMilestone {
  id: string;
  title: string;
  description: string;
}

export interface InternshipTaskPlan {
  id: string;
  title: string;
  description: string;
  milestoneId?: string; // Optional reference to an internship milestone
}

export interface InternshipData {
  id: string;
  companyId: string;
  mentorId?: string; // Newly added field for Industry Mentor
  title: string;
  domain: string;
  description: string;
  requiredSkills: string;
  duration: string;
  stipend?: string;
  eligibility: string;
  positions?: string;
  applicationDeadline?: string;
  status: InternshipListingStatus;
  applicationCount: number;
  taskPlan?: InternshipTaskPlan[];
  milestones?: InternshipMilestone[];
  createdAt: string;
}

export let mockCompanyInternships: InternshipData[] = [
  {
    id: 'int-1',
    companyId: 'company-1', // matches our mock usage
    mentorId: 'MNT-001',
    title: 'Data Science Intern',
    domain: 'Data Science & Analytics',
    description: 'Work with our analytics team on real-world data projects to build predictive models and analyze user behavior.',
    requiredSkills: 'Python, SQL, Power BI, Machine Learning',
    duration: '3 Months',
    stipend: '₹15,000 / month',
    eligibility: 'B.Tech CSE/IT pre-final or final year students',
    positions: '5',
    applicationDeadline: '2026-09-15',
    status: 'published',
    applicationCount: 24,
    taskPlan: [
      { id: 'TP-1', title: 'User Research', description: 'Conduct user research for the assigned product.', milestoneId: 'ms-1' },
      { id: 'TP-2', title: 'Competitor Analysis', description: 'Analyze competing products and document findings.', milestoneId: 'ms-1' },
      { id: 'TP-3', title: 'User Flow', description: 'Create comprehensive user flows.', milestoneId: 'ms-2' },
      { id: 'TP-4', title: 'Wireframe', description: 'Create low and high fidelity wireframes.', milestoneId: 'ms-2' },
      { id: 'TP-5', title: 'Prototype', description: 'Create an interactive prototype.', milestoneId: 'ms-2' },
      { id: 'TP-6', title: 'Final UI Design', description: 'Deliver final polished UI designs.' }
    ],
    milestones: [
      { id: 'ms-1', title: 'Research & Discovery', description: 'Initial user and market research phase.' },
      { id: 'ms-2', title: 'Design & Prototyping', description: 'Wireframing and building interactive prototypes.' }
    ],
    createdAt: '2026-08-01'
  },
  {
    id: 'int-2',
    companyId: 'company-1',
    mentorId: 'MNT-002',
    title: 'Frontend Developer Intern',
    domain: 'Web Development',
    description: 'Join our engineering team to build responsive and accessible user interfaces using modern web technologies.',
    requiredSkills: 'React, TypeScript, Tailwind CSS',
    duration: '6 Months',
    stipend: '₹20,000 / month',
    eligibility: 'B.Tech/BCA with strong portfolio',
    positions: '3',
    applicationDeadline: '2026-10-01',
    status: 'draft',
    applicationCount: 8,
    createdAt: '2026-08-10'
  },
  {
    id: 'int-3',
    companyId: 'company-1',
    title: 'UI/UX Design Intern',
    domain: 'Design',
    description: 'Assist in creating user-centric designs for web and mobile applications.',
    requiredSkills: 'Figma, User Research, Prototyping',
    duration: '4 Months',
    stipend: '₹12,000 / month',
    eligibility: 'Any degree with a strong design portfolio',
    positions: '2',
    applicationDeadline: '2026-08-30',
    status: 'closed',
    applicationCount: 45,
    createdAt: '2026-07-01'
  }
];

export const setMockCompanyInternships = (internships: InternshipData[]) => {
  mockCompanyInternships = internships;
};

export const MOCK_CURRENT_MENTOR_ID = 'MNT-001';

// ==========================================
// MENTORS (COMPANY)
// ==========================================
export interface CompanyMentorData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  department: string;
  designation: string;
  status: 'Active' | 'Inactive';
}

let mockCompanyMentorsData: CompanyMentorData[] = [
  {
    id: 'MNT-001',
    name: 'Neha Sharma',
    email: 'neha.sharma@company.com',
    phone: '+91 9876543210',
    department: 'Data Science',
    designation: 'Senior Data Scientist',
    status: 'Active'
  },
  {
    id: 'MNT-002',
    name: 'Amit Sharma',
    email: 'amit.sharma@company.com',
    phone: '+91 9876543211',
    department: 'Engineering',
    designation: 'Frontend Lead',
    status: 'Active'
  },
  {
    id: 'MNT-003',
    name: 'Rahul Mehta',
    email: 'rahul.mehta@company.com',
    phone: '+91 9876543212',
    department: 'Design',
    designation: 'UX Director',
    status: 'Active'
  }
];

export const mockCompanyMentors = mockCompanyMentorsData;
export const setMockCompanyMentors = (mentors: CompanyMentorData[]) => {
  mockCompanyMentorsData = mentors;
  mockCompanyMentorsData.length = 0;
  mockCompanyMentorsData.push(...mentors);
};


export type CompanyApplicationStatus = 'Under Review' | 'Shortlisted' | 'Selected' | 'Rejected';

export interface CompanyApplicationData {
  id: string;
  studentId: string;
  companyId: string;
  internshipId: string;
  appliedDate: string;
  facultyApprovalStatus: 'approved' | 'pending' | 'rejected';
  applicationStatus: CompanyApplicationStatus;
  allocatorMatchScore?: number;
  allocatorScoreBreakdown?: {
    skillsMatch: number;
    academicPerformance: number;
    relevantExperience: number;
  };
  matchedSkills?: string[];
  missingSkills?: string[];
  allocatorExplanation?: string;
}

export let mockCompanyApplications: CompanyApplicationData[] = [
  {
    id: 'app-1',
    studentId: 'stu-sarah', // Sarah Smith
    companyId: 'company-1',
    internshipId: 'int-1', // Data Science Intern
    appliedDate: '2026-08-10',
    facultyApprovalStatus: 'approved',
    applicationStatus: 'Under Review',
    allocatorMatchScore: 92,
    allocatorScoreBreakdown: {
      skillsMatch: 95,
      academicPerformance: 88,
      relevantExperience: 92
    },
    matchedSkills: ['Python', 'Machine Learning', 'Pandas'],
    missingSkills: ['Power BI'],
    allocatorExplanation: 'Strong skills match. Relevant project experience in statistical modeling. Good academic performance.'
  },
  {
    id: 'app-2',
    studentId: 'stu-priya', // Priya Shah
    companyId: 'company-1',
    internshipId: 'int-1', // Data Science Intern
    appliedDate: '2026-08-11',
    facultyApprovalStatus: 'approved',
    applicationStatus: 'Under Review',
    allocatorMatchScore: 87,
    allocatorScoreBreakdown: {
      skillsMatch: 85,
      academicPerformance: 90,
      relevantExperience: 85
    },
    matchedSkills: ['Python', 'Pandas', 'SQL'],
    missingSkills: ['Machine Learning'],
    allocatorExplanation: 'Good foundational data skills. Needs training on advanced Machine Learning models.'
  },
  {
    id: 'app-3',
    studentId: 'stu-rahul', // Rahul Sharma
    companyId: 'company-1',
    internshipId: 'int-2', // Frontend Developer Intern
    appliedDate: '2026-08-12',
    facultyApprovalStatus: 'approved',
    applicationStatus: 'Under Review',
    allocatorMatchScore: 81,
    allocatorScoreBreakdown: {
      skillsMatch: 80,
      academicPerformance: 82,
      relevantExperience: 80
    },
    matchedSkills: ['React', 'Node.js'],
    missingSkills: ['TypeScript', 'Tailwind CSS'],
    allocatorExplanation: 'Good React knowledge, but lacks explicit TypeScript and Tailwind CSS experience.'
  },
  {
    id: 'app-4',
    studentId: 'stu-aman', // Aman Patel
    companyId: 'company-1',
    internshipId: 'int-2', // Frontend Developer Intern
    appliedDate: '2026-08-14',
    facultyApprovalStatus: 'pending', // Should not show up initially!
    applicationStatus: 'Under Review'
  },
  {
    id: 'app-5',
    studentId: 'stu-rahul', // Rahul Sharma (re-using student for selected example)
    companyId: 'company-1',
    internshipId: 'int-1', // Data Science Intern
    appliedDate: '2026-07-01',
    facultyApprovalStatus: 'approved',
    applicationStatus: 'Selected',
    allocatorMatchScore: 94,
    matchedSkills: ['Python', 'SQL', 'Power BI'],
    allocatorExplanation: 'Excellent match, already selected and started.'
  },
  {
    id: 'app-6',
    studentId: 'stu-priya', // Priya Shah (re-using student)
    companyId: 'company-1',
    internshipId: 'int-1', // Moved to int-1 for mentor testing
    appliedDate: '2026-06-15',
    facultyApprovalStatus: 'approved',
    applicationStatus: 'Selected',
    allocatorMatchScore: 88,
    matchedSkills: ['React', 'CSS'],
    allocatorExplanation: 'Strong candidate, currently active.'
  },
  {
    id: 'app-7',
    studentId: 'stu-aman', // Aman Patel (re-using student)
    companyId: 'company-1',
    internshipId: 'int-1', // Moved to int-1 for mentor testing
    appliedDate: '2026-05-10',
    facultyApprovalStatus: 'approved',
    applicationStatus: 'Selected',
    allocatorMatchScore: 96,
    matchedSkills: ['Figma', 'Prototyping'],
    allocatorExplanation: 'Top match, successfully completed internship.'
  }
];

export const setMockCompanyApplications = (applications: CompanyApplicationData[]) => {
  mockCompanyApplications = applications;
};

// ==========================================
// TASKS & PROOF (COMPANY)
// ==========================================
export type TaskStatus = 'Not Started' | 'In Progress' | 'Submitted for Review' | 'Changes Requested' | 'Approved' | 'Overdue';
export type ProofStatus = 'Not Submitted' | 'Pending Review' | 'Approved' | 'Changes Requested';
export type TaskPriority = 'Low' | 'Medium' | 'High';

export interface ProofData {
  type: string; 
  url: string;
  notes?: string;
}

export interface VerificationHistoryItem {
  date: string;
  event: string;
}

export interface StudentTaskExecution {
  id: string;
  internId: string; 
  internshipId: string;
  taskPlanId: string; // References the InternshipTaskPlan definition
  dueDate: string;
  priority: TaskPriority;
  taskStatus: TaskStatus;
  proofStatus: ProofStatus;
  lastUpdated: string;
  studentWorkSummary?: string;
  proofs: ProofData[];
  feedback?: string;
  history: VerificationHistoryItem[];
  milestoneId?: string;
}

let mockCompanyTasksData: StudentTaskExecution[] = [
  {
    id: 'exec-1',
    internId: 'stu-rahul',
    internshipId: 'int-1',
    taskPlanId: 'TP-1',
    dueDate: '2026-08-25',
    priority: 'High',
    taskStatus: 'Approved',
    proofStatus: 'Approved',
    lastUpdated: '2026-08-25',
    studentWorkSummary: 'Implemented the data pipeline using Pandas and SQLAlchemy. Handled null values by dropping rows for critical columns and filling with means for others.',
    proofs: [
      { type: 'GitHub Repository', url: 'https://github.com/placeholder/data-pipeline', notes: 'Main ingestion script' }
    ],
    history: [
      { date: '2026-08-15', event: 'Task assigned by Industry Mentor' },
      { date: '2026-08-22', event: 'Proof submitted by Rahul Sharma' },
      { date: '2026-08-25', event: 'Task Approved' }
    ],
    milestoneId: 'ms-1'
  },
  {
    id: 'exec-2',
    internId: 'stu-rahul',
    internshipId: 'int-1',
    taskPlanId: 'TP-2',
    dueDate: '2026-08-30',
    priority: 'Medium',
    taskStatus: 'Approved',
    proofStatus: 'Approved',
    lastUpdated: '2026-08-12',
    studentWorkSummary: 'Analyzed 5 competitor products focusing on onboarding flows.',
    proofs: [
      { type: 'Document', url: 'https://docs.google.com/document/placeholder', notes: 'Analysis Report' }
    ],
    history: [
      { date: '2026-08-01', event: 'Task assigned by Industry Mentor' },
      { date: '2026-08-09', event: 'Proof submitted by Rahul Sharma' },
      { date: '2026-08-12', event: 'Task approved by Industry Mentor' }
    ]
  },
  {
    id: 'exec-3',
    internId: 'stu-priya',
    internshipId: 'int-1',
    taskPlanId: 'TP-1',
    dueDate: '2026-09-05',
    priority: 'High',
    taskStatus: 'Changes Requested',
    proofStatus: 'Changes Requested',
    lastUpdated: '2026-08-23',
    studentWorkSummary: 'Completed login UI with React Hook Form.',
    proofs: [
      { type: 'Live Demo', url: 'https://vercel.placeholder.com', notes: 'Vercel preview link' },
      { type: 'Screenshots', url: 'https://placeholder.com/img.png', notes: 'Mobile view' }
    ],
    feedback: 'Please fix the mobile layout on small screens (iPhone SE). The button is overflowing.',
    history: [
      { date: '2026-08-15', event: 'Task assigned' },
      { date: '2026-08-19', event: 'Proof submitted by Priya Shah' },
      { date: '2026-08-20', event: 'Changes requested: Need clearer navigation structure.' }
    ]
  },
  {
    id: 'exec-4',
    internId: 'stu-aman',
    internshipId: 'int-1',
    taskPlanId: 'TP-1',
    dueDate: '2026-09-10',
    priority: 'Low',
    taskStatus: 'In Progress',
    proofStatus: 'Not Submitted',
    lastUpdated: '2026-08-24',
    proofs: [],
    history: [
      { date: '2026-08-24', event: 'Task assigned' }
    ]
  }
];

export const mockCompanyTasks = mockCompanyTasksData;
export const setMockCompanyTasks = (data: StudentTaskExecution[]) => {
  mockCompanyTasksData = data;
  mockCompanyTasksData.length = 0;
  mockCompanyTasksData.push(...data);
};

// ==========================================
// MILESTONES (COMPANY)
// ==========================================
export type MilestoneStatus = 'Not Started' | 'In Progress' | 'Completed' | 'At Risk' | 'Overdue';

export interface CompanyMilestoneData {
  id: string;
  internshipId: string;
  internId: string;
  title: string;
  description: string;
  startDate: string;
  dueDate: string;
  completedDate?: string;
  status: MilestoneStatus;
  progressPercentage: number;
}

let mockCompanyMilestonesData: CompanyMilestoneData[] = [
  {
    id: 'ms-1',
    internshipId: 'int-1',
    internId: 'stu-rahul',
    title: 'Project Setup & Data Ingestion',
    description: 'Establish the project repository, set up the database, and build the initial data ingestion pipelines for the ML model.',
    startDate: '2026-08-01',
    dueDate: '2026-08-30',
    status: 'Completed',
    progressPercentage: 100
  },
  {
    id: 'ms-2',
    internshipId: 'int-1',
    internId: 'stu-rahul',
    title: 'Model Training & Validation',
    description: 'Develop the core machine learning models, perform feature engineering, and validate model accuracy against the test dataset.',
    startDate: '2026-09-01',
    dueDate: '2026-09-30',
    status: 'Completed',
    progressPercentage: 100
  },
  {
    id: 'ms-3',
    internshipId: 'int-2',
    internId: 'stu-priya',
    title: 'Frontend Component Library',
    description: 'Design and implement the reusable React component library, including form elements, navigation, and user profile components.',
    startDate: '2026-08-05',
    dueDate: '2026-08-25',
    status: 'At Risk',
    progressPercentage: 40
  },
  {
    id: 'ms-4',
    internshipId: 'int-2',
    internId: 'stu-priya',
    title: 'Initial Onboarding',
    description: 'Complete HR onboarding, workspace setup, and initial codebase walkthrough.',
    startDate: '2026-08-01',
    dueDate: '2026-08-05',
    completedDate: '2026-08-04',
    status: 'Completed',
    progressPercentage: 100
  }
];

export const mockCompanyMilestones = mockCompanyMilestonesData;
export const setMockCompanyMilestones = (data: CompanyMilestoneData[]) => {
  mockCompanyMilestonesData = data;
  mockCompanyMilestonesData.length = 0;
  mockCompanyMilestonesData.push(...data);
};

// ==========================================
// EVALUATIONS (COMPANY)
// ==========================================
export type EvaluationStatus = 'Draft' | 'Submitted' | 'Pending Faculty Verification' | 'Verified' | 'Correction Required';
export type EvaluationType = 'Mid-Term Evaluation' | 'Final Evaluation';

export interface CompanyEvaluationData {
  id: string;
  internId: string;
  internshipId: string;
  companyId: string;
  industryMentorId: string;
  facultyMentorId: string;
  evaluationType: EvaluationType;
  evaluationPeriod: string;
  status: EvaluationStatus;
  submittedAt?: string;
  updatedAt: string;
  
  technicalSkills: number;
  qualityOfWork: number;
  problemSolving: number;
  communication: number;
  teamwork: number;
  professionalism: number;
  timeManagement: number;
  initiative: number;
  
  overallRating: number;
  
  strengths: string;
  areasForImprovement: string;
  comments: string;
  recommendation: string;
  
  crossVerified: boolean;
  crossVerifiedBy?: string;
  crossVerifiedAt?: string;
  discrepancyNote?: string;
}

let mockCompanyEvaluationsData: CompanyEvaluationData[] = [
  {
    id: 'eval-1',
    internId: 'stu-rahul',
    internshipId: 'int-1',
    companyId: 'company-1',
    industryMentorId: 'mentor-1',
    facultyMentorId: 'fac-1',
    evaluationType: 'Mid-Term Evaluation',
    evaluationPeriod: 'Aug 2026',
    status: 'Pending Faculty Verification',
    submittedAt: '2026-08-25',
    updatedAt: '2026-08-25',
    
    technicalSkills: 4,
    qualityOfWork: 5,
    problemSolving: 4,
    communication: 4,
    teamwork: 5,
    professionalism: 5,
    timeManagement: 4,
    initiative: 4,
    
    overallRating: 4.4,
    
    strengths: 'Strong technical understanding and consistently delivers assigned work. Excellent teamwork.',
    areasForImprovement: 'Should improve documentation for the data pipeline.',
    comments: 'Rahul is performing very well. We are pleased with his progress.',
    recommendation: 'Recommend',
    
    crossVerified: false
  },
  {
    id: 'eval-2',
    internId: 'stu-priya',
    internshipId: 'int-2',
    companyId: 'company-1',
    industryMentorId: 'mentor-1',
    facultyMentorId: 'fac-2',
    evaluationType: 'Mid-Term Evaluation',
    evaluationPeriod: 'Aug 2026',
    status: 'Correction Required',
    submittedAt: '2026-08-20',
    updatedAt: '2026-08-22',
    
    technicalSkills: 3,
    qualityOfWork: 3,
    problemSolving: 3,
    communication: 4,
    teamwork: 4,
    professionalism: 4,
    timeManagement: 3,
    initiative: 3,
    
    overallRating: 3.4,
    
    strengths: 'Good communication and teamwork.',
    areasForImprovement: 'Needs more focus on technical implementation speed.',
    comments: 'Priya is adapting to the team well but needs to pick up the pace on frontend tasks.',
    recommendation: 'Recommend with Improvement',
    
    crossVerified: false,
    discrepancyNote: 'Please review the Technical Skills rating. Based on her recent PRs, a 3 seems unusually low without detailed justification.'
  },
  {
    id: 'eval-3',
    internId: 'stu-sarah',
    internshipId: 'int-3',
    companyId: 'company-2',
    industryMentorId: 'mentor-2',
    facultyMentorId: 'fac-3',
    evaluationType: 'Final Evaluation',
    evaluationPeriod: 'Aug 2026',
    status: 'Verified',
    submittedAt: '2026-08-10',
    updatedAt: '2026-08-12',
    
    technicalSkills: 5,
    qualityOfWork: 5,
    problemSolving: 5,
    communication: 5,
    teamwork: 5,
    professionalism: 5,
    timeManagement: 5,
    initiative: 5,
    
    overallRating: 5.0,
    
    strengths: 'Exceptional intern. Ready for a full-time role.',
    areasForImprovement: 'None.',
    comments: 'Sarah delivered the entire product feature ahead of schedule.',
    recommendation: 'Strongly Recommend',
    
    crossVerified: true,
    crossVerifiedBy: 'Dr. Alan Turing',
    crossVerifiedAt: '2026-08-12'
  },
  {
    id: 'eval-4',
    internId: 'stu-rahul',
    internshipId: 'int-1',
    companyId: 'company-1',
    industryMentorId: 'mentor-1',
    facultyMentorId: 'fac-1',
    evaluationType: 'Final Evaluation',
    evaluationPeriod: 'Sep 2026',
    status: 'Verified',
    submittedAt: '2026-09-01',
    updatedAt: '2026-09-02',
    
    technicalSkills: 4,
    qualityOfWork: 5,
    problemSolving: 5,
    communication: 4,
    teamwork: 5,
    professionalism: 5,
    timeManagement: 4,
    initiative: 4,
    
    overallRating: 4.5,
    
    strengths: 'Consistently delivers assigned work. Met all milestones.',
    areasForImprovement: 'Needs more focus on documentation.',
    comments: 'Rahul performed excellently over the internship duration.',
    recommendation: 'Recommend',
    
    crossVerified: true,
    crossVerifiedBy: 'Dr. Mehta',
    crossVerifiedAt: '2026-09-02'
  }
];

export const mockCompanyEvaluations = mockCompanyEvaluationsData;
export const setMockCompanyEvaluations = (data: CompanyEvaluationData[]) => {
  mockCompanyEvaluationsData = data;
  mockCompanyEvaluationsData.length = 0;
  mockCompanyEvaluationsData.push(...data);
};

// ==========================================
// PPO / CONVERSION (COMPANY)
// ==========================================
export type ConversionStatus = 'Not Evaluated' | 'Eligible' | 'Draft' | 'Offered' | 'Accepted' | 'Declined' | 'Under Consideration' | 'Not Converted' | 'Not Eligible';

export interface CompanyPPOData {
  id: string;
  internId: string;
  internshipId: string;
  companyId: string;
  evaluationId?: string;
  facultyMentorId?: string;
  
  status: ConversionStatus;
  
  // Offer Details
  jobRole?: string;
  department?: string;
  employmentType?: string;
  ctc?: string;
  joiningDate?: string;
  location?: string;
  offerValidUntil?: string;
  remarks?: string;
  
  // Under Consideration Note
  internalNote?: string;
  
  // Student Response
  studentResponse?: 'Pending' | 'Accepted' | 'Declined';
  offerDate?: string;
}

let mockCompanyPPOData: CompanyPPOData[] = [
  {
    id: 'ppo-1',
    internId: 'stu-sarah',
    internshipId: 'int-3',
    companyId: 'company-2',
    evaluationId: 'eval-3', // Sarah's Verified Final Evaluation
    facultyMentorId: 'fac-3',
    
    status: 'Offered',
    
    jobRole: 'Junior Frontend Developer',
    department: 'Engineering',
    employmentType: 'Full-time',
    ctc: '₹8,50,000 LPA',
    joiningDate: '2027-07-01',
    location: 'Bangalore, India',
    offerValidUntil: '2027-01-15',
    remarks: 'Outstanding performance during the internship. We would love to have you onboard.',
    
    studentResponse: 'Pending',
    offerDate: '2026-08-15'
  }
];

export const mockCompanyPPOs = mockCompanyPPOData;
export const setMockCompanyPPOs = (data: CompanyPPOData[]) => {
  mockCompanyPPOData = data;
  mockCompanyPPOData.length = 0;
  mockCompanyPPOData.push(...data);
};

// ==========================================
// CERTIFICATES (COMPANY)
// ==========================================
export type CertificateStatus = 'Eligible' | 'Generated' | 'Issued';

export interface CompanyCertificateData {
  id: string;
  internId: string;
  internshipId: string;
  companyId: string;
  applicationId?: string;
  
  status: CertificateStatus;
  certificateId?: string;
  issueDate?: string;
}

let mockCompanyCertificatesData: CompanyCertificateData[] = [
  {
    id: 'cert-1',
    internId: 'stu-sarah',
    internshipId: 'int-3',
    companyId: 'company-2',
    status: 'Issued',
    certificateId: 'INT-CERT-2026-001',
    issueDate: '2026-08-14'
  }
];

export const mockCompanyCertificates = mockCompanyCertificatesData;
export const setMockCompanyCertificates = (data: CompanyCertificateData[]) => {
  mockCompanyCertificatesData = data;
  mockCompanyCertificatesData.length = 0;
  mockCompanyCertificatesData.push(...data);
};

// ==========================================
// NOTIFICATIONS (COMPANY)
// ==========================================
export type NotificationPriority = 'normal' | 'important' | 'urgent';
export type NotificationCategory = 'applications' | 'interns' | 'tasks' | 'milestones' | 'evaluations' | 'ppo' | 'certificates' | 'general';

export interface CompanyNotificationData {
  id: string;
  type: string;
  category: NotificationCategory;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  priority: NotificationPriority;
  relatedId?: string;
  relatedType?: string;
}

let mockCompanyNotificationsData: CompanyNotificationData[] = [
  {
    id: 'notif-1',
    type: 'new_application',
    category: 'applications',
    title: 'New application received',
    message: 'Sarah Smith applied for the Data Science Intern position.',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
    read: false,
    priority: 'normal',
    relatedId: 'app-1',
    relatedType: 'application'
  },
  {
    id: 'notif-2',
    type: 'task_submitted',
    category: 'tasks',
    title: 'Task submitted for review',
    message: 'Rahul Sharma submitted "Build Data Pipeline" for review.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    read: false,
    priority: 'important',
    relatedId: 'task-1',
    relatedType: 'task'
  },
  {
    id: 'notif-3',
    type: 'milestone_completed',
    category: 'milestones',
    title: 'Milestone completed',
    message: 'Priya Shah completed "Onboarding & Environment Setup".',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    read: true,
    priority: 'normal',
    relatedId: 'ms-3',
    relatedType: 'milestone'
  },
  {
    id: 'notif-4',
    type: 'evaluation_pending',
    category: 'evaluations',
    title: 'Final evaluation pending',
    message: 'Rahul Sharma requires a final evaluation for internship completion.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    read: false,
    priority: 'urgent',
    relatedId: 'eval-4',
    relatedType: 'evaluation'
  },
  {
    id: 'notif-5',
    type: 'certificate_issued',
    category: 'certificates',
    title: 'Certificate issued',
    message: 'Internship Completion Certificate issued to Sarah Smith.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3 days ago
    read: true,
    priority: 'normal',
    relatedId: 'cert-1',
    relatedType: 'certificate'
  }
];

export const mockCompanyNotifications = mockCompanyNotificationsData;
export const setMockCompanyNotifications = (data: CompanyNotificationData[]) => {
  mockCompanyNotificationsData = data;
  mockCompanyNotificationsData.length = 0;
  mockCompanyNotificationsData.push(...data);
};

export type GuidanceStatus = 'Awaiting Faculty Reply' | 'Awaiting Student Reply' | 'In Progress' | 'Resolved';

export interface GuidanceMessage {
  id: string;
  senderRole: 'Student' | 'Faculty';
  senderId: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface GuidanceConversation {
  id: string;
  studentId: string;
  internshipId: string;
  status: GuidanceStatus;
  messages: GuidanceMessage[];
}

let mockGuidanceConversationsData: GuidanceConversation[] = [
  {
    id: 'guidance-1',
    studentId: 'stu-rahul',
    internshipId: 'int-2',
    status: 'Awaiting Faculty Reply',
    messages: [
      {
        id: 'msg-1',
        senderRole: 'Student',
        senderId: 'stu-rahul',
        message: 'Ma\'am, my application was marked as Needs Improvement. What should I focus on?',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        read: false
      }
    ]
  }
];

export const mockGuidanceConversations = mockGuidanceConversationsData;
export const setMockGuidanceConversations = (data: GuidanceConversation[]) => {
  mockGuidanceConversationsData = data;
  mockGuidanceConversationsData.length = 0;
  mockGuidanceConversationsData.push(...data);
};
