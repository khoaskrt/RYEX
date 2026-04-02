'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ROUTES } from '@/shared/config/routes';

const NAV_ITEMS = [
  {
    label: 'Tổng quan',
    href: ROUTES.assets,
    icon: 'dashboard',
  },
  {
    label: 'Tài trợ',
    href: ROUTES.funding,
    icon: 'account_balance_wallet',
  },
  {
    label: 'Giao dịch',
    href: ROUTES.tradingAccount,
    icon: 'candlestick_chart',
  },
  {
    label: 'Nạp tiền',
    href: ROUTES.deposit,
    icon: 'arrow_downward',
  },
  {
    label: 'Rút tiền',
    href: ROUTES.withdraw,
    icon: 'arrow_upward',
  },
  {
    label: 'Lịch sử',
    href: ROUTES.history,
    icon: 'history',
  },
];

export default function FundingNavigationSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-16 hidden h-[calc(100vh-4rem)] w-60 border-r border-outline-variant/20 bg-surface-container-lowest lg:block">
      <nav className="flex h-full flex-col p-4">
        <ul className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-primary-container/20 text-primary border-l-4 border-primary'
                      : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-xl">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
