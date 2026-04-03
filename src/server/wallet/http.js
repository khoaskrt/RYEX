import crypto from 'node:crypto';
import { createClient } from '../../shared/lib/supabase/server.js';

export function extractBearerToken(request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return '';
  return authHeader.split('Bearer ')[1];
}

export function getRequestId(request) {
  return request.headers.get('x-request-id') || crypto.randomUUID();
}

export async function verifySupabaseUserId(request, requestId, routeScope = 'wallet') {
  const token = extractBearerToken(request);
  if (!token) {
    console.warn(`[${routeScope}][${requestId}] Missing bearer token`);
    return '';
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user?.id) {
      console.warn(`[${routeScope}][${requestId}] Token verification failed`);
      return '';
    }

    return user.id;
  } catch (error) {
    console.error(`[${routeScope}][${requestId}] Token verification failed`, error);
    return '';
  }
}

export function jsonError(code, message, status, requestId) {
  return Response.json(
    {
      error: {
        code,
        message,
        requestId,
      },
    },
    { status }
  );
}
