import { randomUUID } from 'node:crypto';

export function getRequestMeta(request) {
  const requestId = request.headers.get('x-request-id') || randomUUID();
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : '127.0.0.1';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  return { requestId, ip, userAgent };
}
