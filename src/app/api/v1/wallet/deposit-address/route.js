import { NextResponse } from 'next/server';
import { assertWalletConfig } from '../../../../../server/wallet/config.js';
import { isWalletError } from '../../../../../server/wallet/errors.js';
import { jsonError, getRequestId, verifySupabaseUserId } from '../../../../../server/wallet/http.js';
import { getDepositAddress, getOrCreateDepositAddress } from '../../../../../server/wallet/walletService.js';

export const runtime = 'nodejs';

function parseChainFromRequest(request) {
  const url = new URL(request.url);
  return url.searchParams.get('chain') || 'bsc_testnet';
}

export async function POST(request) {
  const requestId = getRequestId(request);

  try {
    assertWalletConfig({ requireEncryptionKey: true });

    const userId = await verifySupabaseUserId(request, requestId, 'wallet/deposit-address');
    if (!userId) {
      return jsonError('WALLET_UNAUTHORIZED', 'Unauthorized', 401, requestId);
    }

    const body = await request.json().catch(() => ({}));
    const payload = await getOrCreateDepositAddress({
      userId,
      chain: body.chain,
      symbol: body.symbol,
    });

    return NextResponse.json(payload, { status: 200 });
  } catch (error) {
    if (isWalletError(error)) {
      return jsonError(error.code, error.message, error.status, requestId);
    }

    if (String(error?.message || '').toLowerCase().includes('token')) {
      return jsonError('WALLET_UNAUTHORIZED', 'Unauthorized', 401, requestId);
    }

    console.error(`[wallet/deposit-address][${requestId}] Unexpected error`, error);
    return jsonError('WALLET_CREATION_FAILED', 'Failed to create or get deposit address', 500, requestId);
  }
}

export async function GET(request) {
  const requestId = getRequestId(request);

  try {
    const userId = await verifySupabaseUserId(request, requestId, 'wallet/deposit-address');
    if (!userId) {
      return jsonError('WALLET_UNAUTHORIZED', 'Unauthorized', 401, requestId);
    }

    const payload = await getDepositAddress({
      userId,
      chain: parseChainFromRequest(request),
      symbol: 'USDT',
    });

    return NextResponse.json(payload, { status: 200 });
  } catch (error) {
    if (isWalletError(error)) {
      if (error.code === 'WALLET_NOT_FOUND') {
        return jsonError(error.code, error.message, 404, requestId);
      }
      return jsonError(error.code, error.message, error.status, requestId);
    }

    if (String(error?.message || '').toLowerCase().includes('token')) {
      return jsonError('WALLET_UNAUTHORIZED', 'Unauthorized', 401, requestId);
    }

    console.error(`[wallet/deposit-address][${requestId}] Unexpected error`, error);
    return jsonError('WALLET_FETCH_FAILED', 'Failed to fetch deposit address', 500, requestId);
  }
}
