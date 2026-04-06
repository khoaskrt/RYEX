import { pgPool } from '../db/postgres.js';

export async function createOrder(client, payload) {
  const { rows } = await client.query(
    `
      INSERT INTO public.spot_orders (
        user_id,
        symbol,
        side,
        type,
        status,
        price,
        amount,
        filled_amount,
        time_in_force
      ) VALUES ($1, $2, $3, $4, $5, $6::numeric, $7::numeric, $8::numeric, $9)
      RETURNING *
    `,
    [
      payload.userId,
      payload.symbol,
      payload.side,
      payload.type,
      payload.status,
      payload.price,
      payload.amount,
      payload.filledAmount || '0',
      payload.timeInForce,
    ]
  );

  return rows[0] || null;
}

export async function getOrderByIdForUser(orderId, userId) {
  const { rows } = await pgPool.query(
    `
      SELECT *
      FROM public.spot_orders
      WHERE id = $1
        AND user_id = $2
      LIMIT 1
    `,
    [orderId, userId]
  );

  return rows[0] || null;
}

export async function getOrderByIdForUpdate(client, orderId, userId) {
  const { rows } = await client.query(
    `
      SELECT *
      FROM public.spot_orders
      WHERE id = $1
        AND user_id = $2
      FOR UPDATE
    `,
    [orderId, userId]
  );

  return rows[0] || null;
}

export async function setOrderFilled(client, orderId, amount) {
  const { rows } = await client.query(
    `
      UPDATE public.spot_orders
      SET status = 'filled',
          filled_amount = $2::numeric,
          filled_at = NOW(),
          updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `,
    [orderId, amount]
  );

  return rows[0] || null;
}

export async function setOrderCancelled(client, orderId) {
  const { rows } = await client.query(
    `
      UPDATE public.spot_orders
      SET status = 'cancelled',
          updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `,
    [orderId]
  );

  return rows[0] || null;
}

export async function createTrade(client, payload) {
  const { rows } = await client.query(
    `
      INSERT INTO public.spot_trades (
        order_id,
        user_id,
        symbol,
        side,
        price,
        amount,
        fee,
        fee_asset
      ) VALUES ($1, $2, $3, $4, $5::numeric, $6::numeric, $7::numeric, $8)
      RETURNING *
    `,
    [
      payload.orderId,
      payload.userId,
      payload.symbol,
      payload.side,
      payload.price,
      payload.amount,
      payload.fee || '0',
      payload.feeAsset || 'USDT',
    ]
  );

  return rows[0] || null;
}

export async function lockUserAssetBalance(client, { userId, symbol, accountType }) {
  const { rows } = await client.query(
    `
      SELECT balance
      FROM public.user_assets
      WHERE user_id = $1
        AND symbol = $2
        AND account_type = $3
      FOR UPDATE
    `,
    [userId, symbol, accountType]
  );

  return rows[0] || null;
}

export async function decreaseUserAssetBalance(client, { userId, symbol, accountType, amount }) {
  await client.query(
    `
      UPDATE public.user_assets
      SET balance = balance - $4::numeric,
          updated_at = NOW()
      WHERE user_id = $1
        AND symbol = $2
        AND account_type = $3
    `,
    [userId, symbol, accountType, amount]
  );
}

export async function upsertIncreaseUserAssetBalance(client, { userId, symbol, accountType, amount }) {
  await client.query(
    `
      INSERT INTO public.user_assets (user_id, symbol, account_type, balance, created_at, updated_at)
      VALUES ($1, $2, $3, $4::numeric, NOW(), NOW())
      ON CONFLICT (user_id, symbol, account_type)
      DO UPDATE SET
        balance = public.user_assets.balance + EXCLUDED.balance,
        updated_at = NOW()
    `,
    [userId, symbol, accountType, amount]
  );
}

export async function listOrders({ userId, status, symbol, limit, offset }) {
  const values = [userId];
  const filters = ['user_id = $1'];

  if (status) {
    values.push(status);
    filters.push(`status = $${values.length}`);
  }

  if (symbol) {
    values.push(symbol);
    filters.push(`symbol = $${values.length}`);
  }

  values.push(limit, offset);

  const { rows } = await pgPool.query(
    `
      SELECT *
      FROM public.spot_orders
      WHERE ${filters.join(' AND ')}
      ORDER BY created_at DESC
      LIMIT $${values.length - 1}
      OFFSET $${values.length}
    `,
    values
  );

  return rows;
}

export async function countOrders({ userId, status, symbol }) {
  const values = [userId];
  const filters = ['user_id = $1'];

  if (status) {
    values.push(status);
    filters.push(`status = $${values.length}`);
  }

  if (symbol) {
    values.push(symbol);
    filters.push(`symbol = $${values.length}`);
  }

  const { rows } = await pgPool.query(
    `
      SELECT COUNT(*)::int AS total
      FROM public.spot_orders
      WHERE ${filters.join(' AND ')}
    `,
    values
  );

  return rows[0]?.total || 0;
}

export async function listTrades({ userId, symbol, limit, offset }) {
  const values = [userId];
  const filters = ['user_id = $1'];

  if (symbol) {
    values.push(symbol);
    filters.push(`symbol = $${values.length}`);
  }

  values.push(limit, offset);

  const { rows } = await pgPool.query(
    `
      SELECT *
      FROM public.spot_trades
      WHERE ${filters.join(' AND ')}
      ORDER BY executed_at DESC
      LIMIT $${values.length - 1}
      OFFSET $${values.length}
    `,
    values
  );

  return rows;
}

export async function countTrades({ userId, symbol }) {
  const values = [userId];
  const filters = ['user_id = $1'];

  if (symbol) {
    values.push(symbol);
    filters.push(`symbol = $${values.length}`);
  }

  const { rows } = await pgPool.query(
    `
      SELECT COUNT(*)::int AS total
      FROM public.spot_trades
      WHERE ${filters.join(' AND ')}
    `,
    values
  );

  return rows[0]?.total || 0;
}
