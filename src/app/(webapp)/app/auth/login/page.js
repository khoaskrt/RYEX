import { StitchLoginPage } from '@/features/auth/StitchLoginPage';

function sanitizePrefillEmail(email) {
  if (typeof email !== 'string') {
    return '';
  }

  return email.trim().slice(0, 254);
}

export default async function LoginPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const prefillEmail = sanitizePrefillEmail(resolvedSearchParams?.email);

  return <StitchLoginPage prefillEmail={prefillEmail} />;
}
