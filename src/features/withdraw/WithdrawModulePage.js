'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
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
import { MOCK_ACCOUNTS, MOCK_COINS, MOCK_NETWORKS, MOCK_HISTORY } from './constants';

const DEFAULT_PROFILE_VISUAL = {
  avatarUrl: '',
  initial: 'U',
};

const ERROR_COPY_MAP = {
  WALLET_UNAUTHORIZED: 'Phien dang nhap het han. Vui long dang nhap lai.',
  WITHDRAW_INVALID_ADDRESS: 'Dia chi vi khong hop le.',
  WITHDRAW_INVALID_AMOUNT: 'So tien rut khong hop le.',
  WITHDRAW_AMOUNT_TOO_SMALL: 'So tien rut nho hon muc toi thieu.',
  WITHDRAW_AMOUNT_TOO_LARGE: 'So tien rut vuot qua han muc.',
  WITHDRAW_INSUFFICIENT_BALANCE: 'So du khong du de thuc hien rut tien.',
  WITHDRAW_LIMIT_EXCEEDED: 'Vuot qua gioi han rut tien trong ngay.',
  WITHDRAW_RATE_LIMIT: 'Ban dang thao tac qua nhanh. Vui long thu lai sau.',
  WITHDRAW_DUPLICATE_REQUEST: 'Yeu cau rut trung lap. Vui long doi ket qua lenh truoc.',
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

function toErrorMessage(errorCode, fallback = 'Da xay ra loi. Vui long thu lai.') {
  return ERROR_COPY_MAP[errorCode] || fallback;
}

function isLikelyBscAddress(address) {
  return /^0x[a-fA-F0-9]{40}$/.test(address || '');
}

function formatHistoryDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--';
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

function mapWithdrawHistoryRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) return [];

  return rows.map((tx) => ({
    date: formatHistoryDate(tx.createdAt),
    coin: tx.symbol || 'USDT',
    amount: tx.amount || '0.00000000',
    address: tx.toAddress || '--',
    network: 'BSC Testnet BEP-20',
    status: tx.status || 'pending',
    txHash: tx.txHash || null,
  }));
}

function getStatusUi(status) {
  if (status === 'completed') return { label: 'Hoan thanh', className: 'bg-[#01bc8d]/10 text-[#01bc8d]' };
  if (status === 'confirming') return { label: 'Dang xac nhan', className: 'bg-[#4c56af]/10 text-[#4c56af]' };
  if (status === 'failed') return { label: 'That bai', className: 'bg-[#ba1a1a]/10 text-[#ba1a1a]' };
  return { label: 'Cho xu ly', className: 'bg-[#f9a825]/10 text-[#f9a825]' };
}

export function WithdrawModulePage() {
  const router = useRouter();
  const [isAuthResolved, setIsAuthResolved] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profileVisual, setProfileVisual] = useState(DEFAULT_PROFILE_VISUAL);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [coins, setCoins] = useState(MOCK_COINS);
  const [accounts, setAccounts] = useState(MOCK_ACCOUNTS);
  const [historyRows, setHistoryRows] = useState(MOCK_HISTORY);
  const [historyLoading, setHistoryLoading] = useState(false);

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
  const [submitError, setSubmitError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [transactionId, setTransactionId] = useState('');

  // Auth check
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

  useEffect(() => {
    if (!isAuthResolved || !isAuthenticated) return;

    async function bootstrapWalletData() {
      await Promise.all([loadAssets(), loadWithdrawHistory()]);
    }

    bootstrapWalletData();
  }, [isAuthResolved, isAuthenticated]);

  async function getAccessToken() {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.access_token || '';
  }

  async function loadAssets() {
    try {
      const token = await getAccessToken();
      if (!token) return;

      const response = await fetch('/api/v1/user/assets', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const payload = await response.json();
      if (!response.ok) return;

      const usdtAsset = (payload.assets || []).find((asset) => asset.symbol === 'USDT');
      const fundingBalance = usdtAsset?.fundingBalance || '0.00000000';
      const fundingUSDTValue = usdtAsset?.valueUSDT || fundingBalance;

      const nextCoins = [
        {
          symbol: 'USDT',
          name: 'Tether',
          iconUrl: '/images/tokens/usdt.svg',
          balance: fundingBalance,
        },
      ];

      const nextAccounts = [
        {
          type: 'funding',
          label: 'Tai khoan tai tro',
          sublabel: 'Funding Account',
          balance: fundingBalance,
          unit: 'USDT',
          balanceUSDT: fundingUSDTValue,
          description: 'Dung cho nap/rut tien',
        },
      ];

      setCoins(nextCoins);
      setAccounts(nextAccounts);

      setSelectedCoin(nextCoins[0]);
      setSelectedAccount(nextAccounts[0]);
      setSelectedNetwork(MOCK_NETWORKS.USDT[0]);
    } catch (error) {
      console.error('Failed to load assets for withdraw', error);
    }
  }

  async function loadWithdrawHistory() {
    setHistoryLoading(true);
    try {
      const token = await getAccessToken();
      if (!token) return;

      const response = await fetch('/api/v1/wallet/transactions?type=withdraw&status=all&limit=20&offset=0', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const payload = await response.json();
      if (!response.ok) return;

      const mappedRows = mapWithdrawHistoryRows(payload.transactions);
      setHistoryRows(mappedRows);
    } catch (error) {
      console.error('Failed to load withdraw history', error);
    } finally {
      setHistoryLoading(false);
    }
  }

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
    setSelectedNetwork(MOCK_NETWORKS.USDT[0]);
    setWithdrawAddress('');
    setAddressError('');
    setAddressValid(false);
    setWithdrawAmount('');
    setAmountError('');
    setSubmitError('');
  }

  function handleNetworkSelect(network) {
    setSelectedNetwork(network);
    setWithdrawAddress('');
    setAddressError('');
    setAddressValid(false);
    setSubmitError('');
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

    if (!isLikelyBscAddress(address)) {
      setAddressError('Dia chi khong hop le cho mang BSC');
      setAddressValid(false);
      return;
    }

    setAddressError('');
    setAddressValid(true);
  }

  function handleAmountChange(value) {
    setWithdrawAmount(value);
    validateAmount(value);
  }

  function validateAmount(amount) {
    if (!amount || Number.parseFloat(amount) === 0) {
      setAmountError('');
      return;
    }

    const numAmount = Number.parseFloat(amount);
    const balance = Number.parseFloat(selectedAccount?.balance || selectedCoin?.balance || 0);

    if (Number.isNaN(numAmount) || numAmount <= 0) {
      setAmountError('So tien khong hop le');
    } else if (numAmount < 10) {
      setAmountError('So tien toi thieu la 10 USDT');
    } else if (numAmount > 5000) {
      setAmountError('So tien toi da moi lan la 5000 USDT');
    } else if (numAmount > balance) {
      setAmountError('So du khong du');
    } else {
      setAmountError('');
    }
  }

  function handlePercentageAmount(percentage) {
    const balance = Number.parseFloat(selectedAccount?.balance || selectedCoin?.balance || 0);
    const amount = ((balance * percentage) / 100).toFixed(8);
    handleAmountChange(amount);
  }

  function handleAccountConfirm() {
    setShowAccountModal(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!isFormValid()) return;

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const token = await getAccessToken();
      if (!token) {
        setSubmitError(toErrorMessage('WALLET_UNAUTHORIZED'));
        return;
      }

      const response = await fetch('/api/v1/wallet/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'x-idempotency-key': `wd-${crypto.randomUUID()}`,
        },
        body: JSON.stringify({
          chain: 'bsc_testnet',
          symbol: selectedCoin?.symbol || 'USDT',
          toAddress: withdrawAddress,
          amount: withdrawAmount,
          accountType: selectedAccount?.type || 'funding',
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        setSubmitError(toErrorMessage(payload?.error?.code, payload?.error?.message));
        return;
      }

      setTransactionId(payload.transactionId || '--');
      setShowSuccessModal(true);
      await loadWithdrawHistory();
    } catch (error) {
      console.error('Failed to submit withdraw request', error);
      setSubmitError('Khong the gui yeu cau rut tien. Vui long thu lai.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function isFormValid() {
    return (
      selectedCoin &&
      selectedNetwork &&
      withdrawAddress &&
      addressValid &&
      withdrawAmount &&
      !amountError &&
      selectedAccount &&
      termsAgreed
    );
  }

  function handleSuccessClose() {
    setShowSuccessModal(false);
    setWithdrawAddress('');
    setWithdrawAmount('');
    setTermsAgreed(false);
    setAddressError('');
    setAddressValid(false);
    setAmountError('');
  }

  function handleViewHistory() {
    setShowSuccessModal(false);
    const historySection = document.getElementById('history-section');
    if (historySection) {
      historySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // Computed values
  const availableNetworks = selectedCoin ? MOCK_NETWORKS[selectedCoin.symbol] || [] : [];
  const networkFee = selectedNetwork ? selectedNetwork.fee : '0.00000000';
  const networkFeeUsd = selectedNetwork ? selectedNetwork.feeUsd : '0.00';
  const networkFeeSymbol = selectedNetwork?.feeSymbol || selectedCoin?.symbol || '';

  const receiveAmount = useMemo(() => {
    const amount = Number.parseFloat(withdrawAmount || '0');
    if (!withdrawAmount || amount <= 0 || amountError) return '0.00000000';
    return amount.toFixed(8);
  }, [withdrawAmount, amountError]);

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

      <main className="min-h-screen pt-24 px-4 pb-12 md:px-8 max-w-[1440px] mx-auto lg:ml-60">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight text-on-surface">Rut tien</h1>
            <a href="#help" className="text-sm text-primary font-semibold hover:underline flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">help</span>
              Trung tam ho tro
            </a>
          </div>
        </div>

        {submitError ? (
          <div className="mb-6 rounded-xl border border-error/30 bg-error-container/40 px-4 py-3 text-sm text-error">
            {submitError}
          </div>
        ) : null}

        <div>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
              <div className="space-y-6">
                <div className="bg-surface-container-lowest p-6 md:p-8 rounded-2xl shadow-[0_12px_32px_-4px_rgba(0,0,0,0.04)]">
                  <h3 className="text-lg font-bold text-on-surface mb-4">Buoc 1: Chon Coin</h3>
                  <CoinSelector coins={coins} selectedCoin={selectedCoin} onSelect={handleCoinSelect} />
                </div>

                {selectedCoin && (
                  <div className="bg-surface-container-lowest p-6 md:p-8 rounded-2xl shadow-[0_12px_32px_-4px_rgba(0,0,0,0.04)]">
                    <h3 className="text-lg font-bold text-on-surface mb-4">Buoc 2: Chon Network</h3>
                    <NetworkSelector
                      networks={availableNetworks}
                      selectedNetwork={selectedNetwork}
                      selectedCoin={selectedCoin}
                      onSelect={handleNetworkSelect}
                    />
                  </div>
                )}

                {selectedNetwork && (
                  <div className="bg-surface-container-lowest p-6 md:p-8 rounded-2xl shadow-[0_12px_32px_-4px_rgba(0,0,0,0.04)]">
                    <h3 className="text-lg font-bold text-on-surface mb-4">Buoc 3: Dia chi vi</h3>
                    <AddressInput value={withdrawAddress} onChange={handleAddressChange} error={addressError} valid={addressValid} />
                  </div>
                )}

                {addressValid && (
                  <div className="bg-surface-container-lowest p-6 md:p-8 rounded-2xl shadow-[0_12px_32px_-4px_rgba(0,0,0,0.04)]">
                    <h3 className="text-lg font-bold text-on-surface mb-4">Buoc 4: Chon tai khoan va so luong</h3>

                    <button
                      type="button"
                      onClick={() => setShowAccountModal(true)}
                      className="w-full mb-6 flex items-center justify-between px-4 py-3 bg-surface-container-low hover:bg-surface-container rounded-xl transition-colors"
                    >
                      {selectedAccount ? (
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-primary">wallet</span>
                          <div className="text-left">
                            <p className="font-bold text-on-surface text-sm">{selectedAccount.label}</p>
                            <p className="text-xs text-on-surface-variant">
                              {selectedAccount.balance} {selectedAccount.unit} ≈ ${selectedAccount.balanceUSDT}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-on-surface-variant text-sm">Chon tai khoan rut tien</span>
                      )}
                      <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
                    </button>

                    {selectedAccount && (
                      <AmountInput
                        value={withdrawAmount}
                        onChange={handleAmountChange}
                        error={amountError}
                        selectedCoin={selectedCoin}
                        selectedNetwork={selectedNetwork}
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

              <WithdrawSummaryCard
                selectedCoin={selectedCoin}
                selectedNetwork={selectedNetwork}
                withdrawAddress={withdrawAddress}
                selectedAccount={selectedAccount}
                withdrawAmount={withdrawAmount}
                amountError={amountError}
                networkFee={networkFee}
                networkFeeSymbol={networkFeeSymbol}
                receiveAmount={receiveAmount}
                termsAgreed={termsAgreed}
                onTermsChange={setTermsAgreed}
                isSubmitting={isSubmitting}
                isFormValid={isFormValid()}
              />
            </div>

            <AccountSelectionModal
              isOpen={showAccountModal}
              accounts={accounts}
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

        <div id="history-section" className="mt-16">
          <h2 className="text-2xl font-bold tracking-tight text-on-surface mb-6">Lich su rut tien</h2>

          <div className="bg-surface-container-lowest rounded-2xl shadow-[0_12px_32px_-4px_rgba(0,0,0,0.04)] overflow-hidden">
            {historyLoading ? (
              <div className="px-8 py-10 text-sm text-on-surface-variant">Dang tai lich su giao dich...</div>
            ) : (
              <>
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-container-low/30">
                        <th className="px-8 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest">Ngay gio</th>
                        <th className="px-8 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest">Coin</th>
                        <th className="px-8 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest text-right">So luong</th>
                        <th className="px-8 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest">Dia chi</th>
                        <th className="px-8 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest">Network</th>
                        <th className="px-8 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest">Trang thai</th>
                        <th className="px-8 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest text-right">Hanh dong</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/5">
                      {historyRows.map((tx, idx) => {
                        const statusUi = getStatusUi(tx.status);
                        return (
                          <tr key={`${tx.txHash || tx.date}-${idx}`} className="hover:bg-surface-container-low transition-colors">
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
                              <p className="font-bold text-on-surface">{tx.amount} {tx.coin}</p>
                            </td>
                            <td className="px-8 py-5">
                              <div className="flex items-center gap-2">
                                <p className="font-mono text-xs text-on-surface-variant">{tx.address}</p>
                              </div>
                            </td>
                            <td className="px-8 py-5">
                              <p className="text-sm text-on-surface-variant">{tx.network}</p>
                            </td>
                            <td className="px-8 py-5">
                              <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${statusUi.className}`}>{statusUi.label}</span>
                            </td>
                            <td className="px-8 py-5 text-right">
                              {tx.txHash ? (
                                <a
                                  className="text-primary font-bold text-sm hover:underline"
                                  href={`https://testnet.bscscan.com/tx/${tx.txHash}`}
                                  rel="noreferrer"
                                  target="_blank"
                                >
                                  TxHash
                                </a>
                              ) : (
                                <span className="text-on-surface-variant text-sm">--</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="md:hidden space-y-4 p-4">
                  {historyRows.map((tx, idx) => {
                    const statusUi = getStatusUi(tx.status);
                    return (
                      <div key={`${tx.txHash || tx.date}-${idx}`} className="bg-surface-container-low p-4 rounded-xl">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-primary-container/20 flex items-center justify-center">
                              <span className="text-xs font-bold text-primary">{tx.coin.charAt(0)}</span>
                            </div>
                            <p className="font-bold text-on-surface">{tx.coin}</p>
                          </div>
                          <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${statusUi.className}`}>{statusUi.label}</span>
                        </div>
                        <p className="text-xs text-on-surface-variant mb-2">{tx.date}</p>
                        <p className="text-lg font-bold text-on-surface mb-3">{tx.amount} {tx.coin}</p>
                        <div className="space-y-1">
                          <p className="text-xs text-on-surface-variant">Network: {tx.network}</p>
                          <p className="text-xs text-on-surface-variant font-mono">Dia chi: {tx.address}</p>
                        </div>
                        {tx.txHash ? (
                          <a
                            className="text-primary font-bold text-sm hover:underline mt-3 inline-block"
                            href={`https://testnet.bscscan.com/tx/${tx.txHash}`}
                            rel="noreferrer"
                            target="_blank"
                          >
                            TxHash →
                          </a>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
