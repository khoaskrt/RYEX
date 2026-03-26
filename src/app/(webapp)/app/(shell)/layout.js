import Link from 'next/link';

const navItems = [
  { href: '/app', label: 'Overview' },
  { href: '/app/auth/login', label: 'Login' },
  { href: '/app/auth/signup', label: 'Signup' },
  { href: '/app/market', label: 'Thị trường' },
];

export default function ShellLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-lg font-bold tracking-tight text-[#01bc8d]">
            RYEX App
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-2 text-slate-300 transition hover:bg-slate-800 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">{children}</main>
    </div>
  );
}

