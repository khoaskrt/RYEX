BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'users'
      AND column_name = 'user_id'
  )
  AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'users'
      AND column_name = 'supa_id'
  ) THEN
    ALTER TABLE public.users
      RENAME COLUMN user_id TO supa_id;
  END IF;
END $$;

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS users_id UUID;

UPDATE public.users
SET users_id = gen_random_uuid()
WHERE users_id IS NULL;

ALTER TABLE public.users
  ALTER COLUMN users_id SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_users_id_unique
  ON public.users(users_id);

DROP POLICY IF EXISTS profiles_select_own ON public.users;
DROP POLICY IF EXISTS profiles_insert_own ON public.users;
DROP POLICY IF EXISTS profiles_update_own ON public.users;
DROP POLICY IF EXISTS profiles_delete_own ON public.users;

CREATE POLICY profiles_select_own
ON public.users
FOR SELECT
USING (auth.uid() = supa_id);

CREATE POLICY profiles_insert_own
ON public.users
FOR INSERT
WITH CHECK (auth.uid() = supa_id);

CREATE POLICY profiles_update_own
ON public.users
FOR UPDATE
USING (auth.uid() = supa_id)
WITH CHECK (auth.uid() = supa_id);

COMMIT;
