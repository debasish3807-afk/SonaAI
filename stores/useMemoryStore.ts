/**
 * SONA AI — Memory Store (Complete Module)
 * Full Firestore-backed memory system with all features.
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  collection, doc, addDoc, updateDoc, deleteDoc, getDocs,
  query, orderBy, onSnapshot, serverTimestamp, Timestamp, Unsubscribe,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, auth, storage as firebaseStorage } from '@/services/firebase';
import * as Notifications from 'expo-notifications';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import * as LocalAuthentication from 'expo-local-authentication';
import { sendChat } from '@/services/gemini.service';

// ─── Types ────────────────────────────────────────────────────────────────────

export type MemoryCategory = 'personal' | 'work' | 'study' | 'finance'
  | 'health' | 'travel' | 'shopping' | 'ideas' | 'tasks' | 'other';
export type ImportanceLevel = 'low' | 'medium' | 'high';
export type SortMode = 'newest' | 'oldest' | 'importance' | 'favorites';
export type MemoryStatus = 'active' | 'archived' | 'trashed';
export type AttachmentType = 'image' | 'pdf' | 'audio' | 'video';
export type RepeatOption = 'none' | 'daily' | 'weekly' | 'monthly';
export type ExportFormat = 'txt' | 'json' | 'pdf';
export type TimelineGroup = 'today' | 'yesterday' | 'thisWeek' | 'thisMonth' | 'older';

export interface Attachment {
  id: string;
  type: AttachmentType;
  uri: string;
  name: string;
  size: number;
  mimeType: string;
}

export interface Reminder {
  date: string;
  repeat: RepeatOption;
  notificationId?: string;
}


export interface Memory {
  id: string;
  title: string;
  content: string;
  category: MemoryCategory;
  importance: ImportanceLevel;
  isFavorite: boolean;
  isPinned: boolean;
  pinOrder: number;
  tags: string[];
  status: MemoryStatus;
  isLocked: boolean;
  attachments: Attachment[];
  reminder?: Reminder;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface TimelineSection {
  title: string;
  key: TimelineGroup;
  data: Memory[];
}

export interface MemoryStats {
  total: number;
  favorites: number;
  archived: number;
  trashed: number;
  byCategory: Record<string, number>;
  byMonth: Record<string, number>;
}


interface MemoryState {
  memories: Memory[];
  searchQuery: string;
  activeCategory: MemoryCategory | 'all';
  activeTag: string | null;
  sortMode: SortMode;
  viewMode: MemoryStatus;
  isLoading: boolean;
  error: string | null;
  _unsubscribe: Unsubscribe | null;

  initialize: () => void;
  cleanup: () => void;

  // CRUD
  addMemory: (data: Omit<Memory, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'pinOrder'>) => Promise<void>;
  updateMemory: (id: string, data: Partial<Omit<Memory, 'id' | 'createdAt'>>) => Promise<void>;
  deleteMemory: (id: string) => Promise<void>;

  // Status
  togglePin: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  archiveMemory: (id: string) => Promise<void>;
  restoreMemory: (id: string) => Promise<void>;
  trashMemory: (id: string) => Promise<void>;
  permanentDelete: (id: string) => Promise<void>;

  // Tags
  addTag: (id: string, tag: string) => Promise<void>;
  removeTag: (id: string, tag: string) => Promise<void>;
  getAllTags: () => string[];

  // Attachments
  addAttachment: (id: string, file: { uri: string; name: string; type: string; size: number }) => Promise<void>;
  removeAttachment: (id: string, attachmentId: string) => Promise<void>;

  // Reminder
  setReminder: (id: string, reminder: Reminder) => Promise<void>;
  removeReminder: (id: string) => Promise<void>;

  // Security
  lockMemory: (id: string) => Promise<void>;
  unlockMemory: (id: string) => Promise<boolean>;

  // AI
  generateTitle: (content: string) => Promise<string>;
  generateTags: (content: string) => Promise<string[]>;
  generateSummary: (content: string) => Promise<string>;
  autoSaveFromChat: (chatContent: string) => Promise<void>;

  // Export/Import
  exportMemories: (ids: string[], format: ExportFormat) => Promise<string>;
  importMemories: (content: string, format: 'txt' | 'json') => Promise<number>;

  // Sharing
  shareMemory: (id: string, format: 'text' | 'pdf' | 'image') => Promise<void>;

  // Filter & Search
  setSearch: (query: string) => void;
  setCategory: (category: MemoryCategory | 'all') => void;
  setActiveTag: (tag: string | null) => void;
  setSortMode: (mode: SortMode) => void;
  setViewMode: (mode: MemoryStatus) => void;
  filteredMemories: () => Memory[];
  timelineMemories: () => TimelineSection[];
  getStats: () => MemoryStats;

  // Cache
  loadFromCache: () => Promise<void>;
  saveToCache: () => Promise<void>;
}


const CACHE_KEY = 'sona_memories_v3';

function getUserId(): string | null {
  return auth.currentUser?.uid ?? null;
}

function getMemoriesCol(uid: string) {
  return collection(db, 'users', uid, 'memories');
}

function getTimelineGroup(dateStr: string): TimelineGroup {
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const weekAgo = new Date(today.getTime() - 7 * 86400000);
  const monthAgo = new Date(today.getTime() - 30 * 86400000);

  if (date >= today) return 'today';
  if (date >= yesterday) return 'yesterday';
  if (date >= weekAgo) return 'thisWeek';
  if (date >= monthAgo) return 'thisMonth';
  return 'older';
}

const TIMELINE_TITLES: Record<TimelineGroup, string> = {
  today: 'Today', yesterday: 'Yesterday',
  thisWeek: 'This Week', thisMonth: 'This Month', older: 'Older',
};


export const useMemoryStore = create<MemoryState>((set, get) => ({
  memories: [],
  searchQuery: '',
  activeCategory: 'all',
  activeTag: null,
  sortMode: 'newest',
  viewMode: 'active',
  isLoading: false,
  error: null,
  _unsubscribe: null,

  initialize: () => {
    const uid = getUserId();
    if (!uid) { get().loadFromCache(); return; }
    set({ isLoading: true });
    get().loadFromCache();

    const q = query(getMemoriesCol(uid), orderBy('updatedAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const memories: Memory[] = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id, title: data.title ?? '', content: data.content ?? '',
          category: data.category ?? 'personal', importance: data.importance ?? 'medium',
          isFavorite: data.isFavorite ?? false, isPinned: data.isPinned ?? false,
          pinOrder: data.pinOrder ?? 0, tags: data.tags ?? [],
          status: data.status ?? 'active', isLocked: data.isLocked ?? false,
          attachments: data.attachments ?? [], reminder: data.reminder,
          createdAt: data.createdAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
          deletedAt: data.deletedAt?.toDate?.()?.toISOString(),
        };
      });
      set({ memories, isLoading: false, error: null });
      get().saveToCache();
    }, () => set({ isLoading: false, error: 'Failed to sync.' }));

    set({ _unsubscribe: unsub });
  },

  cleanup: () => { get()._unsubscribe?.(); set({ _unsubscribe: null }); },


  addMemory: async (data) => {
    const uid = getUserId();
    const now = new Date().toISOString();
    const optId = `local_${Date.now()}`;
    const mem: Memory = { ...data, id: optId, pinOrder: 0, createdAt: now, updatedAt: now };
    set((s) => ({ memories: [mem, ...s.memories] }));
    if (!uid) { get().saveToCache(); return; }
    try {
      const docRef = await addDoc(getMemoriesCol(uid), {
        ...data, pinOrder: 0, createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
      });
      set((s) => ({ memories: s.memories.map(m => m.id === optId ? { ...m, id: docRef.id } : m) }));
    } catch (e: any) { set({ error: e.message }); }
  },

  updateMemory: async (id, data) => {
    set((s) => ({ memories: s.memories.map(m => m.id === id ? { ...m, ...data, updatedAt: new Date().toISOString() } : m) }));
    const uid = getUserId();
    if (!uid) { get().saveToCache(); return; }
    try {
      await updateDoc(doc(db, 'users', uid, 'memories', id), { ...data, updatedAt: serverTimestamp() });
    } catch (e: any) { set({ error: e.message }); }
  },

  deleteMemory: async (id) => {
    set((s) => ({ memories: s.memories.filter(m => m.id !== id) }));
    const uid = getUserId();
    if (!uid) { get().saveToCache(); return; }
    try { await deleteDoc(doc(db, 'users', uid, 'memories', id)); } catch (e: any) { set({ error: e.message }); }
  },

  togglePin: async (id) => {
    const mem = get().memories.find(m => m.id === id);
    if (!mem) return;
    await get().updateMemory(id, { isPinned: !mem.isPinned });
  },

  toggleFavorite: async (id) => {
    const mem = get().memories.find(m => m.id === id);
    if (!mem) return;
    await get().updateMemory(id, { isFavorite: !mem.isFavorite });
  },

  archiveMemory: async (id) => { await get().updateMemory(id, { status: 'archived' }); },
  restoreMemory: async (id) => { await get().updateMemory(id, { status: 'active', deletedAt: undefined }); },
  trashMemory: async (id) => { await get().updateMemory(id, { status: 'trashed', deletedAt: new Date().toISOString() }); },
  permanentDelete: async (id) => { await get().deleteMemory(id); },


  // Tags
  addTag: async (id, tag) => {
    const mem = get().memories.find(m => m.id === id);
    if (!mem || mem.tags.includes(tag)) return;
    await get().updateMemory(id, { tags: [...mem.tags, tag] });
  },
  removeTag: async (id, tag) => {
    const mem = get().memories.find(m => m.id === id);
    if (!mem) return;
    await get().updateMemory(id, { tags: mem.tags.filter(t => t !== tag) });
  },
  getAllTags: () => {
    const tags = new Set<string>();
    get().memories.forEach(m => m.tags.forEach(t => tags.add(t)));
    return Array.from(tags).sort();
  },

  // Attachments
  addAttachment: async (id, file) => {
    const uid = getUserId();
    if (!uid) return;
    const mem = get().memories.find(m => m.id === id);
    if (!mem) return;
    try {
      const storageRef = ref(firebaseStorage, `users/${uid}/memories/${id}/${Date.now()}_${file.name}`);
      const resp = await fetch(file.uri);
      const blob = await resp.blob();
      await uploadBytes(storageRef, blob, { contentType: file.type });
      const url = await getDownloadURL(storageRef);
      const att: Attachment = {
        id: `att_${Date.now()}`, type: file.type.startsWith('image') ? 'image' :
          file.type.includes('pdf') ? 'pdf' : file.type.startsWith('audio') ? 'audio' : 'video',
        uri: url, name: file.name, size: file.size, mimeType: file.type,
      };
      await get().updateMemory(id, { attachments: [...mem.attachments, att] });
    } catch (e: any) { set({ error: 'Upload failed.' }); }
  },

  removeAttachment: async (id, attachmentId) => {
    const mem = get().memories.find(m => m.id === id);
    if (!mem) return;
    const att = mem.attachments.find(a => a.id === attachmentId);
    if (att) {
      try { const r = ref(firebaseStorage, att.uri); await deleteObject(r).catch(() => {}); } catch {}
    }
    await get().updateMemory(id, { attachments: mem.attachments.filter(a => a.id !== attachmentId) });
  },


  // Reminder
  setReminder: async (id, reminder) => {
    const notifId = await Notifications.scheduleNotificationAsync({
      content: { title: 'Memory Reminder', body: get().memories.find(m => m.id === id)?.title ?? 'Check your memory' },
      trigger: reminder.date ? { date: new Date(reminder.date) } as any : null,
    });
    await get().updateMemory(id, { reminder: { ...reminder, notificationId: notifId } });
  },

  removeReminder: async (id) => {
    const mem = get().memories.find(m => m.id === id);
    if (mem?.reminder?.notificationId) {
      await Notifications.cancelScheduledNotificationAsync(mem.reminder.notificationId).catch(() => {});
    }
    await get().updateMemory(id, { reminder: undefined });
  },

  // Security
  lockMemory: async (id) => { await get().updateMemory(id, { isLocked: true }); },
  unlockMemory: async (id) => {
    const result = await LocalAuthentication.authenticateAsync({ promptMessage: 'Unlock Memory' });
    if (result.success) { await get().updateMemory(id, { isLocked: false }); return true; }
    return false;
  },

  // AI
  generateTitle: async (content) => {
    try {
      const r = await sendChat([{ role: 'user', content: `Generate a short, descriptive title (max 8 words) for this note:\n\n${content.slice(0, 500)}` }]);
      return r.replace(/["']/g, '').trim().slice(0, 60);
    } catch { return ''; }
  },
  generateTags: async (content) => {
    try {
      const r = await sendChat([{ role: 'user', content: `Generate 3-5 relevant tags (single words, comma-separated, lowercase) for:\n\n${content.slice(0, 500)}` }]);
      return r.split(',').map(t => t.trim().toLowerCase().replace(/[^a-z0-9-]/g, '')).filter(Boolean).slice(0, 5);
    } catch { return []; }
  },
  generateSummary: async (content) => {
    try {
      return await sendChat([{ role: 'user', content: `Summarize in 1-2 sentences:\n\n${content.slice(0, 1000)}` }]);
    } catch { return ''; }
  },
  autoSaveFromChat: async (chatContent) => {
    const title = await get().generateTitle(chatContent);
    const tags = await get().generateTags(chatContent);
    await get().addMemory({
      title: title || 'Chat Memory', content: chatContent, category: 'ideas',
      importance: 'medium', isFavorite: false, isPinned: false,
      tags, status: 'active', isLocked: false, attachments: [],
    });
  },


  // Export
  exportMemories: async (ids, format) => {
    const mems = get().memories.filter(m => ids.includes(m.id));
    let content = '';
    if (format === 'json') {
      content = JSON.stringify(mems, null, 2);
    } else if (format === 'txt') {
      content = mems.map(m => `# ${m.title}\nCategory: ${m.category}\nTags: ${m.tags.join(', ')}\n\n${m.content}\n\n---\n`).join('\n');
    } else {
      // PDF: generate as text (actual PDF rendering would need a native lib)
      content = mems.map(m => `${m.title}\n${m.category} | ${m.tags.join(', ')}\n\n${m.content}\n\n`).join('---\n\n');
    }
    const path = `${FileSystem.cacheDirectory}memories_export.${format === 'pdf' ? 'txt' : format}`;
    await FileSystem.writeAsStringAsync(path, content);
    return path;
  },

  // Import
  importMemories: async (content, format) => {
    let imported = 0;
    const existing = new Set(get().memories.map(m => m.title + m.content.slice(0, 50)));
    try {
      if (format === 'json') {
        const parsed: any[] = JSON.parse(content);
        for (const item of parsed) {
          const key = (item.title ?? '') + (item.content ?? '').slice(0, 50);
          if (existing.has(key)) continue;
          await get().addMemory({
            title: item.title ?? 'Imported', content: item.content ?? '',
            category: item.category ?? 'other', importance: item.importance ?? 'medium',
            isFavorite: false, isPinned: false, tags: item.tags ?? [],
            status: 'active', isLocked: false, attachments: [],
          });
          imported++;
        }
      } else {
        const blocks = content.split('---').map(b => b.trim()).filter(Boolean);
        for (const block of blocks) {
          const lines = block.split('\n');
          const title = lines[0]?.replace(/^#\s*/, '') ?? 'Imported';
          const body = lines.slice(1).join('\n').trim();
          const key = title + body.slice(0, 50);
          if (existing.has(key)) continue;
          await get().addMemory({
            title, content: body, category: 'other', importance: 'medium',
            isFavorite: false, isPinned: false, tags: [],
            status: 'active', isLocked: false, attachments: [],
          });
          imported++;
        }
      }
    } catch { set({ error: 'Import failed.' }); }
    return imported;
  },

  // Sharing
  shareMemory: async (id, format) => {
    const mem = get().memories.find(m => m.id === id);
    if (!mem) return;
    const text = `${mem.title}\n\n${mem.content}\n\nTags: ${mem.tags.join(', ')}`;
    const path = `${FileSystem.cacheDirectory}memory_share.txt`;
    await FileSystem.writeAsStringAsync(path, text);
    if (await Sharing.isAvailableAsync()) { await Sharing.shareAsync(path); }
  },


  // Filter & Search
  setSearch: (searchQuery) => set({ searchQuery }),
  setCategory: (activeCategory) => set({ activeCategory }),
  setActiveTag: (activeTag) => set({ activeTag }),
  setSortMode: (sortMode) => set({ sortMode }),
  setViewMode: (viewMode) => set({ viewMode }),

  filteredMemories: () => {
    const { memories, searchQuery, activeCategory, activeTag, sortMode, viewMode } = get();
    const filtered = memories
      .filter(m => m.status === viewMode)
      .filter(m => activeCategory === 'all' || m.category === activeCategory)
      .filter(m => !activeTag || m.tags.includes(activeTag))
      .filter(m => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return m.title.toLowerCase().includes(q) || m.content.toLowerCase().includes(q)
          || m.category.includes(q) || m.tags.some(t => t.toLowerCase().includes(q));
      });

    const iw: Record<string, number> = { high: 3, medium: 2, low: 1 };
    switch (sortMode) {
      case 'oldest': filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()); break;
      case 'importance': filtered.sort((a, b) => (iw[b.importance] ?? 2) - (iw[a.importance] ?? 2)); break;
      case 'favorites': filtered.sort((a, b) => (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0)); break;
      default: filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    filtered.sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));
    return filtered;
  },

  timelineMemories: () => {
    const mems = get().filteredMemories();
    const groups: Record<TimelineGroup, Memory[]> = { today: [], yesterday: [], thisWeek: [], thisMonth: [], older: [] };
    mems.forEach(m => { groups[getTimelineGroup(m.createdAt)].push(m); });
    const order: TimelineGroup[] = ['today', 'yesterday', 'thisWeek', 'thisMonth', 'older'];
    return order.filter(k => groups[k].length > 0).map(k => ({ title: TIMELINE_TITLES[k], key: k, data: groups[k] }));
  },

  getStats: () => {
    const { memories } = get();
    const byCategory: Record<string, number> = {};
    const byMonth: Record<string, number> = {};
    let favorites = 0, archived = 0, trashed = 0;
    memories.forEach(m => {
      byCategory[m.category] = (byCategory[m.category] ?? 0) + 1;
      const month = m.createdAt.slice(0, 7);
      byMonth[month] = (byMonth[month] ?? 0) + 1;
      if (m.isFavorite) favorites++;
      if (m.status === 'archived') archived++;
      if (m.status === 'trashed') trashed++;
    });
    return { total: memories.length, favorites, archived, trashed, byCategory, byMonth };
  },


  // Cache
  loadFromCache: async () => {
    try {
      const data = await AsyncStorage.getItem(CACHE_KEY);
      if (data) {
        const cached: Memory[] = JSON.parse(data);
        if (get().memories.length === 0 && cached.length > 0) set({ memories: cached });
      }
    } catch {}
  },
  saveToCache: async () => {
    try {
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(get().memories.slice(0, 100)));
    } catch {}
  },
}));
