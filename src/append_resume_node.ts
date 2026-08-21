import * as fs from 'fs';

const filePath = 'src/services/api/backendService.ts';
let code = fs.readFileSync(filePath, 'utf-8');

const resumeFunc = `
// Upload Student Resume PDF to Supabase Storage and persist URL in student_profiles
export const uploadStudentResumeBackend = async (
  file: File
): Promise<{ success: boolean; url?: string; fileName?: string; error?: string }> => {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase backend is not configured in .env file.' };
  }

  const { data: authData } = await supabase.auth.getUser();
  if (!authData?.user) {
    return { success: false, error: 'User is not authenticated.' };
  }

  const userId = authData.user.id;

  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    return { success: false, error: 'Only PDF files (.pdf) are allowed for resumes.' };
  }

  const MAX_SIZE = 5 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    return { success: false, error: 'Resume file size must be less than 5MB.' };
  }

  const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storagePath = userId + '/' + Date.now() + '_' + sanitizedFileName;

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('resumes')
    .upload(storagePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (uploadError) {
    return { success: false, error: 'Storage upload failed: ' + uploadError.message };
  }

  const { data: publicUrlData } = supabase.storage.from('resumes').getPublicUrl(uploadData.path);
  const publicUrl = publicUrlData.publicUrl;

  const { error: dbError } = await supabase
    .from('student_profiles')
    .update({
      resume_url: publicUrl,
      resume_filename: file.name,
      resume_path: uploadData.path,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (dbError) {
    return { success: false, error: 'Database update failed: ' + dbError.message };
  }

  return {
    success: true,
    url: publicUrl,
    fileName: file.name,
  };
};
`;

fs.writeFileSync(filePath, code + '\n' + resumeFunc);
