/**
 * SONA AI — Firebase Configuration
 *
 * Centralized Firebase initialization for the entire application.
 * Uses the Firebase JS SDK which is compatible with Expo managed workflow.
 *
 * Services initialized:
 *  - Firebase Auth (Email/Password, Google, Anonymous)
 *  - Cloud Firestore
 *  - Firebase Storage
 *  - Firebase Cloud Messaging (web only; mobile uses expo-notifications)
 */

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  initializeAuth,
  Auth,
} from 'firebase/auth';
// @ts-ignore - getReactNativePersistence is available in firebase/auth
import { getReactNativePersistence } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

/**
 * Initialize or retrieve the Firebase app singleton.
 */
function getFirebaseApp(): FirebaseApp {
  if (getApps().length > 0) {
    return getApp();
  }
  return initializeApp(firebaseConfig);
}

const app = getFirebaseApp();

/**
 * Initialize Firebase Auth with platform-appropriate persistence.
 * On native (iOS/Android), uses AsyncStorage for session persistence.
 * On web, uses the default browser persistence (indexedDB).
 */
function getFirebaseAuth(): Auth {
  if (Platform.OS === 'web') {
    return getAuth(app);
  }
  return initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
}

export const auth: Auth = getFirebaseAuth();
export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);

export { app };
export default app;
