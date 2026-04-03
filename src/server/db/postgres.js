import { Pool } from 'pg';

const rawConnectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!rawConnectionString) {
  throw new Error('DATABASE_URL or POSTGRES_URL is required');
}

const globalForPool = globalThis;

function parseBooleanEnv(value, fallback = false) {
  if (value == null) return fallback;
  const normalized = String(value).trim().toLowerCase();
  if (['1', 'true', 'yes', 'on'].includes(normalized)) return true;
  if (['0', 'false', 'no', 'off'].includes(normalized)) return false;
  return fallback;
}

function resolveSslConfig(url) {
  const forceSsl = parseBooleanEnv(process.env.POSTGRES_SSL, false);
  const noVerify = parseBooleanEnv(process.env.POSTGRES_SSL_NO_VERIFY, false);
  const rejectUnauthorized = parseBooleanEnv(process.env.POSTGRES_SSL_REJECT_UNAUTHORIZED, !noVerify);
  const inferredSsl =
    forceSsl || /sslmode=require/i.test(url) || /supabase\./i.test(url);

  if (!inferredSsl) return undefined;

  return {
    rejectUnauthorized,
  };
}

function normalizeConnectionString(url) {
  const noVerify = parseBooleanEnv(process.env.POSTGRES_SSL_NO_VERIFY, false);
  if (!noVerify) return url;

  if (/[?&]sslmode=require/i.test(url)) {
    return url.replace(/sslmode=require/gi, 'sslmode=no-verify');
  }

  const delimiter = url.includes('?') ? '&' : '?';
  return `${url}${delimiter}sslmode=no-verify`;
}

const connectionString = normalizeConnectionString(rawConnectionString);

export const pgPool =
  globalForPool.__ryexPgPool ||
  new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30000,
    ssl: resolveSslConfig(connectionString) || { rejectUnauthorized: false },
  });

if (!globalForPool.__ryexPgPool) {
  globalForPool.__ryexPgPool = pgPool;
}

export async function withTransaction(callback) {
  const client = await pgPool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
