import { useMemo, useState } from 'react';

const PAGE_SIZE = 6;

function classifyDevice(device = '') {
  if (device.includes('App')) return 'app';
  if (device.includes('Chrome') || device.includes('Safari') || device.includes('Firefox') || device.includes('Web')) return 'web';
  return 'other';
}

export function LoginHistoryCard({ loading, error, rows, onRetry, sectionId }) {
  const [query, setQuery] = useState('');
  const [deviceFilter, setDeviceFilter] = useState('all');
  const [page, setPage] = useState(1);

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return rows.filter((row) => {
      const matchesDevice = deviceFilter === 'all' ? true : classifyDevice(row.device) === deviceFilter;
      if (!matchesDevice) return false;

      if (!normalizedQuery) return true;
      const haystack = `${row.ip} ${row.device} ${row.location} ${row.time}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [deviceFilter, query, rows]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedRows = filteredRows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div className="rounded-2xl border border-[#bbcac1]/25 bg-white p-8 shadow-sm" id={sectionId}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-extrabold text-on-surface">Lịch sử đăng nhập gần đây</h2>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Bộ lọc</span>
          <select
            className="rounded-md border border-outline-variant bg-surface-container-lowest px-2 py-1 text-xs font-semibold text-on-surface outline-none"
            onChange={(event) => {
              setDeviceFilter(event.target.value);
              setPage(1);
            }}
            value={deviceFilter}
          >
            <option value="all">Tất cả</option>
            <option value="web">Web</option>
            <option value="app">App</option>
            <option value="other">Khác</option>
          </select>
        </div>
      </div>

      <div className="mb-5">
        <input
          className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-sm text-on-surface outline-none transition focus:border-primary focus:ring-2 focus:ring-primary-container/40"
          onChange={(event) => {
            setQuery(event.target.value);
            setPage(1);
          }}
          placeholder="Tìm theo IP, thiết bị, vị trí..."
          type="text"
          value={query}
        />
      </div>

      {error ? (
        <div className="mb-4 flex items-center justify-between rounded-lg border border-error/20 bg-error-container/50 px-4 py-3">
          <p className="text-xs font-semibold text-error">{error}</p>
          <button className="text-xs font-bold text-error underline-offset-2 hover:underline" onClick={onRetry} type="button">
            Thử lại
          </button>
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-surface-container-low text-on-surface-variant">
              <th className="pb-4 text-[10px] font-bold uppercase tracking-wider">Thời gian</th>
              <th className="pb-4 text-[10px] font-bold uppercase tracking-wider">Địa chỉ IP</th>
              <th className="pb-4 text-[10px] font-bold uppercase tracking-wider">Thiết bị</th>
              <th className="pb-4 text-[10px] font-bold uppercase tracking-wider">Vị trí</th>
              <th className="pb-4 text-[10px] font-bold uppercase tracking-wider">An toàn</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container-low">
            {loading ? (
              <tr>
                <td className="py-6 text-sm font-medium text-on-surface-variant" colSpan={5}>
                  Đang tải lịch sử đăng nhập...
                </td>
              </tr>
            ) : null}

            {!loading && filteredRows.length === 0 ? (
              <tr>
                <td className="py-6 text-sm font-medium text-on-surface-variant" colSpan={5}>
                  Không có phiên đăng nhập phù hợp bộ lọc.
                </td>
              </tr>
            ) : null}

            {!loading
              ? pagedRows.map((row) => (
                  <tr className="transition-colors hover:bg-surface-container-low/50" key={`${row.time}-${row.ip}-${row.device}`}>
                    <td className="py-5 font-medium text-on-surface-variant">{row.time}</td>
                    <td className="py-5 font-mono text-xs text-on-surface-variant">{row.ip}</td>
                    <td className="py-5 font-medium text-on-surface-variant">{row.device}</td>
                    <td className="py-5 font-medium text-on-surface-variant">{row.location}</td>
                    <td className="py-5">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                          row.isSuspicious ? 'bg-error-container text-error' : 'bg-primary-container/20 text-primary'
                        }`}
                      >
                        {row.isSuspicious ? 'Cần kiểm tra' : 'Bình thường'}
                      </span>
                    </td>
                  </tr>
                ))
              : null}
          </tbody>
        </table>
      </div>

      {!loading && filteredRows.length > 0 ? (
        <div className="mt-5 flex items-center justify-between border-t border-surface-container-low pt-4">
          <p className="text-xs font-medium text-on-surface-variant">
            {filteredRows.length} kết quả, trang {safePage}/{totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              className="rounded-md border border-outline-variant px-2.5 py-1 text-xs font-bold text-on-surface-variant disabled:cursor-not-allowed disabled:opacity-40"
              disabled={safePage === 1}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              type="button"
            >
              Trước
            </button>
            <button
              className="rounded-md border border-outline-variant px-2.5 py-1 text-xs font-bold text-on-surface-variant disabled:cursor-not-allowed disabled:opacity-40"
              disabled={safePage === totalPages}
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              type="button"
            >
              Sau
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
