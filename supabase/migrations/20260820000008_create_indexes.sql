-- 20260820000008_create_indexes.sql
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_account_status ON public.profiles(account_status);
CREATE INDEX IF NOT EXISTS idx_student_profiles_student_id ON public.student_profiles(student_id);
CREATE INDEX IF NOT EXISTS idx_student_profiles_faculty ON public.student_profiles(assigned_faculty_id);
CREATE INDEX IF NOT EXISTS idx_company_profiles_email ON public.company_profiles(official_email);
CREATE INDEX IF NOT EXISTS idx_company_profiles_approval ON public.company_profiles(approval_status);
CREATE INDEX IF NOT EXISTS idx_company_profiles_domain ON public.company_profiles(industry_domain);
