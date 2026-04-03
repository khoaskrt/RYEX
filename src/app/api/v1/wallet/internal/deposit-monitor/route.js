import { NextResponse } from 'next/server';
import { assertWalletConfig, verifyInternalWalletKey } from '../../../../../../server/wallet/config.js';
import { isWalletError } from '../../../../../../server/wallet/errors.js';
import { getRequestId, jsonError } from '../../../../../../server/wallet/http.js';
import { applyDepositEvents } from '../../../../../../server/wallet/walletProcessorService.js';

export const runtime = 'nodejs';

export async function POST(request) {
  const requestId = getRequestId(request);

  try {
    assertWalletConfig({ requireEncryptionKey: true, requireInternalApiKey: true });

    if (!verifyInternalWalletKey(request)) {
      return jsonError('WALLET_FORBIDDEN', 'Forbidden', 403, requestId);
    }

    const body = await request.json().catch(() => ({}));
    const events = Array.isArray(body.events) ? body.events : [];

    const summary = await applyDepositEvents(events);
    return NextResponse.json(
      {
        monitor: 'deposit',
        requestId,
        ...summary,
      },
      { status: 200 }
    );
  } catch (error) {
    if (isWalletError(error)) {
      return jsonError(error.code, error.message, error.status, requestId);
    }

    console.error(`[wallet/internal/deposit-monitor][${requestId}] Unexpected error`, error);
    return jsonError('DEPOSIT_MONITOR_FAILED', 'Failed to process deposit monitor tick', 500, requestId);
  }
}
