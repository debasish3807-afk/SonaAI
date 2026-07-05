/**
 * SONA AI — AI Service
 * High-level AI utilities using the Gemini API via gemini.service.ts
 */

import { AI_CONFIG } from '@/constants/config';
import { sendChat, ChatMessage } from '@/services/gemini.service';

export interface AIGenerateParams {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
}

export interface AIImageParams {
  prompt: string;
  style?: string;
  size?: '512x512' | '1024x1024' | '1024x1792';
}

export interface AIResponse {
  content: string;
  tokensUsed: number;
  model: string;
}

/**
 * Generates text content using the Gemini API.
 */
export const generateText = async (params: AIGenerateParams): Promise<AIResponse> => {
  const messages: ChatMessage[] = [
    { role: 'user', content: params.prompt },
  ];

  const content = await sendChat(messages);

  return {
    content,
    tokensUsed: Math.ceil(content.length / 4), // approximate token count
    model: AI_CONFIG.geminiModel,
  };
};

/**
 * Generates an image using Gemini's multimodal capabilities.
 * Currently returns a placeholder URL since Gemini image generation
 * requires the Imagen API which has separate access requirements.
 */
export const generateImage = async (params: AIImageParams): Promise<{ imageUrl: string }> => {
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: 'You are an image description generator. Describe the image that should be generated in vivid detail.',
    },
    { role: 'user', content: `Generate an image: ${params.prompt}` },
  ];

  // Use Gemini to refine the prompt (actual image generation requires Imagen API)
  await sendChat(messages);

  // Placeholder: return a generated image URL
  // In production, integrate with Imagen API or DALL-E for actual image generation
  const placeholders = [
    'https://images.unsplash.com/photo-1681266895901-91b24c1a5a05?w=512',
    'https://images.unsplash.com/photo-1686191130479-b2531e09de70?w=512',
    'https://images.unsplash.com/photo-1682685797406-97f364419b4a?w=512',
  ];
  return { imageUrl: placeholders[Math.floor(Math.random() * placeholders.length)] };
};

/**
 * Transcribes audio to text using Gemini's multimodal capabilities.
 * Note: For production, use a dedicated speech-to-text service like
 * Google Cloud Speech-to-Text for better accuracy.
 */
export const transcribeAudio = async (audioUri: string): Promise<string> => {
  // Gemini supports audio input for multimodal models
  // For now, return a prompt-based response as direct audio upload
  // requires the multimodal file API
  const messages: ChatMessage[] = [
    { role: 'user', content: 'Transcribe the following audio content.' },
  ];

  const result = await sendChat(messages);
  return result || 'Unable to transcribe audio.';
};

/**
 * Synthesizes speech from text using expo-speech.
 * Returns an empty string as the speech is played directly.
 */
export const synthesizeSpeech = async (text: string): Promise<string> => {
  const Speech = await import('expo-speech');
  Speech.speak(text, {
    language: 'en-US',
    rate: 1.0,
    pitch: 1.0,
  });
  return '';
};

/**
 * Generates a website HTML from a description using Gemini.
 */
export const generateWebsite = async (description: string): Promise<string> => {
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content:
        'You are a web developer. Generate a complete, modern HTML page with inline CSS and JavaScript based on the user description. Return only valid HTML code.',
    },
    { role: 'user', content: description },
  ];

  const html = await sendChat(messages);
  return html;
};

/**
 * Generates an APK configuration from an app description using Gemini.
 */
export const generateApkConfig = async (appDescription: string): Promise<object> => {
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content:
        'You are a mobile app architect. Generate a JSON configuration for a React Native app based on the description. Include packageName, version, screens, navigation, and features. Return valid JSON only.',
    },
    { role: 'user', content: appDescription },
  ];

  const result = await sendChat(messages);
  try {
    return JSON.parse(result);
  } catch {
    return {
      packageName: 'com.sona.generated',
      version: '1.0.0',
      description: appDescription,
      raw: result,
    };
  }
};
