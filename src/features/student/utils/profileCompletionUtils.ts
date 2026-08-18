import type { StudentProfileData } from '../../auth/types/auth';

export interface CompletionSectionBreakdown {
  section: string;
  weight: number;
  isComplete: boolean;
  fields: string[];
}

export interface ProfileCompletionMetrics {
  percentage: number;
  completedWeight: number;
  totalWeight: number;
  sections: CompletionSectionBreakdown[];
}

export const initialStudentProfileState: StudentProfileData = {
  fullName: 'Alex Johnson',
  email: 'alex.johnson@student.edu',
  mobileNumber: '+91 98765 43210',
  profilePhotoUrl: '',
  collegeName: 'G.H. Raisoni College of Engineering',
  degree: 'Bachelor of Technology (B.Tech)',
  branch: 'Computer Science & Engineering',
  currentYear: '3rd Year',
  graduationYear: '2026',
  targetRole: 'Full Stack Software Developer',
  areasOfInterest: ['Web Development', 'AI / Machine Learning'],
  skills: ['React.js', 'TypeScript', 'JavaScript', 'SQL', 'HTML/CSS'],
  preferredDomain: 'Software Product Development',
  linkedinUrl: 'https://linkedin.com/in/alex-johnson-dev',
  githubUrl: 'https://github.com/alexjohnson-dev',
  portfolioUrl: '',
  resumeName: 'Alex_Johnson_Resume.pdf',
  resumeSizeFormatted: '1.2 MB',
  resumeLastModified: 'Aug 14, 2026',
};

export const calculateProfileCompletion = (profile: StudentProfileData): ProfileCompletionMetrics => {
  const sections: CompletionSectionBreakdown[] = [
    {
      section: 'Personal Information',
      weight: 20,
      isComplete: Boolean(profile.fullName && profile.email && profile.mobileNumber),
      fields: ['Full Name', 'Email', 'Mobile Number'],
    },
    {
      section: 'Profile Photo',
      weight: 10,
      isComplete: Boolean(profile.profilePhotoUrl),
      fields: ['Profile Photo'],
    },
    {
      section: 'Education',
      weight: 15,
      isComplete: Boolean(profile.collegeName && profile.degree && profile.branch && profile.currentYear),
      fields: ['College Name', 'Degree', 'Branch', 'Year'],
    },
    {
      section: 'Resume',
      weight: 20,
      isComplete: Boolean(profile.resumeName),
      fields: ['Uploaded Resume Document'],
    },
    {
      section: 'LinkedIn Profile',
      weight: 10,
      isComplete: Boolean(profile.linkedinUrl),
      fields: ['LinkedIn URL'],
    },
    {
      section: 'GitHub Profile',
      weight: 10,
      isComplete: Boolean(profile.githubUrl),
      fields: ['GitHub URL'],
    },
    {
      section: 'Portfolio Website',
      weight: 5,
      isComplete: Boolean(profile.portfolioUrl),
      fields: ['Portfolio URL'],
    },
    {
      section: 'Skills',
      weight: 5,
      isComplete: Boolean(profile.skills && profile.skills.length > 0),
      fields: ['Technical Skills'],
    },
    {
      section: 'Career Goals',
      weight: 5,
      isComplete: Boolean(profile.targetRole && profile.areasOfInterest && profile.areasOfInterest.length > 0),
      fields: ['Target Career Role', 'Areas of Interest'],
    },
  ];

  const completedWeight = sections
    .filter((s) => s.isComplete)
    .reduce((sum, s) => sum + s.weight, 0);

  return {
    percentage: completedWeight,
    completedWeight,
    totalWeight: 100,
    sections,
  };
};