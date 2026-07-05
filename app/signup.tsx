/**
 * SONA AI — Sign Up Screen
 * Premium Material 3 design with dark/light theme support.
 * Handles: Email/Password registration, Google Sign-In, password strength indicator.
 * Sends email verification upon successful registration.
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

type PasswordStrength = 'weak' | 'fair' | 'good' | 'strong';

function getPasswordStrength(password: string): { level: PasswordStrength; score: number } {
  if (password.length === 0) return { level: 'weak', score: 0 };
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { level: 'weak', score: 0.25 };
  if (score === 2) return { level: 'fair', score: 0.5 };
  if (score === 3) return { level: 'good', score: 0.75 };
  return { level: 'strong', score: 1 };
}

export default function SignUpScreen() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const { signUp, signInWithGoogle, isLoading, error, clearError } = useAuthStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(true);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

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

  const displayError = localError || error;

  useEffect(() => {
    if (displayError) triggerShake();
  }, [displayError, triggerShake]);

  const dismissError = () => {
    setLocalError(null);
    clearError();
  };

  const passwordStrength = getPasswordStrength(password);

  const getStrengthColor = (level: PasswordStrength): string => {
    switch (level) {
      case 'weak': return colors.error;
      case 'fair': return colors.warning;
      case 'good': return colors.secondary;
      case 'strong': return colors.success;
    }
  };

  const handleSignUp = async () => {
    dismissError();

    if (!name.trim()) {
      setLocalError('Please enter your full name.');
      return;
    }
    if (!email.trim()) {
      setLocalError('Please enter your email address.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setLocalError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters.');
      return;
    }

    const { error: err } = await signUp(email.trim(), password, name.trim());
    if (!err) {
      router.replace('/(tabs)' as any);
    }
  };

  const handleGoogleSignUp = async () => {
    dismissError();
    const { error: err } = await signInWithGoogle();
    if (!err) {
      router.replace('/(tabs)' as any);
    }
  };

  // Theme-aware styles
  const inputBg = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';
  const inputBorder = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';
  const inputBorderFocused = colors.primary;
  const inputText = colors.text;
  const placeholderColor = colors.textMuted;

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
                onPress={() => router.back()}
                style={({ pressed }) => [styles.backButton, { opacity: pressed ? 0.6 : 1 }]}
                hitSlop={12}
              >
                <MaterialIcons name="arrow-back-ios" size={20} color={colors.textSecondary} />
              </Pressable>

              {/* Header */}
              <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
                <View style={[styles.iconBadge, { backgroundColor: `${colors.primary}15` }]}>
                  <MaterialIcons name="person-add" size={28} color={colors.primary} />
                </View>
                <Text style={[styles.title, { color: colors.text }]}>Create Account</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                  Join SONA AI and unlock your potential
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

                {/* Google Sign-Up */}
                <Pressable
                  onPress={handleGoogleSignUp}
                  disabled={isLoading}
                  style={({ pressed }) => [
                    styles.socialButton,
                    {
                      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#fff',
                      borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                      opacity: pressed && !isLoading ? 0.7 : 1,
                    },
                  ]}
                >
                  <MaterialIcons name="g-translate" size={20} color="#4285F4" />
                  <Text style={[styles.socialButtonText, { color: colors.text }]}>
                    Sign up with Google
                  </Text>
                </Pressable>

                {/* Divider */}
                <View style={styles.dividerRow}>
                  <View style={[styles.dividerLine, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]} />
                  <Text style={[styles.dividerText, { color: colors.textMuted }]}>or</Text>
                  <View style={[styles.dividerLine, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]} />
                </View>

                {/* Name Input */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Full Name</Text>
                  <View
                    style={[
                      styles.inputContainer,
                      {
                        backgroundColor: inputBg,
                        borderColor: nameFocused ? inputBorderFocused : inputBorder,
                        borderWidth: nameFocused ? 1.5 : 1,
                      },
                    ]}
                  >
                    <MaterialIcons
                      name="person-outline"
                      size={20}
                      color={nameFocused ? colors.primary : colors.textMuted}
                    />
                    <TextInput
                      value={name}
                      onChangeText={(t) => { setName(t); dismissError(); }}
                      placeholder="Enter your full name"
                      placeholderTextColor={placeholderColor}
                      style={[styles.input, { color: inputText }]}
                      onFocus={() => setNameFocused(true)}
                      onBlur={() => setNameFocused(false)}
                      autoCapitalize="words"
                      autoComplete="name"
                      returnKeyType="next"
                      editable={!isLoading}
                    />
                  </View>
                </View>

                {/* Email Input */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Email</Text>
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
                      placeholder="Enter your email"
                      placeholderTextColor={placeholderColor}
                      style={[styles.input, { color: inputText }]}
                      onFocus={() => setEmailFocused(true)}
                      onBlur={() => setEmailFocused(false)}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoComplete="email"
                      returnKeyType="next"
                      editable={!isLoading}
                    />
                  </View>
                </View>

                {/* Password Input */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Password</Text>
                  <View
                    style={[
                      styles.inputContainer,
                      {
                        backgroundColor: inputBg,
                        borderColor: passwordFocused ? inputBorderFocused : inputBorder,
                        borderWidth: passwordFocused ? 1.5 : 1,
                      },
                    ]}
                  >
                    <MaterialIcons
                      name="lock-outline"
                      size={20}
                      color={passwordFocused ? colors.primary : colors.textMuted}
                    />
                    <TextInput
                      value={password}
                      onChangeText={(t) => { setPassword(t); dismissError(); }}
                      placeholder="Create a password"
                      placeholderTextColor={placeholderColor}
                      style={[styles.input, { color: inputText, flex: 1 }]}
                      secureTextEntry={!showPassword}
                      onFocus={() => setPasswordFocused(true)}
                      onBlur={() => setPasswordFocused(false)}
                      autoComplete="new-password"
                      returnKeyType="done"
                      onSubmitEditing={handleSignUp}
                      editable={!isLoading}
                    />
                    <Pressable onPress={() => setShowPassword(!showPassword)} hitSlop={10}>
                      <MaterialIcons
                        name={showPassword ? 'visibility' : 'visibility-off'}
                        size={20}
                        color={colors.textMuted}
                      />
                    </Pressable>
                  </View>

                  {/* Password Strength Indicator */}
                  {password.length > 0 && (
                    <View style={styles.strengthContainer}>
                      <View style={[styles.strengthTrack, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]}>
                        <View
                          style={[
                            styles.strengthFill,
                            {
                              width: `${passwordStrength.score * 100}%`,
                              backgroundColor: getStrengthColor(passwordStrength.level),
                            },
                          ]}
                        />
                      </View>
                      <Text style={[styles.strengthLabel, { color: getStrengthColor(passwordStrength.level) }]}>
                        {passwordStrength.level.charAt(0).toUpperCase() + passwordStrength.level.slice(1)}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Terms Agreement */}
                <Pressable
                  onPress={() => setAgreedToTerms(!agreedToTerms)}
                  style={styles.termsRow}
                >
                  <MaterialIcons
                    name={agreedToTerms ? 'check-box' : 'check-box-outline-blank'}
                    size={22}
                    color={agreedToTerms ? colors.primary : colors.textMuted}
                  />
                  <Text style={[styles.termsText, { color: colors.textSecondary }]}>
                    I agree to the{' '}
                    <Text style={{ color: colors.primary }}>Terms of Service</Text>
                    {' '}and{' '}
                    <Text style={{ color: colors.primary }}>Privacy Policy</Text>
                  </Text>
                </Pressable>

                {/* Sign Up Button */}
                <Pressable
                  onPress={handleSignUp}
                  disabled={isLoading || !agreedToTerms}
                  style={({ pressed }) => [
                    styles.primaryButton,
                    { opacity: (pressed && !isLoading) ? 0.85 : (!agreedToTerms ? 0.5 : 1) },
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
                        <Text style={styles.primaryButtonText}>Create Account</Text>
                        <MaterialIcons name="arrow-forward" size={20} color="#fff" />
                      </>
                    )}
                  </LinearGradient>
                </Pressable>

                {/* Email verification note */}
                <View style={styles.infoRow}>
                  <MaterialIcons name="verified-user" size={14} color={colors.textMuted} />
                  <Text style={[styles.infoText, { color: colors.textMuted }]}>
                    A verification email will be sent to confirm your account
                  </Text>
                </View>
              </Animated.View>

              {/* Sign In Link */}
              <View style={styles.bottomLink}>
                <Text style={[styles.bottomLinkText, { color: colors.textSecondary }]}>
                  Already have an account?
                </Text>
                <Pressable onPress={() => router.back()} hitSlop={8}>
                  <Text style={[styles.bottomLinkAction, { color: colors.primary }]}>
                    {' '}Sign In
                  </Text>
                </Pressable>
              </View>

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

  // Password strength
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  strengthTrack: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  strengthLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    minWidth: 44,
  },

  // Terms
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  termsText: {
    flex: 1,
    fontSize: FontSize.sm,
    lineHeight: 20,
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

  // Social Button
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  socialButtonText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },

  // Divider
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  dividerLine: { flex: 1, height: 1 },
  dividerText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    textTransform: 'uppercase',
    letterSpacing: 1,
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
  },
  bottomLinkText: { fontSize: FontSize.sm },
  bottomLinkAction: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
});
