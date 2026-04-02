'use client';

export function AddressInput({ value, onChange, error, valid, disabled = false }) {
  async function handlePaste() {
    try {
      const text = await navigator.clipboard.readText();
      onChange(text);
    } catch (err) {
      console.error('Failed to read clipboard:', err);
    }
  }

  return (
    <div>
      <div className="relative">
        <input
          type="text"
          placeholder="Nhập địa chỉ ví hoặc dán từ clipboard"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`
            font-mono w-full
            bg-surface-container-low border-none rounded-xl
            pl-4 pr-12 py-3 text-sm
            transition-all duration-200
            focus:ring-2 focus:border-b-2
            ${error
              ? 'ring-2 ring-error border-b-2 border-error'
              : valid
                ? 'ring-2 ring-primary-container border-b-2 border-primary-container'
                : 'focus:ring-primary-container focus:border-primary'
            }
            disabled:opacity-60 disabled:cursor-not-allowed
          `}
          disabled={disabled}
          aria-describedby={error ? 'address-error' : undefined}
          aria-invalid={!!error}
        />

        {/* Paste Button */}
        <button
          type="button"
          onClick={handlePaste}
          disabled={disabled}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors disabled:opacity-40"
          aria-label="Dán địa chỉ từ clipboard"
        >
          <span className="material-symbols-outlined text-lg">content_paste</span>
        </button>

        {/* Success Check Icon */}
        {valid && !error && (
          <span className="absolute right-10 top-1/2 -translate-y-1/2 text-primary-container material-symbols-outlined">
            check_circle
          </span>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p id="address-error" className="text-xs text-error mt-1 flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">error</span>
          {error}
        </p>
      )}
    </div>
  );
}
