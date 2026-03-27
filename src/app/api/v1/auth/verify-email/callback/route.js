import { getFirebaseAuth, applyEmailVerificationCode } from '@/server/auth/firebaseAdmin';
import { AUTH_ERROR, AuthApiError, jsonError } from '@/server/auth/errors';
import { withTransaction } from '@/server/db/postgres';
import { enforceRateLimit } from '@/server/auth/rateLimit';
import { getRequestMeta } from '@/server/auth/http';
import { insertAuditEvent, insertVerificationEvent, upsertAuthIdentity, upsertUser } from '@/server/auth/repository';

export const runtime = 'nodejs';

function mapVerificationError(message) {
  if (String(message).includes('EXPIRED_OOB_CODE')) {
    return new AuthApiError(AUTH_ERROR.VERIFICATION_LINK_EXPIRED, 'Verification link expired', 410);
  }
  if (String(message).includes('INVALID_OOB_CODE')) {
    return new AuthApiError(AUTH_ERROR.VERIFICATION_LINK_INVALID, 'Verification link invalid', 400);
  }
  return new AuthApiError(AUTH_ERROR.PROVIDER_TEMPORARY_FAILURE, 'Auth provider temporary failure', 503);
}

export async function GET(request) {
  const { requestId, ip, userAgent } = getRequestMeta(request);

  try {
    enforceRateLimit(`verify:${ip}`, 20, 15 * 60 * 1000);

    const oobCode = new URL(request.url).searchParams.get('oobCode');
    if (!oobCode) {
      throw new AuthApiError(AUTH_ERROR.INVALID_INPUT, 'Missing oobCode', 400);
    }

    let verifyResult;
    try {
      verifyResult = await applyEmailVerificationCode(oobCode);
    } catch (error) {
      throw mapVerificationError(error?.message);
    }

    const email = verifyResult.email;
    const auth = getFirebaseAuth();
    const firebaseUser = await auth.getUserByEmail(email);

    await withTransaction(async (client) => {
      const user = await upsertUser(client, {
        firebaseUid: firebaseUser.uid,
        email,
        displayName: firebaseUser.displayName || null,
        status: 'active',
      });

      await upsertAuthIdentity(client, {
        userId: user.id,
        firebaseUid: firebaseUser.uid,
        email,
        emailVerified: true,
      });

      await insertVerificationEvent(client, {
        userId: user.id,
        firebaseUid: firebaseUser.uid,
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
