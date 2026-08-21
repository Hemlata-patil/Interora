-- 20260820000004_create_company_profiles.sql
CREATE TABLE IF NOT EXISTS public.company_profiles (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    contact_person TEXT NOT NULL,
    official_email TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL,
    industry_domain TEXT NOT NULL,
    website TEXT NULL,
    company_address TEXT NULL,
    approval_status public.company_status NOT NULL DEFAULT 'pending',
    rejection_reason TEXT NULL,
    approved_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
