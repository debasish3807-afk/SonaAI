/**
 * SONA AI — Security Store
 * Complete security module: app lock, biometric/PIN auth,
 * session security, privacy, data security, Firebase verification.
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import * as FileSystem from 'expo-file-system';
import { AppState, AppStateStatus } from 'react-native';
import { auth } from '@/services/firebase';
import {
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'firebase/auth';

// ─── Types ────────────────────────────────────────────────────────────────────

export type AutoLockTimeout = '1min' | '5min' | '15min' | '30min' | 'never';
export type PinLength = 4 | 6;
export type AuthMethod = 'biometric' | 'pin' | 'credential';

export interface SecuritySettings {
  appLockEnabled: boolean;
  lockOnLaunch: boolean;
  lockOnBackground: boolean;
  lockAfterReboot: boolean;
  autoLockTimeout: AutoLockTimeout;

  biometricEnabled: boolean;
  pinEnabled: boolean;
  pinLength: PinLength;
  deviceCredentialEnabled: boolean;

  sessionTimeoutMinutes: number;
  hideInRecents: boolean;
  blockScreenshots: boolean;
  blurOnBackground: boolean;
  clipboardAutoClear: boolean;
  clipboardClearDelay: number;
}

export interface SecurityState {
  biometricHardware: boolean;
  biometricEnrolled: boolean;
  biometricTypes: LocalAuthentication.AuthenticationType[];
  isLocked: boolean;
  isAuthenticated: boolean;
  lastActiveTimestamp: number;
  failedAttempts: number;
  lockoutUntil: number | null;
  firebaseSecurityReport: FirebaseSecurityReport | null;
}

export interface FirebaseSecurityReport {
  authValid: boolean;
  appCheckConfigured: boolean;
  timestamp: string;
  notes: string[];
}

interface SecurityStoreState extends SecurityState {
  settings: SecuritySettings;

  // Lifecycle
  initialize: () => Promise<void>;
  onAppStateChange: (state: AppStateStatus) => void;
  checkAutoLock: () => void;

  // Authentication
  authenticateWithBiometric: () => Promise<boolean>;
  authenticateWithPin: (pin: string) => Promise<boolean>;
  authenticateWithCredential: () => Promise<boolean>;
  authenticateForSensitiveAction: () => Promise<boolean>;
  reauthenticateFirebase: (password: string) => Promise<boolean>;

  // PIN Management
  setPin: (pin: string) => Promise<void>;
  changePin: (oldPin: string, newPin: string) => Promise<boolean>;
  removePin: () => Promise<void>;
  verifyPin: (pin: string) => Promise<boolean>;
  forgotPin: (password: string) => Promise<boolean>;

  // Lock Control
  lock: () => void;
  unlock: () => void;
  updateLastActive: () => void;

  // Settings
  updateSettings: (s: Partial<SecuritySettings>) => Promise<void>;

  // Privacy
  clearClipboardAfterDelay: () => void;

  // Data Security
  encryptData: (data: string) => Promise<string>;
  decryptData: (encrypted: string) => Promise<string>;
  secureStore: (key: string, value: string) => Promise<void>;
  secureRetrieve: (key: string) => Promise<string | null>;
  secureDelete: (key: string) => Promise<void>;
  clearCacheOnLogout: () => Promise<void>;
  clearTempFiles: () => Promise<void>;

  // Firebase Security
  verifyFirebaseSecurity: () => Promise<FirebaseSecurityReport>;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SETTINGS_KEY = 'sona_security_settings';
const PIN_KEY = 'sona_security_pin';
const ENCRYPTION_KEY = 'sona_encryption_key';
const LAST_ACTIVE_KEY = 'sona_last_active';
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 300000; // 5 minutes

const DEFAULT_SETTINGS: SecuritySettings = {
  appLockEnabled: false,
  lockOnLaunch: true,
  lockOnBackground: true,
  lockAfterReboot: true,
  autoLockTimeout: '5min',
  biometricEnabled: false,
  pinEnabled: false,
  pinLength: 4,
  deviceCredentialEnabled: false,
  sessionTimeoutMinutes: 30,
  hideInRecents: false,
  blockScreenshots: false,
  blurOnBackground: false,
  clipboardAutoClear: false,
  clipboardClearDelay: 30,
};

function getTimeoutMs(timeout: AutoLockTimeout): number {
  switch (timeout) {
    case '1min': return 60000;
    case '5min': return 300000;
    case '15min': return 900000;
    case '30min': return 1800000;
    case 'never': return Infinity;
  }
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useSecurityStore = create<SecurityStoreState>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  biometricHardware: false,
  biometricEnrolled: false,
  biometricTypes: [],
  isLocked: false,
  isAuthenticated: false,
  lastActiveTimestamp: Date.now(),
  failedAttempts: 0,
  lockoutUntil: null,
  firebaseSecurityReport: null,

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  initialize: async () => {
    // Load settings
    try {
      const data = await AsyncStorage.getItem(SETTINGS_KEY);
      if (data) set({ settings: { ...DEFAULT_SETTINGS, ...JSON.parse(data) } });
    } catch {}

    // Check biometric availability
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
    set({ biometricHardware: hasHardware, biometricEnrolled: isEnrolled, biometricTypes: types });

    // Check if should lock on launch
    const { settings } = get();
    if (settings.appLockEnabled && settings.lockOnLaunch) {
      set({ isLocked: true, isAuthenticated: false });
    }

    // Load last active
    try {
      const ts = await AsyncStorage.getItem(LAST_ACTIVE_KEY);
      if (ts) set({ lastActiveTimestamp: parseInt(ts, 10) });
    } catch {}
  },

  onAppStateChange: (nextState: AppStateStatus) => {
    const { settings, isAuthenticated } = get();
    if (!settings.appLockEnabled) return;

    if (nextState === 'background' || nextState === 'inactive') {
      get().updateLastActive();
    }

    if (nextState === 'active' && isAuthenticated) {
      get().checkAutoLock();
    }
  },

  checkAutoLock: () => {
    const { settings, lastActiveTimestamp } = get();
    if (!settings.appLockEnabled || !settings.lockOnBackground) return;
    const elapsed = Date.now() - lastActiveTimestamp;
    const timeout = getTimeoutMs(settings.autoLockTimeout);
    if (elapsed > timeout) {
      set({ isLocked: true, isAuthenticated: false });
    }
  },

  // ── Authentication ─────────────────────────────────────────────────────────

  authenticateWithBiometric: async () => {
    const { lockoutUntil, failedAttempts } = get();
    if (lockoutUntil && Date.now() < lockoutUntil) return false;

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Unlock SONA AI',
      cancelLabel: 'Use PIN',
      fallbackLabel: 'Use PIN',
      disableDeviceFallback: true,
    });

    if (result.success) {
      set({ isLocked: false, isAuthenticated: true, failedAttempts: 0, lockoutUntil: null });
      get().updateLastActive();
      return true;
    }

    const attempts = failedAttempts + 1;
    if (attempts >= MAX_ATTEMPTS) {
      set({ failedAttempts: attempts, lockoutUntil: Date.now() + LOCKOUT_DURATION });
    } else {
      set({ failedAttempts: attempts });
    }
    return false;
  },

  authenticateWithPin: async (pin: string) => {
    const valid = await get().verifyPin(pin);
    if (valid) {
      set({ isLocked: false, isAuthenticated: true, failedAttempts: 0, lockoutUntil: null });
      get().updateLastActive();
      return true;
    }

    const attempts = get().failedAttempts + 1;
    if (attempts >= MAX_ATTEMPTS) {
      set({ failedAttempts: attempts, lockoutUntil: Date.now() + LOCKOUT_DURATION });
    } else {
      set({ failedAttempts: attempts });
    }
    return false;
  },

  authenticateWithCredential: async () => {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Verify your identity',
      cancelLabel: 'Cancel',
      disableDeviceFallback: false,
    });
    if (result.success) {
      set({ isLocked: false, isAuthenticated: true, failedAttempts: 0, lockoutUntil: null });
      get().updateLastActive();
      return true;
    }
    return false;
  },

  authenticateForSensitiveAction: async () => {
    const { settings } = get();
    if (settings.biometricEnabled) {
      return get().authenticateWithBiometric();
    }
    if (settings.deviceCredentialEnabled) {
      return get().authenticateWithCredential();
    }
    return true;
  },

  reauthenticateFirebase: async (password: string) => {
    const user = auth.currentUser;
    if (!user || !user.email) return false;
    try {
      const cred = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, cred);
      return true;
    } catch {
      return false;
    }
  },

  // ── PIN Management ─────────────────────────────────────────────────────────

  setPin: async (pin: string) => {
    const hash = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, pin);
    await SecureStore.setItemAsync(PIN_KEY, hash);
    await get().updateSettings({ pinEnabled: true, pinLength: pin.length as PinLength });
  },

  changePin: async (oldPin: string, newPin: string) => {
    const valid = await get().verifyPin(oldPin);
    if (!valid) return false;
    await get().setPin(newPin);
    return true;
  },

  removePin: async () => {
    await SecureStore.deleteItemAsync(PIN_KEY);
    await get().updateSettings({ pinEnabled: false });
  },

  verifyPin: async (pin: string) => {
    const stored = await SecureStore.getItemAsync(PIN_KEY);
    if (!stored) return false;
    const hash = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, pin);
    return hash === stored;
  },

  forgotPin: async (password: string) => {
    const ok = await get().reauthenticateFirebase(password);
    if (ok) {
      await SecureStore.deleteItemAsync(PIN_KEY);
      set({ isLocked: false, isAuthenticated: true, failedAttempts: 0, lockoutUntil: null });
      await get().updateSettings({ pinEnabled: false });
      return true;
    }
    return false;
  },

  // ── Lock Control ───────────────────────────────────────────────────────────

  lock: () => set({ isLocked: true, isAuthenticated: false }),
  unlock: () => set({ isLocked: false, isAuthenticated: true }),

  updateLastActive: () => {
    const ts = Date.now();
    set({ lastActiveTimestamp: ts });
    AsyncStorage.setItem(LAST_ACTIVE_KEY, ts.toString()).catch(() => {});
  },

  // ── Settings ───────────────────────────────────────────────────────────────

  updateSettings: async (updates) => {
    const newSettings = { ...get().settings, ...updates };
    set({ settings: newSettings });
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
  },

  // ── Privacy ────────────────────────────────────────────────────────────────

  clearClipboardAfterDelay: () => {
    const { settings } = get();
    if (!settings.clipboardAutoClear) return;
    setTimeout(async () => {
      try {
        const Clipboard = await import('expo-clipboard');
        await Clipboard.setStringAsync('');
      } catch {}
    }, settings.clipboardClearDelay * 1000);
  },

  // ── Data Security ──────────────────────────────────────────────────────────

  encryptData: async (data: string) => {
    // For data within SecureStore limits (2KB), use native OS encryption directly.
    // For larger data, use Web Crypto AES-GCM (available in Expo SDK 53+ via Hermes).
    if (data.length <= 2048) {
      // Store directly in SecureStore — uses iOS Keychain / Android Keystore (AES-256)
      const storageKey = `${ENCRYPTION_KEY}_data_${await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        data.slice(0, 32)
      ).then(h => h.slice(0, 16))}`;
      await SecureStore.setItemAsync(storageKey, data);
      return `__SECURE__${storageKey}`;
    }

    // Large data: AES-GCM via Web Crypto API
    try {
      const encoder = new TextEncoder();
      const plaintext = encoder.encode(data);

      // Generate or retrieve encryption key
      let rawKey = await SecureStore.getItemAsync(ENCRYPTION_KEY);
      if (!rawKey) {
        rawKey = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${Date.now()}_${Math.random()}`);
        await SecureStore.setItemAsync(ENCRYPTION_KEY, rawKey);
      }

      // Derive a CryptoKey from the stored key material
      const keyMaterial = encoder.encode(rawKey);
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyMaterial.slice(0, 32),
        { name: 'AES-GCM' },
        false,
        ['encrypt']
      );

      // Generate random IV (12 bytes for AES-GCM)
      const iv = crypto.getRandomValues(new Uint8Array(12));

      // Encrypt
      const ciphertext = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        cryptoKey,
        plaintext
      );

      // Encode IV + ciphertext as hex
      const ivHex = Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join('');
      const ctHex = Array.from(new Uint8Array(ciphertext)).map(b => b.toString(16).padStart(2, '0')).join('');
      return `__AES__${ivHex}:${ctHex}`;
    } catch {
      // Fallback: store in SecureStore if Web Crypto unavailable
      const fallbackKey = `${ENCRYPTION_KEY}_fb_${Date.now()}`;
      await SecureStore.setItemAsync(fallbackKey, data.slice(0, 2048));
      return `__SECURE__${fallbackKey}`;
    }
  },

  decryptData: async (encrypted: string) => {
    try {
      if (!encrypted) return '';

      // SecureStore-backed encryption
      if (encrypted.startsWith('__SECURE__')) {
        const storageKey = encrypted.slice(10);
        return (await SecureStore.getItemAsync(storageKey)) ?? '';
      }

      // AES-GCM decryption
      if (encrypted.startsWith('__AES__')) {
        const payload = encrypted.slice(7);
        const [ivHex, ctHex] = payload.split(':');
        if (!ivHex || !ctHex) return '';

        const iv = new Uint8Array(ivHex.match(/.{2}/g)!.map(b => parseInt(b, 16)));
        const ciphertext = new Uint8Array(ctHex.match(/.{2}/g)!.map(b => parseInt(b, 16)));

        let rawKey = await SecureStore.getItemAsync(ENCRYPTION_KEY);
        if (!rawKey) return '';

        const encoder = new TextEncoder();
        const keyMaterial = encoder.encode(rawKey);
        const cryptoKey = await crypto.subtle.importKey(
          'raw',
          keyMaterial.slice(0, 32),
          { name: 'AES-GCM' },
          false,
          ['decrypt']
        );

        const plaintext = await crypto.subtle.decrypt(
          { name: 'AES-GCM', iv },
          cryptoKey,
          ciphertext
        );

        return new TextDecoder().decode(plaintext);
      }

      return '';
    } catch { return ''; }
  },

  secureStore: async (key: string, value: string) => {
    await SecureStore.setItemAsync(key, value);
  },

  secureRetrieve: async (key: string) => {
    return await SecureStore.getItemAsync(key);
  },

  secureDelete: async (key: string) => {
    await SecureStore.deleteItemAsync(key);
  },

  clearCacheOnLogout: async () => {
    try {
      const cacheDir = FileSystem.cacheDirectory;
      if (cacheDir) {
        const files = await FileSystem.readDirectoryAsync(cacheDir);
        for (const file of files) {
          await FileSystem.deleteAsync(cacheDir + file, { idempotent: true }).catch(() => {});
        }
      }
      await AsyncStorage.multiRemove([
        'sona_conversations_v3', 'sona_memories_v2', 'sona_memories_v3',
        'sona_storage_cache', LAST_ACTIVE_KEY,
      ]);
    } catch {}
  },

  clearTempFiles: async () => {
    try {
      const cacheDir = FileSystem.cacheDirectory;
      if (cacheDir) {
        const files = await FileSystem.readDirectoryAsync(cacheDir);
        for (const f of files) {
          if (f.startsWith('sona_') || f.startsWith('memory_') || f.startsWith('memories_')) {
            await FileSystem.deleteAsync(cacheDir + f, { idempotent: true }).catch(() => {});
          }
        }
      }
    } catch {}
  },

  // ── Firebase Security ──────────────────────────────────────────────────────

  verifyFirebaseSecurity: async () => {
    const notes: string[] = [];
    let authValid = false;
    let appCheckConfigured = false;

    // Verify auth state
    const user = auth.currentUser;
    if (user) {
      try {
        const token = await user.getIdToken(true);
        authValid = !!token;
      } catch {
        notes.push('Firebase Auth token refresh failed. Session may be expired.');
      }
    } else {
      notes.push('No authenticated user. Firestore/Storage rules will reject writes.');
    }

    // Detect App Check (we do NOT configure it, just detect)
    try {
      // App Check is typically initialized at app start. If getApps().length > 0
      // and appCheck was initialized, it would be available. We check for the env var.
      const appCheckToken = process.env.EXPO_PUBLIC_FIREBASE_APP_CHECK_TOKEN;
      appCheckConfigured = !!appCheckToken;
      if (!appCheckConfigured) {
        notes.push('Firebase App Check is not configured. For production, enable App Check in Firebase Console and add the debug/production token to your environment.');
      }
    } catch {
      notes.push('App Check detection failed.');
    }

    // General notes
    if (authValid) {
      notes.push('Firestore security rules should use `request.auth != null` for authenticated access.');
      notes.push('Storage rules should restrict paths to `users/{uid}/` using `request.auth.uid`.');
    }

    const report: FirebaseSecurityReport = {
      authValid, appCheckConfigured, timestamp: new Date().toISOString(), notes,
    };

    set({ firebaseSecurityReport: report });
    return report;
  },
}));
