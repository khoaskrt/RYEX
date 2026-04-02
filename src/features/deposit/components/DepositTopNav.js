import Link from 'next/link';
import AssetsDropdown from '@/shared/components/AssetsDropdown';
import { ROUTES } from '@/shared/config/routes';

export function DepositTopNav({ isAuthenticated, isLoggingOut, onLogout, profileVisual }) {
  return (
    <nav className="fixed top-0 z-50 w-full border-b border-outline-variant/25 bg-[#f7f9fb]/80 shadow-[0_12px_32px_rgba(0,0,0,0.04)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-[1920px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 lg:gap-10">
          <Link className="text-2xl font-black tracking-tighter text-primary" href={ROUTES.marketingHome}>
            RYEX
          </Link>
          <div className="hidden h-full items-center gap-8 md:flex">
            <Link className="flex h-full items-center text-on-surface-variant transition-colors hover:text-primary-container" href={ROUTES.market}>
              Thị trường
            </Link>
            <Link className="flex h-full items-center text-on-surface-variant transition-colors hover:text-primary-container" href={ROUTES.assets}>
              Tài sản
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <button
                className="rounded-xl px-4 py-2 text-sm font-semibold text-on-surface-variant transition-all hover:bg-surface-container-low active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-container disabled:cursor-not-allowed disabled:opacity-40"
                disabled={isLoggingOut}
                onClick={onLogout}
                type="button"
              >
                {isLoggingOut ? 'Đang thoát...' : 'Đăng xuất'}
              </button>

              <AssetsDropdown />

              <Link
                href={ROUTES.profile}
                className="inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-outline-variant/40 bg-surface-container-low text-sm font-bold text-primary transition-all hover:border-primary-container hover:text-primary-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-container"
              >
                {profileVisual.avatarUrl ? (
                  <img alt="Avatar người dùng" className="h-full w-full object-cover" src={profileVisual.avatarUrl} />
                ) : (
                  profileVisual.initial
                )}
              </Link>
            </>
          ) : (
            <>
              <Link
                className="rounded-xl px-4 py-2 text-sm font-semibold text-on-surface-variant transition-colors hover:text-primary"
                href={ROUTES.login}
              >
                Đăng nhập
              </Link>
              <Link
                className="rounded-xl bg-gradient-to-br from-primary to-primary-container px-4 py-2 text-sm font-bold text-on-primary shadow-[0_12px_32px_rgba(0,108,79,0.22)] transition-all hover:opacity-90 active:scale-95"
                href={ROUTES.signup}
              >
                Đăng ký
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
