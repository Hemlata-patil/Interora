-- PHASE 15: ADMIN PORTAL FOUNDATION TABLES & RLS

-- 1. Admin PPO Approvals Table
CREATE TABLE IF NOT EXISTS public.admin_ppo_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES public.company_profiles(id) ON DELETE CASCADE,
    position_title TEXT NOT NULL,
    salary_package TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending Verification', -- 'Approved', 'Pending Verification', 'Rejected'
    approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_admin_ppo_student ON public.admin_ppo_approvals(student_id);
CREATE INDEX IF NOT EXISTS idx_admin_ppo_company ON public.admin_ppo_approvals(company_id);

-- ENABLE RLS
ALTER TABLE public.admin_ppo_approvals ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES FOR ADMIN_PPO_APPROVALS
CREATE POLICY "Admin users can manage PPO approvals"
    ON public.admin_ppo_approvals FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
    ));

CREATE POLICY "Students can view their own PPOs"
    ON public.admin_ppo_approvals FOR SELECT
    USING (auth.uid() = student_id);

CREATE POLICY "Companies can view their own PPOs"
    ON public.admin_ppo_approvals FOR SELECT
    USING (auth.uid() = company_id);
