import { AUTH_ERROR, AuthApiError, jsonError } from '@/server/auth/errors';
import { withTransaction } from '@/server/db/postgres';
import { enforceRateLimit } from '@/server/auth/rateLimit';
import { getRequestMeta } from '@/server/auth/http';
import { getRecentResendStats, insertAuditEvent, insertVerificationEvent } from '@/server/auth/repository';
import { sendSignInLinkEmail, sendVerificationEmail } from '@/server/auth/firebaseAdmin';

export const runtime = 'nodejs';

function getCooldownSeconds(lastSentAt) {
  if (!lastSentAt) return 0;
  const elapsed = Date.now() - new Date(lastSentAt).getTime();
  const remainingMs = 60_000 - elapsed;
  return remainingMs > 0 ? Math.ceil(remainingMs / 1000) : 0;
}

export async function POST(request) {
  const { requestId, ip, userAgent } = getRequestMeta(request);

  try {
    enforceRateLimit(`resend:${ip}`, 30, 15 * 60 * 1000);

    const { email, flowType } = await request.json();
    const normalizedEmail = String(email || '').trim().toLowerCase();
    if (!normalizedEmail || !flowType) {
      throw new AuthApiError(AUTH_ERROR.INVALID_INPUT, 'email and flowType are required', 400);
    }

    if (!['signup_verify', 'login_challenge'].includes(flowType)) {
      throw new AuthApiError(AUTH_ERROR.INVALID_INPUT, 'flowType is invalid', 400);
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
      if (flowType === 'login_challenge') {
        await sendSignInLinkEmail(normalizedEmail);
      } else {
        await sendVerificationEmail(normalizedEmail);
      }
    } catch {
      throw new AuthApiError(AUTH_ERROR.PROVIDER_TEMPORARY_FAILURE, 'Auth provider temporary failure', 503);
    }

    await withTransaction(async (client) => {
      await insertVerificationEvent(client, {
        email: normalizedEmail,
        eventType: 'resend_email_sent',
        eventStatus: 'success',
        requestId,
        ip,
        userAgent,
        metadata: { flowType },
      });

      await insertAuditEvent(client, {
        actorType: 'system',
        action: 'AUTH_RESEND_EMAIL_SENT',
        resourceType: 'identity',
        resourceId: normalizedEmail,
        requestId,
        ip,
        userAgent,
        payload: { flowType },
      });
    });

    return Response.json(
      {
        success: true,
        cooldownSeconds: 60,
        requestId,
      },
      { status: 200 }
    );
  } catch (error) {
    return jsonError(error, requestId);
  }
}
