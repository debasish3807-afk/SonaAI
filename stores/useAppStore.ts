import { create } from 'zustand';

export interface KnowledgeItem {
  id: string;
  title: string;
  description: string;
  type: 'document' | 'url' | 'note' | 'image';
  size?: string;
  tags: string[];
  createdAt: string;
  isFavorite?: boolean;
}

export interface GeneratedImage {
  id: string;
  prompt: string;
  imageUrl: string;
  style: string;
  createdAt: string;
  isFavorite?: boolean;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  icon: string;
  color: string;
  time: string;
  isRead: boolean;
  type: 'ai' | 'system' | 'update' | 'reminder';
}

export interface AIHistoryEntry {
  id: string;
  type: 'chat' | 'image' | 'voice' | 'website' | 'apk';
  title: string;
  preview: string;
  timestamp: string;
  tokens?: number;
}

export interface DownloadItem {
  id: string;
  name: string;
  type: 'apk' | 'image' | 'document' | 'website';
  size: string;
  status: 'completed' | 'failed' | 'in_progress';
  progress?: number;
  createdAt: string;
  icon: string;
  color: string;
}

interface AppState {
  isOnboarded: boolean;
  knowledgeItems: KnowledgeItem[];
  generatedImages: GeneratedImage[];
  notifications: Notification[];
  aiHistory: AIHistoryEntry[];
  downloads: DownloadItem[];
  voiceMode: 'idle' | 'listening' | 'processing' | 'speaking';
  setOnboarded: (v: boolean) => void;
  addKnowledgeItem: (item: Omit<KnowledgeItem, 'id' | 'createdAt'>) => void;
  deleteKnowledgeItem: (id: string) => void;
  toggleKnowledgeFavorite: (id: string) => void;
  addGeneratedImage: (image: Omit<GeneratedImage, 'id' | 'createdAt'>) => void;
  toggleImageFavorite: (id: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  setVoiceMode: (mode: AppState['voiceMode']) => void;
}

const generateId = () => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const MOCK_KNOWLEDGE: KnowledgeItem[] = [
  { id: '1', title: 'SONA AI Product Brief', description: 'Complete product specification and roadmap document for Q3', type: 'document', size: '2.4 MB', tags: ['product', 'strategy'], createdAt: new Date().toISOString(), isFavorite: true },
  { id: '2', title: 'AI Research Papers', description: 'Collection of latest LLM and multimodal research papers', type: 'document', size: '15.8 MB', tags: ['research', 'ai'], createdAt: new Date().toISOString() },
  { id: '3', title: 'Design System Guidelines', description: 'UI/UX guidelines and component library documentation', type: 'url', tags: ['design', 'ui'], createdAt: new Date().toISOString(), isFavorite: true },
  { id: '4', title: 'API Architecture Notes', description: 'Backend API design patterns and best practices for scalability', type: 'note', tags: ['backend', 'api'], createdAt: new Date().toISOString() },
  { id: '5', title: 'Competitor Analysis', description: 'Market research and competitive landscape overview', type: 'document', size: '5.2 MB', tags: ['business', 'research'], createdAt: new Date().toISOString() },
  { id: '6', title: 'React Native Tips', description: 'Performance optimization and best practices for mobile', type: 'note', tags: ['mobile', 'react-native'], createdAt: new Date().toISOString() },
];

const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1681266895901-91b24c1a5a05?w=600',
  'https://images.unsplash.com/photo-1686191130479-b2531e09de70?w=600',
  'https://images.unsplash.com/photo-1682685797406-97f364419b4a?w=600',
  'https://images.unsplash.com/photo-1696877347098-ef4b76d83f80?w=600',
];

const MOCK_IMAGES: GeneratedImage[] = [
  { id: '1', prompt: 'Futuristic city at night with neon lights', imageUrl: PLACEHOLDER_IMAGES[0], style: 'Cinematic', createdAt: new Date().toISOString(), isFavorite: true },
  { id: '2', prompt: 'Abstract digital art with purple waves', imageUrl: PLACEHOLDER_IMAGES[1], style: 'Abstract', createdAt: new Date().toISOString() },
  { id: '3', prompt: 'AI robot in a beautiful garden at sunset', imageUrl: PLACEHOLDER_IMAGES[2], style: 'Photorealistic', createdAt: new Date().toISOString(), isFavorite: true },
  { id: '4', prompt: 'Deep ocean bioluminescent creatures', imageUrl: PLACEHOLDER_IMAGES[3], style: '3D Render', createdAt: new Date().toISOString() },
];

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: '1', title: 'SONA AI Response Ready', body: 'Your image generation is complete. Tap to view.', icon: 'auto-awesome', color: '#7C6FFF', time: '2m ago', isRead: false, type: 'ai' },
  { id: '2', title: 'Memory Synced', body: '24 memories have been backed up to the cloud.', icon: 'cloud-done', color: '#00E676', time: '15m ago', isRead: false, type: 'system' },
  { id: '3', title: 'New AI Model Available', body: 'Gemini 2.5 Pro is now available. Update to use it.', icon: 'new-releases', color: '#F5C842', time: '1h ago', isRead: true, type: 'update' },
  { id: '4', title: 'Daily Reminder', body: 'You have 3 pending knowledge items to review.', icon: 'notifications', color: '#FF6B9D', time: '3h ago', isRead: true, type: 'reminder' },
  { id: '5', title: 'APK Build Complete', body: 'Your Android APK build finished successfully.', icon: 'android', color: '#00D4FF', time: '1d ago', isRead: true, type: 'ai' },
  { id: '6', title: 'Website Published', body: 'Your AI-generated website is now live!', icon: 'language', color: '#FF9800', time: '2d ago', isRead: true, type: 'ai' },
];

const MOCK_AI_HISTORY: AIHistoryEntry[] = [
  { id: '1', type: 'chat', title: 'React Native Architecture Discussion', preview: 'Discussed clean architecture patterns and MVVM...', timestamp: new Date(Date.now() - 120000).toISOString(), tokens: 1240 },
  { id: '2', type: 'image', title: 'Futuristic City Generation', preview: 'Futuristic city at night with neon lights, cinematic style...', timestamp: new Date(Date.now() - 3600000).toISOString() },
  { id: '3', type: 'voice', title: 'Quantum Computing Explanation', preview: 'Asked: Explain quantum entanglement in simple terms', timestamp: new Date(Date.now() - 7200000).toISOString() },
  { id: '4', type: 'website', title: 'Portfolio Website Build', preview: 'Dark-themed developer portfolio with project showcase...', timestamp: new Date(Date.now() - 86400000).toISOString() },
  { id: '5', type: 'chat', title: 'Python Code Assistance', preview: 'Wrote async data pipeline with error handling...', timestamp: new Date(Date.now() - 172800000).toISOString(), tokens: 870 },
  { id: '6', type: 'apk', title: 'Task Manager App Build', preview: 'Android APK with dark theme and Material Design...', timestamp: new Date(Date.now() - 259200000).toISOString() },
];

const MOCK_DOWNLOADS: DownloadItem[] = [
  { id: '1', name: 'SONA-Portfolio-v1.0.apk', type: 'apk', size: '28.4 MB', status: 'completed', createdAt: new Date().toISOString(), icon: 'android', color: '#4CAF50' },
  { id: '2', name: 'ai-artwork-batch-01.zip', type: 'image', size: '12.8 MB', status: 'completed', createdAt: new Date().toISOString(), icon: 'image', color: '#7C6FFF' },
  { id: '3', name: 'SONA-AI-Research.pdf', type: 'document', size: '5.2 MB', status: 'completed', createdAt: new Date().toISOString(), icon: 'description', color: '#FF6B9D' },
  { id: '4', name: 'MyWebsite-export.zip', type: 'website', size: '3.1 MB', status: 'completed', createdAt: new Date().toISOString(), icon: 'language', color: '#FF9800' },
  { id: '5', name: 'SONA-Analytics-v2.apk', type: 'apk', size: '0 MB', status: 'in_progress', progress: 67, createdAt: new Date().toISOString(), icon: 'android', color: '#4CAF50' },
];

export const useAppStore = create<AppState>((set) => ({
  isOnboarded: false,
  knowledgeItems: MOCK_KNOWLEDGE,
  generatedImages: MOCK_IMAGES,
  notifications: MOCK_NOTIFICATIONS,
  aiHistory: MOCK_AI_HISTORY,
  downloads: MOCK_DOWNLOADS,
  voiceMode: 'idle',

  setOnboarded: (v) => set({ isOnboarded: v }),

  addKnowledgeItem: (item) => set(state => ({
    knowledgeItems: [{ ...item, id: generateId(), createdAt: new Date().toISOString() }, ...state.knowledgeItems],
  })),

  deleteKnowledgeItem: (id) => set(state => ({
    knowledgeItems: state.knowledgeItems.filter(k => k.id !== id),
  })),

  toggleKnowledgeFavorite: (id) => set(state => ({
    knowledgeItems: state.knowledgeItems.map(k => k.id === id ? { ...k, isFavorite: !k.isFavorite } : k),
  })),

  addGeneratedImage: (image) => set(state => ({
    generatedImages: [{ ...image, id: generateId(), createdAt: new Date().toISOString() }, ...state.generatedImages],
  })),

  toggleImageFavorite: (id) => set(state => ({
    generatedImages: state.generatedImages.map(img => img.id === id ? { ...img, isFavorite: !img.isFavorite } : img),
  })),

  markNotificationRead: (id) => set(state => ({
    notifications: state.notifications.map(n => n.id === id ? { ...n, isRead: true } : n),
  })),

  markAllNotificationsRead: () => set(state => ({
    notifications: state.notifications.map(n => ({ ...n, isRead: true })),
  })),

  setVoiceMode: (mode) => set({ voiceMode: mode }),
}));
