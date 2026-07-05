/**
 * SONA AI — Notification Store (Phase 5)
 * Push, local, reminder, and background notifications.
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { doc, setDoc, collection, getDocs, deleteDoc, query, orderBy, limit, serverTimestamp, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { db, auth } from '@/services/firebase';

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  type: 'chat' | 'memory' | 'reminder' | 'system' | 'daily';
  isRead: boolean;
  data?: Record<string, string>;
  createdAt: string;
}

export interface NotificationSettings {
  enabled: boolean;
  chat: boolean;
  memory: boolean;
  reminder: boolean;
  daily: boolean;
  sound: boolean;
  vibration: boolean;
  dailyReminderTime: string;
}

interface NotificationState {
  notifications: NotificationItem[];
  settings: NotificationSettings;
  pushToken: string | null;
  isLoading: boolean;
  _unsub: Unsubscribe | null;

  initialize: () => Promise<void>;
  cleanup: () => void;

  // Registration
  registerPushToken: () => Promise<string | null>;

  // Local Notifications
  scheduleLocal: (title: string, body: string, trigger?: any, data?: Record<string, string>) => Promise<string>;
  scheduleReminder: (title: string, body: string, date: Date, repeat?: 'daily' | 'weekly') => Promise<string>;
  scheduleDailyReminder: (hour: number, minute: number) => Promise<void>;
  cancelNotification: (id: string) => Promise<void>;
  cancelAll: () => Promise<void>;

  // History
  markAsRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  clearHistory: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;

  // Settings
  updateSettings: (settings: Partial<NotificationSettings>) => Promise<void>;
  loadSettings: () => Promise<void>;

  // Unread count
  unreadCount: () => number;
}

const SETTINGS_KEY = 'sona_notif_settings';
const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: true, chat: true, memory: true, reminder: true,
  daily: false, sound: true, vibration: true, dailyReminderTime: '09:00',
};

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  settings: DEFAULT_SETTINGS,
  pushToken: null,
  isLoading: false,
  _unsub: null,

  initialize: async () => {
    await get().loadSettings();
    await get().registerPushToken();

    const uid = auth.currentUser?.uid;
    if (!uid) return;

    // Listen to notification history from Firestore
    const q = query(collection(db, 'users', uid, 'notifications'), orderBy('createdAt', 'desc'), limit(50));
    const unsub = onSnapshot(q, (snap) => {
      const items: NotificationItem[] = snap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id, title: data.title ?? '', body: data.body ?? '',
          type: data.type ?? 'system', isRead: data.isRead ?? false,
          data: data.data, createdAt: data.createdAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
        };
      });
      set({ notifications: items });
    });
    set({ _unsub: unsub });
  },

  cleanup: () => { get()._unsub?.(); set({ _unsub: null }); },

  registerPushToken: async () => {
    if (!Device.isDevice) return null;
    const { status: existing } = await Notifications.getPermissionsAsync();
    let finalStatus = existing;
    if (existing !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') return null;

    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    });
    const token = tokenData.data;
    set({ pushToken: token });

    // Store in Firestore
    const uid = auth.currentUser?.uid;
    if (uid && token) {
      await setDoc(doc(db, 'users', uid, 'fcmTokens', token), {
        token, platform: Platform.OS, createdAt: serverTimestamp(),
      });
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default', importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250], lightColor: '#7C6FFF',
      });
    }
    return token;
  },

  scheduleLocal: async (title, body, trigger, data) => {
    const id = await Notifications.scheduleNotificationAsync({
      content: { title, body, data: data ?? {}, sound: get().settings.sound },
      trigger: trigger ?? null,
    });

    // Save to Firestore history
    const uid = auth.currentUser?.uid;
    if (uid) {
      await setDoc(doc(db, 'users', uid, 'notifications', id), {
        title, body, type: 'system', isRead: false, data, createdAt: serverTimestamp(),
      });
    }
    return id;
  },

  scheduleReminder: async (title, body, date, repeat) => {
    const trigger: any = { date };
    if (repeat === 'daily') trigger.repeats = true;
    return get().scheduleLocal(title, body, trigger, { type: 'reminder' });
  },

  scheduleDailyReminder: async (hour, minute) => {
    await Notifications.cancelAllScheduledNotificationsAsync();
    await Notifications.scheduleNotificationAsync({
      content: { title: 'Daily Check-in', body: 'Review your memories and plan your day with SONA AI.', sound: true },
      trigger: { hour, minute, repeats: true } as any,
    });
    await get().updateSettings({ daily: true, dailyReminderTime: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}` });
  },

  cancelNotification: async (id) => { await Notifications.cancelScheduledNotificationAsync(id); },
  cancelAll: async () => { await Notifications.cancelAllScheduledNotificationsAsync(); },

  markAsRead: async (id) => {
    set(s => ({ notifications: s.notifications.map(n => n.id === id ? { ...n, isRead: true } : n) }));
    const uid = auth.currentUser?.uid;
    if (uid) { await setDoc(doc(db, 'users', uid, 'notifications', id), { isRead: true }, { merge: true }); }
  },

  markAllRead: async () => {
    set(s => ({ notifications: s.notifications.map(n => ({ ...n, isRead: true })) }));
    const uid = auth.currentUser?.uid;
    if (uid) {
      const snap = await getDocs(query(collection(db, 'users', uid, 'notifications')));
      for (const d of snap.docs) { await setDoc(d.ref, { isRead: true }, { merge: true }); }
    }
  },

  clearHistory: async () => {
    set({ notifications: [] });
    const uid = auth.currentUser?.uid;
    if (uid) {
      const snap = await getDocs(query(collection(db, 'users', uid, 'notifications')));
      for (const d of snap.docs) { await deleteDoc(d.ref); }
    }
  },

  deleteNotification: async (id) => {
    set(s => ({ notifications: s.notifications.filter(n => n.id !== id) }));
    const uid = auth.currentUser?.uid;
    if (uid) { await deleteDoc(doc(db, 'users', uid, 'notifications', id)); }
  },

  updateSettings: async (updates) => {
    const newSettings = { ...get().settings, ...updates };
    set({ settings: newSettings });
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
  },

  loadSettings: async () => {
    try {
      const data = await AsyncStorage.getItem(SETTINGS_KEY);
      if (data) set({ settings: { ...DEFAULT_SETTINGS, ...JSON.parse(data) } });
    } catch {}
  },

  unreadCount: () => get().notifications.filter(n => !n.isRead).length,
}));
