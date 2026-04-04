BEGIN;

CREATE TABLE IF NOT EXISTS trusted_devices (
  id UUID PRIMARY KEY,
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

COMMIT;
