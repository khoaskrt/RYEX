import { AuthModulePage } from '@/features/auth';

function sanitizePrefillEmail(email) {
  if (typeof email !== 'string') {
    return '';
  }

  return email.trim().slice(0, 254);
}

export default function SignupPage({ searchParams }) {
  const prefillEmail = sanitizePrefillEmail(searchParams?.email);

  return <AuthModulePage mode="signup" prefillEmail={prefillEmail} />;
}
