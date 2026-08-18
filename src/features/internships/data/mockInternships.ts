export interface Internship {
  id: string;
  title: string;
  companyName: string;
  companyLogo: string;
  location: string;
  workMode: 'On-site' | 'Remote' | 'Hybrid';
  stipend: string;
  duration: string;
  type: string;
  category: string;
  postedDate: string;
  applicationStartDate?: string;
  applicationDeadline?: string;
  internshipStartDate?: string;
  internshipEndDate?: string;
  description: string;
  skillsRequired: string[];
  responsibilities: string[];
  eligibility: string[];
  perks: string[];
  isFeatured?: boolean;
}

// Compute dynamic future ISO date strings relative to execution time so tests always work deterministically
const now = new Date();

const addDays = (days: number) => {
  const d = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  return d.toISOString();
};

const subtractDays = (days: number) => {
  const d = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  return d.toISOString();
};

const addHours = (hours: number) => {
  const d = new Date(now.getTime() + hours * 60 * 60 * 1000);
  return d.toISOString();
};

export const initialMockInternships: Internship[] = [
  {
    id: 'int_01',
    title: 'Full Stack React Developer Intern',
    companyName: 'TechCorp Solutions',
    companyLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&h=120&q=80',
    location: 'Bangalore, India',
    workMode: 'Hybrid',
    stipend: 'â‚¹25,000 / month',
    duration: '6 Months',
    type: 'Full-time',
    category: 'Software Engineering',
    postedDate: '2 days ago',
    applicationStartDate: subtractDays(10),
    applicationDeadline: addHours(48), // 48 hours remaining (DEADLINE_NEAR)
    internshipStartDate: addDays(15),
    internshipEndDate: addDays(195),
    description:
      'Join TechCorp Solutions as a Full Stack React Intern. Work on enterprise software systems, REST APIs, and modern frontend state management.',
    skillsRequired: ['React.js', 'TypeScript', 'Node.js', 'SQL', 'Git'],
    responsibilities: [
      'Build responsive UI components using React and Tailwind CSS',
      'Integrate backend REST endpoints with TypeScript interfaces',
      'Participate in daily agile standups and sprint planning',
    ],
    eligibility: [
      'B.Tech / B.E in CS / IT / ECE (3rd or 4th Year)',
      'Minimum 7.0 CGPA',
      'Strong knowledge of JavaScript and Web fundamentals',
    ],
    perks: ['Certificate of Completion', 'Letter of Recommendation', 'Pre-Placement Offer (PPO) Opportunity'],
    isFeatured: true,
  },
  {
    id: 'int_02',
    title: 'AI / Machine Learning Engineering Intern',
    companyName: 'DataMind AI Research',
    companyLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&h=120&q=80',
    location: 'Remote',
    workMode: 'Remote',
    stipend: 'â‚¹30,000 / month',
    duration: '3 Months',
    type: 'Full-time',
    category: 'AI & Data Science',
    postedDate: '1 day ago',
    applicationStartDate: subtractDays(5),
    applicationDeadline: addDays(5), // 5 days remaining (CLOSING_SOON)
    internshipStartDate: addDays(12),
    internshipEndDate: addDays(102),
    description:
      'Assist in training, evaluating, and fine-tuning deep learning models for natural language processing and computer vision applications.',
    skillsRequired: ['Python', 'PyTorch', 'Scikit-Learn', 'FastAPI', 'Pandas'],
    responsibilities: [
      'Preprocess large scale datasets and perform feature engineering',
      'Implement baseline ML pipeline models and log evaluation metrics',
      'Deploy model inference APIs using FastAPI',
    ],
    eligibility: ['3rd or 4th year undergraduate student', 'Proficiency in Python and Linear Algebra'],
    perks: ['Flexible Work Hours', 'Mentorship from Senior AI Scientists', 'Publication Assistance'],
    isFeatured: true,
  },
  {
    id: 'int_03',
    title: 'Frontend UI/UX Developer Intern',
    companyName: 'InnovateX Labs',
    companyLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&h=120&q=80',
    location: 'Pune, India',
    workMode: 'On-site',
    stipend: 'â‚¹20,000 / month',
    duration: '6 Months',
    type: 'Full-time',
    category: 'UI/UX & Frontend',
    postedDate: '4 days ago',
    applicationStartDate: subtractDays(14),
    applicationDeadline: addHours(12), // 12 hours remaining (LAST_DAY)
    internshipStartDate: addDays(10),
    internshipEndDate: addDays(190),
    description:
      'Design and code pixel-perfect web application interfaces using React, Figma design systems, and modern CSS utilities.',
    skillsRequired: ['React.js', 'Figma', 'CSS3', 'JavaScript'],
    responsibilities: ['Convert Figma mockups into reusable React components', 'Optimize web accessibility and load performance'],
    eligibility: ['Open to all CS / IT / Design engineering streams'],
    perks: ['On-site Free Lunch & Snacks', 'Certificate & Internship Credit'],
    isFeatured: false,
  },
  {
    id: 'int_04',
    title: 'Backend Python & Cloud Infrastructure Intern',
    companyName: 'CloudScale Systems',
    companyLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&h=120&q=80',
    location: 'Hyderabad, India',
    workMode: 'Hybrid',
    stipend: 'â‚¹28,000 / month',
    duration: '6 Months',
    type: 'Full-time',
    category: 'Backend & Cloud',
    postedDate: 'Just now',
    applicationStartDate: subtractDays(2),
    applicationDeadline: addDays(14), // 14 days remaining (OPEN)
    internshipStartDate: addDays(20),
    internshipEndDate: addDays(200),
    description:
      'Build scalable backend microservices, SQL database schemas, and automated CI/CD deployment pipelines on AWS.',
    skillsRequired: ['Python', 'Django', 'PostgreSQL', 'Docker', 'AWS'],
    responsibilities: ['Write clean Python unit tests and API documentation', 'Optimize SQL database query indexing'],
    eligibility: ['B.Tech 3rd or 4th year student with strong Backend fundamentals'],
    perks: ['AWS Certification Sponsorship', 'Pre-Placement Offer (PPO)'],
    isFeatured: false,
  },
  {
    id: 'int_05',
    title: 'Cybersecurity & Network Defense Intern',
    companyName: 'SecureGrid Defense',
    companyLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&h=120&q=80',
    location: 'Remote',
    workMode: 'Remote',
    stipend: 'â‚¹22,000 / month',
    duration: '3 Months',
    type: 'Part-time',
    category: 'Cybersecurity',
    postedDate: '2 weeks ago',
    applicationStartDate: subtractDays(30),
    applicationDeadline: subtractDays(2), // EXPIRED
    internshipStartDate: addDays(5),
    internshipEndDate: addDays(95),
    description:
      'Conduct vulnerability assessments, static code analysis, and monitor security operations logs.',
    skillsRequired: ['Cybersecurity', 'Linux', 'Python', 'Wireshark'],
    responsibilities: ['Perform security audits on web applications', 'Draft threat intelligence reports'],
    eligibility: ['CS / IT / Cyber Security specialization'],
    perks: ['Certified Security Analyst Certificate'],
    isFeatured: false,
  },
];

export const mockInternships = initialMockInternships;