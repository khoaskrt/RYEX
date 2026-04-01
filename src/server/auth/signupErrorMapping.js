import { AUTH_ERROR, AuthApiError } from './errors.js';

const EMAIL_ALREADY_EXISTS_MESSAGE = 'Email đã được sử dụng, hãy sử dụng email khác';

export function mapAuthProviderSignupError(error) {
  const message = String(error?.code || error?.errorInfo?.code || error?.message || 'provider_error').toLowerCase();

  if (
    message.includes('email-already-exists')
    || message.includes('user already registered')
    || message.includes('already registered')
    || message.includes('user_already_exists')
  ) {
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
