/**
 * SONA AI — Auth Store
 * Powered by OnSpace Cloud (Supabase-compatible)
 * Handles: Email/Password, Google OAuth, Guest mode, Forgot Password
 */

import { create } from 'zustand';
import { getSupabaseClient } from '@/template';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

      // Listen for auth state changes
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
    await AsyncStorage.setItem(GUEST_KEY, 'true');
    set({ user: GUEST_USER, isGuest: true });
  },

  forgotPassword: async (email) => {
    set({ isLoading: true, error: null });
    try {
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
      await AsyncStorage.removeItem(GUEST_KEY);
      const supabase = getSupabaseClient();
      await supabase.auth.signOut();
      set({ user: null, isGuest: false, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  updateProfile: async (updates) => {
    const { user } = get();
    if (!user || user.isGuest) return { error: 'Not authenticated' };
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
