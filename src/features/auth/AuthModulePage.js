import Link from 'next/link';

const leftPanelFeatures = [
  {
    icon: 'verified_user',
    title: 'Được cấp phép',
    description: 'Tuân thủ đầy đủ các quy định pháp lý quốc tế.',
  },
  {
    icon: 'speed',
    title: 'Tốc độ tối ưu',
    description: 'Xử lý 1,000,000 giao dịch mỗi giây.',
  },
];

function LeftShowcase() {
  return (
    <section className="relative hidden overflow-hidden p-16 md:flex md:w-1/2 md:flex-col md:justify-between liquidity-gradient">
      <div className="relative z-10">
        <Link href="/" className="mb-12 text-3xl font-black tracking-tight text-white">
          RYEX
        </Link>
        <h1 className="mb-6 text-5xl font-extrabold leading-tight tracking-tight text-white">
          Kỷ Nguyên Mới Của <br /> Tài Chính Số.
        </h1>
        <p className="max-w-md text-lg leading-relaxed text-white/80">
          Trải nghiệm nền tảng giao dịch tài sản số hàng đầu Việt Nam với độ bảo mật chuẩn định chế tài chính toàn cầu.
        </p>
      </div>

      <div className="relative z-10 grid grid-cols-2 gap-8">
        {leftPanelFeatures.map((feature) => (
          <div key={feature.title} className="rounded-xl border border-white/10 bg-white/80 p-6 backdrop-blur-2xl">
            <span className="material-symbols-outlined mb-3 text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
              {feature.icon}
            </span>
            <h3 className="mb-1 font-bold text-on-surface">{feature.title}</h3>
            <p className="text-xs text-on-surface-variant">{feature.description}</p>
          </div>
        ))}
      </div>

      <div className="pointer-events-none absolute inset-0 opacity-20">
        <div className="absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-white blur-3xl" />
        <div className="absolute left-1/4 top-1/4 h-64 w-64 rounded-full bg-primary-fixed blur-[100px]" />
      </div>

      <div className="absolute right-0 top-0 h-full w-full opacity-40">
        <img
          alt="abstract digital connection network"
          className="h-full w-full object-cover"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCoJe9sJIHPila_y7EoPEXf1O6WON55qLSpJq-bUMpatDeAVxS8TLRE7DQ8KWk7bNAdOFoYEF1b1zlV7WIxzHs7Vd2aPKE8QjPuaasDJgOPLPjS_ZqFqBBrJgJx5x-Avax1PX5JYxv71Dx17onhBZodfeyM5RJy2hGCnCLfwHc-ssbF3G3chNw5fsmYQHJ8HiJgE-2UigoBXC-H66ztNA2sU4wQi9nunbcKAvsMSqEkcbQgIW2VJ3bedsTe2-SOXefZ6VUGeJofP_Ib"
        />
      </div>
    </section>
  );
}

function SignupForm() {
  return (
    <>
      <div className="mb-6 flex gap-1 rounded-xl bg-surface-container-low p-1">
        <button
          className="flex-1 rounded-lg bg-surface-container-lowest py-2.5 text-sm font-semibold text-primary shadow-sm transition-all duration-200"
          type="button"
        >
          Email
        </button>
        <button
          className="flex-1 rounded-lg py-2.5 text-sm font-medium text-on-surface-variant transition-all duration-200 hover:text-on-surface"
          type="button"
        >
          Số điện thoại
        </button>
      </div>

      <form className="space-y-5">
        <div className="space-y-2">
          <label className="ml-1 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Địa chỉ Email</label>
          <input
            className="w-full rounded-xl border-none border-b-2 border-transparent bg-surface-container-lowest px-4 py-3.5 transition-all duration-300 placeholder:text-outline-variant focus:border-b-2 focus:border-primary-container focus:ring-0"
            placeholder="name@company.com"
            type="email"
          />
        </div>

        <div className="space-y-2">
          <label className="ml-1 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Mật khẩu</label>
          <div className="relative">
            <input
              className="w-full rounded-xl border-none border-b-2 border-transparent bg-surface-container-lowest px-4 py-3.5 transition-all duration-300 placeholder:text-outline-variant focus:border-b-2 focus:border-primary-container focus:ring-0"
              placeholder="Tối thiểu 8 ký tự"
              type="password"
            />
            <button className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant" type="button">
              <span className="material-symbols-outlined text-xl">visibility_off</span>
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="ml-1 text-xs font-bold uppercase tracking-wider text-on-surface-variant">
            Mã giới thiệu (Tùy chọn)
          </label>
          <input
            className="w-full rounded-xl border-none border-b-2 border-transparent bg-surface-container-lowest px-4 py-3.5 transition-all duration-300 placeholder:text-outline-variant focus:border-b-2 focus:border-primary-container focus:ring-0"
            placeholder="Nhập mã giới thiệu"
            type="text"
          />
        </div>

        <div className="space-y-3 pt-2">
          <label className="group flex cursor-pointer items-start gap-3">
            <input
              className="mt-1 h-5 w-5 rounded border-none bg-surface-container text-primary focus:ring-primary"
              type="checkbox"
            />
            <span className="select-none text-sm leading-snug text-on-surface-variant">
              Tôi đồng ý với{' '}
              <a className="font-semibold text-primary hover:underline" href="#">
                Điều khoản dịch vụ
              </a>{' '}
              và{' '}
              <a className="font-semibold text-primary hover:underline" href="#">
                Chính sách bảo mật
              </a>{' '}
              của RYEX Vietnam.
            </span>
          </label>
        </div>

        <button
          className="mt-4 w-full rounded-xl py-4 font-bold text-white shadow-[0_8px_24px_rgba(0,108,79,0.2)] transition-all duration-200 active:scale-95 liquidity-gradient"
          type="submit"
        >
          Đăng ký tài khoản
        </button>
      </form>
    </>
  );
}

function LoginForm() {
  return (
    <form className="space-y-5">
      <div className="space-y-2">
        <label className="ml-1 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Địa chỉ Email</label>
        <input
          className="w-full rounded-xl border-none border-b-2 border-transparent bg-surface-container-lowest px-4 py-3.5 transition-all duration-300 placeholder:text-outline-variant focus:border-b-2 focus:border-primary-container focus:ring-0"
          placeholder="name@company.com"
          type="email"
        />
      </div>

      <div className="space-y-2">
        <label className="ml-1 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Mật khẩu</label>
        <div className="relative">
          <input
            className="w-full rounded-xl border-none border-b-2 border-transparent bg-surface-container-lowest px-4 py-3.5 transition-all duration-300 placeholder:text-outline-variant focus:border-b-2 focus:border-primary-container focus:ring-0"
            placeholder="Nhập mật khẩu"
            type="password"
          />
          <button className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant" type="button">
            <span className="material-symbols-outlined text-xl">visibility_off</span>
          </button>
        </div>
      </div>

      <button
        className="mt-4 w-full rounded-xl py-4 font-bold text-white shadow-[0_8px_24px_rgba(0,108,79,0.2)] transition-all duration-200 active:scale-95 liquidity-gradient"
        type="submit"
      >
        Đăng nhập
      </button>
    </form>
  );
}

export function AuthModulePage({ mode = 'login' }) {
  const isSignup = mode === 'signup';

  return (
    <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen overflow-x-hidden bg-surface text-on-surface antialiased">
      <main className="flex min-h-screen flex-col md:flex-row">
        <LeftShowcase />

        <section className="flex flex-1 items-center justify-center bg-surface p-6 md:p-12 lg:p-24">
          <div className="w-full max-w-[440px]">
            <div className="mb-10">
              <Link
                href="/"
                className="mb-8 text-2xl font-black tracking-tight text-primary md:hidden"
              >
                RYEX
              </Link>
              <h2 className="mb-2 text-3xl font-bold tracking-tight text-on-surface">
                {isSignup ? 'Tạo tài khoản mới' : 'Chào mừng quay lại'}
              </h2>
              <p className="text-on-surface-variant">
                {isSignup ? 'Bắt đầu hành trình đầu tư thông minh ngay hôm nay.' : 'Đăng nhập để tiếp tục giao dịch cùng RYEX.'}
              </p>
            </div>

            <div className="mb-8">{isSignup ? <SignupForm /> : <LoginForm />}</div>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-outline-variant/30" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-surface px-4 font-medium tracking-widest text-on-surface-variant">
                  {isSignup ? 'Hoặc đăng ký bằng' : 'Hoặc đăng nhập bằng'}
                </span>
              </div>
            </div>

            <div className="mb-8 grid grid-cols-3 gap-4">
              <button
                className="flex items-center justify-center rounded-xl border border-transparent bg-surface-container-lowest py-3 transition-colors duration-200 hover:bg-surface-container-low active:scale-95"
                type="button"
              >
                <img
                  alt="Google"
                  className="h-5 w-5"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBwc4zWwjonNRYY5mDUB4lK9AGFNxsxbSBsIIkZDYXLMA5gKo47UJHr6ncOUIOGDmyA24j6CVb8P-NtS24iegYO3A3EvKdnnv-Tdhg0rtT09o7LE1XLMtLUT1VgeZU8x_JLO4wujYzyOgsOYyEUZ9boQ_tFwcYG58EHiLvMgRBboxbHZho-hDk1J6fjhVanr_uXy-9NCqmFAKmS3J7dnmm6N73nGny0KViwoZpiadk9irKkF_nwVuYNi6i8PxydQ6Bk-vEvZOquasxX"
                />
              </button>
              <button
                className="flex items-center justify-center rounded-xl border border-transparent bg-surface-container-lowest py-3 transition-colors duration-200 hover:bg-surface-container-low active:scale-95"
                type="button"
              >
                <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  ios
                </span>
              </button>
              <button
                className="flex items-center justify-center rounded-xl border border-transparent bg-surface-container-lowest py-3 transition-colors duration-200 hover:bg-surface-container-low active:scale-95"
                type="button"
              >
                <svg className="h-5 w-5 fill-current text-[#1877F2]" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </button>
            </div>

            <div className="text-center">
              <p className="text-on-surface-variant">
                {isSignup ? 'Bạn đã có tài khoản?' : 'Bạn chưa có tài khoản?'}{' '}
                <Link
                  className="ml-1 font-bold text-primary hover:underline"
                  href={isSignup ? '/app/auth/login' : '/app/auth/signup'}
                >
                  {isSignup ? 'Đăng nhập' : 'Đăng ký'}
                </Link>
              </p>
            </div>

            <div className="mx-auto mt-12 flex w-fit items-center justify-center gap-2 rounded-full bg-surface-container-low px-4 py-2">
              <span className="material-symbols-outlined text-sm text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                verified
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                Sàn giao dịch được cấp phép
              </span>
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full bg-surface-container-low py-12 md:bg-surface">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-8 md:flex-row">
          <div className="flex flex-col items-center gap-4 text-sm text-on-surface-variant md:flex-row">
            <span className="mr-2 font-bold text-primary">RYEX VIETNAM</span>
            <p>© 2024 RYEX Vietnam. Licensed Crypto Exchange.</p>
          </div>
          <nav className="flex flex-wrap justify-center gap-x-8 gap-y-2">
            <a className="text-sm font-medium text-on-surface-variant transition-colors hover:text-primary" href="#">
              Điều khoản dịch vụ
            </a>
            <a className="text-sm font-medium text-on-surface-variant transition-colors hover:text-primary" href="#">
              Chính sách bảo mật
            </a>
            <a className="text-sm font-medium text-on-surface-variant transition-colors hover:text-primary" href="#">
              Cảnh báo rủi ro
            </a>
            <a className="text-sm font-medium text-on-surface-variant transition-colors hover:text-primary" href="#">
              Cookie Policy
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
