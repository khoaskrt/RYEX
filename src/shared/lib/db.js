import { Pool } from 'pg';

import { databaseUrl } from './env.server';

const globalForDb = globalThis;

export const pool =
  globalForDb.__ryexPool ||
  new Pool({
    connectionString: databaseUrl,
  });

if (process.env.NODE_ENV !== 'production') {
  globalForDb.__ryexPool = pool;
}

export async function query(text, params = []) {
  return pool.query(text, params);
}
