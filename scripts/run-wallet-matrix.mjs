import { createClient } from '@supabase/supabase-js';

const baseUrl = process.env.WALLET_QA_BASE_URL || 'http://127.0.0.1:4030';
const service = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const pub = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLIC_KEY);

function rid() { return `${Date.now()}-${Math.random().toString(36).slice(2,8)}`; }

async function api(path, { method='GET', token='', body, headers={} } = {}) {
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      'content-type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  let payload = {};
  try { payload = await res.json(); } catch {}
  return { status: res.status, payload };
}

function check(cond, expected, actual) {
  return { pass: Boolean(cond), expected, actual };
}

const emailA = `qa.wallet.a.${Date.now()}@ryex.local`;
const emailB = `qa.wallet.b.${Date.now()}@ryex.local`;
const password = 'Ryex#123456';

const ua = await service.auth.admin.createUser({ email: emailA, password, email_confirm: true });
if (ua.error) throw ua.error;
const ub = await service.auth.admin.createUser({ email: emailB, password, email_confirm: true });
if (ub.error) throw ub.error;

const sa = await pub.auth.signInWithPassword({ email: emailA, password });
if (sa.error) throw sa.error;
const sb = await pub.auth.signInWithPassword({ email: emailB, password });
if (sb.error) throw sb.error;

const tokenA = sa.data.session.access_token;
const tokenB = sb.data.session.access_token;
const userA = sa.data.user.id;

await service.from('user_assets').upsert({ user_id: userA, symbol: 'USDT', account_type: 'funding', balance: '1000.00000000' }, { onConflict: 'user_id,symbol,account_type' });

const out = { env: { emailA, emailB }, cases: {}, shape: {}, summary: {} };

out.cases['WALLET-CT-01'] = await api('/api/v1/wallet/deposit-address', { method: 'POST', body: { chain:'bsc_testnet', symbol:'USDT' }});
out.cases['WALLET-CT-02'] = await api('/api/v1/wallet/deposit-address', { method: 'POST', token: tokenA, body: { chain:'eth_mainnet', symbol:'USDT' }});
out.cases['WALLET-CT-03'] = await api('/api/v1/wallet/deposit-address', { method: 'POST', token: tokenA, body: { chain:'bsc_testnet', symbol:'BTC' }});
out.cases['WALLET-CT-04'] = await api('/api/v1/wallet/deposit-address', { method: 'POST', token: tokenA, body: { chain:'bsc_testnet', symbol:'USDT' }});
out.cases['WALLET-CT-05'] = await api('/api/v1/wallet/deposit-address?chain=bsc_testnet', { method: 'GET', token: tokenB });
out.cases['WALLET-CT-06'] = await api('/api/v1/wallet/deposit-address?chain=bsc_testnet', { method: 'GET', token: tokenA });
out.cases['WALLET-CT-07'] = await api('/api/v1/wallet/withdraw', { method: 'POST', body: { chain:'bsc_testnet', symbol:'USDT', toAddress:'0x0000000000000000000000000000000000000001', amount:'10', accountType:'funding' }});
out.cases['WALLET-CT-08'] = await api('/api/v1/wallet/withdraw', { method: 'POST', token: tokenA, body: { chain:'bsc_testnet', symbol:'USDT', toAddress:'invalid-address', amount:'10', accountType:'funding' }});
out.cases['WALLET-CT-09'] = await api('/api/v1/wallet/withdraw', { method: 'POST', token: tokenA, body: { chain:'bsc_testnet', symbol:'USDT', toAddress:'0x0000000000000000000000000000000000000002', amount:'1', accountType:'funding' }});
out.cases['WALLET-CT-10'] = await api('/api/v1/wallet/withdraw', { method: 'POST', token: tokenA, body: { chain:'bsc_testnet', symbol:'USDT', toAddress:'0x0000000000000000000000000000000000000002', amount:'6000', accountType:'funding' }});
out.cases['WALLET-CT-11'] = await api('/api/v1/wallet/withdraw', { method: 'POST', token: tokenA, body: { chain:'bsc_testnet', symbol:'USDT', toAddress:'0x0000000000000000000000000000000000000002', amount:'2000', accountType:'funding' }});
const idem = `qa-wd-${rid()}`;
out.cases['WALLET-CT-12'] = await api('/api/v1/wallet/withdraw', { method: 'POST', token: tokenA, headers: { 'x-idempotency-key': idem }, body: { chain:'bsc_testnet', symbol:'USDT', toAddress:'0x0000000000000000000000000000000000000002', amount:'50', accountType:'funding' }});
out.cases['WALLET-CT-13'] = await api('/api/v1/wallet/withdraw', { method: 'POST', token: tokenA, headers: { 'x-idempotency-key': idem }, body: { chain:'bsc_testnet', symbol:'USDT', toAddress:'0x0000000000000000000000000000000000000002', amount:'50', accountType:'funding' }});
out.cases['WALLET-CT-14'] = await api('/api/v1/wallet/transactions?type=all&status=all&limit=999&offset=0', { method: 'GET', token: tokenA });
out.cases['WALLET-CT-15'] = await api('/api/v1/wallet/transactions?type=abc&status=all&limit=20&offset=0', { method: 'GET', token: tokenA });
out.cases['WALLET-CT-16'] = await api('/api/v1/wallet/transactions?type=all&status=all&limit=20&offset=0', { method: 'GET', token: tokenA });

const C = out.cases;
out.summary.assertions = {
  CT01: check(C['WALLET-CT-01'].status===401 && C['WALLET-CT-01'].payload?.error?.code==='WALLET_UNAUTHORIZED','401/WALLET_UNAUTHORIZED',`${C['WALLET-CT-01'].status}/${C['WALLET-CT-01'].payload?.error?.code}`),
  CT02: check(C['WALLET-CT-02'].status===400 && C['WALLET-CT-02'].payload?.error?.code==='WALLET_UNSUPPORTED_CHAIN','400/WALLET_UNSUPPORTED_CHAIN',`${C['WALLET-CT-02'].status}/${C['WALLET-CT-02'].payload?.error?.code}`),
  CT03: check(C['WALLET-CT-03'].status===400 && C['WALLET-CT-03'].payload?.error?.code==='WALLET_UNSUPPORTED_SYMBOL','400/WALLET_UNSUPPORTED_SYMBOL',`${C['WALLET-CT-03'].status}/${C['WALLET-CT-03'].payload?.error?.code}`),
  CT04: check(C['WALLET-CT-04'].status===200 && !!C['WALLET-CT-04'].payload?.address,'200 + address',`${C['WALLET-CT-04'].status} + ${Boolean(C['WALLET-CT-04'].payload?.address)}`),
  CT05: check(C['WALLET-CT-05'].status===404 && C['WALLET-CT-05'].payload?.error?.code==='WALLET_NOT_FOUND','404/WALLET_NOT_FOUND',`${C['WALLET-CT-05'].status}/${C['WALLET-CT-05'].payload?.error?.code}`),
  CT06: check(C['WALLET-CT-06'].status===200 && !!C['WALLET-CT-06'].payload?.address,'200 + existing address',`${C['WALLET-CT-06'].status} + ${Boolean(C['WALLET-CT-06'].payload?.address)}`),
  CT07: check(C['WALLET-CT-07'].status===401 && C['WALLET-CT-07'].payload?.error?.code==='WALLET_UNAUTHORIZED','401/WALLET_UNAUTHORIZED',`${C['WALLET-CT-07'].status}/${C['WALLET-CT-07'].payload?.error?.code}`),
  CT08: check(C['WALLET-CT-08'].status===400 && C['WALLET-CT-08'].payload?.error?.code==='WITHDRAW_INVALID_ADDRESS','400/WITHDRAW_INVALID_ADDRESS',`${C['WALLET-CT-08'].status}/${C['WALLET-CT-08'].payload?.error?.code}`),
  CT09: check(C['WALLET-CT-09'].status===400 && C['WALLET-CT-09'].payload?.error?.code==='WITHDRAW_AMOUNT_TOO_SMALL','400/WITHDRAW_AMOUNT_TOO_SMALL',`${C['WALLET-CT-09'].status}/${C['WALLET-CT-09'].payload?.error?.code}`),
  CT10: check(C['WALLET-CT-10'].status===400 && C['WALLET-CT-10'].payload?.error?.code==='WITHDRAW_AMOUNT_TOO_LARGE','400/WITHDRAW_AMOUNT_TOO_LARGE',`${C['WALLET-CT-10'].status}/${C['WALLET-CT-10'].payload?.error?.code}`),
  CT11: check(C['WALLET-CT-11'].status===400 && C['WALLET-CT-11'].payload?.error?.code==='WITHDRAW_INSUFFICIENT_BALANCE','400/WITHDRAW_INSUFFICIENT_BALANCE',`${C['WALLET-CT-11'].status}/${C['WALLET-CT-11'].payload?.error?.code}`),
  CT12: check(C['WALLET-CT-12'].status===200 && C['WALLET-CT-12'].payload?.status==='pending','200/pending',`${C['WALLET-CT-12'].status}/${C['WALLET-CT-12'].payload?.status}`),
  CT13: check(C['WALLET-CT-13'].status===409 && C['WALLET-CT-13'].payload?.error?.code==='WITHDRAW_DUPLICATE_REQUEST','409/WITHDRAW_DUPLICATE_REQUEST',`${C['WALLET-CT-13'].status}/${C['WALLET-CT-13'].payload?.error?.code}`),
  CT14: check(C['WALLET-CT-14'].status===400 && C['WALLET-CT-14'].payload?.error?.code==='WALLET_INVALID_PAGINATION','400/WALLET_INVALID_PAGINATION',`${C['WALLET-CT-14'].status}/${C['WALLET-CT-14'].payload?.error?.code}`),
  CT15: check(C['WALLET-CT-15'].status===400 && C['WALLET-CT-15'].payload?.error?.code==='WALLET_INVALID_FILTER','400/WALLET_INVALID_FILTER',`${C['WALLET-CT-15'].status}/${C['WALLET-CT-15'].payload?.error?.code}`),
  CT16: check(C['WALLET-CT-16'].status===200 && Array.isArray(C['WALLET-CT-16'].payload?.transactions),'200 + transactions[]',`${C['WALLET-CT-16'].status}/${Array.isArray(C['WALLET-CT-16'].payload?.transactions)}`),
};

const tx = C['WALLET-CT-16'].payload?.transactions?.[0] || {};
out.shape = {
  errorShape: check(Boolean(C['WALLET-CT-02'].payload?.error?.code && C['WALLET-CT-02'].payload?.error?.message && C['WALLET-CT-02'].payload?.error?.requestId), 'error.{code,message,requestId}', C['WALLET-CT-02'].payload?.error),
  withdrawShape: check(Boolean(C['WALLET-CT-12'].payload?.transactionId && C['WALLET-CT-12'].payload?.status), 'withdraw response keys', C['WALLET-CT-12'].payload),
  numericString: check(
    typeof C['WALLET-CT-12'].payload?.requestedAmountUSDT === 'string' &&
    typeof C['WALLET-CT-12'].payload?.platformFeeUSDT === 'string' &&
    typeof C['WALLET-CT-12'].payload?.networkFeeBNB === 'string' &&
    typeof C['WALLET-CT-12'].payload?.receiveAmountUSDT === 'string' &&
    typeof tx?.amount === 'string',
    'numeric fields are string',
    {
      requestedAmountUSDT: typeof C['WALLET-CT-12'].payload?.requestedAmountUSDT,
      platformFeeUSDT: typeof C['WALLET-CT-12'].payload?.platformFeeUSDT,
      networkFeeBNB: typeof C['WALLET-CT-12'].payload?.networkFeeBNB,
      receiveAmountUSDT: typeof C['WALLET-CT-12'].payload?.receiveAmountUSDT,
      txAmount: typeof tx?.amount,
    }
  ),
};

const checks = Object.values(out.summary.assertions);
out.summary.pass = checks.filter((x) => x.pass).length;
out.summary.fail = checks.length - out.summary.pass;
out.summary.shapePass = Object.values(out.shape).filter((x) => x.pass).length;
out.summary.shapeFail = Object.values(out.shape).filter((x) => !x.pass).length;
out.summary.overall = out.summary.fail === 0 && out.summary.shapeFail === 0 ? 'PASS' : 'FAIL';

console.log(JSON.stringify(out, null, 2));
