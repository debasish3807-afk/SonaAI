import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/theme';

export default function AboutScreen() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }).start();
  }, []);

  const TEAM = [
    { name: 'AI Research', desc: 'Powering intelligent responses', icon: 'science', color: '#7C6FFF' },
    { name: 'Design', desc: 'Premium user experience', icon: 'design-services', color: '#FF6B9D' },
    { name: 'Engineering', desc: 'Robust & scalable platform', icon: 'code', color: '#00D4FF' },
    { name: 'Security', desc: 'Privacy-first architecture', icon: 'security', color: '#00E676' },
  ];

  const MILESTONES = [
    { year: '2024', event: 'SONA AI concept born', icon: 'lightbulb' },
    { year: '2025 Q1', event: 'Core AI engine built', icon: 'build' },
    { year: '2025 Q2', event: 'Memory & Voice features', icon: 'psychology' },
    { year: '2025 Q3', event: 'Image & Website builder', icon: 'auto-awesome' },
    { year: '2025 Q4', event: 'v1.0 Global Launch', icon: 'rocket-launch' },
  ];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <Animated.View style={[styles.flex, { opacity: fadeAnim }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Pressable onPress={() => router.back()} hitSlop={8} style={({ pressed }) => [styles.backBtn, { backgroundColor: colors.card, opacity: pressed ? 0.8 : 1 }]}>
            <MaterialIcons name="arrow-back-ios" size={18} color={colors.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>About SONA AI</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          {/* Logo Hero */}
          <LinearGradient colors={['#0D0D20', '#1A1040', '#080810']} style={styles.logoHero}>
            <View style={styles.heroBg1} />
            <View style={styles.heroBg2} />
            <LinearGradient colors={['#7C6FFF', '#00D4FF']} style={styles.logo}>
              <Text style={styles.logoText}>S</Text>
            </LinearGradient>
            <Text style={styles.logoName}>SONA AI</Text>
            <Text style={styles.logoTagline}>Your Intelligent AI Operating System</Text>
            <View style={[styles.versionChip, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
              <MaterialIcons name="verified" size={13} color="#00E676" />
              <Text style={styles.versionText}>Version 1.0.0 · Build 100</Text>
            </View>
          </LinearGradient>

          {/* Mission */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Our Mission</Text>
            <View style={[styles.missionCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <Text style={[styles.missionText, { color: colors.textSecondary }]}>
                SONA AI is built with a singular mission: to make the power of artificial intelligence accessible to everyone. We believe AI should be a personal companion that understands you, remembers you, and grows with you — not just a search tool.
              </Text>
            </View>
          </View>

          {/* Team */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Built with Excellence</Text>
            <View style={styles.teamGrid}>
              {TEAM.map(t => (
                <View key={t.name} style={[styles.teamCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                  <View style={[styles.teamIcon, { backgroundColor: `${t.color}20` }]}>
                    <MaterialIcons name={t.icon as any} size={22} color={t.color} />
                  </View>
                  <Text style={[styles.teamName, { color: colors.text }]}>{t.name}</Text>
                  <Text style={[styles.teamDesc, { color: colors.textMuted }]}>{t.desc}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Timeline */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Our Journey</Text>
            {MILESTONES.map((m, idx) => (
              <View key={m.year} style={styles.milestoneRow}>
                <View style={styles.milestoneLeft}>
                  <LinearGradient colors={['#7C6FFF', '#00D4FF']} style={styles.milestoneDot}>
                    <MaterialIcons name={m.icon as any} size={14} color="#fff" />
                  </LinearGradient>
                  {idx < MILESTONES.length - 1 ? <View style={[styles.milestoneLine, { backgroundColor: colors.border }]} /> : null}
                </View>
                <View style={styles.milestoneContent}>
                  <Text style={[styles.milestoneYear, { color: colors.primary }]}>{m.year}</Text>
                  <Text style={[styles.milestoneEvent, { color: colors.text }]}>{m.event}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Legal */}
          <View style={[styles.section, { paddingBottom: 0 }]}>
            <View style={[styles.legalCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <Text style={[styles.legalText, { color: colors.textMuted }]}>
                © 2025 SONA AI Inc. All rights reserved.{'\n'}
                Built with ❤️ for the AI generation.
              </Text>
              <View style={styles.legalLinks}>
                <Pressable onPress={() => router.push('/privacy-policy' as any)}>
                  <Text style={[styles.legalLink, { color: colors.primary }]}>Privacy Policy</Text>
                </Pressable>
                <Text style={[styles.legalDot, { color: colors.textMuted }]}>·</Text>
                <Pressable onPress={() => router.push('/terms-of-service' as any)}>
                  <Text style={[styles.legalLink, { color: colors.primary }]}>Terms of Service</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm + 4, borderBottomWidth: StyleSheet.hairlineWidth },
  backBtn: { width: 36, height: 36, borderRadius: BorderRadius.sm + 2, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold },

  logoHero: { alignItems: 'center', padding: Spacing.xxl, gap: Spacing.md, overflow: 'hidden', position: 'relative' },
  heroBg1: { position: 'absolute', width: 250, height: 250, borderRadius: 125, backgroundColor: 'rgba(124,111,255,0.12)', top: -80, right: -60 },
  heroBg2: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(0,212,255,0.08)', bottom: -60, left: -60 },
  logo: { width: 90, height: 90, borderRadius: 28, alignItems: 'center', justifyContent: 'center', shadowColor: '#7C6FFF', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.7, shadowRadius: 30, elevation: 16 },
  logoText: { fontSize: 48, fontWeight: FontWeight.black, color: '#fff' },
  logoName: { fontSize: FontSize.xxxl, fontWeight: FontWeight.black, color: '#fff', letterSpacing: 4 },
  logoTagline: { fontSize: FontSize.base, color: 'rgba(255,255,255,0.55)', textAlign: 'center' },
  versionChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: Spacing.md, paddingVertical: 5, borderRadius: BorderRadius.full },
  versionText: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.6)', fontWeight: FontWeight.medium },

  section: { paddingHorizontal: Spacing.md, marginTop: Spacing.xl },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, marginBottom: Spacing.md },

  missionCard: { padding: Spacing.lg, borderRadius: BorderRadius.xl, borderWidth: 1 },
  missionText: { fontSize: FontSize.base, lineHeight: 26 },

  teamGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  teamCard: { width: '47.5%', padding: Spacing.md, borderRadius: BorderRadius.xl, borderWidth: 1, gap: Spacing.sm, alignItems: 'center' },
  teamIcon: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  teamName: { fontSize: FontSize.base, fontWeight: FontWeight.bold, textAlign: 'center' },
  teamDesc: { fontSize: FontSize.sm, textAlign: 'center' },

  milestoneRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md },
  milestoneLeft: { alignItems: 'center', width: 36 },
  milestoneDot: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  milestoneLine: { width: 2, flex: 1, marginTop: 4, minHeight: 16 },
  milestoneContent: { flex: 1, paddingTop: 6 },
  milestoneYear: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, marginBottom: 2 },
  milestoneEvent: { fontSize: FontSize.base, fontWeight: FontWeight.medium },

  legalCard: { padding: Spacing.lg, borderRadius: BorderRadius.xl, borderWidth: 1, alignItems: 'center', gap: Spacing.sm },
  legalText: { fontSize: FontSize.sm, textAlign: 'center', lineHeight: 22 },
  legalLinks: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  legalLink: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  legalDot: { fontSize: FontSize.sm },
});
