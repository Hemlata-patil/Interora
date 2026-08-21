-- Phase 4: Foundation tables for student persistence features

-- 1. Attendance Records
CREATE TABLE IF NOT EXISTS public.attendance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    internship_id UUID REFERENCES public.internship_postings(id) ON DELETE SET NULL,
    attendance_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late', 'leave')),
    check_in_time TIMESTAMPTZ,
    check_out_time TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Chat Architecture
CREATE TABLE IF NOT EXISTS public.chat_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.chat_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    UNIQUE(conversation_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Career Progress
CREATE TABLE IF NOT EXISTS public.career_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    module_key TEXT NOT NULL,
    progress_percent INTEGER NOT NULL DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(student_id, module_key)
);

-- 4. Student Tasks
CREATE TABLE IF NOT EXISTS public.student_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    due_date DATE,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Student Milestones
CREATE TABLE IF NOT EXISTS public.student_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    internship_id UUID REFERENCES public.internship_postings(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    due_date DATE,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Student Evaluations (Strict Protection: Read-Only for Students)
CREATE TABLE IF NOT EXISTS public.student_evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    internship_id UUID REFERENCES public.internship_postings(id) ON DELETE SET NULL,
    evaluator_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    rating NUMERIC(3, 2) CHECK (rating >= 0 AND rating <= 5.0),
    feedback TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Student Certificates (Strict Protection: Read-Only for Students)
CREATE TABLE IF NOT EXISTS public.student_certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    internship_id UUID REFERENCES public.internship_postings(id) ON DELETE SET NULL,
    certificate_number TEXT NOT NULL UNIQUE,
    certificate_url TEXT,
    issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_attendance_student ON public.attendance_records(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON public.attendance_records(attendance_date);
CREATE INDEX IF NOT EXISTS idx_chat_participants_user ON public.chat_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conv ON public.chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_tasks_student ON public.student_tasks(student_id);
CREATE INDEX IF NOT EXISTS idx_milestones_student ON public.student_milestones(student_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_student ON public.student_evaluations(student_id);
CREATE INDEX IF NOT EXISTS idx_certificates_student ON public.student_certificates(student_id);

-- ROW LEVEL SECURITY (RLS) POLICIES

ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_certificates ENABLE ROW LEVEL SECURITY;

-- attendance_records RLS
CREATE POLICY "Students can view own attendance" ON public.attendance_records
    FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Students can insert own attendance" ON public.attendance_records
    FOR INSERT WITH CHECK (auth.uid() = student_id);

-- chat RLS
CREATE POLICY "Users can view conversations they participate in" ON public.chat_conversations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.chat_participants
            WHERE chat_participants.conversation_id = chat_conversations.id
              AND chat_participants.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view participants of their conversations" ON public.chat_participants
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.chat_participants p
            WHERE p.conversation_id = chat_participants.conversation_id
              AND p.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view messages in their conversations" ON public.chat_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.chat_participants
            WHERE chat_participants.conversation_id = chat_messages.conversation_id
              AND chat_participants.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can send messages to their conversations" ON public.chat_messages
    FOR INSERT WITH CHECK (
        auth.uid() = sender_id AND
        EXISTS (
            SELECT 1 FROM public.chat_participants
            WHERE chat_participants.conversation_id = chat_messages.conversation_id
              AND chat_participants.user_id = auth.uid()
        )
    );

-- career_progress RLS
CREATE POLICY "Students can view own career progress" ON public.career_progress
    FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Students can insert/update own career progress" ON public.career_progress
    FOR ALL USING (auth.uid() = student_id) WITH CHECK (auth.uid() = student_id);

-- student_tasks RLS
CREATE POLICY "Students can manage own tasks" ON public.student_tasks
    FOR ALL USING (auth.uid() = student_id) WITH CHECK (auth.uid() = student_id);

-- student_milestones RLS
CREATE POLICY "Students can view own milestones" ON public.student_milestones
    FOR SELECT USING (auth.uid() = student_id);

-- student_evaluations RLS (Strict Read-Only for Students)
CREATE POLICY "Students can view own evaluations" ON public.student_evaluations
    FOR SELECT USING (auth.uid() = student_id);

-- student_certificates RLS (Strict Read-Only for Students)
CREATE POLICY "Students can view own certificates" ON public.student_certificates
    FOR SELECT USING (auth.uid() = student_id);
