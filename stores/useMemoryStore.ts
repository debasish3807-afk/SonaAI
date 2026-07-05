/**
 * SONA AI — Memory Store
 * Firestore-backed memory system with offline cache.
 *
 * Features:
 *  - Save memories to Firestore (users/{uid}/memories)
 *  - Retrieve memories with real-time listener
 *  - Update memories
 *  - Delete memories
 *  - Search memories (title, content, tags)
 *  - Category filtering
 *  - Pin/unpin
 *  - Offline AsyncStorage cache for instant cold-start
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  Unsubscribe,
} from 'firebase/firestore';
import { db, auth } from '@/services/firebase';

// ─── Types ────────────────────────────────────────────────────────────────────

export type MemoryCategory = 'personal' | 'work' | 'learning' | 'creative' | 'health';

export interface Memory {
  id: string;
  title: string;
  content: string;
  category: MemoryCategory;
  tags: string[];
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

interface MemoryState {
  memories: Memory[];
  searchQuery: string;
  activeCategory: MemoryCategory | 'all';
  isLoading: boolean;
  error: string | null;
  _unsubscribe: Unsubscribe | null;

  // Lifecycle
  initialize: () => void;
  cleanup: () => void;

  // CRUD
  addMemory: (data: Omit<Memory, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateMemory: (id: string, data: Partial<Omit<Memory, 'id' | 'createdAt'>>) => Promise<void>;
  deleteMemory: (id: string) => Promise<void>;
  togglePin: (id: string) => Promise<void>;

  // Search & Filter
  setSearch: (query: string) => void;
  setCategory: (category: MemoryCategory | 'all') => void;
  filteredMemories: () => Memory[];

  // Offline cache
  loadFromCache: () => Promise<void>;
  saveToCache: () => Promise<void>;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CACHE_KEY = 'sona_memories_v2';

function getUserId(): string | null {
  return auth.currentUser?.uid ?? null;
}

function getMemoriesCollection(uid: string) {
  return collection(db, 'users', uid, 'memories');
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useMemoryStore = create<MemoryState>((set, get) => ({
  memories: [],
  searchQuery: '',
  activeCategory: 'all',
  isLoading: false,
  error: null,
  _unsubscribe: null,

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  initialize: () => {
    const uid = getUserId();
    if (!uid) {
      // Not authenticated — just load cache
      get().loadFromCache();
      return;
    }

    set({ isLoading: true });

    // Load cache for instant UI
    get().loadFromCache();

    // Set up Firestore real-time listener
    const memoriesRef = getMemoriesCollection(uid);
    const q = query(memoriesRef, orderBy('updatedAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const memories: Memory[] = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            title: data.title ?? '',
            content: data.content ?? '',
            category: data.category ?? 'personal',
            tags: data.tags ?? [],
            isPinned: data.isPinned ?? false,
            createdAt: data.createdAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
            updatedAt: data.updatedAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
          };
        });
        set({ memories, isLoading: false, error: null });
        get().saveToCache();
      },
      (err) => {
        console.warn('[MemoryStore] Firestore listener error:', err.message);
        set({ isLoading: false, error: 'Failed to sync memories.' });
      }
    );

    set({ _unsubscribe: unsubscribe });
  },

  cleanup: () => {
    const { _unsubscribe } = get();
    _unsubscribe?.();
    set({ _unsubscribe: null });
  },

  // ── Add Memory ─────────────────────────────────────────────────────────────

  addMemory: async (data) => {
    const uid = getUserId();

    const now = new Date().toISOString();
    const optimisticId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

    // Optimistic update
    const optimisticMemory: Memory = {
      ...data,
      id: optimisticId,
      createdAt: now,
      updatedAt: now,
    };
    set((state) => ({ memories: [optimisticMemory, ...state.memories] }));

    if (!uid) {
      get().saveToCache();
      return;
    }

    try {
      const memoriesRef = getMemoriesCollection(uid);
      const docRef = await addDoc(memoriesRef, {
        title: data.title,
        content: data.content,
        category: data.category,
        tags: data.tags,
        isPinned: data.isPinned,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Replace optimistic ID with Firestore ID
      set((state) => ({
        memories: state.memories.map((m) =>
          m.id === optimisticId ? { ...m, id: docRef.id } : m
        ),
      }));
    } catch (err: any) {
      console.warn('[MemoryStore] addMemory error:', err.message);
      set({ error: 'Failed to save memory.' });
    }
  },

  // ── Update Memory ──────────────────────────────────────────────────────────

  updateMemory: async (id, data) => {
    // Optimistic update
    set((state) => ({
      memories: state.memories.map((m) =>
        m.id === id ? { ...m, ...data, updatedAt: new Date().toISOString() } : m
      ),
    }));

    const uid = getUserId();
    if (!uid) {
      get().saveToCache();
      return;
    }

    try {
      const docRef = doc(db, 'users', uid, 'memories', id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
    } catch (err: any) {
      console.warn('[MemoryStore] updateMemory error:', err.message);
      set({ error: 'Failed to update memory.' });
    }
  },

  // ── Delete Memory ──────────────────────────────────────────────────────────

  deleteMemory: async (id) => {
    // Optimistic removal
    set((state) => ({
      memories: state.memories.filter((m) => m.id !== id),
    }));

    const uid = getUserId();
    if (!uid) {
      get().saveToCache();
      return;
    }

    try {
      const docRef = doc(db, 'users', uid, 'memories', id);
      await deleteDoc(docRef);
    } catch (err: any) {
      console.warn('[MemoryStore] deleteMemory error:', err.message);
      set({ error: 'Failed to delete memory.' });
    }
  },

  // ── Toggle Pin ─────────────────────────────────────────────────────────────

  togglePin: async (id) => {
    const memory = get().memories.find((m) => m.id === id);
    if (!memory) return;

    const newPinned = !memory.isPinned;

    // Optimistic update
    set((state) => ({
      memories: state.memories.map((m) =>
        m.id === id ? { ...m, isPinned: newPinned } : m
      ),
    }));

    const uid = getUserId();
    if (!uid) {
      get().saveToCache();
      return;
    }

    try {
      const docRef = doc(db, 'users', uid, 'memories', id);
      await updateDoc(docRef, { isPinned: newPinned, updatedAt: serverTimestamp() });
    } catch (err: any) {
      console.warn('[MemoryStore] togglePin error:', err.message);
    }
  },

  // ── Search & Filter ────────────────────────────────────────────────────────

  setSearch: (searchQuery) => set({ searchQuery }),
  setCategory: (activeCategory) => set({ activeCategory }),

  filteredMemories: () => {
    const { memories, searchQuery, activeCategory } = get();
    return memories
      .filter((m) => activeCategory === 'all' || m.category === activeCategory)
      .filter((m) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
          m.title.toLowerCase().includes(q) ||
          m.content.toLowerCase().includes(q) ||
          m.tags.some((t) => t.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));
  },

  // ── Offline Cache ──────────────────────────────────────────────────────────

  loadFromCache: async () => {
    try {
      const data = await AsyncStorage.getItem(CACHE_KEY);
      if (data) {
        const cached: Memory[] = JSON.parse(data);
        // Only set from cache if we have no Firestore data yet
        const { memories } = get();
        if (memories.length === 0 && cached.length > 0) {
          set({ memories: cached });
        }
      }
    } catch {
      // Cache read failed — continue without cached data
    }
  },

  saveToCache: async () => {
    try {
      const { memories } = get();
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(memories.slice(0, 100)));
    } catch {
      // Non-critical
    }
  },
}));
