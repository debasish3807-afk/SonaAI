/**
 * SONA AI — Storage Store (Phase 6)
 * Complete Firebase Storage integration with upload/download/delete,
 * progress tracking, retry, cancel, compression, and caching.
 */

import { create } from 'zustand';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject, getMetadata, UploadTask } from 'firebase/storage';
import { storage as firebaseStorage, auth } from '@/services/firebase';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type FileType = 'image' | 'video' | 'audio' | 'pdf' | 'document';
export type UploadStatus = 'pending' | 'uploading' | 'success' | 'error' | 'cancelled';

export interface UploadItem {
  id: string;
  localUri: string;
  remoteUrl?: string;
  storagePath: string;
  fileName: string;
  fileType: FileType;
  mimeType: string;
  size: number;
  progress: number;
  status: UploadStatus;
  error?: string;
  createdAt: string;
}

export interface StorageMetadata {
  name: string;
  size: number;
  contentType: string;
  fullPath: string;
  downloadUrl: string;
  timeCreated: string;
  updated: string;
}

interface StorageState {
  uploads: UploadItem[];
  cache: Record<string, string>;
  isUploading: boolean;
  _tasks: Map<string, UploadTask>;

  // Upload
  uploadFile: (uri: string, path: string, fileName: string, type: FileType, mimeType: string) => Promise<string>;
  uploadImage: (uri: string, path?: string, compress?: boolean) => Promise<string>;
  uploadAvatar: (uri: string) => Promise<string>;
  uploadChatAttachment: (uri: string, convId: string, name: string, mime: string) => Promise<string>;
  uploadMemoryAttachment: (uri: string, memId: string, name: string, mime: string) => Promise<string>;

  // Control
  cancelUpload: (id: string) => void;
  retryUpload: (id: string) => Promise<string>;
  removeUpload: (id: string) => void;

  // File operations
  deleteFile: (storagePath: string) => Promise<void>;
  getDownloadUrl: (storagePath: string) => Promise<string>;
  getFileMetadata: (storagePath: string) => Promise<StorageMetadata | null>;

  // Compression
  compressImage: (uri: string, quality?: number) => Promise<string>;

  // Cache
  getCached: (url: string) => Promise<string | null>;
  cacheFile: (url: string, localPath: string) => Promise<void>;
  clearCache: () => Promise<number>;
  getCacheSize: () => Promise<number>;
}

const CACHE_KEY = 'sona_storage_cache';
const generateId = () => `upload_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

function getUid(): string { return auth.currentUser?.uid ?? 'anonymous'; }

function detectFileType(mime: string): FileType {
  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('video/')) return 'video';
  if (mime.startsWith('audio/')) return 'audio';
  if (mime.includes('pdf')) return 'pdf';
  return 'document';
}

export const useStorageStore = create<StorageState>((set, get) => ({
  uploads: [],
  cache: {},
  isUploading: false,
  _tasks: new Map(),

  uploadFile: async (uri, path, fileName, type, mimeType) => {
    const id = generateId();
    const size = (await FileSystem.getInfoAsync(uri) as any).size ?? 0;
    const item: UploadItem = {
      id, localUri: uri, storagePath: path, fileName, fileType: type,
      mimeType, size, progress: 0, status: 'pending', createdAt: new Date().toISOString(),
    };
    set(s => ({ uploads: [item, ...s.uploads], isUploading: true }));

    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const storageRef = ref(firebaseStorage, path);
      const task = uploadBytesResumable(storageRef, blob, { contentType: mimeType });

      get()._tasks.set(id, task);

      return new Promise<string>((resolve, reject) => {
        task.on('state_changed',
          (snapshot) => {
            const progress = snapshot.bytesTransferred / snapshot.totalBytes;
            set(s => ({
              uploads: s.uploads.map(u => u.id === id ? { ...u, progress, status: 'uploading' } : u),
            }));
          },
          (error) => {
            const status: UploadStatus = error.code === 'storage/canceled' ? 'cancelled' : 'error';
            set(s => ({
              uploads: s.uploads.map(u => u.id === id ? { ...u, status, error: error.message } : u),
              isUploading: s.uploads.some(u => u.id !== id && u.status === 'uploading'),
            }));
            get()._tasks.delete(id);
            reject(error);
          },
          async () => {
            const url = await getDownloadURL(task.snapshot.ref);
            set(s => ({
              uploads: s.uploads.map(u => u.id === id ? { ...u, progress: 1, status: 'success', remoteUrl: url } : u),
              isUploading: s.uploads.some(u => u.id !== id && u.status === 'uploading'),
            }));
            get()._tasks.delete(id);
            resolve(url);
          }
        );
      });
    } catch (e: any) {
      set(s => ({
        uploads: s.uploads.map(u => u.id === id ? { ...u, status: 'error', error: e.message } : u),
        isUploading: false,
      }));
      throw e;
    }
  },

  uploadImage: async (uri, path, compress = true) => {
    const finalUri = compress ? await get().compressImage(uri) : uri;
    const uid = getUid();
    const name = `img_${Date.now()}.jpg`;
    const storagePath = path ?? `users/${uid}/images/${name}`;
    return get().uploadFile(finalUri, storagePath, name, 'image', 'image/jpeg');
  },

  uploadAvatar: async (uri) => {
    const compressed = await get().compressImage(uri, 0.8);
    const uid = getUid();
    const path = `users/${uid}/avatar.jpg`;
    return get().uploadFile(compressed, path, 'avatar.jpg', 'image', 'image/jpeg');
  },

  uploadChatAttachment: async (uri, convId, name, mime) => {
    const uid = getUid();
    const path = `users/${uid}/chats/${convId}/${Date.now()}_${name}`;
    return get().uploadFile(uri, path, name, detectFileType(mime), mime);
  },

  uploadMemoryAttachment: async (uri, memId, name, mime) => {
    const uid = getUid();
    const path = `users/${uid}/memories/${memId}/${Date.now()}_${name}`;
    return get().uploadFile(uri, path, name, detectFileType(mime), mime);
  },

  cancelUpload: (id) => {
    const task = get()._tasks.get(id);
    if (task) { task.cancel(); get()._tasks.delete(id); }
    set(s => ({ uploads: s.uploads.map(u => u.id === id ? { ...u, status: 'cancelled' } : u) }));
  },

  retryUpload: async (id) => {
    const item = get().uploads.find(u => u.id === id);
    if (!item) throw new Error('Upload not found');
    set(s => ({ uploads: s.uploads.filter(u => u.id !== id) }));
    return get().uploadFile(item.localUri, item.storagePath, item.fileName, item.fileType, item.mimeType);
  },

  removeUpload: (id) => {
    get()._tasks.get(id)?.cancel();
    get()._tasks.delete(id);
    set(s => ({ uploads: s.uploads.filter(u => u.id !== id) }));
  },

  deleteFile: async (storagePath) => {
    const storageRef = ref(firebaseStorage, storagePath);
    await deleteObject(storageRef);
  },

  getDownloadUrl: async (storagePath) => {
    const storageRef = ref(firebaseStorage, storagePath);
    return getDownloadURL(storageRef);
  },

  getFileMetadata: async (storagePath) => {
    try {
      const storageRef = ref(firebaseStorage, storagePath);
      const meta = await getMetadata(storageRef);
      const url = await getDownloadURL(storageRef);
      return {
        name: meta.name, size: meta.size, contentType: meta.contentType ?? '',
        fullPath: meta.fullPath, downloadUrl: url,
        timeCreated: meta.timeCreated, updated: meta.updated,
      };
    } catch { return null; }
  },

  compressImage: async (uri, quality = 0.7) => {
    const result = await ImageManipulator.manipulateAsync(
      uri, [{ resize: { width: 1200 } }], { compress: quality, format: ImageManipulator.SaveFormat.JPEG }
    );
    return result.uri;
  },

  getCached: async (url) => {
    const { cache } = get();
    if (cache[url]) {
      const info = await FileSystem.getInfoAsync(cache[url]);
      if (info.exists) return cache[url];
    }
    return null;
  },

  cacheFile: async (url, localPath) => {
    set(s => ({ cache: { ...s.cache, [url]: localPath } }));
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(get().cache));
  },

  clearCache: async () => {
    const { cache } = get();
    let freed = 0;
    for (const path of Object.values(cache)) {
      try {
        const info = await FileSystem.getInfoAsync(path) as any;
        if (info.exists) { freed += info.size ?? 0; await FileSystem.deleteAsync(path, { idempotent: true }); }
      } catch {}
    }
    set({ cache: {} });
    await AsyncStorage.removeItem(CACHE_KEY);
    return freed;
  },

  getCacheSize: async () => {
    const { cache } = get();
    let total = 0;
    for (const path of Object.values(cache)) {
      try {
        const info = await FileSystem.getInfoAsync(path) as any;
        if (info.exists) total += info.size ?? 0;
      } catch {}
    }
    return total;
  },
}));
