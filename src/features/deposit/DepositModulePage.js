'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import LandingFooter from '@/shared/components/LandingFooter';
import FundingNavigationSidebar from '@/shared/components/FundingNavigationSidebar';
import FundingNavigationTabBar from '@/shared/components/FundingNavigationTabBar';
import { ROUTES } from '@/shared/config/routes';
import { supabase } from '@/shared/lib/supabase/client';
import { DepositHeroBanner } from './components/DepositHeroBanner';
import { DepositEntryPanel } from './components/DepositEntryPanel';
import { DepositSidebarPanel } from './components/DepositSidebarPanel';
import { DepositTopNav } from './components/DepositTopNav';
import { DEPOSIT_HISTORY_RECORDS, DEPOSIT_STATES, DEPOSIT_TOKENS } from './constants';

const DEFAULT_PROFILE_VISUAL = {
  avatarUrl: '',
  initial: 'U',
};

const STATUS_LABEL_MAP = {
  pending: 'Cho xu ly',
  confirming: 'Dang xac nhan',
  completed: 'Hoan thanh',
  failed: 'That bai',
};

const ERROR_COPY_MAP = {
  WALLET_UNAUTHORIZED: 'Phien dang nhap het han. Vui long dang nhap lai.',
  WALLET_UNSUPPORTED_CHAIN: 'Mang duoc chon hien khong duoc ho tro.',
  WALLET_UNSUPPORTED_SYMBOL: 'Tai san duoc chon hien khong duoc ho tro.',
  WALLET_CREATION_FAILED: 'Khong the tao dia chi nap luc nay. Vui long thu lai.',
  WALLET_FETCH_FAILED: 'Khong the lay dia chi nap luc nay. Vui long thu lai.',
  WALLET_TRANSACTIONS_FETCH_FAILED: 'Khong the tai lich su giao dich. Vui long thu lai.',
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

function mapHistoryRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) return [];
  return rows.map((item) => ({
    orderId: item.transactionId || '--',
    coin: item.symbol || 'USDT',
    amount: item.amount || '0.00000000',
    network: 'BSC Testnet',
    status: item.status || 'pending',
    timestamp: item.createdAt || new Date().toISOString(),
  }));
}

export function DepositModulePage() {
  const router = useRouter();
  const [isAuthResolved, setIsAuthResolved] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profileVisual, setProfileVisual] = useState(DEFAULT_PROFILE_VISUAL);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [selectedToken, setSelectedToken] = useState(DEPOSIT_TOKENS[0]);
  const [depositAddress, setDepositAddress] = useState('');
  const [minDeposit, setMinDeposit] = useState('1.00000000');
  const [isAddressLoading, setIsAddressLoading] = useState(false);
  const [addressError, setAddressError] = useState('');
  const [depositHistory, setDepositHistory] = useState(DEPOSIT_HISTORY_RECORDS);

  const currentStatus = useMemo(() => {
    const latest = depositHistory?.[0];
    if (!latest) return 'Cho xac nhan';
    return STATUS_LABEL_MAP[latest.status] || 'Cho xac nhan';
  }, [depositHistory]);

  useEffect(() => {
    let isMounted = true;

    async function bootstrapSession() {
      const { data } = await supabase.auth.getSession();
      if (!isMounted) return;
      const hasSession = Boolean(data.session);
      setIsAuthenticated(hasSession);
      setProfileVisual(hasSession ? getProfileVisual(data.session) : DEFAULT_PROFILE_VISUAL);
      setIsAuthResolved(true);
    }

    bootstrapSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const hasSession = Boolean(session);
      setIsAuthenticated(hasSession);
      setProfileVisual(hasSession ? getProfileVisual(session) : DEFAULT_PROFILE_VISUAL);
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
      await Promise.all([fetchDepositAddress(), fetchDepositHistory()]);
    }

    bootstrapWalletData();
  }, [isAuthResolved, isAuthenticated, selectedToken.symbol]);

  async function getAccessToken() {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.access_token || '';
  }

  async function fetchDepositAddress() {
    setIsAddressLoading(true);
    setAddressError('');

    try {
      const token = await getAccessToken();
      if (!token) {
        setAddressError(toErrorMessage('WALLET_UNAUTHORIZED'));
        return;
      }

      const response = await fetch(`/api/v1/wallet/deposit-address?chain=bsc_testnet`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const payload = await response.json();
      if (!response.ok) {
        if (payload?.error?.code === 'WALLET_NOT_FOUND') {
          setDepositAddress('');
          return;
        }

        setAddressError(toErrorMessage(payload?.error?.code, payload?.error?.message));
        return;
      }

      setDepositAddress(payload.address || '');
      setMinDeposit('1.00000000');
    } catch (error) {
      console.error('Failed to fetch deposit address', error);
      setAddressError('Khong the tai dia chi nap. Vui long thu lai.');
    } finally {
      setIsAddressLoading(false);
    }
  }

  async function createDepositAddress() {
    setIsAddressLoading(true);
    setAddressError('');

    try {
      const token = await getAccessToken();
      if (!token) {
        setAddressError(toErrorMessage('WALLET_UNAUTHORIZED'));
        return;
      }

      const response = await fetch('/api/v1/wallet/deposit-address', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          chain: 'bsc_testnet',
          symbol: selectedToken.symbol,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        setAddressError(toErrorMessage(payload?.error?.code, payload?.error?.message));
        return;
      }

      setDepositAddress(payload.address || '');
      setMinDeposit('1.00000000');
    } catch (error) {
      console.error('Failed to create deposit address', error);
      setAddressError('Khong the tao dia chi nap. Vui long thu lai.');
    } finally {
      setIsAddressLoading(false);
    }
  }

  async function fetchDepositHistory() {
    try {
      const token = await getAccessToken();
      if (!token) return;

      const response = await fetch('/api/v1/wallet/transactions?type=deposit&status=all&limit=20&offset=0', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const payload = await response.json();
      if (!response.ok) {
        return;
      }

      const mapped = mapHistoryRows(payload.transactions);
      setDepositHistory(mapped.length > 0 ? mapped : []);
    } catch (error) {
      console.error('Failed to fetch deposit history', error);
    }
  }

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await supabase.auth.signOut();
      router.replace(ROUTES.login);
    } finally {
      setIsLoggingOut(false);
    }
  }

  if (!isAuthResolved) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface text-on-surface">
        <p className="text-sm text-on-surface-variant">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen bg-surface text-on-surface antialiased">
      <DepositTopNav
        isAuthenticated={isAuthenticated}
        isLoggingOut={isLoggingOut}
        onLogout={handleLogout}
        profileVisual={profileVisual}
      />

      <FundingNavigationSidebar />
      <FundingNavigationTabBar />

      <main className="mx-auto min-h-screen w-full max-w-[1440px] px-4 pb-12 pt-24 sm:px-6 lg:px-8 lg:ml-60">
        <DepositHeroBanner />

        <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <DepositEntryPanel
            tokens={DEPOSIT_TOKENS}
            selectedToken={selectedToken}
            onSelectToken={setSelectedToken}
            depositAddress={depositAddress}
            isAddressLoading={isAddressLoading}
            addressError={addressError}
            onCreateAddress={createDepositAddress}
            onRefreshAddress={fetchDepositAddress}
          />
          <DepositSidebarPanel
            depositHistory={depositHistory}
            selectedToken={selectedToken}
            states={DEPOSIT_STATES}
            minDeposit={minDeposit}
            currentStatus={currentStatus}
          />
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
