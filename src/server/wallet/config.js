import { WalletError } from './errors.js';

const HEX_64_REGEX = /^[a-fA-F0-9]{64}$/;
const BASE64_REGEX = /^[A-Za-z0-9+/]+={0,2}$/;
const BASE64URL_REGEX = /^[A-Za-z0-9\-_]+$/;
const KEY_BYTES = 32;

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function normalizeBase64Padding(value) {
  const neededPadding = (4 - (value.length % 4)) % 4;
  return `${value}${'='.repeat(neededPadding)}`;
}

function parseBase64Key(rawValue) {
  if (!isNonEmptyString(rawValue)) return null;
  const trimmed = rawValue.trim();

  if (BASE64_REGEX.test(trimmed)) {
    const normalized = normalizeBase64Padding(trimmed);
    const decoded = Buffer.from(normalized, 'base64');
    const canonicalInput = normalized.replace(/=+$/g, '');
    const canonicalOutput = decoded.toString('base64').replace(/=+$/g, '');
    if (decoded.length === KEY_BYTES && canonicalInput === canonicalOutput) {
      return decoded;
    }
  }

  if (BASE64URL_REGEX.test(trimmed)) {
    const base64 = normalizeBase64Padding(trimmed.replace(/-/g, '+').replace(/_/g, '/'));
    const decoded = Buffer.from(base64, 'base64');
    const canonicalInput = base64.replace(/=+$/g, '');
    const canonicalOutput = decoded.toString('base64').replace(/=+$/g, '');
    if (decoded.length === KEY_BYTES && canonicalInput === canonicalOutput) {
      return decoded;
    }
  }

  return null;
}

export function parseWalletEncryptionKey(rawValue) {
  if (!isNonEmptyString(rawValue)) return null;
  const trimmed = rawValue.trim();

  if (HEX_64_REGEX.test(trimmed)) {
    const key = Buffer.from(trimmed, 'hex');
    return key.length === KEY_BYTES ? key : null;
  }

  return parseBase64Key(trimmed);
}

export function isValidWalletEncryptionKey(rawValue) {
  return Boolean(parseWalletEncryptionKey(rawValue));
}

export function assertWalletConfig({
  requireEncryptionKey = false,
  requireInternalApiKey = false,
} = {}) {
  if (requireEncryptionKey && !isValidWalletEncryptionKey(process.env.WALLET_ENCRYPTION_KEY || '')) {
    throw new WalletError(
      'WALLET_ENV_INVALID',
      'Wallet service is misconfigured: WALLET_ENCRYPTION_KEY must be a 32-byte key in hex(64) or base64 format',
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
