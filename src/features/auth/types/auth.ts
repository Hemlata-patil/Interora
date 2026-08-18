export interface StudentRegistrationPayload {
  fullName: string;
  email: string;
  password: string;
  mobileNumber?: string;
}

export interface StudentProfileData {
  // Personal Info (20%)
  fullName: string;
  email: string;
  mobileNumber: string;
  profilePhotoUrl?: string; // (10%)

  // Education (15%)
  collegeName: string;
  degree: string;
  branch: string;
  currentYear: string;
  graduationYear: string;

  // Career Information (5% + 5%)
  targetRole: string;
  areasOfInterest: string[];
  skills: string[];
  preferredDomain: string;

  // Professional Links (10% + 10% + 5%)
  linkedinUrl: string;
  githubUrl: string;
  portfolioUrl: string;

  // Resume (20%)
  resumeName?: string;
  resumeSizeFormatted?: string;
  resumeLastModified?: string;
}

export interface PasswordResetPayload {
  email: string;
}

export interface NewPasswordPayload {
  token?: string;
  newPassword: string;
}

export interface AuthService {
  registerStudent(payload: StudentRegistrationPayload): Promise<{ success: boolean; studentId: string }>;
  loginStudent(email: string, password: string): Promise<{ success: boolean; studentId: string }>;
  requestPasswordReset(payload: PasswordResetPayload): Promise<{ success: boolean; message: string }>;
  resetPassword(payload: NewPasswordPayload): Promise<{ success: boolean; message: string }>;
}