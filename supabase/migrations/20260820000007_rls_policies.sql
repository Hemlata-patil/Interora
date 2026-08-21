-- 20260820000007_rls_policies.sql
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Profiles SELECT policy" ON public.profiles;
CREATE POLICY "Profiles SELECT policy" ON public.profiles
    FOR SELECT USING (
        auth.uid() = id OR public.is_admin()
    );

DROP POLICY IF EXISTS "Profiles UPDATE policy" ON public.profiles;
CREATE POLICY "Profiles UPDATE policy" ON public.profiles
    FOR UPDATE USING (
        auth.uid() = id OR public.is_admin()
    ) WITH CHECK (
        (auth.uid() = id AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()) AND account_status = (SELECT account_status FROM public.profiles WHERE id = auth.uid()))
        OR public.is_admin()
    );

-- Student Profiles Policies
DROP POLICY IF EXISTS "Student Profiles SELECT policy" ON public.student_profiles;
CREATE POLICY "Student Profiles SELECT policy" ON public.student_profiles
    FOR SELECT USING (
        auth.uid() = id 
        OR assigned_faculty_id = auth.uid()
        OR public.is_admin()
    );

DROP POLICY IF EXISTS "Student Profiles UPDATE policy" ON public.student_profiles;
CREATE POLICY "Student Profiles UPDATE policy" ON public.student_profiles
    FOR UPDATE USING (
        auth.uid() = id OR public.is_admin()
    );

-- Company Profiles Policies
DROP POLICY IF EXISTS "Company Profiles SELECT policy" ON public.company_profiles;
CREATE POLICY "Company Profiles SELECT policy" ON public.company_profiles
    FOR SELECT USING (
        auth.uid() = id 
        OR public.is_admin()
        OR approval_status = 'approved'::public.company_status
    );

DROP POLICY IF EXISTS "Company Profiles UPDATE policy" ON public.company_profiles;
CREATE POLICY "Company Profiles UPDATE policy" ON public.company_profiles
    FOR UPDATE USING (
        auth.uid() = id OR public.is_admin()
    ) WITH CHECK (
        (auth.uid() = id 
         AND approval_status = (SELECT approval_status FROM public.company_profiles WHERE id = auth.uid())
         AND rejection_reason IS NOT DISTINCT FROM (SELECT rejection_reason FROM public.company_profiles WHERE id = auth.uid())
         AND approved_at IS NOT DISTINCT FROM (SELECT approved_at FROM public.company_profiles WHERE id = auth.uid()))
        OR public.is_admin()
    );
