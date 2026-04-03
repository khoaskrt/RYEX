'use client';

export function AmountInput({
  value,
  onChange,
  error,
  disabled = false,
  selectedCoin,
  selectedNetwork,
  selectedAccount,
  networkFee,
  networkFeeUsd,
  receiveAmount,
  onPercentageClick,
}) {
  const availableBalance = selectedAccount?.balance || selectedCoin?.balance || '0.00000000';
  const feeSymbol = selectedNetwork?.feeSymbol || selectedCoin?.symbol || '';

  return (
    <div className="space-y-4">
      {/* Available Balance */}
      <p className="text-xs text-on-surface-variant">
        Số dư khả dụng: <span className="font-semibold">{availableBalance} {selectedCoin?.symbol || ''}</span>
      </p>

      {/* Amount Input */}
      <div className="relative">
        <input
          type="number"
          step="0.00000001"
          min="0"
          placeholder="0.00000000"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`
            w-full
            bg-surface-container-low border-none rounded-xl
            pl-4 pr-16 py-4
            text-lg font-bold
            transition-all duration-200
            focus:ring-2 focus:ring-primary-container focus:border-b-2 focus:border-primary
            ${error ? 'ring-2 ring-error border-b-2 border-error' : ''}
            disabled:opacity-60 disabled:cursor-not-allowed
          `}
          disabled={disabled}
          aria-describedby={error ? 'amount-error' : 'amount-calc'}
          aria-invalid={!!error}
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold text-sm">
          {selectedCoin?.symbol || ''}
        </span>
      </div>

      {/* Quick Amount Buttons */}
      <div className="grid grid-cols-4 gap-2">
        {['25%', '50%', '75%', 'Tất cả'].map((label, idx) => (
          <button
            key={label}
            type="button"
            onClick={() => onPercentageClick((idx + 1) * 25)}
            disabled={disabled}
            className="
              bg-surface-container-low hover:bg-primary-container/20
              text-on-surface font-bold py-2 rounded-lg text-sm
              transition-colors duration-200
              active:scale-95
              disabled:opacity-60 disabled:cursor-not-allowed
            "
          >
            {label}
          </button>
        ))}
      </div>

      {/* Calculation Card */}
      <div id="amount-calc" className="bg-surface-container-low p-4 rounded-xl space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-on-surface-variant">Số tiền rút</span>
          <span className="font-semibold text-on-surface">{value || '0.00000000'} {selectedCoin?.symbol || ''}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-on-surface-variant">Phí mạng</span>
          <span className="font-semibold text-on-surface">{networkFee} {feeSymbol} ≈ ${networkFeeUsd}</span>
        </div>
        <div className="border-t border-outline-variant/20 pt-2 flex justify-between">
          <span className="text-sm font-bold text-on-surface-variant">Số tiền nhận</span>
          <span className="text-lg font-extrabold text-primary-container">{receiveAmount} {selectedCoin?.symbol || ''}</span>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <p id="amount-error" className="text-xs text-error mt-1 flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">error</span>
          {error}
        </p>
      )}
    </div>
  );
}
