import crypto from 'node:crypto';
import { WalletError } from './errors.js';
import { parseWalletEncryptionKey } from './config.js';

const ALGORITHM = 'aes-256-gcm';

function getEncryptionKeyBuffer() {
  const raw = process.env.WALLET_ENCRYPTION_KEY || '';

  if (!raw) {
    throw new WalletError('WALLET_CREATION_FAILED', 'Wallet encryption key is missing', 500);
  }

  const key = parseWalletEncryptionKey(raw);
  if (!key) {
    throw new WalletError(
      'WALLET_CREATION_FAILED',
      'Wallet encryption key must be a 32-byte key in hex(64) or base64 format',
      500
    );
  }

  return key;
}

export function encryptPrivateKey(privateKey) {
  const key = getEncryptionKeyBuffer();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const normalized = privateKey.startsWith('0x') ? privateKey.slice(2) : privateKey;

  let encrypted = cipher.update(normalized, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return {
    encryptedKey: encrypted,
    iv: iv.toString('hex'),
    authTag: cipher.getAuthTag().toString('hex'),
  };
}
