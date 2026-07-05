import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, FontSize, FontWeight } from '@/constants/theme';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const logoFade = useRef(new Animated.Value(0)).current;
  const taglineFade = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
      ]),
      Animated.timing(logoFade, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(taglineFade, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(progressAnim, { toValue: 1, duration: 1200, useNativeDriver: false }),
    ]).start(() => {
      setTimeout(() => router.replace('/(tabs)'), 300);
    });
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={require('@/assets/images/splash-hero.png')}
        style={styles.bg}
        contentFit="cover"
      />
      <LinearGradient
        colors={['rgba(10,10,15,0.3)', 'rgba(10,10,15,0.85)', '#0A0A0F']}
        style={styles.gradient}
      />
      <View style={styles.content}>
        <Animated.View style={[styles.logoContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
          <LinearGradient
            colors={['#6C63FF', '#00D4FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logoBg}
          >
            <Text style={styles.logoText}>S</Text>
          </LinearGradient>
        </Animated.View>

        <Animated.Text style={[styles.appName, { opacity: logoFade }]}>
          SONA AI
        </Animated.Text>

        <Animated.Text style={[styles.tagline, { opacity: taglineFade }]}>
          Your Intelligent AI Companion
        </Animated.Text>

        <View style={styles.progressContainer}>
          <Animated.View
            style={[
              styles.progressBar,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>

        <Animated.Text style={[styles.version, { opacity: taglineFade }]}>
          v1.0.0 · Powered by AI
        </Animated.Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F', alignItems: 'center', justifyContent: 'center' },
  bg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width, height },
  gradient: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  content: { alignItems: 'center', width: '100%', paddingHorizontal: 40 },
  logoContainer: { marginBottom: 20 },
  logoBg: { width: 96, height: 96, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  logoText: { fontSize: 52, fontWeight: FontWeight.extrabold, color: '#fff' },
  appName: { fontSize: 38, fontWeight: FontWeight.extrabold, color: '#fff', letterSpacing: 4, marginBottom: 10 },
  tagline: { fontSize: FontSize.base, color: Colors.dark.textSecondary, letterSpacing: 1, marginBottom: 48 },
  progressContainer: { width: '70%', height: 3, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 99, overflow: 'hidden', marginBottom: 20 },
  progressBar: { height: '100%', backgroundColor: '#6C63FF', borderRadius: 99 },
  version: { fontSize: FontSize.xs, color: Colors.dark.textMuted, letterSpacing: 0.5 },
});
