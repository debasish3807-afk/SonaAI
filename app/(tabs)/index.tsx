import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Pressable, Animated,
  Dimensions, RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useTheme } from '@/hooks/useTheme';
import { Badge } from '@/components/ui/Badge';
import { SkeletonCard } from '@/components/ui/SkeletonLoader';
import { BorderRadius, FontSize, FontWeight, Shadow, Spacing } from '@/constants/theme';

const { width } = Dimensions.get('window');

const AI_FEATURES = [
  { id: 'chat', label: 'AI Chat', icon: 'chat-bubble-outline', color: '#7C6FFF', desc: 'Smart conversations', route: '/chat', gradient: ['#7C6FFF', '#4A42CC'] as [string, string] },
  { id: 'memory', label: 'Memory', icon: 'psychology', color: '#00D4FF', desc: 'Knowledge recall', route: '/memory', gradient: ['#00D4FF', '#0099CC'] as [string, string] },
  { id: 'vault', label: 'Vault', icon: 'folder-special', color: '#F5C842', desc: 'Knowledge vault', route: '/knowledge-vault', gradient: ['#F5C842', '#D4A000'] as [string, string] },
  { id: 'voice', label: 'Voice', icon: 'mic', color: '#FF6B9D', desc: 'Voice assistant', route: '/voice', gradient: ['#FF6B9D', '#CC3366'] as [string, string] },
  { id: 'image', label: 'Image AI', icon: 'auto-awesome', color: '#00E676', desc: 'AI image creation', route: '/image-generator', gradient: ['#00E676', '#00AA55'] as [string, string] },
  { id: 'website', label: 'Web Builder', icon: 'language', color: '#FF9800', desc: 'Build with AI', route: '/website-builder', gradient: ['#FF9800', '#E65100'] as [string, string] },
  { id: 'apk', label: 'APK Build', icon: 'android', color: '#4CAF50', desc: 'Android apps', route: '/apk-builder', gradient: ['#4CAF50', '#2E7D32'] as [string, string] },
  { id: 'settings', label: 'Settings', icon: 'settings', color: '#9E9E9E', desc: 'Preferences', route: '/settings', gradient: ['#757575', '#424242'] as [string, string] },
] as const;

const STATS = [
  { label: 'Memories', value: '24', icon: 'psychology', color: '#7C6FFF' },
  { label: 'Chats', value: '8', icon: 'chat-bubble', color: '#00D4FF' },
  { label: 'Files', value: '5', icon: 'folder', color: '#F5C842' },
  { label: 'Images', value: '12', icon: 'image', color: '#FF6B9D' },
];

const RECENT_ACTIVITY = [
  { id: '1', title: 'Discussed React Native architecture', time: '2m ago', icon: 'chat-bubble', color: '#7C6FFF', sub: 'AI Chat' },
  { id: '2', title: 'Added memory: Project Goals Q3', time: '1h ago', icon: 'psychology', color: '#00D4FF', sub: 'Memory' },
  { id: '3', title: 'Generated: Futuristic city artwork', time: '3h ago', icon: 'auto-awesome', color: '#00E676', sub: 'Image AI' },
  { id: '4', title: 'Uploaded: SONA Product Brief.pdf', time: '1d ago', icon: 'description', color: '#F5C842', sub: 'Knowledge' },
];

export default function HomeScreen() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const staggerAnims = STATS.map(() => useRef(new Animated.Value(0)).current);

  useEffect(() => {
    setTimeout(() => setLoading(false), 800);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 9, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 60, friction: 9, useNativeDriver: true }),
    ]).start(() => {
      Animated.stagger(80, staggerAnims.map(a =>
        Animated.spring(a, { toValue: 1, tension: 70, friction: 10, useNativeDriver: true })
      )).start();
    });
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise(r => setTimeout(r, 1200));
    setRefreshing(false);
  };

  const navigateTo = (route: string) => {
    const path = route.slice(1);
    if (['chat', 'memory', 'voice', 'settings'].includes(path)) {
      router.push(`/(tabs)/${path}` as any);
    } else {
      router.push(route as any);
    }
  };

  const CARD_W = (width - Spacing.md * 2 - Spacing.sm * 3) / 4;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* ── Header ── */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <LinearGradient
            colors={isDark ? ['#12121E', '#080810'] : ['#EAE8FF', '#F0F0FF']}
            style={styles.headerGrad}
          >
            <View style={styles.header}>
              <View>
                <Text style={[styles.greeting, { color: colors.textSecondary }]}>Good morning</Text>
                <Text style={[styles.userName, { color: colors.text }]}>Welcome back 👋</Text>
              </View>
              <Pressable
                style={({ pressed }) => [styles.avatarWrapper, { opacity: pressed ? 0.85 : 1 }]}
              >
                <LinearGradient colors={['#7C6FFF', '#00D4FF']} style={styles.avatar}>
                  <Text style={styles.avatarText}>S</Text>
                </LinearGradient>
                <View style={[styles.onlineDot, { backgroundColor: colors.success, borderColor: colors.background }]} />
              </Pressable>
            </View>

            {/* ── Hero Card ── */}
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <LinearGradient
                colors={['#7C6FFF', '#5A4ECC', '#2A1FBB']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.heroCard}
              >
                {/* Decorative circles */}
                <View style={[styles.heroBg1]} />
                <View style={[styles.heroBg2]} />

                <View style={styles.heroTop}>
                  <Badge label="AI Active" variant="success" pulse />
                  <MaterialIcons name="auto-awesome" size={22} color="rgba(255,255,255,0.9)" />
                </View>

                <Text style={styles.heroTitle}>SONA is ready{'\n'}to assist you</Text>
                <Text style={styles.heroSub}>Ask anything · Create anything · Remember everything</Text>

                <Pressable
                  onPress={() => router.push('/(tabs)/chat' as any)}
                  style={({ pressed }) => [styles.heroBtn, { opacity: pressed ? 0.9 : 1 }]}
                >
                  <Text style={styles.heroBtnText}>Start Chatting</Text>
                  <MaterialIcons name="arrow-forward-ios" size={13} color="#7C6FFF" />
                </Pressable>
              </LinearGradient>
            </Animated.View>
          </LinearGradient>
        </Animated.View>

        {/* ── Stats Row ── */}
        <View style={styles.statsRow}>
          {STATS.map((stat, i) => (
            <Animated.View
              key={stat.label}
              style={{ flex: 1, opacity: staggerAnims[i], transform: [{ scale: staggerAnims[i] }] }}
            >
              <LinearGradient
                colors={isDark ? ['#161624', '#1A1A2C'] : ['#FFFFFF', '#F8F8FF']}
                style={[styles.statCard, { borderColor: colors.cardBorder }]}
              >
                <View style={[styles.statIconBg, { backgroundColor: `${stat.color}20` }]}>
                  <MaterialIcons name={stat.icon as any} size={18} color={stat.color} />
                </View>
                <Text style={[styles.statValue, { color: colors.text }]}>{stat.value}</Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>{stat.label}</Text>
              </LinearGradient>
            </Animated.View>
          ))}
        </View>

        {/* ── AI Features Grid ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>AI Features</Text>
            <Badge label="8 Tools" variant="primary" size="sm" />
          </View>
          <View style={styles.grid}>
            {AI_FEATURES.map((feature) => (
              <Pressable
                key={feature.id}
                onPress={() => navigateTo(feature.route)}
                style={({ pressed }) => [
                  styles.featureCard,
                  { backgroundColor: colors.card, borderColor: colors.cardBorder },
                  pressed && { transform: [{ scale: 0.93 }], opacity: 0.9 },
                ]}
              >
                <LinearGradient colors={feature.gradient} style={styles.featureIconBg}>
                  <MaterialIcons name={feature.icon as any} size={22} color="#fff" />
                </LinearGradient>
                <Text style={[styles.featureLabel, { color: colors.text }]}>{feature.label}</Text>
                <Text style={[styles.featureDesc, { color: colors.textMuted }]} numberOfLines={1}>{feature.desc}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* ── Recent Activity ── */}
        <View style={[styles.section, { paddingBottom: 36 }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Activity</Text>
            <Pressable>
              <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
            </Pressable>
          </View>

          {loading ? (
            <View style={[styles.activityCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              {[0, 1, 2].map(i => (
                <SkeletonCard key={i} style={{ marginBottom: i < 2 ? 12 : 0, padding: 0 }} />
              ))}
            </View>
          ) : (
            <View style={[styles.activityCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              {RECENT_ACTIVITY.map((item, idx) => (
                <View key={item.id}>
                  <Pressable
                    style={({ pressed }) => [styles.activityRow, { opacity: pressed ? 0.8 : 1 }]}
                  >
                    <LinearGradient colors={[item.color, `${item.color}88`]} style={styles.activityIcon}>
                      <MaterialIcons name={item.icon as any} size={15} color="#fff" />
                    </LinearGradient>
                    <View style={styles.activityInfo}>
                      <Text style={[styles.activityTitle, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
                      <Text style={[styles.activitySub, { color: colors.textMuted }]}>{item.sub} · {item.time}</Text>
                    </View>
                    <MaterialIcons name="chevron-right" size={18} color={colors.textMuted} />
                  </Pressable>
                  {idx < RECENT_ACTIVITY.length - 1 ? (
                    <View style={[styles.divider, { backgroundColor: colors.border }]} />
                  ) : null}
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const CARD_W = (width - Spacing.md * 2 - Spacing.sm * 3) / 4;

const styles = StyleSheet.create({
  safe: { flex: 1 },
  headerGrad: { paddingBottom: Spacing.lg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
  },
  greeting: { fontSize: FontSize.sm, fontWeight: '500' },
  userName: { fontSize: FontSize.xxl, fontWeight: FontWeight.extrabold, marginTop: 2 },
  avatarWrapper: { position: 'relative' },
  avatar: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: FontSize.xl, fontWeight: FontWeight.extrabold, color: '#fff' },
  onlineDot: { position: 'absolute', bottom: 0, right: 0, width: 12, height: 12, borderRadius: 6, borderWidth: 2 },

  heroCard: {
    marginHorizontal: Spacing.md,
    borderRadius: BorderRadius.xxl,
    padding: Spacing.lg,
    overflow: 'hidden',
    gap: Spacing.sm,
    ...Shadow.lg,
  },
  heroBg1: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.06)',
    top: -60,
    right: -40,
  },
  heroBg2: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.04)',
    bottom: -30,
    left: 20,
  },
  heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heroTitle: { fontSize: FontSize.xxl + 2, fontWeight: FontWeight.extrabold, color: '#fff', lineHeight: 34, marginTop: 4 },
  heroSub: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.72)', lineHeight: 20 },
  heroBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md + 4,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  heroBtnText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: '#7C6FFF' },

  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  statCard: {
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    gap: 5,
  },
  statIconBg: {
    width: 34,
    height: 34,
    borderRadius: BorderRadius.sm + 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: { fontSize: FontSize.xl, fontWeight: FontWeight.extrabold },
  statLabel: { fontSize: FontSize.xxs, fontWeight: '600' },

  section: { paddingHorizontal: Spacing.md, marginTop: Spacing.lg },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.md },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  seeAll: { fontSize: FontSize.sm, fontWeight: '600' },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  featureCard: {
    width: CARD_W,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.sm + 2,
    alignItems: 'center',
    gap: 6,
  },
  featureIconBg: {
    width: 46,
    height: 46,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureLabel: { fontSize: FontSize.xxs + 1, fontWeight: FontWeight.bold, textAlign: 'center' },
  featureDesc: { fontSize: FontSize.xxs, textAlign: 'center' },

  activityCard: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    overflow: 'hidden',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.sm + 2,
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityInfo: { flex: 1 },
  activityTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  activitySub: { fontSize: FontSize.xxs, marginTop: 2 },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: 52 },
});
