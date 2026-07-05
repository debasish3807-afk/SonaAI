/**
 * SONA AI — Root Layout
 * Handles: theme initialization, auth initialization, session management,
 * and Stack navigation configuration for all app screens.
 */

import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AlertProvider } from '@/template';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useThemeStore } from '@/stores/useThemeStore';
import { useAuthStore } from '@/stores/useAuthStore';

function RootLayoutNav() {
  const { isDark } = useThemeStore();
  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        {/* Auth Flow */}
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
        <Stack.Screen name="login" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="signup" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="forgot-password" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="auth/callback" options={{ animation: 'fade', headerShown: false }} />

        {/* Main App */}
        <Stack.Screen name="(tabs)" />

        {/* Feature Screens */}
        <Stack.Screen name="knowledge-vault" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="image-generator" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="website-builder" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="apk-builder" options={{ animation: 'slide_from_right' }} />

        {/* User & Social */}
        <Stack.Screen name="profile" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="notifications" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="notification-center" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="search" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="ai-history" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="downloads" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="favorites" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="recent-activity" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="activity-center" options={{ animation: 'slide_from_right' }} />

        {/* Info */}
        <Stack.Screen name="help-center" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="about" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="privacy-policy" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="terms-of-service" options={{ animation: 'slide_from_right' }} />

        {/* AI Tools */}
        <Stack.Screen name="prompt-library" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="ai-marketplace" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="ai-agents" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="plugin-manager" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="ai-models" options={{ animation: 'slide_from_right' }} />

        {/* Workspace */}
        <Stack.Screen name="workspace" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="project-manager" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="file-manager" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="backup-restore" options={{ animation: 'slide_from_right' }} />

        {/* Settings & Dev */}
        <Stack.Screen name="theme-manager" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="security-center" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="api-manager" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="developer-mode" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="debug-console" options={{ animation: 'slide_from_right' }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const { loadTheme } = useThemeStore();
  const { initialize, refreshSession } = useAuthStore();
  const appState = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    // Initialize theme and auth on app start
    loadTheme();
    initialize();
  }, []);

  useEffect(() => {
    // Session management: refresh session when app returns to foreground
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (appState.current.match(/inactive|background/) && nextState === 'active') {
        // App has come to the foreground — refresh the session token
        refreshSession();
      }
      appState.current = nextState;
    });

    return () => subscription.remove();
  }, [refreshSession]);

  return (
    <AlertProvider>
      <SafeAreaProvider>
        <RootLayoutNav />
      </SafeAreaProvider>
    </AlertProvider>
  );
}
