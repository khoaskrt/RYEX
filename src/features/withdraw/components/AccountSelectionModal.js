'use client';

export function AccountSelectionModal({
  isOpen,
  accounts,
  selectedAccount,
  onSelectAccount,
  onClose,
  onConfirm,
}) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="account-modal-title"
        aria-describedby="account-modal-desc"
      >
        <div className="bg-surface-container-lowest rounded-2xl shadow-[0_24px_48px_rgba(0,0,0,0.1)] max-w-[600px] w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-outline-variant/10">
            <h2 id="account-modal-title" className="text-xl font-bold text-on-surface">
              Chọn tài khoản rút tiền
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-on-surface-variant hover:text-primary transition-colors"
              aria-label="Đóng modal"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Body */}
          <div className="p-6">
            <p id="account-modal-desc" className="text-sm text-on-surface-variant mb-6">
              Tài sản sẽ được rút từ tài khoản nào?
            </p>

            {/* Account Cards (Radio Group) */}
            <div className="space-y-3">
              {accounts.map(account => (
                <label
                  key={account.type}
                  className={`
                    block p-4 rounded-xl border-2 cursor-pointer
                    transition-all duration-200
                    ${selectedAccount?.type === account.type
                      ? 'border-primary bg-primary-container/5'
                      : 'border-outline-variant hover:border-primary hover:shadow-md'
                    }
                  `}
                >
                  <input
                    type="radio"
                    name="account"
                    value={account.type}
                    checked={selectedAccount?.type === account.type}
                    onChange={() => onSelectAccount(account)}
                    className="sr-only"
                  />
                  <div className="flex items-start gap-3">
                    <span className={`material-symbols-outlined text-2xl ${account.type === 'funding' ? 'text-primary' : 'text-on-surface-variant'}`}>
                      {account.type === 'funding' ? 'wallet' : 'swap_horiz'}
                    </span>
                    <div className="flex-1">
                      <p className="font-bold text-on-surface">{account.label}</p>
                      <p className="text-xs text-on-surface-variant">{account.sublabel}</p>
                      <p className="text-lg font-extrabold text-on-surface mt-2">
                        {account.balance} {account.unit}
                      </p>
                      <p className="text-xs text-on-surface-variant">
                        ≈ ${account.balanceUSDT}
                      </p>
                      <p className="text-xs text-on-surface-variant mt-1">{account.description}</p>
                    </div>
                    <span className={`material-symbols-outlined ${selectedAccount?.type === account.type ? 'text-primary' : 'text-outline'}`}>
                      {selectedAccount?.type === account.type ? 'radio_button_checked' : 'radio_button_unchecked'}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 p-6 border-t border-outline-variant/10">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-surface-container-highest text-on-surface px-6 py-2.5 rounded-lg font-bold text-sm transition-all hover:bg-surface-container-high active:scale-95"
            >
              Huỷ bỏ
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={!selectedAccount}
              className="flex-1 bg-gradient-to-br from-[#006c4f] to-[#01bc8d] text-white px-6 py-2.5 rounded-lg font-bold text-sm shadow-md transition-all hover:opacity-90 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Tiếp tục
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
