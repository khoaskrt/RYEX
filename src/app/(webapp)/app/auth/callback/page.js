'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/shared/lib/supabase/client';

const DASHBOARD_ROUTE = '/app/market';
const LOGIN_ROUTE = '/app/auth/login';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState(null);

  useEffect(() => {
    async function handleCallback() {
      try {
        const { data, error: authError } = await supabase.auth.getSession();

        if (authError) {
          console.error('Auth callback error:', authError);
          setError(authError.message);
          setTimeout(() => {
            router.replace(LOGIN_ROUTE);
          }, 2000);
          return;
        }

        if (data?.session) {
          router.replace(DASHBOARD_ROUTE);
        } else {
          router.replace(LOGIN_ROUTE);
        }
      } catch (err) {
        console.error('Callback processing error:', err);
        setError('An unexpected error occurred');
        setTimeout(() => {
          router.replace(LOGIN_ROUTE);
        }, 2000);
      }
    }

    handleCallback();
  }, [router]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <div className="text-center">
          <p className="text-error mb-4">Đăng nhập thất bại: {error}</p>
          <p className="text-on-surface-variant">Đang chuyển hướng về trang đăng nhập...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface">
      <div className="text-center">
        <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-on-surface">Đang xử lý đăng nhập...</p>
      </div>
    </div>
  );
}
