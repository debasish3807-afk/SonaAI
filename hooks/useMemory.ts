/**
 * SONA AI — useMemory Hook (Complete Module)
 */

import { useEffect } from 'react';
import { useMemoryStore } from '@/stores/useMemoryStore';

export const useMemory = () => {
  const store = useMemoryStore();

  useEffect(() => {
    store.initialize();
    return () => { store.cleanup(); };
  }, []);

  return {
    memories: store.filteredMemories(),
    timelineMemories: store.timelineMemories(),
    allMemories: store.memories,
    stats: store.getStats(),
    allTags: store.getAllTags(),
    searchQuery: store.searchQuery,
    activeCategory: store.activeCategory,
    activeTag: store.activeTag,
    sortMode: store.sortMode,
    viewMode: store.viewMode,
    isLoading: store.isLoading,
    error: store.error,

    // CRUD
    addMemory: store.addMemory,
    updateMemory: store.updateMemory,
    deleteMemory: store.deleteMemory,

    // Status
    togglePin: store.togglePin,
    toggleFavorite: store.toggleFavorite,
    archiveMemory: store.archiveMemory,
    restoreMemory: store.restoreMemory,
    trashMemory: store.trashMemory,
    permanentDelete: store.permanentDelete,

    // Tags
    addTag: store.addTag,
    removeTag: store.removeTag,

    // Attachments
    addAttachment: store.addAttachment,
    removeAttachment: store.removeAttachment,

    // Reminder
    setReminder: store.setReminder,
    removeReminder: store.removeReminder,

    // Security
    lockMemory: store.lockMemory,
    unlockMemory: store.unlockMemory,

    // AI
    generateTitle: store.generateTitle,
    generateTags: store.generateTags,
    generateSummary: store.generateSummary,
    autoSaveFromChat: store.autoSaveFromChat,

    // Export/Import
    exportMemories: store.exportMemories,
    importMemories: store.importMemories,

    // Sharing
    shareMemory: store.shareMemory,

    // Filter
    setSearch: store.setSearch,
    setCategory: store.setCategory,
    setActiveTag: store.setActiveTag,
    setSortMode: store.setSortMode,
    setViewMode: store.setViewMode,
  };
};
