/**
 * SONA AI — Forgot Password Screen
 * Premium Material 3 design with dark/light theme support.
 * Handles: Password reset email via Firebase Auth.
 * Shows success state with instructions after sending.
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/stores/useAuthStore';
import { BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/theme';

export default function ForgotPasswordScreen() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const { forgotPassword, isLoading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const successScale = useRef(new Animated.Value(0.5)).current;
  const successFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 9, useNativeDriver: true }),
    ]).start();
  }, []);

  const triggerShake = useCallback(() => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  }, [shakeAnim]);

  const animateSuccess = useCallback(() => {
    Animated.parallel([
      Animated.spring(successScale, { toValue: 1, tension: 60, friction: 7, useNativeDriver: true }),
      Animated.timing(successFade, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, [successScale, successFade]);

  const displayError = localError || error;

  useEffect(() => {
    if (displayError) triggerShake();
  }, [displayError, triggerShake]);

  const dismissError = () => {
    setLocalError(null);
    clearError();
  };

  const handleSendReset = async () => {
    dismissError();

    if (!email.trim()) {
      setLocalError('Please enter your email address.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setLocalError('Please enter a valid email address.');
      return;
    }

    const { error: err } = await forgotPassword(email.trim());
    if (!err) {
      setEmailSent(true);
      animateSuccess();
    }
  };

  const handleBackToLogin = () => {
    router.back();
  };

  // Theme-aware styles
  const inputBg = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';
  const inputBorder = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';
  const inputBorderFocused = colors.primary;
  const inputText = colors.text;
  const placeholderColor = colors.textMuted;

  // ── Success State ──────────────────────────────────────────────────────────

  if (emailSent) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar style={isDark ? 'light' : 'dark'} />

        {isDark && (
          <View style={[styles.orb, styles.orbTopRight, { backgroundColor: `${colors.success}12` }]} />
        )}

        <SafeAreaView edges={['top', 'bottom']} style={styles.flex}>
          <View style={styles.successContent}>
            <Animated.View
              style={[
                styles.successCard,
                {
                  backgroundColor: isDark ? colors.glass : colors.surface,
                  borderColor: isDark ? colors.cardBorder : colors.border,
                  opacity: successFade,
                  transform: [{ scale: successScale }],
                },
              ]}
            >
              {/* Success Icon */}
              <View style={[styles.successIconContainer, { backgroundColor: `${colors.success}15` }]}>
                <MaterialIcons name="mark-email-read" size={48} color={colors.success} />
              </View>

              <Text style={[styles.successTitle, { color: colors.text }]}>
                Check Your Email
              </Text>

              <Text style={[styles.successMessage, { color: colors.textSecondary }]}>
                We've sent a password reset link to:
              </Text>

              <View style={[styles.emailBadge, { backgroundColor: `${colors.primary}12`, borderColor: `${colors.primary}25` }]}>
                <MaterialIcons name="mail" size={16} color={colors.primary} />
                <Text style={[styles.emailBadgeText, { color: colors.primary }]} numberOfLines={1}>
                  {email}
                </Text>
              </View>

              <Text style={[styles.successInstructions, { color: colors.textMuted }]}>
                Click the link in the email to reset your password. If you don't see it, check your spam folder.
              </Text>

              {/* Back to Login */}
              <Pressable
                onPress={handleBackToLogin}
                style={({ pressed }) => [styles.primaryButton, { opacity: pressed ? 0.85 : 1 }]}
              >
                <LinearGradient
                  colors={[colors.primary, colors.primaryDark]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.primaryButtonGradient}
                >
                  <MaterialIcons name="arrow-back" size={20} color="#fff" />
                  <Text style={styles.primaryButtonText}>Back to Sign In</Text>
                </LinearGradient>
              </Pressable>

              {/* Resend option */}
              <Pressable
                onPress={() => { setEmailSent(false); }}
                style={styles.resendButton}
              >
                <Text style={[styles.resendText, { color: colors.textSecondary }]}>
                  Didn't receive it?{' '}
                  <Text style={{ color: colors.primary, fontWeight: FontWeight.bold }}>Send again</Text>
                </Text>
              </Pressable>
            </Animated.View>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // ── Main Form State ────────────────────────────────────────────────────────

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {isDark && (
        <>
          <View style={[styles.orb, styles.orbTopRight, { backgroundColor: `${colors.primary}15` }]} />
          <View style={[styles.orb, styles.orbBottomLeft, { backgroundColor: `${colors.secondary}10` }]} />
        </>
      )}

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <SafeAreaView edges={['top', 'bottom']} style={styles.flex}>
            <View style={styles.content}>

              {/* Back Button */}
              <Pressable
                onPress={handleBackToLogin}
                style={({ pressed }) => [styles.backButton, { opacity: pressed ? 0.6 : 1 }]}
                hitSlop={12}
              >
                <MaterialIcons name="arrow-back-ios" size={20} color={colors.textSecondary} />
              </Pressable>

              {/* Header */}
              <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
                <View style={[styles.iconBadge, { backgroundColor: `${colors.primary}15` }]}>
                  <MaterialIcons name="lock-reset" size={28} color={colors.primary} />
                </View>
                <Text style={[styles.title, { color: colors.text }]}>Reset Password</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                  Enter your email and we'll send you a link to reset your password
                </Text>
              </Animated.View>

              {/* Form Card */}
              <Animated.View
                style={[
                  styles.formCard,
                  {
                    backgroundColor: isDark ? colors.glass : colors.surface,
                    borderColor: isDark ? colors.cardBorder : colors.border,
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }, { translateX: shakeAnim }],
                  },
                ]}
              >
                {/* Error Banner */}
                {displayError && (
                  <Pressable onPress={dismissError} style={[styles.errorBanner, { backgroundColor: `${colors.error}15`, borderColor: `${colors.error}30` }]}>
                    <MaterialIcons name="error-outline" size={18} color={colors.error} />
                    <Text style={[styles.errorText, { color: colors.error }]} numberOfLines={2}>
                      {displayError}
                    </Text>
                    <MaterialIcons name="close" size={16} color={colors.error} />
                  </Pressable>
                )}

                {/* Email Input */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Email Address</Text>
                  <View
                    style={[
                      styles.inputContainer,
                      {
                        backgroundColor: inputBg,
                        borderColor: emailFocused ? inputBorderFocused : inputBorder,
                        borderWidth: emailFocused ? 1.5 : 1,
                      },
                    ]}
                  >
                    <MaterialIcons
                      name="mail-outline"
                      size={20}
                      color={emailFocused ? colors.primary : colors.textMuted}
                    />
                    <TextInput
                      value={email}
                      onChangeText={(t) => { setEmail(t); dismissError(); }}
                      placeholder="Enter your registered email"
                      placeholderTextColor={placeholderColor}
                      style={[styles.input, { color: inputText }]}
                      onFocus={() => setEmailFocused(true)}
                      onBlur={() => setEmailFocused(false)}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoComplete="email"
                      returnKeyType="done"
                      onSubmitEditing={handleSendReset}
                      editable={!isLoading}
                      autoFocus
                    />
                  </View>
                </View>

                {/* Send Reset Button */}
                <Pressable
                  onPress={handleSendReset}
                  disabled={isLoading}
                  style={({ pressed }) => [
                    styles.primaryButton,
                    { opacity: pressed && !isLoading ? 0.85 : 1 },
                  ]}
                >
                  <LinearGradient
                    colors={[colors.primary, colors.primaryDark]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.primaryButtonGradient}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <>
                        <Text style={styles.primaryButtonText}>Send Reset Link</Text>
                        <MaterialIcons name="send" size={18} color="#fff" />
                      </>
                    )}
                  </LinearGradient>
                </Pressable>

                {/* Info note */}
                <View style={styles.infoRow}>
                  <MaterialIcons name="info-outline" size={14} color={colors.textMuted} />
                  <Text style={[styles.infoText, { color: colors.textMuted }]}>
                    The link will expire in 1 hour for security
                  </Text>
                </View>
              </Animated.View>

              {/* Back to Sign In Link */}
              <Pressable onPress={handleBackToLogin} style={styles.bottomLink}>
                <MaterialIcons name="arrow-back" size={16} color={colors.primary} />
                <Text style={[styles.bottomLinkAction, { color: colors.primary }]}>
                  Back to Sign In
                </Text>
              </Pressable>

            </View>
          </SafeAreaView>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  scroll: { flexGrow: 1 },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },

  orb: { position: 'absolute', borderRadius: 9999 },
  orbTopRight: { width: 280, height: 280, top: -80, right: -80 },
  orbBottomLeft: { width: 220, height: 220, bottom: 60, left: -80 },

  // Back button
  backButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 10,
    padding: Spacing.sm,
  },

  // Header
  header: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  iconBadge: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.xs,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: FontSize.md,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: Spacing.md,
  },

  // Form Card
  formCard: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.lg,
    gap: Spacing.md,
  },

  // Error Banner
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  errorText: {
    flex: 1,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    lineHeight: 18,
  },

  // Input
  inputGroup: { gap: Spacing.xs + 2 },
  inputLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    marginLeft: Spacing.xxs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    height: 52,
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: FontSize.md,
    fontWeight: FontWeight.regular,
    paddingVertical: 0,
  },

  // Primary Button
  primaryButton: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  primaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    gap: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  primaryButtonText: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: '#fff',
    letterSpacing: 0.3,
  },

  // Info
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  infoText: {
    fontSize: FontSize.xs,
    lineHeight: 16,
  },

  // Bottom link
  bottomLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.lg,
    gap: Spacing.xs,
  },
  bottomLinkAction: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },

  // ─── Success State ─────────────────────────────────────────────────────────

  successContent: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  successCard: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.md,
  },
  successIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  successTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    letterSpacing: -0.3,
  },
  successMessage: {
    fontSize: FontSize.md,
    textAlign: 'center',
  },
  emailBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    maxWidth: '100%',
  },
  emailBadgeText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    flexShrink: 1,
  },
  successInstructions: {
    fontSize: FontSize.sm,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: Spacing.sm,
  },
  resendButton: {
    paddingVertical: Spacing.sm,
  },
  resendText: {
    fontSize: FontSize.sm,
    textAlign: 'center',
  },
});
