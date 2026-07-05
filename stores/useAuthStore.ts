/**
 * SONA AI — Auth Store
 * Powered by Firebase Authentication
 * Handles: Email/Password, Google OAuth, Anonymous/Guest mode, Forgot Password
 */

import { create } from 'zustand';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithCredential,
  signInWithPopup,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/services/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

export interface SonaUser {
  id: string;
  email: string;
  displayName: string;
  photoUrl?: string;
  plan: 'free' | 'pro';
  isGuest: boolean;
  onboarded: boolean;
  createdAt: string;
}

interface AuthState {
  user: SonaUser | null;
  isLoading: boolean;
  isInitialized: boolean;
  isGuest: boolean;
  error: string | null;

  // Actions
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: string | null }>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  continueAsGuest: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Pick<SonaUser, 'displayName' | 'photoUrl'>>) => Promise<{ error: string | null }>;
  clearError: () => void;
}

const GUEST_KEY = '@sona_guest_mode';

/**
 * Maps a Firebase Auth user + Firestore profile to a SonaUser.
 */
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
    onboarded: profile?.onboarded ?? false,
    createdAt:
      profile?.createdAt?.toDate?.()?.toISOString() ??
      firebaseUser.metadata.creationTime ??
      new Date().toISOString(),
  };
}

/**
 * Upserts a user profile document in Firestore.
 */
async function upsertUserProfile(
  uid: string,
  data: Partial<{
    email: string;
    displayName: string;
    photoUrl: string;
    plan: string;
    onboarded: boolean;
  }>
): Promise<void> {
  const profileRef = doc(db, 'users', uid);
  const existing = await getDoc(profileRef);

  if (existing.exists()) {
    await setDoc(profileRef, { ...data, updatedAt: serverTimestamp() }, { merge: true });
  } else {
    await setDoc(profileRef, {
      ...data,
      plan: 'free',
      onboarded: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
}

/**
 * Fetches the user profile from Firestore.
 */
async function fetchUserProfile(uid: string): Promise<any | null> {
  const profileRef = doc(db, 'users', uid);
  const snap = await getDoc(profileRef);
  return snap.exists() ? snap.data() : null;
}

/**
 * Maps Firebase Auth error codes to user-friendly messages.
 */
function getAuthErrorMessage(code: string): string {
  switch (code) {
    case 'auth/invalid-email':
      return 'Invalid email address format.';
    case 'auth/user-disabled':
      return 'This account has been disabled.';
    case 'auth/user-not-found':
      return 'No account found with this email.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please try again.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection.';
    case 'auth/popup-closed-by-user':
      return 'Sign-in cancelled.';
    default:
      return 'Authentication failed. Please try again.';
  }
}

const GUEST_USER: SonaUser = {
  id: 'guest',
  email: '',
  displayName: 'Guest',
  plan: 'free',
  isGuest: true,
  onboarded: true,
  createdAt: new Date().toISOString(),
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  isInitialized: false,
  isGuest: false,
  error: null,

  initialize: async () => {
    try {
      // Check guest mode first
      const guestMode = await AsyncStorage.getItem(GUEST_KEY);
      if (guestMode === 'true') {
        set({ user: GUEST_USER, isGuest: true, isInitialized: true });
        return;
      }

      // Listen for Firebase Auth state changes
      onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          const profile = await fetchUserProfile(firebaseUser.uid).catch(() => null);
          const sonaUser = mapFirebaseUser(firebaseUser, profile);
          set({
            user: sonaUser,
            isGuest: firebaseUser.isAnonymous,
            isInitialized: true,
          });
        } else {
          // Only update if not in guest mode
          const guestCheck = await AsyncStorage.getItem(GUEST_KEY);
          if (guestCheck !== 'true') {
            set({ user: null, isGuest: false, isInitialized: true });
          }
        }
      });

      // If there's already a current user from persisted session, set initialized
      if (auth.currentUser) {
        const profile = await fetchUserProfile(auth.currentUser.uid).catch(() => null);
        const sonaUser = mapFirebaseUser(auth.currentUser, profile);
        set({ user: sonaUser, isGuest: auth.currentUser.isAnonymous, isInitialized: true });
      } else {
        // Mark as initialized after a brief wait for auth state to resolve
        setTimeout(() => {
          const { isInitialized } = get();
          if (!isInitialized) {
            set({ isInitialized: true });
          }
        }, 2000);
      }
    } catch (err) {
      set({ isInitialized: true, user: null });
    }
  },

  signIn: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const profile = await fetchUserProfile(credential.user.uid).catch(() => null);
      const sonaUser = mapFirebaseUser(credential.user, profile);

      set({ user: sonaUser, isGuest: false, isLoading: false });
      await AsyncStorage.removeItem(GUEST_KEY);
      return { error: null };
    } catch (err: any) {
      const msg = getAuthErrorMessage(err?.code ?? '');
      set({ isLoading: false, error: msg });
      return { error: msg };
    }
  },

  signUp: async (email, password, displayName) => {
    set({ isLoading: true, error: null });
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);

      // Update Firebase Auth profile
      await updateProfile(credential.user, { displayName });

      // Create Firestore profile document
      await upsertUserProfile(credential.user.uid, {
        email,
        displayName,
        plan: 'free',
        onboarded: false,
      });

      const profile = await fetchUserProfile(credential.user.uid).catch(() => null);
      const sonaUser = mapFirebaseUser(credential.user, profile);

      set({ user: sonaUser, isGuest: false, isLoading: false });
      await AsyncStorage.removeItem(GUEST_KEY);
      return { error: null };
    } catch (err: any) {
      const msg = getAuthErrorMessage(err?.code ?? '');
      set({ isLoading: false, error: msg });
      return { error: msg };
    }
  },

  signInWithGoogle: async () => {
    set({ isLoading: true, error: null });
    try {
      if (Platform.OS === 'web') {
        // Web: Use popup-based sign-in
        const provider = new GoogleAuthProvider();
        provider.addScope('email');
        provider.addScope('profile');
        const result = await signInWithPopup(auth, provider);

        // Upsert profile
        await upsertUserProfile(result.user.uid, {
          email: result.user.email ?? '',
          displayName: result.user.displayName ?? '',
          photoUrl: result.user.photoURL ?? '',
        });

        const profile = await fetchUserProfile(result.user.uid).catch(() => null);
        const sonaUser = mapFirebaseUser(result.user, profile);

        set({ user: sonaUser, isGuest: false, isLoading: false });
        await AsyncStorage.removeItem(GUEST_KEY);
        return { error: null };
      } else {
        // Mobile: Use expo-auth-session for OAuth flow
        const redirectUri = AuthSession.makeRedirectUri({ scheme: 'sonaai', path: 'auth/callback' });
        const clientId = process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? '';
        const authDomain = process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '';

        const discoveryDocument = {
          authorizationEndpoint: `https://accounts.google.com/o/oauth2/v2/auth`,
          tokenEndpoint: `https://oauth2.googleapis.com/token`,
        };

        const request = new AuthSession.AuthRequest({
          clientId,
          redirectUri,
          scopes: ['openid', 'profile', 'email'],
          responseType: AuthSession.ResponseType.IdToken,
          extraParams: {
            nonce: Math.random().toString(36).substring(2),
          },
        });

        const result = await request.promptAsync(discoveryDocument);

        if (result.type === 'success' && result.params?.id_token) {
          const credential = GoogleAuthProvider.credential(result.params.id_token);
          const userCredential = await signInWithCredential(auth, credential);

          await upsertUserProfile(userCredential.user.uid, {
            email: userCredential.user.email ?? '',
            displayName: userCredential.user.displayName ?? '',
            photoUrl: userCredential.user.photoURL ?? '',
          });

          const profile = await fetchUserProfile(userCredential.user.uid).catch(() => null);
          const sonaUser = mapFirebaseUser(userCredential.user, profile);

          set({ user: sonaUser, isGuest: false, isLoading: false });
          await AsyncStorage.removeItem(GUEST_KEY);
          return { error: null };
        } else if (result.type === 'cancel' || result.type === 'dismiss') {
          set({ isLoading: false });
          return { error: 'Sign-in cancelled.' };
        } else {
          set({ isLoading: false });
          return { error: 'Google sign-in failed. Please try again.' };
        }
      }
    } catch (err: any) {
      const msg = getAuthErrorMessage(err?.code ?? '');
      set({ isLoading: false, error: msg });
      return { error: msg };
    }
  },

  continueAsGuest: async () => {
    try {
      // Sign in anonymously with Firebase for basic backend access
      await signInAnonymously(auth);
      await AsyncStorage.setItem(GUEST_KEY, 'true');
      set({ user: GUEST_USER, isGuest: true });
    } catch {
      // Fallback: use local guest mode without Firebase anonymous auth
      await AsyncStorage.setItem(GUEST_KEY, 'true');
      set({ user: GUEST_USER, isGuest: true });
    }
  },

  forgotPassword: async (email) => {
    set({ isLoading: true, error: null });
    try {
      await sendPasswordResetEmail(auth, email, {
        url: 'https://sona-ai.firebaseapp.com/auth/reset-complete',
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

  signOut: async () => {
    set({ isLoading: true });
    try {
      await AsyncStorage.removeItem(GUEST_KEY);
      await firebaseSignOut(auth);
      set({ user: null, isGuest: false, isLoading: false });
    } catch {
      // Force local cleanup even if Firebase sign-out fails
      set({ user: null, isGuest: false, isLoading: false });
    }
  },

  updateProfile: async (updates) => {
    const { user } = get();
    if (!user || user.isGuest) return { error: 'Not authenticated' };

    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) return { error: 'No active session' };

      // Update Firebase Auth profile
      await updateProfile(firebaseUser, {
        displayName: updates.displayName ?? firebaseUser.displayName,
        photoURL: updates.photoUrl ?? firebaseUser.photoURL,
      });

      // Update Firestore profile
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

  clearError: () => set({ error: null }),
}));
