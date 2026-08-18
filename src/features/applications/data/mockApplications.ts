export type ApplicationStatus =
  | 'Pending Faculty Review'
  | 'Faculty Approved'
  | 'Company Review'
  | 'Selected'
  | 'Rejected'
  | 'Withdrawn';

export interface ApplicationTimelineEvent {
  title: string;
  date: string;
  description: string;
  status: 'completed' | 'current' | 'upcoming';
}

export interface ApplicationRecord {
  id: string;
  internshipId: string;
  title: string;
  companyName: string;
  location: string;
  workMode: string;
  duration: string;
  stipend: string;
  appliedAt: string;
  lastUpdated: string;
  status: ApplicationStatus;
  applicantName: string;
  applicantEmail: string;
  resumeFileName: string;
  coverLetter: string;
  submittedSkills: string[];
  timeline: ApplicationTimelineEvent[];
}

export const mockApplications: ApplicationRecord[] = [
  {
    id: 'app_101',
    internshipId: 'int_01',
    title: 'Frontend React Development Intern',
    companyName: 'TechCorp Solutions',
    location: 'Bangalore / Remote',
    workMode: 'Remote',
    duration: '3 Months',
    stipend: 'â‚¹15,000 / month',
    appliedAt: '2026-08-05',
    lastUpdated: '2026-08-12',
    status: 'Selected',
    applicantName: 'Alex Johnson',
    applicantEmail: 'alex.johnson@student.edu',
    resumeFileName: 'Alex_Johnson_Resume_2026.pdf',
    coverLetter: 'I am excited to apply for the Frontend React Development position at TechCorp. With 2+ years of hands-on React and TypeScript project experience, I am confident in my ability to contribute to your core web dashboard architecture.',
    submittedSkills: ['React.js', 'TypeScript', 'Tailwind CSS', 'REST API'],
    timeline: [
      { title: 'Application Submitted', date: '2026-08-05', description: 'Application received and queued for department verification.', status: 'completed' },
      { title: 'Faculty Review', date: '2026-08-07', description: 'Faculty mentor Prof. Dr. Sharma verified academic standing.', status: 'completed' },
      { title: 'Faculty Approval', date: '2026-08-08', description: 'Application approved for industry mentor selection.', status: 'completed' },
      { title: 'Company Review', date: '2026-08-10', description: 'TechCorp engineering team evaluated technical proof and profile.', status: 'completed' },
      { title: 'Selected', date: '2026-08-12', description: 'Candidate selected for Active Internship onboarding.', status: 'completed' },
    ],
  },
  {
    id: 'app_102',
    internshipId: 'int_02',
    title: 'Full Stack Web Engineering Intern',
    companyName: 'InnovateX Labs',
    location: 'Pune, Maharashtra',
    workMode: 'Hybrid',
    duration: '6 Months',
    stipend: 'â‚¹18,000 / month',
    appliedAt: '2026-08-08',
    lastUpdated: '2026-08-11',
    status: 'Faculty Approved',
    applicantName: 'Alex Johnson',
    applicantEmail: 'alex.johnson@student.edu',
    resumeFileName: 'Alex_Johnson_Resume_2026.pdf',
    coverLetter: 'Applying for Full Stack Web Engineering. Experienced with React frontends, Node.js API endpoints, and PostgreSQL database queries.',
    submittedSkills: ['React.js', 'Node.js', 'PostgreSQL', 'Express.js'],
    timeline: [
      { title: 'Application Submitted', date: '2026-08-08', description: 'Application logged in Interora ecosystem.', status: 'completed' },
      { title: 'Faculty Review', date: '2026-08-10', description: 'Department head approved institutional credit compliance.', status: 'completed' },
      { title: 'Faculty Approval', date: '2026-08-11', description: 'Forwarded to InnovateX hiring team.', status: 'completed' },
      { title: 'Company Review', date: 'Pending', description: 'Awaiting mentor candidate shortlisting.', status: 'current' },
      { title: 'Final Selection', date: 'TBD', description: 'Final confirmation by host company.', status: 'upcoming' },
    ],
  },
  {
    id: 'app_103',
    internshipId: 'int_03',
    title: 'UI/UX & Design Systems Intern',
    companyName: 'CloudScale Systems',
    location: 'Hyderabad, Telangana',
    workMode: 'Hybrid',
    duration: '3 Months',
    stipend: 'â‚¹12,000 / month',
    appliedAt: '2026-08-10',
    lastUpdated: '2026-08-10',
    status: 'Pending Faculty Review',
    applicantName: 'Alex Johnson',
    applicantEmail: 'alex.johnson@student.edu',
    resumeFileName: 'Alex_Johnson_Resume_2026.pdf',
    coverLetter: 'Passionate about bridging Figma design tokens into clean frontend React components with Tailwind CSS.',
    submittedSkills: ['Figma', 'UI/UX Design', 'Tailwind CSS', 'HTML/CSS'],
    timeline: [
      { title: 'Application Submitted', date: '2026-08-10', description: 'Application submitted successfully.', status: 'completed' },
      { title: 'Faculty Review', date: 'In Progress', description: 'Assigned faculty mentor reviewing course prerequisites.', status: 'current' },
      { title: 'Faculty Approval', date: 'TBD', description: 'Department sign-off.', status: 'upcoming' },
      { title: 'Company Review', date: 'TBD', description: 'Industry mentor evaluation.', status: 'upcoming' },
      { title: 'Final Selection', date: 'TBD', description: 'Candidate selection decision.', status: 'upcoming' },
    ],
  },
  {
    id: 'app_104',
    internshipId: 'int_04',
    title: 'Backend Node.js & Cloud Intern',
    companyName: 'DataFlow Inc',
    location: 'Remote',
    workMode: 'Remote',
    duration: '4 Months',
    stipend: 'â‚¹16,000 / month',
    appliedAt: '2026-07-28',
    lastUpdated: '2026-08-04',
    status: 'Rejected',
    applicantName: 'Alex Johnson',
    applicantEmail: 'alex.johnson@student.edu',
    resumeFileName: 'Alex_Johnson_Resume_2026.pdf',
    coverLetter: 'Seeking backend engineering role focused on Node.js microservices and Docker containerization.',
    submittedSkills: ['Node.js', 'Express.js', 'MongoDB', 'REST API'],
    timeline: [
      { title: 'Application Submitted', date: '2026-07-28', description: 'Application submitted.', status: 'completed' },
      { title: 'Faculty Review', date: '2026-07-30', description: 'Faculty approved application.', status: 'completed' },
      { title: 'Company Review', date: '2026-08-02', description: 'Company shortlisted profiles for final review.', status: 'completed' },
      { title: 'Decision', date: '2026-08-04', description: 'Position filled by another applicant.', status: 'completed' },
    ],
  },
  {
    id: 'app_105',
    internshipId: 'int_06',
    title: 'AI & Data Analytics Intern',
    companyName: 'Cognitive Insights',
    location: 'Bangalore, Karnataka',
    workMode: 'Hybrid',
    duration: '3 Months',
    stipend: 'â‚¹17,000 / month',
    appliedAt: '2026-08-02',
    lastUpdated: '2026-08-09',
    status: 'Company Review',
    applicantName: 'Alex Johnson',
    applicantEmail: 'alex.johnson@student.edu',
    resumeFileName: 'Alex_Johnson_Resume_2026.pdf',
    coverLetter: 'Interested in rule-based data analytics and automated insight pipeline development.',
    submittedSkills: ['Python', 'Data Analytics', 'Pandas', 'SQL'],
    timeline: [
      { title: 'Application Submitted', date: '2026-08-02', description: 'Application logged.', status: 'completed' },
      { title: 'Faculty Review', date: '2026-08-05', description: 'Approved by faculty advisor.', status: 'completed' },
      { title: 'Faculty Approval', date: '2026-08-06', description: 'Forwarded to host company.', status: 'completed' },
      { title: 'Company Review', date: '2026-08-09', description: 'Cognitive Insights technical team reviewing background.', status: 'current' },
      { title: 'Final Selection', date: 'TBD', description: 'Awaiting interview confirmation.', status: 'upcoming' },
    ],
  },
];