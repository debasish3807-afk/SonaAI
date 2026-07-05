import React, { useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView, Animated,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { useAppStore } from '@/stores/useAppStore';
import { Badge } from '@/components/ui/Badge';
import { BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/theme';

const TYPE_META: Record<string, { icon: string; color: string; label: string }> = {
  chat: { icon: 'chat-bubble', color: '#7C6FFF', label: 'Chat' },
  image: { icon: 'auto-awesome', color: '#00E676', label: 'Image' },
  voice: { icon: 'mic', color: '#FF6B9D', label: 'Voice' },
  website: { icon: 'language', color: '#FF9800', label: 'Website' },
  apk: { icon: 'android', color: '#4CAF50', label: 'APK' },
};

const formatTime = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
};

export default function AIHistoryScreen() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const { aiHistory } = useAppStore();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }).start();
  }, []);

  const groupedHistory = aiHistory.reduce<Record<string, typeof aiHistory>>((acc, item) => {
    const date = new Date(item.timestamp);
    const today = new Date();
    const yesterday = new Date(today.getTime() - 86400000);
    let group = 'Earlier';
    if (date.toDateString() === today.toDateString()) group = 'Today';
    else if (date.toDateString() === yesterday.toDateString()) group = 'Yesterday';
    if (!acc[group]) acc[group] = [];
    acc[group].push(item);
    return acc;
  }, {});

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <Animated.View style={[styles.flex, { opacity: fadeAnim }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Pressable onPress={() => router.back()} hitSlop={8} style={({ pressed }) => [styles.backBtn, { backgroundColor: colors.card, opacity: pressed ? 0.8 : 1 }]}>
            <MaterialIcons name="arrow-back-ios" size={18} color={colors.text} />
          </Pressable>
          <View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>AI History</Text>
            <Text style={[styles.headerSub, { color: colors.textSecondary }]}>{aiHistory.length} sessions</Text>
          </View>
          <Pressable style={({ pressed }) => [styles.filterBtn, { backgroundColor: colors.card, borderColor: colors.cardBorder, opacity: pressed ? 0.8 : 1 }]}>
            <MaterialIcons name="filter-list" size={18} color={colors.textSecondary} />
          </Pressable>
        </View>

        {/* Stats */}
        <LinearGradient
          colors={isDark ? ['#14142C', '#0F0F1A'] : ['#EAE8FF', '#F0F0FF']}
          style={styles.statsBanner}
        >
          {Object.entries(TYPE_META).slice(0, 5).map(([type, meta]) => {
            const count = aiHistory.filter(h => h.type === type).length;
            return (
              <View key={type} style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: `${meta.color}20` }]}>
                  <MaterialIcons name={meta.icon as any} size={16} color={meta.color} />
                </View>
                <Text style={[styles.statCount, { color: meta.color }]}>{count}</Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>{meta.label}</Text>
              </View>
            );
          })}
        </LinearGradient>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
          {Object.entries(groupedHistory).map(([group, items]) => (
            <View key={group} style={styles.section}>
              <Text style={[styles.groupLabel, { color: colors.textMuted }]}>{group.toUpperCase()}</Text>
              {items.map(item => {
                const meta = TYPE_META[item.type];
                return (
                  <Pressable
                    key={item.id}
                    style={({ pressed }) => [
                      styles.historyCard,
                      { backgroundColor: colors.card, borderColor: colors.cardBorder, opacity: pressed ? 0.85 : 1 },
                    ]}
                  >
                    <LinearGradient colors={[meta.color, `${meta.color}99`]} style={styles.historyIcon}>
                      <MaterialIcons name={meta.icon as any} size={20} color="#fff" />
                    </LinearGradient>
                    <View style={styles.historyContent}>
                      <View style={styles.historyTop}>
                        <Text style={[styles.historyTitle, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
                        <Badge label={meta.label} variant="outline" size="sm" />
                      </View>
                      <Text style={[styles.historyPreview, { color: colors.textSecondary }]} numberOfLines={2}>{item.preview}</Text>
                      <View style={styles.historyMeta}>
                        <MaterialIcons name="schedule" size={11} color={colors.textMuted} />
                        <Text style={[styles.historyTime, { color: colors.textMuted }]}>{formatTime(item.timestamp)}</Text>
                        {item.tokens ? (
                          <>
                            <Text style={[styles.historyDot, { color: colors.textMuted }]}>·</Text>
                            <MaterialIcons name="bolt" size={11} color={colors.textMuted} />
                            <Text style={[styles.historyTime, { color: colors.textMuted }]}>{item.tokens} tokens</Text>
                          </>
                        ) : null}
                      </View>
                    </View>
                    <MaterialIcons name="chevron-right" size={18} color={colors.textMuted} />
                  </Pressable>
                );
              })}
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

  statsBanner: { flexDirection: 'row', justifyContent: 'space-around', padding: Spacing.md, margin: Spacing.md, borderRadius: BorderRadius.xl },
  statItem: { alignItems: 'center', gap: 4 },
  statIcon: { width: 36, height: 36, borderRadius: BorderRadius.sm, alignItems: 'center', justifyContent: 'center' },
  statCount: { fontSize: FontSize.xl, fontWeight: FontWeight.extrabold },
  statLabel: { fontSize: FontSize.xxs, fontWeight: '600' },

  section: { paddingHorizontal: Spacing.md, marginTop: Spacing.md },
  groupLabel: { fontSize: FontSize.xxs + 1, fontWeight: FontWeight.bold, letterSpacing: 1.2, marginBottom: Spacing.md },

  historyCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.md, borderRadius: BorderRadius.xl, borderWidth: 1, marginBottom: Spacing.sm },
  historyIcon: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center' },
  historyContent: { flex: 1, gap: 4 },
  historyTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.sm },
  historyTitle: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, flex: 1 },
  historyPreview: { fontSize: FontSize.sm, lineHeight: 19 },
  historyMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  historyTime: { fontSize: FontSize.xxs + 1 },
  historyDot: { fontSize: FontSize.xxs },
});
