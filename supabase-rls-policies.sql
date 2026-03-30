-- =====================================================
-- RYEX Row Level Security (RLS) Policies
-- =====================================================
-- Instructions:
-- CHẠY FILE NÀY SAU KHI ĐÃ CHẠY supabase-complete-schema.sql
-- 1. Copy toàn bộ file này
-- 2. Mở Supabase Dashboard → SQL Editor
-- 3. Paste vào editor → Click "Run"
-- =====================================================

BEGIN;

-- Enable RLS trên tất cả tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_identities ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE trusted_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_verification_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_login_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- USERS TABLE POLICIES
-- =====================================================

-- Policy: Users có thể xem thông tin của chính họ
CREATE POLICY "users_select_own"
ON users FOR SELECT
USING (
  firebase_uid = current_setting('request.jwt.claims', true)::json->>'sub'
);

-- Policy: Users có thể update thông tin của chính họ
CREATE POLICY "users_update_own"
ON users FOR UPDATE
USING (
  firebase_uid = current_setting('request.jwt.claims', true)::json->>'sub'
)
WITH CHECK (
  firebase_uid = current_setting('request.jwt.claims', true)::json->>'sub'
);

-- Policy: Service role có thể làm mọi thứ (cho backend API)
CREATE POLICY "users_service_role_all"
ON users FOR ALL
USING (
  current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
);

-- =====================================================
-- AUTH_IDENTITIES TABLE POLICIES
-- =====================================================

CREATE POLICY "auth_identities_select_own"
ON auth_identities FOR SELECT
USING (
  firebase_uid = current_setting('request.jwt.claims', true)::json->>'sub'
);

CREATE POLICY "auth_identities_service_role_all"
ON auth_identities FOR ALL
USING (
  current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
);

-- =====================================================
-- USER_SESSIONS TABLE POLICIES
-- =====================================================

CREATE POLICY "user_sessions_select_own"
ON user_sessions FOR SELECT
USING (
  user_id IN (
    SELECT id FROM users WHERE firebase_uid = current_setting('request.jwt.claims', true)::json->>'sub'
  )
);

CREATE POLICY "user_sessions_service_role_all"
ON user_sessions FOR ALL
USING (
  current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
);

-- =====================================================
-- TRUSTED_DEVICES TABLE POLICIES
-- =====================================================

CREATE POLICY "trusted_devices_select_own"
ON trusted_devices FOR SELECT
USING (
  user_id IN (
    SELECT id FROM users WHERE firebase_uid = current_setting('request.jwt.claims', true)::json->>'sub'
  )
);

CREATE POLICY "trusted_devices_service_role_all"
ON trusted_devices FOR ALL
USING (
  current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
);

-- =====================================================
-- AUTH_VERIFICATION_EVENTS POLICIES (Read-only)
-- =====================================================

CREATE POLICY "auth_verification_events_select_own"
ON auth_verification_events FOR SELECT
USING (
  firebase_uid = current_setting('request.jwt.claims', true)::json->>'sub'
);

CREATE POLICY "auth_verification_events_service_role_all"
ON auth_verification_events FOR ALL
USING (
  current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
);

-- =====================================================
-- AUTH_LOGIN_EVENTS POLICIES (Read-only)
-- =====================================================

CREATE POLICY "auth_login_events_select_own"
ON auth_login_events FOR SELECT
USING (
  firebase_uid = current_setting('request.jwt.claims', true)::json->>'sub'
);

CREATE POLICY "auth_login_events_service_role_all"
ON auth_login_events FOR ALL
USING (
  current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
);

-- =====================================================
-- AUDIT_EVENTS POLICIES
-- =====================================================

CREATE POLICY "audit_events_select_own"
ON audit_events FOR SELECT
USING (
  actor_user_id IN (
    SELECT id FROM users WHERE firebase_uid = current_setting('request.jwt.claims', true)::json->>'sub'
  )
);

CREATE POLICY "audit_events_service_role_all"
ON audit_events FOR ALL
USING (
  current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function để get current user_id từ Firebase UID
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS uuid AS $$
  SELECT id FROM users
  WHERE firebase_uid = current_setting('request.jwt.claims', true)::json->>'sub'
  LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_current_user_id() TO authenticated, anon;

COMMIT;

-- =====================================================
-- SUCCESS! RLS policies created.
-- Next steps:
-- 1. Verify trong Table Editor (icon 🔒 màu xanh)
-- 2. Test: npm run db:test
-- 3. Test API endpoints với Firebase token
-- =====================================================
