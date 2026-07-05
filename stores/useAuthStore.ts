/**
 * SONA AI — Auth Store (dual-provider: Supabase + Firebase)
 * Phase 2: Add Firebase auth in parallel behind AUTH_PROVIDER flag.
 */

import { create } from 'zustand';
import { getSupabaseClient } from '@/template';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAppAuth } from '@/services/firebase';
import * as firebaseAuthHelpers from '@/services/auth/firebaseAuth';
import { getAuth, updateProfile as firebaseUpdateProfile } from 'firebase/auth';
import { getAuthProvider } from '@/services/config';
import { logger } from '@/utils/logger';

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

const mapProfile = (authUser: any, profile: any): SonaUser => ({
  id: authUser.id,
  email: authUser.email ?? '',
  displayName: profile?.display_name ?? authUser.user_metadata?.full_name ?? authUser.email?.split('@')[0] ?? 'SONA User',
  photoUrl: profile?.photo_url ?? authUser.user_metadata?.avatar_url,
  plan: (profile?.plan as 'free' | 'pro') ?? 'free',
  isGuest: false,
  onboarded: profile?.onboarded ?? false,
  createdAt: authUser.created_at ?? new Date().toISOString(),
});

const mapFirebaseUser = (user: any): SonaUser => ({
  id: user.uid,
  email: user.email ?? '',
  displayName: user.displayName ?? (user.email ? user.email.split('@')[0] : 'SONA User'),
  photoUrl: user.photoURL ?? undefined,
  plan: 'free',
  isGuest: !!user.isAnonymous,
  onboarded: false,
  createdAt: user.metadata?.creationTime ?? new Date().toISOString(),
});

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
      const provider = getAuthProvider();

      // Check guest mode first (local override)
      const guestMode = await AsyncStorage.getItem(GUEST_KEY);
      if (guestMode === 'true') {
        set({ user: GUEST_USER, isGuest: true, isInitialized: true });
        return;
      }

      if (provider === 'firebase') {
        // Ensure firebase sdk initialized
        try {
          getAppAuth();
        } catch (e) {
          logger.warn('Failed to initialize Firebase Auth during initialize()', { error: (e as any)?.message ?? String(e) });
        }

        // Listen for firebase auth state changes
        const unsubscribe = firebaseAuthHelpers.onAuthState(async (fbUser) => {
          if (!fbUser) {
            set({ user: null, isGuest: false, isInitialized: true });
            return;
          }

          try {
            // Map to SonaUser
            const sona = mapFirebaseUser(fbUser);
            set({ user: sona, isGuest: !!fbUser.isAnonymous, isInitialized: true });
          } catch (err) {
            logger.error('Error mapping firebase user', { error: (err as any)?.message ?? String(err) });
            set({ user: null, isInitialized: true });
          }
        });

        // Note: we don't store unsubscribe in this store; listener remains for app lifecycle
        return;
      }

      // Default: Supabase
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        set({
          user: mapProfile(session.user, profile),
          isGuest: false,
          isInitialized: true,
        });
      } else {
        set({ user: null, isGuest: false, isInitialized: true });
      }

      // Listen for supabase auth state changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_OUT') {
          set({ user: null, isGuest: false });
          return;
        }
        if (session?.user) {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          set({ user: mapProfile(session.user, profile), isGuest: false });
        }
      });
    } catch (err) {
      set({ isInitialized: true, user: null });
    }
  },

  signIn: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const provider = getAuthProvider();
      if (provider === 'firebase') {
        try {
          const cred = await firebaseAuthHelpers.signInWithEmail(email, password);
          const user = mapFirebaseUser(cred.user);
          set({ user, isLoading: false, isGuest: !!cred.user.isAnonymous });
          return { error: null };
        } catch (err: any) {
          const msg = err?.message ?? 'Sign in failed. Please try again.';
          set({ isLoading: false, error: msg });
          return { error: msg };
        }
      }

      // Supabase flow
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        const msg = error.message.includes('Invalid login credentials')
          ? 'Invalid email or password. Please try again.'
          : error.message;
        set({ isLoading: false, error: msg });
        return { error: msg };
      }

      if (data.user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
        set({ user: mapProfile(data.user, profile), isLoading: false });
      }
      return { error: null };
    } catch (err: any) {
      const msg = err?.message ?? 'Sign in failed. Please try again.';
      set({ isLoading: false, error: msg });
      return { error: msg };
    }
  },

  signUp: async (email, password, displayName) => {
    set({ isLoading: true, error: null });
    try {
      const provider = getAuthProvider();
      if (provider === 'firebase') {
        try {
          const cred = await firebaseAuthHelpers.signUpWithEmail(email, password);
          // We are not migrating to Firestore yet; simply map the firebase user and set the store.
          const user = mapFirebaseUser(cred.user);
          // Optionally update displayName on Firebase user
          try {
            if (displayName && cred.user) {
              await firebaseUpdateProfile(cred.user, { displayName });
            }
          } catch (e) {
            logger.warn('Failed to update firebase profile displayName', { error: (e as any)?.message ?? String(e) });
          }
          set({ user, isLoading: false });
          return { error: null };
        } catch (err: any) {
          const msg = err?.message ?? 'Sign up failed. Please try again.';
          set({ isLoading: false, error: msg });
          return { error: msg };
        }
      }

      // Supabase flow
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: displayName, display_name: displayName },
        },
      });

      if (error) {
        const msg = error.message.includes('already registered')
          ? 'An account with this email already exists.'
          : error.message;
        set({ isLoading: false, error: msg });
        return { error: msg };
      }

      if (data.user) {
        // Upsert profile with display name
        await supabase.from('user_profiles').upsert({
          id: data.user.id,
          email,
          username: displayName.toLowerCase().replace(/\s+/g, '_'),
          display_name: displayName,
          plan: 'free',
          onboarded: false,
        });

        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        set({ user: mapProfile(data.user, profile), isLoading: false });
      } else {
        // Email confirmation required
        set({ isLoading: false });
      }
      return { error: null };
    } catch (err: any) {
      const msg = err?.message ?? 'Sign up failed. Please try again.';
      set({ isLoading: false, error: msg });
      return { error: msg };
    }
  },

  signInWithGoogle: async () => {
    set({ isLoading: true, error: null });
    try {
      const provider = getAuthProvider();
      if (provider === 'firebase') {
        const res = await firebaseAuthHelpers.signInWithGoogle();
        const mapped = mapFirebaseUser(res.user);
        set({ user: mapped, isLoading: false });
        return { error: null };
      }

      // Supabase Google
      const supabase = getSupabaseClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: 'sonaai://auth/callback' },
      });
      if (error) {
        set({ isLoading: false, error: error.message });
        return { error: error.message };
      }
      set({ isLoading: false });
      return { error: null };
    } catch (err: any) {
      const msg = err?.message ?? 'Google sign-in failed.';
      set({ isLoading: false, error: msg });
      return { error: msg };
    }
  },

  continueAsGuest: async () => {
    const provider = getAuthProvider();
    if (provider === 'firebase') {
      try {
        const cred = await firebaseAuthHelpers.signInAnonymous();
        const user = mapFirebaseUser(cred.user);
        await AsyncStorage.setItem(GUEST_KEY, 'true');
        set({ user, isGuest: true });
        return;
      } catch (err) {
        logger.error('Anonymous sign-in failed', { error: (err as any)?.message ?? String(err) });
        // fallback to guest-only local mode
        await AsyncStorage.setItem(GUEST_KEY, 'true');
        set({ user: GUEST_USER, isGuest: true });
        return;
      }
    }

    // Supabase guest
    await AsyncStorage.setItem(GUEST_KEY, 'true');
    set({ user: GUEST_USER, isGuest: true });
  },

  forgotPassword: async (email) => {
    set({ isLoading: true, error: null });
    try {
      const provider = getAuthProvider();
      if (provider === 'firebase') {
        await firebaseAuthHelpers.sendPasswordResetEmail(email);
        set({ isLoading: false });
        return { error: null };
      }

      const supabase = getSupabaseClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'sonaai://reset-password',
      });
      set({ isLoading: false });
      if (error) {
        set({ error: error.message });
        return { error: error.message };
      }
      return { error: null };
    } catch (err: any) {
      const msg = err?.message ?? 'Password reset failed.';
      set({ isLoading: false, error: msg });
      return { error: msg };
    }
  },

  signOut: async () => {
    set({ isLoading: true });
    try {
      const provider = getAuthProvider();
      await AsyncStorage.removeItem(GUEST_KEY);
      if (provider === 'firebase') {
        await firebaseAuthHelpers.signOut();
        set({ user: null, isGuest: false, isLoading: false });
        return;
      }
      const supabase = getSupabaseClient();
      await supabase.auth.signOut();
      set({ user: null, isGuest: false, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
    }
  },

  updateProfile: async (updates) => {
    const { user } = get();
    if (!user || user.isGuest) return { error: 'Not authenticated' };
    const provider = getAuthProvider();
    if (provider === 'firebase') {
      try {
        const auth = getAppAuth();
        if (auth.currentUser) {
          await firebaseUpdateProfile(auth.currentUser, {
            displayName: updates.displayName,
            photoURL: updates.photoUrl,
          } as any);
          // Update store
          set({ user: { ...user, ...updates } });
          return { error: null };
        }
        return { error: 'No firebase user' };
      } catch (err: any) {
        return { error: err?.message ?? 'Update failed' };
      }
    }

    // Supabase flow
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.from('user_profiles').update({
        display_name: updates.displayName,
        photo_url: updates.photoUrl,
      }).eq('id', user.id);
      if (error) return { error: error.message };
      set({ user: { ...user, ...updates } });
      return { error: null };
    } catch (err: any) {
      return { error: err?.message ?? 'Update failed' };
    }
  },

  clearError: () => set({ error: null }),
}));
