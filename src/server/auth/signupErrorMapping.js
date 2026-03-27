import { AUTH_ERROR, AuthApiError } from './errors.js';

const EMAIL_ALREADY_EXISTS_MESSAGE = 'Email đã được sử dụng, hãy sử dụng email khác';

export function mapFirebaseSignupError(error) {
  const message = error?.errorInfo?.code || error?.message || 'provider_error';

  if (String(message).includes('email-already-exists')) {
    return new AuthApiError(AUTH_ERROR.EMAIL_ALREADY_EXISTS, EMAIL_ALREADY_EXISTS_MESSAGE, 409);
  }

  return new AuthApiError(AUTH_ERROR.PROVIDER_TEMPORARY_FAILURE, 'Auth provider temporary failure', 503);
}

export function mapPostgresSignupError(error) {
  if (isUsersEmailUniqueViolation(error)) {
    return new AuthApiError(AUTH_ERROR.EMAIL_ALREADY_EXISTS, EMAIL_ALREADY_EXISTS_MESSAGE, 409);
  }

  return new AuthApiError(AUTH_ERROR.INTERNAL_ERROR, 'Internal server error', 500);
}

function isUsersEmailUniqueViolation(error) {
  const isUniqueViolation = error?.code === '23505';
  if (!isUniqueViolation) return false;

  if (error?.constraint === 'users_email_key') return true;

  return String(error?.message || '').includes('users_email_key');
}
