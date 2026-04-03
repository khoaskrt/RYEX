export class WalletError extends Error {
  constructor(code, message, status = 400) {
    super(message);
    this.name = 'WalletError';
    this.code = code;
    this.status = status;
  }
}

export function isWalletError(error) {
  return error instanceof WalletError;
}
