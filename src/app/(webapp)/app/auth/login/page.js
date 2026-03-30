import { StitchLoginPage } from '@/features/auth/StitchLoginPage';

function sanitizePrefillEmail(email) {
  if (typeof email !== 'string') {
    return '';
  }

  return email.trim().slice(0, 254);
}

export default function LoginPage({ searchParams }) {
  const prefillEmail = sanitizePrefillEmail(searchParams?.email);

  return <StitchLoginPage prefillEmail={prefillEmail} />;
}
