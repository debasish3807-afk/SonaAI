import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AlertProvider } from '@/template';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useThemeStore } from '@/stores/useThemeStore';

function RootLayoutNav() {
  const { isDark } = useThemeStore();
  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="knowledge-vault" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="image-generator" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="website-builder" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="apk-builder" options={{ animation: 'slide_from_right' }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const { loadTheme } = useThemeStore();

  useEffect(() => {
    loadTheme();
  }, []);

  return (
    <AlertProvider>
      <SafeAreaProvider>
        <RootLayoutNav />
      </SafeAreaProvider>
    </AlertProvider>
  );
}
