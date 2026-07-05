import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/theme';

const TERMS_SECTIONS = [
  { num: '01', title: 'Acceptance of Terms', color: '#7C6FFF', icon: 'check-circle', content: 'By downloading, installing, or using SONA AI, you agree to be bound by these Terms of Service. If you do not agree, please do not use the service. We may update these terms periodically; continued use constitutes acceptance of changes.' },
  { num: '02', title: 'Use of Service', color: '#00D4FF', icon: 'person', content: 'SONA AI is intended for lawful, personal use. You agree not to use the service to generate harmful, illegal, or misleading content. AI-generated content is provided as-is and should be reviewed before relying on it for important decisions.' },
  { num: '03', title: 'Intellectual Property', color: '#00E676', icon: 'copyright', content: 'Content you create using SONA AI belongs to you, subject to our license to process it. SONA AI brand, design, and proprietary technology remain our intellectual property. You may not reverse engineer or copy our systems.' },
  { num: '04', title: 'AI-Generated Content', color: '#F5C842', icon: 'auto-awesome', content: 'AI outputs may not always be accurate or complete. Do not rely on AI-generated medical, legal, financial, or safety-critical content without professional verification. We are not liable for actions taken based on AI outputs.' },
  { num: '05', title: 'Subscription & Billing', color: '#FF9800', icon: 'payment', content: 'Free tier features are available without payment. Pro subscriptions are billed monthly or annually. Cancellations take effect at the end of the current billing period. Refund policies comply with applicable app store policies.' },
  { num: '06', title: 'Limitation of Liability', color: '#FF6B9D', icon: 'balance', content: 'SONA AI is provided "as is" without warranties. We are not liable for indirect, incidental, or consequential damages arising from use of the service. Our maximum liability is limited to fees paid in the previous 12 months.' },
  { num: '07', title: 'Termination', color: '#9C27B0', icon: 'block', content: 'We may suspend or terminate accounts that violate these terms. You may delete your account at any time from Settings. Upon termination, your data will be deleted according to our Privacy Policy retention schedule.' },
];

export default function TermsOfServiceScreen() {
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
            <Text style={[styles.headerTitle, { color: colors.text }]}>Terms of Service</Text>
            <Text style={[styles.headerSub, { color: colors.textSecondary }]}>Effective: July 1, 2025</Text>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          <LinearGradient colors={['#F5C842', '#E65100', '#8B2A00']} style={styles.hero}>
            <View style={styles.heroBg} />
            <MaterialIcons name="gavel" size={48} color="rgba(255,255,255,0.3)" />
            <View style={{ flex: 1 }}>
              <Text style={styles.heroTitle}>Terms of Service</Text>
              <Text style={styles.heroSub}>Please read these terms carefully before using SONA AI.</Text>
            </View>
          </LinearGradient>

          {TERMS_SECTIONS.map((section) => (
            <View key={section.num} style={styles.termSection}>
              <View style={styles.termHeader}>
                <View style={[styles.termNum, { backgroundColor: `${section.color}22`, borderColor: `${section.color}44` }]}>
                  <Text style={[styles.termNumText, { color: section.color }]}>{section.num}</Text>
                </View>
                <View style={styles.termIconWrap}>
                  <MaterialIcons name={section.icon as any} size={18} color={section.color} />
                </View>
                <Text style={[styles.termTitle, { color: colors.text }]}>{section.title}</Text>
              </View>
              <Text style={[styles.termContent, { color: colors.textSecondary }]}>{section.content}</Text>
            </View>
          ))}

          <View style={[styles.footer, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={[styles.footerText, { color: colors.textMuted }]}>
              For questions about these terms, contact{' '}
              <Text style={{ color: colors.primary }}>legal@sona.ai</Text>
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

  termSection: { paddingHorizontal: Spacing.md, marginTop: Spacing.lg },
  termHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  termNum: { paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: BorderRadius.sm, borderWidth: 1 },
  termNumText: { fontSize: FontSize.xs, fontWeight: FontWeight.extrabold, letterSpacing: 0.5 },
  termIconWrap: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  termTitle: { fontSize: FontSize.base, fontWeight: FontWeight.bold, flex: 1 },
  termContent: { fontSize: FontSize.base, lineHeight: 26 },

  footer: { margin: Spacing.md, marginTop: Spacing.xl, padding: Spacing.md, borderRadius: BorderRadius.xl, borderWidth: 1, alignItems: 'center' },
  footerText: { fontSize: FontSize.sm, textAlign: 'center', lineHeight: 22 },
});
