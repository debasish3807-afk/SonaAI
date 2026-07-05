/**
 * SONA AI — useChat Hook (Phase 2)
 * Provides a clean interface to the chat store for components.
 * Handles initialization on mount and cleanup on unmount.
 */

import { useEffect } from 'react';
import { useChatStore } from '@/stores/useChatStore';

export const useChat = () => {
  const store = useChatStore();

  useEffect(() => {
    store.initialize();

    // Create a default conversation if none exists
    if (!store.activeConversationId && store.conversations.length === 0) {
      store.createConversation();
    }

    return () => {
      store.cleanup();
    };
  }, []);

  return {
    // Active conversation data
    conversation: store.activeConversation(),
    conversations: store.conversations,
    pinnedConversations: store.pinnedConversations(),
    recentConversations: store.recentConversations(),
    filteredConversations: store.filteredConversations(),
    activeConversationId: store.activeConversationId,

    // Status
    isTyping: store.isTyping,
    isLoadingConversations: store.isLoadingConversations,
    error: store.error,
    showDrawer: store.showDrawer,
    searchQuery: store.searchQuery,

    // Message actions
    sendMessage: store.sendMessage,
    editMessage: store.editMessage,
    regenerateResponse: store.regenerateResponse,
    copyMessage: store.copyMessage,
    deleteMessage: store.deleteMessage,

    // Conversation actions
    createConversation: store.createConversation,
    setActiveConversation: store.setActiveConversation,
    deleteConversation: store.deleteConversation,
    renameConversation: store.renameConversation,
    pinConversation: store.pinConversation,
    unpinConversation: store.unpinConversation,
    clearConversation: store.clearConversation,

    // UI state
    setSearchQuery: store.setSearchQuery,
    toggleDrawer: store.toggleDrawer,
    setShowDrawer: store.setShowDrawer,
    clearError: store.clearError,
  };
};
