import { initialCompanyApplications } from '@/features/admin/AdminCompanies';
import { initialFacultyMentors } from '@/features/admin/AdminFacultyMentors';
import { apiClient, ApiClientError } from '@/services/api/apiClient';
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
  vacancies?: number;
  workMode?: 'on_site' | 'remote' | 'hybrid';
  tasks?: { id: string; title: string; description: string; dueDate?: string; priority?: string }[];
  milestones?: { id: string; title: string; goal: string; targetDate?: string }[];
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
  applicationCount?: number;
  tasks?: { id: string; title: string; description: string; dueDate: string; priority: string }[];
  milestones?: { id: string; title: string; goal: string; targetDate: string }[];
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
  facultyRating?: number;
  allocatorMatchScore?: number;
}

// 1. Student Registration (Express Backend)
export const registerStudentBackend = async (
  input: StudentRegistrationInput
): Promise<{ success: boolean; error?: string; requiresEmailConfirmation?: boolean }> => {
  try {
    await apiClient.post('/auth/register', {
      email: input.email.trim().toLowerCase(),
      password: input.password,
      fullName: input.fullName.trim(),
      role: 'student',
      departmentCode: input.department,
      phone: input.phone,
    });
    return { success: true, requiresEmailConfirmation: false };
  } catch (err: any) {
    const errorMsg = err.errors
      ? Object.values(err.errors).flat().join(', ')
      : err.message || 'Student registration failed.';
    return { success: false, error: errorMsg };
  }
};

// 2. Company Registration (Express Backend)
export const registerCompanyBackend = async (
  input: CompanyRegistrationInput
): Promise<{ success: boolean; error?: string; requiresEmailConfirmation?: boolean }> => {
  try {
    await apiClient.post('/auth/register', {
      email: input.officialEmail.trim().toLowerCase(),
      password: input.password,
      fullName: input.companyName.trim(),
      role: 'company',
      phone: input.phone,
    });
    return { success: true, requiresEmailConfirmation: false };
  } catch (err: any) {
    const errorMsg = err.errors
      ? Object.values(err.errors).flat().join(', ')
      : err.message || 'Company registration failed.';
    return { success: false, error: errorMsg };
  }
};

// 3. User Login & Authorization Gatekeeping (Express Backend)
export const loginUserBackend = async (
  email: string,
  password: string,
  _requestedRole?: UserRole
): Promise<LoginResult> => {
  try {
    const res = await apiClient.post<{
      id: string;
      email: string;
      fullName: string;
      role: UserRole;
      accountStatus: string;
    }>('/auth/login', {
      email: email.trim().toLowerCase(),
      password,
    });

    if (res.data) {
      return {
        success: true,
        role: res.data.role,
      };
    }
    return { success: false, error: 'Authentication failed.' };
  } catch (err: any) {
    const errorMsg = err.errors
      ? Object.values(err.errors).flat().join(', ')
      : err.message || 'Invalid email or password.';
    return { success: false, error: errorMsg };
  }
};

// 3.1 Session Fetching (Express Backend)
export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  accountStatus: string;
  departmentId?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
  studentProfile?: {
    studentId: string;
    course: string;
    batchYear: number;
    batchDivision?: string | null;
    currentSemester: number;
    cgpa?: number | string | null;
    skills?: any;
    resumeUrl?: string | null;
  } | null;
  companyProfile?: {
    id?: string;
    companyName: string;
    approvalStatus: string;
    verified: boolean;
    industryDomain?: string | null;
    companyAddress?: string | null;
    contactPerson?: string | null;
    officialEmail?: string | null;
    phone?: string | null;
    website?: string | null;
    description?: string | null;
  } | null;
  facultyProfile?: {
    facultyId: string;
    designation: string;
    cabinLocation?: string | null;
    officePhone?: string | null;
    department?: {
      id: string;
      name: string;
      code: string;
    } | null;
  } | null;
  departmentName?: string | null;
}

export const getCurrentUserBackend = async (): Promise<AuthUser | null> => {
  try {
    const res = await apiClient.get<AuthUser>('/auth/me');
    return res.data || null;
  } catch {
    return null;
  }
};

export interface UpdateStudentProfileInput {
  fullName?: string;
  phone?: string | null;
  avatarUrl?: string | null;
  course?: string;
  currentSemester?: number;
  batchYear?: number;
  batchDivision?: string | null;
  skills?: any;
  resumeUrl?: string | null;
}

export const updateStudentProfileBackend = async (
  input: UpdateStudentProfileInput
): Promise<{ success: boolean; data?: AuthUser; error?: string }> => {
  try {
    const res = await apiClient.patch<AuthUser>('/auth/me', input);
    return { success: true, data: res.data };
  } catch (err: any) {
    const errorMsg =
      err.response?.data?.message || err.message || 'Failed to update profile.';
    return { success: false, error: errorMsg };
  }
};

// 3.2 User Logout (Express Backend)
export const logoutUserBackend = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    await apiClient.post('/auth/logout');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};

// 3.3 Departments Read (Express + Prisma Backend)
export interface DepartmentRecord {
  id: string;
  code: string;
  name: string;
  program: string;
  headOfDepartmentId: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export const fetchDepartmentsBackend = async (): Promise<DepartmentRecord[]> => {
  try {
    const res = await apiClient.get<DepartmentRecord[]>('/departments');
    return res.data || [];
  } catch (err: any) {
    console.error('[fetchDepartmentsBackend] Failed to fetch departments:', err);
    return [];
  }
};


// 4. Fetch Company Applications for Admin Dashboard
export const fetchCompanyApplicationsBackend = async (): Promise<CompanyApplication[]> => {
  try {
    const res = await apiClient.get<CompanyApplication[]>('/admin/companies');
    return res.data || [];
  } catch (err: any) {
    console.error('[fetchCompanyApplicationsBackend] Error:', err);
    return [];
  }
};

// Helper: Trigger Company Email (Handled directly via Express backend)
export const triggerCompanyEmailFunction = async (
  _recipientEmail: string,
  _companyName: string,
  _type: 'approved' | 'rejected',
  _rejectionReason?: string
): Promise<{ success: boolean; error?: string }> => {
  return { success: true };
};

// 5. Admin Approve Company
export const approveCompanyBackend = async (
  companyId: string,
  _companyName?: string,
  _officialEmail?: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    await apiClient.patch(`/admin/companies/${companyId}/approval`);
    return { success: true };
  } catch (err: any) {
    console.error('[approveCompanyBackend] Error:', err);
    return { success: false, error: err.message || 'Failed to approve company.' };
  }
};

// 6. Admin Reject Company
export const rejectCompanyBackend = async (
  companyId: string,
  reason: string = 'Criteria not met',
  _companyName?: string,
  _officialEmail?: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    await apiClient.patch(`/admin/companies/${companyId}/rejection`, { reason });
    return { success: true };
  } catch (err: any) {
    console.error('[rejectCompanyBackend] Error:', err);
    return { success: false, error: err.message || 'Failed to reject company.' };
  }
};

// 7. Explicit Send Company Invitation Email backend method (Express Backend)
export const sendCompanyInvitationBackend = async (
  companyId: string,
  companyName: string,
  officialEmail: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    await apiClient.post(`/admin/companies/${companyId}/invite`, {
      companyName,
      officialEmail,
    });
    return { success: true };
  } catch (err: any) {
    console.error('[sendCompanyInvitationBackend] Error:', err);
    return { success: false, error: err.message || 'Failed to send company invitation.' };
  }
};

/* ====================================================================
   PHASE 2 & PHASE 3: INTERNSHIP POSTINGS & STUDENT APPLICATIONS
   ==================================================================== */

// Create Internship Posting (Express Backend)
export const createInternshipPostingBackend = async (
  input: InternshipPostingInput
): Promise<{ success: boolean; data?: InternshipPostingRecord; error?: string }> => {
  try {
    const workMode = input.workMode || (
      input.location?.toLowerCase().includes('remote')
        ? 'remote'
        : input.location?.toLowerCase().includes('on-site') || input.location?.toLowerCase().includes('onsite')
        ? 'on_site'
        : 'hybrid'
    );
    const internshipType = input.internshipType?.toLowerCase().includes('part') ? 'part_time' : 'full_time';
    const status = input.status === 'published' ? 'open' : (input.status || 'open');
    const vacancies = typeof input.vacancies === 'number' && input.vacancies > 0 ? input.vacancies : 2;

    const payload = {
      title: input.title.trim(),
      description: input.description.trim(),
      industryDomain: input.industryDomain.trim(),
      location: input.location?.trim() || 'Remote / On-site',
      workMode,
      internshipType,
      duration: input.duration?.trim() || '3 Months',
      stipend: input.stipend?.trim() || 'Unpaid / Paid',
      eligibility: input.eligibility?.trim() || 'All Eligible',
      vacancies,
      skills: input.skills || [],
      applicationDeadline: input.applicationDeadline || null,
      status,
    };

    const res = await apiClient.post<any>('/postings', payload);
    if (!res.data) {
      return { success: false, error: 'Failed to create internship posting.' };
    }

    const createdPosting = res.data;

    // Create task templates if provided
    if (input.tasks && input.tasks.length > 0) {
      for (const task of input.tasks) {
        if (!task.title) continue;
        try {
          const priority = (task.priority?.toLowerCase() || 'medium') as 'low' | 'medium' | 'high' | 'urgent';
          const expectedDaysMatch = task.dueDate?.match(/\d+/);
          const expectedDays = expectedDaysMatch ? parseInt(expectedDaysMatch[0], 10) : undefined;
          await apiClient.post(`/postings/${createdPosting.id}/task-templates`, {
            title: task.title,
            description: task.description || undefined,
            priority: ['low', 'medium', 'high', 'urgent'].includes(priority) ? priority : 'medium',
            expectedDays: expectedDays && expectedDays > 0 ? expectedDays : undefined,
          });
        } catch (tErr) {
          console.warn('[createInternshipPostingBackend] Task template create error:', tErr);
        }
      }
    }

    // Create milestone templates if provided
    if (input.milestones && input.milestones.length > 0) {
      let seq = 1;
      for (const m of input.milestones) {
        if (!m.title) continue;
        try {
          await apiClient.post(`/postings/${createdPosting.id}/milestone-templates`, {
            title: m.title,
            description: m.goal || undefined,
            sequenceOrder: seq++,
          });
        } catch (mErr) {
          console.warn('[createInternshipPostingBackend] Milestone template create error:', mErr);
        }
      }
    }

    return {
      success: true,
      data: {
        id: createdPosting.id,
        companyId: createdPosting.companyId || createdPosting.company?.id || '',
        companyName: createdPosting.company?.companyName || 'Company',
        title: createdPosting.title,
        description: createdPosting.description,
        industryDomain: createdPosting.industryDomain,
        location: createdPosting.location,
        internshipType: createdPosting.internshipType === 'part_time' ? 'Part-time' : 'Full-time',
        duration: createdPosting.duration,
        stipend: createdPosting.stipend,
        eligibility: createdPosting.eligibility,
        skills: createdPosting.skills || [],
        applicationDeadline: createdPosting.applicationDeadline || '',
        status: createdPosting.status,
        createdAt: createdPosting.createdAt,
        applicationCount: 0,
      },
    };
  } catch (err: any) {
    const errorMsg = err.errors
      ? Object.values(err.errors).flat().join(', ')
      : err.message || 'Failed to create internship posting.';
    return { success: false, error: errorMsg };
  }
};

// Update Internship Posting (Express Backend)
export const updateInternshipPostingBackend = async (
  postingId: string,
  input: Partial<InternshipPostingInput>
): Promise<{ success: boolean; error?: string }> => {
  try {
    const payload: Record<string, any> = {};
    if (input.title !== undefined) payload.title = input.title.trim();
    if (input.description !== undefined) payload.description = input.description.trim();
    if (input.industryDomain !== undefined) payload.industryDomain = input.industryDomain.trim();
    if (input.location !== undefined) payload.location = input.location.trim();
    if (input.duration !== undefined) payload.duration = input.duration.trim();
    if (input.stipend !== undefined) payload.stipend = input.stipend.trim();
    if (input.eligibility !== undefined) payload.eligibility = input.eligibility.trim();
    if (input.skills !== undefined) payload.skills = input.skills;
    if (input.applicationDeadline !== undefined) {
      payload.applicationDeadline = input.applicationDeadline || null;
    }
    if (input.status !== undefined) {
      payload.status = input.status === 'published' ? 'open' : input.status;
    }
    if (input.workMode !== undefined) payload.workMode = input.workMode;
    if (input.internshipType !== undefined) {
      payload.internshipType = input.internshipType.toLowerCase().includes('part') ? 'part_time' : 'full_time';
    }
    if (input.vacancies !== undefined) payload.vacancies = input.vacancies;

    await apiClient.patch(`/postings/${postingId}`, payload);
    return { success: true };
  } catch (err: any) {
    const errorMsg = err.errors
      ? Object.values(err.errors).flat().join(', ')
      : err.message || 'Failed to update internship posting.';
    return { success: false, error: errorMsg };
  }
};

// Delete Internship Posting (Express Backend)
export const deleteInternshipPostingBackend = async (
  postingId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    await apiClient.delete(`/postings/${postingId}`);
    return { success: true };
  } catch (err: any) {
    const errorMsg = err.errors
      ? Object.values(err.errors).flat().join(', ')
      : err.message || 'Failed to delete internship posting.';
    return { success: false, error: errorMsg };
  }
};

// Fetch Internship Postings (Express Backend)
export const fetchInternshipPostingsBackend = async (
  companyId?: string
): Promise<InternshipPostingRecord[]> => {
  try {
    const params: Record<string, string> = {};
    if (companyId) {
      params.scope = 'mine';
      params.companyId = companyId;
    }
    const res = await apiClient.get<any[]>('/postings', { params });
    if (!res.data || !Array.isArray(res.data)) return [];

    return res.data.map((item) => ({
      id: item.id,
      companyId: item.companyId || item.company?.id || '',
      companyName: item.company?.companyName || 'Company',
      title: item.title,
      description: item.description,
      industryDomain: item.industryDomain,
      location: item.location || 'Remote / On-site',
      internshipType: item.internshipType === 'part_time' ? 'Part-time' : 'Full-time',
      duration: item.duration,
      stipend: item.stipend,
      eligibility: item.eligibility,
      skills: item.skills || [],
      applicationDeadline: item.applicationDeadline || '',
      status: item.status,
      createdAt: item.createdAt,
      applicationCount: item._count?.applications || 0,
      tasks: (item.taskTemplates || []).map((t: any) => ({
        id: t.id,
        title: t.title,
        description: t.description || '',
        dueDate: t.expectedDays ? `${t.expectedDays} days` : '',
        priority: t.priority ? t.priority.charAt(0).toUpperCase() + t.priority.slice(1) : 'Medium',
      })),
      milestones: (item.milestoneTemplates || []).map((m: any) => ({
        id: m.id,
        title: m.title,
        goal: m.description || '',
        targetDate: `Order ${m.sequenceOrder}`,
      })),
    }));
  } catch (err: any) {
    console.error('[fetchInternshipPostingsBackend] Error:', err);
    return [];
  }
};

// Alias for Slice 20 Admin Postings lookup
export const fetchPostingsBackend = fetchInternshipPostingsBackend;

// Create Student Application (Express Backend: POST /api/applications)
export const createStudentApplicationBackend = async (
  internshipId: string,
  coverLetter?: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    await apiClient.post('/applications', {
      internshipId,
      coverLetter: coverLetter || undefined,
    });
    return { success: true };
  } catch (err: any) {
    console.error('[createStudentApplicationBackend] Error:', err);
    const errorMsg = err.errors
      ? Object.values(err.errors).flat().join(', ')
      : err.message || 'Failed to submit application.';
    return { success: false, error: errorMsg };
  }
};


// Fetch Student Applications (Express Backend: GET /api/applications/my)
export const fetchStudentApplicationsBackend = async (): Promise<StudentApplicationRecord[]> => {
  try {
    const res = await apiClient.get<any[]>('/applications/my');
    if (!res.data || !Array.isArray(res.data)) return [];

    return res.data.map((item) => ({
      id: item.id,
      internshipId: item.internshipId,
      studentId: item.studentId,
      status: mapBackendApplicationStatusToUi(item.status),
      coverLetter: item.coverLetter || undefined,
      appliedAt: item.appliedAt,
      internshipTitle: item.internship?.title || 'Internship Position',
      companyName: item.internship?.company?.companyName || 'Corporate Partner',
      facultyRating: item.facultyRating ?? undefined,
      allocatorMatchScore: item.allocatorMatchScore ?? undefined,
    }));
  } catch (err: any) {
    console.error('[fetchStudentApplicationsBackend] Error:', err);
    return [];
  }
};

// Fetch Single Application Details (Express Backend: GET /api/applications/:id)
export const fetchApplicationDetailsBackend = async (id: string): Promise<any | null> => {
  try {
    const res = await apiClient.get<any>(`/applications/${id}`);
    const item = res.data;
    if (!item) return null;

    const appliedDateStr = item.appliedAt ? new Date(item.appliedAt).toISOString().slice(0, 10) : 'Recent';
    const updatedDateStr = item.updatedAt ? new Date(item.updatedAt).toISOString().slice(0, 10) : 'Recent';
    const uiStatus = mapBackendApplicationStatusToUi(item.status);

    const isFacultyDone = ['faculty_approved', 'shortlisted', 'selected'].includes(item.status);
    const isFacultyCurrent = item.status === 'faculty_review';
    const isCompanyDone = ['selected'].includes(item.status);
    const isCompanyCurrent = ['shortlisted', 'faculty_approved'].includes(item.status);
    const isSelected = item.status === 'selected';
    const isRejected = item.status === 'rejected' || item.status === 'faculty_rejected';

    return {
      id: item.id,
      internshipId: item.internshipId,
      title: item.internship?.title || 'Internship Position',
      companyName: item.internship?.company?.companyName || 'Corporate Partner',
      location: item.internship?.location || 'Remote / On-site',
      workMode: item.internship?.workMode === 'on_site' ? 'On-site' : item.internship?.workMode === 'hybrid' ? 'Hybrid' : 'Remote',
      duration: item.internship?.duration || '3 Months',
      stipend: item.internship?.stipend || 'Provided',
      appliedAt: appliedDateStr,
      lastUpdated: updatedDateStr,
      status: uiStatus,
      applicantName: item.student?.profile?.fullName || 'Student Applicant',
      applicantEmail: item.student?.profile?.email || 'student@interora.app',
      resumeFileName: item.resumeUrl ? (item.resumeUrl.split('/').pop() || 'Student_Resume.pdf') : 'Student_Resume.pdf',
      coverLetter: item.coverLetter || 'No cover letter provided.',
      submittedSkills: item.student?.skills || ['JavaScript', 'TypeScript', 'React'],
      timeline: [
        {
          title: 'Application Submitted',
          description: 'Application received and registered in placement system.',
          date: appliedDateStr,
          status: 'completed' as const,
        },
        {
          title: 'Faculty Verification',
          description: 'Academic advisor verification and eligibility clearance.',
          date: item.facultyReviewedAt ? new Date(item.facultyReviewedAt).toISOString().slice(0, 10) : (isFacultyDone ? appliedDateStr : 'Pending'),
          status: (isFacultyDone ? 'completed' : isFacultyCurrent ? 'current' : 'upcoming') as 'completed' | 'current' | 'upcoming',
        },
        {
          title: 'Company Assessment',
          description: 'Technical and portfolio review by host company mentors.',
          date: isCompanyDone ? updatedDateStr : isCompanyCurrent ? 'In Review' : 'Upcoming',
          status: (isCompanyDone ? 'completed' : isCompanyCurrent ? 'current' : 'upcoming') as 'completed' | 'current' | 'upcoming',
        },
        {
          title: 'Final Selection Decision',
          description: 'Confirmation and internship offer issuance.',
          date: isSelected ? updatedDateStr : isRejected ? 'Concluded' : 'Upcoming',
          status: (isSelected ? 'completed' : isRejected ? 'current' : 'upcoming') as 'completed' | 'current' | 'upcoming',
        },
      ],
    };
  } catch (err: any) {
    console.error(`[fetchApplicationDetailsBackend] Error fetching ${id}:`, err);
    return null;
  }
};

// Student Withdraw Application (Express Backend: PATCH /api/applications/:id/withdraw)
export const withdrawStudentApplicationBackend = async (
  applicationId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    await apiClient.patch(`/applications/${applicationId}/withdraw`);
    return { success: true };
  } catch (err: any) {
    console.error('[withdrawStudentApplicationBackend] Error:', err);
    const errorMsg = err.errors
      ? Object.values(err.errors).flat().join(', ')
      : err.message || 'Failed to withdraw application.';
    return { success: false, error: errorMsg };
  }
};

// Fetch Single Posting By ID (Express Backend: GET /api/postings/:id)
export const fetchInternshipPostingByIdBackend = async (
  postingId: string
): Promise<any | null> => {
  try {
    const res = await apiClient.get<any>(`/postings/${postingId}`);
    const item = res.data;
    if (!item) return null;

    return {
      id: item.id,
      companyId: item.companyId || item.company?.id || '',
      companyName: item.company?.companyName || 'Host Company',
      title: item.title,
      description: item.description,
      industryDomain: item.industryDomain,
      location: item.location || 'Remote / On-site',
      workMode: item.workMode ? (item.workMode === 'on_site' ? 'On-site' : item.workMode === 'remote' ? 'Remote' : 'Hybrid') : 'Remote',
      internshipType: item.internshipType === 'part_time' ? 'Part-time' : 'Full-time',
      duration: item.duration || '3 Months',
      stipend: item.stipend || 'Provided',
      eligibility: item.eligibility || 'Open to all eligible students',
      skills: item.skills || [],
      applicationDeadline: item.applicationDeadline || '',
      status: item.status,
      postedDate: item.createdAt ? new Date(item.createdAt).toISOString().slice(0, 10) : 'Recent',
      responsibilities: item.taskTemplates?.length
        ? item.taskTemplates.map((t: any) => t.title)
        : [
            'Deliver assigned engineering tickets following repository patterns',
            'Participate in sprint standups and technical code reviews',
            'Document work logs and milestones throughout internship',
          ],
      requirements: item.skills?.length
        ? item.skills.map((s: string) => `Demonstrated competency or familiarity with ${s}`)
        : [
            'Solid computer science and software development foundations',
            'Willingness to learn modern framework patterns and best practices',
            'Effective collaboration and communication skills',
          ],
      learningOutcomes: [
        'Hands-on full-stack development experience in production codebase',
        'Direct mentorship and task guidance from assigned industry mentors',
        'Institutional credit and verified completion certificate',
      ],
    };
  } catch (err: any) {
    console.error(`[fetchInternshipPostingByIdBackend] Error for ${postingId}:`, err);
    return null;
  }
};

// Fetch Single Task Details By ID (Express Backend: GET /api/tasks/:id)
export const fetchTaskDetailsBackend = async (
  taskId: string
): Promise<any | null> => {
  try {
    const res = await apiClient.get<any>(`/tasks/${taskId}`);
    const t = res.data;
    if (!t) return null;

    const isCompleted = t.status === 'submitted' || t.status === 'reviewed' || t.status === 'closed';

    return {
      id: t.id,
      title: t.title,
      category: t.assignment?.internship?.title || 'Active Project Task',
      status: t.status === 'in_progress' ? 'In Progress' : isCompleted ? 'Completed' : 'To Do',
      priority: t.priority ? t.priority.charAt(0).toUpperCase() + t.priority.slice(1) : 'Medium',
      dueDate: t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'Upcoming',
      assignedDate: t.createdAt ? new Date(t.createdAt).toLocaleDateString() : 'Recently',
      estimatedHours: 4,
      actualHours: isCompleted ? 4 : 0,
      description: t.description || 'Assigned project task.',
      assignedBy: t.assignedBy?.fullName || 'Assigned Mentor',
      notes: t.submissions?.[0]?.submissionText || (t.requiredSkills?.length ? `Required skills: ${t.requiredSkills.join(', ')}` : undefined),
      completedAt: isCompleted && t.submissions?.[0]?.submittedAt ? new Date(t.submissions[0].submittedAt).toLocaleString() : undefined,
    };
  } catch (err: any) {
    console.error(`[fetchTaskDetailsBackend] Error for ${taskId}:`, err);
    return null;
  }
};

// Fetch Student Placement Readiness (Express Backend: GET /api/placement-readiness/latest)
export const fetchStudentPlacementReadinessBackend = async (): Promise<any | null> => {
  try {
    const res = await apiClient.get<any>('/placement-readiness/latest');
    return res.data || null;
  } catch (err: any) {
    try {
      const calcRes = await apiClient.post<any>('/placement-readiness/calculate', {});
      return calcRes.data || null;
    } catch {
      return null;
    }
  }
};


// Status mapping helpers between Express/Prisma (lowercase enum) and UI (Title Case)
export const mapBackendApplicationStatusToUi = (status?: string): string => {
  switch (status?.toLowerCase()) {
    case 'submitted':
      return 'Submitted';
    case 'shortlisted':
      return 'Shortlisted';
    case 'selected':
      return 'Selected';
    case 'rejected':
      return 'Rejected';
    case 'faculty_review':
      return 'Faculty Review';
    case 'faculty_approved':
      return 'Faculty Approved';
    case 'faculty_rejected':
      return 'Faculty Rejected';
    case 'withdrawn':
      return 'Withdrawn';
    default:
      return status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Submitted';
  }
};

export const mapUiApplicationStatusToBackend = (status: string): string => {
  switch (status?.toLowerCase()) {
    case 'submitted':
      return 'submitted';
    case 'shortlisted':
      return 'shortlisted';
    case 'selected':
      return 'selected';
    case 'rejected':
      return 'rejected';
    case 'faculty_review':
    case 'faculty review':
      return 'faculty_review';
    case 'faculty_approved':
    case 'faculty approved':
      return 'faculty_approved';
    case 'faculty_rejected':
    case 'faculty rejected':
      return 'faculty_rejected';
    case 'withdrawn':
      return 'withdrawn';
    default:
      return status?.toLowerCase() || 'submitted';
  }
};

// Fetch Company Applicants (Express + Prisma Backend)
export const fetchCompanyApplicantsBackend = async (
  companyId?: string
): Promise<StudentApplicationRecord[]> => {
  try {
    // 1. Fetch postings owned by authenticated company
    const params: Record<string, string> = { scope: 'mine' };
    if (companyId) {
      params.companyId = companyId;
    }
    const postingsRes = await apiClient.get<any[]>('/postings', { params });
    const postings = postingsRes.data;

    if (!postings || !Array.isArray(postings) || postings.length === 0) {
      return [];
    }

    // 2. Fetch applications for each posting
    const appResults = await Promise.all(
      postings.map(async (posting) => {
        try {
          const res = await apiClient.get<any[]>(`/postings/${posting.id}/applications`);
          const apps = res.data || [];
          return apps.map((app) => ({
            id: app.id,
            internshipId: app.internshipId,
            studentId: app.studentId,
            status: mapBackendApplicationStatusToUi(app.status),
            coverLetter: app.coverLetter || undefined,
            appliedAt: app.appliedAt,
            internshipTitle: posting.title || 'Internship Position',
            companyName: posting.company?.companyName || 'Company',
            studentName: app.student?.profile?.fullName || 'Student Candidate',
            facultyRating:
              app.facultyRating !== null && app.facultyRating !== undefined
                ? Number(app.facultyRating)
                : undefined,
            allocatorMatchScore:
              app.allocatorMatchScore !== null && app.allocatorMatchScore !== undefined
                ? Number(app.allocatorMatchScore)
                : undefined,
          }));
        } catch (err) {
          console.error(`[fetchCompanyApplicantsBackend] Error fetching applications for posting ${posting.id}:`, err);
          return [];
        }
      })
    );

    // 3. Combine and sort by application date desc
    const allApps = appResults
      .flat()
      .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());

    return allApps;
  } catch (err) {
    console.error('[fetchCompanyApplicantsBackend] Error:', err);
    return [];
  }
};

// Update Application Status (Express Backend)
export const updateApplicationStatusBackend = async (
  applicationId: string,
  newStatus: string,
  companyRemarks?: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const backendStatus = mapUiApplicationStatusToBackend(newStatus);
    await apiClient.patch(`/applications/${applicationId}/status`, {
      status: backendStatus,
      ...(companyRemarks !== undefined ? { companyRemarks } : {}),
    });
    return { success: true };
  } catch (err: any) {
    console.error('[updateApplicationStatusBackend] Error:', err);
    const errorMsg =
      err.errors
        ? Object.values(err.errors).flat().join(', ')
        : err.message || 'Failed to update application status.';
    return { success: false, error: errorMsg };
  }
};
/* ====================================================================
   PHASE 4: STUDENT PERSISTENCE FEATURE SERVICES
   ==================================================================== */

export interface AttendanceRecord {
  id: string;
  studentId: string;
  internshipId?: string;
  attendanceDate: string;
  status: 'present' | 'absent' | 'late' | 'half_day' | 'leave';
  checkInTime?: string;
  checkOutTime?: string;
  checkInPhotoUrl?: string;
  checkInLat?: number;
  checkInLng?: number;
  checkOutPhotoUrl?: string;
  checkOutLat?: number;
  checkOutLng?: number;
  locationAddress?: string;
  workingHours?: string;
}

export interface StudentTaskRecord {
  id: string;
  studentId: string;
  title: string;
  description?: string;
  dueDate?: string;
  completed: boolean;
  createdAt: string;
  status?: string;
  priority?: string;
  assignmentId?: string;
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


export const uploadAttendancePhotoBackend = async (
  blob: Blob,
  actionType: 'check_in' | 'check_out'
): Promise<string> => {
  try {
    const formData = new FormData();
    const file = new File([blob], `${actionType}_${Date.now()}.jpg`, { type: 'image/jpeg' });
    formData.append('photo', file);

    const res = await apiClient.post<{ photoUrl: string }>('/uploads/attendance-photo', formData);
    return res.data?.photoUrl || '';
  } catch (err) {
    console.warn('[uploadAttendancePhotoBackend] Handled:', err);
    return '';
  }
};

// Attendance Services (Express Backend)
export const fetchStudentAttendanceBackend = async (): Promise<AttendanceRecord[]> => {
  try {
    const res = await apiClient.get<any[]>('/attendance/my');
    const records = res.data || [];
    return records.map((a: any) => {
      let dateStr = '';
      if (a.attendanceDate) {
        dateStr = typeof a.attendanceDate === 'string'
          ? a.attendanceDate.slice(0, 10)
          : new Date(a.attendanceDate).toISOString().slice(0, 10);
      }
      return {
        id: a.id,
        studentId: a.assignment?.studentId || a.studentId || '',
        internshipId: a.assignmentId || a.internshipId || '',
        attendanceDate: dateStr,
        status: a.status,
        checkInTime: a.checkInTime ? new Date(a.checkInTime).toISOString() : undefined,
        checkOutTime: a.checkOutTime ? new Date(a.checkOutTime).toISOString() : undefined,
        checkInPhotoUrl: a.checkInPhotoUrl || undefined,
        checkInLat: a.checkInLat ?? undefined,
        checkInLng: a.checkInLng ?? undefined,
        checkOutPhotoUrl: a.checkOutPhotoUrl || undefined,
        checkOutLat: a.checkOutLat ?? undefined,
        checkOutLng: a.checkOutLng ?? undefined,
        locationAddress: a.checkInAddress || a.checkOutAddress || a.locationAddress || undefined,
        workingHours: a.workingHours ? `${a.workingHours} hrs` : undefined,
      };
    });
  } catch (err: any) {
    console.error('[fetchStudentAttendanceBackend] Error:', err);
    return [];
  }
};

export const createAttendanceRecordBackend = async (
  status: 'present' | 'absent' | 'late' | 'half_day' | 'leave',
  photoBlob?: Blob,
  coords?: { latitude: number; longitude: number; address?: string },
  assignmentId?: string
): Promise<{ success: boolean; data?: any; error?: string }> => {
  let photoUrl = '';
  if (photoBlob) {
    try {
      photoUrl = await uploadAttendancePhotoBackend(photoBlob, 'check_in');
    } catch (err) {
      console.warn('[createAttendanceRecordBackend] Photo upload notice:', err);
    }
  }

  try {
    const res = await apiClient.post<any>('/attendance/check-in', {
      assignmentId: assignmentId || undefined,
      checkInPhotoUrl: photoUrl || undefined,
      checkInLat: coords?.latitude,
      checkInLng: coords?.longitude,
      checkInAddress: coords?.address,
    });
    return {
      success: true,
      data: res.data,
    };
  } catch (err: any) {
    const errorMsg =
      err.response?.data?.message || err.message || 'Attendance check-in failed.';
    return {
      success: false,
      error: errorMsg,
    };
  }
};

// Student Tasks Services (Express Backend)
export const fetchStudentTasksBackend = async (): Promise<StudentTaskRecord[]> => {
  try {
    const res = await apiClient.get<any>('/tasks');
    const tasks: any[] = Array.isArray(res.data) ? res.data : (res.data?.data || []);
    return tasks.map((t: any) => ({
      id: t.id,
      studentId: t.assignment?.studentId || '',
      title: t.title,
      description: t.description || '',
      dueDate: t.dueDate ? new Date(t.dueDate).toISOString().slice(0, 10) : undefined,
      completed:
        (t.status || '').toLowerCase() === 'completed' ||
        (t.status || '').toLowerCase() === 'submitted' ||
        (t.status || '').toLowerCase() === 'closed',
      createdAt: t.createdAt ? new Date(t.createdAt).toISOString() : new Date().toISOString(),
      status: t.status,
      priority: t.priority,
      assignmentId: t.assignmentId,
    }));
  } catch (err: any) {
    console.error('[fetchStudentTasksBackend] Express fetch error:', err);
    return [];
  }
};

export const updateStudentTaskStatusBackend = async (
  taskId: string,
  status: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    await apiClient.patch(`/tasks/${taskId}/status`, { status });
    return { success: true };
  } catch (err: any) {
    console.error('[updateStudentTaskStatusBackend] Error:', err);
    const errorMsg =
      err.response?.data?.message || err.message || 'Failed to update task status.';
    return { success: false, error: errorMsg };
  }
};

export const createStudentTaskSubmissionBackend = async (
  taskId: string,
  proofUrl: string,
  submissionText?: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    await apiClient.post(`/tasks/${taskId}/submissions`, {
      proofUrl,
      submissionText: submissionText || null,
    });
    return { success: true };
  } catch (err: any) {
    console.error('[createStudentTaskSubmissionBackend] Error:', err);
    const errorMsg =
      err.response?.data?.message || err.message || 'Failed to submit task proof.';
    return { success: false, error: errorMsg };
  }
};

export const updateStudentTaskBackend = async (
  taskId: string,
  completed: boolean
): Promise<{ success: boolean; error?: string }> => {
  try {
    if (completed) {
      const subRes = await createStudentTaskSubmissionBackend(
        taskId,
        `https://interora.app/submissions/${taskId}`,
        'Task completed and deliverables submitted by student.'
      );
      if (subRes.success) return { success: true };
      return await updateStudentTaskStatusBackend(taskId, 'in_progress');
    } else {
      return await updateStudentTaskStatusBackend(taskId, 'in_progress');
    }
  } catch (err: any) {
    console.error('[updateStudentTaskBackend] Error:', err);
    return { success: false, error: err.message || 'Failed to update task.' };
  }
};

export const createStudentTaskBackend = async (
  title: string,
  description?: string,
  dueDate?: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    console.warn('[createStudentTaskBackend] Task assignment is managed by host company mentors.');
    return {
      success: false,
      error: 'Task creation is managed by host company mentors.',
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};


// Milestones Services (Express Backend)
export const fetchStudentMilestonesBackend = async (): Promise<StudentMilestoneRecord[]> => {
  try {
    const res = await apiClient.get<any>('/milestones');
    const items: any[] = Array.isArray(res.data) ? res.data : (res.data?.data || []);
    return items.map((m: any) => ({
      id: m.id,
      studentId: m.assignment?.studentId || '',
      internshipId: m.assignment?.internshipId || '',
      title: m.title,
      description: m.description || '',
      status: m.status,
      dueDate: m.targetDate ? new Date(m.targetDate).toISOString().slice(0, 10) : undefined,
      completedAt: m.verifiedAt ? new Date(m.verifiedAt).toISOString() : undefined,
    }));
  } catch (err: any) {
    console.error('[fetchStudentMilestonesBackend] Express error:', err);
    return [];
  }
};

// Student Evaluations Services (Express Backend)
export const fetchStudentEvaluationsBackend = async (): Promise<StudentEvaluationRecord[]> => {
  try {
    const res = await apiClient.get<any>('/evaluations');
    const items: any[] = Array.isArray(res.data) ? res.data : (res.data?.data || []);
    return items.map((e: any) => ({
      id: e.id,
      studentId: e.assignment?.studentId || '',
      internshipId: e.assignment?.internshipId || '',
      evaluatorId: e.evaluatorId || '',
      rating: Number(e.overallRating || 0),
      feedback: e.comments || e.strengths || '',
      createdAt: e.createdAt ? new Date(e.createdAt).toISOString() : new Date().toISOString(),
    }));
  } catch (err: any) {
    console.error('[fetchStudentEvaluationsBackend] Express error:', err);
    return [];
  }
};

// Student Certificates Services (Express Backend)
export const fetchStudentCertificatesBackend = async (): Promise<StudentCertificateRecord[]> => {
  try {
    const res = await apiClient.get<any>('/certificates');
    const items: any[] = Array.isArray(res.data) ? res.data : (res.data?.data || []);
    return items.map((c: any) => ({
      id: c.id,
      studentId: c.studentId,
      internshipId: c.internshipId || c.assignment?.internship?.id || '',
      certificateNumber: c.certificateNumber,
      certificateUrl: `/student/certificates`,
      issuedAt: c.issueDate ? new Date(c.issueDate).toISOString() : (c.createdAt ? new Date(c.createdAt).toISOString() : ''),
      status: c.status,
      signatoryName: c.signatoryName,
      signatoryTitle: c.signatoryTitle,
      assignment: c.assignment,
      student: c.student,
      company: c.company,
    }));
  } catch (err: any) {
    console.error('[fetchStudentCertificatesBackend] Express error:', err);
    return [];
  }
};

export const verifyCertificateBackend = async (
  token: string
): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    const res = await apiClient.get<any>(`/certificates/verify/${token}`);
    return { success: true, data: res.data?.data || res.data };
  } catch (err: any) {
    return {
      success: false,
      error: err.response?.data?.message || err.message || 'Certificate verification failed.',
    };
  }
};
export interface ChatConversationRecord {
  id: string;
  createdAt: string;
  updatedAt: string;
  participantName?: string;
  participantRole?: string;
  participantAvatar?: string;
  participantId?: string;
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

// Chat Conversations & Messages Services (Express + Prisma Backend)
export const fetchStudentConversationsBackend = async (): Promise<ChatConversationRecord[]> => {
  try {
    const res = await apiClient.get<any>('/chat/conversations');
    const raw: any = res.data;
    const convs: any[] = Array.isArray(raw) ? raw : (raw?.data || []);

    const currentUser = await getCurrentUserBackend();
    const currentUserId = currentUser?.id;

    return convs.map((c: any) => {
      const otherParticipant =
        c.participants?.find((p: any) => p.userId !== currentUserId) ||
        c.participants?.[0];
      const otherUser = otherParticipant?.user;

      const latestMsg = c.messages?.[0]?.message;

      return {
        id: c.id,
        createdAt: c.createdAt ? new Date(c.createdAt).toISOString() : new Date().toISOString(),
        updatedAt: c.updatedAt ? new Date(c.updatedAt).toISOString() : new Date().toISOString(),
        participantName: otherUser?.fullName || 'Faculty Mentor / Coordinator',
        participantRole: otherUser?.role || 'Mentor',
        participantAvatar: otherUser?.avatarUrl || undefined,
        participantId: otherUser?.id || otherParticipant?.userId || undefined,
        lastMessage: latestMsg || 'Tap to view chat history',
      };
    });
  } catch (err: any) {
    console.error('[fetchStudentConversationsBackend] Express fetch error:', err);
    return [];
  }
};

export const fetchChatMessagesBackend = async (
  conversationId: string
): Promise<ChatMessageRecord[]> => {
  try {
    const res = await apiClient.get<any>(`/chat/conversations/${conversationId}/messages`);
    const msgs: any[] = Array.isArray(res.data) ? res.data : (res.data?.data || []);

    return msgs.map((m: any) => ({
      id: m.id,
      conversationId: m.conversationId,
      senderId: m.senderId,
      message: m.message,
      createdAt: m.createdAt ? new Date(m.createdAt).toISOString() : new Date().toISOString(),
      senderName: m.sender?.fullName || 'User',
    }));
  } catch (err: any) {
    console.error('[fetchChatMessagesBackend] Express fetch error:', err);
    return [];
  }
};

export const sendChatMessageBackend = async (
  conversationId: string,
  message: string
): Promise<{ success: boolean; data?: ChatMessageRecord; error?: string }> => {
  try {
    const res = await apiClient.post<any>(`/chat/conversations/${conversationId}/messages`, {
      message,
    });
    const msg = res.data?.data || res.data;

    return {
      success: true,
      data: {
        id: msg.id,
        conversationId: msg.conversationId,
        senderId: msg.senderId,
        message: msg.message,
        createdAt: msg.createdAt ? new Date(msg.createdAt).toISOString() : new Date().toISOString(),
        senderName: msg.sender?.fullName || 'Me',
      },
    };
  } catch (err: any) {
    console.error('[sendChatMessageBackend] Express error:', err);
    const errorMsg =
      err.response?.data?.message || err.message || 'Failed to send message.';
    return { success: false, error: errorMsg };
  }
};

export const createChatConversationBackend = async (
  participantIds: string[],
  initialMessage?: string
): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    const res = await apiClient.post<any>('/chat/conversations', {
      participantIds,
      initialMessage,
    });
    return {
      success: true,
      data: res.data?.data || res.data,
    };
  } catch (err: any) {
    console.error('[createChatConversationBackend] Express error:', err);
    const errorMsg =
      err.response?.data?.message || err.message || 'Failed to create conversation.';
    return { success: false, error: errorMsg };
  }
};
/* ====================================================================
   PHASE 5: ACTIVE STUDENT INTERNSHIP LIFECYCLE SERVICE
   ==================================================================== */

export interface ActiveStudentInternshipRecord {
  assignmentId: string;
  applicationId: string;
  internshipId: string;
  title: string;
  companyId: string;
  companyName: string;
  industryDomain: string;
  location: string;
  workMode: string;
  internshipType: string;
  duration: string;
  stipend: string;
  description: string;
  appliedAt: string;
  startDate: string | null;
  endDate: string | null;
  assignmentStatus: string;
  // Mentor fields resolved from assignment
  mentorName: string;
  mentorRole: string;
  mentorEmail: string;
  mentorUserId?: string;
}

export interface ActiveInternshipMetrics {
  // Task counters — from GET /api/tasks (Express, student-scoped)
  totalTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  // Work log totals — from GET /api/work-logs (Express, student-scoped)
  totalHoursLogged: number;
  currentWeekHours: number;
  // Attendance — from GET /api/attendance/summary/:assignmentId (Express)
  attendancePercentage: number;
  attendanceHealthStatus: 'Excellent' | 'Good' | 'Needs Attention';
}

// Migrated: Supabase student_applications query replaced with GET /api/assignments
// Backend enforces student scoping via JWT — no manual student ID passed.
export const fetchActiveStudentInternshipBackend = async (): Promise<ActiveStudentInternshipRecord | null> => {
  try {
    const res = await apiClient.get<any>('/assignments');
    // Backend wraps in { success, data } for student role
    const assignments: any[] = Array.isArray(res.data) ? res.data : (res.data?.data || []);

    if (!assignments || assignments.length === 0) {
      console.log('[ActiveInternship] No assignments found for authenticated student.');
      return null;
    }

    // Prefer active, then upcoming assignment
    const active =
      assignments.find((a: any) => a.status === 'active') ||
      assignments.find((a: any) => a.status === 'upcoming') ||
      assignments[0];

    if (!active) return null;

    const internship = active.internship || {};
    const company = active.company || {};
    const application = active.application || {};

    // Resolve mentor: prefer industryMentor (company-side), fallback to facultyMentor
    const industryMentor = active.industryMentor;
    const facultyMentor = active.facultyMentor;

    let mentorName = 'Assigned Mentor';
    let mentorRole = 'Industry Mentor';
    let mentorEmail = 'mentor@interora.app';

    if (industryMentor?.profile) {
      mentorName = industryMentor.profile.fullName || mentorName;
      mentorRole = industryMentor.designation || 'Industry Mentor';
      mentorEmail = industryMentor.profile.email || mentorEmail;
    } else if (facultyMentor?.profile) {
      mentorName = facultyMentor.profile.fullName || mentorName;
      mentorRole = facultyMentor.designation || 'Faculty Mentor';
      mentorEmail = facultyMentor.profile.email || mentorEmail;
    }

    const mentorUserId = active.facultyMentorId || active.industryMentorId || facultyMentor?.id || industryMentor?.id;

    const result: ActiveStudentInternshipRecord = {
      assignmentId: active.id,
      applicationId: active.applicationId,
      internshipId: active.internshipId || internship.id || '',
      title: internship.title || 'Active Internship Role',
      companyId: active.companyId || company.id || '',
      companyName: company.companyName || 'Host Company',
      industryDomain: internship.industryDomain || company.industryDomain || 'Technology',
      location: internship.location || 'Remote / On-site',
      workMode: internship.workMode || 'remote',
      internshipType: internship.internshipType || 'full_time',
      duration: internship.duration || '3 Months',
      stipend: internship.stipend ? String(internship.stipend) : 'Stipend Provided',
      description: '',
      appliedAt: application.appliedAt || active.createdAt,
      startDate: active.startDate ? new Date(active.startDate).toISOString().slice(0, 10) : null,
      endDate: active.endDate ? new Date(active.endDate).toISOString().slice(0, 10) : null,
      assignmentStatus: active.status || 'active',
      mentorName,
      mentorRole,
      mentorEmail,
      mentorUserId: mentorUserId || undefined,
    };

    console.log('[ActiveInternship] Assignment resolved via Express:', result.assignmentId);
    return result;
  } catch (err: any) {
    console.error('[ActiveInternship] Express fetch error:', err);
    return null;
  }
};

/**
 * Fetches task counts, work-log totals, and attendance summary for the
 * student's active assignment. All three calls use authenticated Express
 * endpoints — the backend scopes data to the authenticated student automatically.
 *
 * Endpoints used:
 *   GET /api/tasks                         (student-scoped by JWT)
 *   GET /api/work-logs                     (student-scoped by JWT)
 *   GET /api/attendance/summary/:assignmentId  (requires assignmentId)
 */
export const fetchStudentActiveInternshipMetricsBackend = async (
  assignmentId: string
): Promise<ActiveInternshipMetrics> => {
  const defaultMetrics: ActiveInternshipMetrics = {
    totalTasks: 0,
    inProgressTasks: 0,
    completedTasks: 0,
    totalHoursLogged: 0,
    currentWeekHours: 0,
    attendancePercentage: 100,
    attendanceHealthStatus: 'Excellent',
  };

  try {
    const [tasksRes, workLogsRes, attendanceRes] = await Promise.allSettled([
      apiClient.get<any>('/tasks'),
      apiClient.get<any>('/work-logs'),
      apiClient.get<any>(`/attendance/summary/${assignmentId}`),
    ]);

    // Tasks
    let totalTasks = 0;
    let inProgressTasks = 0;
    let completedTasks = 0;
    if (tasksRes.status === 'fulfilled') {
      const tasks: any[] = Array.isArray(tasksRes.value.data)
        ? tasksRes.value.data
        : (tasksRes.value.data?.data || []);
      totalTasks = tasks.length;
      inProgressTasks = tasks.filter(
        (t: any) => (t.status || '').toLowerCase() === 'in_progress'
      ).length;
      completedTasks = tasks.filter(
        (t: any) => (t.status || '').toLowerCase() === 'completed'
      ).length;
    }

    // Work Logs
    let totalHoursLogged = 0;
    let currentWeekHours = 0;
    if (workLogsRes.status === 'fulfilled') {
      const logs: any[] = Array.isArray(workLogsRes.value.data)
        ? workLogsRes.value.data
        : (workLogsRes.value.data?.data || []);

      // Week boundary (Mon–Sun)
      const now = new Date();
      const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon...
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() + mondayOffset);
      weekStart.setHours(0, 0, 0, 0);

      for (const log of logs) {
        const hrs = Number(log.hoursWorked ?? 0);
        totalHoursLogged += hrs;
        const logDate = log.logDate ? new Date(log.logDate) : null;
        if (logDate && logDate >= weekStart) {
          currentWeekHours += hrs;
        }
      }
      totalHoursLogged = Math.round(totalHoursLogged * 10) / 10;
      currentWeekHours = Math.round(currentWeekHours * 10) / 10;
    }

    // Attendance
    let attendancePercentage = 100;
    let attendanceHealthStatus: ActiveInternshipMetrics['attendanceHealthStatus'] = 'Excellent';
    if (attendanceRes.status === 'fulfilled') {
      const summary = attendanceRes.value.data?.data ?? attendanceRes.value.data;
      if (summary && typeof summary.attendancePercentage === 'number') {
        attendancePercentage = Math.round(summary.attendancePercentage);
        if (attendancePercentage >= 90) attendanceHealthStatus = 'Excellent';
        else if (attendancePercentage >= 75) attendanceHealthStatus = 'Good';
        else attendanceHealthStatus = 'Needs Attention';
      }
    }

    return {
      totalTasks,
      inProgressTasks,
      completedTasks,
      totalHoursLogged,
      currentWeekHours,
      attendancePercentage,
      attendanceHealthStatus,
    };
  } catch (err: any) {
    console.error('[ActiveInternshipMetrics] Unexpected error:', err);
    return defaultMetrics;
  }
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
  _companyId?: string
): Promise<CompanyActiveInternRecord[]> => {
  const internMap = new Map<string, CompanyActiveInternRecord>();

  // 1. Fetch established internship assignments (Express backend enforces company ownership)
  const assignmentsRes = await apiClient.get<any[]>('/assignments');
  const assignments = assignmentsRes.data || [];

  for (const assign of assignments) {
    const studentProfile = assign.student?.profile;
    const studentId = studentProfile?.id || assign.studentId;
    const studentName = studentProfile?.fullName || 'Student Intern';
    const studentEmail = studentProfile?.email || '';
    const internshipTitle = assign.internship?.title || 'Internship Position';
    const appliedAt = assign.application?.appliedAt || assign.createdAt;

    let status = 'Active';
    if (assign.status === 'completed') {
      status = 'Completed';
    } else if (assign.status === 'active' || assign.status === 'upcoming') {
      status = 'Active';
    } else if (assign.status) {
      status = assign.status.charAt(0).toUpperCase() + assign.status.slice(1);
    }

    internMap.set(studentId, {
      applicationId: assign.applicationId || assign.id,
      studentId,
      studentName,
      studentEmail,
      internshipId: assign.internshipId,
      internshipTitle,
      appliedAt: typeof appliedAt === 'string' ? appliedAt : new Date(appliedAt).toISOString(),
      status,
    });
  }

  // 2. Fetch company postings and any 'selected' applications not yet in assignments
  const postingsRes = await apiClient.get<any[]>('/postings', { params: { scope: 'mine' } });
  const postings = postingsRes.data || [];

  if (Array.isArray(postings) && postings.length > 0) {
    await Promise.all(
      postings.map(async (posting) => {
        try {
          const appsRes = await apiClient.get<any[]>(`/postings/${posting.id}/applications`);
          const apps = appsRes.data || [];
          for (const app of apps) {
            const appStatus = (app.status || '').toLowerCase();
            if (appStatus === 'selected') {
              const sId = app.student?.profile?.id || app.studentId;
              if (!internMap.has(sId)) {
                internMap.set(sId, {
                  applicationId: app.id,
                  studentId: sId,
                  studentName: app.student?.profile?.fullName || 'Student Candidate',
                  studentEmail: app.student?.profile?.email || '',
                  internshipId: posting.id,
                  internshipTitle: posting.title || 'Internship Position',
                  appliedAt:
                    typeof app.appliedAt === 'string'
                      ? app.appliedAt
                      : new Date(app.appliedAt).toISOString(),
                  status: 'Selected',
                });
              }
            }
          }
        } catch (appErr) {
          console.warn(`[CompanyActiveInterns] Error fetching apps for posting ${posting.id}:`, appErr);
        }
      })
    );
  }

  return Array.from(internMap.values()).sort(
    (a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime()
  );
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

export interface CompanyInternDetailRecord {
  studentId: string;
  studentName: string;
  studentEmail: string;
  internshipTitle: string;
  internshipId: string;
  assignmentId?: string;
}

export const fetchCompanyInternDetailBackend = async (
  internId: string
): Promise<CompanyInternDetailRecord> => {
  // 1. Try to find assignment for this student under the authenticated company
  try {
    const res = await apiClient.get<any[]>('/assignments', {
      params: { studentId: internId },
    });
    const assignments = res.data || [];
    if (assignments.length > 0) {
      const a = assignments[0];
      return {
        studentId: internId,
        studentName: a.student?.profile?.fullName || 'Student Candidate',
        studentEmail: a.student?.profile?.email || '',
        internshipTitle: a.internship?.title || 'Active Internship Role',
        internshipId: a.internshipId,
        assignmentId: a.id,
      };
    }
  } catch (err: any) {
    console.warn('[CompanyInternDetails] Error querying assignments:', err);
  }

  // 2. Fallback to check company's postings for a selected application
  try {
    const postingsRes = await apiClient.get<any[]>('/postings', { params: { scope: 'mine' } });
    const postings = postingsRes.data || [];

    for (const posting of postings) {
      try {
        const appsRes = await apiClient.get<any[]>(`/postings/${posting.id}/applications`);
        const apps = appsRes.data || [];
        const match = apps.find(
          (app) =>
            (app.studentId === internId || app.student?.profile?.id === internId) &&
            (app.status || '').toLowerCase() === 'selected'
        );
        if (match) {
          return {
            studentId: internId,
            studentName: match.student?.profile?.fullName || 'Student Candidate',
            studentEmail: match.student?.profile?.email || '',
            internshipTitle: posting.title || 'Active Internship Role',
            internshipId: posting.id,
            assignmentId: undefined,
          };
        }
      } catch (appErr) {
        console.warn(`[CompanyInternDetails] Error fetching applications for posting ${posting.id}:`, appErr);
      }
    }
  } catch (postErr) {
    console.warn('[CompanyInternDetails] Error querying postings:', postErr);
  }

  throw new Error('Intern not found or does not belong to your company.');
};

export const fetchCompanyInternAttendanceBackend = async (
  studentId: string,
  assignmentId?: string
): Promise<CompanyInternAttendanceSummary> => {
  if (!assignmentId) {
    return {
      studentId,
      totalRecords: 0,
      presentCount: 0,
      attendancePercentage: 100,
      recentActivity: 'No check-ins',
    };
  }

  try {
    const res = await apiClient.get<any>(`/attendance/summary/${assignmentId}`);
    const summary = res.data;
    if (!summary) {
      return {
        studentId,
        totalRecords: 0,
        presentCount: 0,
        attendancePercentage: 100,
        recentActivity: 'No check-ins',
      };
    }

    const recent = summary.recentRecords?.[0]?.attendanceDate || 'No check-ins';

    return {
      studentId,
      totalRecords: summary.totalRecords || 0,
      presentCount: summary.presentCount || 0,
      attendancePercentage: Math.round(Number(summary.attendancePercentage ?? 100)),
      recentActivity: recent,
    };
  } catch (err: any) {
    console.error('[CompanyInternAttendance] Error fetching attendance summary:', err);
    throw err;
  }
};

export const fetchCompanyInternMilestonesBackend = async (
  studentId: string,
  assignmentId?: string
): Promise<CompanyInternMilestoneRecord[]> => {
  const params: Record<string, string> = { studentId };
  if (assignmentId) {
    params.assignmentId = assignmentId;
  }

  try {
    const res = await apiClient.get<any[]>('/milestones', { params });
    const data = res.data || [];
    return data.map((m) => ({
      id: m.id,
      studentId,
      internshipId: m.assignment?.internshipId || '',
      title: m.title,
      description: m.description || '',
      dueDate: m.targetDate
        ? new Date(m.targetDate).toISOString().slice(0, 10)
        : '2026-08-31',
      status: m.status === 'completed' ? 'Completed' : 'In Progress',
    }));
  } catch (err: any) {
    console.error('[CompanyInternMilestones] Error fetching milestones:', err);
    throw err;
  }
};

export const fetchCompanyInternEvaluationsBackend = async (
  studentId: string,
  assignmentId?: string
): Promise<CompanyInternEvaluationRecord[]> => {
  const params: Record<string, string> = { studentId };
  if (assignmentId) {
    params.assignmentId = assignmentId;
  }

  try {
    const res = await apiClient.get<any[]>('/evaluations', { params });
    const data = res.data || [];
    return data.map((e) => ({
      id: e.id,
      studentId,
      internshipId: e.assignment?.internshipId || '',
      evaluatorId: e.evaluatorId || '',
      score: Math.round(Number(e.overallRating || 0) * 20),
      remarks: e.comments || e.strengths || '',
      submittedAt: e.createdAt,
    }));
  } catch (err: any) {
    console.error('[CompanyInternEvaluations] Error fetching evaluations:', err);
    throw err;
  }
};

export const createCompanyInternEvaluationBackend = async (
  studentId: string,
  internshipId: string,
  score: number,
  remarks: string,
  assignmentId?: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    let resolvedAssignmentId = assignmentId;

    if (!resolvedAssignmentId) {
      const assignRes = await apiClient.get<any[]>('/assignments', {
        params: { studentId },
      });
      const assignments = assignRes.data || [];
      if (assignments.length > 0) {
        resolvedAssignmentId = assignments[0].id;
      }
    }

    if (!resolvedAssignmentId) {
      return {
        success: false,
        error: 'An active internship assignment is required to submit an evaluation.',
      };
    }

    const ratingVal = Math.min(5, Math.max(1, Math.round(score / 20)));
    const ratingFloat = Math.min(5, Math.max(1, Math.round((score / 20) * 10) / 10));

    await apiClient.post('/evaluations', {
      assignmentId: resolvedAssignmentId,
      evaluationType: 'mid_term',
      evaluationPeriod: 'Performance Review',
      technicalSkills: ratingVal,
      qualityOfWork: ratingVal,
      problemSolving: ratingVal,
      communication: ratingVal,
      teamwork: ratingVal,
      professionalism: ratingVal,
      timeManagement: ratingVal,
      initiative: ratingVal,
      overallRating: ratingFloat,
      comments: remarks,
      status: 'submitted',
    });

    return { success: true };
  } catch (err: any) {
    console.error('[createCompanyInternEvaluationBackend] Error:', err);
    const errorMsg =
      err.errors
        ? Object.values(err.errors).flat().join(', ')
        : err.message || 'Failed to submit evaluation.';
    return { success: false, error: errorMsg };
  }
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
  id?: string;
  department?: string;
  batchYear?: string;
  role?: string;
  company?: string;
  email?: string;
  attendance?: { present: number; absent: number; workingDays: number; recent: any[] };
  progressPercentage?: number;
  internshipStatus?: string;
  lastActivity?: string;
  riskIndicator?: string;
  milestones?: Array<{ title: string; completed: boolean; dueDate?: string }>;
  timeline?: Array<{ date: string; event: string }>;
  skills?: string[];
  startDate?: string;
  endDate?: string;
  internshipDuration?: string;
  currentStage?: string;
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
  try {
    const res = await apiClient.get<FacultyAssignedStudentRecord[]>('/faculty/assigned-students');
    return res.data || [];
  } catch (err) {
    console.error('[fetchFacultyAssignedStudentsBackend] Error:', err);
    return [];
  }
};

export const fetchFacultyGuidanceNotesBackend = async (
  studentId: string
): Promise<FacultyGuidanceNoteRecord[]> => {
  try {
    const res = await apiClient.get<FacultyGuidanceNoteRecord[]>(
      `/faculty/students/${studentId}/guidance-notes`
    );
    return res.data || [];
  } catch (err) {
    console.error('[fetchFacultyGuidanceNotesBackend] Error:', err);
    return [];
  }
};

export const createFacultyGuidanceNoteBackend = async (
  studentId: string,
  category: string,
  note: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    await apiClient.post(`/faculty/students/${studentId}/guidance-notes`, { category, note });
    return { success: true };
  } catch (err: any) {
    console.error('[createFacultyGuidanceNoteBackend] Error:', err);
    return { success: false, error: err?.message || 'Failed to create guidance note' };
  }
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

export interface CompanyMentorDashboardMetrics {
  totalInterns: number;
  totalTasks: number;
  completedTasks: number;
  pendingReviews: number;
  verifiedTasks: number;
}

export const fetchCompanyMentorMetricsBackend = async (): Promise<CompanyMentorDashboardMetrics | null> => {
  try {
    const res = await apiClient.get<CompanyMentorDashboardMetrics>('/mentor/metrics');
    return res.data || null;
  } catch (err: any) {
    console.error('[fetchCompanyMentorMetricsBackend] Error:', err);
    return null;
  }
};

export const fetchCompanyMentorInternsBackend = async (): Promise<CompanyMentorInternRecord[]> => {
  try {
    const res = await apiClient.get<CompanyMentorInternRecord[]>('/mentor/interns');
    return res.data || [];
  } catch (err: any) {
    console.error('[fetchCompanyMentorInternsBackend] Error:', err);
    return [];
  }
};

export const fetchCompanyMentorTasksBackend = async (): Promise<CompanyMentorTaskRecord[]> => {
  try {
    const res = await apiClient.get<CompanyMentorTaskRecord[]>('/mentor/tasks');
    return res.data || [];
  } catch (err: any) {
    console.error('[fetchCompanyMentorTasksBackend] Error:', err);
    return [];
  }
};

export const updateCompanyMentorTaskReviewBackend = async (
  taskId: string,
  reviewStatus: string,
  feedback?: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const res = await apiClient.post<{ success: boolean }>(`/mentor/tasks/${taskId}/review`, {
      reviewStatus,
      feedback,
    });
    return { success: res.success ?? true };
  } catch (err: any) {
    console.error('[updateCompanyMentorTaskReviewBackend] Error:', err);
    const errorMsg =
      err.response?.data?.message || err.message || 'Failed to update task review';
    return { success: false, error: errorMsg };
  }
};
/* ====================================================================
   PHASE 15: ADMIN PORTAL SERVICES
   ==================================================================== */

export interface AdminDashboardMetrics {
  totalStudents: number;
  totalCompanies: number;
  activeInternsCount: number;
  activeInternships?: number;
  pposPendingCount: number;
  certsPendingCount: number;
  pendingApplications: number;
  pendingCompanies: number;
  completedInternsCount?: number;
  totalApplicationsCount?: number;
  selectedApplicationsCount?: number;
  rejectedApplicationsCount?: number;
  totalPposCount?: number;
  totalCertificatesCount?: number;
  departmentDistribution?: Array<{
    department: string;
    studentCount: number;
    internshipCount: number;
  }>;
}

export const fetchAdminDashboardMetricsBackend = async (
  domain?: string,
  dataYear?: string,
  academicYear?: string
): Promise<AdminDashboardMetrics> => {
  try {
    const params = new URLSearchParams();
    if (domain && domain !== 'All') params.append('domain', domain);
    if (dataYear && dataYear !== 'All') params.append('dataYear', dataYear);
    if (academicYear && academicYear !== 'All') params.append('academicYear', academicYear);
    
    const queryString = params.toString() ? `?${params.toString()}` : '';
    const res = await apiClient.get<any>(`/admin/metrics${queryString}`);
    const data = res.data?.data || res.data;
    return {
      totalStudents: data?.totalStudents ?? 0,
      totalCompanies: data?.totalCompanies ?? 0,
      activeInternsCount: data?.activeInternsCount ?? data?.activeInternships ?? 0,
      activeInternships: data?.activeInternships ?? data?.activeInternsCount ?? 0,
      pposPendingCount: data?.pposPendingCount ?? 0,
      certsPendingCount: data?.certsPendingCount ?? 0,
      pendingApplications: data?.pendingApplications ?? 0,
      pendingCompanies: data?.pendingCompanies ?? 0,
      completedInternsCount: data?.completedInternsCount ?? 0,
      totalApplicationsCount: data?.totalApplicationsCount ?? 0,
      selectedApplicationsCount: data?.selectedApplicationsCount ?? 0,
      rejectedApplicationsCount: data?.rejectedApplicationsCount ?? 0,
      totalPposCount: data?.totalPposCount ?? 0,
      totalCertificatesCount: data?.totalCertificatesCount ?? 0,
      departmentDistribution: data?.departmentDistribution ?? [],
    };
  } catch (err: any) {
    console.error('[fetchAdminDashboardMetricsBackend] Error:', err);
    return {
      totalStudents: 0,
      totalCompanies: 0,
      activeInternsCount: 0,
      activeInternships: 0,
      pposPendingCount: 0,
      certsPendingCount: 0,
      pendingApplications: 0,
      pendingCompanies: 0,
      completedInternsCount: 0,
      totalApplicationsCount: 0,
      selectedApplicationsCount: 0,
      rejectedApplicationsCount: 0,
      totalPposCount: 0,
      totalCertificatesCount: 0,
      departmentDistribution: [],
    };
  }
};

export const fetchAdminFilterOptionsBackend = async () => {
  try {
    const res = await apiClient.get<any>('/admin/metrics/filters');
    return res.data?.data || res.data;
  } catch (err: any) {
    console.error('[fetchAdminFilterOptionsBackend] Error:', err);
    throw new Error(err?.response?.data?.message || 'Failed to fetch filter options');
  }
};

export const downloadAdminMetricsExcelBackend = async (
  domain?: string,
  dataYear?: string,
  academicYear?: string
) => {
  try {
    const params = new URLSearchParams();
    if (domain && domain !== 'All') params.append('domain', domain);
    if (dataYear && dataYear !== 'All') params.append('dataYear', dataYear);
    if (academicYear && academicYear !== 'All') params.append('academicYear', academicYear);
    
    const queryString = params.toString() ? `?${params.toString()}` : '';
    
    const response = await apiClient.get(`/admin/metrics/export${queryString}`, {
      responseType: 'blob'
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'system_analytics.xlsx');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (err: any) {
    console.error('[downloadAdminMetricsExcelBackend] Error:', err);
    throw new Error('Failed to download Excel file');
  }
};

export interface AdminCertificateRecord {
  id: string;
  recipientName: string;
  recipientEmail: string;
  internshipTitle: string;
  certificateNumber: string;
  issuedDate: string;
  signatory: string;
  status: string;
  qrToken?: string;
}

export const fetchCertificatesBackend = async (): Promise<AdminCertificateRecord[]> => {
  try {
    const res = await apiClient.get<any>('/certificates');
    const items: any[] = Array.isArray(res.data) ? res.data : (res.data?.data || []);
    return items.map((c: any) => ({
      id: c.id,
      recipientName: c.student?.profile?.fullName || c.recipientName || 'Student Name',
      recipientEmail: c.student?.profile?.email || c.recipientEmail || 'student@university.edu',
      internshipTitle: c.assignment?.internship?.title || c.internshipTitle || 'Internship',
      certificateNumber: c.certificateNumber || '',
      issuedDate: c.issueDate ? new Date(c.issueDate).toLocaleDateString() : (c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'N/A'),
      signatory: c.signatoryName || 'Head of Placements',
      status: c.status ? (c.status.charAt(0).toUpperCase() + c.status.slice(1)) : 'Active',
      qrToken: c.qrToken,
    }));
  } catch (err: any) {
    console.error('[fetchCertificatesBackend] Error:', err);
    return [];
  }
};

export interface AdminPPORecord {
  id: string;
  internId: string;
  studentName: string;
  studentEmail: string;
  department: string;
  role: string;
  ctc: string;
  company: string;
  joiningDate?: string;
  status: string;
  adminApprovalStatus: string;
  location?: string;
  bondTerms?: string;
}

export const fetchPPOOffersBackend = async (): Promise<AdminPPORecord[]> => {
  try {
    const res = await apiClient.get<any>('/ppo-offers');
    const items: any[] = Array.isArray(res.data) ? res.data : (res.data?.data || []);
    return items.map((p: any) => ({
      id: p.id,
      internId: p.studentId || p.student?.id || '',
      studentName: p.student?.profile?.fullName || 'Student Candidate',
      studentEmail: p.student?.profile?.email || 'student@university.edu',
      department: p.student?.course || 'Engineering',
      role: p.positionTitle || p.assignment?.internship?.title || 'Associate',
      ctc: p.salaryPackage || '₹12,00,000 LPA',
      company: p.company?.companyName || 'Host Company',
      joiningDate: p.joiningDate ? new Date(p.joiningDate).toLocaleDateString() : 'Immediate',
      status: p.status === 'offered' ? 'Offered' : (p.status ? p.status.charAt(0).toUpperCase() + p.status.slice(1) : 'Pending'),
      adminApprovalStatus: p.adminApprovalStatus || 'pending',
      location: p.location || 'Remote',
      bondTerms: p.bondTerms || 'None',
    }));
  } catch (err: any) {
    console.error('[fetchPPOOffersBackend] Error:', err);
    return [];
  }
};

export const updatePPOOfferBackend = async (
  ppoId: string,
  input: { adminApprovalStatus?: 'approved' | 'rejected'; status?: string }
): Promise<{ success: boolean; error?: string }> => {
  try {
    await apiClient.patch(`/ppo-offers/${ppoId}`, input);
    return { success: true };
  } catch (err: any) {
    console.error('[updatePPOOfferBackend] Error:', err);
    return { success: false, error: err.response?.data?.message || err.message || 'Failed to update PPO offer.' };
  }
};

export interface AdminApplicationRecord {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  department: string;
  internshipId: string;
  internshipTitle: string;
  companyName: string;
  duration: string;
  stipend: string;
  facultyApprovalStatus?: string;
  applicationStatus: string;
  appliedDate: string;
  resumeUrl?: string | null;
  coverLetter?: string | null;
}

export const fetchAdminApplicationsBackend = async (): Promise<AdminApplicationRecord[]> => {
  try {
    const res = await apiClient.get<any>('/admin/applications');
    const items = res.data?.data || res.data || [];
    return Array.isArray(items) ? items : [];
  } catch (err: any) {
    console.error('[fetchAdminApplicationsBackend] Error:', err);
    return [];
  }
};

export interface AdminUserRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  rawRole: string;
  organization: string;
  departmentId?: string;
  status: string;
  createdAt: string;
}

export const fetchAdminUsersBackend = async (): Promise<AdminUserRecord[]> => {
  try {
    const res = await apiClient.get<any>('/admin/users');
    const items = res.data?.data || res.data || [];
    return Array.isArray(items) ? items : [];
  } catch (err: any) {
    console.error('[fetchAdminUsersBackend] Error:', err);
    return [];
  }
};

// Direct Industry/Company Addition by Admin
export const createCompanyDirectBackend = async (company: {
  companyName: string;
  industryDomain: string;
  contactPerson: string;
  email: string;
  phone: string;
  website: string;
  status: 'Approved' | 'Pending';
  tempPassword?: string;
}): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    const res = await apiClient.post<any>('/admin/companies', company);
    return { success: true, data: res.data };
  } catch (err: any) {
    console.error('[createCompanyDirectBackend] Error:', err);
    return { success: false, error: err.message || 'Failed to create company.' };
  }
};

/* ====================================================================
   FACULTY DASHBOARD & BACKEND SERVICE CONNECTIVITY (SUPABASE)
   ==================================================================== */

export interface FacultyDashboardMetrics {
  totalAssignedStudents: number;
  activeInternshipsCount: number;
  pendingApplicationReviews: number;
  completedEvaluationsCount: number;
  placementRate: number;
}


export const fetchFacultyDashboardMetricsBackend = async (): Promise<FacultyDashboardMetrics> => {
  try {
    const res = await apiClient.get<FacultyDashboardMetrics>('/faculty/metrics');
    return (
      res.data || {
        totalAssignedStudents: 0,
        activeInternshipsCount: 0,
        pendingApplicationReviews: 0,
        completedEvaluationsCount: 0,
        placementRate: 0,
      }
    );
  } catch (err) {
    console.error('[fetchFacultyDashboardMetricsBackend] Error:', err);
    return {
      totalAssignedStudents: 0,
      activeInternshipsCount: 0,
      pendingApplicationReviews: 0,
      completedEvaluationsCount: 0,
      placementRate: 0,
    };
  }
};


// 4. Faculty Mentor Registration by Admin
export interface FacultyRegistrationInput {
  name: string;
  email: string;
  facultyId: string;
  department: string;
  batch: string;
  designation: string;
  phone: string;
  password?: string;
}


export interface FacultyMentorRecord {
  id: string;
  facultyId: string;
  name: string;
  email: string;
  phone: string;
  department: 'CSE' | 'IT' | 'AIML' | 'ECE';
  batch: 'CS1' | 'CS2' | 'CS3' | 'CS4';
  designation: string;
  tempPassword?: string;
  assignedStudentCount: number;
  status: 'Active' | 'Inactive';
}

export const fetchFacultyMentorsBackend = async (): Promise<FacultyMentorRecord[]> => {
  try {
    const res = await apiClient.get<FacultyMentorRecord[]>('/admin/faculty');
    return res.data || [];
  } catch (err: any) {
    console.error('[fetchFacultyMentorsBackend] Error:', err);
    return [];
  }
};

export const deleteFacultyMentorBackend = async (id: string): Promise<{ success: boolean; error?: string }> => {
  try {
    await apiClient.delete(`/admin/faculty/${id}`);
    return { success: true };
  } catch (err: any) {
    console.error('[deleteFacultyMentorBackend] Error:', err);
    return { success: false, error: err.message || 'Failed to delete faculty mentor.' };
  }
};

export const updateFacultyMentorBackend = async (
  id: string,
  updates: { name?: string; department?: string; status?: 'Active' | 'Inactive'; designation?: string; phone?: string }
): Promise<{ success: boolean; error?: string }> => {
  try {
    await apiClient.patch(`/admin/faculty/${id}`, updates);
    return { success: true };
  } catch (err: any) {
    console.error('[updateFacultyMentorBackend] Error:', err);
    return { success: false, error: err.message || 'Failed to update faculty mentor.' };
  }
};

export const registerFacultyMentorBackend = async (
  input: FacultyRegistrationInput
): Promise<{ success: boolean; error?: string }> => {
  try {
    await apiClient.post('/admin/faculty', input);
    return { success: true };
  } catch (err: any) {
    console.error('[registerFacultyMentorBackend] Error:', err);
    return { success: false, error: err.message || 'Failed to register faculty mentor.' };
  }
};

// =========================================================================
// REAL STORAGE & RESUME UPLOAD PERSISTENCE
// =========================================================================
export interface ResumeUploadResult {
  success: boolean;
  resumeUrl?: string;
  fileName?: string;
  error?: string;
}

export const uploadStudentResumeBackend = async (
  file: File
): Promise<ResumeUploadResult> => {
  // 1. PDF Only Validation
  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    return { success: false, error: 'Only PDF documents (.pdf) are supported.' };
  }

  // 2. File Size Validation (Max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    return { success: false, error: 'File size exceeds 5MB limit.' };
  }

  try {
    const formData = new FormData();
    formData.append('resume', file);

    const res = await apiClient.post<{ resumeUrl: string; fileName: string }>('/uploads/resume', formData);

    return {
      success: true,
      resumeUrl: res.data?.resumeUrl,
      fileName: res.data?.fileName || file.name,
    };
  } catch (err: any) {
    console.error('[uploadStudentResumeBackend] Error:', err);
    return { success: false, error: err.message || 'Failed to upload resume.' };
  }
};


// Check-out Attendance
export const checkoutAttendanceRecordBackend = async (
  photoBlob?: Blob,
  coords?: { latitude: number; longitude: number; address?: string },
  assignmentId?: string
): Promise<{ success: boolean; data?: any; error?: string }> => {
  let photoUrl = '';
  if (photoBlob) {
    try {
      photoUrl = await uploadAttendancePhotoBackend(photoBlob, 'check_out');
    } catch (err) {
      console.warn('[checkoutAttendanceRecordBackend] Photo upload notice:', err);
    }
  }

  try {
    const res = await apiClient.post<any>('/attendance/check-out', {
      assignmentId: assignmentId || undefined,
      checkOutPhotoUrl: photoUrl || undefined,
      checkOutLat: coords?.latitude,
      checkOutLng: coords?.longitude,
      checkOutAddress: coords?.address,
    });
    return {
      success: true,
      data: res.data,
    };
  } catch (err: any) {
    const errorMsg =
      err.response?.data?.message || err.message || 'Attendance check-out failed.';
    return {
      success: false,
      error: errorMsg,
    };
  }
};

// Student Work Logs Persistence (Express Backend)
export interface StudentWorkLogRecord {
  id: string;
  date: string;
  taskId: string;
  taskTitle: string;
  hoursWorked: number;
  summary: string;
  completedWork: string;
  blockers: string;
  nextPlan: string;
  createdAt?: string;
}

export interface WorkLogInput {
  date: string;
  taskId?: string;
  taskTitle: string;
  hoursWorked: number;
  summary: string;
  completedWork: string;
  blockers?: string;
  nextPlan?: string;
}

export const fetchStudentWorkLogsBackend = async (): Promise<StudentWorkLogRecord[]> => {
  try {
    const res = await apiClient.get<any>('/work-logs');
    const logs: any[] = Array.isArray(res.data) ? res.data : (res.data?.data || []);
    return logs.map((l: any) => ({
      id: l.id,
      date: l.logDate ? new Date(l.logDate).toISOString().slice(0, 10) : '',
      taskId: l.taskId || '',
      taskTitle: l.taskTitle || 'Daily Work',
      hoursWorked: Number(l.hoursWorked ?? 0),
      summary: l.completedWork || '',
      completedWork: l.completedWork || '',
      blockers: l.blockers || 'None',
      nextPlan: l.nextPlan || 'Continue tasks',
      createdAt: l.createdAt,
    }));
  } catch (err: any) {
    console.error('[fetchStudentWorkLogsBackend] Express error:', err);
    return [];
  }
};

export const createStudentWorkLogBackend = async (
  input: WorkLogInput,
  explicitAssignmentId?: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    let assignmentId = explicitAssignmentId;

    if (!assignmentId) {
      const active = await fetchActiveStudentInternshipBackend();
      if (!active?.assignmentId) {
        return {
          success: false,
          error: 'No active internship assignment found. Cannot log work without an active assignment.',
        };
      }
      assignmentId = active.assignmentId;
    }

    const payload: any = {
      assignmentId,
      taskTitle: input.taskTitle,
      logDate: input.date,
      hoursWorked: Number(input.hoursWorked),
      completedWork: input.completedWork,
      blockers: input.blockers || 'None',
      nextPlan: input.nextPlan || 'Continue sprint tasks',
    };

    if (input.taskId && input.taskId.length === 36) {
      payload.taskId = input.taskId;
    }

    await apiClient.post('/work-logs', payload);
    return { success: true };
  } catch (err: any) {
    console.error('[createStudentWorkLogBackend] Error:', err);
    const errorMsg =
      err.response?.data?.message || err.message || 'Failed to persist work log.';
    return { success: false, error: errorMsg };
  }
};


export interface FacultyStudentAttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  email: string;
  company: string;
  role: string;
  workMode: 'On-site' | 'Remote' | 'Hybrid';
  attendance: {
    workingDays: number;
    present: number;
    absent: number;
    recent: Array<{
      date: string;
      status: 'Present' | 'Absent' | 'Late';
      checkInTime?: string;
      checkOutTime?: string;
      checkInPhotoUrl?: string;
      checkInLat?: number;
      checkInLng?: number;
      checkOutPhotoUrl?: string;
      checkOutLat?: number;
      checkOutLng?: number;
      locationAddress?: string;
    }>;
  };
}

export const fetchFacultyAttendanceMonitoringBackend = async (): Promise<FacultyStudentAttendanceRecord[]> => {
  try {
    const res = await apiClient.get<FacultyStudentAttendanceRecord[]>('/faculty/attendance');
    return res.data || [];
  } catch (err) {
    console.error('[fetchFacultyAttendanceMonitoringBackend] Error:', err);
    return [];
  }
};

/* ====================================================================
   SLICE 21: FACULTY API SERVICES
   ==================================================================== */

// 1. Faculty Applications Oversight & Decision
export interface FacultyApplicationItem {
  id: string;
  studentId: string;
  studentName: string;
  email: string;
  role: string;
  company: string;
  appliedDate: string;
  applicationStatus: 'Pending' | 'Approved' | 'Rejected';
  rawStatus: string;
  skills: string[];
  coverMessage: string;
  facultyRating?: number;
}

export const fetchFacultyApplicationsBackend = async (): Promise<FacultyApplicationItem[]> => {
  try {
    const res = await apiClient.get<any>('/faculty/applications');
    const items = res.data?.data || res.data || [];
    return Array.isArray(items) ? items : [];
  } catch (err: any) {
    console.error('[fetchFacultyApplicationsBackend] Error:', err);
    return [];
  }
};

export const decideFacultyApplicationBackend = async (
  applicationId: string,
  decision: 'approve' | 'reject',
  rating?: number
): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    const res = await apiClient.post<any>(`/faculty/applications/${applicationId}/decision`, {
      decision,
      rating,
    });
    return { success: true, data: res.data };
  } catch (err: any) {
    console.error('[decideFacultyApplicationBackend] Error:', err);
    return {
      success: false,
      error: err.response?.data?.message || err.message || 'Failed to record application decision.',
    };
  }
};

// 2. Assigned Students
export type FacultyAssignedStudentItem = FacultyAssignedStudentRecord;

// 3. Evaluations (Faculty Creation & Cross-Verification)
export interface EvaluationRecord {
  id: string;
  assignmentId: string;
  evaluatorId: string;
  evaluatorRole: string;
  evaluationType: string;
  evaluationPeriod?: string;
  technicalSkills?: number;
  qualityOfWork?: number;
  problemSolving?: number;
  communication?: number;
  teamwork?: number;
  professionalism?: number;
  timeManagement?: number;
  initiative?: number;
  overallRating?: number;
  overallScore?: number;
  criteriaScores?: Record<string, any>;
  strengths?: string | null;
  improvementAreas?: string | null;
  comments?: string | null;
  notes?: string | null;
  recommendation?: string | null;
  status: string;
  crossVerified?: boolean;
  crossVerifiedAt?: string | null;
  discrepancyNotes?: string | null;
  createdAt?: string;
  updatedAt?: string;
  assignment?: {
    id: string;
    studentId: string;
    companyId?: string;
    internshipId?: string;
    facultyMentorId?: string | null;
    industryMentorId?: string | null;
    status?: string;
    student?: {
      id: string;
      studentId?: string;
      fullName?: string;
      email?: string;
      enrollmentNumber?: string;
      course?: string;
      studentProfile?: {
        department?: string;
        batchYear?: string;
      };
      profile?: {
        id: string;
        fullName: string;
        email: string;
      };
    };
    company?: {
      id?: string;
      companyName?: string;
    };
    internship?: {
      id?: string;
      title?: string;
    };
    posting?: {
      title?: string;
      company?: {
        companyName?: string;
      };
    };
  };
  evaluator?: {
    id: string;
    fullName: string;
    role: string;
    email: string;
  };
  crossVerifiedBy?: {
    id: string;
    profile?: {
      fullName: string;
    };
  };
}

export const fetchEvaluationsBackend = async (
  filters?: { assignmentId?: string; studentId?: string; evaluationType?: string; status?: string }
): Promise<EvaluationRecord[]> => {
  try {
    const res = await apiClient.get<any>('/evaluations', { params: filters });
    const items = res.data?.data || res.data || [];
    return Array.isArray(items) ? items : [];
  } catch (err: any) {
    console.error('[fetchEvaluationsBackend] Error:', err);
    return [];
  }
};

export const createEvaluationBackend = async (input: {
  assignmentId: string;
  evaluationType: 'mid_term' | 'final' | 'monthly' | 'milestone_review' | string;
  evaluationPeriod?: string;
  technicalSkills?: number;
  qualityOfWork?: number;
  problemSolving?: number;
  communication?: number;
  teamwork?: number;
  professionalism?: number;
  timeManagement?: number;
  initiative?: number;
  overallRating?: number;
  overallScore?: number;
  criteriaScores?: Record<string, any>;
  strengths?: string;
  improvementAreas?: string;
  comments?: string;
  notes?: string;
  status?: 'draft' | 'submitted';
}): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    const res = await apiClient.post<any>('/evaluations', input);
    return { success: true, data: res.data };
  } catch (err: any) {
    console.error('[createEvaluationBackend] Error:', err);
    return {
      success: false,
      error: err.response?.data?.message || err.message || 'Failed to submit evaluation.',
    };
  }
};

export const updateEvaluationStatusBackend = async (
  id: string,
  input: {
    status: 'draft' | 'submitted' | 'pending_verification' | 'verified' | 'correction_required';
    discrepancyNotes?: string;
  }
): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    const res = await apiClient.patch<any>(`/evaluations/${id}/status`, input);
    return { success: true, data: res.data };
  } catch (err: any) {
    console.error('[updateEvaluationStatusBackend] Error:', err);
    return {
      success: false,
      error: err.response?.data?.message || err.message || 'Failed to update evaluation status.',
    };
  }
};

// 4. Health Scores
export interface HealthScoreRecord {
  id: string;
  assignmentId: string;
  snapshotDate: string;
  attendanceScore: number;
  taskCompletionScore: number;
  milestoneScore: number;
  workLogScore: number;
  compositeScore: number;
  riskStatus: 'healthy' | 'needs_attention' | 'critical';
  assignment?: {
    id: string;
    studentId: string;
    student?: {
      id: string;
      studentId: string;
      profile?: {
        fullName: string;
        email: string;
      };
    };
    company?: {
      companyName: string;
    };
    internship?: {
      title: string;
      workMode: string;
    };
  };
}

export const fetchHealthScoresBackend = async (): Promise<HealthScoreRecord[]> => {
  try {
    const res = await apiClient.get<any>('/health-scores');
    const items = res.data?.data || res.data || [];
    return Array.isArray(items) ? items : [];
  } catch (err: any) {
    console.error('[fetchHealthScoresBackend] Error:', err);
    return [];
  }
};

// 5. Placement Readiness
export interface PlacementReadinessRecord {
  id: string;
  studentId: string;
  readinessScore: number;
  readinessStatus?: string;
  skillScore: number;
  internshipScore: number;
  evaluationScore: number;
  computedAt: string;
  student?: {
    id: string;
    studentId: string;
    course: string;
    batchYear: string;
    department?: {
      id: string;
      name: string;
      code: string;
    };
    profile?: {
      id: string;
      fullName: string;
      email: string;
    };
  };
}

export const fetchPlacementReadinessBackend = async (): Promise<PlacementReadinessRecord[]> => {
  try {
    const res = await apiClient.get<any>('/placement-readiness');
    const items = res.data?.data || res.data || [];
    return Array.isArray(items) ? items : [];
  } catch (err: any) {
    console.error('[fetchPlacementReadinessBackend] Error:', err);
    return [];
  }
};

// 6. Faculty Profile Update
export interface UpdateFacultyProfileInput {
  fullName?: string;
  phone?: string | null;
  designation?: string;
  cabinLocation?: string;
}

export const updateFacultyProfileBackend = async (
  input: UpdateFacultyProfileInput
): Promise<{ success: boolean; data?: AuthUser; error?: string }> => {
  try {
    const res = await apiClient.patch<AuthUser>('/auth/me', input);
    return { success: true, data: res.data };
  } catch (err: any) {
    console.error('[updateFacultyProfileBackend] Error:', err);
    return {
      success: false,
      error: err.response?.data?.message || err.message || 'Failed to update faculty profile.',
    };
  }
};

/* ====================================================================
   SLICE 22: COMPANY UI BACKEND SERVICES
   ==================================================================== */

// 1. Company Profile
export interface UpdateCompanyProfileInput {
  companyName?: string;
  industryDomain?: string;
  contactPerson?: string;
  phone?: string;
  website?: string;
  companyAddress?: string;
  geoLat?: number;
  geoLng?: number;
  geoFenceRadiusM?: number;
  avatarUrl?: string;
}

export const updateCompanyProfileBackend = async (
  input: UpdateCompanyProfileInput
): Promise<{ success: boolean; data?: AuthUser; error?: string }> => {
  try {
    const res = await apiClient.patch<AuthUser>('/auth/me', input);
    return { success: true, data: res.data };
  } catch (err: any) {
    console.error('[updateCompanyProfileBackend] Error:', err);
    return {
      success: false,
      error: err.response?.data?.message || err.message || 'Failed to update company profile.',
    };
  }
};

// 2. Company Mentors
export interface CompanyMentorBackendRecord {
  id: string;
  name: string;
  email: string;
  phone?: string;
  department: string;
  designation: string;
  status: 'Active' | 'Inactive';
  expertiseAreas?: string[];
  assignedInternships?: Array<{
    assignmentId: string;
    internshipId: string;
    title: string;
    status: string;
    studentName: string;
    studentEmail: string;
  }>;
  assignedInternship?: { id: string; title: string } | null;
  assignedInternsCount?: number;
}

export const fetchCompanyMentorsBackend = async (): Promise<CompanyMentorBackendRecord[]> => {
  try {
    const res = await apiClient.get<any>('/company/mentors');
    const items = res.data?.data || res.data || [];
    return Array.isArray(items) ? items : [];
  } catch (err: any) {
    console.error('[fetchCompanyMentorsBackend] Error:', err);
    return [];
  }
};

export const createCompanyMentorBackend = async (
  input: { name: string; email: string; phone?: string; department?: string; designation: string; expertiseAreas?: string[]; password?: string }
): Promise<{ success: boolean; data?: CompanyMentorBackendRecord; error?: string }> => {
  try {
    const res = await apiClient.post<any>('/company/mentors', input);
    return { success: true, data: res.data?.data || res.data };
  } catch (err: any) {
    console.error('[createCompanyMentorBackend] Error:', err);
    return {
      success: false,
      error: err.response?.data?.message || err.message || 'Failed to create industry mentor.',
    };
  }
};

export const updateCompanyMentorBackend = async (
  mentorId: string,
  input: { name?: string; phone?: string; department?: string; designation?: string; status?: string; expertiseAreas?: string[] }
): Promise<{ success: boolean; data?: CompanyMentorBackendRecord; error?: string }> => {
  try {
    const res = await apiClient.patch<any>(`/company/mentors/${mentorId}`, input);
    return { success: true, data: res.data?.data || res.data };
  } catch (err: any) {
    console.error('[updateCompanyMentorBackend] Error:', err);
    return {
      success: false,
      error: err.response?.data?.message || err.message || 'Failed to update industry mentor.',
    };
  }
};

export const assignCompanyMentorBackend = async (
  mentorId: string,
  internshipId?: string | null
): Promise<{ success: boolean; error?: string }> => {
  try {
    await apiClient.post<any>(`/company/mentors/${mentorId}/assign`, { internshipId });
    return { success: true };
  } catch (err: any) {
    console.error('[assignCompanyMentorBackend] Error:', err);
    return {
      success: false,
      error: err.response?.data?.message || err.message || 'Failed to assign mentor to internship.',
    };
  }
};

// 3. Company Tasks & Submissions
export const fetchCompanyTasksBackend = async (
  filters?: { assignmentId?: string; studentId?: string; status?: string }
): Promise<any[]> => {
  try {
    const res = await apiClient.get<any>('/tasks', { params: filters });
    const items = res.data?.data || res.data || [];
    return Array.isArray(items) ? items : [];
  } catch (err: any) {
    console.error('[fetchCompanyTasksBackend] Error:', err);
    return [];
  }
};

export const reviewCompanyTaskSubmissionBackend = async (
  taskId: string,
  submissionId: string,
  input: { reviewStatus: 'verified' | 'correction_required' | 'rejected'; feedback?: string }
): Promise<{ success: boolean; error?: string }> => {
  try {
    await apiClient.patch<any>(`/tasks/${taskId}/submissions/${submissionId}`, input);
    return { success: true };
  } catch (err: any) {
    console.error('[reviewCompanyTaskSubmissionBackend] Error:', err);
    return {
      success: false,
      error: err.response?.data?.message || err.message || 'Failed to review task submission.',
    };
  }
};

// 4. Company Milestones
export const fetchCompanyMilestonesBackend = async (
  filters?: { assignmentId?: string; status?: string }
): Promise<any[]> => {
  try {
    const res = await apiClient.get<any>('/milestones', { params: filters });
    const items = res.data?.data || res.data || [];
    return Array.isArray(items) ? items : [];
  } catch (err: any) {
    console.error('[fetchCompanyMilestonesBackend] Error:', err);
    return [];
  }
};

export const verifyCompanyMilestoneBackend = async (
  milestoneId: string,
  input: { status: 'verified' | 'correction_required'; comments?: string }
): Promise<{ success: boolean; error?: string }> => {
  try {
    await apiClient.post<any>(`/milestones/${milestoneId}/verify`, input);
    return { success: true };
  } catch (err: any) {
    console.error('[verifyCompanyMilestoneBackend] Error:', err);
    return {
      success: false,
      error: err.response?.data?.message || err.message || 'Failed to verify milestone.',
    };
  }
};

// 5. Company Certificates
export const fetchCompanyCertificatesBackend = async (): Promise<any[]> => {
  try {
    const res = await apiClient.get<any>('/certificates');
    const items = res.data?.data || res.data || [];
    return Array.isArray(items) ? items : [];
  } catch (err: any) {
    console.error('[fetchCompanyCertificatesBackend] Error:', err);
    return [];
  }
};

export const issueCompanyCertificateBackend = async (
  input: { assignmentId: string; grade?: string; remarks?: string; certificatePdfUrl?: string }
): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    const res = await apiClient.post<any>('/certificates', input);
    return { success: true, data: res.data?.data || res.data };
  } catch (err: any) {
    console.error('[issueCompanyCertificateBackend] Error:', err);
    return {
      success: false,
      error: err.response?.data?.message || err.message || 'Failed to issue certificate.',
    };
  }
};

export const revokeCompanyCertificateBackend = async (
  id: string,
  reason: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    await apiClient.post<any>(`/certificates/${id}/revoke`, { reason });
    return { success: true };
  } catch (err: any) {
    console.error('[revokeCompanyCertificateBackend] Error:', err);
    return {
      success: false,
      error: err.response?.data?.message || err.message || 'Failed to revoke certificate.',
    };
  }
};

// 6. Company PPO Offers
export const fetchCompanyPPOsBackend = async (): Promise<any[]> => {
  try {
    const res = await apiClient.get<any>('/ppo-offers');
    const items = res.data?.data || res.data || [];
    return Array.isArray(items) ? items : [];
  } catch (err: any) {
    console.error('[fetchCompanyPPOsBackend] Error:', err);
    return [];
  }
};

export const createCompanyPPOBackend = async (
  input: {
    assignmentId: string;
    studentId?: string;
    positionTitle?: string;
    salaryPackage?: string;
    joiningDate?: string;
    location?: string;
    bondTerms?: string;
    offerLetterUrl?: string;
    status?: string;
    ctcAnnualLpa?: number;
    compensationDetails?: any;
    termsConditions?: string;
    offerValidUntil?: string;
    remarks?: string;
    [key: string]: any;
  }
): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    const res = await apiClient.post<any>('/ppo-offers', input);
    return { success: true, data: res.data?.data || res.data };
  } catch (err: any) {
    console.error('[createCompanyPPOBackend] Error:', err);
    return {
      success: false,
      error: err.response?.data?.message || err.message || 'Failed to create PPO offer.',
    };
  }
};

export const updateCompanyPPOBackend = async (
  id: string,
  input: any
): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    const res = await apiClient.patch<any>(`/ppo-offers/${id}`, input);
    return { success: true, data: res.data?.data || res.data };
  } catch (err: any) {
    console.error('[updateCompanyPPOBackend] Error:', err);
    return {
      success: false,
      error: err.response?.data?.message || err.message || 'Failed to update PPO offer.',
    };
  }
};

export const deleteCompanyPPOBackend = async (
  id: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    await apiClient.delete<any>(`/ppo-offers/${id}`);
    return { success: true };
  } catch (err: any) {
    console.error('[deleteCompanyPPOBackend] Error:', err);
    return {
      success: false,
      error: err.response?.data?.message || err.message || 'Failed to delete PPO offer.',
    };
  }
};

// 7. Company Evaluations
export const fetchCompanyEvaluationsBackend = async (
  assignmentId?: string
): Promise<any[]> => {
  try {
    const res = await apiClient.get<any>('/evaluations', {
      params: assignmentId ? { assignmentId } : undefined,
    });
    const items = res.data?.data || res.data || [];
    return Array.isArray(items) ? items : [];
  } catch (err: any) {
    console.error('[fetchCompanyEvaluationsBackend] Error:', err);
    return [];
  }
};

export const createCompanyEvaluationBackend = async (
  input: any
): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    const res = await apiClient.post<any>('/evaluations', input);
    return { success: true, data: res.data?.data || res.data };
  } catch (err: any) {
    console.error('[createCompanyEvaluationBackend] Error:', err);
    return {
      success: false,
      error: err.response?.data?.message || err.message || 'Failed to create evaluation.',
    };
  }
};

export const updateCompanyEvaluationBackend = async (
  id: string,
  input: any
): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    const res = await apiClient.patch<any>(`/evaluations/${id}`, input);
    return { success: true, data: res.data?.data || res.data };
  } catch (err: any) {
    console.error('[updateCompanyEvaluationBackend] Error:', err);
    return {
      success: false,
      error: err.response?.data?.message || err.message || 'Failed to update evaluation.',
    };
  }
};

// 8. Company Notifications
export const fetchCompanyNotificationsBackend = async (): Promise<any[]> => {
  try {
    const res = await apiClient.get<any>('/notifications');
    const items = res.data?.data || res.data || [];
    return Array.isArray(items) ? items : [];
  } catch (err: any) {
    console.error('[fetchCompanyNotificationsBackend] Error:', err);
    return [];
  }
};

export const markCompanyNotificationReadBackend = async (
  id: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    await apiClient.patch<any>(`/notifications/${id}/read`);
    return { success: true };
  } catch (err: any) {
    console.error('[markCompanyNotificationReadBackend] Error:', err);
    return {
      success: false,
      error: err.response?.data?.message || err.message || 'Failed to mark notification read.',
    };
  }
};

export const markCompanyNotificationUnreadBackend = async (
  id: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    await apiClient.patch<any>(`/notifications/${id}/unread`);
    return { success: true };
  } catch (err: any) {
    console.error('[markCompanyNotificationUnreadBackend] Error:', err);
    return {
      success: false,
      error: err.response?.data?.message || err.message || 'Failed to mark notification unread.',
    };
  }
};

export const markAllCompanyNotificationsReadBackend = async (): Promise<{
  success: boolean;
  error?: string;
}> => {
  try {
    await apiClient.patch<any>('/notifications/mark-all-read');
    return { success: true };
  } catch (err: any) {
    console.error('[markAllCompanyNotificationsReadBackend] Error:', err);
    return {
      success: false,
      error: err.response?.data?.message || err.message || 'Failed to mark all read.',
    };
  }
};

export const deleteCompanyNotificationBackend = async (
  id: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    await apiClient.delete<any>(`/notifications/${id}`);
    return { success: true };
  } catch (err: any) {
    console.error('[deleteCompanyNotificationBackend] Error:', err);
    return {
      success: false,
      error: err.response?.data?.message || err.message || 'Failed to delete notification.',
    };
  }
};

// 9. Company Attendance Review
export const fetchCompanyAttendanceBackend = async (
  filters?: { assignmentId?: string; startDate?: string; endDate?: string; status?: string }
): Promise<any[]> => {
  try {
    const res = await apiClient.get<any>('/attendance', { params: filters });
    const items = res.data?.data || res.data || [];
    return Array.isArray(items) ? items : [];
  } catch (err: any) {
    console.error('[fetchCompanyAttendanceBackend] Error:', err);
    return [];
  }
};

export const updateCompanyAttendanceRecordBackend = async (
  id: string,
  input: any
): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    const res = await apiClient.patch<any>(`/attendance/${id}`, input);
    return { success: true, data: res.data?.data || res.data };
  } catch (err: any) {
    console.error('[updateCompanyAttendanceRecordBackend] Error:', err);
    return {
      success: false,
      error: err.response?.data?.message || err.message || 'Failed to update attendance record.',
    };
  }
};

// 10. Company Weekly Reports Review
export const fetchCompanyWeeklyReportsBackend = async (
  filters?: { assignmentId?: string; weekStartDate?: string; weekEndDate?: string }
): Promise<any[]> => {
  try {
    const res = await apiClient.get<any>('/weekly-reports', { params: filters });
    const items = res.data?.data || res.data || [];
    return Array.isArray(items) ? items : [];
  } catch (err: any) {
    console.error('[fetchCompanyWeeklyReportsBackend] Error:', err);
    return [];
  }
};

export const reviewCompanyWeeklyReportBackend = async (
  id: string,
  input: { feedback: string; rating?: number }
): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    const res = await apiClient.patch<any>(`/weekly-reports/${id}`, input);
    return { success: true, data: res.data?.data || res.data };
  } catch (err: any) {
    console.error('[reviewCompanyWeeklyReportBackend] Error:', err);
    return {
      success: false,
      error: err.response?.data?.message || err.message || 'Failed to review weekly report.',
    };
  }
};

export const fetchCompanyInternsBackend = fetchCompanyActiveInternsBackend;
export const updateCompanyTaskStatusBackend = updateStudentTaskStatusBackend;

// ─────────────────────────────────────────────────────────────────────────────
// Mentor Portal API Services (Slice 23)
// ─────────────────────────────────────────────────────────────────────────────

export const fetchMentorMilestonesBackend = async (
  filters?: { studentId?: string; status?: string }
): Promise<any[]> => {
  try {
    const res = await apiClient.get<any>('/milestones', { params: filters });
    const items = res.data?.data || res.data || [];
    return Array.isArray(items) ? items : [];
  } catch (err: any) {
    console.error('[fetchMentorMilestonesBackend] Error:', err);
    return [];
  }
};

export const fetchMentorEvaluationsBackend = async (
  filters?: { studentId?: string; status?: string }
): Promise<any[]> => {
  try {
    const res = await apiClient.get<any>('/evaluations', { params: filters });
    const items = res.data?.data || res.data || [];
    return Array.isArray(items) ? items : [];
  } catch (err: any) {
    console.error('[fetchMentorEvaluationsBackend] Error:', err);
    return [];
  }
};

export const createMentorEvaluationBackend = async (
  input: any
): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    const res = await apiClient.post<any>('/evaluations', input);
    return { success: true, data: res.data?.data || res.data };
  } catch (err: any) {
    console.error('[createMentorEvaluationBackend] Error:', err);
    return {
      success: false,
      error: err.response?.data?.message || err.message || 'Failed to submit evaluation.',
    };
  }
};

export const updateMentorEvaluationBackend = async (
  id: string,
  input: any
): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    const res = await apiClient.patch<any>(`/evaluations/${id}`, input);
    return { success: true, data: res.data?.data || res.data };
  } catch (err: any) {
    console.error('[updateMentorEvaluationBackend] Error:', err);
    return {
      success: false,
      error: err.response?.data?.message || err.message || 'Failed to update evaluation.',
    };
  }
};

export const fetchMentorNotificationsBackend = async (): Promise<any[]> => {
  try {
    const res = await apiClient.get<any>('/notifications');
    const items = res.data?.data?.notifications || res.data?.notifications || res.data?.data || res.data || [];
    return Array.isArray(items) ? items : [];
  } catch (err: any) {
    console.error('[fetchMentorNotificationsBackend] Error:', err);
    return [];
  }
};

export const markMentorNotificationReadBackend = async (
  id: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    await apiClient.patch<any>(`/notifications/${id}/read`);
    return { success: true };
  } catch (err: any) {
    console.error('[markMentorNotificationReadBackend] Error:', err);
    return {
      success: false,
      error: err.response?.data?.message || err.message || 'Failed to mark notification as read.',
    };
  }
};

export const markAllMentorNotificationsReadBackend = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    await apiClient.patch<any>('/notifications/read-all');
    return { success: true };
  } catch (err: any) {
    console.error('[markAllMentorNotificationsReadBackend] Error:', err);
    return {
      success: false,
      error: err.response?.data?.message || err.message || 'Failed to mark all notifications as read.',
    };
  }
};
