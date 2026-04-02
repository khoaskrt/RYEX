'use client';

export function NetworkSelector({ networks, selectedNetwork, selectedCoin, onSelect }) {
  return (
    <div className="space-y-3">
      {networks.map(network => (
        <label
          key={network.id}
          className={`
            block p-4 rounded-xl border-2 cursor-pointer
            transition-all duration-200
            ${selectedNetwork?.id === network.id
              ? 'border-primary bg-primary-container/5'
              : 'border-outline-variant hover:border-primary hover:shadow-md hover:translate-y-[-2px]'
            }
            ${!network.available ? 'opacity-40 cursor-not-allowed' : ''}
            focus-within:ring-2 focus-within:ring-primary-container focus-within:outline-none
          `}
        >
          <input
            type="radio"
            name="network"
            value={network.id}
            checked={selectedNetwork?.id === network.id}
            onChange={() => network.available && onSelect(network)}
            disabled={!network.available}
            className="sr-only"
            aria-describedby={`network-${network.id}-desc`}
          />
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <p className="font-bold text-on-surface mb-1">{network.name}</p>
              <p className="text-xs text-on-surface-variant" id={`network-${network.id}-desc`}>
                Phí: {network.fee} {selectedCoin?.symbol || ''} ≈ ${network.feeUsd}
              </p>
              <p className="text-xs text-on-surface-variant">
                Thời gian: {network.estimatedTime}
              </p>
              {!network.available && (
                <span className="inline-block mt-2 bg-error/10 text-error text-xs px-2 py-0.5 rounded">
                  Đang bảo trì
                </span>
              )}
            </div>
            <span className={`material-symbols-outlined text-xl ${selectedNetwork?.id === network.id ? 'text-primary' : 'text-outline'}`}>
              {selectedNetwork?.id === network.id ? 'radio_button_checked' : 'radio_button_unchecked'}
            </span>
          </div>
        </label>
      ))}
    </div>
  );
}
