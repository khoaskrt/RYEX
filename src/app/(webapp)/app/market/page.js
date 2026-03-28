import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { MarketModulePage } from '@/features/market';
import { pgPool } from '@/server/db/postgres';
import { SESSION_COOKIE_NAME } from '@/server/auth/sessionCookies';

async function getSessionGuardState(sessionRef) {
  if (!sessionRef) return { isValid: false, isVerified: false };
  try {
    const query = `
      SELECT ai.email_verified AS email_verified
      FROM user_sessions us
      JOIN users u ON u.id = us.user_id
      LEFT JOIN auth_identities ai ON ai.user_id = u.id AND ai.provider = 'password'
      WHERE us.session_ref = $1
        AND us.ended_at IS NULL
      LIMIT 1;
    `;
    const { rows } = await pgPool.query(query, [sessionRef]);
    if (!rows.length) return { isValid: false, isVerified: false };
    return { isValid: true, isVerified: Boolean(rows[0].email_verified) };
  } catch {
    return { isValid: false, isVerified: false };
  }
}

export default async function MarketPage() {
  const sessionRef = cookies().get(SESSION_COOKIE_NAME)?.value;
  const guardState = await getSessionGuardState(sessionRef);

  if (!guardState.isValid) {
    redirect('/app/auth/login?reason=session_required');
  }

  if (!guardState.isVerified) {
    redirect('/app/auth/login?reason=verify_required');
  }

  return <MarketModulePage />;
}
