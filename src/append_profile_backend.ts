import * as fs from 'fs';

const filePath = 'src/services/api/backendService.ts';
let code = fs.readFileSync(filePath, 'utf-8');

const profileFuncs = `
// Fetch Authenticated Student Profile Details
export const fetchStudentProfileBackend = async (): Promise<{
  fullName: string;
  email: string;
  phone: string;
  studentId: string;
  department: string;
  course: string;
  yearSemester: string;
  skills: string[];
  resumeUrl?: string;
  resumeFileName?: string;
} | null> => {
  if (!isSupabaseConfigured()) return null;

  const { data: authData } = await supabase.auth.getUser();
  if (!authData?.user) return null;

  const userId = authData.user.id;

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', userId)
    .single();

  const { data: sp } = await supabase
    .from('student_profiles')
    .select('student_id, phone, department, course, year_semester, skills, resume_url, resume_filename')
    .eq('id', userId)
    .single();

  if (!profile && !sp) return null;

  return {
    fullName: profile?.full_name || authData.user.user_metadata?.full_name || authData.user.email?.split('@')[0] || 'Student Candidate',
    email: profile?.email || authData.user.email || '',
    phone: sp?.phone || '+91 98765 43210',
    studentId: sp?.student_id || 'STU-' + userId.substring(0, 8).toUpperCase(),
    department: sp?.department || 'Computer Science & Engineering',
    course: sp?.course || 'Bachelor of Technology (B.Tech)',
    yearSemester: sp?.year_semester || '3rd Year / 6th Semester',
    skills: sp?.skills || [],
    resumeUrl: sp?.resume_url || undefined,
    resumeFileName: sp?.resume_filename || undefined,
  };
};

// Update Authenticated Student Profile Details
export const updateStudentProfileBackend = async (data: {
  fullName: string;
  phone: string;
  department: string;
  course: string;
  yearSemester: string;
  skills: string[];
}): Promise<{ success: boolean; error?: string }> => {
  if (!isSupabaseConfigured()) return { success: false, error: 'Supabase backend not configured.' };

  const { data: authData } = await supabase.auth.getUser();
  if (!authData?.user) return { success: false, error: 'Not authenticated.' };

  const userId = authData.user.id;

  // Update profiles table
  const { error: pError } = await supabase
    .from('profiles')
    .update({ full_name: data.fullName, updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (pError) return { success: false, error: pError.message };

  // Update student_profiles table
  const { error: spError } = await supabase
    .from('student_profiles')
    .upsert({
      id: userId,
      student_id: 'STU-' + userId.substring(0, 8).toUpperCase(),
      phone: data.phone,
      department: data.department,
      course: data.course,
      year_semester: data.yearSemester,
      skills: data.skills,
      updated_at: new Date().toISOString(),
    });

  if (spError) return { success: false, error: spError.message };

  return { success: true };
};
`;

fs.writeFileSync(filePath, code + '\n' + profileFuncs);
