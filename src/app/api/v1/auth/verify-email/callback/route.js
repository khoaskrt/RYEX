import { createAnonClient } from '@/shared/lib/supabase/server';
import { AUTH_ERROR, AuthApiError, jsonError } from '@/server/auth/errors';
import { withTransaction } from '@/server/db/postgres';
import { enforceRateLimit } from '@/server/auth/rateLimit';
import { getRequestMeta } from '@/server/auth/http';
import { insertAuditEvent, insertVerificationEvent, upsertAuthIdentity, upsertUser } from '@/server/auth/repository';

export const runtime = 'nodejs';

function mapVerificationError(message) {
  const normalized = String(message || '').toLowerCase();
  if (normalized.includes('expired')) {
    return new AuthApiError(AUTH_ERROR.VERIFICATION_LINK_EXPIRED, 'Verification link expired', 410);
  }
  if (normalized.includes('invalid') || normalized.includes('token')) {
    return new AuthApiError(AUTH_ERROR.VERIFICATION_LINK_INVALID, 'Verification link invalid', 400);
  }
  return new AuthApiError(AUTH_ERROR.PROVIDER_TEMPORARY_FAILURE, 'Auth provider temporary failure', 503);
}

export async function GET(request) {
  const { requestId, ip, userAgent } = getRequestMeta(request);

  try {
    enforceRateLimit(`verify:${ip}`, 20, 15 * 60 * 1000);

    const params = new URL(request.url).searchParams;
    const tokenHash = params.get('token_hash');
    const type = params.get('type');

    if (!tokenHash || !type) {
      throw new AuthApiError(AUTH_ERROR.INVALID_INPUT, 'Missing token_hash or type', 400);
    }

    let supaUser;
    try {
      const supabase = await createAnonClient();
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type,
      });
      if (error) throw error;
      supaUser = data?.user;
      if (!supaUser?.id || !supaUser?.email) {
        throw new Error('Invalid verified user payload');
      }
    } catch (error) {
      throw mapVerificationError(error?.message);
    }

    const email = supaUser.email;

    await withTransaction(async (client) => {
      const user = await upsertUser(client, {
        supaUid: supaUser.id,
        email,
        displayName: supaUser.user_metadata?.display_name || supaUser.user_metadata?.name || null,
        status: 'active',
      });

      await upsertAuthIdentity(client, {
        userId: user.id,
        supaUid: supaUser.id,
        email,
        emailVerified: true,
      });

      await insertVerificationEvent(client, {
        userId: user.id,
        supaUid: supaUser.id,
        email,
        eventType: 'verification_succeeded',
        eventStatus: 'success',
        requestId,
        ip,
        userAgent,
      });

      await insertAuditEvent(client, {
        actorType: 'system',
        actorUserId: user.id,
        action: 'AUTH_VERIFY_SUCCESS',
        resourceType: 'user',
        resourceId: user.id,
        requestId,
        ip,
        userAgent,
        payload: { source: 'api_v1_auth_verify_callback' },
      });
    });

    return Response.json(
      {
        verified: true,
        autoLoginReady: true,
        next: '/app/market',
        requestId,
      },
      { status: 200 }
    );
  } catch (error) {
    return jsonError(error, requestId);
  }
}
