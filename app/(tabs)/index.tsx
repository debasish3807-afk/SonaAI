import React, { useRef, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/theme';

const { width } = Dimensions.get('window');

const AI_FEATURES = [
  { id: 'chat', label: 'AI Chat', icon: 'chat-bubble', color: '#6C63FF', desc: 'Intelligent conversations', route: '/chat' },
  { id: 'memory', label: 'Memory', icon: 'psychology', color: '#00D4FF', desc: 'Smart knowledge recall', route: '/memory' },
  { id: 'vault', label: 'Knowledge', icon: 'folder-special', color: '#FFD700', desc: 'Your knowledge vault', route: '/knowledge-vault' },
  { id: 'voice', label: 'Voice AI', icon: 'mic', color: '#FF6B9D', desc: 'Voice assistant', route: '/voice' },
  { id: 'image', label: 'Image Gen', icon: 'auto-awesome', color: '#00E676', desc: 'AI image creation', route: '/image-generator' },
  { id: 'website', label: 'Web Builder', icon: 'language', color: '#FF9800', desc: 'Build websites with AI', route: '/website-builder' },
  { id: 'apk', label: 'APK Builder', icon: 'android', color: '#4CAF50', desc: 'Build Android apps', route: '/apk-builder' },
  { id: 'settings', label: 'Settings', icon: 'settings', color: '#9C27B0', desc: 'Customize SONA AI', route: '/settings' },
] as const;

const STATS = [
  { label: 'Memories', value: '24', icon: 'psychology', color: '#6C63FF' },
  { label: 'Chats', value: '8', icon: 'chat-bubble', color: '#00D4FF' },
  { label: 'Files', value: '5', icon: 'folder', color: '#FFD700' },
  { label: 'Images', value: '12', icon: 'image', color: '#FF6B9D' },
];

const RECENT_ACTIVITY = [
  { id: '1', title: 'Discussed React Native architecture', time: '2m ago', icon: 'chat-bubble', color: '#6C63FF' },
  { id: '2', title: 'Added memory: Project Goals Q3', time: '1h ago', icon: 'psychology', color: '#00D4FF' },
  { id: '3', title: 'Generated: Futuristic city artwork', time: '3h ago', icon: 'auto-awesome', color: '#00E676' },
  { id: '4', title: 'Uploaded: SONA Product Brief.pdf', time: '1d ago', icon: 'description', color: '#FFD700' },
];

export default function HomeScreen() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  const navigateTo = (route: string) => {
    if (route.startsWith('/')) {
      const path = route.slice(1);
      if (['chat', 'memory', 'voice', 'settings'].includes(path)) {
        router.push(`/(tabs)/${path}` as any);
      } else {
        router.push(route as any);
      }
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <LinearGradient
            colors={isDark ? ['#12121A', colors.background] : ['#EEE8FF', colors.background]}
            style={styles.headerGrad}
          >
            <View style={styles.header}>
              <View>
                <Text style={[styles.greeting, { color: colors.textSecondary }]}>Good morning,</Text>
                <Text style={[styles.userName, { color: colors.text }]}>Welcome to SONA AI</Text>
              </View>
              <Pressable style={[styles.avatarBtn, { backgroundColor: `${colors.primary}22`, borderColor: `${colors.primary}44` }]}>
                <LinearGradient colors={['#6C63FF', '#00D4FF']} style={styles.avatar}>
                  <Text style={styles.avatarText}>S</Text>
                </LinearGradient>
              </Pressable>
            </View>

            {/* Hero Card */}
            <LinearGradient
              colors={['#6C63FF', '#4A42CC', '#00D4FF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroCard}
            >
              <View style={styles.heroOverlay} />
              <MaterialIcons name="auto-awesome" size={40} color="rgba(255,255,255,0.3)" style={styles.heroBgIcon} />
              <Badge label="AI Active" variant="success" />
              <Text style={styles.heroTitle}>SONA is ready{'\n'}to assist you</Text>
              <Text style={styles.heroSub}>Ask anything, create anything, remember everything</Text>
              <Pressable
                onPress={() => router.push('/(tabs)/chat' as any)}
                style={({ pressed }) => [styles.heroBtn, { opacity: pressed ? 0.8 : 1 }]}
              >
                <Text style={styles.heroBtnText}>Start Chatting</Text>
                <MaterialIcons name="arrow-forward" size={16} color="#6C63FF" />
              </Pressable>
            </LinearGradient>
          </LinearGradient>
        </Animated.View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {STATS.map((stat) => (
            <View key={stat.label} style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <MaterialIcons name={stat.icon as any} size={20} color={stat.color} />
              <Text style={[styles.statValue, { color: colors.text }]}>{stat.value}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* AI Features Grid */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>AI Features</Text>
          <View style={styles.grid}>
            {AI_FEATURES.map((feature) => (
              <Pressable
                key={feature.id}
                onPress={() => navigateTo(feature.route)}
                style={({ pressed }) => [
                  styles.featureCard,
                  { backgroundColor: colors.card, borderColor: colors.cardBorder, opacity: pressed ? 0.85 : 1 },
                ]}
              >
                <View style={[styles.featureIconBg, { backgroundColor: `${feature.color}22` }]}>
                  <MaterialIcons name={feature.icon as any} size={24} color={feature.color} />
                </View>
                <Text style={[styles.featureLabel, { color: colors.text }]}>{feature.label}</Text>
                <Text style={[styles.featureDesc, { color: colors.textMuted }]} numberOfLines={1}>{feature.desc}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Recent Activity */}
        <View style={[styles.section, { paddingBottom: 32 }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Activity</Text>
          <Card>
            {RECENT_ACTIVITY.map((item, idx) => (
              <View key={item.id}>
                <View style={styles.activityRow}>
                  <View style={[styles.activityIcon, { backgroundColor: `${item.color}22` }]}>
                    <MaterialIcons name={item.icon as any} size={16} color={item.color} />
                  </View>
                  <View style={styles.activityInfo}>
                    <Text style={[styles.activityTitle, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
                    <Text style={[styles.activityTime, { color: colors.textMuted }]}>{item.time}</Text>
                  </View>
                </View>
                {idx < RECENT_ACTIVITY.length - 1 ? (
                  <View style={[styles.divider, { backgroundColor: colors.border }]} />
                ) : null}
              </View>
            ))}
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  headerGrad: { paddingBottom: Spacing.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.md, paddingTop: Spacing.md, paddingBottom: Spacing.sm },
  greeting: { fontSize: FontSize.sm },
  userName: { fontSize: FontSize.xl, fontWeight: FontWeight.bold },
  avatarBtn: { borderWidth: 2, borderRadius: 24, padding: 2 },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: '#fff' },
  heroCard: { marginHorizontal: Spacing.md, borderRadius: BorderRadius.xxl, padding: Spacing.lg, gap: Spacing.sm, overflow: 'hidden' },
  heroOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.1)' },
  heroBgIcon: { position: 'absolute', right: -8, top: -8 },
  heroTitle: { fontSize: FontSize.xxl, fontWeight: FontWeight.extrabold, color: '#fff', lineHeight: 32 },
  heroSub: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.75)', lineHeight: 20 },
  heroBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', alignSelf: 'flex-start', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full, gap: Spacing.xs, marginTop: Spacing.xs },
  heroBtnText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: '#6C63FF' },
  statsRow: { flexDirection: 'row', paddingHorizontal: Spacing.md, gap: Spacing.sm, marginTop: Spacing.md },
  statCard: { flex: 1, alignItems: 'center', padding: Spacing.sm, borderRadius: BorderRadius.lg, borderWidth: 1, gap: 4 },
  statValue: { fontSize: FontSize.xl, fontWeight: FontWeight.extrabold },
  statLabel: { fontSize: 10, fontWeight: '500' },
  section: { paddingHorizontal: Spacing.md, marginTop: Spacing.lg },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, marginBottom: Spacing.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  featureCard: { width: (width - Spacing.md * 2 - Spacing.sm * 3) / 4, borderRadius: BorderRadius.xl, borderWidth: 1, padding: Spacing.sm, alignItems: 'center', gap: 6 },
  featureIconBg: { width: 44, height: 44, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center' },
  featureLabel: { fontSize: 11, fontWeight: FontWeight.semibold, textAlign: 'center' },
  featureDesc: { fontSize: 9, textAlign: 'center' },
  activityRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.sm },
  activityIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  activityInfo: { flex: 1 },
  activityTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.medium },
  activityTime: { fontSize: FontSize.xs, marginTop: 2 },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: 52 },
});
