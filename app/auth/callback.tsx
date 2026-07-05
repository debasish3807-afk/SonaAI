/**
 * SONA AI — OAuth Callback Handler
 * Deep link: sonaai://auth/callback
 *
 * After Google (or any OAuth provider) redirects back to the app,
 * Expo Router resolves this route. Firebase processes the credential
 * exchange. We wait for the auth state to settle then redirect.
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/stores/useAuthStore';
import { FontSize, FontWeight, Spacing, BorderRadius } from '@/constants/theme';

export default function AuthCallbackScreen() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const { initialize } = useAuthStore();

  const spinAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entry animation
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();

    // Pulse animation for the logo
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();

    // Spinner
    Animated.loop(
      Animated.timing(spinAnim, { toValue: 1, duration: 1200, useNativeDriver: true })
    ).start();
  }, []);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    let retryTimeout: ReturnType<typeof setTimeout>;

    const handleCallback = async () => {
      // Give Firebase a moment to process the OAuth callback
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Re-initialize to pick up the authenticated session
      await initialize();

      const { user } = useAuthStore.getState();
      if (user) {
        router.replace('/(tabs)' as any);
      } else {
        // Retry after a longer delay
        retryTimeout = setTimeout(async () => {
          await initialize();
          const { user: retryUser } = useAuthStore.getState();
          if (retryUser) {
            router.replace('/(tabs)' as any);
          } else {
            router.replace('/login' as any);
          }
        }, 2000);
      }
    };

    handleCallback();

    // Safety timeout: redirect to login after 8 seconds max
    timeout = setTimeout(() => {
      const { user } = useAuthStore.getState();
      if (!user) {
        router.replace('/login' as any);
      }
    }, 8000);

    return () => {
      clearTimeout(timeout);
      clearTimeout(retryTimeout);
    };
  }, []);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {isDark && (
        <View style={[styles.orb, { backgroundColor: `${colors.primary}12` }]} />
      )}

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Logo */}
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.logo}>
            <Text style={styles.logoText}>S</Text>
          </LinearGradient>
        </Animated.View>

        {/* Spinner */}
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <MaterialIcons name="autorenew" size={28} color={colors.primary} />
        </Animated.View>

        <Text style={[styles.title, { color: colors.text }]}>Completing Sign-In</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Please wait while we verify your credentials
        </Text>

        {/* Provider badge */}
        <View style={[styles.providerBadge, { backgroundColor: `${colors.primary}10`, borderColor: `${colors.primary}20` }]}>
          <MaterialIcons name="verified-user" size={14} color={colors.primary} />
          <Text style={[styles.providerText, { color: colors.primary }]}>Secured by Google OAuth</Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orb: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    top: -60,
    right: -60,
  },
  content: {
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.xl,
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
    shadowColor: '#7C6FFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  logoText: {
    fontSize: 36,
    fontWeight: FontWeight.black,
    color: '#fff',
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    letterSpacing: -0.3,
    marginTop: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSize.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
  providerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    marginTop: Spacing.sm,
  },
  providerText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
  },
});
