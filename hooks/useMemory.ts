import { useMemoryStore } from '@/stores/useMemoryStore';

export const useMemory = () => {
  const store = useMemoryStore();
  return {
    memories: store.filteredMemories(),
    allMemories: store.memories,
    searchQuery: store.searchQuery,
    activeCategory: store.activeCategory,
    addMemory: store.addMemory,
    updateMemory: store.updateMemory,
    deleteMemory: store.deleteMemory,
    togglePin: store.togglePin,
    setSearch: store.setSearch,
    setCategory: store.setCategory,
  };
};
