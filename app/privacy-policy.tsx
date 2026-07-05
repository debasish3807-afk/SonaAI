import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/theme';

const PRIVACY_SECTIONS = [
  {
    icon: 'collect' as const,
    iconName: 'data-usage',
    title: 'Information We Collect',
    color: '#7C6FFF',
    content: 'We collect information you provide directly (account details, messages, memories), information generated through usage (chat history, AI interactions), and technical information (device type, OS version, app performance data). We never sell your personal data to third parties.',
  },
  {
    icon: 'usage' as const,
    iconName: 'settings-suggest',
    title: 'How We Use Your Data',
    color: '#00D4FF',
    content: 'Your data is used to power AI responses, improve SONA features, provide personalized experiences, ensure security, and conduct analytics. Memory data is used to give SONA context about your preferences and history.',
  },
  {
    icon: 'store' as const,
    iconName: 'storage',
    title: 'Data Storage & Security',
    color: '#00E676',
    content: 'All data is encrypted at rest (AES-256) and in transit (TLS 1.3). We store data in secure cloud infrastructure. You can export or delete your data at any time from Settings > Data & Privacy.',
  },
  {
    icon: 'third' as const,
    iconName: 'share',
    title: 'Third Party Services',
    color: '#FF9800',
    content: 'SONA integrates with AI providers (Google Gemini, OpenAI) to power responses. These providers have their own privacy policies. We only send the minimum data required for AI processing and do not share your personal information.',
  },
  {
    icon: 'rights' as const,
    iconName: 'gavel',
    title: 'Your Rights',
    color: '#FF6B9D',
    content: 'You have the right to access, correct, export, or delete your personal data. You can opt out of analytics collection. In regions covered by GDPR or CCPA, additional rights may apply. Contact privacy@sona.ai for requests.',
  },
  {
    icon: 'contact' as const,
    iconName: 'email',
    title: 'Contact Us',
    color: '#F5C842',
    content: 'For privacy questions, data requests, or concerns, contact our Data Protection Officer at privacy@sona.ai. We respond to all requests within 30 business days.',
  },
];

export default function PrivacyPolicyScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }).start();
  }, []);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <Animated.View style={[styles.flex, { opacity: fadeAnim }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Pressable onPress={() => router.back()} hitSlop={8} style={({ pressed }) => [styles.backBtn, { backgroundColor: colors.card, opacity: pressed ? 0.8 : 1 }]}>
            <MaterialIcons name="arrow-back-ios" size={18} color={colors.text} />
          </Pressable>
          <View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Privacy Policy</Text>
            <Text style={[styles.headerSub, { color: colors.textSecondary }]}>Last updated: July 2025</Text>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          <LinearGradient colors={['#7C6FFF', '#4A42CC']} style={styles.hero}>
            <View style={styles.heroBg} />
            <MaterialIcons name="security" size={48} color="rgba(255,255,255,0.3)" />
            <View style={{ flex: 1 }}>
              <Text style={styles.heroTitle}>Your Privacy Matters</Text>
              <Text style={styles.heroSub}>We are committed to protecting your personal data and being transparent about how we use it.</Text>
            </View>
          </LinearGradient>

          {PRIVACY_SECTIONS.map((section, idx) => (
            <View key={section.icon} style={styles.policySection}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIcon, { backgroundColor: `${section.color}20` }]}>
                  <MaterialIcons name={section.iconName as any} size={20} color={section.color} />
                </View>
                <View style={styles.sectionTitleRow}>
                  <Text style={[styles.sectionNum, { color: section.color }]}>{String(idx + 1).padStart(2, '0')}</Text>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>{section.title}</Text>
                </View>
              </View>
              <Text style={[styles.sectionContent, { color: colors.textSecondary }]}>{section.content}</Text>
            </View>
          ))}

          <View style={[styles.footer, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <MaterialIcons name="info-outline" size={18} color={colors.textMuted} />
            <Text style={[styles.footerText, { color: colors.textMuted }]}>
              This policy was last reviewed and updated in July 2025. Material changes will be notified via app notification.
            </Text>
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
  headerSub: { fontSize: FontSize.xs, marginTop: 1 },

  hero: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, margin: Spacing.md, borderRadius: BorderRadius.xxl, padding: Spacing.lg, overflow: 'hidden' },
  heroBg: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.07)', top: -60, right: -40 },
  heroTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.extrabold, color: '#fff', marginBottom: 6 },
  heroSub: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.7)', lineHeight: 20 },

  policySection: { paddingHorizontal: Spacing.md, marginTop: Spacing.lg },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.md },
  sectionIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  sectionTitleRow: { flex: 1 },
  sectionNum: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, letterSpacing: 1 },
  sectionTitle: { fontSize: FontSize.base, fontWeight: FontWeight.bold },
  sectionContent: { fontSize: FontSize.base, lineHeight: 26 },

  footer: { margin: Spacing.md, marginTop: Spacing.xl, flexDirection: 'row', gap: Spacing.sm, padding: Spacing.md, borderRadius: BorderRadius.xl, borderWidth: 1 },
  footerText: { flex: 1, fontSize: FontSize.sm, lineHeight: 20 },
});
