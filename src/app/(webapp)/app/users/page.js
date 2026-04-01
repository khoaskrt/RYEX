import Link from 'next/link';

const securityItems = [
  {
    key: 'email',
    icon: 'mail',
    title: 'Email',
    description: 'Dùng để rút tiền và cài đặt bảo mật.',
    status: 'Đã liên kết',
    action: 'Thay đổi',
    active: true,
  },
  {
    key: 'phone',
    icon: 'smartphone',
    title: 'Số điện thoại',
    description: 'Xác thực OTP qua tin nhắn SMS.',
    status: 'Đã liên kết',
    action: 'Thay đổi',
    active: true,
  },
  {
    key: 'google-auth',
    icon: 'verified_user',
    title: 'Google Authenticator (2FA)',
    description: 'Lớp bảo mật mạnh mẽ nhất từ Google.',
    status: 'Đã bật',
    action: 'Quản lý',
    active: true,
  },
  {
    key: 'trade-password',
    icon: 'lock',
    title: 'Mật khẩu giao dịch',
    description: 'Chưa thiết lập',
    status: '',
    action: 'Thiết lập',
    active: false,
  },
];

const loginHistoryRows = [
  { time: '20/10/2023 14:22:10', ip: '113.161.x.xxx', device: 'Chrome / MacOS', location: 'Hồ Chí Minh, VN' },
  { time: '19/10/2023 09:15:44', ip: '14.226.x.xxx', device: 'App / iOS', location: 'Hà Nội, VN' },
  { time: '18/10/2023 22:05:12', ip: '113.161.x.xxx', device: 'Chrome / MacOS', location: 'Hồ Chí Minh, VN' },
];

export default function UsersPage() {
  return (
    <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen bg-surface text-on-surface antialiased">
      <nav className="fixed top-0 z-50 w-full border-b border-[#bbcac1]/15 bg-[#f7f9fb]/80 shadow-[0_12px_32px_rgba(0,0,0,0.04)] backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-[1920px] items-center justify-between px-8">
          <div className="flex items-center gap-10">
            <Link className="text-2xl font-black tracking-tighter text-[#006c4f]" href="/">
              RYEX
            </Link>
            <div className="hidden h-full items-center gap-8 md:flex">
              <Link className="flex h-full items-center pb-1 font-medium text-[#3c4a43] transition-colors hover:text-[#01bc8d]" href="/app/market">
                Thị trường
              </Link>
              <button className="group flex h-full items-center gap-1 text-[#3c4a43] transition-colors hover:text-[#01bc8d]" type="button">
                Giao dịch
                <span className="material-symbols-outlined text-[20px] transition-transform group-hover:rotate-180">expand_more</span>
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm font-semibold text-[#3c4a43] md:inline">kho***@gmail.com</span>
            <div className="h-9 w-9 overflow-hidden rounded-full border border-[#bbcac1]/40 bg-surface-container-low">
              <img
                alt="User avatar"
                className="h-full w-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDJpdWMa5wOlmBW8INfICzSTmYPj7UzD83flzOfOVXR7tX-h1pTCUXHX1Bt0BLtD_EoWroYEO_EDgVqG0T-1fookw54JYRV41i3EJT0mY92ATtDEmsUq6uN7_Oi1JmOjQScVOEseAMtxOVFc7YI8uW21KojWa4G-woc9t4d1A9WqKDZHIWXk62bNZ8oeu9a4luCYVSVN0Zbcn3C_Wl-A1ezUFbNQUECKMv_a0OtxirUCCVlzmhAQNtItb1I-YBmKQMHsYglgMY_rSGT"
              />
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto flex min-h-screen w-full max-w-[1920px] flex-col px-8 pb-16 pt-24">
        <section className="mb-10 rounded-2xl border border-[#bbcac1]/30 bg-white p-8 shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-5">
              <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-white shadow-lg">
                <img
                  alt="Profile avatar"
                  className="h-full w-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDJpdWMa5wOlmBW8INfICzSTmYPj7UzD83flzOfOVXR7tX-h1pTCUXHX1Bt0BLtD_EoWroYEO_EDgVqG0T-1fookw54JYRV41i3EJT0mY92ATtDEmsUq6uN7_Oi1JmOjQScVOEseAMtxOVFc7YI8uW21KojWa4G-woc9t4d1A9WqKDZHIWXk62bNZ8oeu9a4luCYVSVN0Zbcn3C_Wl-A1ezUFbNQUECKMv_a0OtxirUCCVlzmhAQNtItb1I-YBmKQMHsYglgMY_rSGT"
                />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-on-surface">Xin chào, kho***@gmail.com</h1>
                <div className="mt-1 flex items-center gap-2">
                  <p className="text-sm font-medium text-on-surface-variant">UID: 217012742</p>
                  <button className="text-on-surface-variant transition-colors hover:text-primary" type="button">
                    <span className="material-symbols-outlined text-base">content_copy</span>
                  </button>
                </div>
              </div>
            </div>
            <p className="text-xs font-semibold text-on-surface-variant">Thành viên từ: 12/05/2023</p>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <div className="rounded-2xl border border-[#bbcac1]/25 bg-white p-8 shadow-sm">
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-extrabold text-on-surface">Mức độ bảo mật</h2>
                  <p className="mt-1 text-sm font-medium text-on-surface-variant">Tăng cường bảo mật để bảo vệ tài sản của bạn.</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-primary">3/4</p>
                  <p className="text-xs font-bold text-primary">Mạnh</p>
                </div>
              </div>

              <div className="space-y-3">
                {securityItems.map((item) => (
                  <div
                    className={`flex items-center justify-between rounded-xl border p-4 transition-colors ${
                      item.active
                        ? 'border-transparent bg-surface-container-low/60 hover:border-[#bbcac1]/30 hover:bg-white'
                        : 'border-transparent bg-surface-container-low/30'
                    }`}
                    key={item.key}
                  >
                    <div className={`flex items-center gap-4 ${item.active ? '' : 'opacity-60'}`}>
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                          item.active ? 'bg-primary-container/10 text-primary' : 'bg-surface-container-high text-on-surface-variant'
                        }`}
                      >
                        <span className="material-symbols-outlined">{item.icon}</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-on-surface">{item.title}</p>
                        <p className="text-xs text-on-surface-variant">{item.description}</p>
                      </div>
                    </div>

                    {item.active ? (
                      <div className="flex items-center gap-3">
                        <span className="rounded-full bg-primary-container/20 px-3 py-1 text-xs font-bold text-primary">{item.status}</span>
                        <button className="text-xs font-bold text-on-surface-variant transition-colors hover:text-primary" type="button">
                          {item.action}
                        </button>
                      </div>
                    ) : (
                      <button className="rounded-lg bg-on-surface px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-black" type="button">
                        {item.action}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-[#bbcac1]/25 bg-white p-8 shadow-sm">
              <div className="mb-8 flex items-center justify-between">
                <h2 className="text-lg font-extrabold text-on-surface">Lịch sử đăng nhập gần đây</h2>
                <button className="flex items-center gap-1 text-xs font-extrabold text-primary transition-all hover:gap-2" type="button">
                  Xem tất cả
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[680px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-surface-container-low text-on-surface-variant">
                      <th className="pb-4 text-[10px] font-bold uppercase tracking-wider">Thời gian</th>
                      <th className="pb-4 text-[10px] font-bold uppercase tracking-wider">Địa chỉ IP</th>
                      <th className="pb-4 text-[10px] font-bold uppercase tracking-wider">Thiết bị</th>
                      <th className="pb-4 text-[10px] font-bold uppercase tracking-wider">Vị trí</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container-low">
                    {loginHistoryRows.map((row) => (
                      <tr className="transition-colors hover:bg-surface-container-low/50" key={`${row.time}-${row.ip}`}>
                        <td className="py-5 font-medium text-on-surface-variant">{row.time}</td>
                        <td className="py-5 font-mono text-xs text-on-surface-variant">{row.ip}</td>
                        <td className="py-5 font-medium text-on-surface-variant">{row.device}</td>
                        <td className="py-5 font-medium text-on-surface-variant">{row.location}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="rounded-2xl border border-[#bbcac1]/25 bg-white p-8 shadow-sm">
              <div className="mb-8 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-container-low text-on-surface-variant">
                  <span className="material-symbols-outlined">account_balance_wallet</span>
                </div>
                <h2 className="text-xl font-extrabold text-on-surface">Hạn mức tài khoản</h2>
              </div>
              <div className="space-y-6">
                <div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-semibold text-on-surface-variant">Rút tiền (24h)</span>
                    <span className="font-extrabold text-on-surface">50,000 USDT</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container-low">
                    <div className="h-full w-[4.8%] bg-primary" />
                  </div>
                  <p className="mt-2 text-[10px] font-medium italic text-on-surface-variant">Đã sử dụng 2,400 USDT trong hôm nay</p>
                </div>
                <div className="border-t border-surface-container-low pt-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-on-surface-variant">Nạp Fiat</span>
                    <span className="font-extrabold text-primary">Không giới hạn</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-secondary/10 bg-secondary/5 p-6">
              <h3 className="mb-2 flex items-center gap-2 text-sm font-black text-secondary">
                <span className="material-symbols-outlined text-base">support_agent</span>
                Hỗ trợ 24/7
              </h3>
              <p className="mb-5 text-sm font-medium leading-relaxed text-on-surface-variant">
                Bạn cần hỗ trợ về tài khoản? Chuyên viên của chúng tôi luôn sẵn sàng hỗ trợ bạn.
              </p>
              <button className="flex items-center gap-2 text-sm font-extrabold text-secondary transition-colors hover:text-[#27308a]" type="button">
                Liên hệ trung tâm hỗ trợ
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="mt-auto w-full bg-[#f2f4f6] px-8 py-12">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 md:grid-cols-2">
          <div className="space-y-4">
            <span className="text-lg font-bold text-[#3c4a43]">RYEX Markets</span>
            <p className="text-sm leading-relaxed text-[#3c4a43]">
              © 2024 RYEX Markets. Được cấp phép và điều hành bởi Cơ quan Quản lý Tài chính Việt Nam. Sàn giao dịch
              tài sản số uy tín và bảo mật hàng đầu cho các nhà đầu tư tổ chức và cá nhân.
            </p>
          </div>
          <div className="flex flex-wrap justify-start gap-6 md:justify-end">
            {['Điều khoản', 'Bảo mật', 'Cấp phép', 'Rủi ro', 'Hỗ trợ'].map((item) => (
              <a className="text-sm text-[#3c4a43] transition-colors duration-200 hover:text-[#01bc8d]" href="#" key={item}>
                {item}
              </a>
            ))}
          </div>
        </div>
        <div className="mx-auto mt-8 max-w-7xl border-t border-[#e6e8ea] pt-8">
          <p className="max-w-4xl text-[10px] leading-normal text-on-surface-variant/60">
            Cảnh báo rủi ro: Đầu tư vào tài sản số mang lại rủi ro đáng kể và có thể dẫn đến việc mất toàn bộ vốn đầu
            tư. Bạn nên cân nhắc tình hình tài chính, kinh nghiệm đầu tư và khẩu vị rủi ro trước khi bắt đầu giao
            dịch. Hiệu suất trong quá khứ không đảm bảo cho kết quả trong tương lai. RYEX không cung cấp lời khuyên
            đầu tư.
          </p>
        </div>
      </footer>
    </div>
  );
}
