'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ROUTES } from '@/shared/config/routes';
import { supabase } from '@/shared/lib/supabase/client';

const sidebarItems = [
  { key: 'dashboard', icon: 'dashboard', label: 'Bảng điều khiển', href: ROUTES.profile },
  { key: 'security', icon: 'shield', label: 'Bảo mật', href: ROUTES.profile },
  { key: 'support', icon: 'help', label: 'Hỗ trợ', href: ROUTES.profile },
  { key: 'settings', icon: 'settings', label: 'Cài đặt', href: ROUTES.profile },
];

/**
 * Get profile visual (avatar + initial)
 */
function getProfileVisual(session) {
  const user = session?.user;
  if (!user) {
    return { avatarUrl: '', initial: 'U' };
  }

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

export default function ProfileDropdown() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [profileVisual, setProfileVisual] = useState({ avatarUrl: '', initial: 'U' });
  const dropdownRef = useRef(null);
  const closeTimerRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      const { data } = await supabase.auth.getSession();
      if (!isMounted) return;
      const session = data?.session || null;
      setProfileVisual(getProfileVisual(session));
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setProfileVisual(getProfileVisual(session || null));
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

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

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  function openDropdownPreview() {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setIsOpen(true);
  }

  function scheduleCloseDropdown() {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
    }
    closeTimerRef.current = setTimeout(() => {
      setIsOpen(false);
      closeTimerRef.current = null;
    }, 120);
  }

  function handleGoToProfile() {
    setIsOpen(false);
    router.push(ROUTES.profile);
  }

  async function handleLogout() {
    setIsOpen(false);
    await supabase.auth.signOut();
    router.push(ROUTES.login);
  }

  function handleNavigateToSection(item) {
    setIsOpen(false);
    router.push(item.href);
    // Scroll to section after navigation (if on profile page)
    setTimeout(() => {
      const sectionId = `profile-${item.key}`;
      const target = document.getElementById(sectionId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  return (
    <div className="relative" onMouseEnter={openDropdownPreview} onMouseLeave={scheduleCloseDropdown} ref={dropdownRef}>
      {/* Profile Button */}
      <button
        aria-label="Hồ sơ người dùng"
        className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-[#bbcac1]/40 bg-surface-container-low text-[#3c4a43] transition-colors hover:bg-surface-container-high"
        onClick={handleGoToProfile}
        title="Hồ sơ"
        type="button"
      >
        {profileVisual.avatarUrl ? (
          <img alt="User avatar" className="h-full w-full object-cover" referrerPolicy="no-referrer" src={profileVisual.avatarUrl} />
        ) : (
          <span className="text-xs font-bold uppercase">{profileVisual.initial}</span>
        )}
      </button>

      {/* Dropdown Popup */}
      {isOpen && (
        <div
          className="absolute right-0 top-full w-[320px] rounded-2xl border border-[#bbcac1]/20 bg-white shadow-[0_12px_32px_rgba(0,0,0,0.08)] backdrop-blur-xl"
          onMouseEnter={openDropdownPreview}
        >
          {/* Header */}
          <div className="border-b border-[#bbcac1]/15 px-6 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#3c4a43]">Hồ sơ</h3>
              <button
                className="text-xs font-semibold text-[#01bc8d] transition-colors hover:text-[#006c4f]"
                onClick={handleGoToProfile}
                type="button"
              >
                Xem chi tiết
              </button>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="px-3 py-3">
            <nav className="space-y-1">
              {sidebarItems.map((item) => (
                <button
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container-lowest"
                  key={item.key}
                  onClick={() => handleNavigateToSection(item)}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[20px] text-[#64748b]">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Logout Button */}
          <div className="border-t border-[#bbcac1]/15 px-6 py-4">
            <button
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#f2f4f6] px-4 py-2.5 text-xs font-bold text-[#3c4a43] transition-all hover:bg-[#e6e8ea] active:scale-95"
              onClick={handleLogout}
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              Đăng xuất
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
