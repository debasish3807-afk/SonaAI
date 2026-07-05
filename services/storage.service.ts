/**
 * SONA AI — Storage Service
 * Local storage via AsyncStorage + Firebase Cloud Storage for file uploads
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  uploadString,
} from 'firebase/storage';
import { storage as firebaseStorage } from '@/services/firebase';
import { auth } from '@/services/firebase';

const PREFIX = 'sona_';

/**
 * Local key-value storage backed by AsyncStorage.
 * Used for persisting app state, preferences, and cached data.
 */
export const storage = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(`${PREFIX}${key}`);
      return value ? JSON.parse(value) : null;
    } catch {
      return null;
    }
  },

  async set(key: string, value: unknown): Promise<void> {
    try {
      await AsyncStorage.setItem(`${PREFIX}${key}`, JSON.stringify(value));
    } catch {}
  },

  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(`${PREFIX}${key}`);
    } catch {}
  },

  async clear(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const sonaKeys = keys.filter(k => k.startsWith(PREFIX));
      await AsyncStorage.multiRemove(sonaKeys);
    } catch {}
  },
};

/**
 * Firebase Cloud Storage service for file upload/download/delete operations.
 */
export const fileStorage = {
  /**
   * Uploads a file to Firebase Storage.
   * Files are stored under `uploads/{userId}/{filename}`.
   * Returns the public download URL.
   */
  async upload(file: { uri: string; name: string; type: string }): Promise<string> {
    const user = auth.currentUser;
    const userId = user?.uid ?? 'anonymous';
    const timestamp = Date.now();
    const storagePath = `uploads/${userId}/${timestamp}_${file.name}`;
    const storageRef = ref(firebaseStorage, storagePath);

    // Fetch the file as a blob for upload
    const response = await fetch(file.uri);
    const blob = await response.blob();

    const metadata = {
      contentType: file.type,
      customMetadata: {
        uploadedBy: userId,
        originalName: file.name,
      },
    };

    await uploadBytes(storageRef, blob, metadata);
    const downloadUrl = await getDownloadURL(storageRef);
    return downloadUrl;
  },

  /**
   * Uploads a base64-encoded string to Firebase Storage.
   * Returns the public download URL.
   */
  async uploadBase64(
    base64Data: string,
    fileName: string,
    contentType: string
  ): Promise<string> {
    const user = auth.currentUser;
    const userId = user?.uid ?? 'anonymous';
    const timestamp = Date.now();
    const storagePath = `uploads/${userId}/${timestamp}_${fileName}`;
    const storageRef = ref(firebaseStorage, storagePath);

    await uploadString(storageRef, base64Data, 'base64', {
      contentType,
      customMetadata: {
        uploadedBy: userId,
        originalName: fileName,
      },
    });

    const downloadUrl = await getDownloadURL(storageRef);
    return downloadUrl;
  },

  /**
   * Gets the download URL for a file stored at the given path.
   */
  async download(path: string): Promise<string> {
    const storageRef = ref(firebaseStorage, path);
    return await getDownloadURL(storageRef);
  },

  /**
   * Deletes a file from Firebase Storage at the given path.
   */
  async delete(path: string): Promise<void> {
    const storageRef = ref(firebaseStorage, path);
    await deleteObject(storageRef);
  },

  /**
   * Gets a storage reference path for a user-specific upload.
   */
  getUserUploadPath(fileName: string): string {
    const user = auth.currentUser;
    const userId = user?.uid ?? 'anonymous';
    return `uploads/${userId}/${Date.now()}_${fileName}`;
  },
};
