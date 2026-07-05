/**
 * SONA AI — Settings Store (Phase 7)
 * Complete app settings with persistence.
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '@/services/firebase';
import * as ExpoFileSystem from 'expo-file-system';
import * as LocalAuthentication from 'expo-local-authentication';

export type ThemeMode = 'light' | 'dark' | 'system';
export type AppLanguage = 'en' | 'hi' | 'bn';
export type AIModel = 'gemini-2.0-flash' | 'gemini-1.5-pro' | 'gemini-1.5-flash';
export type AutoLockTime = 'immediate' | '1min' | '5min' | '15min' | 'never';

export interface AppSettings {
  // Appearance
  theme: ThemeMode;
  dynamicColor: boolean;
  fontSize: number;

  // Language
  language: AppLanguage;

  // AI
  aiModel: AIModel;
  temperature: number;
  streamingEnabled: boolean;
  autoSpeak: boolean;
  voiceId: string;
  voiceSpeed: number;
  voicePitch: number;

  // Chat
  chatFontSize: number;
  markdownEnabled: boolean;
  autoScroll: boolean;
  saveHistory: boolean;

  // Memory
  autoSaveAIMemory: boolean;
  reminderDefaultTime: string;

  // Notifications
  pushEnabled: boolean;
  reminderEnabled: boolean;
  dailyReminder: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;

  // Security
  appLockEnabled: boolean;
  biometricEnabled: boolean;
  autoLockTime: AutoLockTime;

  // Storage
  cacheEnabled: boolean;
}

interface SettingsState {
  settings: AppSettings;
  isLoading: boolean;
  searchQuery: string;
  biometricAvailable: boolean;

  // Lifecycle
  initialize: () => Promise<void>;

  // Update
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => Promise<void>;
  updateSettings: (updates: Partial<AppSettings>) => Promise<void>;
  resetSettings: () => Promise<void>;

  // Backup
  backupToFirestore: () => Promise<void>;
  restoreFromFirestore: () => Promise<void>;
  exportBackup: () => Promise<string>;
  importBackup: (json: string) => Promise<void>;

  // Storage
  clearCache: () => Promise<number>;
  getCacheSize: () => Promise<number>;

  // Security
  checkBiometric: () => Promise<boolean>;
  authenticateBiometric: () => Promise<boolean>;

  // Search
  setSearchQuery: (q: string) => void;

  // Getters
  getVersion: () => string;
}

const SETTINGS_KEY = 'sona_app_settings_v2';

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark', dynamicColor: false, fontSize: 16,
  language: 'en',
  aiModel: 'gemini-2.0-flash', temperature: 0.7, streamingEnabled: true,
  autoSpeak: false, voiceId: '', voiceSpeed: 1.0, voicePitch: 1.0,
  chatFontSize: 15, markdownEnabled: true, autoScroll: true, saveHistory: true,
  autoSaveAIMemory: false, reminderDefaultTime: '09:00',
  pushEnabled: true, reminderEnabled: true, dailyReminder: false,
  soundEnabled: true, vibrationEnabled: true,
  appLockEnabled: false, biometricEnabled: false, autoLockTime: 'never',
  cacheEnabled: true,
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  isLoading: false,
  searchQuery: '',
  biometricAvailable: false,

  initialize: async () => {
    set({ isLoading: true });
    try {
      const data = await AsyncStorage.getItem(SETTINGS_KEY);
      if (data) {
        set({ settings: { ...DEFAULT_SETTINGS, ...JSON.parse(data) } });
      }
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      set({ biometricAvailable: hasHardware && enrolled });
    } catch {}
    set({ isLoading: false });
  },

  updateSetting: async (key, value) => {
    const newSettings = { ...get().settings, [key]: value };
    set({ settings: newSettings });
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
  },

  updateSettings: async (updates) => {
    const newSettings = { ...get().settings, ...updates };
    set({ settings: newSettings });
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
  },

  resetSettings: async () => {
    set({ settings: DEFAULT_SETTINGS });
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
  },

  backupToFirestore: async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    await setDoc(doc(db, 'users', uid, 'backups', 'settings'), {
      settings: get().settings, createdAt: serverTimestamp(),
    });
  },

  restoreFromFirestore: async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const snap = await getDoc(doc(db, 'users', uid, 'backups', 'settings'));
    if (snap.exists()) {
      const data = snap.data();
      const restored = { ...DEFAULT_SETTINGS, ...data.settings };
      set({ settings: restored });
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(restored));
    }
  },

  exportBackup: async () => {
    return JSON.stringify({ settings: get().settings, exportedAt: new Date().toISOString(), version: '1.0.0' }, null, 2);
  },

  importBackup: async (json) => {
    try {
      const parsed = JSON.parse(json);
      if (parsed.settings) {
        const imported = { ...DEFAULT_SETTINGS, ...parsed.settings };
        set({ settings: imported });
        await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(imported));
      }
    } catch {}
  },

  clearCache: async () => {
    try {
      const cacheDir = ExpoFileSystem.cacheDirectory;
      if (!cacheDir) return 0;
      const files = await ExpoFileSystem.readDirectoryAsync(cacheDir);
      let freed = 0;
      for (const file of files) {
        try {
          const info = await ExpoFileSystem.getInfoAsync(cacheDir + file) as any;
          freed += info.size ?? 0;
          await ExpoFileSystem.deleteAsync(cacheDir + file, { idempotent: true });
        } catch {}
      }
      return freed;
    } catch { return 0; }
  },

  getCacheSize: async () => {
    try {
      const cacheDir = ExpoFileSystem.cacheDirectory;
      if (!cacheDir) return 0;
      const files = await ExpoFileSystem.readDirectoryAsync(cacheDir);
      let total = 0;
      for (const file of files) {
        try {
          const info = await ExpoFileSystem.getInfoAsync(cacheDir + file) as any;
          total += info.size ?? 0;
        } catch {}
      }
      return total;
    } catch { return 0; }
  },

  checkBiometric: async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    const available = hasHardware && enrolled;
    set({ biometricAvailable: available });
    return available;
  },

  authenticateBiometric: async () => {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Authenticate to access SONA AI',
      cancelLabel: 'Cancel',
      fallbackLabel: 'Use Passcode',
    });
    return result.success;
  },

  setSearchQuery: (searchQuery) => set({ searchQuery }),
  getVersion: () => '1.0.0',
}));
