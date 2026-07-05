/**
 * SONA AI — OAuth Callback Handler
 * Deep link: sonaai://auth/callback
 *
 * After Google (or any OAuth provider) redirects back to the app,
 * Expo Router resolves this route. The Firebase client handles
 * the OAuth token exchange. We simply wait for the auth state
 * to settle then redirect to the main app.
 */

import React, { useEffect } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuthStore } from '@/stores/useAuthStore';

export default function AuthCallbackScreen() {
  const router = useRouter();
  const { initialize } = useAuthStore();

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    const handleCallback = async () => {
      // Give Firebase a moment to process the OAuth callback
      await new Promise(resolve => setTimeout(resolve, 800));

      // Re-initialize store to pick up the authenticated session
      await initialize();

      const { user } = useAuthStore.getState();
      if (user) {
        router.replace('/(tabs)' as any);
      } else {
        // Retry once more after a short delay
        timeout = setTimeout(async () => {
          await initialize();
          const { user: retryUser } = useAuthStore.getState();
          if (retryUser) {
            router.replace('/(tabs)' as any);
          } else {
            // Failed — go back to login
            router.replace('/login' as any);
          }
        }, 1500);
      }
    };

    handleCallback();
    return () => clearTimeout(timeout);
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0D0D20', '#080810']} style={StyleSheet.absoluteFill} />
      <View style={styles.orb} />

      <LinearGradient colors={['#7C6FFF', '#00D4FF']} style={styles.logo}>
        <Text style={styles.logoText}>S</Text>
      </LinearGradient>

      <ActivityIndicator size="large" color="#7C6FFF" style={styles.spinner} />

      <Text style={styles.title}>Signing you in...</Text>
      <Text style={styles.subtitle}>Please wait while we complete authentication</Text>

      <View style={styles.providerRow}>
        <MaterialIcons name="g-translate" size={16} color="rgba(255,255,255,0.4)" />
        <Text style={styles.providerText}>Secured by Google OAuth</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080810',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 32,
  },
  orb: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(124,111,255,0.1)',
    top: -60,
    right: -60,
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7C6FFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 12,
  },
  logoText: {
    fontSize: 38,
    fontWeight: '900',
    color: '#fff',
  },
  spinner: { marginTop: 8 },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.45)',
    textAlign: 'center',
    lineHeight: 20,
  },
  providerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  providerText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '500',
  },
});
