/**
 * Shared Profile Completion Utility for Interora
 *
 * Implements real-time, deterministic calculation of student profile readiness.
 * Used across:
 *   1. Signup & Multi-step Onboarding
 *   2. Student Profile & Profile Completion Wrapper
 *   3. Student Dashboard profile readiness banner
 *
 * Rules:
 *   - Only meaningful, non-placeholder, non-mock values are counted.
 *   - Essential/Required fields are strictly evaluated.
 *   - Status is "Profile Incomplete" until 100% of required fields are valid.
 *   - Optional fields (avatar, projects, certifications, experiences, resume, bio, links)
 *     never block profile completion.
 */

export interface StudentProfileLike {
  fullName?: string | null;
  email?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
  studentId?: string | null;
  rollNo?: string | null;
  department?: string | null;
  departmentId?: string | null;
  departmentName?: string | null;
  institution?: string | null;
  course?: string | null;
  degree?: string | null;
  yearSemester?: string | null;
  currentSemester?: string | number | null;
  batchYear?: string | number | null;
  batchDivision?: string | null;
  cgpa?: string | null;
  bio?: string | null;
  resumeHeadline?: string | null;
  resumeFileName?: string | null;
  resumeUrl?: string | null;
  skills?: Array<string | { name: string }> | null;
  interests?: string[] | null;
  preferredRoles?: string[] | null;
  preferredLocations?: string[] | null;
  availability?: string | null;
  githubUrl?: string | null;
  linkedinUrl?: string | null;
  portfolioUrl?: string | null;
  projects?: any[] | null;
  certifications?: any[] | null;
  experiences?: any[] | null;
}

export interface RequiredFieldCriterion {
  id: string;
  label: string;
  category: 'Personal Information' | 'Academic Information' | 'Skills & Competencies' | 'Career Goals';
  weight: number;
  isValid: boolean;
  missingHint: string;
}

export interface OptionalFieldCriterion {
  id: string;
  label: string;
  isFilled: boolean;
  description: string;
}

export interface ProfileCompletionSummary {
  percentage: number;
  isComplete: boolean;
  statusLabel: 'Profile Complete' | 'Profile Incomplete';
  completedCount: number;
  totalCount: number;
  requiredCriteria: RequiredFieldCriterion[];
  completedList: RequiredFieldCriterion[];
  missingList: RequiredFieldCriterion[];
  optionalList: OptionalFieldCriterion[];
  completedOptionalCount: number;
  totalOptionalCount: number;
}

const PLACEHOLDER_STRINGS = new Set([
  'student',
  'user',
  'anonymous',
  'n/a',
  'na',
  'none',
  'test',
  'null',
  'undefined',
  'placeholder',
  'your name',
  'enter here',
  'rohan mehta',
  'rohan.mehta@college.edu',
  'cs2026-089',
]);

export function isValidString(val?: string | null, minLen = 2): boolean {
  if (!val || typeof val !== 'string') return false;
  const trimmed = val.trim();
  if (trimmed.length < minLen) return false;
  if (PLACEHOLDER_STRINGS.has(trimmed.toLowerCase())) return false;
  return true;
}

export function isValidEmail(val?: string | null): boolean {
  if (!isValidString(val, 5)) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(val!.trim())) return false;
  if (val!.trim().toLowerCase() === 'rohan.mehta@college.edu') return false;
  return true;
}

export function isValidPhone(val?: string | null): boolean {
  if (!isValidString(val, 7)) return false;
  const digits = val!.replace(/\D/g, '');
  if (digits.length < 7 || digits.length > 15) return false;
  // Discard pure repetitive dummy like 0000000000 or 1234567890 or 9876543210 (mock)
  if (
    /^0{7,}$/.test(digits) ||
    /^1{7,}$/.test(digits) ||
    digits === '1234567890' ||
    digits === '9876543210'
  ) {
    return false;
  }
  return true;
}

export function isValidStudentId(val?: string | null): boolean {
  if (!isValidString(val, 2)) return false;
  const trimmed = val!.trim();
  // Reject auto-generated database placeholder pattern STU-XXXXXXXX (8 hex chars)
  if (/^STU-[0-9a-fA-F]{8}$/i.test(trimmed)) return false;
  if (/^CS2026-089$/i.test(trimmed)) return false; // mock ID
  return true;
}

export function isValidSkills(skills?: Array<string | { name: string }> | null): boolean {
  if (!Array.isArray(skills) || skills.length < 2) return false;
  const validSkills = skills.filter((s) => {
    const name = typeof s === 'string' ? s : s?.name;
    return isValidString(name, 1);
  });
  return validSkills.length >= 2;
}

export function isValidRoles(roles?: string[] | null): boolean {
  if (!Array.isArray(roles) || roles.length < 1) return false;
  return roles.some((r) => isValidString(r, 2));
}

/**
 * Calculates profile completion from meaningful, valid profile attributes.
 *
 * @param profile The student profile object (persisted user or current form state)
 * @returns ProfileCompletionSummary with real-time percentage and section breakdown
 */
export function calculateProfileCompletion(profile?: StudentProfileLike | null): ProfileCompletionSummary {
  const p = profile || {};

  const fullNameValid = isValidString(p.fullName, 2) && p.fullName?.trim().toLowerCase() !== 'rohan mehta';
  const emailValid = isValidEmail(p.email);
  const phoneValid = isValidPhone(p.phone);
  const deptValid = isValidString(p.department || p.departmentName, 2);
  const courseValid = isValidString(p.course || p.degree, 2);
  const rollValid = isValidStudentId(p.studentId || p.rollNo);
  const skillsValid = isValidSkills(p.skills);
  const rolesValid = isValidRoles(p.preferredRoles);

  // ── 1. REQUIRED FIELDS (Strictly evaluated, sum of weights = 100) ──
  const requiredCriteria: RequiredFieldCriterion[] = [
    {
      id: 'fullName',
      label: 'Full Name',
      category: 'Personal Information',
      weight: 15,
      isValid: fullNameValid,
      missingHint: 'Provide your official full legal name',
    },
    {
      id: 'email',
      label: 'Email Address',
      category: 'Personal Information',
      weight: 15,
      isValid: emailValid,
      missingHint: 'Enter a valid student or institutional email',
    },
    {
      id: 'phone',
      label: 'Mobile Contact Number',
      category: 'Personal Information',
      weight: 15,
      isValid: phoneValid,
      missingHint: 'Provide an active mobile contact number (min 7 digits)',
    },
    {
      id: 'department',
      label: 'Department / Branch',
      category: 'Academic Information',
      weight: 15,
      isValid: deptValid,
      missingHint: 'Select your enrolled academic engineering department',
    },
    {
      id: 'course',
      label: 'Course / Degree Program',
      category: 'Academic Information',
      weight: 10,
      isValid: courseValid,
      missingHint: 'Specify degree (e.g. B.Tech Computer Science, BE, MCA)',
    },
    {
      id: 'studentId',
      label: 'Student Roll No / ID',
      category: 'Academic Information',
      weight: 10,
      isValid: rollValid,
      missingHint: 'Provide your campus roll number or college PRN',
    },
    {
      id: 'skills',
      label: 'Technical Skills (Minimum 2)',
      category: 'Skills & Competencies',
      weight: 10,
      isValid: skillsValid,
      missingHint: 'Add at least 2 technical competencies',
    },
    {
      id: 'preferredRoles',
      label: 'Target Career Role(s)',
      category: 'Career Goals',
      weight: 10,
      isValid: rolesValid,
      missingHint: 'Specify at least 1 target job or internship role',
    },
  ];

  // ── 2. OPTIONAL ENRICHMENT FIELDS (Do NOT block 100% completion) ──
  const optionalList: OptionalFieldCriterion[] = [
    {
      id: 'avatar',
      label: 'Profile Picture',
      isFilled: Boolean(p.avatarUrl && isValidString(p.avatarUrl, 5)),
      description: 'Professional headshot photograph for corporate recruiter visibility',
    },
    {
      id: 'bio',
      label: 'Professional Bio',
      isFilled: Boolean(p.bio && isValidString(p.bio, 10)),
      description: 'Elevator pitch or career summary',
    },
    {
      id: 'resume',
      label: 'PDF Resume Attachment',
      isFilled: Boolean(p.resumeUrl || p.resumeFileName),
      description: 'Primary text-based PDF resume for ATS screening',
    },
    {
      id: 'projects',
      label: 'Portfolio Projects',
      isFilled: Boolean(Array.isArray(p.projects) && p.projects.length > 0),
      description: 'Real-world software projects and code repositories',
    },
    {
      id: 'certifications',
      label: 'External Certifications',
      isFilled: Boolean(Array.isArray(p.certifications) && p.certifications.length > 0),
      description: 'Verified credentials and professional certificates',
    },
    {
      id: 'experiences',
      label: 'Internship / Work Experience',
      isFilled: Boolean(Array.isArray(p.experiences) && p.experiences.length > 0),
      description: 'Past or active industry internships',
    },
    {
      id: 'socialLinks',
      label: 'Online Profiles (GitHub / LinkedIn / Portfolio)',
      isFilled: Boolean(p.githubUrl || p.linkedinUrl || p.portfolioUrl),
      description: 'Links to developer portfolio, GitHub, and LinkedIn network',
    },
  ];

  const completedList = requiredCriteria.filter((c) => c.isValid);
  const missingList = requiredCriteria.filter((c) => !c.isValid);

  const rawScore = completedList.reduce((acc, c) => acc + c.weight, 0);
  const percentage = Math.min(100, Math.max(0, rawScore));
  const isComplete = missingList.length === 0 && percentage === 100;
  const statusLabel = isComplete ? 'Profile Complete' : 'Profile Incomplete';

  const completedOptionalCount = optionalList.filter((o) => o.isFilled).length;

  return {
    percentage,
    isComplete,
    statusLabel,
    completedCount: completedList.length,
    totalCount: requiredCriteria.length,
    requiredCriteria,
    completedList,
    missingList,
    optionalList,
    completedOptionalCount,
    totalOptionalCount: optionalList.length,
  };
}
