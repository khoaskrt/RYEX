import { NextResponse } from 'next/server';
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

/**
 * Verify Supabase token and return user ID
 * @param {Request} request
 * @returns {Promise<string>} User ID or empty string
 */
async function verifySupabaseUser(request) {
  const token = extractBearerToken(request);
  if (!token) {
    console.log('[user/assets] No token found in Authorization header');
    return '';
  }

  console.log('[user/assets] Token received, length:', token.length);

  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      console.error('[user/assets] Token verification failed:', error?.message);
      return '';
    }

    console.log('[user/assets] Token verified successfully, user id:', user.id);
    return user.id || '';
  } catch (error) {
    console.error('[user/assets] Token verification failed:', error.message);
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
function jsonError(code, message, status) {
  return NextResponse.json(
    {
      error: {
        code,
        message,
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
  try {
    // Auth: verify bearer token
    const userId = await verifySupabaseUser(request);
    if (!userId) {
      return jsonError('ASSET_UNAUTHORIZED', 'Unauthorized', 401);
    }

    // Domain layer: fetch and enrich user assets
    const payload = await getUserAssetsPayload(userId);

    return NextResponse.json(payload, { status: 200 });
  } catch (error) {
    // Handle known domain errors
    if (error.code === 'ASSET_USER_NOT_FOUND') {
      return jsonError(error.code, error.message, 404);
    }

    if (error.code === 'ASSET_FETCH_FAILED') {
      return jsonError(error.code, error.message, 500);
    }

    // Handle token-related errors
    if (String(error?.message || '').toLowerCase().includes('token')) {
      return jsonError('ASSET_UNAUTHORIZED', 'Unauthorized', 401);
    }

    // Generic server error
    console.error('[user/assets] Unexpected error:', error);
    return jsonError('ASSET_FETCH_FAILED', 'Failed to fetch assets', 500);
  }
}
