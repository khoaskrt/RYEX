-- Create auth_identities compatible with current users schema
-- Date: 2026-04-03
-- Context: Original 001_auth_identity_baseline.sql uses firebase_uid, but users table uses supa_id

BEGIN;

CREATE EXTENSION IF NOT EXISTS citext;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create auth_identities table (compatible with supa_id schema)
CREATE TABLE IF NOT EXISTS public.auth_identities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(users_id) ON DELETE CASCADE,
  supa_id UUID NOT NULL,
  provider VARCHAR(30) NOT NULL DEFAULT 'password',
  email CITEXT NOT NULL,
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  email_verified_at TIMESTAMPTZ,
  last_sync_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sync_version INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT auth_identities_provider_check CHECK (provider IN ('password')),
  CONSTRAINT auth_identities_user_provider_unique UNIQUE (user_id, provider),
  CONSTRAINT auth_identities_supa_provider_unique UNIQUE (supa_id, provider)
);

CREATE INDEX IF NOT EXISTS idx_auth_identities_verified_updated
  ON public.auth_identities(email_verified, updated_at DESC);

-- Create auth_verification_events table
CREATE TABLE IF NOT EXISTS public.auth_verification_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(users_id) ON DELETE SET NULL,
  supa_id UUID,
  email CITEXT,
  event_type VARCHAR(40) NOT NULL,
  event_status VARCHAR(20) NOT NULL,
  failure_reason_code VARCHAR(50),
  request_id VARCHAR(64),
  ip INET,
  user_agent TEXT,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  CONSTRAINT auth_verification_events_type_check CHECK (
    event_type IN ('verification_email_sent','verification_link_clicked','verification_succeeded','verification_failed','challenge_email_sent','resend_email_sent')
  ),
  CONSTRAINT auth_verification_events_status_check CHECK (
    event_status IN ('success','failed','ignored')
  )
);

CREATE INDEX IF NOT EXISTS idx_auth_verif_events_user_occurred
  ON public.auth_verification_events(user_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_auth_verif_events_type_occurred
  ON public.auth_verification_events(event_type, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_auth_verif_events_status_occurred
  ON public.auth_verification_events(event_status, occurred_at DESC);

-- Create auth_login_events table
CREATE TABLE IF NOT EXISTS public.auth_login_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(users_id) ON DELETE SET NULL,
  supa_id UUID,
  email CITEXT,
  login_method VARCHAR(30) NOT NULL DEFAULT 'email_link',
  result VARCHAR(20) NOT NULL,
  failure_reason_code VARCHAR(50),
  request_id VARCHAR(64),
  ip INET,
  user_agent TEXT,
  device_id VARCHAR(128),
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  CONSTRAINT auth_login_events_result_check CHECK (result IN ('success','failed'))
);

CREATE INDEX IF NOT EXISTS idx_auth_login_events_user_occurred
  ON public.auth_login_events(user_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_auth_login_events_result_occurred
  ON public.auth_login_events(result, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_auth_login_events_email_occurred
  ON public.auth_login_events(email, occurred_at DESC);

-- Create user_sessions table
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(users_id) ON DELETE CASCADE,
  session_ref VARCHAR(128) NOT NULL UNIQUE,
  auth_provider VARCHAR(30) NOT NULL DEFAULT 'supabase',
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  termination_reason VARCHAR(30),
  ip INET,
  user_agent TEXT,
  device_id VARCHAR(128),
  risk_level VARCHAR(20) NOT NULL DEFAULT 'low'
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_started
  ON public.user_sessions(user_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_sessions_last_seen
  ON public.user_sessions(last_seen_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active_by_user
  ON public.user_sessions(user_id)
  WHERE ended_at IS NULL;

-- Create audit_events table
CREATE TABLE IF NOT EXISTS public.audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_type VARCHAR(20) NOT NULL,
  actor_user_id UUID REFERENCES public.users(users_id) ON DELETE SET NULL,
  action VARCHAR(80) NOT NULL,
  resource_type VARCHAR(40) NOT NULL,
  resource_id VARCHAR(128),
  request_id VARCHAR(64),
  ip INET,
  user_agent TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT audit_events_actor_type_check CHECK (actor_type IN ('user','system','admin'))
);

CREATE INDEX IF NOT EXISTS idx_audit_events_action_created
  ON public.audit_events(action, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_events_actor_created
  ON public.audit_events(actor_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_events_resource
  ON public.audit_events(resource_type, resource_id);

COMMIT;
