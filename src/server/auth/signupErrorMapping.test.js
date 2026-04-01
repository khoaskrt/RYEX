import test from 'node:test';
import assert from 'node:assert/strict';

import { AUTH_ERROR } from './errors.js';
import { mapAuthProviderSignupError, mapPostgresSignupError } from './signupErrorMapping.js';

test('mapAuthProviderSignupError maps email-already-exists to 409 domain error', () => {
  const mapped = mapAuthProviderSignupError({
    errorInfo: { code: 'auth/email-already-exists' },
  });

  assert.equal(mapped.code, AUTH_ERROR.EMAIL_ALREADY_EXISTS);
  assert.equal(mapped.status, 409);
  assert.equal(mapped.message, 'Email đã được sử dụng, hãy sử dụng email khác');
});

test('mapAuthProviderSignupError maps Supabase already registered to 409 domain error', () => {
  const mapped = mapAuthProviderSignupError({
    code: 'user_already_exists',
    message: 'User already registered',
  });

  assert.equal(mapped.code, AUTH_ERROR.EMAIL_ALREADY_EXISTS);
  assert.equal(mapped.status, 409);
});

test('mapPostgresSignupError maps users_email_key conflict to 409 domain error', () => {
  const mapped = mapPostgresSignupError({
    code: '23505',
    constraint: 'users_email_key',
    message: 'duplicate key value violates unique constraint "users_email_key"',
  });

  assert.equal(mapped.code, AUTH_ERROR.EMAIL_ALREADY_EXISTS);
  assert.equal(mapped.status, 409);
  assert.equal(mapped.message, 'Email đã được sử dụng, hãy sử dụng email khác');
  assert.equal(mapped.message.includes('duplicate key value violates unique constraint'), false);
});
