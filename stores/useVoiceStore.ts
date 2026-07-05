/**
 * SONA AI — Voice Store (Phase 3)
 * Speech-to-Text, Text-to-Speech, AI Agent Actions
 */

import { create } from 'zustand';
import * as Speech from 'expo-speech';
import { sendChat, streamChat, ChatMessage } from '@/services/gemini.service';
import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

export type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking';
export type AgentAction = 'summarize' | 'rewrite' | 'translate' | 'explain'
  | 'continue' | 'grammar' | 'code' | 'debug' | 'imagePrompt' | 'copy' | 'share' | 'saveToMemory';

export interface TTSSettings {
  speed: number;
  pitch: number;
  voice: string;
  language: string;
  autoSpeak: boolean;
}

interface VoiceStoreState {
  // Voice Chat
  voiceState: VoiceState;
  transcript: string;
  aiResponse: string;
  isStreaming: boolean;
  voiceLanguage: string;

  // TTS
  ttsSettings: TTSSettings;
  isSpeaking: boolean;
  isPaused: boolean;

  // AI Thinking
  isThinking: boolean;
  canCancel: boolean;
  streamingText: string;

  // Actions
  setVoiceState: (state: VoiceState) => void;
  setTranscript: (text: string) => void;
  processVoiceInput: (text: string) => Promise<void>;
  cancelGeneration: () => void;
  retryGeneration: () => Promise<void>;

  // TTS Controls
  speak: (text: string) => void;
  stopSpeaking: () => void;
  pauseSpeaking: () => void;
  resumeSpeaking: () => void;
  updateTTSSettings: (settings: Partial<TTSSettings>) => void;

  // Agent Actions
  executeAction: (action: AgentAction, content: string, options?: Record<string, string>) => Promise<string>;

  // Voice Language
  setVoiceLanguage: (lang: string) => void;
  clearResponse: () => void;
}

const DEFAULT_TTS: TTSSettings = {
  speed: 1.0, pitch: 1.0, voice: '', language: 'en-US', autoSpeak: false,
};

let currentAbortController: AbortController | null = null;

const ACTION_PROMPTS: Record<AgentAction, (content: string, opts?: Record<string, string>) => string> = {
  summarize: (c) => `Summarize this concisely in 2-3 sentences:\n\n${c}`,
  rewrite: (c) => `Rewrite this more clearly and professionally:\n\n${c}`,
  translate: (c, o) => `Translate to ${o?.language ?? 'Spanish'}:\n\n${c}`,
  explain: (c) => `Explain this in simple terms:\n\n${c}`,
  continue: (c) => `Continue writing from where this left off:\n\n${c}`,
  grammar: (c) => `Fix all grammar and spelling errors. Return only the corrected text:\n\n${c}`,
  code: (c) => `Generate code for:\n\n${c}`,
  debug: (c) => `Debug this code and explain the fix:\n\n${c}`,
  imagePrompt: (c) => `Generate a detailed image generation prompt based on:\n\n${c}`,
  copy: () => '',
  share: () => '',
  saveToMemory: () => '',
};

export const useVoiceStore = create<VoiceStoreState>((set, get) => ({
  voiceState: 'idle',
  transcript: '',
  aiResponse: '',
  isStreaming: false,
  voiceLanguage: 'en-US',
  ttsSettings: DEFAULT_TTS,
  isSpeaking: false,
  isPaused: false,
  isThinking: false,
  canCancel: false,
  streamingText: '',

  setVoiceState: (voiceState) => set({ voiceState }),
  setTranscript: (transcript) => set({ transcript }),
  setVoiceLanguage: (voiceLanguage) => set({ voiceLanguage }),
  clearResponse: () => set({ aiResponse: '', streamingText: '', isStreaming: false, isThinking: false }),

  processVoiceInput: async (text) => {
    set({ voiceState: 'processing', isThinking: true, canCancel: true, aiResponse: '', streamingText: '' });
    currentAbortController = new AbortController();

    const messages: ChatMessage[] = [
      { role: 'system', content: 'You are SONA AI voice assistant. Be concise and conversational. Keep responses under 3 sentences unless asked for detail.' },
      { role: 'user', content: text },
    ];

    try {
      let full = '';
      set({ isStreaming: true, isThinking: false });

      await streamChat(messages, (chunk) => {
        if (currentAbortController?.signal.aborted) return;
        if (chunk.delta) {
          full += chunk.delta;
          set({ streamingText: full });
        }
        if (chunk.done) {
          set({ aiResponse: full, isStreaming: false, canCancel: false, voiceState: 'speaking' });
          const { ttsSettings } = get();
          if (ttsSettings.autoSpeak && full) {
            get().speak(full);
          }
        }
      });
    } catch {
      set({ aiResponse: 'Sorry, I encountered an error.', isStreaming: false, isThinking: false, canCancel: false, voiceState: 'idle' });
    }
  },

  cancelGeneration: () => {
    currentAbortController?.abort();
    currentAbortController = null;
    set({ isStreaming: false, isThinking: false, canCancel: false, voiceState: 'idle' });
  },

  retryGeneration: async () => {
    const { transcript } = get();
    if (transcript) await get().processVoiceInput(transcript);
  },

  // TTS
  speak: (text) => {
    const { ttsSettings } = get();
    Speech.speak(text, {
      language: ttsSettings.language,
      rate: ttsSettings.speed,
      pitch: ttsSettings.pitch,
      voice: ttsSettings.voice || undefined,
      onDone: () => set({ isSpeaking: false, voiceState: 'idle' }),
      onStopped: () => set({ isSpeaking: false }),
    });
    set({ isSpeaking: true, isPaused: false });
  },

  stopSpeaking: () => {
    Speech.stop();
    set({ isSpeaking: false, isPaused: false, voiceState: 'idle' });
  },

  pauseSpeaking: () => {
    Speech.pause();
    set({ isPaused: true });
  },

  resumeSpeaking: () => {
    Speech.resume();
    set({ isPaused: false });
  },

  updateTTSSettings: (settings) => {
    set((s) => ({ ttsSettings: { ...s.ttsSettings, ...settings } }));
  },

  // Agent Actions
  executeAction: async (action, content, options) => {
    if (action === 'copy') {
      await Clipboard.setStringAsync(content);
      return 'Copied to clipboard.';
    }
    if (action === 'share') {
      const path = `${FileSystem.cacheDirectory}sona_share.txt`;
      await FileSystem.writeAsStringAsync(path, content);
      if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(path);
      return 'Shared.';
    }
    if (action === 'saveToMemory') {
      return 'SAVE_TO_MEMORY';
    }

    set({ isThinking: true, isStreaming: true, streamingText: '' });
    const prompt = ACTION_PROMPTS[action](content, options);
    try {
      let full = '';
      await streamChat(
        [{ role: 'user', content: prompt }],
        (chunk) => {
          if (chunk.delta) { full += chunk.delta; set({ streamingText: full }); }
          if (chunk.done) { set({ isStreaming: false, isThinking: false }); }
        }
      );
      return full;
    } catch {
      set({ isStreaming: false, isThinking: false });
      return 'Action failed. Please try again.';
    }
  },
}));
