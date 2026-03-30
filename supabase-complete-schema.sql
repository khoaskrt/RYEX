-- =====================================================
-- RYEX Complete Database Schema for Supabase
-- =====================================================
-- Instructions:
-- 1. Copy toàn bộ file này
-- 2. Mở Supabase Dashboard → SQL Editor
-- 3. Paste vào editor → Click "Run"
-- 4. Đợi "Success" message
-- =====================================================

BEGIN;

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS citext;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =====================================================
-- TABLE: users
-- Lưu thông tin user chính
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firebase_uid VARCHAR(128) NOT NULL UNIQUE,
  email CITEXT NOT NULL UNIQUE,
  display_name VARCHAR(120),
  status VARCHAR(32) NOT NULL DEFAULT 'pending_email_verification',
  kyc_status VARCHAR(20) NOT NULL DEFAULT 'not_started',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  activated_at TIMESTAMPTZ,
  last_login_at TIMESTAMPTZ,
  CONSTRAINT users_status_check CHECK (status IN ('pending_email_verification','active','locked','disabled')),
  CONSTRAINT users_kyc_status_check CHECK (kyc_status IN ('not_started','pending','approved','rejected'))
);

CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- =====================================================
-- TABLE: auth_identities
-- Lưu thông tin auth từ Firebase
-- =====================================================
CREATE TABLE IF NOT EXISTS auth_identities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  firebase_uid VARCHAR(128) NOT NULL,
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
  CONSTRAINT auth_identities_firebase_provider_unique UNIQUE (firebase_uid, provider)
);

CREATE INDEX IF NOT EXISTS idx_auth_identities_verified_updated
  ON auth_identities(email_verified, updated_at DESC);

-- =====================================================
-- TABLE: auth_verification_events
-- Log các sự kiện verify email
-- =====================================================
CREATE TABLE IF NOT EXISTS auth_verification_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  firebase_uid VARCHAR(128),
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
    event_type IN (
      'verification_email_sent',
      'verification_link_clicked',
      'verification_succeeded',
      'verification_failed',
      'challenge_email_sent',
      'resend_email_sent'
    )
  ),
  CONSTRAINT auth_verification_events_status_check CHECK (
    event_status IN ('success','failed','ignored')
  )
);

CREATE INDEX IF NOT EXISTS idx_auth_verif_events_user_occurred
  ON auth_verification_events(user_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_auth_verif_events_type_occurred
  ON auth_verification_events(event_type, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_auth_verif_events_status_occurred
  ON auth_verification_events(event_status, occurred_at DESC);

-- =====================================================
-- TABLE: auth_login_events
-- Log các lần login
-- =====================================================
CREATE TABLE IF NOT EXISTS auth_login_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  firebase_uid VARCHAR(128),
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
  ON auth_login_events(user_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_auth_login_events_result_occurred
  ON auth_login_events(result, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_auth_login_events_email_occurred
  ON auth_login_events(email, occurred_at DESC);

-- =====================================================
-- TABLE: user_sessions
-- Quản lý sessions của user
-- =====================================================
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_ref VARCHAR(128) NOT NULL UNIQUE,
  auth_provider VARCHAR(30) NOT NULL DEFAULT 'firebase',
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
  ON user_sessions(user_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_sessions_last_seen
  ON user_sessions(last_seen_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active_by_user
  ON user_sessions(user_id)
  WHERE ended_at IS NULL;

-- =====================================================
-- TABLE: trusted_devices
-- Lưu danh sách thiết bị trusted
-- =====================================================
CREATE TABLE IF NOT EXISTS trusted_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email CITEXT NOT NULL,
  device_id VARCHAR(128) NOT NULL,
  trust_token_hash VARCHAR(128) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at TIMESTAMPTZ,
  revoke_reason VARCHAR(64),
  CONSTRAINT trusted_devices_user_device_unique UNIQUE (user_id, device_id)
);

CREATE INDEX IF NOT EXISTS idx_trusted_devices_email_device ON trusted_devices(email, device_id);
CREATE INDEX IF NOT EXISTS idx_trusted_devices_expires_at ON trusted_devices(expires_at);

-- =====================================================
-- TABLE: audit_events
-- Audit log cho tất cả actions quan trọng
-- =====================================================
CREATE TABLE IF NOT EXISTS audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_type VARCHAR(20) NOT NULL,
  actor_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
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
  ON audit_events(action, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_events_actor_created
  ON audit_events(actor_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_events_resource
  ON audit_events(resource_type, resource_id);

COMMIT;

-- =====================================================
-- SUCCESS! Schema created.
-- Next steps:
-- 1. Run the RLS policies (copy from SUPABASE_RLS_POLICIES.sql)
-- 2. Verify tables in Table Editor
-- 3. Run: npm run db:test
-- =====================================================
