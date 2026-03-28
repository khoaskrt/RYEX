import { randomUUID } from 'node:crypto';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { AUTH_ERROR, AuthApiError, jsonError } from '@/server/auth/errors';
import { pgPool, withTransaction } from '@/server/db/postgres';
import { enforceRateLimit } from '@/server/auth/rateLimit';
import { getRequestMeta } from '@/server/auth/http';
import {
  createUserSession,
  getRecentResendStats,
  getTrustedDevice,
  getVerifiedAuthUserByEmail,
  insertAuditEvent,
  insertLoginEvent,
  insertVerificationEvent,
} from '@/server/auth/repository';
import { sendSignInLinkEmail } from '@/server/auth/firebaseAdmin';
import { attachSessionToResponse } from '@/server/auth/sessionCookies';
import { getTrustedCookieName, hashTrustToken, parseTrustedToken } from '@/server/auth/trustedDevice';

export const runtime = 'nodejs';

function getCooldownSeconds(lastSentAt) {
  if (!lastSentAt) return 0;
  const elapsed = Date.now() - new Date(lastSentAt).getTime();
  const remainingMs = 60_000 - elapsed;
  return remainingMs > 0 ? Math.ceil(remainingMs / 1000) : 0;
}

function sessionCookieMaxAgeSeconds() {
  const n = Number(process.env.AUTH_REFRESH_TOKEN_TTL_SECONDS);
  return Number.isFinite(n) && n > 0 ? n : 86400;
}

export async function POST(request) {
  const { requestId, ip, userAgent } = getRequestMeta(request);

  try {
    enforceRateLimit(`login-challenge:${ip}`, 20, 15 * 60 * 1000);

    const { email } = await request.json();
    const normalizedEmail = String(email || '').trim().toLowerCase();
    if (!normalizedEmail) {
      throw new AuthApiError(AUTH_ERROR.INVALID_INPUT, 'Email is required', 400);
    }

    const cookieStore = cookies();
    const trustedRawToken = cookieStore.get(getTrustedCookieName())?.value;
    const trustedParsed = parseTrustedToken(trustedRawToken);

    if (trustedParsed && trustedParsed.email.toLowerCase() === normalizedEmail) {
      const trustedDevice = await withTransaction(async (client) => {
        return getTrustedDevice(client, {
          email: normalizedEmail,
          deviceId: trustedParsed.deviceId,
          trustTokenHash: hashTrustToken(trustedRawToken),
        });
      });

      if (trustedDevice) {
        const authUser = await getVerifiedAuthUserByEmail(pgPool, normalizedEmail);

        if (!authUser || !authUser.email_verified) {
          throw new AuthApiError(AUTH_ERROR.EMAIL_NOT_VERIFIED, 'Email is not verified', 403);
        }

        const sessionRef = randomUUID();
        const sessionMaxAge = sessionCookieMaxAgeSeconds();

        await withTransaction(async (client) => {
          await createUserSession(client, {
            userId: authUser.user_id,
            sessionRef,
            ip,
            userAgent,
            deviceId: trustedParsed.deviceId,
          });

          await insertLoginEvent(client, {
            userId: authUser.user_id,
            firebaseUid: authUser.firebase_uid,
            email: normalizedEmail,
            loginMethod: 'trusted_device',
            result: 'success',
            requestId,
            ip,
            userAgent,
            deviceId: trustedParsed.deviceId,
          });

          await insertAuditEvent(client, {
            actorType: 'user',
            actorUserId: authUser.user_id,
            action: 'AUTH_LOGIN_SUCCESS',
            resourceType: 'session',
            resourceId: sessionRef,
            requestId,
            ip,
            userAgent,
            payload: { source: 'api_v1_auth_login_challenge_trusted' },
          });
        });

        const response = NextResponse.json(
          {
            challengeRequired: false,
            trustedBypass: true,
            next: '/app/market',
            sessionRef,
            requestId,
          },
          { status: 200 }
        );
        attachSessionToResponse(response, sessionRef, sessionMaxAge);

        return response;
      }
    }

    const stats = await withTransaction(async (client) => getRecentResendStats(client, normalizedEmail));
    const cooldownRemaining = getCooldownSeconds(stats.last_sent_at);

    if (cooldownRemaining > 0) {
      throw new AuthApiError(AUTH_ERROR.RESEND_COOLDOWN, `Please wait ${cooldownRemaining}s before resending`, 429, {
        cooldownRemaining,
      });
    }

    const sentCountLastHour = Number(stats.sent_count_last_hour || 0);
    if (sentCountLastHour >= 5) {
      throw new AuthApiError(AUTH_ERROR.RESEND_HOURLY_CAP_REACHED, 'Hourly resend cap reached', 429, {
        sentCountLastHour,
      });
    }

    try {
      await sendSignInLinkEmail(normalizedEmail);
    } catch {
      throw new AuthApiError(AUTH_ERROR.PROVIDER_TEMPORARY_FAILURE, 'Auth provider temporary failure', 503);
    }

    await withTransaction(async (client) => {
      await insertVerificationEvent(client, {
        email: normalizedEmail,
        eventType: 'challenge_email_sent',
        eventStatus: 'success',
        requestId,
        ip,
        userAgent,
      });

      await insertLoginEvent(client, {
        email: normalizedEmail,
        loginMethod: 'email_link',
        result: 'failed',
        failureReasonCode: AUTH_ERROR.LOGIN_CHALLENGE_REQUIRED,
        requestId,
        ip,
        userAgent,
      });

      await insertAuditEvent(client, {
        actorType: 'system',
        action: 'AUTH_LOGIN_CHALLENGE_SENT',
        resourceType: 'identity',
        resourceId: normalizedEmail,
        requestId,
        ip,
        userAgent,
        payload: { flow: 'login_challenge' },
      });
    });

    return Response.json(
      {
        challengeRequired: true,
        trustedBypass: false,
        cooldownSeconds: 60,
        requestId,
      },
      { status: 200 }
    );
  } catch (error) {
    return jsonError(error, requestId);
  }
}
