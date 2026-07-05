// services/secureStore.ts
// Simple wrapper around Expo SecureStore for secure key storage.

import * as SecureStore from 'expo-secure-store';

const PREFIX = (process.env.EXPO_SECURE_STORE_KEY_PREFIX ?? 'sona_') as string;

export async function setSecureItem(key: string, value: string): Promise<void> {
  const k = PREFIX + key;
  await SecureStore.setItemAsync(k, value, { keychainAccessible: SecureStore.ALWAYS_THIS_DEVICE_ONLY });
}

export async function getSecureItem(key: string): Promise<string | null> {
  const k = PREFIX + key;
  return await SecureStore.getItemAsync(k);
}

export async function deleteSecureItem(key: string): Promise<void> {
  const k = PREFIX + key;
  await SecureStore.deleteItemAsync(k);
}
