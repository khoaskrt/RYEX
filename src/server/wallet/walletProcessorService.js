import crypto from 'node:crypto';
import { withTransaction } from '../db/postgres.js';
import { CHAIN_CONFIG, SUPPORTED_CHAIN, SUPPORTED_SYMBOL } from './constants.js';
import { WalletError } from './errors.js';
import { normalizeChain, normalizeSymbol, normalizeAddress } from './validation.js';

function toSafePositiveInteger(value, fallbackValue) {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  if (!Number.isFinite(parsed) || parsed < 0) return fallbackValue;
  return parsed;
}

function toSafePositiveDecimalString(rawAmount) {
  const normalized = String(rawAmount ?? '').trim();
  if (!normalized) {
    throw new WalletError('DEPOSIT_INVALID_AMOUNT', 'Deposit amount is required', 400);
  }

  const asNumber = Number.parseFloat(normalized);
  if (!Number.isFinite(asNumber) || asNumber <= 0) {
    throw new WalletError('DEPOSIT_INVALID_AMOUNT', 'Deposit amount must be greater than zero', 400);
  }

  return normalized;
}

function createSyntheticWithdrawHash(transactionId) {
  const digest = crypto.createHash('sha256').update(`${transactionId}:${Date.now()}`).digest('hex');
  return `0x${digest.slice(0, 64)}`;
}

function buildDepositTuple(event) {
  const chain = normalizeChain(event.chain || SUPPORTED_CHAIN);
  const symbol = normalizeSymbol(event.symbol || SUPPORTED_SYMBOL);
  const txHash = String(event.txHash || '').trim();
  const logIndex = toSafePositiveInteger(event.logIndex, -1);
  const toAddress = normalizeAddress(event.toAddress);
  const fromAddress = event.fromAddress ? normalizeAddress(event.fromAddress) : null;
  const amount = toSafePositiveDecimalString(event.amount);
  const blockNumber = toSafePositiveInteger(event.blockNumber, 0);
  const confirmations = toSafePositiveInteger(event.confirmations, 0);

  if (!txHash || logIndex < 0) {
    throw new WalletError('DEPOSIT_INVALID_EVENT', 'Deposit event tuple is invalid', 400);
  }

  return {
    chain,
    symbol,
    txHash,
    logIndex,
    toAddress,
    fromAddress,
    amount,
    blockNumber,
    confirmations,
  };
}

export async function applyDepositEvents(events = []) {
  const safeEvents = Array.isArray(events) ? events : [];
  const summary = {
    total: safeEvents.length,
    credited: 0,
    confirming: 0,
    duplicate: 0,
    skipped: 0,
    errors: 0,
    items: [],
  };

  for (const event of safeEvents) {
    try {
      const result = await applySingleDepositEvent(event);
      summary.items.push(result);

      if (result.result === 'credited') summary.credited += 1;
      else if (result.result === 'confirming') summary.confirming += 1;
      else if (result.result === 'duplicate') summary.duplicate += 1;
      else summary.skipped += 1;
    } catch (error) {
      summary.errors += 1;
      summary.items.push({
        result: 'error',
        code: error?.code || 'DEPOSIT_PROCESSOR_FAILED',
        message: error?.message || 'Failed to apply deposit event',
      });
    }
  }

  return summary;
}

async function applySingleDepositEvent(rawEvent) {
  const event = buildDepositTuple(rawEvent);
  const requiredConfirmations = CHAIN_CONFIG[event.chain]?.requiredConfirmations || 12;

  return withTransaction(async (client) => {
    const walletResult = await client.query(
      `
      SELECT wallet_id, user_id
      FROM public.user_wallets
      WHERE chain = $1
        AND lower(address) = lower($2)
      LIMIT 1
      `,
      [event.chain, event.toAddress]
    );

    if (!walletResult.rows[0]) {
      return {
        result: 'wallet_not_found',
        txHash: event.txHash,
        logIndex: event.logIndex,
        toAddress: event.toAddress,
      };
    }

    const wallet = walletResult.rows[0];

    const existingResult = await client.query(
      `
      SELECT transaction_id, status, confirmations
      FROM public.wallet_transactions
      WHERE chain = $1
        AND tx_hash = $2
        AND log_index = $3
        AND lower(to_address) = lower($4)
        AND tx_type = 'deposit'
      FOR UPDATE
      `,
      [event.chain, event.txHash, event.logIndex, event.toAddress]
    );

    const existing = existingResult.rows[0];
    if (!existing) {
      const status = event.confirmations >= requiredConfirmations ? 'completed' : 'confirming';

      const insertResult = await client.query(
        `
        INSERT INTO public.wallet_transactions (
          user_id,
          wallet_id,
          tx_type,
          symbol,
          chain,
          account_type,
          amount,
          requested_amount_usdt,
          platform_fee_usdt,
          receive_amount_usdt,
          network_fee_bnb,
          tx_hash,
          log_index,
          from_address,
          to_address,
          block_number,
          confirmations,
          status,
          confirmed_at,
          completed_at
        )
        VALUES (
          $1,
          $2,
          'deposit',
          $3,
          $4,
          'funding',
          $5,
          $5,
          0,
          $5,
          0,
          $6,
          $7,
          $8,
          $9,
          $10,
          $11,
          $12,
          CASE WHEN $12 = 'completed' THEN NOW() ELSE NULL END,
          CASE WHEN $12 = 'completed' THEN NOW() ELSE NULL END
        )
        RETURNING transaction_id, status
        `,
        [
          wallet.user_id,
          wallet.wallet_id,
          event.symbol,
          event.chain,
          event.amount,
          event.txHash,
          event.logIndex,
          event.fromAddress,
          event.toAddress,
          event.blockNumber,
          event.confirmations,
          status,
        ]
      );

      const created = insertResult.rows[0];
      await upsertDepositMonitorState(client, wallet.wallet_id, event.chain, event.blockNumber);

      if (created.status === 'completed') {
        await creditFundingBalance(client, wallet.user_id, event.symbol, event.amount);
        return {
          result: 'credited',
          transactionId: created.transaction_id,
          txHash: event.txHash,
          logIndex: event.logIndex,
        };
      }

      return {
        result: 'confirming',
        transactionId: created.transaction_id,
        txHash: event.txHash,
        logIndex: event.logIndex,
      };
    }

    const nextConfirmations = Math.max(
      toSafePositiveInteger(existing.confirmations, 0),
      event.confirmations
    );
    const canCompleteNow = existing.status !== 'completed' && nextConfirmations >= requiredConfirmations;

    if (canCompleteNow) {
      await client.query(
        `
        UPDATE public.wallet_transactions
        SET confirmations = $2,
            block_number = GREATEST(COALESCE(block_number, 0), $3),
            status = 'completed',
            confirmed_at = COALESCE(confirmed_at, NOW()),
            completed_at = NOW(),
            error_code = NULL,
            error_message = NULL
        WHERE transaction_id = $1
        `,
        [existing.transaction_id, nextConfirmations, event.blockNumber]
      );

      await creditFundingBalance(client, wallet.user_id, event.symbol, event.amount);
      await upsertDepositMonitorState(client, wallet.wallet_id, event.chain, event.blockNumber);

      return {
        result: 'credited',
        transactionId: existing.transaction_id,
        txHash: event.txHash,
        logIndex: event.logIndex,
      };
    }

    await client.query(
      `
      UPDATE public.wallet_transactions
      SET confirmations = GREATEST(COALESCE(confirmations, 0), $2),
          block_number = GREATEST(COALESCE(block_number, 0), $3)
      WHERE transaction_id = $1
      `,
      [existing.transaction_id, nextConfirmations, event.blockNumber]
    );

    await upsertDepositMonitorState(client, wallet.wallet_id, event.chain, event.blockNumber);
    return {
      result: 'duplicate',
      transactionId: existing.transaction_id,
      txHash: event.txHash,
      logIndex: event.logIndex,
    };
  });
}

async function creditFundingBalance(client, userId, symbol, amount) {
  await client.query(
    `
    INSERT INTO public.user_assets (user_id, symbol, account_type, balance, created_at, updated_at)
    VALUES ($1, $2, 'funding', $3::numeric, NOW(), NOW())
    ON CONFLICT (user_id, symbol, account_type)
    DO UPDATE SET
      balance = public.user_assets.balance + EXCLUDED.balance,
      updated_at = NOW()
    `,
    [userId, symbol, amount]
  );
}

async function upsertDepositMonitorState(client, walletId, chain, blockNumber) {
  await client.query(
    `
    INSERT INTO public.deposit_monitor_state (wallet_id, chain, last_scanned_block, last_scan_at, updated_at)
    VALUES ($1, $2, $3, NOW(), NOW())
    ON CONFLICT (wallet_id)
    DO UPDATE SET
      last_scanned_block = GREATEST(public.deposit_monitor_state.last_scanned_block, EXCLUDED.last_scanned_block),
      last_scan_at = NOW(),
      updated_at = NOW()
    `,
    [walletId, chain, blockNumber]
  );
}

async function processSingleWithdraw(transactionId) {
  return withTransaction(async (client) => {
    const txResult = await client.query(
      `
      SELECT
        transaction_id,
        user_id,
        symbol,
        amount,
        status,
        tx_hash
      FROM public.wallet_transactions
      WHERE transaction_id = $1
        AND tx_type = 'withdraw'
      FOR UPDATE
      `,
      [transactionId]
    );

    const tx = txResult.rows[0];
    if (!tx) {
      return { result: 'not_found', transactionId };
    }

    if (tx.status !== 'pending') {
      return { result: 'skipped', transactionId: tx.transaction_id, status: tx.status };
    }

    await client.query(
      `
      UPDATE public.wallet_transactions
      SET status = 'confirming',
          confirmed_at = COALESCE(confirmed_at, NOW())
      WHERE transaction_id = $1
      `,
      [tx.transaction_id]
    );

    const assetResult = await client.query(
      `
      SELECT balance
      FROM public.user_assets
      WHERE user_id = $1
        AND symbol = $2
        AND account_type = 'funding'
      FOR UPDATE
      `,
      [tx.user_id, tx.symbol]
    );

    const asset = assetResult.rows[0];
    const currentBalance = Number.parseFloat(String(asset?.balance ?? '0'));
    const amountToDebit = Number.parseFloat(String(tx.amount || '0'));

    if (!asset || !Number.isFinite(currentBalance) || currentBalance < amountToDebit) {
      await client.query(
        `
        UPDATE public.wallet_transactions
        SET status = 'failed',
            error_code = 'WITHDRAW_INSUFFICIENT_BALANCE',
            error_message = 'Insufficient funding balance at processor stage',
            completed_at = NOW()
        WHERE transaction_id = $1
        `,
        [tx.transaction_id]
      );

      return {
        result: 'failed',
        transactionId: tx.transaction_id,
        code: 'WITHDRAW_INSUFFICIENT_BALANCE',
      };
    }

    await client.query(
      `
      UPDATE public.user_assets
      SET balance = balance - $1::numeric,
          updated_at = NOW()
      WHERE user_id = $2
        AND symbol = $3
        AND account_type = 'funding'
      `,
      [tx.amount, tx.user_id, tx.symbol]
    );

    const txHash = tx.tx_hash || createSyntheticWithdrawHash(tx.transaction_id);
    const requiredConfirmations = CHAIN_CONFIG[SUPPORTED_CHAIN]?.requiredConfirmations || 12;

    await client.query(
      `
      UPDATE public.wallet_transactions
      SET status = 'completed',
          tx_hash = $2,
          confirmations = $3,
          error_code = NULL,
          error_message = NULL,
          completed_at = NOW()
      WHERE transaction_id = $1
      `,
      [tx.transaction_id, txHash, requiredConfirmations]
    );

    return {
      result: 'completed',
      transactionId: tx.transaction_id,
      txHash,
      debitedAmount: String(tx.amount || '0'),
    };
  });
}

export async function processPendingWithdrawals({ limit = 20 } = {}) {
  const safeLimit = Math.max(1, Math.min(200, Number.parseInt(String(limit), 10) || 20));

  return withTransaction(async (client) => {
    const idsResult = await client.query(
      `
      SELECT transaction_id
      FROM public.wallet_transactions
      WHERE tx_type = 'withdraw'
        AND status = 'pending'
      ORDER BY created_at ASC
      LIMIT $1
      FOR UPDATE SKIP LOCKED
      `,
      [safeLimit]
    );

    return idsResult.rows.map((row) => row.transaction_id);
  }).then(async (ids) => {
    const items = [];
    let completed = 0;
    let failed = 0;
    let skipped = 0;

    for (const transactionId of ids) {
      const result = await processSingleWithdraw(transactionId);
      items.push(result);

      if (result.result === 'completed') completed += 1;
      else if (result.result === 'failed') failed += 1;
      else skipped += 1;
    }

    return {
      total: ids.length,
      completed,
      failed,
      skipped,
      items,
    };
  });
}
