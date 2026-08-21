-- MIGRATION: 20260821000008_fix_chat_rls_and_storage.sql
-- Fix recursive policy on chat_participants and enable storage buckets

-- 1. DROP RECURSIVE CHAT POLICIES
DROP POLICY IF EXISTS "Users can view conversations they participate in" ON public.chat_conversations;
DROP POLICY IF EXISTS "Users can view participants of their conversations" ON public.chat_participants;
DROP POLICY IF EXISTS "Users can view chat participants" ON public.chat_participants;
DROP POLICY IF EXISTS "Authenticated users can select participants" ON public.chat_participants;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can send messages to their conversations" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can insert messages in their conversations" ON public.chat_messages;
DROP POLICY IF EXISTS "Authenticated users can select conversations" ON public.chat_conversations;
DROP POLICY IF EXISTS "Authenticated users can select messages" ON public.chat_messages;

-- 2. CREATE NON-RECURSIVE RLS POLICIES FOR CHAT
CREATE POLICY "Authenticated users can view conversations"
    ON public.chat_conversations FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can create conversations"
    ON public.chat_conversations FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Authenticated users can update conversations"
    ON public.chat_conversations FOR UPDATE
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can view chat participants"
    ON public.chat_participants FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can add chat participants"
    ON public.chat_participants FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Authenticated users can view chat messages"
    ON public.chat_messages FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can insert own messages"
    ON public.chat_messages FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = sender_id);

-- 3. STORAGE BUCKETS CONFIGURATION (resumes & proofs)
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('resumes', 'resumes', true),
    ('proofs', 'proofs', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- STORAGE POLICIES
DROP POLICY IF EXISTS "Public Resumes Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Resumes Upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Resumes Update" ON storage.objects;
DROP POLICY IF EXISTS "Public Proofs Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Proofs Upload" ON storage.objects;

CREATE POLICY "Public Resumes Access"
    ON storage.objects FOR SELECT
    USING (bucket_id IN ('resumes', 'proofs'));

CREATE POLICY "Authenticated Resumes Upload"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id IN ('resumes', 'proofs'));

CREATE POLICY "Authenticated Resumes Update"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id IN ('resumes', 'proofs'));
