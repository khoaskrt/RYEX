import { createAnonClient } from '@/shared/lib/supabase/server';
import { AUTH_ERROR, AuthApiError, jsonError } from '@/server/auth/errors';
import { validatePasswordPolicy } from '@/server/auth/passwordPolicy';
import { withTransaction } from '@/server/db/postgres';
import { enforceRateLimit } from '@/server/auth/rateLimit';
import { getRequestMeta } from '@/server/auth/http';
import { insertAuditEvent, insertVerificationEvent, upsertAuthIdentity, upsertUser } from '@/server/auth/repository';
import { mapAuthProviderSignupError, mapPostgresSignupError } from '@/server/auth/signupErrorMapping';

export const runtime = 'nodejs';

export async function POST(request) {
  const { requestId, ip, userAgent } = getRequestMeta(request);

  try {
    enforceRateLimit(`signup:${ip}`, 5, 15 * 60 * 1000);

    const { email, password, displayName } = await request.json();

    if (!email || !password) {
      throw new AuthApiError(AUTH_ERROR.INVALID_INPUT, 'Email and password are required', 400);
    }

    if (!validatePasswordPolicy(password)) {
      throw new AuthApiError(
        AUTH_ERROR.PASSWORD_POLICY_FAILED,
        'Password must be at least 8 chars and include uppercase, number, special character',
        422
      );
    }

    const supabase = await createAnonClient();
    let supaUser;

    try {
      const appBaseUrl = process.env.APP_BASE_URL || 'http://localhost:3000';
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName || '',
          },
          emailRedirectTo: `${appBaseUrl}/app/auth/verify-email/callback?flow=signup_verify&email=${encodeURIComponent(email)}`,
        },
      });
      if (error) throw error;
      supaUser = data?.user;
      if (!supaUser?.id) {
        throw new AuthApiError(AUTH_ERROR.PROVIDER_TEMPORARY_FAILURE, 'Auth provider temporary failure', 503);
      }
    } catch (error) {
      throw mapAuthProviderSignupError(error);
    }

    let user;
    try {
      user = await withTransaction(async (client) => {
        const savedUser = await upsertUser(client, {
          supaUid: supaUser.id,
          email: supaUser.email || email,
          displayName: supaUser.user_metadata?.display_name || displayName || null,
        });

        await upsertAuthIdentity(client, {
          userId: savedUser.id,
          supaUid: supaUser.id,
          email: supaUser.email || email,
          emailVerified: Boolean(supaUser.email_confirmed_at),
        });

        await insertVerificationEvent(client, {
          userId: savedUser.id,
          supaUid: supaUser.id,
          email: supaUser.email || email,
          eventType: 'verification_email_sent',
          eventStatus: 'success',
          requestId,
          ip,
          userAgent,
        });

        await insertAuditEvent(client, {
          actorType: 'system',
          actorUserId: savedUser.id,
          action: 'AUTH_SIGNUP_CREATED',
          resourceType: 'user',
          resourceId: savedUser.id,
          requestId,
          ip,
          userAgent,
          payload: { source: 'api_v1_auth_signup' },
        });

        return savedUser;
      });
    } catch (error) {
      throw mapPostgresSignupError(error);
    }

    return Response.json(
      {
        userId: user.id,
        email: user.email,
        verificationEmailSent: true,
        next: 'check_email_popup',
        requestId,
      },
      { status: 201 }
    );
  } catch (error) {
    return jsonError(error, requestId);
  }
}
