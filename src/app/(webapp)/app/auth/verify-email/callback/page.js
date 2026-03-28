'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { getFirebaseClientAuth } from '@/shared/lib/firebaseClient';
import { isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';

const CALLBACK_ERROR_MESSAGES = {
  AUTH_INVALID_INPUT: 'Liên kết xác minh không hợp lệ. Vui lòng thử lại từ email mới.',
  AUTH_VERIFICATION_LINK_INVALID: 'Liên kết xác minh không hợp lệ. Vui lòng yêu cầu gửi lại email xác minh.',
  AUTH_VERIFICATION_LINK_EXPIRED: 'Liên kết xác minh đã hết hạn. Vui lòng đăng ký hoặc đăng nhập để gửi lại email xác minh.',
  AUTH_INVALID_TOKEN: 'Không thể đồng bộ phiên đăng nhập. Vui lòng đăng nhập lại để tiếp tục.',
  AUTH_EMAIL_NOT_VERIFIED: 'Email chưa được xác minh đầy đủ. Vui lòng mở lại đúng liên kết xác minh trong email.',
  AUTH_RATE_LIMITED: 'Bạn thao tác quá nhanh. Vui lòng thử lại sau ít phút.',
  AUTH_PROVIDER_TEMPORARY_FAILURE: 'Hệ thống xác thực đang tạm thời gián đoạn, vui lòng thử lại.',
  AUTH_INTERNAL_ERROR: 'Đã có lỗi hệ thống. Vui lòng thử lại sau.',
};

function getErrorMessage(errorCode, fallbackMessage) {
  if (errorCode && CALLBACK_ERROR_MESSAGES[errorCode]) {
    return CALLBACK_ERROR_MESSAGES[errorCode];
  }
  return fallbackMessage || CALLBACK_ERROR_MESSAGES.AUTH_INTERNAL_ERROR;
}

export default function VerifyEmailCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState('verifying');
  const [errorMessage, setErrorMessage] = useState('');

  const runVerificationFlow = useCallback(async () => {
    const oobCode = new URLSearchParams(window.location.search).get('oobCode');
    if (!oobCode) {
      setStatus('error');
      setErrorMessage(CALLBACK_ERROR_MESSAGES.AUTH_INVALID_INPUT);
      return;
    }

    setStatus('verifying');
    setErrorMessage('');

    try {
      const verifyResponse = await fetch(`/api/v1/auth/verify-email/callback?oobCode=${encodeURIComponent(oobCode)}`, {
        method: 'GET',
      });
      const verifyPayload = await verifyResponse.json().catch(() => ({}));

      if (!verifyResponse.ok) {
        setStatus('error');
        setErrorMessage(getErrorMessage(verifyPayload?.error?.code, verifyPayload?.error?.message));
        return;
      }

      setStatus('syncing');
      const auth = getFirebaseClientAuth();
      const fullLink = window.location.href;
      const emailFromStorage = window.localStorage.getItem('ryex_pending_verify_email') || '';
      const emailFromQuery = new URLSearchParams(window.location.search).get('email') || '';
      const signInEmail = emailFromStorage || emailFromQuery;

      if (isSignInWithEmailLink(auth, fullLink) && signInEmail) {
        await signInWithEmailLink(auth, signInEmail, fullLink);
      }

      const idToken = await auth.currentUser?.getIdToken(true);

      if (!idToken) {
        setStatus('error');
        setErrorMessage(CALLBACK_ERROR_MESSAGES.AUTH_INVALID_TOKEN);
        return;
      }

      let deviceId = typeof window !== 'undefined' ? window.localStorage.getItem('ryex_device_id') || '' : '';
      if (typeof window !== 'undefined' && !deviceId) {
        deviceId = crypto.randomUUID();
        window.localStorage.setItem('ryex_device_id', deviceId);
      }
      const rememberDevice =
        typeof window !== 'undefined' && window.localStorage.getItem('ryex_remember_device') === '1';

      const syncResponse = await fetch('/api/v1/auth/session/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          idToken,
          deviceId: deviceId || undefined,
          rememberDevice,
        }),
      });
      const syncPayload = await syncResponse.json().catch(() => ({}));

      if (!syncResponse.ok) {
        setStatus('error');
        setErrorMessage(getErrorMessage(syncPayload?.error?.code, syncPayload?.error?.message));
        return;
      }

      if (syncPayload.deviceId && typeof window !== 'undefined') {
        window.localStorage.setItem('ryex_device_id', syncPayload.deviceId);
      }

      window.localStorage.removeItem('ryex_pending_verify_email');
      setStatus('success');
      router.replace('/app/market');
    } catch {
      setStatus('error');
      setErrorMessage(CALLBACK_ERROR_MESSAGES.AUTH_INTERNAL_ERROR);
    }
  }, [router]);

  useEffect(() => {
    runVerificationFlow();
  }, [runVerificationFlow]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface p-6 text-on-surface">
      <div className="w-full max-w-xl rounded-2xl bg-surface-container-low p-8 shadow-sm">
        <h1 className="text-2xl font-bold">Xác minh email</h1>
        {status === 'verifying' ? <p className="mt-3 text-on-surface-variant">Đang xác minh email của bạn...</p> : null}
        {status === 'syncing' ? <p className="mt-3 text-on-surface-variant">Đang đồng bộ phiên đăng nhập...</p> : null}
        {status === 'success' ? <p className="mt-3 text-on-surface-variant">Xác minh thành công, đang chuyển hướng...</p> : null}

        {status === 'error' ? (
          <div className="mt-4 space-y-4">
            <p className="text-error">{errorMessage}</p>
            <div className="flex flex-wrap gap-3">
              <button className="rounded-xl px-4 py-2 font-semibold text-white liquidity-gradient" onClick={runVerificationFlow} type="button">
                Thử lại
              </button>
              <Link className="rounded-xl border border-outline-variant/30 px-4 py-2 font-semibold text-on-surface" href="/app/auth/login">
                Về trang đăng nhập
              </Link>
              <Link className="rounded-xl border border-outline-variant/30 px-4 py-2 font-semibold text-on-surface" href="/app/auth/signup">
                Về trang đăng ký
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
