'use client';

import { useState } from 'react';

export function CoinSelector({ coins, selectedCoin, onSelect, disabled = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCoins = coins.filter(coin =>
    coin.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    coin.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  function handleSelect(coin) {
    onSelect(coin);
    setIsOpen(false);
    setSearchTerm('');
  }

  return (
    <div className="relative">
      <button
        type="button"
        className={`
          flex items-center justify-between w-full
          px-4 py-3 rounded-xl
          bg-surface-container-low border
          text-sm font-medium
          transition-all duration-200
          ${isOpen
            ? 'border-primary ring-2 ring-primary-container'
            : 'border-outline-variant hover:border-primary'
          }
          focus:outline-none focus:ring-2 focus:ring-primary-container
          disabled:opacity-40 disabled:cursor-not-allowed
        `}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        disabled={disabled}
      >
        {selectedCoin ? (
          <div className="flex items-center gap-3">
            <img src={selectedCoin.iconUrl} alt="" className="h-6 w-6 rounded-full" />
            <div className="text-left">
              <p className="font-bold text-on-surface">{selectedCoin.symbol}</p>
              <p className="text-xs text-on-surface-variant">{selectedCoin.name}</p>
            </div>
          </div>
        ) : (
          <span className="text-on-surface-variant">Chọn coin để rút</span>
        )}
        <span className={`material-symbols-outlined text-on-surface-variant transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          expand_more
        </span>
      </button>

      {/* Dropdown List */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-surface-container-lowest rounded-xl shadow-[0_12px_32px_rgba(0,0,0,0.1)] max-h-80 overflow-y-auto">
          {/* Search Input */}
          <div className="sticky top-0 bg-surface-container-lowest p-3 border-b border-outline-variant/10">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">
                search
              </span>
              <input
                type="text"
                placeholder="Tìm kiếm coin..."
                className="w-full pl-10 pr-4 py-2 bg-surface-container-low border-none rounded-lg text-sm focus:ring-2 focus:ring-primary-container"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Coin List */}
          <div role="listbox" aria-label="Chọn coin">
            {filteredCoins.map(coin => (
              <button
                key={coin.symbol}
                type="button"
                role="option"
                aria-selected={selectedCoin?.symbol === coin.symbol}
                className="flex items-center justify-between w-full px-4 py-3 text-left transition-colors hover:bg-surface-container-low"
                onClick={() => handleSelect(coin)}
              >
                <div className="flex items-center gap-3">
                  <img src={coin.iconUrl} alt="" className="h-6 w-6 rounded-full" />
                  <div>
                    <p className="font-bold text-on-surface text-sm">{coin.symbol}</p>
                    <p className="text-xs text-on-surface-variant">{coin.name}</p>
                  </div>
                </div>
                <p className="text-xs text-on-surface-variant text-right">
                  {coin.balance} {coin.symbol}
                </p>
              </button>
            ))}

            {filteredCoins.length === 0 && (
              <div className="py-8 text-center">
                <span className="material-symbols-outlined text-4xl text-on-surface-variant/30 block mb-2">
                  search_off
                </span>
                <p className="text-sm text-on-surface-variant">Không tìm thấy tài sản</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
