import { WalletError } from './errors.js';

const HEX_64_REGEX = /^[a-fA-F0-9]{64}$/;

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

export function isValidWalletEncryptionKey(rawValue) {
  if (!isNonEmptyString(rawValue)) return false;
  return HEX_64_REGEX.test(rawValue.trim());
}

export function assertWalletConfig({
  requireEncryptionKey = false,
  requireInternalApiKey = false,
} = {}) {
  if (requireEncryptionKey && !isValidWalletEncryptionKey(process.env.WALLET_ENCRYPTION_KEY || '')) {
    throw new WalletError(
      'WALLET_ENV_INVALID',
      'Wallet service is misconfigured: WALLET_ENCRYPTION_KEY must be a 64-char hex key',
      500
    );
  }

  if (requireInternalApiKey && !isNonEmptyString(process.env.WALLET_INTERNAL_API_KEY || '')) {
    throw new WalletError(
      'WALLET_ENV_INVALID',
      'Wallet service is misconfigured: WALLET_INTERNAL_API_KEY is required',
      500
    );
  }
}

export function verifyInternalWalletKey(request) {
  const expected = String(process.env.WALLET_INTERNAL_API_KEY || '').trim();
  const provided = String(request.headers.get('x-wallet-internal-key') || '').trim();
  return Boolean(expected) && expected === provided;
}
