import { create } from 'zustand';

export interface KnowledgeItem {
  id: string;
  title: string;
  description: string;
  type: 'document' | 'url' | 'note' | 'image';
  size?: string;
  tags: string[];
  createdAt: string;
}

export interface GeneratedImage {
  id: string;
  prompt: string;
  imageUrl: string;
  style: string;
  createdAt: string;
}

interface AppState {
  isOnboarded: boolean;
  knowledgeItems: KnowledgeItem[];
  generatedImages: GeneratedImage[];
  voiceMode: 'idle' | 'listening' | 'processing' | 'speaking';
  setOnboarded: (v: boolean) => void;
  addKnowledgeItem: (item: Omit<KnowledgeItem, 'id' | 'createdAt'>) => void;
  deleteKnowledgeItem: (id: string) => void;
  addGeneratedImage: (image: Omit<GeneratedImage, 'id' | 'createdAt'>) => void;
  setVoiceMode: (mode: AppState['voiceMode']) => void;
}

const generateId = () => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const MOCK_KNOWLEDGE: KnowledgeItem[] = [
  { id: '1', title: 'SONA AI Product Brief', description: 'Complete product specification and roadmap document', type: 'document', size: '2.4 MB', tags: ['product', 'strategy'], createdAt: new Date().toISOString() },
  { id: '2', title: 'AI Research Papers', description: 'Collection of latest LLM and multimodal research papers', type: 'document', size: '15.8 MB', tags: ['research', 'ai'], createdAt: new Date().toISOString() },
  { id: '3', title: 'Design System', description: 'UI/UX guidelines and component library documentation', type: 'url', tags: ['design', 'ui'], createdAt: new Date().toISOString() },
  { id: '4', title: 'API Architecture Notes', description: 'Backend API design patterns and best practices', type: 'note', tags: ['backend', 'api'], createdAt: new Date().toISOString() },
  { id: '5', title: 'Competitor Analysis', description: 'Market research and competitive landscape overview', type: 'document', size: '5.2 MB', tags: ['business', 'research'], createdAt: new Date().toISOString() },
];

const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1681266895901-91b24c1a5a05?w=400',
  'https://images.unsplash.com/photo-1686191130479-b2531e09de70?w=400',
  'https://images.unsplash.com/photo-1682685797406-97f364419b4a?w=400',
];

const MOCK_IMAGES: GeneratedImage[] = [
  { id: '1', prompt: 'Futuristic city at night with neon lights', imageUrl: PLACEHOLDER_IMAGES[0], style: 'Cinematic', createdAt: new Date().toISOString() },
  { id: '2', prompt: 'Abstract digital art, purple waves', imageUrl: PLACEHOLDER_IMAGES[1], style: 'Abstract', createdAt: new Date().toISOString() },
  { id: '3', prompt: 'AI robot in a beautiful garden', imageUrl: PLACEHOLDER_IMAGES[2], style: 'Photorealistic', createdAt: new Date().toISOString() },
];

export const useAppStore = create<AppState>((set) => ({
  isOnboarded: false,
  knowledgeItems: MOCK_KNOWLEDGE,
  generatedImages: MOCK_IMAGES,
  voiceMode: 'idle',

  setOnboarded: (v) => set({ isOnboarded: v }),

  addKnowledgeItem: (item) => set(state => ({
    knowledgeItems: [{ ...item, id: generateId(), createdAt: new Date().toISOString() }, ...state.knowledgeItems],
  })),

  deleteKnowledgeItem: (id) => set(state => ({
    knowledgeItems: state.knowledgeItems.filter(k => k.id !== id),
  })),

  addGeneratedImage: (image) => set(state => ({
    generatedImages: [{ ...image, id: generateId(), createdAt: new Date().toISOString() }, ...state.generatedImages],
  })),

  setVoiceMode: (mode) => set({ voiceMode: mode }),
}));
