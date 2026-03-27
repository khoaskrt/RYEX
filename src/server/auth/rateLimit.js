import { AUTH_ERROR, AuthApiError } from './errors';

const memoryStore = new Map();

export function enforceRateLimit(key, limit, windowMs) {
  const now = Date.now();
  const entry = memoryStore.get(key);

  if (!entry || entry.expiresAt <= now) {
    memoryStore.set(key, { count: 1, expiresAt: now + windowMs });
    return;
  }

  if (entry.count >= limit) {
    throw new AuthApiError(AUTH_ERROR.RATE_LIMITED, 'Too many requests', 429);
  }

  entry.count += 1;
}
