export class TradingError extends Error {
  constructor(code, message, status = 400) {
    super(message);
    this.name = 'TradingError';
    this.code = code;
    this.status = status;
  }
}

export function isTradingError(error) {
  return error instanceof TradingError;
}
