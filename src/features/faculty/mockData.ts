export type ApplicationStatus = 'Pending' | 'Approved' | 'Rejected';
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
    applicationStatus: 'Pending',
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
