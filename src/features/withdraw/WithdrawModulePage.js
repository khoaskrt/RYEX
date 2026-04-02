'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import AppTopNav from '@/shared/components/AppTopNav';
import { supabase } from '@/shared/lib/supabase/client';
import FundingNavigationSidebar from '@/shared/components/FundingNavigationSidebar';
import FundingNavigationTabBar from '@/shared/components/FundingNavigationTabBar';
import LandingFooter from '@/shared/components/LandingFooter';
import { CoinSelector } from './components/CoinSelector';
import { NetworkSelector } from './components/NetworkSelector';
import { AddressInput } from './components/AddressInput';
import { AmountInput } from './components/AmountInput';
import { AccountSelectionModal } from './components/AccountSelectionModal';
import { WithdrawSummaryCard } from './components/WithdrawSummaryCard';
import { SuccessModal } from './components/SuccessModal';
import { MOCK_COINS, MOCK_NETWORKS, MOCK_ACCOUNTS, MOCK_HISTORY } from './constants';

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

export function WithdrawModulePage() {
  const router = useRouter();
  const [isAuthResolved, setIsAuthResolved] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profileVisual, setProfileVisual] = useState(DEFAULT_PROFILE_VISUAL);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Form states
  const [selectedCoin, setSelectedCoin] = useState(null);
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
    // Reset dependent fields
    setSelectedNetwork(null);
    setWithdrawAddress('');
    setAddressError('');
    setAddressValid(false);
    setWithdrawAmount('');
    setAmountError('');
  }

  function handleNetworkSelect(network) {
    setSelectedNetwork(network);
    setWithdrawAddress('');
    setAddressError('');
    setAddressValid(false);
  }

  function handleAddressChange(address) {
    setWithdrawAddress(address);
    validateAddress(address);
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
    // Scroll to history section
    const historySection = document.getElementById('history-section');
    if (historySection) {
      historySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // Computed values
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
      <AppTopNav
        isAuthenticated={isAuthenticated}
        isLoggingOut={isLoggingOut}
        onLogout={handleLogout}
        profileVisual={profileVisual}
      />

      <FundingNavigationSidebar />
      <FundingNavigationTabBar />

      {/* Main Content */}
      <main className="min-h-screen pt-24 px-4 pb-12 md:px-8 max-w-[1440px] mx-auto lg:ml-60">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight text-on-surface">Rút tiền</h1>
            <a href="#help" className="text-sm text-primary font-semibold hover:underline flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">help</span>
              Trung tâm hỗ trợ
            </a>
          </div>
        </div>

        {/* Withdraw Form Section */}
        <div>
          <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
                {/* Left Column: Form Steps */}
                <div className="space-y-6">
                  {/* Step 1: Chọn Coin */}
                  <div className="bg-surface-container-lowest p-6 md:p-8 rounded-2xl shadow-[0_12px_32px_-4px_rgba(0,0,0,0.04)]">
                    <h3 className="text-lg font-bold text-on-surface mb-4">Bước 1: Chọn Coin</h3>
                    <CoinSelector
                      coins={MOCK_COINS}
                      selectedCoin={selectedCoin}
                      onSelect={handleCoinSelect}
                    />
                  </div>

                  {/* Step 2: Chọn Network */}
                  {selectedCoin && (
                    <div className="bg-surface-container-lowest p-6 md:p-8 rounded-2xl shadow-[0_12px_32px_-4px_rgba(0,0,0,0.04)]">
                      <h3 className="text-lg font-bold text-on-surface mb-4">Bước 2: Chọn Network</h3>
                      <NetworkSelector
                        networks={availableNetworks}
                        selectedNetwork={selectedNetwork}
                        selectedCoin={selectedCoin}
                        onSelect={handleNetworkSelect}
                      />
                    </div>
                  )}

                  {/* Step 3: Nhập địa chỉ ví */}
                  {selectedNetwork && (
                    <div className="bg-surface-container-lowest p-6 md:p-8 rounded-2xl shadow-[0_12px_32px_-4px_rgba(0,0,0,0.04)]">
                      <h3 className="text-lg font-bold text-on-surface mb-4">Bước 3: Địa chỉ ví</h3>
                      <AddressInput
                        value={withdrawAddress}
                        onChange={handleAddressChange}
                        error={addressError}
                        valid={addressValid}
                      />
                    </div>
                  )}

                  {/* Step 4: Account Selection + Amount */}
                  {addressValid && (
                    <div className="bg-surface-container-lowest p-6 md:p-8 rounded-2xl shadow-[0_12px_32px_-4px_rgba(0,0,0,0.04)]">
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

                      {/* Amount Input */}
                      {selectedAccount && (
                        <AmountInput
                          value={withdrawAmount}
                          onChange={handleAmountChange}
                          error={amountError}
                          selectedCoin={selectedCoin}
                          selectedAccount={selectedAccount}
                          networkFee={networkFee}
                          networkFeeUsd={networkFeeUsd}
                          receiveAmount={receiveAmount}
                          onPercentageClick={handlePercentageAmount}
                        />
                      )}
                    </div>
                  )}
                </div>

                {/* Right Column: Summary Card (Sticky) */}
                <WithdrawSummaryCard
                  selectedCoin={selectedCoin}
                  selectedNetwork={selectedNetwork}
                  withdrawAddress={withdrawAddress}
                  selectedAccount={selectedAccount}
                  withdrawAmount={withdrawAmount}
                  amountError={amountError}
                  networkFee={networkFee}
                  receiveAmount={receiveAmount}
                  termsAgreed={termsAgreed}
                  onTermsChange={setTermsAgreed}
                  isSubmitting={isSubmitting}
                  onSubmit={handleSubmit}
                  isFormValid={isFormValid()}
                />
              </div>

              {/* Modals */}
            <AccountSelectionModal
              isOpen={showAccountModal}
              accounts={MOCK_ACCOUNTS}
              selectedAccount={selectedAccount}
              onSelectAccount={setSelectedAccount}
              onClose={() => setShowAccountModal(false)}
              onConfirm={handleAccountConfirm}
            />

            <SuccessModal
              isOpen={showSuccessModal}
              amount={withdrawAmount}
              coin={selectedCoin?.symbol}
              transactionId={transactionId}
              onClose={handleSuccessClose}
              onViewHistory={handleViewHistory}
            />
          </form>
        </div>

        {/* History Section - Always visible below form */}
        <div id="history-section" className="mt-16">
          <h2 className="text-2xl font-bold tracking-tight text-on-surface mb-6">Lịch sử rút tiền</h2>

          {/* History Table (Desktop) / Cards (Mobile) */}
          <div className="bg-surface-container-lowest rounded-2xl shadow-[0_12px_32px_-4px_rgba(0,0,0,0.04)] overflow-hidden">
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
      </main>

      <LandingFooter />
    </div>
  );
}
