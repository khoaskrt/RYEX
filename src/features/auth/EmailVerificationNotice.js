'use client';

import Link from 'next/link';

export function EmailVerificationNotice({ email }) {
  return (
    <div className="space-y-6 rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-6">
      <h3 className="text-2xl font-bold tracking-tight text-on-surface">Verify your email</h3>
      <p className="text-sm leading-relaxed text-on-surface-variant">
        We have sent you a verification email to <span className="font-semibold text-on-surface">{email}</span>. Please verify
        it and log in.
      </p>
      <Link
        className="inline-flex w-full items-center justify-center rounded-xl py-3 font-bold text-white shadow-[0_8px_24px_rgba(0,108,79,0.2)] transition-all duration-200 active:scale-95 liquidity-gradient"
        href={`/app/auth/login?email=${encodeURIComponent(email)}`}
      >
        Login
      </Link>
    </div>
  );
}
