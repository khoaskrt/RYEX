import { getFirebaseAuth } from '@/server/auth/firebaseAdmin';
import { AUTH_ERROR, AuthApiError, jsonError } from '@/server/auth/errors';
import { validatePasswordPolicy } from '@/server/auth/passwordPolicy';
import { withTransaction } from '@/server/db/postgres';
import { enforceRateLimit } from '@/server/auth/rateLimit';
import { getRequestMeta } from '@/server/auth/http';
import { insertAuditEvent, insertVerificationEvent, upsertAuthIdentity, upsertUser } from '@/server/auth/repository';
import { mapFirebaseSignupError, mapPostgresSignupError } from '@/server/auth/signupErrorMapping';

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

    const auth = getFirebaseAuth();
    let firebaseUser;

    try {
      firebaseUser = await auth.createUser({ email, password, displayName });
      const verificationLink = await auth.generateEmailVerificationLink(email);

      // TODO: Send actual email via SendGrid/Mailgun in production
      // For local testing, log the link to console
      console.log('\n🔗 VERIFICATION LINK FOR:', email);
      console.log('Copy this link to browser:', verificationLink);
      console.log('Or extract oobCode from URL and use: http://localhost:3000/app/auth/verify-email/callback?oobCode=YOUR_CODE\n');
    } catch (error) {
      throw mapFirebaseSignupError(error);
    }

    let user;
    try {
      user = await withTransaction(async (client) => {
        const savedUser = await upsertUser(client, {
          firebaseUid: firebaseUser.uid,
          email: firebaseUser.email || email,
          displayName: firebaseUser.displayName || displayName || null,
        });

        await upsertAuthIdentity(client, {
          userId: savedUser.id,
          firebaseUid: firebaseUser.uid,
          email: firebaseUser.email || email,
          emailVerified: !!firebaseUser.emailVerified,
        });

        await insertVerificationEvent(client, {
          userId: savedUser.id,
          firebaseUid: firebaseUser.uid,
          email: firebaseUser.email || email,
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
