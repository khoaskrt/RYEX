'use client';

export function SuccessModal({
  isOpen,
  amount,
  coin,
  transactionId,
  onClose,
  onViewHistory,
}) {
  if (!isOpen) return null;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(transactionId);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-surface-container-lowest rounded-2xl shadow-[0_24px_48px_rgba(0,0,0,0.1)] max-w-md w-full p-8 text-center">
        {/* Success Icon */}
        <span className="material-symbols-outlined text-6xl text-primary-container block mb-4">
          check_circle
        </span>

        {/* Title */}
        <h2 className="text-2xl font-bold text-on-surface mb-2">
          Rút tiền thành công
        </h2>

        {/* Description */}
        <p className="text-sm text-on-surface-variant mb-6">
          Yêu cầu rút {amount} {coin} đã được gửi. Bạn có thể theo dõi trạng thái trong lịch sử giao dịch.
        </p>

        {/* Transaction ID */}
        <div className="bg-surface-container-low px-3 py-2 rounded-lg mb-6 flex items-center justify-between">
          <span className="font-mono text-xs text-on-surface-variant">{transactionId}</span>
          <button
            type="button"
            onClick={handleCopy}
            className="text-on-surface-variant hover:text-primary transition-colors"
            aria-label="Copy transaction ID"
          >
            <span className="material-symbols-outlined text-sm">content_copy</span>
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onViewHistory}
            className="flex-1 bg-gradient-to-br from-[#006c4f] to-[#01bc8d] text-white px-6 py-2.5 rounded-lg font-bold text-sm shadow-md transition-all hover:opacity-90 active:scale-95"
          >
            Xem lịch sử
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-surface-container-highest text-on-surface px-6 py-2.5 rounded-lg font-bold text-sm transition-all hover:bg-surface-container-high active:scale-95"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
