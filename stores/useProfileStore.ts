/**
 * SONA AI — Profile Store (Phase 4)
 * User profile management with Firebase.
 */

import { create } from 'zustand';
import {
  updateProfile as firebaseUpdateProfile,
  updatePassword,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '@/services/firebase';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  username: string;
  bio: string;
  phone: string;
  country: string;
  birthday: string;
  photoUrl: string;
  plan: 'free' | 'pro';
  joinedAt: string;
  updatedAt: string;
}

interface ProfileState {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;

  loadProfile: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<{ error: string | null }>;
  uploadAvatar: (uri: string) => Promise<{ error: string | null; url?: string }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ error: string | null }>;
  deleteAccount: (password: string) => Promise<{ error: string | null }>;
  clearError: () => void;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: null,
  isLoading: false,
  error: null,

  loadProfile: async () => {
    const user = auth.currentUser;
    if (!user) return;
    set({ isLoading: true });

    try {
      const profileRef = doc(db, 'users', user.uid);
      const snap = await getDoc(profileRef);
      const data = snap.exists() ? snap.data() : {};

      set({
        profile: {
          uid: user.uid,
          email: user.email ?? '',
          displayName: data.displayName ?? user.displayName ?? '',
          username: data.username ?? '',
          bio: data.bio ?? '',
          phone: data.phone ?? '',
          country: data.country ?? '',
          birthday: data.birthday ?? '',
          photoUrl: data.photoUrl ?? user.photoURL ?? '',
          plan: data.plan ?? 'free',
          joinedAt: data.createdAt?.toDate?.()?.toISOString() ?? user.metadata.creationTime ?? '',
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() ?? '',
        },
        isLoading: false,
      });
    } catch {
      set({ isLoading: false, error: 'Failed to load profile.' });
    }
  },

  updateProfile: async (data) => {
    const user = auth.currentUser;
    if (!user) return { error: 'Not authenticated.' };
    set({ isLoading: true, error: null });

    try {
      if (data.displayName) {
        await firebaseUpdateProfile(user, { displayName: data.displayName });
      }
      if (data.photoUrl) {
        await firebaseUpdateProfile(user, { photoURL: data.photoUrl });
      }

      const profileRef = doc(db, 'users', user.uid);
      await setDoc(profileRef, { ...data, updatedAt: serverTimestamp() }, { merge: true });

      set((s) => ({
        profile: s.profile ? { ...s.profile, ...data } : null,
        isLoading: false,
      }));
      return { error: null };
    } catch (e: any) {
      set({ isLoading: false, error: e.message });
      return { error: e.message };
    }
  },

  uploadAvatar: async (uri) => {
    const user = auth.currentUser;
    if (!user) return { error: 'Not authenticated.' };
    set({ isLoading: true });

    try {
      const storageRef = ref(storage, `users/${user.uid}/avatar_${Date.now()}.jpg`);
      const resp = await fetch(uri);
      const blob = await resp.blob();
      await uploadBytes(storageRef, blob, { contentType: 'image/jpeg' });
      const url = await getDownloadURL(storageRef);

      await firebaseUpdateProfile(user, { photoURL: url });
      const profileRef = doc(db, 'users', user.uid);
      await setDoc(profileRef, { photoUrl: url, updatedAt: serverTimestamp() }, { merge: true });

      set((s) => ({
        profile: s.profile ? { ...s.profile, photoUrl: url } : null,
        isLoading: false,
      }));
      return { error: null, url };
    } catch (e: any) {
      set({ isLoading: false });
      return { error: e.message };
    }
  },

  changePassword: async (currentPassword, newPassword) => {
    const user = auth.currentUser;
    if (!user || !user.email) return { error: 'Not authenticated.' };
    set({ isLoading: true, error: null });

    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      set({ isLoading: false });
      return { error: null };
    } catch (e: any) {
      const msg = e.code === 'auth/wrong-password' ? 'Current password is incorrect.' : e.message;
      set({ isLoading: false, error: msg });
      return { error: msg };
    }
  },

  deleteAccount: async (password) => {
    const user = auth.currentUser;
    if (!user || !user.email) return { error: 'Not authenticated.' };
    set({ isLoading: true, error: null });

    try {
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);
      await deleteUser(user);
      set({ profile: null, isLoading: false });
      return { error: null };
    } catch (e: any) {
      const msg = e.code === 'auth/wrong-password' ? 'Incorrect password.' : e.message;
      set({ isLoading: false, error: msg });
      return { error: msg };
    }
  },

  clearError: () => set({ error: null }),
}));
