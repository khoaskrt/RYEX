export const AUTH_ERROR = {
  INVALID_INPUT: 'AUTH_INVALID_INPUT',
  PASSWORD_POLICY_FAILED: 'AUTH_PASSWORD_POLICY_FAILED',
  EMAIL_ALREADY_EXISTS: 'AUTH_EMAIL_ALREADY_EXISTS',
  RATE_LIMITED: 'AUTH_RATE_LIMITED',
  PROVIDER_TEMPORARY_FAILURE: 'AUTH_PROVIDER_TEMPORARY_FAILURE',
  VERIFICATION_LINK_INVALID: 'AUTH_VERIFICATION_LINK_INVALID',
  VERIFICATION_LINK_EXPIRED: 'AUTH_VERIFICATION_LINK_EXPIRED',
  INVALID_TOKEN: 'AUTH_INVALID_TOKEN',
  EMAIL_NOT_VERIFIED: 'AUTH_EMAIL_NOT_VERIFIED',
  UNAUTHORIZED: 'AUTH_UNAUTHORIZED',
  INTERNAL_ERROR: 'AUTH_INTERNAL_ERROR',
};

export class AuthApiError extends Error {
  constructor(code, message, status = 400, details = undefined) {
    super(message);
    this.name = 'AuthApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export function jsonError(error, requestId) {
  const status = error?.status || 500;
  const code = error?.code || AUTH_ERROR.INTERNAL_ERROR;
  const message = error?.message || 'Internal server error';

  return Response.json(
    {
      error: {
        code,
        message,
        details: error?.details,
        requestId,
      },
    },
    { status }
  );
}
