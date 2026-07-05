/**
 * SONA AI — useMemory Hook
 * Initializes the Firestore listener on mount and cleans up on unmount.
 */

import { useEffect } from 'react';
import { useMemoryStore } from '@/stores/useMemoryStore';

export const useMemory = () => {
  const store = useMemoryStore();

  useEffect(() => {
    store.initialize();
    return () => {
      store.cleanup();
    };
  }, []);

  return {
    memories: store.filteredMemories(),
    allMemories: store.memories,
    searchQuery: store.searchQuery,
    activeCategory: store.activeCategory,
    isLoading: store.isLoading,
    error: store.error,
    addMemory: store.addMemory,
    updateMemory: store.updateMemory,
    deleteMemory: store.deleteMemory,
    togglePin: store.togglePin,
    setSearch: store.setSearch,
    setCategory: store.setCategory,
  };
};
