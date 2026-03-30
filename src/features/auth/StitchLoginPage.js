'use client';

import Link from 'next/link';
import { useState } from 'react';

export function StitchLoginPage() {
  const [authMethod, setAuthMethod] = useState('email');
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="bg-surface text-on-surface font-body antialiased">
      <header className="fixed top-0 z-50 w-full bg-[#f7f9fb]/80 shadow-[0_12px_32px_rgba(0,0,0,0.04)] backdrop-blur-xl">
        <nav className="mx-auto flex w-full max-w-[1440px] items-center px-5 py-4 md:px-8">
          <Link className="text-2xl font-bold tracking-tighter text-[#006c4f]" href="/">
            RYEX
          </Link>
        </nav>
      </header>

      <main className="flex min-h-screen flex-col pt-20 md:flex-row">
        <section className="relative hidden items-center justify-center overflow-hidden bg-surface-container-low p-16 md:flex md:w-1/2">
          <div className="absolute inset-0 z-0">
            <img
              alt="Abstract digital background"
              className="h-full w-full object-cover opacity-10 mix-blend-multiply"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDwfwowkNyySwL8fxhxmMi31BczQNVBB0YocgCzkoI9VzaC18hjWzmivudlXQM_ZJZkrJ5MfIn5BYnY-4bqw3g80hbT4PDeObQL6Q7jq3JdEHG5VRn7FGTJDgARhvQ8bGYkd62nNQR7QUydoC7RNvb_vthVnowEAw-Fxnn0lkwdeWpTbeluqqFFKHqm_zI-jz79BT9M1VgEBMb0lPWgwZrEHpCiNqv_MEuYB9gvmTraqbUeI4fOWbn8tHOmB11mqy0O4ObiaTl3YNPM"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-surface/50 to-primary/5" />
          </div>

          <div className="relative z-10 max-w-lg space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary-container/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              Institutional Grade
            </div>
            <h1 className="text-5xl font-extrabold leading-tight tracking-tight text-on-surface">
              Chào mừng bạn trở lại với RYEX.
            </h1>
            <p className="text-lg leading-relaxed text-on-surface-variant">
              Nền tảng giao dịch tài sản kỹ thuật số hàng đầu dành cho các nhà đầu tư tổ chức và cá nhân chuyên nghiệp.
              An toàn, tốc độ và minh bạch.
            </p>
            <div className="grid grid-cols-2 gap-6 pt-8">
              <div className="rounded-xl bg-surface-container-lowest p-6 shadow-sm">
                <span className="material-symbols-outlined mb-3 text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                  verified_user
                </span>
                <h3 className="font-bold text-on-surface">Bảo mật đa lớp</h3>
                <p className="mt-1 text-sm text-on-surface-variant">Lưu trữ lạnh 100% tài sản</p>
              </div>
              <div className="rounded-xl bg-surface-container-lowest p-6 shadow-sm">
                <span className="material-symbols-outlined mb-3 text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                  bolt
                </span>
                <h3 className="font-bold text-on-surface">Tốc độ tối ưu</h3>
                <p className="mt-1 text-sm text-on-surface-variant">Khớp lệnh dưới 1ms</p>
              </div>
            </div>
          </div>
        </section>

        <section className="flex w-full items-center justify-center bg-surface-container-lowest p-6 md:w-1/2 md:p-12 lg:p-24">
          <div className="w-full max-w-md space-y-8">
            <div className="space-y-2 text-center md:text-left">
              <h2 className="text-3xl font-bold tracking-tight text-on-surface">Đăng nhập</h2>
              <p className="text-on-surface-variant">Vui lòng nhập thông tin tài khoản của bạn</p>
            </div>

            <div className="flex border-b border-outline-variant/15">
              <button
                className={`flex-1 pb-4 text-sm transition-colors ${
                  authMethod === 'email'
                    ? 'border-b-2 border-primary font-semibold text-primary'
                    : 'font-medium text-on-surface-variant hover:text-on-surface'
                }`}
                onClick={() => setAuthMethod('email')}
                type="button"
              >
                Email
              </button>
              <button
                className={`flex-1 pb-4 text-sm transition-colors ${
                  authMethod === 'phone'
                    ? 'border-b-2 border-primary font-semibold text-primary'
                    : 'font-medium text-on-surface-variant'
                }`}
                aria-disabled="true"
                disabled
                title="Coming soon"
                type="button"
              >
                Số điện thoại
              </button>
            </div>

            <form className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="ml-1 text-sm font-semibold text-on-surface" htmlFor="auth-input">
                    {authMethod === 'email' ? 'Email' : 'Số điện thoại'}
                  </label>
                  <input
                    className="w-full rounded-xl border-none border-b-2 border-transparent bg-surface-container-low px-4 py-3 transition-all focus:border-primary-container focus:bg-surface-container-lowest focus:ring-0"
                    id="auth-input"
                    placeholder={authMethod === 'email' ? 'name@company.com' : 'Nhập số điện thoại'}
                    type={authMethod === 'email' ? 'email' : 'tel'}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <label className="text-sm font-semibold text-on-surface" htmlFor="password">
                      Mật khẩu
                    </label>
                    <a className="text-sm font-medium text-primary transition-colors hover:text-primary-container" href="#">
                      Quên mật khẩu?
                    </a>
                  </div>
                  <div className="relative">
                    <input
                      className="w-full rounded-xl border-none border-b-2 border-transparent bg-surface-container-low px-4 py-3 transition-all focus:border-primary-container focus:bg-surface-container-lowest focus:ring-0"
                      id="password"
                      placeholder="••••••••"
                      type={showPassword ? 'text' : 'password'}
                    />
                    <button
                      aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant"
                      onClick={() => setShowPassword((prev) => !prev)}
                      type="button"
                    >
                      <span className="material-symbols-outlined text-lg">
                        {showPassword ? 'visibility' : 'visibility_off'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              <button
                className="liquidity-gradient w-full rounded-xl py-4 font-bold text-white shadow-lg shadow-primary/10 transition-all hover:shadow-primary/20"
                type="submit"
              >
                Đăng nhập
              </button>
            </form>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-outline-variant/15" />
              <span className="mx-4 flex-shrink text-xs font-semibold uppercase tracking-widest text-on-surface-variant">
                Hoặc đăng nhập với
              </span>
              <div className="flex-grow border-t border-outline-variant/15" />
            </div>

            <div>
              <button
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-outline-variant/10 bg-surface-container-low py-3 transition-all hover:bg-surface-container-high"
                type="button"
              >
                <img
                  alt="Google"
                  className="h-7 w-7 object-contain"
                  src="/images/google-icon.png"
                />
                <span className="font-semibold text-on-surface">Google</span>
              </button>
            </div>

            <p className="text-center text-on-surface-variant">
              Chưa có tài khoản?{' '}
              <Link className="font-bold text-primary hover:underline" href="/app/auth/signup">
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </section>
      </main>

      <footer className="w-full border-t border-[#bbcac1]/15 bg-[#f2f4f6]">
        <div className="mx-auto flex w-full max-w-[1440px] flex-col items-center justify-between space-y-4 px-8 py-12 text-sm leading-relaxed md:flex-row md:space-y-0">
          <div className="flex flex-col items-center gap-8 md:flex-row">
            <span className="text-lg font-bold text-[#3c4a43]">RYEX</span>
            <span className="text-[#3c4a43]">© 2024 RYEX Institutional Exchange. All rights reserved.</span>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            <a className="text-[#3c4a43] transition-colors hover:text-[#01bc8d]" href="#">
              Privacy Policy
            </a>
            <a className="text-[#3c4a43] transition-colors hover:text-[#01bc8d]" href="#">
              Terms of Service
            </a>
            <a className="text-[#3c4a43] transition-colors hover:text-[#01bc8d]" href="#">
              Cookie Settings
            </a>
            <a className="text-[#3c4a43] transition-colors hover:text-[#01bc8d]" href="#">
              Security
            </a>
            <a className="text-[#3c4a43] transition-colors hover:text-[#01bc8d]" href="#">
              Help Center
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
