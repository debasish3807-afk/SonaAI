import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { streamChat, ChatMessage } from '@/services/gemini.service';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  isError?: boolean;
  tokensHint?: number;
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
  error: string | null;

  // Derived
  activeConversation: () => Conversation | null;

  // Actions
  createConversation: () => string;
  sendMessage: (content: string) => Promise<void>;
  clearConversation: () => void;
  clearError: () => void;
  setActiveConversation: (id: string) => void;
  deleteConversation: (id: string) => void;
  loadConversations: () => Promise<void>;
  saveConversations: () => Promise<void>;
}

const STORAGE_KEY = 'sona_conversations_v2';
const MAX_HISTORY_MESSAGES = 20; // last N messages sent to AI for context

const generateId = () => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

/**
 * Build the message history to send to Gemini.
 * Limits to MAX_HISTORY_MESSAGES to avoid token overflow.
 */
function buildHistory(messages: Message[]): ChatMessage[] {
  const relevant = messages
    .filter(m => !m.isError && !m.isStreaming)
    .slice(-MAX_HISTORY_MESSAGES);

  return relevant.map(m => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }));
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  activeConversationId: null,
  isTyping: false,
  error: null,

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

  deleteConversation: (id: string) => {
    set(state => {
      const filtered = state.conversations.filter(c => c.id !== id);
      const newActive =
        state.activeConversationId === id
          ? (filtered[0]?.id ?? null)
          : state.activeConversationId;
      return { conversations: filtered, activeConversationId: newActive };
    });
    get().saveConversations();
  },

  clearError: () => set({ error: null }),

  sendMessage: async (content: string) => {
    const state = get();
    let convId = state.activeConversationId;
    if (!convId) {
      convId = get().createConversation();
    }

    const userMsg: Message = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    // Add user message & set typing
    set(st => ({
      isTyping: true,
      error: null,
      conversations: st.conversations.map(c =>
        c.id === convId
          ? {
              ...c,
              messages: [...c.messages, userMsg],
              title: c.messages.length === 0 ? content.slice(0, 48) : c.title,
              updatedAt: new Date(),
            }
          : c
      ),
    }));

    // Placeholder streaming message
    const aiMsgId = generateId();
    const aiPlaceholder: Message = {
      id: aiMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
    };

    set(st => ({
      conversations: st.conversations.map(c =>
        c.id === convId
          ? { ...c, messages: [...c.messages, aiPlaceholder] }
          : c
      ),
    }));

    // Build history including the new user message
    const currentConv = get().conversations.find(c => c.id === convId);
    const historyMessages = buildHistory(
      (currentConv?.messages ?? []).filter(m => m.id !== aiMsgId)
    );

    try {
      let fullContent = '';

      await streamChat(historyMessages, (chunk) => {
        if (chunk.delta) {
          fullContent += chunk.delta;
          // Update the streaming placeholder in real time
          set(st => ({
            conversations: st.conversations.map(c =>
              c.id === convId
                ? {
                    ...c,
                    messages: c.messages.map(m =>
                      m.id === aiMsgId
                        ? { ...m, content: fullContent }
                        : m
                    ),
                  }
                : c
            ),
          }));
        }
        if (chunk.done) {
          // Finalize message
          set(st => ({
            isTyping: false,
            conversations: st.conversations.map(c =>
              c.id === convId
                ? {
                    ...c,
                    messages: c.messages.map(m =>
                      m.id === aiMsgId
                        ? { ...m, content: fullContent || m.content, isStreaming: false, timestamp: new Date() }
                        : m
                    ),
                    updatedAt: new Date(),
                  }
                : c
            ),
          }));
          get().saveConversations();
        }
      });
    } catch (err) {
      const errorMessage = String(err).replace('Error: ', '');
      console.error('[useChatStore] sendMessage error:', err);

      // Replace placeholder with error message
      set(st => ({
        isTyping: false,
        error: errorMessage,
        conversations: st.conversations.map(c =>
          c.id === convId
            ? {
                ...c,
                messages: c.messages.map(m =>
                  m.id === aiMsgId
                    ? {
                        ...m,
                        content: `Sorry, I encountered an error. Please try again.\n\n_${errorMessage}_`,
                        isStreaming: false,
                        isError: true,
                        timestamp: new Date(),
                      }
                    : m
                ),
              }
            : c
        ),
      }));
    }
  },

  clearConversation: () => {
    const { activeConversationId } = get();
    set(state => ({
      conversations: state.conversations.map(c =>
        c.id === activeConversationId
          ? { ...c, messages: [], title: 'New Conversation', updatedAt: new Date() }
          : c
      ),
    }));
    get().saveConversations();
  },

  loadConversations: async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed: Conversation[] = JSON.parse(data);
        // Rehydrate Date objects
        const rehydrated = parsed.map(c => ({
          ...c,
          createdAt: new Date(c.createdAt),
          updatedAt: new Date(c.updatedAt),
          messages: c.messages
            .filter(m => !m.isStreaming) // drop any incomplete streaming msgs
            .map(m => ({ ...m, timestamp: new Date(m.timestamp) })),
        }));
        set({ conversations: rehydrated });
      }
    } catch (err) {
      console.warn('[useChatStore] loadConversations error:', err);
    }
  },

  saveConversations: async () => {
    try {
      const { conversations } = get();
      // Only persist completed conversations (no streaming placeholders)
      const toSave = conversations.map(c => ({
        ...c,
        messages: c.messages.filter(m => !m.isStreaming),
      }));
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (err) {
      console.warn('[useChatStore] saveConversations error:', err);
    }
  },
}));
