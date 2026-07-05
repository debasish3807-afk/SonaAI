import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFIX = 'sona_';

export const storage = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(`${PREFIX}${key}`);
      return value ? JSON.parse(value) : null;
    } catch {
      return null;
    }
  },

  async set(key: string, value: unknown): Promise<void> {
    try {
      await AsyncStorage.setItem(`${PREFIX}${key}`, JSON.stringify(value));
    } catch {}
  },

  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(`${PREFIX}${key}`);
    } catch {}
  },

  async clear(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const sonaKeys = keys.filter(k => k.startsWith(PREFIX));
      await AsyncStorage.multiRemove(sonaKeys);
    } catch {}
  },
};

// TODO: Replace with Supabase Storage when backend is ready
export const fileStorage = {
  async upload(file: { uri: string; name: string; type: string }): Promise<string> {
    // TODO: Implement Supabase storage upload
    // const { data, error } = await supabase.storage.from('bucket').upload(path, file);
    return `mock://uploads/${file.name}`;
  },

  async download(path: string): Promise<string> {
    // TODO: Implement Supabase storage download
    return path;
  },

  async delete(path: string): Promise<void> {
    // TODO: Implement Supabase storage delete
  },
};
