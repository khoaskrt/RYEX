import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

let firebaseApp;

const REQUIRED_FIREBASE_ENV_KEYS = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
];

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || '',
};

function hasRequiredFirebaseConfig() {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId && firebaseConfig.appId);
}

function getMissingFirebaseEnvKeys() {
  return REQUIRED_FIREBASE_ENV_KEYS.filter((key) => !process.env[key]);
}

export function getFirebaseClientApp() {
  if (!hasRequiredFirebaseConfig()) {
    const missingKeys = getMissingFirebaseEnvKeys();
    const message = missingKeys.length
      ? `Missing required Firebase env vars: ${missingKeys.join(', ')}`
      : 'Missing required Firebase web config';
    throw new Error(message);
  }

  if (!firebaseApp) {
    firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
  }
  return firebaseApp;
}

export function getFirebaseClientAuth() {
  return getAuth(getFirebaseClientApp());
}
