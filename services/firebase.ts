// services/firebase.ts
// Firebase client initialization for Expo app.

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

let firebaseApp: FirebaseApp | null = null;
let firebaseAuth: Auth | null = null;
let firebaseFirestore: Firestore | null = null;
let firebaseStorage: FirebaseStorage | null = null;

export function initializeFirebaseApp(config?: {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  measurementId?: string;
}) {
  if (firebaseApp) return firebaseApp;

  const envConfig = config ?? {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID,
  } as any;

  if (!getApps().length) {
    firebaseApp = initializeApp(envConfig);
  } else {
    firebaseApp = getApps()[0];
  }

  // Initialize services
  firebaseAuth = getAuth(firebaseApp);
  firebaseFirestore = getFirestore(firebaseApp);
  firebaseStorage = getStorage(firebaseApp);

  // Enable offline persistence (web / IndexedDB). On React Native this will be a no-op
  // but put the call in a try/catch to avoid runtime errors on platforms that do not support it.
  (async () => {
    try {
      // @ts-ignore
      await enableIndexedDbPersistence(firebaseFirestore as Firestore);
      // If successful, multi-tab persistence enabled.
    } catch (e) {
      // If persistence cannot be enabled (e.g., in React Native environment), we'll ignore and continue.
      // Typical runtime: 'failed-precondition' or 'unimplemented'
      // eslint-disable-next-line no-console
      console.warn('[firebase] enableIndexedDbPersistence failed or not supported:', e?.message ?? e);
    }
  })();

  return firebaseApp;
}

export function getAppAuth(): Auth {
  if (!firebaseApp) initializeFirebaseApp();
  if (!firebaseAuth) firebaseAuth = getAuth(firebaseApp as FirebaseApp);
  return firebaseAuth as Auth;
}

export function getAppFirestore(): Firestore {
  if (!firebaseApp) initializeFirebaseApp();
  if (!firebaseFirestore) firebaseFirestore = getFirestore(firebaseApp as FirebaseApp);
  return firebaseFirestore as Firestore;
}

export function getAppStorage(): FirebaseStorage {
  if (!firebaseApp) initializeFirebaseApp();
  if (!firebaseStorage) firebaseStorage = getStorage(firebaseApp as FirebaseApp);
  return firebaseStorage as FirebaseStorage;
}
