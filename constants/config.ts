// SONA AI - App Configuration

export const APP_CONFIG = {
  name: 'SONA AI',
  version: '1.0.0',
  buildNumber: 1,
  description: 'Your intelligent AI companion',
};

// Gemini AI endpoint configuration
export const AI_CONFIG = {
  geminiEndpoint: 'https://generativelanguage.googleapis.com/v1beta',
  geminiModel: 'gemini-2.0-flash',
  maxTokens: 2048,
  temperature: 0.7,
};

// Firebase backend configuration (sourced from environment variables)
export const FIREBASE_CONFIG = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? '',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? '',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? '',
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID ?? '',
};

// Storage bucket configuration
export const STORAGE_CONFIG = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  allowedDocTypes: ['application/pdf', 'text/plain', 'application/json'],
};

export const FEATURE_FLAGS = {
  enableVoice: true,
  enableImageGen: true,
  enableWebsiteBuilder: true,
  enableApkBuilder: true,
  enableRealTimeChat: true,
  enableCloudSync: true,
};

export const ANIMATION_DURATION = {
  fast: 150,
  normal: 300,
  slow: 500,
  verySlow: 800,
};
