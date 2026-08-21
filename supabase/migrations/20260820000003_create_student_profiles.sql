-- 20260820000003_create_student_profiles.sql
CREATE TABLE IF NOT EXISTS public.student_profiles (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    student_id TEXT NOT NULL UNIQUE,
    phone TEXT NULL,
    department TEXT NOT NULL,
    course TEXT NOT NULL,
    year_semester TEXT NOT NULL,
    assigned_faculty_id UUID NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
    skills TEXT[] NOT NULL DEFAULT '{}',
    resume_path TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
