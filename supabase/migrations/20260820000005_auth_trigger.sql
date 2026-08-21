-- 20260820000005_auth_trigger.sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    requested_role TEXT;
    init_account_status public.account_status;
BEGIN
    requested_role := LOWER(COALESCE(NEW.raw_user_meta_data->>'role', 'student'));
    
    IF requested_role NOT IN ('student', 'company') THEN
        requested_role := 'student';
    END IF;

    IF requested_role = 'company' THEN
        init_account_status := 'pending'::public.account_status;
    ELSE
        init_account_status := 'active'::public.account_status;
    END IF;

    INSERT INTO public.profiles (id, email, full_name, role, account_status)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'contact_person', 'User'),
        requested_role::public.app_role,
        init_account_status
    );

    IF requested_role = 'student' THEN
        INSERT INTO public.student_profiles (
            id,
            student_id,
            phone,
            department,
            course,
            year_semester
        ) VALUES (
            NEW.id,
            COALESCE(NEW.raw_user_meta_data->>'student_id', 'STU-' || SUBSTRING(NEW.id::text, 1, 8)),
            NEW.raw_user_meta_data->>'phone',
            COALESCE(NEW.raw_user_meta_data->>'department', 'CSE'),
            COALESCE(NEW.raw_user_meta_data->>'course', 'B.Tech Computer Science'),
            COALESCE(NEW.raw_user_meta_data->>'year_semester', '3rd Year / 6th Sem')
        );
    ELSIF requested_role = 'company' THEN
        INSERT INTO public.company_profiles (
            id,
            company_name,
            contact_person,
            official_email,
            phone,
            industry_domain,
            website,
            approval_status
        ) VALUES (
            NEW.id,
            COALESCE(NEW.raw_user_meta_data->>'company_name', 'Company Name'),
            COALESCE(NEW.raw_user_meta_data->>'contact_person', 'Contact Person'),
            NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'phone', ''),
            COALESCE(NEW.raw_user_meta_data->>'industry_domain', 'Software & Cloud Services'),
            NEW.raw_user_meta_data->>'website',
            'pending'::public.company_status
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
