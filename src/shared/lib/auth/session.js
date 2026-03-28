import crypto from 'crypto';

import jwt from 'jsonwebtoken';

import { query } from '../db';
import { authEnv } from '../env.server';

export function buildRefreshCookieOptions() {
  const domain = authEnv.cookieDomain || undefined;

  return {
    httpOnly: true,
    secure: authEnv.cookieSecure,
    sameSite: 'lax',
    path: authEnv.cookiePath,
    maxAge: authEnv.refreshTtlSeconds,
    domain,
  };
}

function nowPlusSeconds(seconds) {
  return new Date(Date.now() + seconds * 1000);
}

function hashToken(rawToken) {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

function generateRefreshToken() {
  return crypto.randomBytes(48).toString('base64url');
}

function signAccessToken({ userId, email, status, sessionId }) {
  return jwt.sign(
    {
      sub: userId,
      email,
      status,
      sid: sessionId,
      type: 'access',
    },
    authEnv.accessTokenSecret,
    {
      algorithm: 'HS256',
      expiresIn: authEnv.accessTtlSeconds,
    },
  );
}

export async function createSessionForUser({ userId, userAgent, ipAddress, email, status }) {
  const refreshToken = generateRefreshToken();
  const refreshTokenHash = hashToken(refreshToken);
  const expiresAt = nowPlusSeconds(authEnv.refreshTtlSeconds);

  const sessionResult = await query(
    `
      INSERT INTO auth_sessions (user_id, refresh_token_hash, user_agent, ip_address, expires_at)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `,
    [userId, refreshTokenHash, userAgent || null, ipAddress || null, expiresAt],
  );

  const sessionId = sessionResult.rows[0].id;
  const accessToken = signAccessToken({ userId, email, status, sessionId });

  return {
    accessToken,
    refreshToken,
    refreshExpiresAt: expiresAt,
    sessionId,
  };
}

export async function rotateSessionByRefreshToken(rawToken) {
  const hashed = hashToken(rawToken);

  const existing = await query(
    `
      SELECT
        s.id,
        s.user_id,
        s.expires_at,
        s.revoked_at,
        u.email,
        u.status
      FROM auth_sessions s
      JOIN users u ON u.id = s.user_id
      WHERE s.refresh_token_hash = $1
      LIMIT 1
    `,
    [hashed],
  );

  const session = existing.rows[0];

  if (!session) {
    return { ok: false, code: 'SESSION_NOT_FOUND' };
  }

  if (session.revoked_at) {
    return { ok: false, code: 'SESSION_REVOKED' };
  }

  if (new Date(session.expires_at).getTime() <= Date.now()) {
    return { ok: false, code: 'SESSION_EXPIRED' };
  }

  const nextRefreshToken = generateRefreshToken();
  const nextHash = hashToken(nextRefreshToken);
  const nextExpiresAt = nowPlusSeconds(authEnv.refreshTtlSeconds);

  await query(
    `
      UPDATE auth_sessions
      SET refresh_token_hash = $1, expires_at = $2
      WHERE id = $3
    `,
    [nextHash, nextExpiresAt, session.id],
  );

  const accessToken = signAccessToken({
    userId: session.user_id,
    email: session.email,
    status: session.status,
    sessionId: session.id,
  });

  return {
    ok: true,
    accessToken,
    refreshToken: nextRefreshToken,
    refreshExpiresAt: nextExpiresAt,
    sessionId: session.id,
  };
}

export async function revokeSessionByRefreshToken(rawToken) {
  const hashed = hashToken(rawToken);

  const result = await query(
    `
      UPDATE auth_sessions
      SET revoked_at = NOW()
      WHERE refresh_token_hash = $1
        AND revoked_at IS NULL
      RETURNING id
    `,
    [hashed],
  );

  return result.rowCount > 0;
}

export function verifyAccessToken(token) {
  return jwt.verify(token, authEnv.accessTokenSecret, { algorithms: ['HS256'] });
}
