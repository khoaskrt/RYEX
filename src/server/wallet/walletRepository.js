import { createClient } from '../../shared/lib/supabase/server.js';
import { WITHDRAW_DEFAULT_LIMITS } from './constants.js';

export async function getUserWallet(userId, chain) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('user_wallets')
    .select('wallet_id, user_id, chain, address, created_at')
    .eq('user_id', userId)
    .eq('chain', chain)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function createUserWallet({ userId, chain, address, encryptedKey, iv, authTag }) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('user_wallets')
    .insert({
      user_id: userId,
      chain,
      address,
      encrypted_key: encryptedKey,
      iv,
      auth_tag: authTag,
    })
    .select('wallet_id, user_id, chain, address, created_at')
    .single();

  if (error) throw error;
  return data;
}

export async function getWithdrawLimits(userId) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('withdraw_limits')
    .select('daily_limit_usdt, per_tx_min_usdt, per_tx_max_usdt, hourly_tx_limit')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;

  if (!data) {
    return {
      daily_limit_usdt: WITHDRAW_DEFAULT_LIMITS.dailyLimitUSDT,
      per_tx_min_usdt: WITHDRAW_DEFAULT_LIMITS.minPerTxUSDT,
      per_tx_max_usdt: WITHDRAW_DEFAULT_LIMITS.maxPerTxUSDT,
      hourly_tx_limit: WITHDRAW_DEFAULT_LIMITS.hourlyTxLimit,
    };
  }

  return data;
}

export async function getFundingBalance(userId, symbol) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('user_assets')
    .select('balance')
    .eq('user_id', userId)
    .eq('symbol', symbol)
    .eq('account_type', 'funding')
    .maybeSingle();

  if (error) throw error;
  return data?.balance || '0';
}

export async function getWithdrawStats(userId, dailySinceISO, hourlySinceISO) {
  const supabase = await createClient();

  const { data: dailyRows, error: dailyError } = await supabase
    .from('wallet_transactions')
    .select('amount')
    .eq('user_id', userId)
    .eq('tx_type', 'withdraw')
    .in('status', ['pending', 'confirming', 'completed'])
    .gte('created_at', dailySinceISO);

  if (dailyError) throw dailyError;

  const { count: hourlyCount, error: hourlyError } = await supabase
    .from('wallet_transactions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('tx_type', 'withdraw')
    .in('status', ['pending', 'confirming', 'completed'])
    .gte('created_at', hourlySinceISO);

  if (hourlyError) throw hourlyError;

  return {
    dailyRows: dailyRows || [],
    hourlyCount: hourlyCount || 0,
  };
}

export async function createWithdrawTransaction(payload) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('wallet_transactions')
    .insert(payload)
    .select(
      `
      transaction_id,
      status,
      requested_amount_usdt,
      platform_fee_usdt,
      network_fee_bnb,
      receive_amount_usdt,
      created_at
    `
    )
    .single();

  if (error) throw error;
  return data;
}

export async function listUserTransactions({ userId, type, status, limit, offset }) {
  const supabase = await createClient();

  let baseFilter = supabase.from('wallet_transactions').select('*', { count: 'exact', head: true }).eq('user_id', userId);

  if (type && type !== 'all') {
    baseFilter = baseFilter.eq('tx_type', type);
  }

  if (status && status !== 'all') {
    baseFilter = baseFilter.eq('status', status);
  }

  const { count, error: countError } = await baseFilter;
  if (countError) throw countError;

  let dataQuery = supabase
    .from('wallet_transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (type && type !== 'all') {
    dataQuery = dataQuery.eq('tx_type', type);
  }

  if (status && status !== 'all') {
    dataQuery = dataQuery.eq('status', status);
  }

  const { data, error } = await dataQuery;
  if (error) throw error;

  return {
    transactions: data || [],
    total: count || 0,
  };
}
