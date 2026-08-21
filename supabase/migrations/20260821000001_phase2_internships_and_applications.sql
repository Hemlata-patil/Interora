-- 20260821000001_phase2_internships_and_applications.sql

-- 1. Table: public.internship_postings
CREATE TABLE IF NOT EXISTS public.internship_postings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.company_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    industry_domain TEXT NOT NULL,
    location TEXT NULL DEFAULT 'Remote / On-site',
    internship_type TEXT NULL DEFAULT 'Full-time',
    duration TEXT NULL DEFAULT '3 Months',
    stipend TEXT NULL DEFAULT 'Unpaid / Paid',
    eligibility TEXT NULL DEFAULT 'All Eligible',
    skills TEXT[] NOT NULL DEFAULT '{}',
    application_deadline TIMESTAMPTZ NULL,
    status TEXT NOT NULL DEFAULT 'open',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Table: public.student_applications
CREATE TABLE IF NOT EXISTS public.student_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    internship_id UUID NOT NULL REFERENCES public.internship_postings(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'Submitted',
    cover_letter TEXT NULL,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_student_internship_application UNIQUE (internship_id, student_id)
);

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_internship_postings_company ON public.internship_postings(company_id);
CREATE INDEX IF NOT EXISTS idx_internship_postings_status ON public.internship_postings(status);
CREATE INDEX IF NOT EXISTS idx_student_applications_internship ON public.student_applications(internship_id);
CREATE INDEX IF NOT EXISTS idx_student_applications_student ON public.student_applications(student_id);
CREATE INDEX IF NOT EXISTS idx_student_applications_status ON public.student_applications(status);

-- 4. Enable Row Level Security
ALTER TABLE public.internship_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_applications ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies: internship_postings

-- Anyone authenticated can view open/active internship postings, approved companies can view their own, admin can view all
DROP POLICY IF EXISTS "Internship Postings SELECT policy" ON public.internship_postings;
CREATE POLICY "Internship Postings SELECT policy" ON public.internship_postings
    FOR SELECT USING (
        status = 'open'
        OR company_id = auth.uid()
        OR public.is_admin()
    );

-- Approved companies can insert postings for their own company_id
DROP POLICY IF EXISTS "Internship Postings INSERT policy" ON public.internship_postings;
CREATE POLICY "Internship Postings INSERT policy" ON public.internship_postings
    FOR INSERT WITH CHECK (
        company_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.company_profiles 
            WHERE id = auth.uid() AND approval_status = 'approved'::public.company_status
        )
    );

-- Approved companies can update/delete their own postings, admin can manage all
DROP POLICY IF EXISTS "Internship Postings UPDATE policy" ON public.internship_postings;
CREATE POLICY "Internship Postings UPDATE policy" ON public.internship_postings
    FOR UPDATE USING (
        company_id = auth.uid() OR public.is_admin()
    );

DROP POLICY IF EXISTS "Internship Postings DELETE policy" ON public.internship_postings;
CREATE POLICY "Internship Postings DELETE policy" ON public.internship_postings
    FOR DELETE USING (
        company_id = auth.uid() OR public.is_admin()
    );

-- 6. RLS Policies: student_applications

-- Students can view their own applications; companies can view applications for their postings; admin can view all
DROP POLICY IF EXISTS "Student Applications SELECT policy" ON public.student_applications;
CREATE POLICY "Student Applications SELECT policy" ON public.student_applications
    FOR SELECT USING (
        student_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.internship_postings ip
            WHERE ip.id = student_applications.internship_id AND ip.company_id = auth.uid()
        )
        OR public.is_admin()
    );

-- Students can create applications for themselves
DROP POLICY IF EXISTS "Student Applications INSERT policy" ON public.student_applications;
CREATE POLICY "Student Applications INSERT policy" ON public.student_applications
    FOR INSERT WITH CHECK (
        student_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'student'::public.app_role AND account_status = 'active'::public.account_status
        )
    );

-- Companies can update status of applications for their own postings; students can update cover_letter of their own applications; admin can update all
DROP POLICY IF EXISTS "Student Applications UPDATE policy" ON public.student_applications;
CREATE POLICY "Student Applications UPDATE policy" ON public.student_applications
    FOR UPDATE USING (
        student_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.internship_postings ip
            WHERE ip.id = student_applications.internship_id AND ip.company_id = auth.uid()
        )
        OR public.is_admin()
    );
