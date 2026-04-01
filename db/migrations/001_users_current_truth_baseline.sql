-- Baseline (Current Truth)
-- Source: Production DB state confirmed on 2026-04-01
-- Scope: public.users only

BEGIN;

CREATE TABLE IF NOT EXISTS public.users (
  supa_id UUID NOT NULL,
  email TEXT,
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  users_id UUID NOT NULL
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'users_pkey'
      AND conrelid = 'public.users'::regclass
  ) THEN
    ALTER TABLE public.users
      ADD CONSTRAINT users_pkey PRIMARY KEY (supa_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'users_user_id_fkey'
      AND conrelid = 'public.users'::regclass
  ) THEN
    ALTER TABLE public.users
      ADD CONSTRAINT users_user_id_fkey
      FOREIGN KEY (supa_id)
      REFERENCES auth.users(id)
      ON DELETE CASCADE;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_users_id_unique
  ON public.users(users_id);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

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
