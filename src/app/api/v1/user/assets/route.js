import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { createClient } from '../../../../../shared/lib/supabase/server.js';
import { getUserAssetsPayload } from '../../../../../server/user/assetsRepository.js';

export const runtime = 'nodejs';

/**
 * Extract bearer token from Authorization header
 * @param {Request} request
 * @returns {string} Token or empty string
 */
function extractBearerToken(request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return '';
  return authHeader.split('Bearer ')[1];
}

function getRequestId(request) {
  return request.headers.get('x-request-id') || crypto.randomUUID();
}

function shouldInjectAssetFetchFailure(request) {
  if (process.env.NODE_ENV === 'production') return false;
  if (process.env.ASSET_QA_FAULT_INJECTION_ENABLED !== 'true') return false;

  const headerSignal = request.headers.get('x-qa-fault-injection');
  const url = new URL(request.url);
  const querySignal = url.searchParams.get('qaFault');
  const signal = headerSignal || querySignal || '';

  return signal === 'ASSET_FETCH_FAILED';
}

/**
 * Verify Supabase token and return user ID
 * @param {Request} request
 * @param {string} requestId
 * @returns {Promise<string>} User ID or empty string
 */
async function verifySupabaseUser(request, requestId) {
  const token = extractBearerToken(request);
  if (!token) {
    console.warn(`[user/assets][${requestId}] Missing bearer token`);
    return '';
  }

  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      console.warn(`[user/assets][${requestId}] Token verification failed`);
      return '';
    }

    return user.id || '';
  } catch (error) {
    console.error(`[user/assets][${requestId}] Token verification failed`, error);
    return '';
  }
}

/**
 * Standard error response helper
 * @param {string} code - Error code
 * @param {string} message - Error message
 * @param {number} status - HTTP status code
 * @returns {NextResponse}
 */
function jsonError(code, message, status, requestId) {
  return NextResponse.json(
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

/**
 * GET /api/v1/user/assets
 * Fetch authenticated user's crypto asset balances with live market prices
 */
export async function GET(request) {
  const requestId = getRequestId(request);

  try {
    // Auth: verify bearer token
    const userId = await verifySupabaseUser(request, requestId);
    if (!userId) {
      return jsonError('ASSET_UNAUTHORIZED', 'Unauthorized', 401, requestId);
    }

    if (shouldInjectAssetFetchFailure(request)) {
      const forcedError = new Error('Forced asset fetch failure for QA');
      forcedError.code = 'ASSET_FETCH_FAILED';
      throw forcedError;
    }

    // Domain layer: fetch and enrich user assets
    const payload = await getUserAssetsPayload(userId);

    return NextResponse.json(payload, { status: 200 });
  } catch (error) {
    // Handle known domain errors
    if (error.code === 'ASSET_USER_NOT_FOUND') {
      return jsonError(error.code, error.message, 404, requestId);
    }

    if (error.code === 'ASSET_FETCH_FAILED') {
      return jsonError(error.code, error.message, 500, requestId);
    }

    // Handle token-related errors
    if (String(error?.message || '').toLowerCase().includes('token')) {
      return jsonError('ASSET_UNAUTHORIZED', 'Unauthorized', 401, requestId);
    }

    // Generic server error
    console.error(`[user/assets][${requestId}] Unexpected error`, error);
    return jsonError('ASSET_FETCH_FAILED', 'Failed to fetch assets', 500, requestId);
  }
}
