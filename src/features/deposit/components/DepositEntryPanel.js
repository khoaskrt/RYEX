export function DepositEntryPanel({ tokens, selectedToken, onSelectToken }) {
  return (
    <article className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-5 shadow-[0_12px_32px_rgba(0,0,0,0.04)] lg:col-span-7 lg:p-6">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xl font-extrabold tracking-tight">Nạp Crypto</h2>
        <span className="rounded-lg bg-primary-container/20 px-3 py-1 text-xs font-bold text-primary">Bước 1/3</span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {tokens.map((token) => {
          const isSelected = selectedToken.symbol === token.symbol;
          return (
            <button
              key={token.symbol}
              className={`rounded-xl border p-4 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-container ${
                isSelected
                  ? 'border-primary bg-primary-container/10 shadow-[0_12px_24px_rgba(1,188,141,0.12)]'
                  : 'border-outline-variant/30 bg-surface hover:border-primary-container/70 hover:bg-surface-container-low active:scale-[0.99]'
              }`}
              onClick={() => onSelectToken(token)}
              type="button"
            >
              <div className="mb-2 flex items-center justify-between">
                <p className="text-base font-bold text-on-surface">{token.symbol}</p>
                <span className="rounded-md bg-surface-container-high px-2 py-0.5 text-[11px] font-semibold text-on-surface-variant">
                  {token.network}
                </span>
              </div>
              <p className="text-sm text-on-surface-variant">{token.name}</p>
              <p className="mt-2 text-xs font-medium text-on-surface-variant">Xác nhận: {token.eta}</p>
            </button>
          );
        })}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 rounded-2xl border border-outline-variant/30 bg-surface p-4 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Địa chỉ ví nạp ({selectedToken.network})</p>
          <div className="rounded-xl border border-outline-variant/30 bg-surface-container-low px-3 py-3 text-sm font-semibold text-on-surface">
            0xA9F2...7D3C...5E11
          </div>
          <div className="mt-2 flex items-center gap-2">
            <button
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-surface-container-high px-3 text-xs font-bold text-on-surface transition-colors hover:bg-surface-container active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-container"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">content_copy</span>
              Sao chép
            </button>
            <button
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-surface-container-high px-3 text-xs font-bold text-on-surface transition-colors hover:bg-surface-container active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-container"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">qr_code_scanner</span>
              Quét QR
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-dashed border-outline-variant/50 bg-surface-container-low px-4 py-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Lưu ý mạng nạp</p>
          <ul className="space-y-2 text-sm text-on-surface-variant">
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined mt-0.5 text-[16px] text-primary">verified_user</span>
              Chỉ nạp đúng mạng <span className="font-bold text-on-surface">{selectedToken.network}</span> để tránh mất tài sản.
            </li>
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined mt-0.5 text-[16px] text-primary">schedule</span>
              Thời gian xử lý dự kiến: <span className="font-bold text-on-surface">{selectedToken.eta}</span>.
            </li>
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined mt-0.5 text-[16px] text-primary">payments</span>
              Phí nạp hiện tại: <span className="font-bold text-on-surface">{selectedToken.fee}</span>.
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <button className="h-11 rounded-xl bg-gradient-to-br from-primary to-primary-container px-4 text-sm font-bold text-on-primary shadow-[0_12px_24px_rgba(0,108,79,0.2)] transition-all hover:opacity-90 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-container">
          Tôi đã chuyển tiền
        </button>
        <button className="h-11 rounded-xl bg-surface-container-high px-4 text-sm font-bold text-on-surface transition-colors hover:bg-surface-container active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-container">
          Làm mới trạng thái
        </button>
        <button
          className="h-11 rounded-xl border border-outline-variant/40 bg-surface px-4 text-sm font-bold text-on-surface-variant transition-colors hover:bg-surface-container-low active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-container disabled:cursor-not-allowed disabled:opacity-40"
          disabled
        >
          Tạm khóa (Disabled)
        </button>
      </div>
    </article>
  );
}
