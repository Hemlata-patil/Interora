import { supabase, isSupabaseConfigured } from '@/services/supabase/supabaseClient';
import type { UserRole } from '@/types';
import type { CompanyApplication } from '@/features/admin/AdminCompanies';

export interface StudentRegistrationInput {
  fullName: string;
  studentId: string;
  email: string;
  phone: string;
  department: string;
  course: string;
  yearSemester: string;
  password: string;
}

export interface CompanyRegistrationInput {
  companyName: string;
  officialEmail: string;
  contactPerson: string;
  phone: string;
  industryDomain: string;
  website: string;
  companyAddress?: string;
  password: string;
}

export interface LoginResult {
  success: boolean;
  role?: UserRole;
  error?: string;
  requiresEmailConfirmation?: boolean;
}

export interface InternshipPostingInput {
  title: string;
  description: string;
  industryDomain: string;
  location?: string;
  internshipType?: string;
  duration?: string;
  stipend?: string;
  eligibility?: string;
  skills?: string[];
  applicationDeadline?: string;
}

export interface InternshipPostingRecord {
  id: string;
  companyId: string;
  companyName?: string;
  title: string;
  description: string;
  industryDomain: string;
  location: string;
  internshipType: string;
  duration: string;
  stipend: string;
  eligibility: string;
  skills: string[];
  applicationDeadline?: string;
  status: string;
  createdAt: string;
}

export interface StudentApplicationRecord {
  id: string;
  internshipId: string;
  studentId: string;
  status: string;
  coverLetter?: string;
  appliedAt: string;
  internshipTitle?: string;
  companyName?: string;
  studentName?: string;
}

// 1. Student Registration
export const registerStudentBackend = async (input: StudentRegistrationInput): Promise<{ success: boolean; error?: string; requiresEmailConfirmation?: boolean }> => {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase backend is not configured in .env file.' };
  }

  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: {
        role: 'student',
        full_name: input.fullName,
        student_id: input.studentId,
        phone: input.phone,
        department: input.department,
        course: input.course,
        year_semester: input.yearSemester,
      },
    },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  const requiresEmailConfirmation = !data.session;
  return { success: true, requiresEmailConfirmation };
};

// 2. Company Registration
export const registerCompanyBackend = async (input: CompanyRegistrationInput): Promise<{ success: boolean; error?: string; requiresEmailConfirmation?: boolean }> => {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase backend is not configured in .env file.' };
  }

  const { data, error } = await supabase.auth.signUp({
    email: input.officialEmail,
    password: input.password,
    options: {
      data: {
        role: 'company',
        company_name: input.companyName,
        contact_person: input.contactPerson,
        phone: input.phone,
        industry_domain: input.industryDomain,
        website: input.website,
      },
    },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  const requiresEmailConfirmation = !data.session;
  return { success: true, requiresEmailConfirmation };
};

// 3. User Login & Authorization Gatekeeping
export const loginUserBackend = async (email: string, password: string, requestedRole: UserRole): Promise<LoginResult> => {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase backend is not configured in .env file.' };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (error.message.toLowerCase().includes('email not confirmed')) {
      return {
        success: false,
        error: 'Your email address has not been confirmed yet. Please check your inbox and verify your email before logging in.',
        requiresEmailConfirmation: true,
      };
    }
    return { success: false, error: error.message || 'Invalid email or password.' };
  }

  if (!data.user) {
    return { success: false, error: 'Authentication failed.' };
  }

  // Query Profile
  const { data: profile, error: profileErr } = await supabase
    .from('profiles')
    .select('role, account_status')
    .eq('id', data.user.id)
    .single();

  if (profileErr || !profile) {
    return { success: false, error: 'User profile not found in database.' };
  }

  // Account Status Check
  if (profile.account_status === 'inactive') {
    return { success: false, error: 'Your account is currently inactive. Please contact the administrator.' };
  }

  // Company Status Gatekeeping
  if (profile.role === 'company' || requestedRole === 'company') {
    const { data: compProfile, error: compErr } = await supabase
      .from('company_profiles')
      .select('approval_status, rejection_reason')
      .eq('id', data.user.id)
      .single();

    if (compErr || !compProfile) {
      return { success: false, error: 'Company registration profile not found.' };
    }

    if (compProfile.approval_status === 'pending') {
      return { success: false, error: 'Your company registration is still awaiting TPO approval. You cannot log in until approved.' };
    }

    if (compProfile.approval_status === 'rejected') {
      const reason = compProfile.rejection_reason ? ` Reason: ${compProfile.rejection_reason}` : '';
      return { success: false, error: `Your company registration was rejected.${reason} Please contact the TPO administrator.` };
    }
  }

  return { success: true, role: profile.role as UserRole };
};

// 4. Fetch Company Applications for Admin Dashboard
export const fetchCompanyApplicationsBackend = async (): Promise<CompanyApplication[]> => {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const { data, error } = await supabase
    .from('company_profiles')
    .select('id, company_name, industry_domain, contact_person, official_email, phone, website, approval_status, created_at');

  if (error || !data) {
    return [];
  }

  return data.map((item) => ({
    id: item.id,
    companyName: item.company_name,
    industryDomain: item.industry_domain,
    contactPerson: item.contact_person,
    email: item.official_email,
    phone: item.phone,
    website: item.website || 'https://company.com',
    appliedDate: new Date(item.created_at).toISOString().slice(0, 10),
    status: item.approval_status === 'approved' ? 'Approved' : item.approval_status === 'rejected' ? 'Rejected' : 'Pending',
    invitationSent: false,
    internshipCount: 0,
    mentorCount: 0,
  }));
};

// Helper: Trigger Edge Function Email
export const triggerCompanyEmailFunction = async (
  recipientEmail: string,
  companyName: string,
  type: 'approved' | 'rejected',
  rejectionReason?: string
): Promise<{ success: boolean; error?: string }> => {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;

  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const { data, error } = await supabase.functions.invoke('send-company-email', {
    body: {
      recipientEmail,
      companyName,
      type,
      rejectionReason,
    },
    headers,
  });

  if (error) {
    try {
      if ('context' in error && error.context) {
        const responseBody = await (error.context as Response).json();
        if (responseBody && responseBody.error) {
          return { success: false, error: responseBody.error };
        }
      }
    } catch {
      // ignore
    }
    return { success: false, error: error.message || 'Failed to trigger company notification email Edge Function.' };
  }

  if (data && data.success === false) {
    return { success: false, error: data.error || 'Email function returned an unhandled error.' };
  }

  return { success: true };
};

// 5. Admin Approve Company RPC
export const approveCompanyBackend = async (
  companyId: string,
  companyName?: string,
  officialEmail?: string
): Promise<{ success: boolean; error?: string }> => {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase backend is not configured in .env file.' };
  }

  const { error: rpcError } = await supabase.rpc('approve_company', { target_company_id: companyId });
  if (rpcError) {
    return { success: false, error: rpcError.message };
  }

  return { success: true };
};

// 6. Admin Reject Company RPC + Email Notification
export const rejectCompanyBackend = async (
  companyId: string,
  reason: string = 'Criteria not met',
  companyName?: string,
  officialEmail?: string
): Promise<{ success: boolean; error?: string }> => {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase backend is not configured in .env file.' };
  }

  let emailToSend = officialEmail;
  let nameToSend = companyName;

  if (!emailToSend || !nameToSend) {
    const { data: compProfile } = await supabase
      .from('company_profiles')
      .select('company_name, official_email')
      .eq('id', companyId)
      .single();

    if (compProfile) {
      emailToSend = compProfile.official_email;
      nameToSend = compProfile.company_name;
    }
  }

  const { error: rpcError } = await supabase.rpc('reject_company', {
    target_company_id: companyId,
    p_rejection_reason: reason,
  });

  if (rpcError) {
    return { success: false, error: rpcError.message };
  }

  if (emailToSend && nameToSend) {
    const emailResult = await triggerCompanyEmailFunction(emailToSend, nameToSend, 'rejected', reason);
    if (!emailResult.success) {
      return { success: false, error: `Company rejected in database, but notification email failed: ${emailResult.error}` };
    }
  }

  return { success: true };
};

// 7. Explicit Send Company Invitation Email backend method
export const sendCompanyInvitationBackend = async (
  companyId: string,
  companyName: string,
  officialEmail: string
): Promise<{ success: boolean; error?: string }> => {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase backend is not configured in .env file.' };
  }

  return await triggerCompanyEmailFunction(officialEmail, companyName, 'approved');
};

/* ====================================================================
   PHASE 2: INTERNSHIP POSTINGS & STUDENT APPLICATIONS BACKEND SERVICES
   ==================================================================== */

// Create Internship Posting (Company)
export const createInternshipPostingBackend = async (
  input: InternshipPostingInput
): Promise<{ success: boolean; data?: InternshipPostingRecord; error?: string }> => {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase backend is not configured in .env file.' };
  }

  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) {
    return { success: false, error: 'User is not authenticated.' };
  }

  const { data, error } = await supabase
    .from('internship_postings')
    .insert({
      company_id: userData.user.id,
      title: input.title,
      description: input.description,
      industry_domain: input.industryDomain,
      location: input.location || 'Remote / On-site',
      internship_type: input.internshipType || 'Full-time',
      duration: input.duration || '3 Months',
      stipend: input.stipend || 'Unpaid / Paid',
      eligibility: input.eligibility || 'All Eligible',
      skills: input.skills || [],
      application_deadline: input.applicationDeadline || null,
      status: 'open',
    })
    .select('*, company_profiles(company_name)')
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return {
    success: true,
    data: {
      id: data.id,
      companyId: data.company_id,
      companyName: data.company_profiles?.company_name || 'Company',
      title: data.title,
      description: data.description,
      industryDomain: data.industry_domain,
      location: data.location,
      internshipType: data.internship_type,
      duration: data.duration,
      stipend: data.stipend,
      eligibility: data.eligibility,
      skills: data.skills || [],
      applicationDeadline: data.application_deadline,
      status: data.status,
      createdAt: data.created_at,
    },
  };
};

// Fetch Internship Postings (Open or Company-specific)
export const fetchInternshipPostingsBackend = async (
  companyId?: string
): Promise<InternshipPostingRecord[]> => {
  if (!isSupabaseConfigured()) return [];

  let query = supabase
    .from('internship_postings')
    .select('*, company_profiles(company_name)')
    .order('created_at', { ascending: false });

  if (companyId) {
    query = query.eq('company_id', companyId);
  } else {
    query = query.eq('status', 'open');
  }

  const { data, error } = await query;
  if (error || !data) return [];

  return data.map((item) => ({
    id: item.id,
    companyId: item.company_id,
    companyName: item.company_profiles?.company_name || 'Company',
    title: item.title,
    description: item.description,
    industryDomain: item.industry_domain,
    location: item.location,
    internshipType: item.internship_type,
    duration: item.duration,
    stipend: item.stipend,
    eligibility: item.eligibility,
    skills: item.skills || [],
    applicationDeadline: item.application_deadline,
    status: item.status,
    createdAt: item.created_at,
  }));
};

// Create Student Application
export const createStudentApplicationBackend = async (
  internshipId: string,
  coverLetter?: string
): Promise<{ success: boolean; error?: string }> => {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase backend is not configured in .env file.' };
  }

  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) {
    return { success: false, error: 'User is not authenticated.' };
  }

  const { error } = await supabase.from('student_applications').insert({
    internship_id: internshipId,
    student_id: userData.user.id,
    cover_letter: coverLetter || '',
    status: 'Submitted',
  });

  if (error) {
    if (error.code === '23505') {
      return { success: false, error: 'You have already applied for this internship position.' };
    }
    return { success: false, error: error.message };
  }

  return { success: true };
};

// Fetch Student Applications (Student views own applications)
export const fetchStudentApplicationsBackend = async (): Promise<StudentApplicationRecord[]> => {
  if (!isSupabaseConfigured()) return [];

  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return [];

  const { data, error } = await supabase
    .from('student_applications')
    .select('*, internship_postings(title, company_profiles(company_name))')
    .eq('student_id', userData.user.id)
    .order('applied_at', { ascending: false });

  if (error || !data) return [];

  return data.map((item) => ({
    id: item.id,
    internshipId: item.internship_id,
    studentId: item.student_id,
    status: item.status,
    coverLetter: item.cover_letter,
    appliedAt: item.applied_at,
    internshipTitle: item.internship_postings?.title,
    companyName: item.internship_postings?.company_profiles?.company_name,
  }));
};

// Fetch Company Applicants (Company views applications for its internships)
export const fetchCompanyApplicantsBackend = async (
  companyId: string
): Promise<StudentApplicationRecord[]> => {
  if (!isSupabaseConfigured()) return [];

  console.log("Applicants companyId:", companyId);

  const { data, error } = await supabase
    .from('student_applications')
    .select('*, internship_postings!inner(company_id, title), profiles!student_id(full_name)')
    .eq('internship_postings.company_id', companyId)
    .order('applied_at', { ascending: false });

  console.log("Applicants data:", data);
  console.error("Applicants error:", error);

  if (error || !data) return [];

  return data.map((item: any) => ({
    id: item.id,
    internshipId: item.internship_id,
    studentId: item.student_id,
    status: item.status,
    coverLetter: item.cover_letter,
    appliedAt: item.applied_at,
    internshipTitle: item.internship_postings?.title,
    studentName: item.profiles?.full_name || 'Student Candidate',
  }));
};

// Update Application Status (Company / Admin)
export const updateApplicationStatusBackend = async (
  applicationId: string,
  newStatus: string
): Promise<{ success: boolean; error?: string }> => {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase backend is not configured in .env file.' };
  }

  const { error } = await supabase
    .from('student_applications')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', applicationId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
};
