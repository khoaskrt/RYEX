import { createHash, createHmac, randomUUID } from 'node:crypto';

const TRUSTED_COOKIE_NAME = 'ryex_trusted_device';
const TRUSTED_DEVICE_TTL_DAYS = 30;

function getTrustedSecret() {
  return process.env.AUTH_TRUSTED_DEVICE_SECRET || process.env.SUPABASE_JWT_SECRET || 'dev-trusted-secret';
}

export function getTrustedCookieName() {
  return TRUSTED_COOKIE_NAME;
}

export function generateDeviceId() {
  return randomUUID();
}

export function hashTrustToken(token) {
  return createHash('sha256').update(token).digest('hex');
}

export function createTrustedTokenPayload({ email, deviceId, expiresAt }) {
  const payload = `${email}|${deviceId}|${expiresAt}`;
  const signature = createHmac('sha256', getTrustedSecret()).update(payload).digest('hex');
  return `${payload}|${signature}`;
}

export function parseTrustedToken(token) {
  if (!token) return null;
  const parts = token.split('|');
  if (parts.length !== 4) return null;

  const [email, deviceId, expiresAt, signature] = parts;
  const payload = `${email}|${deviceId}|${expiresAt}`;
  const expected = createHmac('sha256', getTrustedSecret()).update(payload).digest('hex');
  if (expected !== signature) return null;

  const expiresAtMs = Number(expiresAt);
  if (!Number.isFinite(expiresAtMs) || expiresAtMs < Date.now()) return null;

  return { email, deviceId, expiresAtMs, signature, token };
}

export function getTrustedExpiryMs() {
  return Date.now() + TRUSTED_DEVICE_TTL_DAYS * 24 * 60 * 60 * 1000;
}
