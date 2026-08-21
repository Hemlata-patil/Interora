-- 20260820000006_company_approval_functions.sql
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS public.app_role AS $$
DECLARE
    u_role public.app_role;
BEGIN
    SELECT role INTO u_role
    FROM public.profiles
    WHERE id = auth.uid();
    RETURN u_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (public.get_current_user_role() = 'admin'::public.app_role);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.approve_company(target_company_id UUID)
RETURNS VOID AS $$
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Access Denied: Only administrators can approve company registrations.';
    END IF;

    UPDATE public.company_profiles
    SET approval_status = 'approved'::public.company_status,
        approved_at = NOW(),
        rejection_reason = NULL,
        updated_at = NOW()
    WHERE id = target_company_id;

    UPDATE public.profiles
    SET account_status = 'active'::public.account_status,
        updated_at = NOW()
    WHERE id = target_company_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.reject_company(target_company_id UUID, p_rejection_reason TEXT)
RETURNS VOID AS $$
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Access Denied: Only administrators can reject company registrations.';
    END IF;

    UPDATE public.company_profiles
    SET approval_status = 'rejected'::public.company_status,
        approved_at = NULL,
        rejection_reason = p_rejection_reason,
        updated_at = NOW()
    WHERE id = target_company_id;

    UPDATE public.profiles
    SET account_status = 'inactive'::public.account_status,
        updated_at = NOW()
    WHERE id = target_company_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
