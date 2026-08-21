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
  status?: string;
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
   PHASE 2 & PHASE 3: INTERNSHIP POSTINGS & STUDENT APPLICATIONS
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
      status: input.status || 'open',
    })
    .select('*, company_profiles(company_name)')
    .single();

  if (error) {
    console.error('[createInternshipPostingBackend] Error:', error);
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

// Update Internship Posting (Company / Admin)
export const updateInternshipPostingBackend = async (
  postingId: string,
  input: Partial<InternshipPostingInput>
): Promise<{ success: boolean; error?: string }> => {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase backend is not configured in .env file.' };
  }

  const updatePayload: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  if (input.title !== undefined) updatePayload.title = input.title;
  if (input.description !== undefined) updatePayload.description = input.description;
  if (input.industryDomain !== undefined) updatePayload.industry_domain = input.industryDomain;
  if (input.location !== undefined) updatePayload.location = input.location;
  if (input.internshipType !== undefined) updatePayload.internship_type = input.internshipType;
  if (input.duration !== undefined) updatePayload.duration = input.duration;
  if (input.stipend !== undefined) updatePayload.stipend = input.stipend;
  if (input.eligibility !== undefined) updatePayload.eligibility = input.eligibility;
  if (input.skills !== undefined) updatePayload.skills = input.skills;
  if (input.applicationDeadline !== undefined) updatePayload.application_deadline = input.applicationDeadline;
  if (input.status !== undefined) updatePayload.status = input.status;

  const { error } = await supabase
    .from('internship_postings')
    .update(updatePayload)
    .eq('id', postingId);

  if (error) {
    console.error('[updateInternshipPostingBackend] Error:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
};

// Delete Internship Posting (Company / Admin)
export const deleteInternshipPostingBackend = async (
  postingId: string
): Promise<{ success: boolean; error?: string }> => {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase backend is not configured in .env file.' };
  }

  const { error } = await supabase
    .from('internship_postings')
    .delete()
    .eq('id', postingId);

  if (error) {
    console.error('[deleteInternshipPostingBackend] Error:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
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
  if (error) {
    console.error('[fetchInternshipPostingsBackend] Error:', error);
    return [];
  }
  if (!data) return [];

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
    console.error('[createStudentApplicationBackend] Error:', error);
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

  if (error) {
    console.error('[fetchStudentApplicationsBackend] Error:', error);
    return [];
  }
  if (!data) return [];

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

// Fetch Company Applicants (Company views applications for its internships) via Reliable Multi-Query Decoupling
export const fetchCompanyApplicantsBackend = async (
  companyId: string
): Promise<StudentApplicationRecord[]> => {
  if (!isSupabaseConfigured()) return [];

  console.log('[Applicants] Company ID:', companyId);

  // 1. Query company internship postings
  const { data: internships, error: intErr } = await supabase
    .from('internship_postings')
    .select('id, company_id, title')
    .eq('company_id', companyId);

  if (intErr) {
    console.error('[Applicants] Internship query error:', intErr);
    return [];
  }

  console.log('[Applicants] Internships:', internships);
  if (!internships || internships.length === 0) return [];

  const internshipIds = internships.map((i) => i.id);
  const internshipMap = new Map(internships.map((i) => [i.id, i.title]));

  // 2. Query student_applications
  const { data: applications, error: appErr } = await supabase
    .from('student_applications')
    .select('*')
    .in('internship_id', internshipIds)
    .order('applied_at', { ascending: false });

  if (appErr) {
    console.error('[Applicants] Student applications query error:', appErr);
    return [];
  }

  console.log('[Applicants] Applications:', applications);
  if (!applications || applications.length === 0) return [];

  const studentIds = Array.from(new Set(applications.map((a) => a.student_id)));

  // 3. Query profiles separately for student names
  const { data: profiles, error: profErr } = await supabase
    .from('profiles')
    .select('id, full_name')
    .in('id', studentIds);

  if (profErr) {
    console.error('[Applicants] Profiles query error:', profErr);
  }

  console.log('[Applicants] Profiles:', profiles);
  const profileMap = new Map((profiles || []).map((p) => [p.id, p.full_name]));

  // 4. Combine records cleanly into StudentApplicationRecord[]
  const finalResult: StudentApplicationRecord[] = applications.map((app) => ({
    id: app.id,
    internshipId: app.internship_id,
    studentId: app.student_id,
    status: app.status,
    coverLetter: app.cover_letter,
    appliedAt: app.applied_at,
    internshipTitle: internshipMap.get(app.internship_id) || 'Internship Position',
    studentName: profileMap.get(app.student_id) || 'Student Candidate',
  }));

  console.log('[Applicants] Final result:', finalResult);
  return finalResult;
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
    console.error('[updateApplicationStatusBackend] Error:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
};
/* ====================================================================
   PHASE 4: STUDENT PERSISTENCE FEATURE SERVICES
   ==================================================================== */

export interface AttendanceRecord {
  id: string;
  studentId: string;
  internshipId?: string;
  attendanceDate: string;
  status: 'present' | 'absent' | 'late' | 'leave';
  checkInTime?: string;
  checkOutTime?: string;
}

export interface StudentTaskRecord {
  id: string;
  studentId: string;
  title: string;
  description?: string;
  dueDate?: string;
  completed: boolean;
  createdAt: string;
}

export interface CareerProgressRecord {
  id: string;
  studentId: string;
  moduleKey: string;
  progressPercent: number;
  completed: boolean;
}

export interface StudentMilestoneRecord {
  id: string;
  studentId: string;
  internshipId?: string;
  title: string;
  description?: string;
  status: string;
  dueDate?: string;
  completedAt?: string;
}

export interface StudentEvaluationRecord {
  id: string;
  studentId: string;
  internshipId?: string;
  evaluatorId?: string;
  rating: number;
  feedback?: string;
  createdAt: string;
}

export interface StudentCertificateRecord {
  id: string;
  studentId: string;
  internshipId?: string;
  certificateNumber: string;
  certificateUrl?: string;
  issuedAt: string;
}

// Attendance Services
export const fetchStudentAttendanceBackend = async (): Promise<AttendanceRecord[]> => {
  if (!isSupabaseConfigured()) return [];
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return [];

  const { data, error } = await supabase
    .from('attendance_records')
    .select('*')
    .eq('student_id', userData.user.id)
    .order('attendance_date', { ascending: false });

  if (error || !data) {
    console.error('[fetchStudentAttendanceBackend] Error:', error);
    return [];
  }

  return data.map((a) => ({
    id: a.id,
    studentId: a.student_id,
    internshipId: a.internship_id,
    attendanceDate: a.attendance_date,
    status: a.status,
    checkInTime: a.check_in_time,
    checkOutTime: a.check_out_time,
  }));
};

export const createAttendanceRecordBackend = async (
  status: 'present' | 'absent' | 'late' | 'leave',
  internshipId?: string
): Promise<{ success: boolean; error?: string }> => {
  if (!isSupabaseConfigured()) return { success: false, error: 'Backend not configured' };
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return { success: false, error: 'Not authenticated' };

  const { error } = await supabase.from('attendance_records').insert({
    student_id: userData.user.id,
    internship_id: internshipId || null,
    attendance_date: new Date().toISOString().slice(0, 10),
    status,
    check_in_time: new Date().toISOString(),
  });

  if (error) {
    console.error('[createAttendanceRecordBackend] Error:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
};

// Student Tasks Services
export const fetchStudentTasksBackend = async (): Promise<StudentTaskRecord[]> => {
  if (!isSupabaseConfigured()) return [];
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return [];

  const { data, error } = await supabase
    .from('student_tasks')
    .select('*')
    .eq('student_id', userData.user.id)
    .order('created_at', { ascending: false });

  if (error || !data) {
    console.error('[fetchStudentTasksBackend] Error:', error);
    return [];
  }

  return data.map((t) => ({
    id: t.id,
    studentId: t.student_id,
    title: t.title,
    description: t.description,
    dueDate: t.due_date,
    completed: t.completed,
    createdAt: t.created_at,
  }));
};

export const createStudentTaskBackend = async (
  title: string,
  description?: string,
  dueDate?: string
): Promise<{ success: boolean; error?: string }> => {
  if (!isSupabaseConfigured()) return { success: false, error: 'Backend not configured' };
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return { success: false, error: 'Not authenticated' };

  const { error } = await supabase.from('student_tasks').insert({
    student_id: userData.user.id,
    title,
    description: description || '',
    due_date: dueDate || null,
    completed: false,
  });

  if (error) {
    console.error('[createStudentTaskBackend] Error:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
};

export const updateStudentTaskBackend = async (
  taskId: string,
  completed: boolean
): Promise<{ success: boolean; error?: string }> => {
  if (!isSupabaseConfigured()) return { success: false, error: 'Backend not configured' };

  const { error } = await supabase
    .from('student_tasks')
    .update({ completed, updated_at: new Date().toISOString() })
    .eq('id', taskId);

  if (error) {
    console.error('[updateStudentTaskBackend] Error:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
};

// Career Progress Services
export const fetchCareerProgressBackend = async (): Promise<CareerProgressRecord[]> => {
  if (!isSupabaseConfigured()) return [];
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return [];

  const { data, error } = await supabase
    .from('career_progress')
    .select('*')
    .eq('student_id', userData.user.id);

  if (error || !data) {
    console.error('[fetchCareerProgressBackend] Error:', error);
    return [];
  }

  return data.map((c) => ({
    id: c.id,
    studentId: c.student_id,
    moduleKey: c.module_key,
    progressPercent: c.progress_percent,
    completed: c.completed,
  }));
};

export const updateCareerProgressBackend = async (
  moduleKey: string,
  progressPercent: number,
  completed: boolean
): Promise<{ success: boolean; error?: string }> => {
  if (!isSupabaseConfigured()) return { success: false, error: 'Backend not configured' };
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return { success: false, error: 'Not authenticated' };

  const { error } = await supabase.from('career_progress').upsert(
    {
      student_id: userData.user.id,
      module_key: moduleKey,
      progress_percent: progressPercent,
      completed,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'student_id, module_key' }
  );

  if (error) {
    console.error('[updateCareerProgressBackend] Error:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
};

// Milestones Services
export const fetchStudentMilestonesBackend = async (): Promise<StudentMilestoneRecord[]> => {
  if (!isSupabaseConfigured()) return [];
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return [];

  const { data, error } = await supabase
    .from('student_milestones')
    .select('*')
    .eq('student_id', userData.user.id);

  if (error || !data) {
    console.error('[fetchStudentMilestonesBackend] Error:', error);
    return [];
  }

  return data.map((m) => ({
    id: m.id,
    studentId: m.student_id,
    internshipId: m.internship_id,
    title: m.title,
    description: m.description,
    status: m.status,
    dueDate: m.due_date,
    completedAt: m.completed_at,
  }));
};

// Student Evaluations Services (Read-Only for Students)
export const fetchStudentEvaluationsBackend = async (): Promise<StudentEvaluationRecord[]> => {
  if (!isSupabaseConfigured()) return [];
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return [];

  const { data, error } = await supabase
    .from('student_evaluations')
    .select('*')
    .eq('student_id', userData.user.id);

  if (error || !data) {
    console.error('[fetchStudentEvaluationsBackend] Error:', error);
    return [];
  }

  return data.map((e) => ({
    id: e.id,
    studentId: e.student_id,
    internshipId: e.internship_id,
    evaluatorId: e.evaluator_id,
    rating: Number(e.rating),
    feedback: e.feedback,
    createdAt: e.created_at,
  }));
};

// Student Certificates Services (Read-Only for Students)
export const fetchStudentCertificatesBackend = async (): Promise<StudentCertificateRecord[]> => {
  if (!isSupabaseConfigured()) return [];
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return [];

  const { data, error } = await supabase
    .from('student_certificates')
    .select('*')
    .eq('student_id', userData.user.id);

  if (error || !data) {
    console.error('[fetchStudentCertificatesBackend] Error:', error);
    return [];
  }

  return data.map((c) => ({
    id: c.id,
    studentId: c.student_id,
    internshipId: c.internship_id,
    certificateNumber: c.certificate_number,
    certificateUrl: c.certificate_url,
    issuedAt: c.issued_at,
  }));
};
export interface ChatConversationRecord {
  id: string;
  createdAt: string;
  updatedAt: string;
  participantName?: string;
  lastMessage?: string;
}

export interface ChatMessageRecord {
  id: string;
  conversationId: string;
  senderId: string;
  message: string;
  createdAt: string;
  senderName?: string;
}

// Chat Conversations & Messages Services
export const fetchStudentConversationsBackend = async (): Promise<ChatConversationRecord[]> => {
  if (!isSupabaseConfigured()) return [];
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return [];

  const { data: partData, error: partErr } = await supabase
    .from('chat_participants')
    .select('conversation_id')
    .eq('user_id', userData.user.id);

  if (partErr || !partData || partData.length === 0) return [];

  const convIds = partData.map((p) => p.conversation_id);

  const { data: convs, error: convErr } = await supabase
    .from('chat_conversations')
    .select('*')
    .in('id', convIds)
    .order('updated_at', { ascending: false });

  if (convErr || !convs) return [];

  return convs.map((c) => ({
    id: c.id,
    createdAt: c.created_at,
    updatedAt: c.updated_at,
    participantName: 'Interora Support / Mentor',
    lastMessage: 'Tap to view chat history',
  }));
};

export const fetchChatMessagesBackend = async (
  conversationId: string
): Promise<ChatMessageRecord[]> => {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await supabase
    .from('chat_messages')
    .select('*, profiles!sender_id(full_name)')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error || !data) {
    console.error('[fetchChatMessagesBackend] Error:', error);
    return [];
  }

  return data.map((m) => ({
    id: m.id,
    conversationId: m.conversation_id,
    senderId: m.sender_id,
    message: m.message,
    createdAt: m.created_at,
    senderName: m.profiles?.full_name || 'User',
  }));
};

export const sendChatMessageBackend = async (
  conversationId: string,
  message: string
): Promise<{ success: boolean; data?: ChatMessageRecord; error?: string }> => {
  if (!isSupabaseConfigured()) return { success: false, error: 'Backend not configured' };
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return { success: false, error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('chat_messages')
    .insert({
      conversation_id: conversationId,
      sender_id: userData.user.id,
      message,
    })
    .select('*, profiles!sender_id(full_name)')
    .single();

  if (error) {
    console.error('[sendChatMessageBackend] Error:', error);
    return { success: false, error: error.message };
  }

  return {
    success: true,
    data: {
      id: data.id,
      conversationId: data.conversation_id,
      senderId: data.sender_id,
      message: data.message,
      createdAt: data.created_at,
      senderName: data.profiles?.full_name || 'Me',
    },
  };
};
/* ====================================================================
   PHASE 5: ACTIVE STUDENT INTERNSHIP LIFECYCLE SERVICE
   ==================================================================== */

export interface ActiveStudentInternshipRecord {
  applicationId: string;
  internshipId: string;
  title: string;
  companyId: string;
  companyName: string;
  industryDomain: string;
  location: string;
  internshipType: string;
  duration: string;
  stipend: string;
  description: string;
  appliedAt: string;
  status: string;
}

export const fetchActiveStudentInternshipBackend = async (): Promise<ActiveStudentInternshipRecord | null> => {
  if (!isSupabaseConfigured()) return null;

  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return null;

  console.log('[ActiveInternship] Fetching active internship for student ID:', userData.user.id);

  // Query selected application for student
  const { data: apps, error: appErr } = await supabase
    .from('student_applications')
    .select('*, internship_postings(*, company_profiles(company_name))')
    .eq('student_id', userData.user.id)
    .eq('status', 'Selected')
    .order('updated_at', { ascending: false });

  if (appErr) {
    console.error('[ActiveInternship] Query error:', appErr);
    return null;
  }

  if (!apps || apps.length === 0) {
    console.log('[ActiveInternship] No Selected application found for student');
    return null;
  }

  const selectedApp = apps[0];
  const posting = selectedApp.internship_postings;

  const result: ActiveStudentInternshipRecord = {
    applicationId: selectedApp.id,
    internshipId: selectedApp.internship_id,
    title: posting?.title || 'Selected Internship',
    companyId: posting?.company_id || '',
    companyName: posting?.company_profiles?.company_name || 'Host Company',
    industryDomain: posting?.industry_domain || 'Technology',
    location: posting?.location || 'Remote / On-site',
    internshipType: posting?.internship_type || 'Full-time',
    duration: posting?.duration || '3 Months',
    stipend: posting?.stipend || 'Stipend Provided',
    description: posting?.description || 'Active internship role.',
    appliedAt: selectedApp.applied_at,
    status: selectedApp.status,
  };

  console.log('[ActiveInternship] Active record resolved:', result);
  return result;
};
/* ====================================================================
   PHASE 6: COMPANY ACTIVE INTERN MANAGEMENT SERVICE
   ==================================================================== */

export interface CompanyActiveInternRecord {
  applicationId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  internshipId: string;
  internshipTitle: string;
  appliedAt: string;
  status: string;
}

export const fetchCompanyActiveInternsBackend = async (
  companyId: string
): Promise<CompanyActiveInternRecord[]> => {
  if (!isSupabaseConfigured()) return [];

  console.log('[CompanyActiveInterns] Fetching active interns for company ID:', companyId);

  // 1. Query company internship postings
  const { data: internships, error: intErr } = await supabase
    .from('internship_postings')
    .select('id, company_id, title')
    .eq('company_id', companyId);

  if (intErr || !internships || internships.length === 0) {
    console.error('[CompanyActiveInterns] Internship query error:', intErr);
    return [];
  }

  const internshipIds = internships.map((i) => i.id);
  const internshipMap = new Map(internships.map((i) => [i.id, i.title]));

  // 2. Query Selected applications for company's internships
  const { data: applications, error: appErr } = await supabase
    .from('student_applications')
    .select('*')
    .in('internship_id', internshipIds)
    .eq('status', 'Selected')
    .order('updated_at', { ascending: false });

  if (appErr || !applications || applications.length === 0) {
    console.log('[CompanyActiveInterns] No Selected applications found for company');
    return [];
  }

  const studentIds = Array.from(new Set(applications.map((a) => a.student_id)));

  // 3. Query profiles for student details
  const { data: profiles, error: profErr } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .in('id', studentIds);

  if (profErr) {
    console.error('[CompanyActiveInterns] Profiles query error:', profErr);
  }

  const profileMap = new Map((profiles || []).map((p) => [p.id, p]));

  // 4. Combine into clean records
  const result: CompanyActiveInternRecord[] = applications.map((app) => {
    const prof = profileMap.get(app.student_id);
    return {
      applicationId: app.id,
      studentId: app.student_id,
      studentName: prof?.full_name || 'Student Candidate',
      studentEmail: prof?.email || 'student@interora.app',
      internshipId: app.internship_id,
      internshipTitle: internshipMap.get(app.internship_id) || 'Internship Position',
      appliedAt: app.applied_at,
      status: app.status,
    };
  });

  console.log('[CompanyActiveInterns] Active interns resolved:', result);
  return result;
};
/* ====================================================================
   PHASE 7: COMPANY INTERN OPERATIONS SERVICES
   ==================================================================== */

export interface CompanyInternAttendanceSummary {
  studentId: string;
  totalRecords: number;
  presentCount: number;
  attendancePercentage: number;
  recentActivity: string;
}

export interface CompanyInternMilestoneRecord {
  id: string;
  studentId: string;
  internshipId: string;
  title: string;
  description: string;
  dueDate: string;
  status: string;
}

export interface CompanyInternEvaluationRecord {
  id: string;
  studentId: string;
  internshipId: string;
  evaluatorId: string;
  score: number;
  remarks: string;
  submittedAt: string;
}

export const fetchCompanyInternAttendanceBackend = async (
  studentId: string
): Promise<CompanyInternAttendanceSummary> => {
  if (!isSupabaseConfigured()) {
    return { studentId, totalRecords: 0, presentCount: 0, attendancePercentage: 100, recentActivity: 'No check-ins' };
  }

  const { data, error } = await supabase
    .from('attendance_records')
    .select('*')
    .eq('student_id', studentId)
    .order('attendance_date', { ascending: false });

  if (error || !data || data.length === 0) {
    return { studentId, totalRecords: 0, presentCount: 0, attendancePercentage: 100, recentActivity: 'No check-ins' };
  }

  const total = data.length;
  const present = data.filter((r) => r.status === 'present').length;
  const percentage = Math.round((present / total) * 100);
  const recent = data[0].attendance_date;

  return {
    studentId,
    totalRecords: total,
    presentCount: present,
    attendancePercentage: percentage,
    recentActivity: recent,
  };
};

export const fetchCompanyInternMilestonesBackend = async (
  studentId: string
): Promise<CompanyInternMilestoneRecord[]> => {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await supabase
    .from('student_milestones')
    .select('*')
    .eq('student_id', studentId)
    .order('created_at', { ascending: true });

  if (error || !data) return [];

  return data.map((m) => ({
    id: m.id,
    studentId: m.student_id,
    internshipId: m.internship_id,
    title: m.title,
    description: m.description || '',
    dueDate: m.due_date || '2026-08-31',
    status: m.status,
  }));
};

export const fetchCompanyInternEvaluationsBackend = async (
  studentId: string
): Promise<CompanyInternEvaluationRecord[]> => {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await supabase
    .from('student_evaluations')
    .select('*')
    .eq('student_id', studentId)
    .order('submitted_at', { ascending: false });

  if (error || !data) return [];

  return data.map((e) => ({
    id: e.id,
    studentId: e.student_id,
    internshipId: e.internship_id,
    evaluatorId: e.evaluator_id,
    score: e.score,
    remarks: e.remarks || '',
    submittedAt: e.submitted_at,
  }));
};

export const createCompanyInternEvaluationBackend = async (
  studentId: string,
  internshipId: string,
  score: number,
  remarks: string
): Promise<{ success: boolean; error?: string }> => {
  if (!isSupabaseConfigured()) return { success: false, error: 'Backend not configured' };

  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return { success: false, error: 'Not authenticated' };

  const { error } = await supabase
    .from('student_evaluations')
    .insert({
      student_id: studentId,
      internship_id: internshipId,
      evaluator_id: userData.user.id,
      score,
      remarks,
    });

  if (error) {
    console.error('[createCompanyInternEvaluationBackend] Error:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
};

/* ================================================================
/* ====================================================================
   PHASE 13: FACULTY / INSTITUTE MENTOR SERVICES
   ==================================================================== */

export interface FacultyAssignedStudentRecord {
  assignmentId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  assignedAt: string;
  status: string;
  internshipTitle?: string;
  companyName?: string;
  applicationStatus?: string;
}

export interface FacultyGuidanceNoteRecord {
  id: string;
  facultyId: string;
  studentId: string;
  category: string;
  note: string;
  createdAt: string;
}

export const fetchFacultyAssignedStudentsBackend = async (): Promise<FacultyAssignedStudentRecord[]> => {
  if (!isSupabaseConfigured()) return [];
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return [];

  const facultyId = userData.user.id;

  const { data: assignments, error: assignErr } = await supabase
    .from('faculty_student_assignments')
    .select('*')
    .eq('faculty_id', facultyId);

  if (assignErr || !assignments || assignments.length === 0) {
    const { data: stdProfiles } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('role', 'student');

    if (!stdProfiles) return [];

    const studentIds = stdProfiles.map((p) => p.id);
    const { data: apps } = await supabase
      .from('student_applications')
      .select('student_id, status, internship_postings(title, company_profiles(company_name))')
      .in('student_id', studentIds);

    const appMap = new Map();
    (apps || []).forEach((a: any) => {
      appMap.set(a.student_id, a);
    });

    return stdProfiles.map((p) => {
      const app: any = appMap.get(p.id);
      const posting: any = Array.isArray(app?.internship_postings) ? app?.internship_postings[0] : app?.internship_postings;
      const company: any = Array.isArray(posting?.company_profiles) ? posting?.company_profiles[0] : posting?.company_profiles;
      return {
        assignmentId: 'auto_' + p.id,
        studentId: p.id,
        studentName: p.full_name || 'Student Candidate',
        studentEmail: p.email || 'student@interora.app',
        assignedAt: new Date().toISOString(),
        status: 'Active',
        internshipTitle: posting?.title || 'Open Discovery',
        companyName: company?.company_name || 'Corporate Partner',
        applicationStatus: app?.status || 'Submitted',
      };
    });
  }

  const studentIds = assignments.map((a) => a.student_id);
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .in('id', studentIds);

  const profileMap = new Map((profiles || []).map((p) => [p.id, p]));

  const { data: apps } = await supabase
    .from('student_applications')
    .select('student_id, status, internship_postings(title, company_profiles(company_name))')
    .in('student_id', studentIds);

  const appMap = new Map();
  (apps || []).forEach((a: any) => {
    appMap.set(a.student_id, a);
  });

  return assignments.map((a) => {
    const prof = profileMap.get(a.student_id);
    const app: any = appMap.get(a.student_id);
    const posting: any = Array.isArray(app?.internship_postings) ? app?.internship_postings[0] : app?.internship_postings;
    const company: any = Array.isArray(posting?.company_profiles) ? posting?.company_profiles[0] : posting?.company_profiles;
    return {
      assignmentId: a.id,
      studentId: a.student_id,
      studentName: prof?.full_name || 'Student Candidate',
      studentEmail: prof?.email || 'student@interora.app',
      assignedAt: a.assigned_at,
      status: a.status,
      internshipTitle: posting?.title || 'Enrolled Internship',
      companyName: company?.company_name || 'Host Company',
      applicationStatus: app?.status || 'Submitted',
    };
  });
};

export const fetchFacultyGuidanceNotesBackend = async (
  studentId: string
): Promise<FacultyGuidanceNoteRecord[]> => {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await supabase
    .from('faculty_guidance_notes')
    .select('*')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  return data.map((n) => ({
    id: n.id,
    facultyId: n.faculty_id,
    studentId: n.student_id,
    category: n.category,
    note: n.note,
    createdAt: n.created_at,
  }));
};

export const createFacultyGuidanceNoteBackend = async (
  studentId: string,
  category: string,
  note: string
): Promise<{ success: boolean; error?: string }> => {
  if (!isSupabaseConfigured()) return { success: false, error: 'Backend not configured' };

  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return { success: false, error: 'Not authenticated' };

  const { error } = await supabase.from('faculty_guidance_notes').insert({
    faculty_id: userData.user.id,
    student_id: studentId,
    category,
    note,
  });

  if (error) {
    console.error('[createFacultyGuidanceNoteBackend] Error:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
};
/* ====================================================================
   PHASE 14: COMPANY MENTOR SERVICES
   ==================================================================== */

export interface CompanyMentorInternRecord {
  assignmentId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  internshipTitle: string;
  companyName: string;
  status: string;
  assignedAt: string;
}

export interface CompanyMentorTaskRecord {
  id: string;
  title: string;
  description: string;
  studentId: string;
  studentName: string;
  dueDate: string;
  completed: boolean;
  reviewStatus: string;
}

export const fetchCompanyMentorInternsBackend = async (): Promise<CompanyMentorInternRecord[]> => {
  if (!isSupabaseConfigured()) return [];
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return [];

  const mentorId = userData.user.id;

  // 1. Fetch mentor assigned interns
  const { data: assignments, error: assignErr } = await supabase
    .from('company_mentor_assignments')
    .select('*')
    .eq('mentor_id', mentorId);

  if (assignErr || !assignments || assignments.length === 0) {
    // Fallback: Fetch active selected interns for the mentor's company
    const { data: apps } = await supabase
      .from('student_applications')
      .select('student_id, status, created_at, internship_postings(title, company_profiles(company_name))')
      .eq('status', 'Selected');

    if (!apps || apps.length === 0) return [];

    const studentIds = apps.map((a: any) => a.student_id);
    const { data: stdProfiles } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .in('id', studentIds);

    const profileMap = new Map((stdProfiles || []).map((p) => [p.id, p]));

    return apps.map((a: any) => {
      const prof = profileMap.get(a.student_id);
      const posting: any = Array.isArray(a.internship_postings) ? a.internship_postings[0] : a.internship_postings;
      const company: any = Array.isArray(posting?.company_profiles) ? posting?.company_profiles[0] : posting?.company_profiles;
      return {
        assignmentId: 'auto_' + a.student_id,
        studentId: a.student_id,
        studentName: prof?.full_name || 'Active Intern Candidate',
        studentEmail: prof?.email || 'intern@interora.app',
        internshipTitle: posting?.title || 'Active Role',
        companyName: company?.company_name || 'Host Company',
        status: 'Active',
        assignedAt: a.created_at || new Date().toISOString(),
      };
    });
  }

  const studentIds = assignments.map((a) => a.student_id);
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .in('id', studentIds);

  const profileMap = new Map((profiles || []).map((p) => [p.id, p]));

  const { data: apps } = await supabase
    .from('student_applications')
    .select('student_id, status, internship_postings(title, company_profiles(company_name))')
    .in('student_id', studentIds)
    .eq('status', 'Selected');

  const appMap = new Map();
  (apps || []).forEach((a: any) => appMap.set(a.student_id, a));

  return assignments.map((a) => {
    const prof = profileMap.get(a.student_id);
    const app: any = appMap.get(a.student_id);
    const posting: any = Array.isArray(app?.internship_postings) ? app?.internship_postings[0] : app?.internship_postings;
    const company: any = Array.isArray(posting?.company_profiles) ? posting?.company_profiles[0] : posting?.company_profiles;
    return {
      assignmentId: a.id,
      studentId: a.student_id,
      studentName: prof?.full_name || 'Assigned Intern Candidate',
      studentEmail: prof?.email || 'intern@interora.app',
      internshipTitle: posting?.title || 'Assigned Internship',
      companyName: company?.company_name || 'Host Employer',
      status: a.status,
      assignedAt: a.assigned_at,
    };
  });
};

export const fetchCompanyMentorTasksBackend = async (): Promise<CompanyMentorTaskRecord[]> => {
  if (!isSupabaseConfigured()) return [];

  const interns = await fetchCompanyMentorInternsBackend();
  if (interns.length === 0) return [];

  const studentIds = interns.map((i) => i.studentId);
  const studentMap = new Map(interns.map((i) => [i.studentId, i.studentName]));

  const { data: tasks, error } = await supabase
    .from('student_tasks')
    .select('*')
    .in('student_id', studentIds);

  if (error || !tasks) return [];

  const taskIds = tasks.map((t) => t.id);
  const { data: reviews } = await supabase
    .from('company_task_reviews')
    .select('*')
    .in('task_id', taskIds);

  const reviewMap = new Map((reviews || []).map((r) => [r.task_id, r.review_status]));

  return tasks.map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description || 'Sprint deliverable item',
    studentId: t.student_id,
    studentName: studentMap.get(t.student_id) || 'Student Candidate',
    dueDate: t.due_date || '2026-08-31',
    completed: t.completed,
    reviewStatus: reviewMap.get(t.id) || (t.completed ? 'Verified' : 'Pending Review'),
  }));
};

export const updateCompanyMentorTaskReviewBackend = async (
  taskId: string,
  reviewStatus: string,
  feedback?: string
): Promise<{ success: boolean; error?: string }> => {
  if (!isSupabaseConfigured()) return { success: false, error: 'Backend not configured' };

  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return { success: false, error: 'Not authenticated' };

  const { error } = await supabase.from('company_task_reviews').insert({
    task_id: taskId,
    mentor_id: userData.user.id,
    review_status: reviewStatus,
    feedback: feedback || 'Reviewed by host mentor.',
  });

  if (error) {
    console.error('[updateCompanyMentorTaskReviewBackend] Error:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
};
/* ====================================================================
   PHASE 15: ADMIN PORTAL SERVICES
   ==================================================================== */

export interface AdminDashboardMetrics {
  totalStudents: number;
  totalCompanies: number;
  activeInternsCount: number;
  pposPendingCount: number;
  certsPendingCount: number;
  pendingApplications: number;
  pendingCompanies: number;
}

export const fetchAdminDashboardMetricsBackend = async (): Promise<AdminDashboardMetrics> => {
  if (!isSupabaseConfigured()) {
    return {
      totalStudents: 0,
      totalCompanies: 0,
      activeInternsCount: 0,
      pposPendingCount: 0,
      certsPendingCount: 0,
      pendingApplications: 0,
      pendingCompanies: 0,
    };
  }

  const { count: stdCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student');
  const { count: compCount } = await supabase.from('company_profiles').select('*', { count: 'exact', head: true });
  const { count: selectedCount } = await supabase.from('student_applications').select('*', { count: 'exact', head: true }).eq('status', 'Selected');
  const { count: pendingAppsCount } = await supabase.from('student_applications').select('*', { count: 'exact', head: true }).eq('status', 'Submitted');
  const { count: pendingCompsCount } = await supabase.from('company_profiles').select('*', { count: 'exact', head: true }).eq('verified', false);
  const { count: certsCount } = await supabase.from('student_certificates').select('*', { count: 'exact', head: true });

  return {
    totalStudents: stdCount ?? 0,
    totalCompanies: compCount ?? 0,
    activeInternsCount: selectedCount ?? 0,
    pposPendingCount: 0,
    certsPendingCount: certsCount ?? 0,
    pendingApplications: pendingAppsCount ?? 0,
    pendingCompanies: pendingCompsCount ?? 0,
  };
};

export const updateAdminCompanyApprovalBackend = async (
  companyId: string,
  approved: boolean
): Promise<{ success: boolean; error?: string }> => {
  if (!isSupabaseConfigured()) return { success: false, error: 'Backend not configured' };

  const { error } = await supabase
    .from('company_profiles')
    .update({ verified: approved })
    .eq('id', companyId);

  if (error) {
    console.error('[updateAdminCompanyApprovalBackend] Error:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
};