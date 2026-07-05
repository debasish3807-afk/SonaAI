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

const ALL_ACTIVITY = [
  { id: '1', title: 'Discussed React Native architecture', desc: 'Covered clean architecture, MVVM, and state management patterns', time: '2m ago', icon: 'chat-bubble', color: '#7C6FFF', sub: 'AI Chat', date: 'Today' },
  { id: '2', title: 'Added memory: Project Goals Q3', desc: 'Saved 2025 Q3 roadmap priorities to memory vault', time: '1h ago', icon: 'psychology', color: '#00D4FF', sub: 'Memory', date: 'Today' },
  { id: '3', title: 'Generated: Futuristic city artwork', desc: 'Cinematic style image with neon lights and night sky', time: '3h ago', icon: 'auto-awesome', color: '#00E676', sub: 'Image AI', date: 'Today' },
  { id: '4', title: 'Voice query: Quantum computing', desc: 'Asked SONA to explain quantum entanglement', time: '5h ago', icon: 'mic', color: '#FF6B9D', sub: 'Voice AI', date: 'Today' },
  { id: '5', title: 'Built portfolio website', desc: 'AI generated dark-theme developer portfolio', time: '1d ago', icon: 'language', color: '#FF9800', sub: 'Website Builder', date: 'Yesterday' },
  { id: '6', title: 'Uploaded: SONA Product Brief.pdf', desc: 'Added 2.4MB document to knowledge vault', time: '1d ago', icon: 'description', color: '#F5C842', sub: 'Knowledge', date: 'Yesterday' },
  { id: '7', title: 'APK Build: TaskManager', desc: 'Successfully compiled Android APK with dark theme', time: '2d ago', icon: 'android', color: '#4CAF50', sub: 'APK Builder', date: 'Earlier' },
  { id: '8', title: 'Python async pipeline code', desc: 'Generated async data pipeline with error handling', time: '3d ago', icon: 'code', color: '#9C27B0', sub: 'AI Chat', date: 'Earlier' },
];

export default function RecentActivityScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }).start();
  }, []);

  const grouped = ALL_ACTIVITY.reduce<Record<string, typeof ALL_ACTIVITY>>((acc, item) => {
    if (!acc[item.date]) acc[item.date] = [];
    acc[item.date].push(item);
    return acc;
  }, {});

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <Animated.View style={[styles.flex, { opacity: fadeAnim }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Pressable onPress={() => router.back()} hitSlop={8} style={({ pressed }) => [styles.backBtn, { backgroundColor: colors.card, opacity: pressed ? 0.8 : 1 }]}>
            <MaterialIcons name="arrow-back-ios" size={18} color={colors.text} />
          </Pressable>
          <View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Recent Activity</Text>
            <Text style={[styles.headerSub, { color: colors.textSecondary }]}>{ALL_ACTIVITY.length} actions</Text>
          </View>
          <Pressable style={({ pressed }) => [styles.filterBtn, { backgroundColor: colors.card, borderColor: colors.cardBorder, opacity: pressed ? 0.8 : 1 }]}>
            <MaterialIcons name="filter-list" size={18} color={colors.textSecondary} />
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
          {Object.entries(grouped).map(([date, items]) => (
            <View key={date} style={styles.section}>
              <Text style={[styles.dateLabel, { color: colors.textMuted }]}>{date.toUpperCase()}</Text>
              {items.map((item, idx) => (
                <View key={item.id} style={styles.timelineRow}>
                  {/* Timeline line */}
                  <View style={styles.timelineLeft}>
                    <LinearGradient colors={[item.color, `${item.color}99`]} style={styles.timelineDot}>
                      <MaterialIcons name={item.icon as any} size={14} color="#fff" />
                    </LinearGradient>
                    {idx < items.length - 1 ? <View style={[styles.timelineLine, { backgroundColor: colors.border }]} /> : null}
                  </View>
                  {/* Content */}
                  <Pressable
                    style={({ pressed }) => [styles.activityCard, { backgroundColor: colors.card, borderColor: colors.cardBorder, opacity: pressed ? 0.85 : 1 }]}
                  >
                    <View style={styles.activityTop}>
                      <Text style={[styles.activityTitle, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
                      <Text style={[styles.activityTime, { color: colors.textMuted }]}>{item.time}</Text>
                    </View>
                    <Text style={[styles.activityDesc, { color: colors.textSecondary }]} numberOfLines={2}>{item.desc}</Text>
                    <View style={[styles.activityBadge, { backgroundColor: `${item.color}18`, borderColor: `${item.color}30` }]}>
                      <MaterialIcons name={item.icon as any} size={11} color={item.color} />
                      <Text style={[styles.activityBadgeText, { color: item.color }]}>{item.sub}</Text>
                    </View>
                  </Pressable>
                </View>
              ))}
            </View>
          ))}
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
  filterBtn: { width: 38, height: 38, borderRadius: BorderRadius.sm + 2, alignItems: 'center', justifyContent: 'center', borderWidth: 1, marginLeft: 'auto' as any },

  section: { paddingHorizontal: Spacing.md, marginTop: Spacing.lg },
  dateLabel: { fontSize: FontSize.xxs + 1, fontWeight: FontWeight.bold, letterSpacing: 1.2, marginBottom: Spacing.md },

  timelineRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md },
  timelineLeft: { alignItems: 'center', width: 36 },
  timelineDot: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  timelineLine: { width: 2, flex: 1, marginTop: Spacing.xs, minHeight: 20 },

  activityCard: { flex: 1, padding: Spacing.md, borderRadius: BorderRadius.xl, borderWidth: 1, gap: Spacing.xs },
  activityTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: Spacing.sm },
  activityTitle: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, flex: 1 },
  activityTime: { fontSize: FontSize.xxs + 1, marginTop: 2 },
  activityDesc: { fontSize: FontSize.sm, lineHeight: 19 },
  activityBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: BorderRadius.full, borderWidth: 1, marginTop: 2 },
  activityBadgeText: { fontSize: FontSize.xxs, fontWeight: FontWeight.semibold },
});
