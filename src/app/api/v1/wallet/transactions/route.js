import { NextResponse } from 'next/server';
import { isWalletError } from '../../../../../server/wallet/errors.js';
import { getRequestId, jsonError, verifySupabaseUserId } from '../../../../../server/wallet/http.js';
import { getTransactions } from '../../../../../server/wallet/walletService.js';

export const runtime = 'nodejs';

export async function GET(request) {
  const requestId = getRequestId(request);

  try {
    const userId = await verifySupabaseUserId(request, requestId, 'wallet/transactions');
    if (!userId) {
      return jsonError('WALLET_UNAUTHORIZED', 'Unauthorized', 401, requestId);
    }

    const url = new URL(request.url);

    const payload = await getTransactions({
      userId,
      type: url.searchParams.get('type') || 'all',
      status: url.searchParams.get('status') || 'all',
      limit: url.searchParams.get('limit') || '20',
      offset: url.searchParams.get('offset') || '0',
    });

    return NextResponse.json(payload, { status: 200 });
  } catch (error) {
    if (isWalletError(error)) {
      return jsonError(error.code, error.message, error.status, requestId);
    }

    if (String(error?.message || '').toLowerCase().includes('token')) {
      return jsonError('WALLET_UNAUTHORIZED', 'Unauthorized', 401, requestId);
    }

    console.error(`[wallet/transactions][${requestId}] Unexpected error`, error);
    return jsonError('WALLET_TRANSACTIONS_FETCH_FAILED', 'Failed to fetch transactions', 500, requestId);
  }
}
