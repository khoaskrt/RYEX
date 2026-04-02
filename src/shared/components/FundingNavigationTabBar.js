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
    href: '/app/funding',
    icon: 'account_balance_wallet',
  },
  {
    label: 'Giao dịch',
    href: ROUTES.market,
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

export default function FundingNavigationTabBar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-16 z-40 w-full border-b border-outline-variant/20 bg-surface-container-lowest/95 backdrop-blur-sm lg:hidden">
      <div className="mx-auto max-w-[1440px]">
        <ul className="flex gap-2 overflow-x-auto px-4 py-2 scrollbar-hide">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href} className="flex-shrink-0">
                <Link
                  href={item.href}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-primary-container/20 text-primary border-b-2 border-primary'
                      : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
