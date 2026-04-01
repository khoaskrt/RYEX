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

export function SecurityCard() {
  return (
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
  );
}
