import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

function getFirebaseConfig() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error('Missing Firebase Admin credentials in server environment');
  }

  return { projectId, clientEmail, privateKey };
}

export function getFirebaseAuth() {
  if (!getApps().length) {
    initializeApp({
      credential: cert(getFirebaseConfig()),
    });
  }
  return getAuth();
}

export async function applyEmailVerificationCode(oobCode) {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) {
    throw new Error('Missing NEXT_PUBLIC_FIREBASE_API_KEY for verification callback');
  }

  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:update?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ oobCode }),
  });

  const data = await response.json();

  if (!response.ok) {
    const message = data?.error?.message || 'UNKNOWN';
    throw new Error(message);
  }

  return data;
}
