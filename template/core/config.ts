// @ts-nocheck
import { AppConfig, FirebaseConfig } from './types';

class ConfigManager {
  private static instance: ConfigManager;
  private config: AppConfig | null = null;

  private constructor() {}

  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  public initialize(config: AppConfig) {
    if (this.config) {
      console.warn('[Template:Config] Configuration already set, updating...');
    }
    this.config = { ...config };
  }

  public getConfig(): AppConfig {
    if (!this.config) {
      this.config = this.createDefaultConfig();
    }
    return { ...this.config };
  }

  private createDefaultConfig(): AppConfig {
    return {
      firebase: {
        apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? '',
        authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
        projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? '',
        storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
        messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
        appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? '',
        measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID ?? '',
      },
      auth: {
        enabled: true,
        providers: ['email', 'google', 'anonymous'],
        autoCreateProfile: true,
      },
      storage: {
        enabled: true,
        maxFileSize: 10 * 1024 * 1024,
      },
      payments: false,
    };
  }

  public getModuleConfig<T = any>(moduleName: string): T | null {
    const config = this.getConfig();
    return (config as any)[moduleName] || null;
  }

  public isModuleEnabled(moduleName: string): boolean {
    const moduleConfig = this.getModuleConfig(moduleName);
    return moduleConfig !== false && moduleConfig !== null;
  }

  public getFirebaseConfig(): FirebaseConfig {
    return this.getConfig().firebase;
  }

  public updateConfig(updates: Partial<AppConfig>) {
    const config = this.getConfig();
    this.config = { ...config, ...updates };
  }
}

export const configManager = ConfigManager.getInstance();

export const createConfig = (options: Partial<AppConfig> = {}): AppConfig => {
  const defaults = ConfigManager.getInstance().getConfig();
  return { ...defaults, ...options };
};
