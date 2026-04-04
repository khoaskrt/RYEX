-- Fix Supabase Auth signup trigger drift
-- Date: 2026-04-01
-- Problem:
--   public.handle_new_user() was inserting into legacy column "user_id"
--   while public.users now uses "supa_id" (PK) + "users_id".
-- Effect:
--   auth/v1/signup returned 500: "Database error saving new user".

BEGIN;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.users (supa_id, email, display_name, users_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', ''),
    gen_random_uuid()
  )
  ON CONFLICT (supa_id) DO UPDATE
  SET
    email = EXCLUDED.email,
    display_name = EXCLUDED.display_name,
    updated_at = NOW();

  RETURN NEW;
END;
$$;

COMMIT;
