-- 20260821000007_phase20_resumes_storage.sql

-- Ensure student_profiles has resume_url and resume_filename columns
ALTER TABLE public.student_profiles 
ADD COLUMN IF NOT EXISTS resume_url TEXT NULL,
ADD COLUMN IF NOT EXISTS resume_filename TEXT NULL;

-- CREATE BUCKET FOR RESUMES IN STORAGE SCHEMA IF NOT EXISTS
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', true)
ON CONFLICT (id) DO NOTHING;

-- DROP EXISTING STORAGE POLICIES IF PRESENT
DROP POLICY IF EXISTS "Public Resumes Access" ON storage.objects;
DROP POLICY IF EXISTS "Student Upload Resume Policy" ON storage.objects;
DROP POLICY IF EXISTS "Student Update Resume Policy" ON storage.objects;
DROP POLICY IF EXISTS "Student Delete Resume Policy" ON storage.objects;

-- CREATE RLS STORAGE POLICIES
CREATE POLICY "Public Resumes Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'resumes');

CREATE POLICY "Student Upload Resume Policy"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Student Update Resume Policy"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Student Delete Resume Policy"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);
