'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

const AUTH_ERROR_MESSAGES = {
  AUTH_EMAIL_ALREADY_EXISTS: 'Email đã được sử dụng, hãy sử dụng email khác',
  AUTH_INVALID_INPUT: 'Vui lòng kiểm tra lại thông tin đã nhập.',
  AUTH_PASSWORD_POLICY_FAILED: 'Mật khẩu phải có ít nhất 8 ký tự, gồm chữ hoa, số và ký tự đặc biệt.',
  AUTH_RATE_LIMITED: 'Bạn thao tác quá nhanh. Vui lòng thử lại sau ít phút.',
  AUTH_PROVIDER_TEMPORARY_FAILURE: 'Hệ thống xác thực đang tạm thời gián đoạn, vui lòng thử lại.',
  AUTH_INTERNAL_ERROR: 'Đã có lỗi hệ thống. Vui lòng thử lại sau.',
  AUTH_RESEND_COOLDOWN: 'Vui lòng đợi trước khi gửi lại email.',
  AUTH_RESEND_HOURLY_CAP_REACHED: 'Đã đạt giới hạn gửi email trong một giờ. Thử lại sau.',
  AUTH_EMAIL_NOT_VERIFIED: 'Email chưa được xác minh. Hoàn tất xác minh trước khi đăng nhập.',
};

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

function validatePasswordPolicy(password) {
  if (password.length < 8) return 'Mật khẩu phải có ít nhất 8 ký tự.';
  if (!/[A-Z]/.test(password)) return 'Mật khẩu cần có ít nhất 1 ký tự in hoa.';
  if (!/\d/.test(password)) return 'Mật khẩu cần có ít nhất 1 chữ số.';
  if (!/[^\w\s]/.test(password)) return 'Mật khẩu cần có ít nhất 1 ký tự đặc biệt.';
  return '';
}

function SignupForm({ prefillEmail }) {
  const [email, setEmail] = useState(prefillEmail);
  const [password, setPassword] = useState('');
  const [rememberAfterVerify, setRememberAfterVerify] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [showVerifyNotice, setShowVerifyNotice] = useState(false);

  const isSubmitDisabled = useMemo(
    () => isSubmitting || !email.trim() || !password || !agreeTerms,
    [agreeTerms, email, isSubmitting, password]
  );

  function validateForm() {
    const nextErrors = {};
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      nextErrors.email = 'Email không được để trống.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      nextErrors.email = 'Email không đúng định dạng.';
    }

    const passwordError = validatePasswordPolicy(password);
    if (passwordError) {
      nextErrors.password = passwordError;
    }

    if (!agreeTerms) {
      nextErrors.agreeTerms = 'Vui lòng đồng ý Điều khoản dịch vụ và Chính sách bảo mật.';
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function getErrorMessage(errorCode, fallbackMessage) {
    if (errorCode && AUTH_ERROR_MESSAGES[errorCode]) {
      return AUTH_ERROR_MESSAGES[errorCode];
    }
    return fallbackMessage || AUTH_ERROR_MESSAGES.AUTH_INTERNAL_ERROR;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitError('');

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/v1/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        setSubmitError(getErrorMessage(payload?.error?.code, payload?.error?.message));
        return;
      }

      if (typeof window !== 'undefined') {
        window.localStorage.setItem('ryex_pending_verify_email', email.trim());
        window.localStorage.setItem('ryex_remember_device', rememberAfterVerify ? '1' : '0');
      }
      setShowVerifyNotice(true);
      setPassword('');
      setFieldErrors({});
    } catch {
      setSubmitError(AUTH_ERROR_MESSAGES.AUTH_INTERNAL_ERROR);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      {/* AC-15: Phone tab ẩn - MVP không có phone auth */}

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label className="ml-1 text-xs font-bold uppercase tracking-wider text-on-surface-variant" htmlFor="signup-email">
            Địa chỉ Email
          </label>
          <input
            className="w-full rounded-xl border-none border-b-2 border-transparent bg-surface-container-lowest px-4 py-3.5 transition-all duration-300 placeholder:text-outline-variant focus:border-b-2 focus:border-primary-container focus:ring-0"
            id="signup-email"
            name="email"
            placeholder="name@company.com"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          {fieldErrors.email ? <p className="text-sm text-error">{fieldErrors.email}</p> : null}
        </div>

        <div className="space-y-2">
          <label className="ml-1 text-xs font-bold uppercase tracking-wider text-on-surface-variant" htmlFor="signup-password">
            Mật khẩu
          </label>
          <div className="relative">
            <input
              className="w-full rounded-xl border-none border-b-2 border-transparent bg-surface-container-lowest px-4 py-3.5 transition-all duration-300 placeholder:text-outline-variant focus:border-b-2 focus:border-primary-container focus:ring-0"
              id="signup-password"
              name="password"
              placeholder="Tối thiểu 8 ký tự"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant"
              onClick={() => setShowPassword((current) => !current)}
              type="button"
            >
              <span className="material-symbols-outlined text-xl">{showPassword ? 'visibility' : 'visibility_off'}</span>
            </button>
          </div>
          {fieldErrors.password ? <p className="text-sm text-error">{fieldErrors.password}</p> : null}
        </div>

        {/* Referral code hidden - AC-13: MVP không có nghiệp vụ referral */}

        <div className="space-y-3 pt-2">
          <label className="group flex cursor-pointer items-start gap-3">
            <input
              className="mt-1 h-5 w-5 rounded border-none bg-surface-container text-primary focus:ring-primary"
              checked={rememberAfterVerify}
              type="checkbox"
              onChange={(event) => setRememberAfterVerify(event.target.checked)}
            />
            <span className="select-none text-sm leading-snug text-on-surface-variant">
              Ghi nhớ thiết bị này 30 ngày sau khi xác minh email (bỏ qua link đăng nhập lần sau trên máy này).
            </span>
          </label>
          <label className="group flex cursor-pointer items-start gap-3">
            <input
              className="mt-1 h-5 w-5 rounded border-none bg-surface-container text-primary focus:ring-primary"
              checked={agreeTerms}
              type="checkbox"
              onChange={(event) => setAgreeTerms(event.target.checked)}
            />
            <span className="select-none text-sm leading-snug text-on-surface-variant">
              Tôi đồng ý với{' '}
              <span className="font-semibold text-primary" title="Nội dung đang được xây dựng (internal product)">
                Điều khoản dịch vụ
              </span>{' '}
              và{' '}
              <span className="font-semibold text-primary" title="Nội dung đang được xây dựng (internal product)">
                Chính sách bảo mật
              </span>{' '}
              của RYEX Vietnam.
            </span>
          </label>
          {fieldErrors.agreeTerms ? <p className="text-sm text-error">{fieldErrors.agreeTerms}</p> : null}
        </div>
        {submitError ? <p className="text-sm text-error">{submitError}</p> : null}

        <button
          className="mt-4 w-full rounded-xl py-4 font-bold text-white shadow-[0_8px_24px_rgba(0,108,79,0.2)] transition-all duration-200 active:scale-95 liquidity-gradient"
          disabled={isSubmitDisabled}
          type="submit"
        >
          {isSubmitting ? 'Đang xử lý...' : 'Đăng ký tài khoản'}
        </button>
      </form>

      {showVerifyNotice ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-6">
          <div className="w-full max-w-md rounded-2xl bg-surface-container-lowest p-6 shadow-xl">
            <h3 className="text-xl font-bold text-on-surface">Đã gửi email xác minh</h3>
            <p className="mt-3 text-sm text-on-surface-variant">
              RYEX đã gửi email verify đến địa chỉ của bạn. Vui lòng kiểm tra inbox hoặc spam để hoàn tất kích hoạt tài khoản.
            </p>
            <button
              className="mt-5 w-full rounded-xl py-3 font-semibold text-white liquidity-gradient"
              onClick={() => setShowVerifyNotice(false)}
              type="button"
            >
              Tôi đã hiểu
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}

function LoginForm() {
  const [email, setEmail] = useState('');
  const [rememberDevice, setRememberDevice] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [challengeSent, setChallengeSent] = useState(false);
  const [cooldownLeft, setCooldownLeft] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    let id = window.localStorage.getItem('ryex_device_id');
    if (!id) {
      id = crypto.randomUUID();
      window.localStorage.setItem('ryex_device_id', id);
    }
  }, []);

  useEffect(() => {
    if (cooldownLeft <= 0) return undefined;
    const timer = setInterval(() => setCooldownLeft((value) => Math.max(0, value - 1)), 1000);
    return () => clearInterval(timer);
  }, [cooldownLeft]);

  function getLoginErrorMessage(errorCode, fallbackMessage) {
    if (errorCode && AUTH_ERROR_MESSAGES[errorCode]) {
      return AUTH_ERROR_MESSAGES[errorCode];
    }
    return fallbackMessage || AUTH_ERROR_MESSAGES.AUTH_INTERNAL_ERROR;
  }

  async function handleLoginSubmit(event) {
    event.preventDefault();
    setSubmitError('');
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      setSubmitError('Vui lòng nhập email.');
      return;
    }

    if (typeof window !== 'undefined') {
      window.localStorage.setItem('ryex_remember_device', rememberDevice ? '1' : '0');
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/v1/auth/login-challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ email: trimmed }),
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        setSubmitError(getLoginErrorMessage(payload?.error?.code, payload?.error?.message));
        return;
      }

      if (payload.trustedBypass) {
        window.location.href = payload.next || '/app/market';
        return;
      }

      if (payload.challengeRequired) {
        setChallengeSent(true);
        setCooldownLeft(Number(payload.cooldownSeconds) || 60);
      }
    } catch {
      setSubmitError(AUTH_ERROR_MESSAGES.AUTH_INTERNAL_ERROR);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResend() {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || cooldownLeft > 0) return;
    setSubmitError('');
    try {
      const response = await fetch('/api/v1/auth/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ email: trimmed, flowType: 'login_challenge' }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setSubmitError(getLoginErrorMessage(payload?.error?.code, payload?.error?.message));
        return;
      }
      setCooldownLeft(Number(payload.cooldownSeconds) || 60);
    } catch {
      setSubmitError(AUTH_ERROR_MESSAGES.AUTH_INTERNAL_ERROR);
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleLoginSubmit}>
      <p className="text-sm text-on-surface-variant">
        Đăng nhập Option A: nhập email để nhận liên kết đăng nhập. Không dùng mật khẩu trên bước này.
      </p>
      <div className="space-y-2">
        <label className="ml-1 text-xs font-bold uppercase tracking-wider text-on-surface-variant" htmlFor="login-email">
          Địa chỉ Email
        </label>
        <input
          className="w-full rounded-xl border-none border-b-2 border-transparent bg-surface-container-lowest px-4 py-3.5 transition-all duration-300 placeholder:text-outline-variant focus:border-b-2 focus:border-primary-container focus:ring-0"
          id="login-email"
          placeholder="name@company.com"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>

      <label className="group flex cursor-pointer items-start gap-3">
        <input
          className="mt-1 h-5 w-5 rounded border-none bg-surface-container text-primary focus:ring-primary"
          checked={rememberDevice}
          type="checkbox"
          onChange={(event) => setRememberDevice(event.target.checked)}
        />
        <span className="select-none text-sm leading-snug text-on-surface-variant">
          Ghi nhớ thiết bị 30 ngày sau khi mở liên kết từ email (áp dụng từ lần đăng nhập có link thành công).
        </span>
      </label>

      {submitError ? <p className="text-sm text-error">{submitError}</p> : null}

      {challengeSent ? (
        <div className="rounded-xl bg-surface-container-low p-4 text-sm text-on-surface-variant">
          <p>Đã gửi liên kết đăng nhập đến email của bạn. Kiểm tra hộp thư và mở liên kết trên thiết bị này.</p>
          <button
            className="mt-3 text-sm font-semibold text-primary disabled:text-on-surface-variant/50"
            disabled={cooldownLeft > 0}
            type="button"
            onClick={handleResend}
          >
            {cooldownLeft > 0 ? `Gửi lại sau ${cooldownLeft}s` : 'Gửi lại email'}
          </button>
        </div>
      ) : null}

      <button
        className="mt-4 w-full rounded-xl py-4 font-bold text-white shadow-[0_8px_24px_rgba(0,108,79,0.2)] transition-all duration-200 active:scale-95 liquidity-gradient"
        disabled={isSubmitting || (challengeSent && cooldownLeft > 0)}
        type="submit"
      >
        {isSubmitting
          ? 'Đang xử lý...'
          : challengeSent
            ? cooldownLeft > 0
              ? `Đã gửi — chờ ${cooldownLeft}s hoặc dùng Gửi lại`
              : 'Gửi lại link đăng nhập'
            : 'Tiếp tục bằng email'}
      </button>
    </form>
  );
}

export function AuthModulePage({ mode = 'login', prefillEmail = '' }) {
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

            <div className="mb-8">{isSignup ? <SignupForm prefillEmail={prefillEmail} /> : <LoginForm />}</div>

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
                className="flex cursor-not-allowed items-center justify-center rounded-xl border border-transparent bg-surface-container-lowest py-3 opacity-50 transition-colors duration-200"
                disabled
                title="Sắp có - Đăng nhập Google"
                type="button"
              >
                <img
                  alt="Google"
                  className="h-5 w-5"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBwc4zWwjonNRYY5mDUB4lK9AGFNxsxbSBsIIkZDYXLMA5gKo47UJHr6ncOUIOGDmyA24j6CVb8P-NtS24iegYO3A3EvKdnnv-Tdhg0rtT09o7LE1XLMtLUT1VgeZU8x_JLO4wujYzyOgsOYyEUZ9boQ_tFwcYG58EHiLvMgRBboxbHZho-hDk1J6fjhVanr_uXy-9NCqmFAKmS3J7dnmm6N73nGny0KViwoZpiadk9irKkF_nwVuYNi6i8PxydQ6Bk-vEvZOquasxX"
                />
              </button>
              <button
                className="flex cursor-not-allowed items-center justify-center rounded-xl border border-transparent bg-surface-container-lowest py-3 opacity-50 transition-colors duration-200"
                disabled
                title="Sắp có - Đăng nhập Apple"
                type="button"
              >
                <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  ios
                </span>
              </button>
              <button
                className="flex cursor-not-allowed items-center justify-center rounded-xl border border-transparent bg-surface-container-lowest py-3 opacity-50 transition-colors duration-200"
                disabled
                title="Sắp có - Đăng nhập Facebook"
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
