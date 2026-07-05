import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
  isTyping: boolean;
  activeConversation: () => Conversation | null;
  createConversation: () => string;
  sendMessage: (content: string) => Promise<void>;
  clearConversation: () => void;
  setActiveConversation: (id: string) => void;
  loadConversations: () => Promise<void>;
}

const STORAGE_KEY = 'sona_conversations';

// Mock AI responses
const MOCK_RESPONSES = [
  "I've analyzed your request and here's my comprehensive response. SONA AI is powered by advanced language models that can help you with a wide range of tasks.",
  "That's a great question! Let me break this down for you with detailed insights and actionable recommendations.",
  "Based on my analysis, I can see several key factors at play here. Let me walk you through each one carefully.",
  "I understand what you're looking for. Here's a structured approach that should help you achieve your goals effectively.",
  "Excellent point! This is a nuanced topic that requires careful consideration. Here's my take on it...",
  "I've processed your input and have several suggestions that might be helpful. Would you like me to elaborate on any specific aspect?",
];

const generateId = () => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  activeConversationId: null,
  isTyping: false,

  activeConversation: () => {
    const { conversations, activeConversationId } = get();
    return conversations.find(c => c.id === activeConversationId) ?? null;
  },

  createConversation: () => {
    const id = generateId();
    const newConv: Conversation = {
      id,
      title: 'New Conversation',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set(state => ({
      conversations: [newConv, ...state.conversations],
      activeConversationId: id,
    }));
    return id;
  },

  setActiveConversation: (id: string) => {
    set({ activeConversationId: id });
  },

  sendMessage: async (content: string) => {
    const { activeConversationId, conversations, createConversation } = get();
    let convId = activeConversationId;
    if (!convId) {
      convId = createConversation();
    }

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    // Add user message
    set(state => ({
      conversations: state.conversations.map(c =>
        c.id === convId
          ? {
              ...c,
              messages: [...c.messages, userMessage],
              title: c.messages.length === 0 ? content.slice(0, 40) : c.title,
              updatedAt: new Date(),
            }
          : c
      ),
      isTyping: true,
    }));

    // TODO: Replace with real Gemini AI API call
    await new Promise(resolve => setTimeout(resolve, 1200 + Math.random() * 800));

    const aiResponse: Message = {
      id: generateId(),
      role: 'assistant',
      content: MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)],
      timestamp: new Date(),
    };

    set(state => ({
      conversations: state.conversations.map(c =>
        c.id === convId
          ? { ...c, messages: [...c.messages, aiResponse], updatedAt: new Date() }
          : c
      ),
      isTyping: false,
    }));

    // Persist
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(get().conversations));
    } catch (_) {}
  },

  clearConversation: () => {
    const { activeConversationId } = get();
    set(state => ({
      conversations: state.conversations.map(c =>
        c.id === activeConversationId ? { ...c, messages: [] } : c
      ),
    }));
  },

  loadConversations: async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        set({ conversations: parsed });
      }
    } catch (_) {}
  },
}));
