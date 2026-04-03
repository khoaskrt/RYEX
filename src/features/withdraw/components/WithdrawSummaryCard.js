'use client';

export function WithdrawSummaryCard({
  selectedCoin,
  selectedNetwork,
  withdrawAddress,
  selectedAccount,
  withdrawAmount,
  amountError,
  networkFee,
  networkFeeSymbol,
  receiveAmount,
  termsAgreed,
  onTermsChange,
  isSubmitting,
  isFormValid,
}) {
  return (
    <div className="lg:sticky lg:top-24 h-fit">
      <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-[0_12px_32px_-4px_rgba(0,0,0,0.04)]">
        <h3 className="text-lg font-bold text-on-surface mb-4">
          Thông tin rút tiền
        </h3>

        {/* Info Rows */}
        <div className="space-y-3 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-on-surface-variant">Coin</span>
            <span className={`font-semibold ${selectedCoin ? 'text-on-surface' : 'text-on-surface-variant'}`}>
              {selectedCoin?.symbol || '---'}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-on-surface-variant">Network</span>
            <span className={`font-semibold ${selectedNetwork ? 'text-on-surface' : 'text-on-surface-variant'}`}>
              {selectedNetwork?.name || '---'}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-on-surface-variant">Địa chỉ</span>
            <span className={`font-mono text-xs ${withdrawAddress ? 'text-on-surface' : 'text-on-surface-variant'}`}>
              {withdrawAddress ? `${withdrawAddress.slice(0, 8)}...${withdrawAddress.slice(-6)}` : '---'}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-on-surface-variant">Tài khoản</span>
            <span className={`font-semibold ${selectedAccount ? 'text-on-surface' : 'text-on-surface-variant'}`}>
              {selectedAccount?.label || '---'}
            </span>
          </div>

          {/* Divider */}
          <div className="border-t border-outline-variant/20 pt-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-on-surface-variant">Phí mạng</span>
              <span className="font-semibold text-on-surface">
                {selectedNetwork ? `${networkFee} ${networkFeeSymbol || selectedCoin?.symbol || ''}` : '---'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-bold text-on-surface-variant">Số tiền nhận</span>
              <span className="text-lg font-extrabold text-primary-container">
                {withdrawAmount && !amountError ? `${receiveAmount} ${selectedCoin?.symbol}` : '---'}
              </span>
            </div>
          </div>
        </div>

        {/* Terms Checkbox */}
        <label className="flex items-start gap-2 mb-4 cursor-pointer group">
          <input
            type="checkbox"
            checked={termsAgreed}
            onChange={(e) => onTermsChange(e.target.checked)}
            className="
              mt-1 rounded border-outline-variant
              text-primary
              focus:ring-primary-container focus:ring-2
              transition-colors
            "
          />
          <span className="text-xs text-on-surface-variant group-hover:text-on-surface transition-colors">
            Tôi đã kiểm tra kỹ địa chỉ ví và hiểu rằng giao dịch không thể hoàn tác
          </span>
        </label>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!isFormValid || isSubmitting}
          className="
            w-full
            bg-gradient-to-br from-[#006c4f] to-[#01bc8d]
            text-white px-6 py-3 rounded-lg
            font-bold text-sm shadow-md
            transition-all duration-200
            hover:opacity-90 active:scale-95
            disabled:opacity-60 disabled:cursor-not-allowed
            flex items-center justify-center gap-2
          "
        >
          {isSubmitting && (
            <span className="material-symbols-outlined animate-spin text-sm">
              progress_activity
            </span>
          )}
          {isSubmitting ? 'Đang xử lý...' : 'Xác nhận rút tiền'}
        </button>

        {/* Limits Info */}
        <div className="mt-6 p-4 bg-surface-container-low/50 rounded-lg">
          <p className="text-xs font-bold text-on-surface-variant mb-2 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">info</span>
            Withdrawal Limits
          </p>
          <p className="text-xs text-on-surface-variant">Min: 10 USDT</p>
          <p className="text-xs text-on-surface-variant">Max: 10,000 USDT/day</p>
          <p className="text-xs text-on-surface-variant">Fee: Network dependent</p>
        </div>
      </div>
    </div>
  );
}
