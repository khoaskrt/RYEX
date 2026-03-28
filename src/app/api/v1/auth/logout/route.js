import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { jsonError } from '@/server/auth/errors';
import { withTransaction } from '@/server/db/postgres';
import { getRequestMeta } from '@/server/auth/http';
import { closeSession, insertAuditEvent, revokeTrustedDevicesForUser } from '@/server/auth/repository';
import { SESSION_COOKIE_NAME, clearAuthCookies } from '@/server/auth/sessionCookies';

export const runtime = 'nodejs';

export async function POST(request) {
  const { requestId, ip, userAgent } = getRequestMeta(request);

  let body = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const cookieStore = cookies();
  const sessionRef = body.sessionRef || cookieStore.get(SESSION_COOKIE_NAME)?.value;

  try {
    if (sessionRef) {
      await withTransaction(async (client) => {
        const closed = await closeSession(client, sessionRef);
        if (closed?.user_id) {
          await revokeTrustedDevicesForUser(client, closed.user_id);
        }
        if (closed) {
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
        }
      });
    }
  } catch (error) {
    return jsonError(error, requestId);
  }

  const res = new NextResponse(null, { status: 204 });
  clearAuthCookies(res);
  return res;
}
