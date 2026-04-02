const toInt = (value, fallback) => {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const normalizePrivateKey = (value) => (value ? value.replace(/\\n/g, '\n') : '');

const isProd = process.env.NODE_ENV === 'production';

export const authEnv = {
  accessTtlSeconds: toInt(process.env.AUTH_ACCESS_TOKEN_TTL_SECONDS, 900),
  refreshTtlSeconds: toInt(process.env.AUTH_REFRESH_TOKEN_TTL_SECONDS, 604800),
  sessionCookieName: process.env.AUTH_SESSION_COOKIE_NAME || 'ryex_refresh_token',
  csrfCookieName: process.env.AUTH_CSRF_COOKIE_NAME || 'ryex_csrf_token',
  accessTokenSecret: process.env.AUTH_ACCESS_TOKEN_SECRET || process.env.SUPABASE_JWT_SECRET || '',
  cookieDomain: process.env.AUTH_COOKIE_DOMAIN || '',
  cookiePath: process.env.AUTH_COOKIE_PATH || '/',
  cookieSecure: process.env.AUTH_COOKIE_SECURE
    ? process.env.AUTH_COOKIE_SECURE === 'true'
    : isProd,
};

export const firebaseAdminEnv = {
  projectId: process.env.FIREBASE_PROJECT_ID || '',
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
  privateKey: normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY),
};

export const rateLimitEnv = {
  useRedis: process.env.RATE_LIMIT_USE_REDIS === 'true' || process.env.RATE_LIMIT_USE_REDIS === '1',
  redisRestUrl: process.env.RATE_LIMIT_REDIS_REST_URL || '',
  redisRestToken: process.env.RATE_LIMIT_REDIS_REST_TOKEN || '',
};

export const databaseUrl =
  process.env.DATABASE_URL ||
  'postgres://ryex:ryex_dev_password@localhost:5432/ryex_local';

export function assertServerConfig() {
  if (!firebaseAdminEnv.projectId || !firebaseAdminEnv.clientEmail || !firebaseAdminEnv.privateKey) {
    throw new Error('Firebase Admin env vars are missing.');
  }

  if (!authEnv.accessTokenSecret) {
    throw new Error('AUTH_ACCESS_TOKEN_SECRET (or SUPABASE_JWT_SECRET fallback) is required.');
  }
}
