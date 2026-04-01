export function SupportColumn({ supportSectionId, settingsSectionId }) {
  return (
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

      <div className="rounded-2xl border border-secondary/10 bg-secondary/5 p-6" id={supportSectionId}>
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

      <div className="rounded-2xl border border-outline-variant/30 bg-white p-6 shadow-sm" id={settingsSectionId}>
        <h3 className="mb-2 flex items-center gap-2 text-sm font-black text-on-surface">
          <span className="material-symbols-outlined text-base text-on-surface-variant">tune</span>
          Cài đặt tài khoản
        </h3>
        <p className="mb-4 text-sm text-on-surface-variant">Quản lý tùy chọn thông báo và bảo mật nâng cao cho tài khoản của bạn.</p>
        <div className="space-y-3 rounded-lg bg-surface-container-low p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-on-surface">Thông báo đăng nhập mới</span>
            <span className="rounded-full bg-primary-container/20 px-2 py-0.5 text-[10px] font-bold text-primary">Đang bật</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-on-surface">Cảnh báo IP lạ</span>
            <span className="rounded-full bg-primary-container/20 px-2 py-0.5 text-[10px] font-bold text-primary">Đang bật</span>
          </div>
        </div>
      </div>
    </div>
  );
}
