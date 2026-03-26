import Link from 'next/link';

export default function WebAppHomePage() {
  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-bold">RYEX Web App Module</h1>
      <p className="max-w-2xl text-slate-300">
        This is the main webapp area. Auth and Market are split into domain modules under
        <code className="mx-1 rounded bg-slate-800 px-2 py-1">src/features</code> and mapped to routes under
        <code className="mx-1 rounded bg-slate-800 px-2 py-1">/app/*</code>.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link href="/app/auth/login" className="rounded-xl bg-[#01bc8d] px-5 py-3 font-semibold text-slate-900">
          Go to Login
        </Link>
        <Link href="/app/auth/signup" className="rounded-xl border border-slate-700 px-5 py-3 font-semibold">
          Go to Signup
        </Link>
        <Link href="/app/market" className="rounded-xl border border-slate-700 px-5 py-3 font-semibold">
          Go to Market
        </Link>
      </div>
    </section>
  );
}

