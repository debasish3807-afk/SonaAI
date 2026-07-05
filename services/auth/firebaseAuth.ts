// services/auth/firebaseAuth.ts
import { getAppAuth } from '../services/firebase';
import { 
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  signOut as firebaseSignOut,
  signInWithCredential,
  UserCredential,
  onAuthStateChanged,
} from 'firebase/auth';

import * as AuthSession from 'expo-auth-session';
import { logger } from '../utils/logger';
import { setSecureItem, deleteSecureItem } from '../services/secureStore';

const SECURE_KEY = 'firebase_id_token';

export async function signInWithEmail(email: string, password: string) {
  const auth = getAppAuth();
  const credential = await signInWithEmailAndPassword(auth, email, password);
  await persistSession(credential);
  return credential;
}

export async function signUpWithEmail(email: string, password: string) {
  const auth = getAppAuth();
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await persistSession(credential);
  return credential;
}

export async function signInAnonymous() {
  const auth = getAppAuth();
  const credential = await signInAnonymously(auth);
  await persistSession(credential);
  return credential;
}

export async function sendPasswordResetEmail(email: string) {
  const auth = getAppAuth();
  return firebaseSendPasswordResetEmail(auth, email);
}

export async function signOut() {
  const auth = getAppAuth();
  try {
    await firebaseSignOut(auth);
  } finally {
    await deleteSecureItem(SECURE_KEY);
  }
}

async function persistSession(credential: UserCredential) {
  try {
    const token = await credential.user.getIdToken();
    await setSecureItem(SECURE_KEY, token);
  } catch (err: any) {
    logger.warn('Failed to persist firebase session token', { error: err?.message ?? String(err) });
  }
}

// Google sign-in using Expo AuthSession (works for native and web if configured)
export async function signInWithGoogle(): Promise<UserCredential> {
  const auth = getAppAuth();

  // prefer using popup if available (web)
  if (typeof window !== 'undefined' && (window as any).firebase) {
    const provider = new GoogleAuthProvider();
    const credential = await (auth as any).signInWithPopup(provider);
    await persistSession(credential);
    return credential as UserCredential;
  }

  // Native / Expo flow using AuthSession
  const clientId = process.env.FIREBASE_GOOGLE_CLIENT_ID;
  if (!clientId) throw new Error('FIREBASE_GOOGLE_CLIENT_ID not configured in environment');

  const redirectUri = AuthSession.makeRedirectUri({ useProxy: true });
  const state = Math.random().toString(36).substring(2);
  const nonce = Math.random().toString(36).substring(2);

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
    clientId
  )}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token%20id_token&scope=${encodeURIComponent(
    'openid profile email'
  )}&state=${state}&nonce=${nonce}`;

  const result = await AuthSession.startAsync({ authUrl }) as AuthSession.AuthSessionResult;
  if (result.type !== 'success' || !result.params) {
    throw new Error('Google sign-in cancelled or failed');
  }

  const idToken = result.params.id_token || result.params.idToken;
  if (!idToken) {
    throw new Error('No id_token returned from Google');
  }

  const credential = GoogleAuthProvider.credential(idToken);
  const userCredential = await signInWithCredential(auth, credential as any);
  await persistSession(userCredential);
  return userCredential;
}

export function onAuthState(cb: (user: any) => void) {
  const auth = getAppAuth();
  return onAuthStateChanged(auth, async (user) => {
    if (!user) {
      cb(null);
      return;
    }
    const token = await user.getIdToken();
    // persist token
    await setSecureItem(SECURE_KEY, token);
    cb(user);
  });
}
