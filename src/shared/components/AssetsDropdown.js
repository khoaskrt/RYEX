'use client';

import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/shared/lib/supabase/client';

/**
 * Format number with commas
 */
function formatNumber(value) {
  const num = Number.parseFloat(value);
  if (!Number.isFinite(num)) return '0.00';
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

/**
 * Fetch user assets from API
 * @param {string} accessToken - Supabase access token
 * @returns {Promise<Object>} Assets payload
 */
async function fetchUserAssets(accessToken) {
  const response = await fetch('/api/v1/user/assets', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const error = new Error(errorBody?.error?.message || 'Failed to fetch assets');
    error.code = errorBody?.error?.code || 'UNKNOWN_ERROR';
    error.status = response.status;
    throw error;
  }

  return response.json();
}

export default function AssetsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [assetsData, setAssetsData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    async function loadAssets() {
      try {
        setIsLoading(true);
        setError('');

        const { data } = await supabase.auth.getSession();
        const accessToken = data.session?.access_token;

        if (!accessToken) {
          throw new Error('No authentication token');
        }

        const payload = await fetchUserAssets(accessToken);
        if (!isMounted) return;

        setAssetsData(payload);
      } catch (error) {
        if (!isMounted) return;
        console.error('Failed to load assets:', error);
        setError('Không thể tải dữ liệu');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadAssets();

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Assets Button */}
      <button
        className="flex h-10 w-10 items-center justify-center rounded-full border border-[#bbcac1]/30 bg-surface-container-low text-[#3c4a43] transition-colors hover:bg-surface-container-high"
        onMouseEnter={() => setIsOpen(true)}
        onClick={() => setIsOpen(!isOpen)}
        type="button"
        aria-label="Tài sản"
        title="Tài sản"
      >
        <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
      </button>

      {/* Dropdown Popup */}
      {isOpen && (
        <div
          className="absolute right-0 top-full mt-2 w-[380px] rounded-2xl border border-[#bbcac1]/20 bg-white shadow-[0_12px_32px_rgba(0,0,0,0.08)] backdrop-blur-xl"
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
        >
          {/* Header */}
          <div className="border-b border-[#bbcac1]/15 px-6 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#3c4a43]">Tài sản</h3>
              <a
                href="/app/assets"
                className="text-xs font-semibold text-[#01bc8d] transition-colors hover:text-[#006c4f]"
              >
                Xem tất cả
              </a>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="px-6 py-8 text-center">
              <p className="text-sm text-[#3c4a43]/60">Đang tải...</p>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="px-6 py-8 text-center">
              <p className="text-sm text-[#ba1a1a]">{error}</p>
            </div>
          )}

          {/* Content */}
          {!isLoading && !error && assetsData && (
            <div className="px-6 py-4">
              {/* Total Balance */}
              <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#3c4a43]/60 mb-2">
                  Tổng số dư
                </p>
                <p className="text-2xl font-extrabold text-[#3c4a43]">
                  {assetsData.totalBalanceBTC}{' '}
                  <span className="text-sm font-medium text-[#3c4a43]/60">BTC</span>
                </p>
                <p className="text-sm text-[#3c4a43]/70">
                  ≈ {formatNumber(assetsData.totalBalanceUSDT)}{' '}
                  <span className="text-xs font-medium">USDT</span>
                </p>
              </div>

              {/* Account List - Only Funding and Trading */}
              <div className="space-y-3">
                {/* Funding Account */}
                <div className="rounded-xl bg-[#f7f9fb] p-4 transition-all hover:bg-[#f2f4f6]">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-[#01bc8d]">wallet</span>
                    <p className="text-sm font-bold text-[#3c4a43]">Tài khoản tài trợ</p>
                  </div>
                  <div className="pl-6">
                    <p className="text-lg font-extrabold text-[#3c4a43]">
                      {assetsData.fundingAccount.balanceBTC}{' '}
                      <span className="text-xs font-semibold text-[#3c4a43]/60">BTC</span>
                    </p>
                    <p className="text-xs text-[#3c4a43]/70">
                      ≈ {formatNumber(assetsData.fundingAccount.balanceUSDT)} USDT
                    </p>
                  </div>
                </div>

                {/* Trading Account */}
                <div className="rounded-xl bg-[#f7f9fb] p-4 transition-all hover:bg-[#f2f4f6]">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-[#01bc8d]">swap_horiz</span>
                    <p className="text-sm font-bold text-[#3c4a43]">Tài khoản giao dịch</p>
                  </div>
                  <div className="pl-6">
                    <p className="text-lg font-extrabold text-[#3c4a43]">
                      {assetsData.tradingAccount.balanceBTC}{' '}
                      <span className="text-xs font-semibold text-[#3c4a43]/60">BTC</span>
                    </p>
                    <p className="text-xs text-[#3c4a43]/70">
                      ≈ {formatNumber(assetsData.tradingAccount.balanceUSDT)} USDT
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-6 flex gap-2">
                <button className="flex-1 rounded-lg bg-gradient-to-br from-[#006c4f] to-[#01bc8d] px-4 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:opacity-90 active:scale-95">
                  Nạp tiền
                </button>
                <button className="flex-1 rounded-lg bg-[#f2f4f6] px-4 py-2.5 text-xs font-bold text-[#3c4a43] transition-all hover:bg-[#e6e8ea] active:scale-95">
                  Rút tiền
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
