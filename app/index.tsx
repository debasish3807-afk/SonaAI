import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, FontSize, FontWeight } from '@/constants/theme';
import { StatusBar } from 'expo-status-bar';
import { useAppStore } from '@/stores/useAppStore';
import { useAuthStore } from '@/stores/useAuthStore';

const { width, height } = Dimensions.get('window');

const PARTICLES = [
  { left: '8%', top: '18%', size: 5, color: '#7C6FFF' },
  { left: '22%', top: '72%', size: 3, color: '#00D4FF' },
  { left: '78%', top: '26%', size: 4, color: '#00E676' },
  { left: '65%', top: '68%', size: 6, color: '#7C6FFF' },
  { left: '45%', top: '14%', size: 3, color: '#FF6B9D' },
  { left: '88%', top: '50%', size: 5, color: '#00D4FF' },
];

export default function SplashScreen() {
  const router = useRouter();
  const { isOnboarded } = useAppStore();
  const { user, isInitialized } = useAuthStore();

  const bgFade = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const logoFade = useRef(new Animated.Value(0)).current;
  const logoRotate = useRef(new Animated.Value(-0.1)).current;
  const titleFade = useRef(new Animated.Value(0)).current;
  const titleY = useRef(new Animated.Value(24)).current;
  const taglineFade = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const versionFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.sequence([
      Animated.timing(bgFade, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, tension: 60, friction: 7, useNativeDriver: true }),
        Animated.timing(logoFade, { toValue: 1, duration: 450, useNativeDriver: true }),
        Animated.spring(logoRotate, { toValue: 0, tension: 60, friction: 8, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(titleFade, { toValue: 1, duration: 380, useNativeDriver: true }),
        Animated.spring(titleY, { toValue: 0, tension: 70, friction: 10, useNativeDriver: true }),
      ]),
      Animated.timing(taglineFade, { toValue: 1, duration: 320, useNativeDriver: true }),
      Animated.timing(progressAnim, { toValue: 1, duration: 1600, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
      Animated.timing(versionFade, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]);

    animation.start(() => {
      setTimeout(() => navigate(), 200);
    });
  }, [isInitialized]);

  const navigate = () => {
    if (!isOnboarded) {
      router.replace('/onboarding' as any);
    } else if (user) {
      router.replace('/(tabs)' as any);
    } else {
      router.replace('/login' as any);
    }
  };

  const progressWidth = progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  const spinInterpolate = logoRotate.interpolate({ inputRange: [-0.1, 0], outputRange: ['-6deg', '0deg'] });

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <Animated.View style={[StyleSheet.absoluteFill, { opacity: bgFade }]}>
        <Image source={require('@/assets/images/splash-hero.png')} style={StyleSheet.absoluteFill} contentFit="cover" />
        <LinearGradient colors={['rgba(8,8,16,0.3)', 'rgba(8,8,16,0.72)', '#080810']} style={StyleSheet.absoluteFill} />
      </Animated.View>

      {/* Floating particles */}
      {PARTICLES.map((p, i) => (
        <View key={i} style={[styles.particle, { left: p.left as any, top: p.top as any, width: p.size, height: p.size, backgroundColor: p.color, borderRadius: p.size / 2, opacity: 0.5 }]} />
      ))}

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.logoHalo} />

        <Animated.View style={{ opacity: logoFade, transform: [{ scale: logoScale }, { rotate: spinInterpolate }], marginBottom: 22 }}>
          <LinearGradient colors={['#7C6FFF', '#00D4FF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.logoBg}>
            <Text style={styles.logoText}>S</Text>
          </LinearGradient>
        </Animated.View>

        <Animated.View style={{ opacity: titleFade, transform: [{ translateY: titleY }] }}>
          <Text style={styles.appName}>SONA AI</Text>
        </Animated.View>

        <Animated.Text style={[styles.tagline, { opacity: taglineFade }]}>
          Your Intelligent AI Companion
        </Animated.Text>

        <View style={styles.progressWrapper}>
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressFill, { width: progressWidth }]}>
              <LinearGradient colors={['#7C6FFF', '#00D4FF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
            </Animated.View>
          </View>
        </View>

        <Animated.Text style={[styles.version, { opacity: versionFade }]}>
          v1.0.0 · Powered by Gemini AI
        </Animated.Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080810', alignItems: 'center', justifyContent: 'center' },
  particle: { position: 'absolute' },
  content: { alignItems: 'center', width: '100%', paddingHorizontal: 48, zIndex: 10 },
  logoHalo: { position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(124,111,255,0.15)', top: -50 },
  logoBg: { width: 104, height: 104, borderRadius: 32, alignItems: 'center', justifyContent: 'center', shadowColor: '#7C6FFF', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.85, shadowRadius: 36, elevation: 22 },
  logoText: { fontSize: 58, fontWeight: FontWeight.black, color: '#fff' },
  appName: { fontSize: 42, fontWeight: FontWeight.black, color: '#fff', letterSpacing: 7, marginBottom: 12 },
  tagline: { fontSize: FontSize.base, color: Colors.dark.textSecondary, letterSpacing: 0.8, marginBottom: 56 },
  progressWrapper: { width: '68%', marginBottom: 18 },
  progressTrack: { height: 3, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 99, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 99, overflow: 'hidden' },
  version: { fontSize: FontSize.xs, color: Colors.dark.textMuted, letterSpacing: 0.5 },
});
