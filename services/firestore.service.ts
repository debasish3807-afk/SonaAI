/**
 * SONA AI — Cloud Firestore Service
 *
 * Provides typed CRUD operations for all Firestore collections.
 * Collections:
 *  - users: User profiles and preferences
 *  - conversations: Chat conversation metadata
 *  - messages: Individual chat messages
 *  - memories: User memory/knowledge items
 *  - settings: App settings per user
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  onSnapshot,
  Timestamp,
  QueryConstraint,
  DocumentData,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/services/firebase';
import { auth } from '@/services/firebase';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  photoUrl?: string;
  plan: 'free' | 'pro';
  onboarded: boolean;
  preferences?: Record<string, any>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  lastMessage?: string;
  messageCount: number;
  model: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: Timestamp;
}

export interface Memory {
  id: string;
  userId: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  language: string;
  aiModel: string;
  fontSize: number;
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function getCurrentUserId(): string {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');
  return user.uid;
}

// ─── User Profiles ────────────────────────────────────────────────────────────

export const userProfiles = {
  async get(userId?: string): Promise<UserProfile | null> {
    const uid = userId ?? getCurrentUserId();
    const docRef = doc(db, 'users', uid);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as UserProfile;
  },

  async update(data: Partial<Omit<UserProfile, 'id' | 'createdAt'>>): Promise<void> {
    const uid = getCurrentUserId();
    const docRef = doc(db, 'users', uid);
    await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
  },

  async create(data: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
    const uid = getCurrentUserId();
    const docRef = doc(db, 'users', uid);
    await setDoc(docRef, {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  },

  onSnapshot(callback: (profile: UserProfile | null) => void): Unsubscribe {
    const uid = getCurrentUserId();
    const docRef = doc(db, 'users', uid);
    return onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        callback({ id: snap.id, ...snap.data() } as UserProfile);
      } else {
        callback(null);
      }
    });
  },
};

// ─── Conversations ────────────────────────────────────────────────────────────

export const conversations = {
  async list(maxResults = 50): Promise<Conversation[]> {
    const uid = getCurrentUserId();
    const q = query(
      collection(db, 'conversations'),
      where('userId', '==', uid),
      orderBy('updatedAt', 'desc'),
      limit(maxResults)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Conversation));
  },

  async get(conversationId: string): Promise<Conversation | null> {
    const docRef = doc(db, 'conversations', conversationId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as Conversation;
  },

  async create(title: string, model = 'gemini-2.0-flash'): Promise<string> {
    const uid = getCurrentUserId();
    const docRef = await addDoc(collection(db, 'conversations'), {
      userId: uid,
      title,
      messageCount: 0,
      model,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async update(conversationId: string, data: Partial<Omit<Conversation, 'id' | 'userId' | 'createdAt'>>): Promise<void> {
    const docRef = doc(db, 'conversations', conversationId);
    await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
  },

  async delete(conversationId: string): Promise<void> {
    const docRef = doc(db, 'conversations', conversationId);
    await deleteDoc(docRef);
  },

  onList(callback: (conversations: Conversation[]) => void, maxResults = 50): Unsubscribe {
    const uid = getCurrentUserId();
    const q = query(
      collection(db, 'conversations'),
      where('userId', '==', uid),
      orderBy('updatedAt', 'desc'),
      limit(maxResults)
    );
    return onSnapshot(q, (snap) => {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as Conversation));
      callback(items);
    });
  },
};

// ─── Messages ─────────────────────────────────────────────────────────────────

export const messages = {
  async list(conversationId: string, maxResults = 100): Promise<Message[]> {
    const q = query(
      collection(db, 'messages'),
      where('conversationId', '==', conversationId),
      orderBy('createdAt', 'asc'),
      limit(maxResults)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Message));
  },

  async add(conversationId: string, role: 'user' | 'assistant' | 'system', content: string): Promise<string> {
    const docRef = await addDoc(collection(db, 'messages'), {
      conversationId,
      role,
      content,
      createdAt: serverTimestamp(),
    });

    // Update conversation metadata
    const convRef = doc(db, 'conversations', conversationId);
    const convSnap = await getDoc(convRef);
    if (convSnap.exists()) {
      const currentCount = convSnap.data()?.messageCount ?? 0;
      await updateDoc(convRef, {
        lastMessage: content.slice(0, 100),
        messageCount: currentCount + 1,
        updatedAt: serverTimestamp(),
      });
    }

    return docRef.id;
  },

  async delete(messageId: string): Promise<void> {
    const docRef = doc(db, 'messages', messageId);
    await deleteDoc(docRef);
  },

  onList(conversationId: string, callback: (messages: Message[]) => void): Unsubscribe {
    const q = query(
      collection(db, 'messages'),
      where('conversationId', '==', conversationId),
      orderBy('createdAt', 'asc')
    );
    return onSnapshot(q, (snap) => {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as Message));
      callback(items);
    });
  },
};

// ─── Memories ─────────────────────────────────────────────────────────────────

export const memories = {
  async list(category?: string, maxResults = 100): Promise<Memory[]> {
    const uid = getCurrentUserId();
    const constraints: QueryConstraint[] = [
      where('userId', '==', uid),
      orderBy('updatedAt', 'desc'),
      limit(maxResults),
    ];
    if (category) {
      constraints.splice(1, 0, where('category', '==', category));
    }
    const q = query(collection(db, 'memories'), ...constraints);
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Memory));
  },

  async get(memoryId: string): Promise<Memory | null> {
    const docRef = doc(db, 'memories', memoryId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as Memory;
  },

  async create(data: Omit<Memory, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const uid = getCurrentUserId();
    const docRef = await addDoc(collection(db, 'memories'), {
      ...data,
      userId: uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async update(memoryId: string, data: Partial<Omit<Memory, 'id' | 'userId' | 'createdAt'>>): Promise<void> {
    const docRef = doc(db, 'memories', memoryId);
    await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
  },

  async delete(memoryId: string): Promise<void> {
    const docRef = doc(db, 'memories', memoryId);
    await deleteDoc(docRef);
  },
};

// ─── User Settings ────────────────────────────────────────────────────────────

const DEFAULT_SETTINGS: UserSettings = {
  theme: 'dark',
  notifications: true,
  language: 'en',
  aiModel: 'gemini-2.0-flash',
  fontSize: 16,
};

export const userSettings = {
  async get(): Promise<UserSettings> {
    const uid = getCurrentUserId();
    const docRef = doc(db, 'settings', uid);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...snap.data() } as UserSettings;
  },

  async update(data: Partial<UserSettings>): Promise<void> {
    const uid = getCurrentUserId();
    const docRef = doc(db, 'settings', uid);
    await setDoc(docRef, { ...data, updatedAt: serverTimestamp() }, { merge: true });
  },

  async reset(): Promise<void> {
    const uid = getCurrentUserId();
    const docRef = doc(db, 'settings', uid);
    await setDoc(docRef, { ...DEFAULT_SETTINGS, updatedAt: serverTimestamp() });
  },

  onSnapshot(callback: (settings: UserSettings) => void): Unsubscribe {
    const uid = getCurrentUserId();
    const docRef = doc(db, 'settings', uid);
    return onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        callback({ ...DEFAULT_SETTINGS, ...snap.data() } as UserSettings);
      } else {
        callback(DEFAULT_SETTINGS);
      }
    });
  },
};
