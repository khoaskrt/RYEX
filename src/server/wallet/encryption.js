import crypto from 'node:crypto';
import { WalletError } from './errors.js';

const ALGORITHM = 'aes-256-gcm';
const KEY_BYTES = 32;

function getEncryptionKeyBuffer() {
  const raw = process.env.WALLET_ENCRYPTION_KEY || '';

  if (!raw) {
    throw new WalletError('WALLET_CREATION_FAILED', 'Wallet encryption key is missing', 500);
  }

  if (!/^[a-fA-F0-9]{64}$/.test(raw)) {
    throw new WalletError('WALLET_CREATION_FAILED', 'Wallet encryption key must be a 64-char hex string', 500);
  }

  const key = Buffer.from(raw, 'hex');
  if (key.length !== KEY_BYTES) {
    throw new WalletError('WALLET_CREATION_FAILED', 'Wallet encryption key must be 32 bytes', 500);
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
