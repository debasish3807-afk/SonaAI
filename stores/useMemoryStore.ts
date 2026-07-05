import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  addMemory: (data: Omit<Memory, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateMemory: (id: string, data: Partial<Memory>) => void;
  deleteMemory: (id: string) => void;
  togglePin: (id: string) => void;
  setSearch: (query: string) => void;
  setCategory: (category: MemoryCategory | 'all') => void;
  filteredMemories: () => Memory[];
  loadMemories: () => Promise<void>;
}

const STORAGE_KEY = 'sona_memories';
const generateId = () => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const MOCK_MEMORIES: Memory[] = [
  {
    id: '1', title: 'React Native Best Practices', category: 'learning',
    content: 'Always use FlatList for large lists, memo for pure components, useCallback for event handlers.',
    tags: ['react-native', 'performance', 'code'],
    isPinned: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: '2', title: 'Q3 Project Goals', category: 'work',
    content: 'Launch SONA AI v2, integrate Gemini API, add voice features, reach 10k users.',
    tags: ['goals', 'product', 'launch'],
    isPinned: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: '3', title: 'Morning Routine', category: 'health',
    content: 'Wake at 6am, meditate 10min, cold shower, review goals, deep work 3 hours.',
    tags: ['routine', 'wellness', 'productivity'],
    isPinned: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: '4', title: 'App Design Inspiration', category: 'creative',
    content: 'Dark glassmorphism with purple accents, minimal animation, bold typography.',
    tags: ['design', 'ui', 'inspiration'],
    isPinned: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
];

export const useMemoryStore = create<MemoryState>((set, get) => ({
  memories: MOCK_MEMORIES,
  searchQuery: '',
  activeCategory: 'all',

  addMemory: (data) => {
    const newMemory: Memory = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set(state => ({ memories: [newMemory, ...state.memories] }));
  },

  updateMemory: (id, data) => {
    set(state => ({
      memories: state.memories.map(m =>
        m.id === id ? { ...m, ...data, updatedAt: new Date().toISOString() } : m
      ),
    }));
  },

  deleteMemory: (id) => {
    set(state => ({ memories: state.memories.filter(m => m.id !== id) }));
  },

  togglePin: (id) => {
    set(state => ({
      memories: state.memories.map(m =>
        m.id === id ? { ...m, isPinned: !m.isPinned } : m
      ),
    }));
  },

  setSearch: (query) => set({ searchQuery: query }),
  setCategory: (category) => set({ activeCategory: category }),

  filteredMemories: () => {
    const { memories, searchQuery, activeCategory } = get();
    return memories
      .filter(m => activeCategory === 'all' || m.category === activeCategory)
      .filter(m =>
        !searchQuery ||
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
      )
      .sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));
  },

  loadMemories: async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) set({ memories: JSON.parse(data) });
    } catch (_) {}
  },
}));
