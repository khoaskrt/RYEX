import { getTrustedCookieName } from '@/server/auth/trustedDevice';

export const SESSION_COOKIE_NAME = 'ryex_session_ref';

export function sessionRefCookieOptions(maxAgeSeconds) {
  return {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: process.env.AUTH_COOKIE_SECURE === 'true',
    maxAge: maxAgeSeconds,
  };
}

export function trustedDeviceCookieOptions(maxAgeSeconds) {
  return {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: process.env.AUTH_COOKIE_SECURE === 'true',
    maxAge: maxAgeSeconds,
  };
}

/** Max-Age seconds aligned with trusted token TTL (~30d). */
export function attachSessionToResponse(response, sessionRef, maxAgeSeconds) {
  response.cookies.set(SESSION_COOKIE_NAME, sessionRef, sessionRefCookieOptions(maxAgeSeconds));
}

export function attachTrustedDeviceCookie(response, rawToken, maxAgeSeconds) {
  response.cookies.set(getTrustedCookieName(), rawToken, trustedDeviceCookieOptions(maxAgeSeconds));
}

export function clearAuthCookies(response) {
  const secure = process.env.AUTH_COOKIE_SECURE === 'true';
  const base = { path: '/', maxAge: 0, httpOnly: true, sameSite: 'lax', secure };
  response.cookies.set(SESSION_COOKIE_NAME, '', base);
  response.cookies.set(getTrustedCookieName(), '', base);
}
