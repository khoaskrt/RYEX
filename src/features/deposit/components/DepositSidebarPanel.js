export function DepositSidebarPanel({ selectedToken, states }) {
  return (
    <aside className="space-y-6 lg:col-span-5">
      <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-5 shadow-[0_12px_32px_rgba(0,0,0,0.04)]">
        <h3 className="mb-4 text-lg font-extrabold">Tóm tắt giao dịch nạp</h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-on-surface-variant">Tài sản</span>
            <span className="font-bold text-on-surface">{selectedToken.symbol}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-on-surface-variant">Mạng</span>
            <span className="font-bold text-on-surface">{selectedToken.network}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-on-surface-variant">Số tiền tối thiểu</span>
            <span className="font-bold text-on-surface">10 {selectedToken.symbol}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-on-surface-variant">Trạng thái hiện tại</span>
            <span className="rounded-md bg-primary-container/20 px-2 py-1 text-xs font-bold text-primary">Chờ xác nhận</span>
          </div>
        </div>
        <div className="mt-4 rounded-xl bg-surface-container-low p-3">
          <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Bảo mật</p>
          <p className="mt-1 text-sm text-on-surface-variant">
            Hệ thống yêu cầu xác thực 2 lớp (2FA) trước khi mở tính năng rút tiền sau nạp.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-5 shadow-[0_12px_32px_rgba(0,0,0,0.04)]">
        <h3 className="mb-4 text-lg font-extrabold">Interaction States (Hardcode Preview)</h3>
        <div className="space-y-3">
          {states.map((state) => (
            <div key={state.key} className="rounded-xl border border-outline-variant/20 bg-surface p-3">
              <div className="mb-1 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-on-surface-variant">{state.icon}</span>
                  <p className="text-sm font-bold text-on-surface">{state.title}</p>
                </div>
                <span className={`rounded-md px-2 py-1 text-[11px] font-bold ${state.badgeClass}`}>Preview</span>
              </div>
              <p className="text-xs text-on-surface-variant">{state.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-5 shadow-[0_12px_32px_rgba(0,0,0,0.04)]">
        <h3 className="mb-3 text-lg font-extrabold">Lịch sử nạp gần nhất (Empty state demo)</h3>
        <div className="rounded-xl border border-dashed border-outline-variant/40 bg-surface-container-low p-6 text-center">
          <span className="material-symbols-outlined text-5xl text-on-surface-variant/40">account_balance_wallet</span>
          <p className="mt-3 text-sm font-semibold text-on-surface">Chưa có giao dịch nạp</p>
          <p className="mt-1 text-xs text-on-surface-variant">Sau khi nạp thành công, lịch sử sẽ hiển thị tại đây.</p>
          <button className="mt-4 rounded-lg bg-gradient-to-br from-primary to-primary-container px-4 py-2 text-xs font-bold text-on-primary transition-all hover:opacity-90 active:scale-95">
            Nạp tiền ngay
          </button>
        </div>
      </div>
    </aside>
  );
}
