/**
 * SONA AI — Firebase Cloud Messaging Service
 *
 * Handles push notification registration and token management.
 * - Web: Uses Firebase Messaging SDK directly
 * - Mobile (iOS/Android): Uses expo-notifications + expo-device
 *   (Firebase JS SDK messaging is not supported on React Native)
 *
 * The FCM token is stored in Firestore under users/{uid}/fcmTokens
 * for server-side push notification delivery.
 */

import { Platform } from 'react-native';
import { doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '@/services/firebase';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

// Configure notification handling behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
}

/**
 * Stores the FCM/Expo push token in Firestore for the current user.
 */
async function storeFCMToken(token: string, platform: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;

  const tokenRef = doc(db, 'users', user.uid, 'fcmTokens', token);
  await setDoc(tokenRef, {
    token,
    platform,
    createdAt: serverTimestamp(),
    lastActive: serverTimestamp(),
  });
}

/**
 * Web push notification registration using Firebase Messaging.
 */
async function registerWebPushToken(): Promise<string | null> {
  try {
    const { getMessaging, getToken } = await import('firebase/messaging');
    const { app } = await import('@/services/firebase');
    const messaging = getMessaging(app);

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('[MessagingService] Web notification permission denied');
      return null;
    }

    const vapidKey = process.env.EXPO_PUBLIC_FIREBASE_VAPID_KEY ?? '';
    const token = await getToken(messaging, { vapidKey });

    if (token) {
      await storeFCMToken(token, 'web');
    }
    return token;
  } catch (error) {
    console.warn('[MessagingService] Web push registration error:', error);
    return null;
  }
}

/**
 * Native (iOS/Android) push notification registration using expo-notifications.
 */
async function registerNativePushToken(): Promise<string | null> {
  if (!Device.isDevice) {
    console.warn('[MessagingService] Push notifications require a physical device');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('[MessagingService] Push notification permission denied');
    return null;
  }

  const tokenData = await Notifications.getExpoPushTokenAsync({
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  });

  const token = tokenData.data;
  if (token) {
    await storeFCMToken(token, Platform.OS);
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#7C6FFF',
    });
  }

  return token;
}

/**
 * Registers the device for push notifications and stores the token in Firestore.
 * On web, uses Firebase Messaging. On mobile, uses expo-notifications.
 * Returns the push token string or null if registration fails.
 */
export async function registerForPushNotifications(): Promise<string | null> {
  try {
    if (Platform.OS === 'web') {
      return await registerWebPushToken();
    } else {
      return await registerNativePushToken();
    }
  } catch (error) {
    console.warn('[MessagingService] Push notification registration failed:', error);
    return null;
  }
}

/**
 * Removes a stored FCM token (e.g., on sign-out).
 */
export async function unregisterPushToken(token: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;

  const tokenRef = doc(db, 'users', user.uid, 'fcmTokens', token);
  await deleteDoc(tokenRef);
}

/**
 * Adds a listener for incoming notifications while the app is in the foreground.
 */
export function onNotificationReceived(
  callback: (notification: Notifications.Notification) => void
): () => void {
  const subscription = Notifications.addNotificationReceivedListener(callback);
  return () => subscription.remove();
}

/**
 * Adds a listener for notification interactions (user tapping on a notification).
 */
export function onNotificationResponse(
  callback: (response: Notifications.NotificationResponse) => void
): () => void {
  const subscription = Notifications.addNotificationResponseReceivedListener(callback);
  return () => subscription.remove();
}

/**
 * Schedules a local notification (useful for reminders, timers, etc.)
 */
export async function scheduleLocalNotification(
  payload: NotificationPayload,
  trigger?: Notifications.NotificationTriggerInput
): Promise<string> {
  return await Notifications.scheduleNotificationAsync({
    content: {
      title: payload.title,
      body: payload.body,
      data: payload.data ?? {},
    },
    trigger: trigger ?? null,
  });
}
