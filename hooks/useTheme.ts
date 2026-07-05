import { useThemeStore } from '@/stores/useThemeStore';

export const useTheme = () => {
  const { colors, isDark, mode, toggleTheme, setTheme } = useThemeStore();
  return { colors, isDark, mode, toggleTheme, setTheme };
};
