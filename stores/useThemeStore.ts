import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@/constants/theme';

type ThemeMode = 'dark' | 'light';
type ThemeColors = typeof Colors.dark | typeof Colors.light;

interface ThemeState {
  mode: ThemeMode;
  colors: ThemeColors;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
  loadTheme: () => Promise<void>;
}

const THEME_KEY = 'sona_theme';

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: 'dark',
  colors: Colors.dark,
  isDark: true,

  toggleTheme: async () => {
    const newMode = get().mode === 'dark' ? 'light' : 'dark';
    set({
      mode: newMode,
      colors: Colors[newMode],
      isDark: newMode === 'dark',
    });
    await AsyncStorage.setItem(THEME_KEY, newMode);
  },

  setTheme: async (mode: ThemeMode) => {
    set({
      mode,
      colors: Colors[mode],
      isDark: mode === 'dark',
    });
    await AsyncStorage.setItem(THEME_KEY, mode);
  },

  loadTheme: async () => {
    try {
      const saved = await AsyncStorage.getItem(THEME_KEY);
      if (saved === 'light' || saved === 'dark') {
        set({
          mode: saved,
          colors: Colors[saved],
          isDark: saved === 'dark',
        });
      }
    } catch (_) {
      // Use default dark theme
    }
  },
}));
