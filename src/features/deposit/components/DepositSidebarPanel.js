import { ROUTES } from '@/shared/config/routes';

function formatDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--';
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

function getStatusMeta(status) {
  if (status === 'completed') {
    return { label: 'Hoàn thành', className: 'bg-primary-container/20 text-primary' };
  }
  if (status === 'pending') {
    return { label: 'Chờ xử lý', className: 'bg-surface-container-high text-on-surface-variant' };
  }
  return { label: 'Đang xử lý', className: 'bg-secondary-container/40 text-secondary' };
}

export function DepositSidebarPanel({ selectedToken, states, depositHistory, minDeposit = '1.00000000', currentStatus = 'Chờ xác nhận' }) {
  const filteredHistory = (depositHistory || []).filter((record) => record.coin === selectedToken.symbol);

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
            <span className="font-bold text-on-surface">{minDeposit} {selectedToken.symbol}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-on-surface-variant">Trạng thái hiện tại</span>
            <span className="rounded-md bg-primary-container/20 px-2 py-1 text-xs font-bold text-primary">{currentStatus}</span>
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
        <h3 className="mb-3 text-lg font-extrabold">Lịch sử nạp gần nhất</h3>
        {filteredHistory.length > 0 ? (
          <div className="space-y-3">
            {filteredHistory.slice(0, 4).map((record) => {
              const statusMeta = getStatusMeta(record.status);
              return (
                <article
                  key={record.orderId}
                  className="rounded-xl border border-outline-variant/20 bg-surface-container-low px-3 py-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold text-on-surface">
                      {record.amount} {record.coin}
                    </p>
                    <span className={`rounded-md px-2 py-1 text-[11px] font-bold ${statusMeta.className}`}>
                      {statusMeta.label}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-on-surface-variant">{formatDateTime(record.timestamp)}</p>
                  <p className="mt-1 text-[11px] text-outline">ID: {record.orderId}</p>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-outline-variant/40 bg-surface-container-low p-6 text-center">
            <img alt="Chưa có lịch sử nạp" className="mx-auto h-20 w-20" src="/images/history-empty.svg" />
            <p className="mt-3 text-sm font-semibold text-on-surface">Chưa có giao dịch nạp cho {selectedToken.symbol}</p>
            <p className="mt-1 text-xs text-on-surface-variant">Sau khi nạp thành công, lịch sử sẽ hiển thị tại đây.</p>
          </div>
        )}
        <a
          className="mt-4 inline-flex text-xs font-bold text-primary transition-colors hover:text-primary-container hover:underline"
          href={ROUTES.history}
        >
          Xem toàn bộ lịch sử
        </a>
      </div>
    </aside>
  );
}
