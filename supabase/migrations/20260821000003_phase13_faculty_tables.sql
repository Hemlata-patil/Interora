-- PHASE 13: FACULTY / INSTITUTE MENTOR FOUNDATION TABLES & RLS

-- 1. Faculty to Student Assignment Relationship Table
CREATE TABLE IF NOT EXISTS public.faculty_student_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    faculty_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'Active',
    UNIQUE(faculty_id, student_id)
);

-- 2. Faculty Guidance Notes Table
CREATE TABLE IF NOT EXISTS public.faculty_guidance_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    faculty_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    category TEXT NOT NULL DEFAULT 'General',
    note TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_faculty_assignments_faculty ON public.faculty_student_assignments(faculty_id);
CREATE INDEX IF NOT EXISTS idx_faculty_assignments_student ON public.faculty_student_assignments(student_id);
CREATE INDEX IF NOT EXISTS idx_faculty_notes_faculty ON public.faculty_guidance_notes(faculty_id);
CREATE INDEX IF NOT EXISTS idx_faculty_notes_student ON public.faculty_guidance_notes(student_id);

-- ENABLE RLS
ALTER TABLE public.faculty_student_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty_guidance_notes ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES FOR FACULTY_STUDENT_ASSIGNMENTS
CREATE POLICY "Faculty can view their own student assignments"
    ON public.faculty_student_assignments FOR SELECT
    USING (auth.uid() = faculty_id OR auth.uid() = student_id);

CREATE POLICY "Faculty can insert student assignments"
    ON public.faculty_student_assignments FOR INSERT
    WITH CHECK (auth.uid() = faculty_id);

-- RLS POLICIES FOR FACULTY_GUIDANCE_NOTES
CREATE POLICY "Faculty and assigned student can view notes"
    ON public.faculty_guidance_notes FOR SELECT
    USING (auth.uid() = faculty_id OR auth.uid() = student_id);

CREATE POLICY "Faculty can insert guidance notes"
    ON public.faculty_guidance_notes FOR INSERT
    WITH CHECK (auth.uid() = faculty_id);
