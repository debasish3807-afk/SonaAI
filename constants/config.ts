// SONA AI - App Configuration
// TODO: Replace with real API endpoints in future integration

export const APP_CONFIG = {
  name: 'SONA AI',
  version: '1.0.0',
  buildNumber: 1,
  description: 'Your intelligent AI companion',
};

// TODO: Configure Gemini AI endpoint
export const AI_CONFIG = {
  geminiEndpoint: 'https://generativelanguage.googleapis.com/v1beta',
  geminiModel: 'gemini-2.0-flash',
  maxTokens: 2048,
  temperature: 0.7,
  // TODO: Add API key from secure storage
  apiKey: '',
};

// TODO: Configure Supabase / Firebase
export const BACKEND_CONFIG = {
  // Supabase
  supabaseUrl: '',
  supabaseAnonKey: '',
  // Firebase (future)
  firebaseProjectId: '',
  firebaseAppId: '',
};

// TODO: Configure storage bucket
export const STORAGE_CONFIG = {
  bucketName: 'sona-ai-storage',
  maxFileSize: 10 * 1024 * 1024, // 10MB
};

export const FEATURE_FLAGS = {
  enableVoice: true,
  enableImageGen: true,
  enableWebsiteBuilder: true,
  enableApkBuilder: true,
  enableRealTimeChat: false, // TODO: Enable when backend ready
  enableCloudSync: false,    // TODO: Enable when Supabase connected
};

export const ANIMATION_DURATION = {
  fast: 150,
  normal: 300,
  slow: 500,
  verySlow: 800,
};
