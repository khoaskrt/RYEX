import Link from 'next/link';

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <header className="border-b border-outline-variant/30 bg-surface">
        <div className="mx-auto flex max-w-7xl items-center px-6 py-4">
          <Link href="/" className="text-lg font-black tracking-tight text-primary">
            RYEX
          </Link>
        </div>
      </header>
      <main className="px-0">{children}</main>
    </div>
  );
}

