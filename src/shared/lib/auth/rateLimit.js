import { rateLimitEnv } from '@/shared/lib/env.server';

const globalStore = globalThis;

const memoryStore = globalStore.__ryexRateLimitStore || new Map();

if (process.env.NODE_ENV !== 'production') {
  globalStore.__ryexRateLimitStore = memoryStore;
}

function isRedisRateLimitEnabled() {
  return rateLimitEnv.useRedis && Boolean(rateLimitEnv.redisRestUrl) && Boolean(rateLimitEnv.redisRestToken);
}

function checkRateLimitInMemory(key, { limit, windowMs }) {
  const now = Date.now();
  const current = memoryStore.get(key);

  if (!current || current.resetAt <= now) {
    memoryStore.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });
    return { allowed: true, retryAfterSeconds: 0, backend: 'memory' };
  }

  if (current.count >= limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
      backend: 'memory',
    };
  }

  current.count += 1;
  return { allowed: true, retryAfterSeconds: 0, backend: 'memory' };
}

async function checkRateLimitViaRedisRest(key, { limit, windowMs }) {
  const endpoint = `${rateLimitEnv.redisRestUrl}/pipeline`;
  const windowSeconds = Math.ceil(windowMs / 1000);

  // INCR first, then ensure TTL exists.
  const commands = [
    ['INCR', key],
    ['TTL', key],
    ['EXPIRE', key, `${windowSeconds}`, 'NX'],
    ['TTL', key],
  ];

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RATE_LIMIT_REDIS_REST_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(commands),
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Redis REST returned ${response.status}`);
  }

  const data = await response.json();
  const count = Number(data?.[0]?.result ?? 0);
  let ttlSeconds = Number(data?.[3]?.result ?? data?.[1]?.result ?? windowSeconds);

  if (!Number.isFinite(ttlSeconds) || ttlSeconds < 0) {
    ttlSeconds = windowSeconds;
  }

  if (count > limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, ttlSeconds),
      backend: 'redis',
    };
  }

  return { allowed: true, retryAfterSeconds: 0, backend: 'redis' };
}

export async function checkRateLimit(key, { limit, windowMs }) {
  if (!isRedisRateLimitEnabled()) {
    return checkRateLimitInMemory(key, { limit, windowMs });
  }

  try {
    return await checkRateLimitViaRedisRest(key, { limit, windowMs });
  } catch {
    // Graceful fallback to memory so auth flow is not blocked.
    return checkRateLimitInMemory(key, { limit, windowMs });
  }
}
