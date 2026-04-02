'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/shared/lib/supabase/client';
import AssetsDropdown from '@/shared/components/AssetsDropdown';
import LandingFooter from '@/shared/components/LandingFooter';

// Mock Data
const MOCK_COINS = [
  { symbol: 'BTC', name: 'Bitcoin', iconUrl: '/images/tokens/btc.png', balance: '0.5234' },
  { symbol: 'ETH', name: 'Ethereum', iconUrl: '/images/tokens/eth.png', balance: '2.5000' },
  { symbol: 'USDT', name: 'Tether', iconUrl: '/images/tokens/usdt.png', balance: '10000.00' },
  { symbol: 'SOL', name: 'Solana', iconUrl: '/images/tokens/sol.png', balance: '15.0000' },
];

const MOCK_NETWORKS = {
  BTC: [
    { id: 'btc-mainnet', name: 'Bitcoin Mainnet', fee: '0.0005', feeUsd: '35.00', estimatedTime: '~10-30 phút', available: true },
    { id: 'lightning', name: 'Lightning Network', fee: '0.00001', feeUsd: '0.70', estimatedTime: '~1-5 phút', available: true },
  ],
  ETH: [
    { id: 'eth-mainnet', name: 'Ethereum ERC-20', fee: '0.002', feeUsd: '7.50', estimatedTime: '~2-10 phút', available: true },
    { id: 'arbitrum', name: 'Arbitrum One', fee: '0.0001', feeUsd: '0.35', estimatedTime: '~1-3 phút', available: false },
  ],
  USDT: [
    { id: 'eth-erc20', name: 'Ethereum ERC-20', fee: '5.00', feeUsd: '5.00', estimatedTime: '~2-10 phút', available: true },
    { id: 'bsc-bep20', name: 'BSC BEP-20', fee: '1.00', feeUsd: '1.00', estimatedTime: '~1-3 phút', available: true },
    { id: 'tron-trc20', name: 'Tron TRC-20', fee: '1.00', feeUsd: '1.00', estimatedTime: '~1-3 phút', available: true },
  ],
  SOL: [
    { id: 'sol-mainnet', name: 'Solana Mainnet', fee: '0.001', feeUsd: '0.20', estimatedTime: '~10 giây', available: true },
  ],
};

const MOCK_ACCOUNTS = [
  {
    type: 'funding',
    label: 'Tài khoản tài trợ',
    sublabel: 'Funding Account',
    balanceBTC: '0.5234',
    balanceUSDT: '35,420',
    description: 'Dùng cho nạp/rút tiền',
  },
  {
    type: 'trading',
    label: 'Tài khoản giao dịch',
    sublabel: 'Trading Account',
    balanceBTC: '1.2345',
    balanceUSDT: '83,500',
    description: 'Chuyển về Funding trước khi rút',
  },
];

const MOCK_HISTORY = [
  {
    date: '02/04/2026 14:30',
    coin: 'BTC',
    amount: '0.1234',
    address: 'bc1q...xyz',
    network: 'Bitcoin Mainnet',
    status: 'completed',
    txHash: '3f2a1b...',
  },
  {
    date: '01/04/2026 09:15',
    coin: 'ETH',
    amount: '2.5000',
    address: '0x...abc',
    network: 'Ethereum ERC-20',
    status: 'processing',
    txHash: null,
  },
  {
    date: '31/03/2026 22:45',
    coin: 'USDT',
    amount: '500.00',
    address: '0x...def',
    network: 'BSC BEP-20',
    status: 'pending',
    txHash: null,
  },
];

const DEFAULT_PROFILE_VISUAL = {
  avatarUrl: '',
  initial: 'U',
};

function getProfileVisual(session) {
  const user = session?.user;
  if (!user) return DEFAULT_PROFILE_VISUAL;

  const email = (user.email || '').trim();
  const initial = email ? email.charAt(0).toUpperCase() : 'U';
  const provider = (user.app_metadata?.provider || '').toLowerCase();
  const userMeta = user.user_metadata || {};
  const avatarCandidate = userMeta.avatar_url || userMeta.picture || userMeta.photoURL || '';

  if (provider === 'google' && avatarCandidate) {
    return {
      avatarUrl: avatarCandidate,
      initial,
    };
  }

  return {
    avatarUrl: '',
    initial,
  };
}

export default function WithdrawPage() {
  const router = useRouter();
  const [isAuthResolved, setIsAuthResolved] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profileVisual, setProfileVisual] = useState(DEFAULT_PROFILE_VISUAL);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [activeTab, setActiveTab] = useState('withdraw'); // 'withdraw' | 'history'

  // Form states
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [coinDropdownOpen, setCoinDropdownOpen] = useState(false);
  const [coinSearchTerm, setCoinSearchTerm] = useState('');
  const [selectedNetwork, setSelectedNetwork] = useState(null);
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [addressError, setAddressError] = useState('');
  const [addressValid, setAddressValid] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [amountError, setAmountError] = useState('');
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [transactionId, setTransactionId] = useState('');

  // Auth check (reuse from Assets page pattern)
  useEffect(() => {
    let isMounted = true;
    async function bootstrapSession() {
      const { data } = await supabase.auth.getSession();
      if (!isMounted) return;
      setIsAuthenticated(Boolean(data.session));
      setProfileVisual(getProfileVisual(data.session));
      setIsAuthResolved(true);
    }
    bootstrapSession();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(Boolean(session));
      setProfileVisual(getProfileVisual(session));
      setIsAuthResolved(true);
    });
    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await supabase.auth.signOut();
      router.replace('/app/auth/login');
    } finally {
      setIsLoggingOut(false);
    }
  }

  // Form handlers
  function handleCoinSelect(coin) {
    setSelectedCoin(coin);
    setCoinDropdownOpen(false);
    setCoinSearchTerm('');
    // Reset dependent fields
    setSelectedNetwork(null);
    setWithdrawAddress('');
    setAddressError('');
    setAddressValid(false);
    setWithdrawAmount('');
    setAmountError('');
  }

  function handleNetworkSelect(network) {
    if (network.available) {
      setSelectedNetwork(network);
      setWithdrawAddress('');
      setAddressError('');
      setAddressValid(false);
    }
  }

  async function handleAddressPaste() {
    try {
      const text = await navigator.clipboard.readText();
      setWithdrawAddress(text);
      validateAddress(text);
    } catch (err) {
      console.error('Failed to read clipboard:', err);
    }
  }

  function validateAddress(address) {
    if (!address) {
      setAddressError('');
      setAddressValid(false);
      return;
    }
    // Basic validation (mock)
    if (address.length < 26) {
      setAddressError('Địa chỉ không hợp lệ (quá ngắn)');
      setAddressValid(false);
    } else if (!/^[a-zA-Z0-9]+$/.test(address)) {
      setAddressError('Địa chỉ chứa ký tự không hợp lệ');
      setAddressValid(false);
    } else {
      setAddressError('');
      setAddressValid(true);
    }
  }

  function handleAmountChange(value) {
    setWithdrawAmount(value);
    validateAmount(value);
  }

  function validateAmount(amount) {
    if (!amount || parseFloat(amount) === 0) {
      setAmountError('');
      return;
    }
    const numAmount = parseFloat(amount);
    const balance = parseFloat(selectedAccount?.balanceBTC || selectedCoin?.balance || 0);
    if (numAmount < 0.001) {
      setAmountError('Số tiền tối thiểu là 0.001 BTC');
    } else if (numAmount > balance) {
      setAmountError('Số dư không đủ');
    } else if (numAmount > 10) {
      setAmountError('Giới hạn tối đa 10 BTC/ngày');
    } else {
      setAmountError('');
    }
  }

  function handlePercentageAmount(percentage) {
    const balance = parseFloat(selectedAccount?.balanceBTC || selectedCoin?.balance || 0);
    const amount = (balance * percentage / 100).toFixed(8);
    handleAmountChange(amount);
  }

  function handleProceedToAccountSelection() {
    if (!selectedCoin || !selectedNetwork || !withdrawAddress || !addressValid) {
      return;
    }
    setShowAccountModal(true);
  }

  function handleAccountConfirm() {
    setShowAccountModal(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!isFormValid()) return;

    setIsSubmitting(true);
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate mock transaction ID
    const txId = `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`;
    setTransactionId(txId);
    setIsSubmitting(false);
    setShowSuccessModal(true);
  }

  function isFormValid() {
    return selectedCoin &&
           selectedNetwork &&
           withdrawAddress &&
           addressValid &&
           withdrawAmount &&
           !amountError &&
           selectedAccount &&
           termsAgreed;
  }

  function handleSuccessClose() {
    setShowSuccessModal(false);
    // Reset form
    setSelectedCoin(null);
    setSelectedNetwork(null);
    setWithdrawAddress('');
    setWithdrawAmount('');
    setSelectedAccount(null);
    setTermsAgreed(false);
  }

  function handleViewHistory() {
    setShowSuccessModal(false);
    setActiveTab('history');
  }

  async function handleCopyTxId() {
    try {
      await navigator.clipboard.writeText(transactionId);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }

  // Computed values
  const filteredCoins = MOCK_COINS.filter(coin =>
    coin.symbol.toLowerCase().includes(coinSearchTerm.toLowerCase()) ||
    coin.name.toLowerCase().includes(coinSearchTerm.toLowerCase())
  );

  const availableNetworks = selectedCoin ? MOCK_NETWORKS[selectedCoin.symbol] || [] : [];

  const networkFee = selectedNetwork ? selectedNetwork.fee : '0.00000000';
  const networkFeeUsd = selectedNetwork ? selectedNetwork.feeUsd : '0.00';
  const receiveAmount = withdrawAmount && !amountError
    ? (parseFloat(withdrawAmount) - parseFloat(networkFee)).toFixed(8)
    : '0.00000000';

  if (!isAuthResolved) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface text-on-surface">
        <p className="text-sm text-on-surface-variant">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen bg-surface text-on-surface antialiased">
      {/* TopAppBar - Reuse from Assets page */}
      <nav className="fixed top-0 z-50 w-full border-b border-[#bbcac1]/15 bg-[#f7f9fb]/80 shadow-[0_12px_32px_rgba(0,0,0,0.04)] backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-[1920px] items-center justify-between px-8">
          <div className="flex items-center gap-10">
            <Link className="text-2xl font-black tracking-tighter text-[#006c4f]" href="/">
              RYEX
            </Link>
            <div className="hidden h-full items-center gap-8 md:flex">
              <Link className="flex h-full items-center text-[#3c4a43] transition-colors hover:text-[#01bc8d]" href="/app/market">
                Thị trường
              </Link>
              <div className="group relative flex h-full items-center">
                <button className="flex h-full items-center gap-1 text-[#3c4a43] transition-colors group-hover:text-[#01bc8d]">
                  Giao dịch
                  <span className="material-symbols-outlined text-[20px] transition-transform group-hover:rotate-180">expand_more</span>
                </button>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <button
                  className="rounded-lg px-5 py-2 text-sm font-semibold text-[#3c4a43] transition-all hover:bg-[#f2f4f6]"
                  disabled={isLoggingOut}
                  onClick={handleLogout}
                  type="button"
                >
                  {isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}
                </button>
                <AssetsDropdown />
                <Link
                  aria-label="Hồ sơ người dùng"
                  className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-[#bbcac1]/30 bg-surface-container-low text-[#3c4a43] transition-colors hover:bg-surface-container-high"
                  href="/app/users"
                  title="Hồ sơ"
                >
                  {profileVisual.avatarUrl ? (
                    <img
                      alt="Avatar người dùng"
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                      src={profileVisual.avatarUrl}
                    />
                  ) : (
                    <span className="text-xs font-bold uppercase">{profileVisual.initial}</span>
                  )}
                </Link>
              </>
            ) : (
              <>
                <button
                  className="rounded-lg px-5 py-2 text-sm font-semibold text-[#3c4a43] transition-all hover:bg-[#f2f4f6]"
                  onClick={() => router.push('/app/auth/login')}
                  type="button"
                >
                  Đăng nhập
                </button>
                <button
                  className="rounded-xl bg-gradient-to-br from-[#006c4f] to-[#01bc8d] px-6 py-2.5 text-sm font-bold text-white shadow-lg transition-transform duration-200 active:scale-95"
                  onClick={() => router.push('/app/auth/signup')}
                  type="button"
                >
                  Đăng ký
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="min-h-screen pt-24 px-4 md:px-8 pb-12 max-w-[1440px] mx-auto">
        {/* Page Header with Tabs */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold tracking-tight text-on-surface">Rút tiền</h1>
            <a href="#help" className="text-sm text-primary font-semibold hover:underline flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">help</span>
              Trung tâm hỗ trợ
            </a>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-outline-variant/20">
            <button
              className={`py-4 px-6 text-sm font-bold transition-colors ${
                activeTab === 'withdraw'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low/50'
              }`}
              onClick={() => setActiveTab('withdraw')}
              role="tab"
              aria-selected={activeTab === 'withdraw'}
              aria-controls="withdraw-panel"
            >
              Rút tiền
            </button>
            <button
              className={`py-4 px-6 text-sm font-bold transition-colors ${
                activeTab === 'history'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low/50'
              }`}
              onClick={() => setActiveTab('history')}
              role="tab"
              aria-selected={activeTab === 'history'}
              aria-controls="history-panel"
            >
              Lịch sử rút tiền
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'withdraw' ? (
          <div role="tabpanel" id="withdraw-panel" aria-labelledby="withdraw-tab">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
                {/* Left Column: Form Steps */}
                <div className="space-y-6">
                  {/* Step 1: Chọn Coin */}
                  <div className="bg-surface-container-lowest p-6 md:p-8 rounded-2xl shadow-[0_12px_32px_-4px_rgba(0,0,0,0.04)] transition-shadow duration-300 hover:shadow-[0_12px_32px_-4px_rgba(0,0,0,0.06)]">
                    <h3 className="text-lg font-bold text-on-surface mb-4">Bước 1: Chọn Coin</h3>

                    {/* CoinSelector Dropdown */}
                    <div className="relative">
                      <button
                        type="button"
                        className={`
                          flex items-center justify-between w-full
                          px-4 py-3 rounded-xl
                          bg-surface-container-low border
                          text-sm font-medium
                          transition-all duration-200
                          ${coinDropdownOpen
                            ? 'border-primary ring-2 ring-primary-container'
                            : 'border-outline-variant hover:border-primary'
                          }
                          focus:outline-none focus:ring-2 focus:ring-primary-container
                        `}
                        onClick={() => setCoinDropdownOpen(!coinDropdownOpen)}
                        aria-haspopup="listbox"
                        aria-expanded={coinDropdownOpen}
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
                        <span className={`material-symbols-outlined text-on-surface-variant transition-transform duration-200 ${coinDropdownOpen ? 'rotate-180' : ''}`}>
                          expand_more
                        </span>
                      </button>

                      {/* Dropdown List */}
                      {coinDropdownOpen && (
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
                                value={coinSearchTerm}
                                onChange={(e) => setCoinSearchTerm(e.target.value)}
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
                                onClick={() => handleCoinSelect(coin)}
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
                  </div>

                  {/* Step 2: Chọn Network */}
                  {selectedCoin && (
                    <div className="bg-surface-container-lowest p-6 md:p-8 rounded-2xl shadow-[0_12px_32px_-4px_rgba(0,0,0,0.04)] transition-shadow duration-300 hover:shadow-[0_12px_32px_-4px_rgba(0,0,0,0.06)]">
                      <h3 className="text-lg font-bold text-on-surface mb-4">Bước 2: Chọn Network</h3>

                      <div className="space-y-3">
                        {availableNetworks.map(network => (
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
                              onChange={() => handleNetworkSelect(network)}
                              disabled={!network.available}
                              className="sr-only"
                              aria-describedby={`network-${network.id}-desc`}
                            />
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <p className="font-bold text-on-surface mb-1">{network.name}</p>
                                <p className="text-xs text-on-surface-variant" id={`network-${network.id}-desc`}>
                                  Phí: {network.fee} {selectedCoin.symbol} ≈ ${network.feeUsd}
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
                    </div>
                  )}

                  {/* Step 3: Nhập địa chỉ ví */}
                  {selectedNetwork && (
                    <div className="bg-surface-container-lowest p-6 md:p-8 rounded-2xl shadow-[0_12px_32px_-4px_rgba(0,0,0,0.04)] transition-shadow duration-300 hover:shadow-[0_12px_32px_-4px_rgba(0,0,0,0.06)]">
                      <h3 className="text-lg font-bold text-on-surface mb-4">Bước 3: Địa chỉ ví</h3>

                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Nhập địa chỉ ví hoặc dán từ clipboard"
                          value={withdrawAddress}
                          onChange={(e) => {
                            setWithdrawAddress(e.target.value);
                            validateAddress(e.target.value);
                          }}
                          className={`
                            font-mono w-full
                            bg-surface-container-low border-none rounded-xl
                            pl-4 pr-12 py-3 text-sm
                            transition-all duration-200
                            focus:ring-2 focus:border-b-2
                            ${addressError
                              ? 'ring-2 ring-error border-b-2 border-error'
                              : addressValid
                                ? 'ring-2 ring-primary-container border-b-2 border-primary-container'
                                : 'focus:ring-primary-container focus:border-primary'
                            }
                          `}
                          aria-describedby={addressError ? 'address-error' : undefined}
                          aria-invalid={!!addressError}
                        />

                        {/* Paste Button */}
                        <button
                          type="button"
                          onClick={handleAddressPaste}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                          aria-label="Dán địa chỉ từ clipboard"
                        >
                          <span className="material-symbols-outlined text-lg">content_paste</span>
                        </button>

                        {/* Success Check Icon */}
                        {addressValid && !addressError && (
                          <span className="absolute right-10 top-1/2 -translate-y-1/2 text-primary-container material-symbols-outlined">
                            check_circle
                          </span>
                        )}
                      </div>

                      {/* Error Message */}
                      {addressError && (
                        <p id="address-error" className="text-xs text-error mt-1 flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">error</span>
                          {addressError}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Step 4: Account Selection + Amount (shown after valid address) */}
                  {addressValid && (
                    <div className="bg-surface-container-lowest p-6 md:p-8 rounded-2xl shadow-[0_12px_32px_-4px_rgba(0,0,0,0.04)] transition-shadow duration-300 hover:shadow-[0_12px_32px_-4px_rgba(0,0,0,0.06)]">
                      <h3 className="text-lg font-bold text-on-surface mb-4">Bước 4: Chọn tài khoản & Số lượng</h3>

                      {/* Account Selection Button */}
                      <button
                        type="button"
                        onClick={() => setShowAccountModal(true)}
                        className="w-full mb-6 flex items-center justify-between px-4 py-3 bg-surface-container-low hover:bg-surface-container rounded-xl transition-colors"
                      >
                        {selectedAccount ? (
                          <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-primary">
                              {selectedAccount.type === 'funding' ? 'wallet' : 'swap_horiz'}
                            </span>
                            <div className="text-left">
                              <p className="font-bold text-on-surface text-sm">{selectedAccount.label}</p>
                              <p className="text-xs text-on-surface-variant">
                                {selectedAccount.balanceBTC} BTC ≈ ${selectedAccount.balanceUSDT}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-on-surface-variant text-sm">Chọn tài khoản rút tiền</span>
                        )}
                        <span className="material-symbols-outlined text-on-surface-variant">
                          chevron_right
                        </span>
                      </button>

                      {/* Amount Input (shown after account selection) */}
                      {selectedAccount && (
                        <div className="space-y-4">
                          <p className="text-xs text-on-surface-variant">
                            Số dư khả dụng: <span className="font-semibold">{selectedAccount.balanceBTC} {selectedCoin.symbol}</span>
                          </p>

                          {/* Amount Input */}
                          <div className="relative">
                            <input
                              type="number"
                              step="0.00000001"
                              min="0"
                              placeholder="0.00000000"
                              value={withdrawAmount}
                              onChange={(e) => handleAmountChange(e.target.value)}
                              className={`
                                w-full
                                bg-surface-container-low border-none rounded-xl
                                pl-4 pr-16 py-4
                                text-lg font-bold
                                transition-all duration-200
                                focus:ring-2 focus:ring-primary-container focus:border-b-2 focus:border-primary
                                ${amountError ? 'ring-2 ring-error border-b-2 border-error' : ''}
                              `}
                              aria-describedby={amountError ? 'amount-error' : 'amount-calc'}
                              aria-invalid={!!amountError}
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold text-sm">
                              {selectedCoin.symbol}
                            </span>
                          </div>

                          {/* Quick Amount Buttons */}
                          <div className="grid grid-cols-4 gap-2">
                            {['25%', '50%', '75%', 'Tất cả'].map((label, idx) => (
                              <button
                                key={label}
                                type="button"
                                onClick={() => handlePercentageAmount((idx + 1) * 25)}
                                className="
                                  bg-surface-container-low hover:bg-primary-container/20
                                  text-on-surface font-bold py-2 rounded-lg text-sm
                                  transition-colors duration-200
                                  active:scale-95
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
                              <span className="font-semibold text-on-surface">{withdrawAmount || '0.00000000'} {selectedCoin.symbol}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-on-surface-variant">Phí mạng</span>
                              <span className="font-semibold text-on-surface">{networkFee} {selectedCoin.symbol} ≈ ${networkFeeUsd}</span>
                            </div>
                            <div className="border-t border-outline-variant/20 pt-2 flex justify-between">
                              <span className="text-sm font-bold text-on-surface-variant">Số tiền nhận</span>
                              <span className="text-lg font-extrabold text-primary-container">{receiveAmount} {selectedCoin.symbol}</span>
                            </div>
                          </div>

                          {/* Error Message */}
                          {amountError && (
                            <p id="amount-error" className="text-xs text-error mt-1 flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm">error</span>
                              {amountError}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Right Column: Summary Card (Sticky on Desktop) */}
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
                            {selectedNetwork ? `${networkFee} ${selectedCoin?.symbol}` : '---'}
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
                        onChange={(e) => setTermsAgreed(e.target.checked)}
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
                      disabled={!isFormValid() || isSubmitting}
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
                      <p className="text-xs text-on-surface-variant">Min: 0.001 BTC</p>
                      <p className="text-xs text-on-surface-variant">Max: 10 BTC/day</p>
                      <p className="text-xs text-on-surface-variant">Fee: Network dependent</p>
                    </div>
                  </div>
                </div>
              </div>
            </form>

            {/* Account Selection Modal */}
            {showAccountModal && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
                  onClick={() => setShowAccountModal(false)}
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
                        onClick={() => setShowAccountModal(false)}
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
                        {MOCK_ACCOUNTS.map(account => (
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
                              onChange={() => setSelectedAccount(account)}
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
                                  {account.balanceBTC} BTC
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
                        onClick={() => setShowAccountModal(false)}
                        className="flex-1 bg-surface-container-highest text-on-surface px-6 py-2.5 rounded-lg font-bold text-sm transition-all hover:bg-surface-container-high active:scale-95"
                      >
                        Huỷ bỏ
                      </button>
                      <button
                        type="button"
                        onClick={handleAccountConfirm}
                        disabled={!selectedAccount}
                        className="flex-1 bg-gradient-to-br from-[#006c4f] to-[#01bc8d] text-white px-6 py-2.5 rounded-lg font-bold text-sm shadow-md transition-all hover:opacity-90 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        Tiếp tục
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Success Modal */}
            {showSuccessModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <div
                  className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                  onClick={handleSuccessClose}
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
                    Yêu cầu rút {withdrawAmount} {selectedCoin?.symbol} đã được gửi. Bạn có thể theo dõi trạng thái trong lịch sử giao dịch.
                  </p>

                  {/* Transaction ID */}
                  <div className="bg-surface-container-low px-3 py-2 rounded-lg mb-6 flex items-center justify-between">
                    <span className="font-mono text-xs text-on-surface-variant">{transactionId}</span>
                    <button
                      type="button"
                      onClick={handleCopyTxId}
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
                      onClick={handleViewHistory}
                      className="flex-1 bg-gradient-to-br from-[#006c4f] to-[#01bc8d] text-white px-6 py-2.5 rounded-lg font-bold text-sm shadow-md transition-all hover:opacity-90 active:scale-95"
                    >
                      Xem lịch sử
                    </button>
                    <button
                      type="button"
                      onClick={handleSuccessClose}
                      className="flex-1 bg-surface-container-highest text-on-surface px-6 py-2.5 rounded-lg font-bold text-sm transition-all hover:bg-surface-container-high active:scale-95"
                    >
                      Đóng
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div role="tabpanel" id="history-panel" aria-labelledby="history-tab">
            {/* History Table (Desktop) / Cards (Mobile) */}
            <div className="bg-surface-container-lowest rounded-2xl shadow-[0_12px_32px_-4px_rgba(0,0,0,0.04)] overflow-hidden">
              <div className="px-8 py-6 border-b border-outline-variant/10">
                <h2 className="text-xl font-extrabold tracking-tight">Lịch sử rút tiền</h2>
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low/30">
                      <th className="px-8 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest">Ngày giờ</th>
                      <th className="px-8 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest">Coin</th>
                      <th className="px-8 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest text-right">
                        Số lượng
                      </th>
                      <th className="px-8 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest">Địa chỉ</th>
                      <th className="px-8 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest">Network</th>
                      <th className="px-8 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest">Trạng thái</th>
                      <th className="px-8 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest text-right">
                        Hành động
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/5">
                    {MOCK_HISTORY.map((tx, idx) => (
                      <tr key={idx} className="hover:bg-surface-container-low transition-colors">
                        <td className="px-8 py-5">
                          <p className="text-sm font-semibold text-on-surface">{tx.date}</p>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-primary-container/20 flex items-center justify-center">
                              <span className="text-xs font-bold text-primary">{tx.coin.charAt(0)}</span>
                            </div>
                            <p className="font-bold text-on-surface">{tx.coin}</p>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <p className="font-bold text-on-surface">
                            {tx.amount} {tx.coin}
                          </p>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-2">
                            <p className="font-mono text-xs text-on-surface-variant">{tx.address}</p>
                            <button className="text-on-surface-variant hover:text-primary transition-colors" aria-label="Copy address">
                              <span className="material-symbols-outlined text-sm">content_copy</span>
                            </button>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <p className="text-sm text-on-surface-variant">{tx.network}</p>
                        </td>
                        <td className="px-8 py-5">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                              tx.status === 'completed'
                                ? 'bg-[#01bc8d]/10 text-[#01bc8d]'
                                : tx.status === 'processing'
                                  ? 'bg-[#4c56af]/10 text-[#4c56af]'
                                  : 'bg-[#f9a825]/10 text-[#f9a825]'
                            }`}
                          >
                            {tx.status === 'completed' ? 'Hoàn thành' : tx.status === 'processing' ? 'Đang xử lý' : 'Chờ xử lý'}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <button className="text-primary font-bold text-sm hover:underline">Chi tiết</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4 p-4">
                {MOCK_HISTORY.map((tx, idx) => (
                  <div key={idx} className="bg-surface-container-low p-4 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-primary-container/20 flex items-center justify-center">
                          <span className="text-xs font-bold text-primary">{tx.coin.charAt(0)}</span>
                        </div>
                        <p className="font-bold text-on-surface">{tx.coin}</p>
                      </div>
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                          tx.status === 'completed'
                            ? 'bg-[#01bc8d]/10 text-[#01bc8d]'
                            : tx.status === 'processing'
                              ? 'bg-[#4c56af]/10 text-[#4c56af]'
                              : 'bg-[#f9a825]/10 text-[#f9a825]'
                        }`}
                      >
                        {tx.status === 'completed' ? 'Hoàn thành' : tx.status === 'processing' ? 'Đang xử lý' : 'Chờ xử lý'}
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant mb-2">{tx.date}</p>
                    <p className="text-lg font-bold text-on-surface mb-3">
                      {tx.amount} {tx.coin}
                    </p>
                    <div className="space-y-1">
                      <p className="text-xs text-on-surface-variant">Network: {tx.network}</p>
                      <p className="text-xs text-on-surface-variant font-mono">Địa chỉ: {tx.address}</p>
                    </div>
                    <button className="text-primary font-bold text-sm hover:underline mt-3">Chi tiết →</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      <LandingFooter />
    </div>
  );
}
