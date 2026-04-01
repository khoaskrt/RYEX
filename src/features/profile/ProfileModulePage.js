'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/supabaseClient';
import { LoginHistoryCard } from './components/LoginHistoryCard';
import { ProfileSidebar } from './components/ProfileSidebar';
import { ProfileSummaryCard } from './components/ProfileSummaryCard';
import { SecurityCard } from './components/SecurityCard';
import { SupportColumn } from './components/SupportColumn';

const FALLBACK_PROFILE = {
  id: '',
  email: '',
  emailMasked: 'kho***@gmail.com',
  displayName: 'Người dùng RYEX',
  status: 'pending_email_verification',
  kycStatus: 'not_started',
  emailVerified: false,
  uid: '217012742',
  memberSince: '12/05/2023',
};

const DEFAULT_PROFILE_VISUAL = {
  avatarUrl: '',
  initial: 'U',
};

const FALLBACK_LOGIN_ROWS = [
  { time: '20/10/2023 14:22:10', ip: '113.161.x.xxx', device: 'Chrome / MacOS', location: 'Hồ Chí Minh, VN', isSuspicious: false },
  { time: '19/10/2023 09:15:44', ip: '14.226.x.xxx', device: 'App / iOS', location: 'Hà Nội, VN', isSuspicious: true },
  { time: '18/10/2023 22:05:12', ip: '113.161.x.xxx', device: 'Chrome / MacOS', location: 'Hồ Chí Minh, VN', isSuspicious: false },
];

const SECTION_ID_BY_SIDEBAR_KEY = {
  dashboard: 'profile-dashboard',
  security: 'profile-security',
  support: 'profile-support',
  settings: 'profile-settings',
};

function maskEmail(email = '') {
  const [name = '', domain = ''] = String(email).split('@');
  if (!name || !domain) return FALLBACK_PROFILE.emailMasked;
  const visible = name.slice(0, 3);
  return `${visible}***@${domain}`;
}

function formatMemberSince(value) {
  if (!value) return FALLBACK_PROFILE.memberSince;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return FALLBACK_PROFILE.memberSince;
  return date.toLocaleDateString('vi-VN');
}

function formatLoginTime(value) {
  if (!value) return '--';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--';
  return date.toLocaleString('vi-VN', { hour12: false, timeZone: 'Asia/Ho_Chi_Minh' });
}

function parseDevice(userAgent = '') {
  const ua = String(userAgent).toLowerCase();
  if (!ua) return 'Unknown';
  if (ua.includes('iphone') || ua.includes('ios')) return 'App / iOS';
  if (ua.includes('android')) return 'App / Android';
  if (ua.includes('safari') && ua.includes('mac')) return 'Safari / MacOS';
  if (ua.includes('chrome') && ua.includes('mac')) return 'Chrome / MacOS';
  if (ua.includes('chrome') && ua.includes('windows')) return 'Chrome / Windows';
  if (ua.includes('firefox')) return 'Firefox';
  return 'Web / Browser';
}

function extractLocation(metadata) {
  if (!metadata || typeof metadata !== 'object') return 'N/A';
  if (typeof metadata.location === 'string' && metadata.location.trim()) return metadata.location;
  if (typeof metadata.city === 'string' && metadata.city.trim()) return metadata.city;
  return 'N/A';
}

function deriveDisplayName(user) {
  const userMeta = user?.user_metadata || {};
  const fromMeta = String(userMeta.full_name || userMeta.name || userMeta.display_name || '').trim();
  if (fromMeta) return fromMeta;

  const email = String(user?.email || '').trim();
  if (!email.includes('@')) return FALLBACK_PROFILE.displayName;
  return email.split('@')[0];
}

function mapProfileFromSession(session) {
  if (!session?.user) return FALLBACK_PROFILE;
  const user = session.user;
  return {
    id: String(user.id || ''),
    email: String(user.email || ''),
    emailMasked: maskEmail(user.email),
    displayName: deriveDisplayName(user),
    status: FALLBACK_PROFILE.status,
    kycStatus: FALLBACK_PROFILE.kycStatus,
    emailVerified: Boolean(user.email_confirmed_at),
    uid: String(user.id || FALLBACK_PROFILE.uid).slice(0, 12),
    memberSince: formatMemberSince(user.created_at),
  };
}

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

function mapLoginRows(rows) {
  return rows.map((row, index) => {
    const previousRow = index > 0 ? rows[index - 1] : null;
    const previousIp = previousRow?.ip || '';
    const previousDevice = parseDevice(previousRow?.user_agent || '');
    const currentDevice = parseDevice(row.user_agent);
    const ipChanged = Boolean(previousIp) && previousIp !== (row.ip || '');
    const deviceChanged = Boolean(previousDevice) && previousDevice !== currentDevice;
    const hasFailedResult = String(row.result || '').toLowerCase() === 'failed';

    return {
      time: formatLoginTime(row.occurred_at),
      ip: row.ip || 'N/A',
      device: currentDevice,
      location: extractLocation(row.metadata),
      isSuspicious: hasFailedResult || (ipChanged && deviceChanged),
    };
  });
}

export function ProfileModulePage() {
  const [currentSession, setCurrentSession] = useState(null);
  const [profile, setProfile] = useState(FALLBACK_PROFILE);
  const [profileVisual, setProfileVisual] = useState(DEFAULT_PROFILE_VISUAL);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState('');
  const [displayNameDraft, setDisplayNameDraft] = useState(FALLBACK_PROFILE.displayName);
  const [displayNameError, setDisplayNameError] = useState('');
  const [displayNameSuccess, setDisplayNameSuccess] = useState('');
  const [isSavingDisplayName, setIsSavingDisplayName] = useState(false);
  const [loginRows, setLoginRows] = useState(FALLBACK_LOGIN_ROWS);
  const [loginLoading, setLoginLoading] = useState(true);
  const [loginError, setLoginError] = useState('');
  const [activeSidebarKey, setActiveSidebarKey] = useState('dashboard');

  const loadProfile = useCallback(async (session) => {
    setProfileLoading(true);
    setProfileError('');

    try {
      const accessToken = session?.access_token;
      if (!accessToken) {
        const fallbackProfile = mapProfileFromSession(session);
        setProfile(fallbackProfile);
        setDisplayNameDraft(fallbackProfile.displayName);
        return;
      }

      const response = await fetch('/api/v1/user/profile', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Profile API failed with status ${response.status}`);
      }

      const payload = await response.json();
      const user = payload?.user || {};
      const fallbackFromSession = mapProfileFromSession(session);
      const email = String(user.email || session?.user?.email || fallbackFromSession.email);
      const displayName = String(user.displayName || fallbackFromSession.displayName || '').trim() || fallbackFromSession.displayName;

      setProfile({
        id: String(user.id || fallbackFromSession.id),
        email,
        emailMasked: maskEmail(email),
        displayName,
        status: String(user.status || fallbackFromSession.status || FALLBACK_PROFILE.status),
        kycStatus: String(user.kycStatus || fallbackFromSession.kycStatus || FALLBACK_PROFILE.kycStatus),
        emailVerified: Boolean(
          typeof user.emailVerified === 'boolean' ? user.emailVerified : fallbackFromSession.emailVerified
        ),
        uid: String(user.id || fallbackFromSession.uid).slice(0, 12),
        memberSince: formatMemberSince(user.createdAt || session?.user?.created_at),
      });
      setDisplayNameDraft(displayName);
      setDisplayNameError('');
      setDisplayNameSuccess('');
    } catch {
      setProfileError('Không thể đồng bộ hồ sơ từ API. Đang hiển thị dữ liệu phiên đăng nhập.');
      const fallbackProfile = mapProfileFromSession(session);
      setProfile(fallbackProfile);
      setDisplayNameDraft(fallbackProfile.displayName);
    } finally {
      setProfileLoading(false);
    }
  }, []);

  const loadLoginHistory = useCallback(async (session) => {
    setLoginLoading(true);
    setLoginError('');

    try {
      const email = session?.user?.email;
      if (!email) {
        setLoginRows([]);
        return;
      }

      const { data, error } = await supabase
        .from('auth_login_events')
        .select('occurred_at, ip, user_agent, metadata, result')
        .eq('email', email)
        .order('occurred_at', { ascending: false })
        .limit(50);

      if (error) {
        throw error;
      }

      if (!Array.isArray(data) || data.length === 0) {
        setLoginRows([]);
        return;
      }

      setLoginRows(mapLoginRows(data));
    } catch {
      setLoginError('Không thể tải lịch sử đăng nhập từ API. Đang hiển thị dữ liệu mẫu.');
      setLoginRows(FALLBACK_LOGIN_ROWS);
    } finally {
      setLoginLoading(false);
    }
  }, []);

  const handleSaveDisplayName = useCallback(async () => {
    const trimmedName = String(displayNameDraft || '').trim();
    setDisplayNameSuccess('');

    if (!trimmedName) {
      setDisplayNameError('Tên hiển thị không được để trống.');
      return;
    }
    if (trimmedName.length < 2) {
      setDisplayNameError('Tên hiển thị cần ít nhất 2 ký tự.');
      return;
    }
    if (trimmedName.length > 60) {
      setDisplayNameError('Tên hiển thị tối đa 60 ký tự.');
      return;
    }

    const accessToken = currentSession?.access_token;
    if (!accessToken) {
      setDisplayNameError('Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.');
      return;
    }

    setDisplayNameError('');
    setIsSavingDisplayName(true);

    const previousDisplayName = profile.displayName;
    setProfile((prev) => ({
      ...prev,
      displayName: trimmedName,
    }));

    try {
      const response = await fetch('/api/v1/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ displayName: trimmedName }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.error || `Update failed (${response.status})`);
      }

      const updatedName = String(payload?.user?.displayName || trimmedName).trim() || trimmedName;
      setProfile((prev) => ({
        ...prev,
        displayName: updatedName,
        status: String(payload?.user?.status || prev.status),
        kycStatus: String(payload?.user?.kycStatus || prev.kycStatus),
      }));
      setDisplayNameDraft(updatedName);
      setDisplayNameSuccess('Đã cập nhật tên hiển thị.');
    } catch (error) {
      setProfile((prev) => ({
        ...prev,
        displayName: previousDisplayName,
      }));
      setDisplayNameError(error instanceof Error ? error.message : 'Không thể cập nhật tên hiển thị.');
    } finally {
      setIsSavingDisplayName(false);
    }
  }, [currentSession?.access_token, displayNameDraft, profile.displayName]);

  const handleSidebarNavigate = useCallback((key) => {
    const sectionId = SECTION_ID_BY_SIDEBAR_KEY[key];
    if (!sectionId) return;
    setActiveSidebarKey(key);
    const target = document.getElementById(sectionId);
    if (!target) return;
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const hydrateData = useCallback(
    async (session) => {
      setProfileVisual(getProfileVisual(session));
      await Promise.all([loadProfile(session), loadLoginHistory(session)]);
    },
    [loadLoginHistory, loadProfile]
  );

  useEffect(() => {
    let isMounted = true;

    async function bootstrapSession() {
      const { data } = await supabase.auth.getSession();
      if (!isMounted) return;
      const nextSession = data?.session || null;
      setCurrentSession(nextSession);
      hydrateData(nextSession);
    }

    bootstrapSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setCurrentSession(session || null);
      await hydrateData(session || null);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [hydrateData]);

  useEffect(() => {
    function syncActiveSection() {
      const entries = Object.entries(SECTION_ID_BY_SIDEBAR_KEY)
        .map(([key, sectionId]) => {
          const element = document.getElementById(sectionId);
          if (!element) return null;
          const rect = element.getBoundingClientRect();
          return { key, top: rect.top };
        })
        .filter(Boolean);

      if (entries.length === 0) return;
      const visibleCandidate = entries
        .filter((entry) => entry.top <= 180)
        .sort((a, b) => b.top - a.top)[0];
      const fallbackTop = entries.sort((a, b) => Math.abs(a.top) - Math.abs(b.top))[0];
      const nextActive = visibleCandidate?.key || fallbackTop?.key || 'dashboard';
      setActiveSidebarKey(nextActive);
    }

    syncActiveSection();
    window.addEventListener('scroll', syncActiveSection, { passive: true });
    window.addEventListener('resize', syncActiveSection);
    return () => {
      window.removeEventListener('scroll', syncActiveSection);
      window.removeEventListener('resize', syncActiveSection);
    };
  }, []);

  return (
    <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen bg-surface text-on-surface antialiased">
      <nav className="fixed top-0 z-50 w-full border-b border-[#bbcac1]/15 bg-[#f7f9fb]/80 shadow-[0_12px_32px_rgba(0,0,0,0.04)] backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-[1920px] items-center justify-between px-8">
          <div className="flex items-center gap-10">
            <Link className="text-2xl font-black tracking-tighter text-[#006c4f]" href="/">
              RYEX
            </Link>
            <div className="hidden h-full items-center gap-8 md:flex">
              <Link className="flex h-full items-center pb-1 font-medium text-[#3c4a43] transition-colors hover:text-[#01bc8d]" href="/app/market">
                Thị trường
              </Link>
              <div className="group relative flex h-full items-center">
                <button className="flex h-full items-center gap-1 text-[#3c4a43] transition-colors group-hover:text-[#01bc8d]" type="button">
                  Giao dịch
                  <span className="material-symbols-outlined text-[20px] transition-transform group-hover:rotate-180">expand_more</span>
                </button>
                <div className="absolute left-0 top-16 hidden w-[380px] overflow-hidden rounded-2xl border border-[#bbcac1]/20 bg-surface-container-lowest py-2 shadow-[0_24px_48px_rgba(0,0,0,0.1)] group-hover:block">
                  <a className="flex items-start gap-4 p-4 transition-colors hover:bg-surface-container-low" href="#">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-container/10 text-primary">
                      <span className="material-symbols-outlined">sync</span>
                    </div>
                    <div>
                      <div className="font-bold text-on-surface">Chuyển đổi</div>
                      <div className="text-sm leading-tight text-on-surface-variant">Cách đơn giản nhất để giao dịch</div>
                    </div>
                  </a>
                  <a className="flex items-start gap-4 p-4 transition-colors hover:bg-surface-container-low" href="#">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-container/10 text-primary">
                      <span className="material-symbols-outlined">analytics</span>
                    </div>
                    <div>
                      <div className="font-bold text-on-surface">Giao dịch giao ngay</div>
                      <div className="text-sm leading-tight text-on-surface-variant">Giao dịch tiền điện tử với các công cụ toàn diện</div>
                    </div>
                  </a>
                  <a className="flex items-start gap-4 p-4 transition-colors hover:bg-surface-container-low" href="#">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-container/10 text-primary">
                      <span className="material-symbols-outlined">group</span>
                    </div>
                    <div>
                      <div className="font-bold text-on-surface">Giao dịch P2P</div>
                      <div className="text-sm leading-tight text-on-surface-variant">
                        Từ các thương gia đã được xác minh, sử dụng nhiều phương thức thanh toán nội địa
                      </div>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm font-semibold text-[#3c4a43] md:inline">{profile.emailMasked}</span>
            <Link
              aria-label="Hồ sơ người dùng"
              className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-[#bbcac1]/40 bg-surface-container-low text-[#3c4a43] transition-colors hover:bg-surface-container-high"
              href="/app/profile"
              title="Hồ sơ"
            >
              {profileVisual.avatarUrl ? (
                <img alt="User avatar" className="h-full w-full object-cover" referrerPolicy="no-referrer" src={profileVisual.avatarUrl} />
              ) : (
                <span className="text-xs font-bold uppercase">{profileVisual.initial}</span>
              )}
            </Link>
          </div>
        </div>
      </nav>

      <main className="mx-auto min-h-screen w-full max-w-[1920px] px-8 pb-16 pt-24">
        {profileError ? (
          <div className="mb-4 rounded-lg border border-error/20 bg-error-container/50 px-4 py-3">
            <p className="text-xs font-semibold text-error">{profileError}</p>
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
          <ProfileSidebar activeKey={activeSidebarKey} onNavigate={handleSidebarNavigate} />

          <div className="space-y-8">
            <section id={SECTION_ID_BY_SIDEBAR_KEY.dashboard}>
              <ProfileSummaryCard
                displayNameDraft={displayNameDraft}
                displayNameError={displayNameError}
                displayNameSuccess={displayNameSuccess}
                isSavingDisplayName={isSavingDisplayName}
                loading={profileLoading}
                onDisplayNameChange={(value) => {
                  setDisplayNameDraft(value);
                  setDisplayNameError('');
                  setDisplayNameSuccess('');
                }}
                onSaveDisplayName={handleSaveDisplayName}
                profile={profile}
                profileVisual={profileVisual}
              />
            </section>

            <section className="grid grid-cols-1 gap-8 xl:grid-cols-3">
              <div className="space-y-8 xl:col-span-2">
                <div id={SECTION_ID_BY_SIDEBAR_KEY.security}>
                  <SecurityCard />
                </div>
                <LoginHistoryCard
                  error={loginError}
                  loading={loginLoading}
                  onRetry={() => loadLoginHistory(currentSession)}
                  rows={loginRows}
                  sectionId="profile-login-history"
                />
              </div>
              <SupportColumn
                settingsSectionId={SECTION_ID_BY_SIDEBAR_KEY.settings}
                supportSectionId={SECTION_ID_BY_SIDEBAR_KEY.support}
              />
            </section>
          </div>
        </div>
      </main>

      <footer className="mt-auto w-full bg-[#f2f4f6] px-8 py-12">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 md:grid-cols-2">
          <div className="space-y-4">
            <span className="text-lg font-bold text-[#3c4a43]">RYEX Markets</span>
            <p className="text-sm leading-relaxed text-[#3c4a43]">
              © 2024 RYEX Markets. Được cấp phép và điều hành bởi Cơ quan Quản lý Tài chính Việt Nam. Sàn giao dịch tài sản số uy tín
              và bảo mật hàng đầu cho các nhà đầu tư tổ chức và cá nhân.
            </p>
          </div>
          <div className="flex flex-wrap justify-start gap-6 md:justify-end">
            {['Điều khoản', 'Bảo mật', 'Cấp phép', 'Rủi ro', 'Hỗ trợ'].map((item) => (
              <a className="text-sm text-[#3c4a43] transition-colors duration-200 hover:text-[#01bc8d]" href="#" key={item}>
                {item}
              </a>
            ))}
          </div>
        </div>
        <div className="mx-auto mt-8 max-w-7xl border-t border-[#e6e8ea] pt-8">
          <p className="max-w-4xl text-[10px] leading-normal text-on-surface-variant/60">
            Cảnh báo rủi ro: Đầu tư vào tài sản số mang lại rủi ro đáng kể và có thể dẫn đến việc mất toàn bộ vốn đầu tư. Bạn nên cân
            nhắc tình hình tài chính, kinh nghiệm đầu tư và khẩu vị rủi ro trước khi bắt đầu giao dịch. Hiệu suất trong quá khứ không
            đảm bảo cho kết quả trong tương lai. RYEX không cung cấp lời khuyên đầu tư.
          </p>
        </div>
      </footer>
    </div>
  );
}
