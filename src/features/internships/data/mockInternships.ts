export interface InternshipRecord {
  id: string;
  title: string;
  companyName: string;
  companyLogo?: string;
  location: string;
  workMode: 'Remote' | 'Hybrid' | 'On-site';
  internshipType: 'Full-time' | 'Part-time';
  duration: string;
  stipend: string;
  skills: string[];
  description: string;
  responsibilities: string[];
  requirements: string[];
  learningOutcomes: string[];
  postedDate: string;
  deadline: string;
  status: 'Open' | 'Closed';
}

export const mockInternships: InternshipRecord[] = [
  {
    id: 'int_01',
    title: 'Frontend React Development Intern',
    companyName: 'TechCorp Solutions',
    location: 'Bangalore / Remote',
    workMode: 'Remote',
    internshipType: 'Full-time',
    duration: '3 Months',
    stipend: 'â‚¹15,000 / month',
    skills: ['React.js', 'TypeScript', 'Tailwind CSS', 'REST API'],
    description: 'Join our core Web Architecture team to build scalable, high-performance web applications using React, TypeScript, and modern frontend design practices.',
    responsibilities: [
      'Implement responsive UI components following modern SaaS design guidelines.',
      'Refactor state management structures and optimize render performance.',
      'Collaborate with UI designers and backend engineers to integrate APIs.',
      'Participate in daily agile standups and code reviews.',
    ],
    requirements: [
      'Strong proficiency in JavaScript (ES6+), React.js, and HTML5/CSS3.',
      'Familiarity with TypeScript and modern component patterns.',
      'Basic understanding of Git, pull requests, and code versioning.',
      'Currently pursuing B.Tech / B.E. in Computer Science or related fields.',
    ],
    learningOutcomes: [
      'Hands-on experience with production-grade React & TypeScript codebases.',
      'Best practices in component modularity, design system tokenization, and web accessibility.',
      'Exposure to Agile sprint planning and professional code review workflows.',
    ],
    postedDate: '2026-08-01',
    deadline: '2026-08-25',
    status: 'Open',
  },
  {
    id: 'int_02',
    title: 'Full Stack Web Engineering Intern',
    companyName: 'InnovateX Labs',
    location: 'Pune, Maharashtra',
    workMode: 'Hybrid',
    internshipType: 'Full-time',
    duration: '6 Months',
    stipend: 'â‚¹18,000 / month',
    skills: ['React.js', 'Node.js', 'PostgreSQL', 'Express.js', 'Tailwind CSS'],
    description: 'Work on end-to-end web product development from UI interfaces down to database schema modeling and Supabase edge functions.',
    responsibilities: [
      'Develop client-side components and server-side API endpoints.',
      'Design database migrations and implement Row Level Security rules.',
      'Write automated unit and integration tests for backend services.',
      'Optimize database queries and client data caching.',
    ],
    requirements: [
      'Solid foundation in Node.js, Express, SQL, and React.',
      'Understanding of relational database modeling and CRUD operations.',
      'Good problem-solving skills and eagerness to learn cloud technologies.',
    ],
    learningOutcomes: [
      'Master full-stack architecture paradigms using TypeScript and PostgreSQL.',
      'Learn cloud backend setup, serverless architecture, and Supabase integration.',
    ],
    postedDate: '2026-08-03',
    deadline: '2026-08-28',
    status: 'Open',
  },
  {
    id: 'int_03',
    title: 'UI/UX & Design Systems Intern',
    companyName: 'CloudScale Systems',
    location: 'Hyderabad, Telangana',
    workMode: 'Hybrid',
    internshipType: 'Part-time',
    duration: '3 Months',
    stipend: 'â‚¹12,000 / month',
    skills: ['Figma', 'UI/UX Design', 'Tailwind CSS', 'Design Systems', 'HTML/CSS'],
    description: 'Help build and maintain unified UI design tokens, component libraries, and user journey mockups across enterprise applications.',
    responsibilities: [
      'Design wireframes, interactive prototypes, and component specifications in Figma.',
      'Assist frontend developers in translating Figma tokens into Tailwind CSS classes.',
      'Conduct usability tests and iterate based on user feedback.',
    ],
    requirements: [
      'Portfolio showcasing clean SaaS web design projects.',
      'Proficiency in Figma, vector tools, and design system fundamentals.',
      'Basic knowledge of HTML/CSS code structure is a plus.',
    ],
    learningOutcomes: [
      'Experience scaling an enterprise design system across multiple application domains.',
      'Bridge the gap between design theory and frontend implementation.',
    ],
    postedDate: '2026-08-05',
    deadline: '2026-08-30',
    status: 'Open',
  },
  {
    id: 'int_04',
    title: 'Backend Node.js & Cloud Intern',
    companyName: 'DataFlow Inc',
    location: 'Remote',
    workMode: 'Remote',
    internshipType: 'Full-time',
    duration: '4 Months',
    stipend: 'â‚¹16,000 / month',
    skills: ['Node.js', 'Express.js', 'MongoDB', 'REST API', 'Docker'],
    description: 'Assist in building scalable microservices, authentication security layers, and data processing pipelines for high-throughput platforms.',
    responsibilities: [
      'Build secure RESTful endpoints with input validation and rate limiting.',
      'Integrate third-party API services and webhooks.',
      'Containerize application modules with Docker for streamlined deployment.',
    ],
    requirements: [
      'Strong JavaScript backend fundamentals and asynchronous programming knowledge.',
      'Experience building REST APIs with Node.js and Express.',
      'Understanding of API security, JWT tokens, and CORS policies.',
    ],
    learningOutcomes: [
      'Deep expertise in backend architecture, security best practices, and API design.',
      'Hands-on experience with containerization and continuous delivery pipelines.',
    ],
    postedDate: '2026-08-07',
    deadline: '2026-08-31',
    status: 'Open',
  },
  {
    id: 'int_05',
    title: 'Mobile App Developer (React Native) Intern',
    companyName: 'AppSphere Technologies',
    location: 'Mumbai, Maharashtra',
    workMode: 'On-site',
    internshipType: 'Full-time',
    duration: '6 Months',
    stipend: 'â‚¹20,000 / month',
    skills: ['React Native', 'JavaScript', 'Mobile UI', 'Redux', 'REST API'],
    description: 'Develop cross-platform mobile apps for iOS and Android using React Native and modern mobile UI design primitives.',
    responsibilities: [
      'Build cross-platform mobile screens matching exact Figma specifications.',
      'Integrate device APIs such as geolocation, push notifications, and local storage.',
      'Optimize app performance, frame rate, and startup load times.',
    ],
    requirements: [
      'Familiarity with React or React Native concepts.',
      'Understanding of mobile navigation patterns and state management.',
      'Analytical mindset and attention to visual detail.',
    ],
    learningOutcomes: [
      'End-to-end mobile application development and App Store / Play Store publishing flow.',
      'Master cross-platform mobile performance optimization techniques.',
    ],
    postedDate: '2026-08-08',
    deadline: '2026-09-05',
    status: 'Open',
  },
  {
    id: 'int_06',
    title: 'AI & Data Analytics Intern',
    companyName: 'Cognitive Insights',
    location: 'Bangalore, Karnataka',
    workMode: 'Hybrid',
    internshipType: 'Full-time',
    duration: '3 Months',
    stipend: 'â‚¹17,000 / month',
    skills: ['Python', 'Data Analytics', 'Pandas', 'SQL', 'Machine Learning Basics'],
    description: 'Analyze real-world data distributions, build transparent scoring pipelines, and generate actionable reporting insights.',
    responsibilities: [
      'Clean and process multi-dimensional data sets using Python and Pandas.',
      'Develop rule-based threshold algorithms and transparent scoring functions.',
      'Create analytical dashboards for decision support systems.',
    ],
    requirements: [
      'Solid command of Python programming and data handling libraries.',
      'Good understanding of SQL queries, statistical concepts, and data visualization.',
      'Logical problem-solving abilities.',
    ],
    learningOutcomes: [
      'Practical exposure to production data pipelines and analytical report generation.',
      'Understand how rule-based intelligence systems power real SaaS products.',
    ],
    postedDate: '2026-08-10',
    deadline: '2026-09-02',
    status: 'Open',
  },
  {
    id: 'int_07',
    title: 'DevOps & Cloud Infrastructure Intern',
    companyName: 'Nexus Cloud Works',
    location: 'Remote',
    workMode: 'Remote',
    internshipType: 'Part-time',
    duration: '4 Months',
    stipend: 'â‚¹14,000 / month',
    skills: ['AWS', 'Linux', 'Git', 'CI/CD', 'Shell Scripting'],
    description: 'Learn cloud platform management, automated deployment pipelines, and server monitoring techniques in an enterprise cloud setup.',
    responsibilities: [
      'Maintain continuous integration workflows on GitHub Actions.',
      'Automate server maintenance tasks using Shell scripts and Linux utilities.',
      'Monitor cloud resource health, logs, and uptime metrics.',
    ],
    requirements: [
      'Familiarity with Linux command line, Git workflows, and networking basics.',
      'Basic knowledge of AWS services or cloud hosting platforms.',
    ],
    learningOutcomes: [
      'In-depth knowledge of modern CI/CD automation, cloud monitoring, and site reliability engineering.',
    ],
    postedDate: '2026-08-11',
    deadline: '2026-09-10',
    status: 'Open',
  },
  {
    id: 'int_08',
    title: 'Cybersecurity & Quality Assurance Intern',
    companyName: 'SecureNet Solutions',
    location: 'Pune, Maharashtra',
    workMode: 'On-site',
    internshipType: 'Full-time',
    duration: '3 Months',
    stipend: 'â‚¹13,000 / month',
    skills: ['QA Testing', 'Web Security', 'OWASP Basics', 'API Testing', 'Postman'],
    description: 'Perform web application security audits, automated QA test executions, and vulnerability verification across staging environments.',
    responsibilities: [
      'Execute manual and automated test suites for frontend UI and API endpoints.',
      'Identify web security vulnerabilities following OWASP Top 10 guidelines.',
      'Document bug reports, step-by-step reproduction flows, and regression checks.',
    ],
    requirements: [
      'Knowledge of web protocols, HTTP methods, and API testing with Postman.',
      'Keen eye for software bugs and understanding of cybersecurity principles.',
    ],
    learningOutcomes: [
      'Proficiency in quality assurance methodologies, API security auditing, and test automation.',
    ],
    postedDate: '2026-08-12',
    deadline: '2026-09-15',
    status: 'Open',
  },
];
export const initialMockInternships = mockInternships;
export type Internship = InternshipRecord;
