import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, FontSize, FontWeight } from '@/constants/theme';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const router = useRouter();

  const bgFade = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.6)).current;
  const logoFade = useRef(new Animated.Value(0)).current;
  const logoGlow = useRef(new Animated.Value(0)).current;
  const titleFade = useRef(new Animated.Value(0)).current;
  const titleY = useRef(new Animated.Value(20)).current;
  const taglineFade = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const versionFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      // 1. Background fade in
      Animated.timing(bgFade, { toValue: 1, duration: 400, useNativeDriver: true }),

      // 2. Logo entrance
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, tension: 65, friction: 8, useNativeDriver: true }),
        Animated.timing(logoFade, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),

      // 3. Glow pulse on logo
      Animated.timing(logoGlow, { toValue: 1, duration: 300, useNativeDriver: true }),

      // 4. Title slide up
      Animated.parallel([
        Animated.timing(titleFade, { toValue: 1, duration: 350, useNativeDriver: true }),
        Animated.spring(titleY, { toValue: 0, tension: 70, friction: 10, useNativeDriver: true }),
      ]),

      // 5. Tagline
      Animated.timing(taglineFade, { toValue: 1, duration: 300, useNativeDriver: true }),

      // 6. Progress bar loads
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 1400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),

      // 7. Version
      Animated.timing(versionFade, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start(() => {
      setTimeout(() => router.replace('/(tabs)'), 250);
    });
  }, []);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const logoGlowOpacity = logoGlow.interpolate({ inputRange: [0, 1], outputRange: [0, 0.6] });

  return (
    <View style={styles.container}>
      {/* Background image */}
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: bgFade }]}>
        <Image
          source={require('@/assets/images/splash-hero.png')}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
        />
        <LinearGradient
          colors={['rgba(8,8,16,0.25)', 'rgba(8,8,16,0.7)', '#080810']}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {/* Animated particles */}
      <View style={styles.particles} pointerEvents="none">
        {[0, 1, 2, 3, 4].map(i => (
          <View
            key={i}
            style={[
              styles.particle,
              {
                left: `${15 + i * 18}%` as any,
                top: `${20 + (i % 3) * 25}%` as any,
                width: 4 + (i % 3) * 3,
                height: 4 + (i % 3) * 3,
                backgroundColor: i % 2 === 0 ? '#7C6FFF' : '#00D4FF',
                opacity: 0.4,
              },
            ]}
          />
        ))}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Logo glow */}
        <Animated.View style={[styles.logoGlow, { opacity: logoGlowOpacity }]} />

        {/* Logo */}
        <Animated.View style={{ opacity: logoFade, transform: [{ scale: logoScale }], marginBottom: 20 }}>
          <LinearGradient
            colors={['#7C6FFF', '#00D4FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logoBg}
          >
            <Text style={styles.logoText}>S</Text>
          </LinearGradient>
        </Animated.View>

        {/* App name */}
        <Animated.View style={{ opacity: titleFade, transform: [{ translateY: titleY }] }}>
          <Text style={styles.appName}>SONA AI</Text>
        </Animated.View>

        {/* Tagline */}
        <Animated.Text style={[styles.tagline, { opacity: taglineFade }]}>
          Your Intelligent AI Companion
        </Animated.Text>

        {/* Progress */}
        <View style={styles.progressWrapper}>
          <View style={styles.progressContainer}>
            <Animated.View style={[styles.progressBar, { width: progressWidth }]}>
              <LinearGradient
                colors={['#7C6FFF', '#00D4FF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>
          </View>
        </View>

        {/* Version */}
        <Animated.Text style={[styles.version, { opacity: versionFade }]}>
          v1.0.0 · Powered by Gemini AI
        </Animated.Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080810', alignItems: 'center', justifyContent: 'center' },
  particles: { ...StyleSheet.absoluteFillObject },
  particle: { position: 'absolute', borderRadius: 99 },
  content: { alignItems: 'center', width: '100%', paddingHorizontal: 48, zIndex: 10 },

  logoGlow: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#7C6FFF',
    top: -30,
  },
  logoBg: {
    width: 100,
    height: 100,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7C6FFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 30,
    elevation: 20,
  },
  logoText: { fontSize: 56, fontWeight: FontWeight.black, color: '#fff' },

  appName: {
    fontSize: 40,
    fontWeight: FontWeight.black,
    color: '#fff',
    letterSpacing: 6,
    marginBottom: 10,
  },
  tagline: {
    fontSize: FontSize.base,
    color: Colors.dark.textSecondary,
    letterSpacing: 1,
    marginBottom: 52,
  },

  progressWrapper: { width: '72%', marginBottom: 16 },
  progressContainer: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 99,
    overflow: 'hidden',
  },
  progressBar: { height: '100%', borderRadius: 99, overflow: 'hidden' },

  version: {
    fontSize: FontSize.xs,
    color: Colors.dark.textMuted,
    letterSpacing: 0.5,
  },
});
