import React, { useRef, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Animated, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '@/stores/useAppStore';
import { BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/theme';
import { StatusBar } from 'expo-status-bar';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: 1,
    gradient: ['#0D0D20', '#1A1040', '#080810'] as [string, string, string],
    accentGrad: ['#7C6FFF', '#4A42CC'] as [string, string],
    icon: 'auto-awesome' as const,
    badge: 'AI Chat',
    title: 'Your AI\nCompanion',
    subtitle: 'Chat naturally with SONA. Ask anything, get intelligent answers powered by cutting-edge AI models.',
    features: ['Smart contextual responses', 'Memory-aware conversations', 'Multi-turn dialogue'],
    color: '#7C6FFF',
  },
  {
    id: 2,
    gradient: ['#080D1A', '#0A1528', '#050810'] as [string, string, string],
    accentGrad: ['#00D4FF', '#0099CC'] as [string, string],
    icon: 'psychology' as const,
    badge: 'AI Memory',
    title: 'Never Forget\nAnything',
    subtitle: 'SONA remembers everything you share. Build a personal knowledge base that grows smarter over time.',
    features: ['Contextual memory recall', 'Smart categorization', 'Cross-session retention'],
    color: '#00D4FF',
  },
  {
    id: 3,
    gradient: ['#0D0808', '#1A0F00', '#080808'] as [string, string, string],
    accentGrad: ['#00E676', '#00AA55'] as [string, string],
    icon: 'auto-fix-high' as const,
    badge: 'AI Creation',
    title: 'Create with\nAI Power',
    subtitle: 'Generate stunning images, build websites, and create apps — all through simple conversation with SONA.',
    features: ['AI image generation', 'Website builder', 'APK builder'],
    color: '#00E676',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { setOnboarded } = useAppStore();
  const [currentSlide, setCurrentSlide] = React.useState(0);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const iconScaleAnim = useRef(new Animated.Value(0.6)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const animateIn = () => {
    fadeAnim.setValue(0);
    slideAnim.setValue(40);
    iconScaleAnim.setValue(0.6);

    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 65, friction: 9, useNativeDriver: true }),
      Animated.spring(iconScaleAnim, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
    ]).start();
  };

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: (currentSlide + 1) / SLIDES.length,
      duration: 350,
      useNativeDriver: false,
    }).start();
    animateIn();
  }, [currentSlide]);

  const handleNext = () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide(c => c + 1);
    } else {
      setOnboarded(true);
      router.replace('/login' as any);
    }
  };

  const handleSkip = () => {
    setOnboarded(true);
    router.replace('/(tabs)' as any);
  };

  const slide = SLIDES[currentSlide];
  const isLast = currentSlide === SLIDES.length - 1;

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* BG Gradient */}
      <LinearGradient colors={slide.gradient} style={StyleSheet.absoluteFill} />

      {/* Decorative orbs */}
      <View style={[styles.orb, styles.orb1, { backgroundColor: `${slide.color}22` }]} />
      <View style={[styles.orb, styles.orb2, { backgroundColor: `${slide.color}11` }]} />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        {/* Skip */}
        <View style={styles.topBar}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <LinearGradient colors={['#7C6FFF', '#00D4FF']} style={styles.miniLogo}>
              <Text style={styles.miniLogoText}>S</Text>
            </LinearGradient>
            <Text style={styles.brandName}>SONA AI</Text>
          </View>
          <Pressable
            onPress={handleSkip}
            style={({ pressed }) => [styles.skipBtn, { opacity: pressed ? 0.7 : 1 }]}
          >
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        </View>

        {/* Content */}
        <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          {/* Icon */}
          <Animated.View style={{ transform: [{ scale: iconScaleAnim }] }}>
            <LinearGradient colors={slide.accentGrad} style={styles.iconContainer}>
              <View style={styles.iconGlow} />
              <MaterialIcons name={slide.icon} size={64} color="#fff" />
            </LinearGradient>
          </Animated.View>

          {/* Badge */}
          <View style={[styles.badge, { backgroundColor: `${slide.color}22`, borderColor: `${slide.color}44` }]}>
            <MaterialIcons name="verified" size={12} color={slide.color} />
            <Text style={[styles.badgeText, { color: slide.color }]}>{slide.badge}</Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>{slide.title}</Text>

          {/* Subtitle */}
          <Text style={styles.subtitle}>{slide.subtitle}</Text>

          {/* Features */}
          <View style={styles.features}>
            {slide.features.map(f => (
              <View key={f} style={styles.featureRow}>
                <View style={[styles.featureDot, { backgroundColor: slide.color }]} />
                <Text style={styles.featureText}>{f}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Bottom */}
        <View style={styles.bottom}>
          {/* Progress dots */}
          <View style={styles.dots}>
            {SLIDES.map((_, i) => (
              <Pressable key={i} onPress={() => setCurrentSlide(i)}>
                <Animated.View
                  style={[
                    styles.dot,
                    i === currentSlide
                      ? [styles.dotActive, { backgroundColor: slide.color, width: 24 }]
                      : { backgroundColor: 'rgba(255,255,255,0.2)', width: 8 },
                  ]}
                />
              </Pressable>
            ))}
          </View>

          {/* CTA */}
          <Pressable
            onPress={handleNext}
            style={({ pressed }) => [styles.ctaBtn, { opacity: pressed ? 0.9 : 1 }]}
          >
            <LinearGradient
              colors={slide.accentGrad}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.ctaGrad}
            >
              <Text style={styles.ctaText}>{isLast ? 'Get Started' : 'Continue'}</Text>
              <MaterialIcons name={isLast ? 'rocket-launch' : 'arrow-forward'} size={20} color="#fff" />
            </LinearGradient>
          </Pressable>

          <Text style={styles.footerNote}>
            {currentSlide + 1} of {SLIDES.length} · SONA AI v1.0
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080810' },
  safe: { flex: 1 },
  orb: { position: 'absolute', borderRadius: 9999 },
  orb1: { width: 300, height: 300, top: -80, right: -80 },
  orb2: { width: 240, height: 240, bottom: 100, left: -100 },

  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  miniLogo: { width: 30, height: 30, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  miniLogoText: { fontSize: 15, fontWeight: FontWeight.black, color: '#fff' },
  brandName: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: '#fff', letterSpacing: 1 },
  skipBtn: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  skipText: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.55)', fontWeight: FontWeight.medium },

  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
  },
  iconContainer: {
    width: 130,
    height: 130,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7C6FFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 40,
    elevation: 20,
  },
  iconGlow: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 1,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    marginTop: Spacing.xs,
  },
  badgeText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },

  title: {
    fontSize: FontSize.display,
    fontWeight: FontWeight.black,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 42,
    marginTop: 4,
  },
  subtitle: {
    fontSize: FontSize.base,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    lineHeight: 26,
    maxWidth: 310,
  },
  features: { gap: Spacing.sm, marginTop: Spacing.xs, width: '100%' },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  featureDot: { width: 7, height: 7, borderRadius: 4 },
  featureText: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.7)', fontWeight: FontWeight.medium },

  bottom: { paddingHorizontal: Spacing.lg, gap: Spacing.md, paddingBottom: Spacing.sm },
  dots: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 7 },
  dot: { height: 8, borderRadius: 4 },
  dotActive: {},

  ctaBtn: { borderRadius: BorderRadius.xl, overflow: 'hidden' },
  ctaGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: Spacing.md + 2,
    paddingHorizontal: Spacing.xl,
  },
  ctaText: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: '#fff' },

  footerNote: {
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.3)',
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
});
