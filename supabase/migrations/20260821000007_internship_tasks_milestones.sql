-- 20260821000007_internship_tasks_milestones.sql

-- 1. Table: public.internship_tasks
CREATE TABLE IF NOT EXISTS public.internship_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    internship_id UUID NOT NULL REFERENCES public.internship_postings(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT,
    due_date TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'Pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Table: public.internship_milestones
CREATE TABLE IF NOT EXISTS public.internship_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    internship_id UUID NOT NULL REFERENCES public.internship_postings(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    target_date TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'Pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Extend public.student_applications
ALTER TABLE public.student_applications 
ADD COLUMN IF NOT EXISTS faculty_rating NUMERIC(3,1) CHECK (faculty_rating >= 1 AND faculty_rating <= 5);

-- 4. Indexes
CREATE INDEX IF NOT EXISTS idx_internship_tasks_internship ON public.internship_tasks(internship_id);
CREATE INDEX IF NOT EXISTS idx_internship_milestones_internship ON public.internship_milestones(internship_id);

-- 5. Row Level Security for new tables
ALTER TABLE public.internship_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internship_milestones ENABLE ROW LEVEL SECURITY;

-- Internship Tasks RLS
-- Anyone authenticated can view tasks of open/active internship postings (or just companies and their students, but mirroring internship_postings is safest)
DROP POLICY IF EXISTS "Internship Tasks SELECT policy" ON public.internship_tasks;
CREATE POLICY "Internship Tasks SELECT policy" ON public.internship_tasks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.internship_postings ip
            WHERE ip.id = internship_tasks.internship_id
            AND (ip.status = 'open' OR ip.company_id = auth.uid() OR public.is_admin())
        )
    );

DROP POLICY IF EXISTS "Internship Tasks INSERT policy" ON public.internship_tasks;
CREATE POLICY "Internship Tasks INSERT policy" ON public.internship_tasks
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.internship_postings ip
            WHERE ip.id = internship_tasks.internship_id AND ip.company_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Internship Tasks UPDATE policy" ON public.internship_tasks;
CREATE POLICY "Internship Tasks UPDATE policy" ON public.internship_tasks
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.internship_postings ip
            WHERE ip.id = internship_tasks.internship_id AND ip.company_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Internship Tasks DELETE policy" ON public.internship_tasks;
CREATE POLICY "Internship Tasks DELETE policy" ON public.internship_tasks
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.internship_postings ip
            WHERE ip.id = internship_tasks.internship_id AND ip.company_id = auth.uid()
        )
    );

-- Internship Milestones RLS
DROP POLICY IF EXISTS "Internship Milestones SELECT policy" ON public.internship_milestones;
CREATE POLICY "Internship Milestones SELECT policy" ON public.internship_milestones
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.internship_postings ip
            WHERE ip.id = internship_milestones.internship_id
            AND (ip.status = 'open' OR ip.company_id = auth.uid() OR public.is_admin())
        )
    );

DROP POLICY IF EXISTS "Internship Milestones INSERT policy" ON public.internship_milestones;
CREATE POLICY "Internship Milestones INSERT policy" ON public.internship_milestones
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.internship_postings ip
            WHERE ip.id = internship_milestones.internship_id AND ip.company_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Internship Milestones UPDATE policy" ON public.internship_milestones;
CREATE POLICY "Internship Milestones UPDATE policy" ON public.internship_milestones
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.internship_postings ip
            WHERE ip.id = internship_milestones.internship_id AND ip.company_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Internship Milestones DELETE policy" ON public.internship_milestones;
CREATE POLICY "Internship Milestones DELETE policy" ON public.internship_milestones
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.internship_postings ip
            WHERE ip.id = internship_milestones.internship_id AND ip.company_id = auth.uid()
        )
    );
