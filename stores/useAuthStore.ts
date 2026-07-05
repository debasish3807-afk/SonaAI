/**
 * SONA AI — Auth Store (Phase 1)
 * Production-ready Firebase Authentication module.
 *
 * Features:
 *  - Email/Password Sign Up & Sign In
 *  - Google Sign-In (web popup + mobile expo-auth-session)
 *  - Anonymous/Guest mode
 *  - Email Verification
 *  - Forgot Password
 *  - Persistent Login (Firebase handles via platform persistence)
 *  - Session Management (token refresh, auth state listener)
 *  - Firestore user profile sync
 *  - Comprehensive error mapping
 */

import { create } from 'zustand';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithCredential,
  signInWithPopup,
  reload,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/services/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SonaUser {
  id: string;
  email: string;
  displayName: string;
  photoUrl?: string;
  plan: 'free' | 'pro';
  isGuest: boolean;
  emailVerified: boolean;
  onboarded: boolean;
  createdAt: string;
}

interface AuthState {
  user: SonaUser | null;
  isLoading: boolean;
  isInitialized: boolean;
  isGuest: boolean;
  error: string | null;
  emailVerificationSent: boolean;
  _unsubAuth: (() => void) | null;

  // Lifecycle
  initialize: () => Promise<void>;

  // Email/Password
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: string | null }>;

  // OAuth
  signInWithGoogle: () => Promise<{ error: string | null }>;

  // Guest
  continueAsGuest: () => Promise<void>;

  // Password Reset
  forgotPassword: (email: string) => Promise<{ error: string | null }>;

  // Email Verification
  sendVerificationEmail: () => Promise<{ error: string | null }>;
  refreshEmailVerification: () => Promise<boolean>;

  // Session
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;

  // Profile
  updateUserProfile: (updates: Partial<Pick<SonaUser, 'displayName' | 'photoUrl'>>) => Promise<{ error: string | null }>;

  // State management
  clearError: () => void;
  setError: (error: string) => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const GUEST_KEY = '@sona_guest_mode';
const SESSION_KEY = '@sona_last_active';

const GUEST_USER: SonaUser = {
  id: 'guest',
  email: '',
  displayName: 'Guest',
  plan: 'free',
  isGuest: true,
  emailVerified: false,
  onboarded: true,
  createdAt: new Date().toISOString(),
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mapFirebaseUser(firebaseUser: FirebaseUser, profile?: any): SonaUser {
  return {
    id: firebaseUser.uid,
    email: firebaseUser.email ?? '',
    displayName:
      profile?.displayName ??
      firebaseUser.displayName ??
      firebaseUser.email?.split('@')[0] ??
      'SONA User',
    photoUrl: profile?.photoUrl ?? firebaseUser.photoURL ?? undefined,
    plan: (profile?.plan as 'free' | 'pro') ?? 'free',
    isGuest: firebaseUser.isAnonymous,
    emailVerified: firebaseUser.emailVerified,
    onboarded: profile?.onboarded ?? false,
    createdAt:
      profile?.createdAt?.toDate?.()?.toISOString() ??
      firebaseUser.metadata.creationTime ??
      new Date().toISOString(),
  };
}

async function upsertUserProfile(
  uid: string,
  data: Partial<{
    email: string;
    displayName: string;
    photoUrl: string;
    plan: string;
    onboarded: boolean;
    emailVerified: boolean;
  }>
): Promise<void> {
  const profileRef = doc(db, 'users', uid);
  const existing = await getDoc(profileRef);

  if (existing.exists()) {
    await setDoc(profileRef, { ...data, updatedAt: serverTimestamp() }, { merge: true });
  } else {
    await setDoc(profileRef, {
      ...data,
      plan: data.plan ?? 'free',
      onboarded: data.onboarded ?? false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
}

async function fetchUserProfile(uid: string): Promise<any | null> {
  const profileRef = doc(db, 'users', uid);
  const snap = await getDoc(profileRef);
  return snap.exists() ? snap.data() : null;
}

function getAuthErrorMessage(code: string): string {
  switch (code) {
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Contact support.';
    case 'auth/user-not-found':
      return 'No account found with this email address.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Try signing in.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters long.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a moment and try again.';
    case 'auth/network-request-failed':
      return 'Network error. Check your internet connection.';
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return 'Sign-in was cancelled.';
    case 'auth/operation-not-allowed':
      return 'This sign-in method is not enabled. Contact support.';
    case 'auth/requires-recent-login':
      return 'Please sign in again to complete this action.';
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with a different sign-in method.';
    default:
      return 'Something went wrong. Please try again.';
  }
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  isInitialized: false,
  isGuest: false,
  error: null,
  emailVerificationSent: false,
  _unsubAuth: null,

  // ── Initialize ─────────────────────────────────────────────────────────────

  initialize: async () => {
    try {
      const guestMode = await AsyncStorage.getItem(GUEST_KEY);
      if (guestMode === 'true') {
        set({ user: GUEST_USER, isGuest: true, isInitialized: true });
        return;
      }

      // Set up persistent auth state listener
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          const profile = await fetchUserProfile(firebaseUser.uid).catch(() => null);
          const sonaUser = mapFirebaseUser(firebaseUser, profile);
          set({
            user: sonaUser,
            isGuest: firebaseUser.isAnonymous,
            isInitialized: true,
            isLoading: false,
          });
          // Track session activity
          await AsyncStorage.setItem(SESSION_KEY, Date.now().toString());
        } else {
          const guestCheck = await AsyncStorage.getItem(GUEST_KEY);
          if (guestCheck !== 'true') {
            set({ user: null, isGuest: false, isInitialized: true, isLoading: false });
          }
        }
      });

      // Store the unsubscribe function for cleanup
      set({ _unsubAuth: unsubscribe });

      // Handle case where auth state hasn't fired yet
      if (auth.currentUser) {
        const profile = await fetchUserProfile(auth.currentUser.uid).catch(() => null);
        const sonaUser = mapFirebaseUser(auth.currentUser, profile);
        set({ user: sonaUser, isGuest: auth.currentUser.isAnonymous, isInitialized: true });
      } else {
        // Give Firebase a moment to restore session from persistence
        setTimeout(() => {
          const { isInitialized } = get();
          if (!isInitialized) {
            set({ isInitialized: true });
          }
        }, 2500);
      }
    } catch {
      set({ isInitialized: true, user: null });
    }
  },

  // ── Email/Password Sign In ─────────────────────────────────────────────────

  signIn: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const profile = await fetchUserProfile(credential.user.uid).catch(() => null);
      const sonaUser = mapFirebaseUser(credential.user, profile);

      await AsyncStorage.removeItem(GUEST_KEY);
      await AsyncStorage.setItem(SESSION_KEY, Date.now().toString());
      set({ user: sonaUser, isGuest: false, isLoading: false });
      return { error: null };
    } catch (err: any) {
      const msg = getAuthErrorMessage(err?.code ?? '');
      set({ isLoading: false, error: msg });
      return { error: msg };
    }
  },

  // ── Email/Password Sign Up ─────────────────────────────────────────────────

  signUp: async (email, password, displayName) => {
    set({ isLoading: true, error: null });
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);

      // Set display name on Firebase Auth profile
      await updateProfile(credential.user, { displayName });

      // Send email verification
      await sendEmailVerification(credential.user).catch(() => {
        // Non-blocking: verification email is best-effort
      });

      // Create Firestore profile
      await upsertUserProfile(credential.user.uid, {
        email,
        displayName,
        plan: 'free',
        onboarded: false,
        emailVerified: false,
      });

      const profile = await fetchUserProfile(credential.user.uid).catch(() => null);
      const sonaUser = mapFirebaseUser(credential.user, profile);

      await AsyncStorage.removeItem(GUEST_KEY);
      await AsyncStorage.setItem(SESSION_KEY, Date.now().toString());
      set({ user: sonaUser, isGuest: false, isLoading: false, emailVerificationSent: true });
      return { error: null };
    } catch (err: any) {
      const msg = getAuthErrorMessage(err?.code ?? '');
      set({ isLoading: false, error: msg });
      return { error: msg };
    }
  },

  // ── Google Sign-In ─────────────────────────────────────────────────────────

  signInWithGoogle: async () => {
    set({ isLoading: true, error: null });
    try {
      if (Platform.OS === 'web') {
        const provider = new GoogleAuthProvider();
        provider.addScope('email');
        provider.addScope('profile');
        const result = await signInWithPopup(auth, provider);

        await upsertUserProfile(result.user.uid, {
          email: result.user.email ?? '',
          displayName: result.user.displayName ?? '',
          photoUrl: result.user.photoURL ?? '',
          emailVerified: result.user.emailVerified,
        });

        const profile = await fetchUserProfile(result.user.uid).catch(() => null);
        const sonaUser = mapFirebaseUser(result.user, profile);

        await AsyncStorage.removeItem(GUEST_KEY);
        await AsyncStorage.setItem(SESSION_KEY, Date.now().toString());
        set({ user: sonaUser, isGuest: false, isLoading: false });
        return { error: null };
      }

      // Mobile: expo-auth-session OAuth flow
      const redirectUri = AuthSession.makeRedirectUri({ scheme: 'sonaai', path: 'auth/callback' });
      const discoveryDocument = {
        authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenEndpoint: 'https://oauth2.googleapis.com/token',
      };

      const clientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ?? process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? '';

      const request = new AuthSession.AuthRequest({
        clientId,
        redirectUri,
        scopes: ['openid', 'profile', 'email'],
        responseType: AuthSession.ResponseType.IdToken,
        extraParams: { nonce: Math.random().toString(36).substring(2) },
      });

      const result = await request.promptAsync(discoveryDocument);

      if (result.type === 'success' && result.params?.id_token) {
        const credential = GoogleAuthProvider.credential(result.params.id_token);
        const userCredential = await signInWithCredential(auth, credential);

        await upsertUserProfile(userCredential.user.uid, {
          email: userCredential.user.email ?? '',
          displayName: userCredential.user.displayName ?? '',
          photoUrl: userCredential.user.photoURL ?? '',
          emailVerified: userCredential.user.emailVerified,
        });

        const profile = await fetchUserProfile(userCredential.user.uid).catch(() => null);
        const sonaUser = mapFirebaseUser(userCredential.user, profile);

        await AsyncStorage.removeItem(GUEST_KEY);
        await AsyncStorage.setItem(SESSION_KEY, Date.now().toString());
        set({ user: sonaUser, isGuest: false, isLoading: false });
        return { error: null };
      }

      if (result.type === 'cancel' || result.type === 'dismiss') {
        set({ isLoading: false });
        return { error: 'Sign-in was cancelled.' };
      }

      set({ isLoading: false });
      return { error: 'Google sign-in failed. Please try again.' };
    } catch (err: any) {
      const msg = getAuthErrorMessage(err?.code ?? '');
      set({ isLoading: false, error: msg });
      return { error: msg };
    }
  },

  // ── Guest Login ────────────────────────────────────────────────────────────

  continueAsGuest: async () => {
    set({ isLoading: true, error: null });
    try {
      await signInAnonymously(auth);
      await AsyncStorage.setItem(GUEST_KEY, 'true');
      set({ user: GUEST_USER, isGuest: true, isLoading: false });
    } catch {
      // Fallback: local-only guest mode
      await AsyncStorage.setItem(GUEST_KEY, 'true');
      set({ user: GUEST_USER, isGuest: true, isLoading: false });
    }
  },

  // ── Forgot Password ────────────────────────────────────────────────────────

  forgotPassword: async (email) => {
    set({ isLoading: true, error: null });
    try {
      await sendPasswordResetEmail(auth, email, {
        url: `https://${process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? 'sona-ai.firebaseapp.com'}/auth/reset-complete`,
        handleCodeInApp: false,
      });
      set({ isLoading: false });
      return { error: null };
    } catch (err: any) {
      const msg = getAuthErrorMessage(err?.code ?? '');
      set({ isLoading: false, error: msg });
      return { error: msg };
    }
  },

  // ── Email Verification ─────────────────────────────────────────────────────

  sendVerificationEmail: async () => {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return { error: 'No active session.' };
    if (firebaseUser.emailVerified) return { error: null };

    try {
      await sendEmailVerification(firebaseUser);
      set({ emailVerificationSent: true });
      return { error: null };
    } catch (err: any) {
      if (err?.code === 'auth/too-many-requests') {
        return { error: 'Verification email already sent. Check your inbox.' };
      }
      return { error: 'Failed to send verification email. Try again later.' };
    }
  },

  refreshEmailVerification: async () => {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return false;

    try {
      await reload(firebaseUser);
      if (firebaseUser.emailVerified) {
        const { user } = get();
        if (user) {
          set({ user: { ...user, emailVerified: true } });
          await upsertUserProfile(firebaseUser.uid, { emailVerified: true });
        }
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },

  // ── Session Management ─────────────────────────────────────────────────────

  refreshSession: async () => {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return;

    try {
      // Force token refresh to keep session alive
      await firebaseUser.getIdToken(true);
      await reload(firebaseUser);

      const profile = await fetchUserProfile(firebaseUser.uid).catch(() => null);
      const sonaUser = mapFirebaseUser(firebaseUser, profile);
      set({ user: sonaUser });
      await AsyncStorage.setItem(SESSION_KEY, Date.now().toString());
    } catch {
      // Token refresh failed — session may be expired
    }
  },

  // ── Sign Out ───────────────────────────────────────────────────────────────

  signOut: async () => {
    set({ isLoading: true });
    try {
      // Unsubscribe auth state listener to prevent memory leak
      const { _unsubAuth } = get();
      if (_unsubAuth) { _unsubAuth(); set({ _unsubAuth: null }); }

      await AsyncStorage.removeItem(GUEST_KEY);
      await AsyncStorage.removeItem(SESSION_KEY);
      await firebaseSignOut(auth);
      set({ user: null, isGuest: false, isLoading: false, emailVerificationSent: false });
    } catch {
      // Force local cleanup even if Firebase sign-out fails
      set({ user: null, isGuest: false, isLoading: false, emailVerificationSent: false });
    }
  },

  // ── Profile Update ─────────────────────────────────────────────────────────

  updateUserProfile: async (updates) => {
    const { user } = get();
    if (!user || user.isGuest) return { error: 'Not authenticated.' };

    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return { error: 'Session expired. Please sign in again.' };

    try {
      await updateProfile(firebaseUser, {
        displayName: updates.displayName ?? firebaseUser.displayName,
        photoURL: updates.photoUrl ?? firebaseUser.photoURL,
      });

      await upsertUserProfile(firebaseUser.uid, {
        displayName: updates.displayName,
        photoUrl: updates.photoUrl,
      });

      set({ user: { ...user, ...updates } });
      return { error: null };
    } catch (err: any) {
      return { error: err?.message ?? 'Profile update failed.' };
    }
  },

  // ── Error Management ───────────────────────────────────────────────────────

  clearError: () => set({ error: null }),
  setError: (error: string) => set({ error }),
}));
