import React, { useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView, Animated,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/theme';

const FAQ = [
  { q: 'How does SONA AI chat work?', a: 'SONA uses advanced language models (Gemini-powered) to understand your questions and provide intelligent, context-aware responses. Your conversation history is used to provide better answers over time.' },
  { q: 'What is the Memory feature?', a: 'Memory lets you save important notes, insights, and information. SONA can reference these memories during conversations to give more personalized and relevant answers.' },
  { q: 'How does AI Image Generation work?', a: 'Describe any image in text, select a style, and SONA generates it using state-of-the-art diffusion models. Results appear in your gallery for download.' },
  { q: 'What is the Knowledge Vault?', a: 'The Knowledge Vault lets you upload and store documents, links, notes, and images. SONA can reference this content when answering your questions.' },
  { q: 'How does Voice Assistant work?', a: 'Tap the microphone button and speak naturally. SONA transcribes your speech, processes your request, and responds with voice and text.' },
];

const CONTACT_OPTIONS = [
  { icon: 'chat-bubble-outline', label: 'Live Chat Support', desc: 'Chat with our team', color: '#7C6FFF' },
  { icon: 'email', label: 'Email Support', desc: 'support@sona.ai', color: '#00D4FF' },
  { icon: 'auto-awesome', label: 'Ask SONA AI', desc: 'Get instant answers', color: '#00E676' },
];

export default function HelpCenterScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [expandedFaq, setExpandedFaq] = React.useState<number | null>(null);

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
          <Text style={[styles.headerTitle, { color: colors.text }]}>Help Center</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          {/* Hero */}
          <LinearGradient colors={['#7C6FFF', '#4A42CC']} style={styles.hero}>
            <View style={styles.heroBg} />
            <MaterialIcons name="support-agent" size={52} color="rgba(255,255,255,0.3)" />
            <View style={styles.heroText}>
              <Text style={styles.heroTitle}>How can we help?</Text>
              <Text style={styles.heroSub}>Find answers, guides, and support</Text>
            </View>
          </LinearGradient>

          {/* Contact Options */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Get Support</Text>
            {CONTACT_OPTIONS.map(opt => (
              <Pressable
                key={opt.label}
                style={({ pressed }) => [styles.contactCard, { backgroundColor: colors.card, borderColor: colors.cardBorder, opacity: pressed ? 0.85 : 1 }]}
              >
                <View style={[styles.contactIcon, { backgroundColor: `${opt.color}20` }]}>
                  <MaterialIcons name={opt.icon as any} size={22} color={opt.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.contactLabel, { color: colors.text }]}>{opt.label}</Text>
                  <Text style={[styles.contactDesc, { color: colors.textSecondary }]}>{opt.desc}</Text>
                </View>
                <MaterialIcons name="arrow-forward-ios" size={16} color={colors.textMuted} />
              </Pressable>
            ))}
          </View>

          {/* FAQ */}
          <View style={[styles.section, { marginBottom: 0 }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Frequently Asked Questions</Text>
            {FAQ.map((item, idx) => (
              <Pressable
                key={idx}
                onPress={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                style={[styles.faqCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
              >
                <View style={styles.faqHeader}>
                  <Text style={[styles.faqQ, { color: colors.text, flex: 1 }]}>{item.q}</Text>
                  <MaterialIcons
                    name={expandedFaq === idx ? 'expand-less' : 'expand-more'}
                    size={22}
                    color={colors.textMuted}
                  />
                </View>
                {expandedFaq === idx ? (
                  <Text style={[styles.faqA, { color: colors.textSecondary }]}>{item.a}</Text>
                ) : null}
              </Pressable>
            ))}
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

  hero: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg, margin: Spacing.md, borderRadius: BorderRadius.xxl, padding: Spacing.lg, overflow: 'hidden' },
  heroBg: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.06)', top: -60, right: -40 },
  heroText: { flex: 1 },
  heroTitle: { fontSize: FontSize.xxl, fontWeight: FontWeight.extrabold, color: '#fff' },
  heroSub: { fontSize: FontSize.base, color: 'rgba(255,255,255,0.7)', marginTop: 4 },

  section: { paddingHorizontal: Spacing.md, marginTop: Spacing.lg, marginBottom: Spacing.md },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, marginBottom: Spacing.md },

  contactCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.md, borderRadius: BorderRadius.xl, borderWidth: 1, marginBottom: Spacing.sm },
  contactIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  contactLabel: { fontSize: FontSize.base, fontWeight: FontWeight.semibold },
  contactDesc: { fontSize: FontSize.sm, marginTop: 2 },

  faqCard: { padding: Spacing.md, borderRadius: BorderRadius.xl, borderWidth: 1, marginBottom: Spacing.sm },
  faqHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  faqQ: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, lineHeight: 22 },
  faqA: { fontSize: FontSize.base, lineHeight: 24, marginTop: Spacing.sm },
});
