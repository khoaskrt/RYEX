import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { createClient } from '@/shared/lib/supabase/server';
import { AUTH_ERROR, AuthApiError, jsonError } from '@/server/auth/errors';
import { withTransaction } from '@/server/db/postgres';
import { enforceRateLimit } from '@/server/auth/rateLimit';
import { getRequestMeta } from '@/server/auth/http';
import {
  createUserSession,
  insertAuditEvent,
  insertLoginEvent,
  insertTrustedDevice,
  upsertAuthIdentity,
  upsertUser,
} from '@/server/auth/repository';
import { attachSessionToResponse, attachTrustedDeviceCookie } from '@/server/auth/sessionCookies';
import { createTrustedTokenPayload, generateDeviceId, getTrustedExpiryMs, hashTrustToken } from '@/server/auth/trustedDevice';

export const runtime = 'nodejs';

function sessionCookieMaxAgeSeconds() {
  const n = Number(process.env.AUTH_REFRESH_TOKEN_TTL_SECONDS);
  return Number.isFinite(n) && n > 0 ? n : 86400;
}

export async function POST(request) {
  const { requestId, ip, userAgent } = getRequestMeta(request);

  try {
    enforceRateLimit(`session-sync:${ip}`, 60, 15 * 60 * 1000);

    const { accessToken, deviceId: bodyDeviceId, rememberDevice = false } = await request.json();
    if (!accessToken) {
      throw new AuthApiError(AUTH_ERROR.INVALID_INPUT, 'accessToken is required', 400);
    }

    const supabaseAdmin = await createClient();
    const { data: authUserData, error: authUserError } = await supabaseAdmin.auth.getUser(accessToken);
    if (authUserError || !authUserData?.user) {
      throw new AuthApiError(AUTH_ERROR.INVALID_TOKEN, 'Invalid token', 401);
    }

    const supaUser = authUserData.user;
    if (!supaUser.email_confirmed_at) {
      throw new AuthApiError(AUTH_ERROR.EMAIL_NOT_VERIFIED, 'Email is not verified', 403);
    }

    const sessionRef = randomUUID();
    const sessionMaxAge = sessionCookieMaxAgeSeconds();

    const result = await withTransaction(async (client) => {
      const user = await upsertUser(client, {
        supaUid: supaUser.id,
        email: supaUser.email || '',
        displayName: supaUser.user_metadata?.display_name || supaUser.user_metadata?.name || null,
        status: 'active',
      });

      await upsertAuthIdentity(client, {
        userId: user.id,
        supaUid: supaUser.id,
        email: supaUser.email || '',
        emailVerified: true,
      });

      const normalizedDeviceId = bodyDeviceId || generateDeviceId();

      await createUserSession(client, {
        userId: user.id,
        sessionRef,
        ip,
        userAgent,
        deviceId: normalizedDeviceId,
      });

      await insertLoginEvent(client, {
        userId: user.id,
        supaUid: supaUser.id,
        email: supaUser.email || '',
        result: 'success',
        requestId,
        ip,
        userAgent,
        deviceId: normalizedDeviceId,
      });

      await insertAuditEvent(client, {
        actorType: 'user',
        actorUserId: user.id,
        action: 'AUTH_LOGIN_SUCCESS',
        resourceType: 'session',
        resourceId: sessionRef,
        requestId,
        ip,
        userAgent,
        payload: { source: 'api_v1_auth_session_sync' },
      });

      let trustedToken = null;
      let trustedExpiresAtMs = null;

      if (rememberDevice) {
        trustedExpiresAtMs = getTrustedExpiryMs();
        trustedToken = createTrustedTokenPayload({
          email: supaUser.email || '',
          deviceId: normalizedDeviceId,
          expiresAt: trustedExpiresAtMs,
        });

        await insertTrustedDevice(client, {
          userId: user.id,
          email: supaUser.email || '',
          deviceId: normalizedDeviceId,
          trustTokenHash: hashTrustToken(trustedToken),
          expiresAt: new Date(trustedExpiresAtMs).toISOString(),
        });
      }

      return { user, trustedToken, trustedExpiresAtMs, deviceId: normalizedDeviceId };
    });

    const response = NextResponse.json(
      {
        sessionRef,
        userStatus: result.user.status,
        emailVerified: true,
        trustedDeviceEnabled: Boolean(rememberDevice && result.trustedToken),
        deviceId: result.deviceId,
        requestId,
      },
      { status: 200 }
    );

    attachSessionToResponse(response, sessionRef, sessionMaxAge);

    if (rememberDevice && result.trustedToken && result.trustedExpiresAtMs) {
      const trustedMaxAge = Math.max(
        60,
        Math.ceil((result.trustedExpiresAtMs - Date.now()) / 1000)
      );
      attachTrustedDeviceCookie(response, result.trustedToken, trustedMaxAge);
    }

    return response;
  } catch (error) {
    return jsonError(error, requestId);
  }
}
