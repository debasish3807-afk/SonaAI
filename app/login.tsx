import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet, Animated,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/theme';
import { StatusBar } from 'expo-status-bar';

const SOCIAL_LOGINS = [
  { label: 'Continue with Google', icon: 'g-translate', color: '#DB4437', bg: '#DB443715' },
  { label: 'Continue with Apple', icon: 'phone-iphone', color: '#fff', bg: '#FFFFFF15' },
];

export default function LoginScreen() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [nameFocused, setNameFocused] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const logoAnim = useRef(new Animated.Value(0.7)).current;
  const formAnim = useRef(new Animated.Value(30)).current;
  const emailBorderAnim = useRef(new Animated.Value(0)).current;
  const passwordBorderAnim = useRef(new Animated.Value(0)).current;
  const nameBorderAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(logoAnim, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
      Animated.spring(formAnim, { toValue: 0, tension: 60, friction: 9, useNativeDriver: true }),
    ]).start();
  }, []);

  const animateBorder = (anim: Animated.Value, focused: boolean) =>
    Animated.timing(anim, { toValue: focused ? 1 : 0, duration: 180, useNativeDriver: false }).start();

  useEffect(() => { animateBorder(emailBorderAnim, emailFocused); }, [emailFocused]);
  useEffect(() => { animateBorder(passwordBorderAnim, passwordFocused); }, [passwordFocused]);
  useEffect(() => { animateBorder(nameBorderAnim, nameFocused); }, [nameFocused]);

  const getBorderColor = (anim: Animated.Value) =>
    anim.interpolate({ inputRange: [0, 1], outputRange: [colors.cardBorder, '#7C6FFF'] });

  const handleContinue = () => {
    // TODO: Integrate real authentication
    router.replace('/(tabs)' as any);
  };

  return (
    <View style={[styles.container, { backgroundColor: '#080810' }]}>
      <StatusBar style="light" />
      <LinearGradient
        colors={['#0D0D20', '#080810', '#0A0010']}
        style={StyleSheet.absoluteFill}
      />
      {/* Decorative orbs */}
      <View style={styles.orb1} />
      <View style={styles.orb2} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <SafeAreaView edges={['top', 'bottom']}>
            {/* Back */}
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.7 : 1 }]}
            >
              <MaterialIcons name="arrow-back-ios" size={18} color="rgba(255,255,255,0.6)" />
            </Pressable>

            <Animated.View style={[styles.logoArea, { opacity: fadeAnim, transform: [{ scale: logoAnim }] }]}>
              <LinearGradient colors={['#7C6FFF', '#00D4FF']} style={styles.logo}>
                <Text style={styles.logoText}>S</Text>
              </LinearGradient>
              <Text style={styles.appName}>SONA AI</Text>
              <Text style={styles.tagline}>
                {mode === 'login' ? 'Welcome back 👋' : 'Create your account'}
              </Text>
            </Animated.View>

            <Animated.View style={[styles.card, { backgroundColor: 'rgba(22,22,36,0.85)', borderColor: '#252538', transform: [{ translateY: formAnim }], opacity: fadeAnim }]}>

              {/* Tab Switcher */}
              <View style={[styles.tabs, { backgroundColor: 'rgba(255,255,255,0.05)' }]}>
                {(['login', 'signup'] as const).map(t => (
                  <Pressable
                    key={t}
                    onPress={() => setMode(t)}
                    style={({ pressed }) => [styles.tab, mode === t && styles.tabActive, { opacity: pressed ? 0.8 : 1 }]}
                  >
                    {mode === t ? (
                      <LinearGradient colors={['#7C6FFF', '#4A42CC']} style={styles.tabActiveGrad}>
                        <Text style={styles.tabActiveText}>{t === 'login' ? 'Sign In' : 'Sign Up'}</Text>
                      </LinearGradient>
                    ) : (
                      <Text style={styles.tabText}>{t === 'login' ? 'Sign In' : 'Sign Up'}</Text>
                    )}
                  </Pressable>
                ))}
              </View>

              {/* Social buttons */}
              {SOCIAL_LOGINS.map(s => (
                <Pressable
                  key={s.label}
                  style={({ pressed }) => [styles.socialBtn, { backgroundColor: s.bg, borderColor: 'rgba(255,255,255,0.12)', opacity: pressed ? 0.8 : 1 }]}
                >
                  <MaterialIcons name={s.icon as any} size={20} color={s.color} />
                  <Text style={[styles.socialText, { color: s.color }]}>{s.label}</Text>
                </Pressable>
              ))}

              {/* Divider */}
              <View style={styles.dividerRow}>
                <View style={[styles.dividerLine, { backgroundColor: 'rgba(255,255,255,0.1)' }]} />
                <Text style={styles.dividerText}>or continue with email</Text>
                <View style={[styles.dividerLine, { backgroundColor: 'rgba(255,255,255,0.1)' }]} />
              </View>

              {/* Form */}
              {mode === 'signup' ? (
                <Animated.View style={[styles.inputWrapper, { borderColor: getBorderColor(nameBorderAnim) }]}>
                  <MaterialIcons name="person-outline" size={18} color="rgba(255,255,255,0.4)" />
                  <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder="Full Name"
                    placeholderTextColor="rgba(255,255,255,0.25)"
                    style={styles.input}
                    onFocus={() => setNameFocused(true)}
                    onBlur={() => setNameFocused(false)}
                    autoCapitalize="words"
                  />
                </Animated.View>
              ) : null}

              <Animated.View style={[styles.inputWrapper, { borderColor: getBorderColor(emailBorderAnim) }]}>
                <MaterialIcons name="email" size={18} color="rgba(255,255,255,0.4)" />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Email address"
                  placeholderTextColor="rgba(255,255,255,0.25)"
                  style={styles.input}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </Animated.View>

              <Animated.View style={[styles.inputWrapper, { borderColor: getBorderColor(passwordBorderAnim) }]}>
                <MaterialIcons name="lock-outline" size={18} color="rgba(255,255,255,0.4)" />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Password"
                  placeholderTextColor="rgba(255,255,255,0.25)"
                  style={[styles.input, { flex: 1 }]}
                  secureTextEntry={!showPassword}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                />
                <Pressable onPress={() => setShowPassword(v => !v)} hitSlop={8}>
                  <MaterialIcons name={showPassword ? 'visibility-off' : 'visibility'} size={18} color="rgba(255,255,255,0.4)" />
                </Pressable>
              </Animated.View>

              {mode === 'login' ? (
                <Pressable style={styles.forgotBtn}>
                  <Text style={styles.forgotText}>Forgot password?</Text>
                </Pressable>
              ) : null}

              {/* CTA */}
              <Pressable
                onPress={handleContinue}
                style={({ pressed }) => [styles.ctaBtn, { opacity: pressed ? 0.9 : 1 }]}
              >
                <LinearGradient colors={['#7C6FFF', '#4A42CC']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.ctaGrad}>
                  <Text style={styles.ctaText}>{mode === 'login' ? 'Sign In' : 'Create Account'}</Text>
                  <MaterialIcons name="arrow-forward" size={20} color="#fff" />
                </LinearGradient>
              </Pressable>

              {/* Guest */}
              <Pressable onPress={() => router.replace('/(tabs)' as any)} style={styles.guestBtn}>
                <Text style={styles.guestText}>Continue as Guest →</Text>
              </Pressable>

              {mode === 'signup' ? (
                <Text style={styles.terms}>
                  By signing up you agree to our{' '}
                  <Text style={{ color: '#7C6FFF' }}>Terms</Text> and{' '}
                  <Text style={{ color: '#7C6FFF' }}>Privacy Policy</Text>
                </Text>
              ) : null}
            </Animated.View>
          </SafeAreaView>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, padding: Spacing.lg },
  orb1: { position: 'absolute', width: 280, height: 280, borderRadius: 140, backgroundColor: 'rgba(124,111,255,0.12)', top: -80, right: -80 },
  orb2: { position: 'absolute', width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(0,212,255,0.08)', bottom: 60, left: -80 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md },

  logoArea: { alignItems: 'center', marginBottom: Spacing.xl, gap: Spacing.sm },
  logo: { width: 72, height: 72, borderRadius: 22, alignItems: 'center', justifyContent: 'center', shadowColor: '#7C6FFF', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.7, shadowRadius: 24, elevation: 14 },
  logoText: { fontSize: 38, fontWeight: FontWeight.black, color: '#fff' },
  appName: { fontSize: FontSize.xxl, fontWeight: FontWeight.black, color: '#fff', letterSpacing: 4 },
  tagline: { fontSize: FontSize.base, color: 'rgba(255,255,255,0.55)' },

  card: { borderRadius: BorderRadius.xxl, borderWidth: 1, padding: Spacing.lg, gap: Spacing.md },
  tabs: { flexDirection: 'row', borderRadius: BorderRadius.lg, padding: 4, gap: 4, marginBottom: 4 },
  tab: { flex: 1, borderRadius: BorderRadius.md, overflow: 'hidden' },
  tabActive: {},
  tabActiveGrad: { paddingVertical: Spacing.sm + 2, alignItems: 'center' },
  tabActiveText: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: '#fff' },
  tabText: { fontSize: FontSize.base, fontWeight: FontWeight.medium, color: 'rgba(255,255,255,0.45)', paddingVertical: Spacing.sm + 2, textAlign: 'center' },

  socialBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: Spacing.sm + 4, borderRadius: BorderRadius.lg, borderWidth: 1 },
  socialText: { fontSize: FontSize.base, fontWeight: FontWeight.semibold },

  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.3)', fontWeight: FontWeight.medium },

  inputWrapper: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, borderRadius: BorderRadius.lg, borderWidth: 1.5, backgroundColor: 'rgba(255,255,255,0.04)', paddingHorizontal: Spacing.md, paddingVertical: Platform.OS === 'ios' ? Spacing.md : Spacing.sm },
  input: { flex: 1, fontSize: FontSize.base, color: '#fff', includeFontPadding: false },

  forgotBtn: { alignSelf: 'flex-end' },
  forgotText: { fontSize: FontSize.sm, color: '#7C6FFF', fontWeight: FontWeight.medium },

  ctaBtn: { borderRadius: BorderRadius.lg, overflow: 'hidden', marginTop: 4 },
  ctaGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: Spacing.md + 2 },
  ctaText: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: '#fff' },

  guestBtn: { alignItems: 'center', paddingVertical: Spacing.xs },
  guestText: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.4)', fontWeight: FontWeight.medium },
  terms: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.3)', textAlign: 'center', lineHeight: 18 },
});
