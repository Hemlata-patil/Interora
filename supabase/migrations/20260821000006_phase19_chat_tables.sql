-- PHASE 19: CHAT TABLES ENSURE MIGRATION

CREATE TABLE IF NOT EXISTS public.chat_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.chat_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(conversation_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_chat_participants_user ON public.chat_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conv ON public.chat_messages(conversation_id);

-- ENABLE RLS
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- DROP EXISTING POLICIES IF PRESENT
DROP POLICY IF EXISTS "Users can view conversations they participate in" ON public.chat_conversations;
DROP POLICY IF EXISTS "Users can view chat participants" ON public.chat_participants;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can insert messages in their conversations" ON public.chat_messages;
DROP POLICY IF EXISTS "Authenticated users can select conversations" ON public.chat_conversations;
DROP POLICY IF EXISTS "Authenticated users can select participants" ON public.chat_participants;
DROP POLICY IF EXISTS "Authenticated users can select messages" ON public.chat_messages;

-- RE-CREATE POLICIES WITH AUTHENTICATED ACCESS
CREATE POLICY "Authenticated users can select conversations"
    ON public.chat_conversations FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can select participants"
    ON public.chat_participants FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can select messages"
    ON public.chat_messages FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can insert messages in their conversations"
    ON public.chat_messages FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = sender_id);
