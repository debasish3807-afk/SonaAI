import { useEffect } from 'react';
import { useChatStore } from '@/stores/useChatStore';

export const useChat = () => {
  const store = useChatStore();

  useEffect(() => {
    store.loadConversations();
    if (!store.activeConversationId) {
      store.createConversation();
    }
  }, []);

  return {
    conversation: store.activeConversation(),
    conversations: store.conversations,
    isTyping: store.isTyping,
    sendMessage: store.sendMessage,
    clearConversation: store.clearConversation,
    createConversation: store.createConversation,
    setActiveConversation: store.setActiveConversation,
  };
};
