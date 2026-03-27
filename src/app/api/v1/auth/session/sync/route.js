import { randomUUID } from 'node:crypto';
import { getFirebaseAuth } from '@/server/auth/firebaseAdmin';
import { AUTH_ERROR, AuthApiError, jsonError } from '@/server/auth/errors';
import { withTransaction } from '@/server/db/postgres';
import { enforceRateLimit } from '@/server/auth/rateLimit';
import { getRequestMeta } from '@/server/auth/http';
import { createUserSession, insertAuditEvent, insertLoginEvent, upsertAuthIdentity, upsertUser } from '@/server/auth/repository';

export const runtime = 'nodejs';

export async function POST(request) {
  const { requestId, ip, userAgent } = getRequestMeta(request);

  try {
    enforceRateLimit(`session-sync:${ip}`, 60, 15 * 60 * 1000);

    const { idToken, deviceId } = await request.json();
    if (!idToken) {
      throw new AuthApiError(AUTH_ERROR.INVALID_INPUT, 'idToken is required', 400);
    }

    const auth = getFirebaseAuth();
    let decodedToken;
    try {
      decodedToken = await auth.verifyIdToken(idToken);
    } catch {
      throw new AuthApiError(AUTH_ERROR.INVALID_TOKEN, 'Invalid token', 401);
    }

    const firebaseUser = await auth.getUser(decodedToken.uid);
    if (!firebaseUser.emailVerified) {
      throw new AuthApiError(AUTH_ERROR.EMAIL_NOT_VERIFIED, 'Email is not verified', 403);
    }

    const sessionRef = randomUUID();

    const result = await withTransaction(async (client) => {
      const user = await upsertUser(client, {
        firebaseUid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || null,
        status: 'active',
      });

      await upsertAuthIdentity(client, {
        userId: user.id,
        firebaseUid: firebaseUser.uid,
        email: firebaseUser.email || '',
        emailVerified: true,
      });

      await createUserSession(client, {
        userId: user.id,
        sessionRef,
        ip,
        userAgent,
        deviceId,
      });

      await insertLoginEvent(client, {
        userId: user.id,
        firebaseUid: firebaseUser.uid,
        email: firebaseUser.email || '',
        result: 'success',
        requestId,
        ip,
        userAgent,
        deviceId,
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

      return { user };
    });

    return Response.json(
      {
        sessionRef,
        userStatus: result.user.status,
        emailVerified: true,
        requestId,
      },
      { status: 200 }
    );
  } catch (error) {
    return jsonError(error, requestId);
  }
}
