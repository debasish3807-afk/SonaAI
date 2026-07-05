// @ts-nocheck
// Firebase configuration
export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

// Auth module configuration
export interface AuthConfig {
  enabled?: boolean;
  providers?: ('email' | 'google' | 'anonymous')[];
  autoCreateProfile?: boolean;
}

// Payments module configuration
export interface PaymentsConfig {
  enabled?: boolean;
  stripePublishableKey?: string;
}

// Storage module configuration
export interface StorageConfig {
  enabled?: boolean;
  maxFileSize?: number;
}

// Module configuration union type
export interface ModuleConfig {
  auth?: AuthConfig | false;
  payments?: PaymentsConfig | false;
  storage?: StorageConfig | false;
}

// Main configuration interface
export interface AppConfig extends ModuleConfig {
  firebase: FirebaseConfig;
}

// Runtime state
export interface SDKState {
  initialized: boolean;
  enabledModules: string[];
  config: AppConfig;
}

// Error type
export interface AppError {
  code: string;
  message: string;
  module?: string;
  details?: any;
}
