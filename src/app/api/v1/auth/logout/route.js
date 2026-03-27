import { AUTH_ERROR, AuthApiError, jsonError } from '@/server/auth/errors';
import { withTransaction } from '@/server/db/postgres';
import { getRequestMeta } from '@/server/auth/http';
import { closeSession, insertAuditEvent } from '@/server/auth/repository';

export const runtime = 'nodejs';

export async function POST(request) {
  const { requestId, ip, userAgent } = getRequestMeta(request);

  try {
    const { sessionRef } = await request.json();

    if (!sessionRef) {
      throw new AuthApiError(AUTH_ERROR.INVALID_INPUT, 'sessionRef is required', 400);
    }

    await withTransaction(async (client) => {
      const session = await closeSession(client, sessionRef);
      if (!session) {
        throw new AuthApiError(AUTH_ERROR.UNAUTHORIZED, 'Session not found or already closed', 401);
      }

      await insertAuditEvent(client, {
        actorType: 'user',
        action: 'AUTH_LOGOUT',
        resourceType: 'session',
        resourceId: sessionRef,
        requestId,
        ip,
        userAgent,
        payload: { source: 'api_v1_auth_logout' },
      });
    });

    return new Response(null, { status: 204 });
  } catch (error) {
    return jsonError(error, requestId);
  }
}
