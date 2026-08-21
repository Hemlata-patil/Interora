-- PHASE 14: COMPANY MENTOR FOUNDATION TABLES & RLS

-- 1. Company Mentor Assignment Table
CREATE TABLE IF NOT EXISTS public.company_mentor_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mentor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES public.company_profiles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'Active',
    UNIQUE(mentor_id, student_id)
);

-- 2. Company Task Reviews & Proof Verification Table
CREATE TABLE IF NOT EXISTS public.company_task_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES public.student_tasks(id) ON DELETE CASCADE,
    mentor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    review_status TEXT NOT NULL DEFAULT 'Verified', -- 'Verified', 'Correction Required', 'Rejected'
    feedback TEXT,
    reviewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_company_mentor_assignments_mentor ON public.company_mentor_assignments(mentor_id);
CREATE INDEX IF NOT EXISTS idx_company_mentor_assignments_student ON public.company_mentor_assignments(student_id);
CREATE INDEX IF NOT EXISTS idx_company_task_reviews_task ON public.company_task_reviews(task_id);
CREATE INDEX IF NOT EXISTS idx_company_task_reviews_mentor ON public.company_task_reviews(mentor_id);

-- ENABLE RLS
ALTER TABLE public.company_mentor_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_task_reviews ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES FOR COMPANY_MENTOR_ASSIGNMENTS
CREATE POLICY "Mentors and interns can view their own assignments"
    ON public.company_mentor_assignments FOR SELECT
    USING (auth.uid() = mentor_id OR auth.uid() = student_id OR auth.uid() = company_id);

CREATE POLICY "Mentors or companies can insert assignments"
    ON public.company_mentor_assignments FOR INSERT
    WITH CHECK (auth.uid() = mentor_id OR auth.uid() = company_id);

-- RLS POLICIES FOR COMPANY_TASK_REVIEWS
CREATE POLICY "Mentors and interns can view task reviews"
    ON public.company_task_reviews FOR SELECT
    USING (auth.uid() = mentor_id OR EXISTS (
        SELECT 1 FROM public.student_tasks st WHERE st.id = task_id AND st.student_id = auth.uid()
    ));

CREATE POLICY "Mentors can insert task reviews"
    ON public.company_task_reviews FOR INSERT
    WITH CHECK (auth.uid() = mentor_id);
