/**
 * SONA AI — Chat Store (Phase 2)
 * Production-ready Zustand store with:
 *  - Firestore real-time sync for conversations & messages
 *  - Offline cache via AsyncStorage fallback
 *  - Streaming Gemini AI responses
 *  - Conversation CRUD (create, rename, delete, pin, search)
 *  - Message actions (copy, edit, regenerate)
 *  - Image/voice attachment architecture
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { streamChat, ChatMessage } from '@/services/gemini.service';
import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  Unsubscribe,
  writeBatch,
} from 'firebase/firestore';
import { db, auth } from '@/services/firebase';
import * as Clipboard from 'expo-clipboard';

// ─── Types ────────────────────────────────────────────────────────────────────

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'error';
export type AttachmentType = 'image' | 'voice' | 'file';

export interface Attachment {
  id: string;
  type: AttachmentType;
  uri: string;
  name?: string;
  mimeType?: string;
  duration?: number; // voice duration in seconds
  size?: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  status: MessageStatus;
  isStreaming?: boolean;
  isError?: boolean;
  isEdited?: boolean;
  attachments?: Attachment[];
  tokensUsed?: number;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  isPinned: boolean;
  model: string;
  lastMessage?: string;
  messageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
  isTyping: boolean;
  isLoadingConversations: boolean;
  error: string | null;
  searchQuery: string;
  showDrawer: boolean;

  // Firestore listener cleanup
  _unsubConversations: Unsubscribe | null;
  _unsubMessages: Unsubscribe | null;

  // Derived
  activeConversation: () => Conversation | null;
  filteredConversations: () => Conversation[];
  pinnedConversations: () => Conversation[];
  recentConversations: () => Conversation[];

  // Lifecycle
  initialize: () => Promise<void>;
  cleanup: () => void;

  // Conversation Actions
  createConversation: () => string;
  setActiveConversation: (id: string) => void;
  deleteConversation: (id: string) => Promise<void>;
  renameConversation: (id: string, title: string) => Promise<void>;
  pinConversation: (id: string) => Promise<void>;
  unpinConversation: (id: string) => Promise<void>;
  clearConversation: () => Promise<void>;

  // Message Actions
  sendMessage: (content: string, attachments?: Attachment[]) => Promise<void>;
  editMessage: (messageId: string, newContent: string) => Promise<void>;
  regenerateResponse: (messageId: string) => Promise<void>;
  copyMessage: (messageId: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;

  // Search & UI
  setSearchQuery: (query: string) => void;
  toggleDrawer: () => void;
  setShowDrawer: (show: boolean) => void;

  // Error
  clearError: () => void;

  // Persistence (offline fallback)
  loadConversations: () => Promise<void>;
  saveConversations: () => Promise<void>;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'sona_conversations_v3';
const MAX_HISTORY_MESSAGES = 20;
const SYSTEM_PROMPT = `You are SONA AI, a highly intelligent, helpful, and friendly AI assistant. You provide clear, accurate, and well-structured responses. Use markdown formatting when appropriate: **bold** for emphasis, \`code\` for inline code, \`\`\`language for code blocks, and bullet points for lists. Be concise but thorough.`;

const generateId = () => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildHistory(messages: Message[]): ChatMessage[] {
  const relevant = messages
    .filter(m => !m.isError && !m.isStreaming && m.role !== 'system')
    .slice(-MAX_HISTORY_MESSAGES);

  return [
    { role: 'system' as const, content: SYSTEM_PROMPT },
    ...relevant.map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
  ];
}

function getUserId(): string | null {
  return auth.currentUser?.uid ?? null;
}

// ─── Firestore Sync Helpers ───────────────────────────────────────────────────

async function syncConversationToFirestore(conv: Conversation): Promise<void> {
  const uid = getUserId();
  if (!uid) return;

  const convRef = doc(db, 'conversations', conv.id);
  await setDoc(convRef, {
    userId: uid,
    title: conv.title,
    isPinned: conv.isPinned,
    model: conv.model,
    lastMessage: conv.lastMessage ?? '',
    messageCount: conv.messageCount,
    createdAt: Timestamp.fromDate(conv.createdAt),
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

async function syncMessageToFirestore(convId: string, msg: Message): Promise<void> {
  const uid = getUserId();
  if (!uid) return;

  const msgRef = doc(db, 'messages', msg.id);
  await setDoc(msgRef, {
    conversationId: convId,
    userId: uid,
    role: msg.role,
    content: msg.content,
    status: msg.status,
    isEdited: msg.isEdited ?? false,
    attachments: msg.attachments ?? [],
    createdAt: Timestamp.fromDate(msg.timestamp),
  });
}

async function deleteConversationFromFirestore(convId: string): Promise<void> {
  const uid = getUserId();
  if (!uid) return;

  // Delete all messages in conversation
  const msgQuery = query(
    collection(db, 'messages'),
    where('conversationId', '==', convId)
  );
  const msgSnap = await getDocs(msgQuery);
  const batch = writeBatch(db);
  msgSnap.docs.forEach(d => batch.delete(d.ref));
  batch.delete(doc(db, 'conversations', convId));
  await batch.commit();
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  activeConversationId: null,
  isTyping: false,
  isLoadingConversations: false,
  error: null,
  searchQuery: '',
  showDrawer: false,
  _unsubConversations: null,
  _unsubMessages: null,

  // ── Derived ────────────────────────────────────────────────────────────────

  activeConversation: () => {
    const { conversations, activeConversationId } = get();
    return conversations.find(c => c.id === activeConversationId) ?? null;
  },

  filteredConversations: () => {
    const { conversations, searchQuery } = get();
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase();
    return conversations.filter(c =>
      c.title.toLowerCase().includes(q) ||
      c.lastMessage?.toLowerCase().includes(q)
    );
  },

  pinnedConversations: () => {
    return get().conversations.filter(c => c.isPinned);
  },

  recentConversations: () => {
    return get().conversations.filter(c => !c.isPinned);
  },

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  initialize: async () => {
    set({ isLoadingConversations: true });

    // Load from offline cache first for instant UI
    await get().loadConversations();

    const uid = getUserId();
    if (!uid) {
      set({ isLoadingConversations: false });
      return;
    }

    // Set up Firestore real-time listener for conversations
    const convQuery = query(
      collection(db, 'conversations'),
      where('userId', '==', uid),
      orderBy('updatedAt', 'desc'),
      limit(50)
    );

    const unsubConversations = onSnapshot(convQuery, async (snapshot) => {
      const firestoreConvs = snapshot.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          title: data.title ?? 'New Conversation',
          isPinned: data.isPinned ?? false,
          model: data.model ?? 'gemini-2.0-flash',
          lastMessage: data.lastMessage ?? '',
          messageCount: data.messageCount ?? 0,
          createdAt: data.createdAt?.toDate?.() ?? new Date(),
          updatedAt: data.updatedAt?.toDate?.() ?? new Date(),
          messages: [], // Messages loaded separately per-conversation
        } as Conversation;
      });

      // Merge with local messages (preserve active conversation messages)
      const { conversations: localConvs, activeConversationId } = get();
      const merged = firestoreConvs.map(fc => {
        const local = localConvs.find(lc => lc.id === fc.id);
        return {
          ...fc,
          messages: local?.messages ?? [],
        };
      });

      set({ conversations: merged, isLoadingConversations: false });
      get().saveConversations();
    }, () => {
      // Firestore listener error — use cached data
      set({ isLoadingConversations: false });
    });

    set({ _unsubConversations: unsubConversations });
  },

  cleanup: () => {
    const { _unsubConversations, _unsubMessages } = get();
    _unsubConversations?.();
    _unsubMessages?.();
    set({ _unsubConversations: null, _unsubMessages: null });
  },

  // ── Conversation Actions ───────────────────────────────────────────────────

  createConversation: () => {
    const id = generateId();
    const newConv: Conversation = {
      id,
      title: 'New Chat',
      messages: [],
      isPinned: false,
      model: 'gemini-2.0-flash',
      messageCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    set(state => ({
      conversations: [newConv, ...state.conversations],
      activeConversationId: id,
      showDrawer: false,
    }));

    // Sync to Firestore in background
    syncConversationToFirestore(newConv).catch(() => {});
    get().saveConversations();
    return id;
  },

  setActiveConversation: (id: string) => {
    set({ activeConversationId: id, showDrawer: false });

    // Load messages for this conversation from Firestore
    const uid = getUserId();
    if (!uid) return;

    // Clean up previous message listener
    const { _unsubMessages } = get();
    _unsubMessages?.();

    const msgQuery = query(
      collection(db, 'messages'),
      where('conversationId', '==', id),
      orderBy('createdAt', 'asc'),
      limit(200)
    );

    const unsubMessages = onSnapshot(msgQuery, (snapshot) => {
      const msgs: Message[] = snapshot.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          role: data.role,
          content: data.content,
          timestamp: data.createdAt?.toDate?.() ?? new Date(),
          status: data.status ?? 'delivered',
          isEdited: data.isEdited ?? false,
          isError: data.status === 'error',
          attachments: data.attachments ?? [],
        };
      });

      set(state => ({
        conversations: state.conversations.map(c =>
          c.id === id ? { ...c, messages: msgs } : c
        ),
      }));
    }, () => {
      // Message listener error — use cached messages
    });

    set({ _unsubMessages: unsubMessages });
  },

  deleteConversation: async (id: string) => {
    set(state => {
      const filtered = state.conversations.filter(c => c.id !== id);
      const newActive = state.activeConversationId === id
        ? (filtered[0]?.id ?? null)
        : state.activeConversationId;
      return { conversations: filtered, activeConversationId: newActive };
    });

    deleteConversationFromFirestore(id).catch(() => {});
    get().saveConversations();
  },

  renameConversation: async (id: string, title: string) => {
    set(state => ({
      conversations: state.conversations.map(c =>
        c.id === id ? { ...c, title, updatedAt: new Date() } : c
      ),
    }));

    const uid = getUserId();
    if (uid) {
      const convRef = doc(db, 'conversations', id);
      updateDoc(convRef, { title, updatedAt: serverTimestamp() }).catch(() => {});
    }
    get().saveConversations();
  },

  pinConversation: async (id: string) => {
    set(state => ({
      conversations: state.conversations.map(c =>
        c.id === id ? { ...c, isPinned: true } : c
      ),
    }));

    const uid = getUserId();
    if (uid) {
      const convRef = doc(db, 'conversations', id);
      updateDoc(convRef, { isPinned: true, updatedAt: serverTimestamp() }).catch(() => {});
    }
    get().saveConversations();
  },

  unpinConversation: async (id: string) => {
    set(state => ({
      conversations: state.conversations.map(c =>
        c.id === id ? { ...c, isPinned: false } : c
      ),
    }));

    const uid = getUserId();
    if (uid) {
      const convRef = doc(db, 'conversations', id);
      updateDoc(convRef, { isPinned: false, updatedAt: serverTimestamp() }).catch(() => {});
    }
    get().saveConversations();
  },

  clearConversation: async () => {
    const { activeConversationId } = get();
    if (!activeConversationId) return;

    set(state => ({
      conversations: state.conversations.map(c =>
        c.id === activeConversationId
          ? { ...c, messages: [], messageCount: 0, lastMessage: '', title: 'New Chat', updatedAt: new Date() }
          : c
      ),
    }));

    // Delete messages from Firestore
    const uid = getUserId();
    if (uid) {
      const msgQuery = query(
        collection(db, 'messages'),
        where('conversationId', '==', activeConversationId)
      );
      const snap = await getDocs(msgQuery);
      const batch = writeBatch(db);
      snap.docs.forEach(d => batch.delete(d.ref));
      await batch.commit().catch(() => {});

      const convRef = doc(db, 'conversations', activeConversationId);
      updateDoc(convRef, {
        messageCount: 0,
        lastMessage: '',
        title: 'New Chat',
        updatedAt: serverTimestamp(),
      }).catch(() => {});
    }

    get().saveConversations();
  },

  // ── Message Actions ────────────────────────────────────────────────────────

  sendMessage: async (content: string, attachments?: Attachment[]) => {
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
      status: 'sent',
      attachments: attachments ?? [],
    };

    // Optimistic update: add user message
    set(st => ({
      isTyping: true,
      error: null,
      conversations: st.conversations.map(c =>
        c.id === convId
          ? {
              ...c,
              messages: [...c.messages, userMsg],
              title: c.messages.length === 0 ? content.slice(0, 50) : c.title,
              lastMessage: content.slice(0, 100),
              messageCount: c.messageCount + 1,
              updatedAt: new Date(),
            }
          : c
      ),
    }));

    // Sync user message to Firestore
    syncMessageToFirestore(convId, userMsg).catch(() => {});

    // Create streaming AI placeholder
    const aiMsgId = generateId();
    const aiPlaceholder: Message = {
      id: aiMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      status: 'sending',
      isStreaming: true,
    };

    set(st => ({
      conversations: st.conversations.map(c =>
        c.id === convId
          ? { ...c, messages: [...c.messages, aiPlaceholder] }
          : c
      ),
    }));

    // Build history for Gemini
    const currentConv = get().conversations.find(c => c.id === convId);
    const historyMessages = buildHistory(
      (currentConv?.messages ?? []).filter(m => m.id !== aiMsgId)
    );

    try {
      let fullContent = '';

      await streamChat(historyMessages, (chunk) => {
        if (chunk.delta) {
          fullContent += chunk.delta;
          set(st => ({
            conversations: st.conversations.map(c =>
              c.id === convId
                ? {
                    ...c,
                    messages: c.messages.map(m =>
                      m.id === aiMsgId ? { ...m, content: fullContent } : m
                    ),
                  }
                : c
            ),
          }));
        }

        if (chunk.done) {
          const finalMsg: Message = {
            id: aiMsgId,
            role: 'assistant',
            content: fullContent || 'I apologize, but I was unable to generate a response. Please try again.',
            timestamp: new Date(),
            status: 'delivered',
            isStreaming: false,
          };

          set(st => ({
            isTyping: false,
            conversations: st.conversations.map(c =>
              c.id === convId
                ? {
                    ...c,
                    messages: c.messages.map(m => m.id === aiMsgId ? finalMsg : m),
                    lastMessage: fullContent.slice(0, 100),
                    messageCount: c.messageCount + 1,
                    updatedAt: new Date(),
                  }
                : c
            ),
          }));

          // Sync final AI message and updated conversation to Firestore
          syncMessageToFirestore(convId!, finalMsg).catch(() => {});
          const updatedConv = get().conversations.find(c => c.id === convId);
          if (updatedConv) syncConversationToFirestore(updatedConv).catch(() => {});
          get().saveConversations();
        }
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';

      const errorMsg: Message = {
        id: aiMsgId,
        role: 'assistant',
        content: `I encountered an error while generating a response. Please try again.\n\n_${errorMessage}_`,
        timestamp: new Date(),
        status: 'error',
        isStreaming: false,
        isError: true,
      };

      set(st => ({
        isTyping: false,
        error: errorMessage,
        conversations: st.conversations.map(c =>
          c.id === convId
            ? {
                ...c,
                messages: c.messages.map(m => m.id === aiMsgId ? errorMsg : m),
              }
            : c
        ),
      }));
    }
  },

  editMessage: async (messageId: string, newContent: string) => {
    const { activeConversationId } = get();
    if (!activeConversationId) return;

    set(state => ({
      conversations: state.conversations.map(c =>
        c.id === activeConversationId
          ? {
              ...c,
              messages: c.messages.map(m =>
                m.id === messageId
                  ? { ...m, content: newContent, isEdited: true, timestamp: new Date() }
                  : m
              ),
            }
          : c
      ),
    }));

    // Sync to Firestore
    const uid = getUserId();
    if (uid) {
      const msgRef = doc(db, 'messages', messageId);
      updateDoc(msgRef, {
        content: newContent,
        isEdited: true,
      }).catch(() => {});
    }

    get().saveConversations();
  },

  regenerateResponse: async (messageId: string) => {
    const { activeConversationId, conversations } = get();
    if (!activeConversationId) return;

    const conv = conversations.find(c => c.id === activeConversationId);
    if (!conv) return;

    // Find the message to regenerate and get the preceding user message
    const msgIndex = conv.messages.findIndex(m => m.id === messageId);
    if (msgIndex < 0) return;

    // Get messages up to (but not including) the AI response being regenerated
    const messagesBeforeRegenerate = conv.messages.slice(0, msgIndex);
    const lastUserMsg = [...messagesBeforeRegenerate].reverse().find(m => m.role === 'user');
    if (!lastUserMsg) return;

    // Remove the old AI response and everything after it
    set(state => ({
      conversations: state.conversations.map(c =>
        c.id === activeConversationId
          ? { ...c, messages: messagesBeforeRegenerate }
          : c
      ),
    }));

    // Delete old message from Firestore
    const uid = getUserId();
    if (uid) {
      const msgRef = doc(db, 'messages', messageId);
      deleteDoc(msgRef).catch(() => {});
    }

    // Re-send the last user message to get a new AI response
    const aiMsgId = generateId();
    const aiPlaceholder: Message = {
      id: aiMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      status: 'sending',
      isStreaming: true,
    };

    set(st => ({
      isTyping: true,
      conversations: st.conversations.map(c =>
        c.id === activeConversationId
          ? { ...c, messages: [...c.messages, aiPlaceholder] }
          : c
      ),
    }));

    const historyMessages = buildHistory(messagesBeforeRegenerate);

    try {
      let fullContent = '';

      await streamChat(historyMessages, (chunk) => {
        if (chunk.delta) {
          fullContent += chunk.delta;
          set(st => ({
            conversations: st.conversations.map(c =>
              c.id === activeConversationId
                ? {
                    ...c,
                    messages: c.messages.map(m =>
                      m.id === aiMsgId ? { ...m, content: fullContent } : m
                    ),
                  }
                : c
            ),
          }));
        }

        if (chunk.done) {
          const finalMsg: Message = {
            id: aiMsgId,
            role: 'assistant',
            content: fullContent || 'Unable to regenerate. Please try again.',
            timestamp: new Date(),
            status: 'delivered',
            isStreaming: false,
          };

          set(st => ({
            isTyping: false,
            conversations: st.conversations.map(c =>
              c.id === activeConversationId
                ? {
                    ...c,
                    messages: c.messages.map(m => m.id === aiMsgId ? finalMsg : m),
                    lastMessage: fullContent.slice(0, 100),
                    updatedAt: new Date(),
                  }
                : c
            ),
          }));

          syncMessageToFirestore(activeConversationId, finalMsg).catch(() => {});
          get().saveConversations();
        }
      });
    } catch (err) {
      set(st => ({
        isTyping: false,
        conversations: st.conversations.map(c =>
          c.id === activeConversationId
            ? {
                ...c,
                messages: c.messages.map(m =>
                  m.id === aiMsgId
                    ? { ...m, content: 'Regeneration failed. Please try again.', status: 'error' as MessageStatus, isStreaming: false, isError: true }
                    : m
                ),
              }
            : c
        ),
      }));
    }
  },

  copyMessage: async (messageId: string) => {
    const conv = get().activeConversation();
    if (!conv) return;
    const msg = conv.messages.find(m => m.id === messageId);
    if (msg) {
      await Clipboard.setStringAsync(msg.content);
    }
  },

  deleteMessage: async (messageId: string) => {
    const { activeConversationId } = get();
    if (!activeConversationId) return;

    set(state => ({
      conversations: state.conversations.map(c =>
        c.id === activeConversationId
          ? {
              ...c,
              messages: c.messages.filter(m => m.id !== messageId),
              messageCount: Math.max(0, c.messageCount - 1),
            }
          : c
      ),
    }));

    const uid = getUserId();
    if (uid) {
      const msgRef = doc(db, 'messages', messageId);
      deleteDoc(msgRef).catch(() => {});
    }
    get().saveConversations();
  },

  // ── Search & UI ────────────────────────────────────────────────────────────

  setSearchQuery: (searchQuery: string) => set({ searchQuery }),
  toggleDrawer: () => set(state => ({ showDrawer: !state.showDrawer })),
  setShowDrawer: (showDrawer: boolean) => set({ showDrawer }),

  // ── Error ──────────────────────────────────────────────────────────────────

  clearError: () => set({ error: null }),

  // ── Offline Persistence ────────────────────────────────────────────────────

  loadConversations: async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed: Conversation[] = JSON.parse(data);
        const rehydrated = parsed.map(c => ({
          ...c,
          createdAt: new Date(c.createdAt),
          updatedAt: new Date(c.updatedAt),
          messages: c.messages.map(m => ({
            ...m,
            timestamp: new Date(m.timestamp),
          })),
        }));

        // Only set if we don't already have Firestore data
        const { conversations } = get();
        if (conversations.length === 0) {
          set({
            conversations: rehydrated,
            activeConversationId: rehydrated[0]?.id ?? null,
          });
        }
      }
    } catch {
      // Cache read failed — continue without cached data
    }
  },

  saveConversations: async () => {
    try {
      const { conversations } = get();
      // Only cache last 20 conversations with last 50 messages each
      const toCache = conversations.slice(0, 20).map(c => ({
        ...c,
        messages: c.messages.slice(-50),
      }));
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toCache));
    } catch {
      // Cache write failed — non-critical
    }
  },
}));
