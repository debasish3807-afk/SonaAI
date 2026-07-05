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
import { PageHeader } from '@/components/ui/PageHeader';
import { useAppStore } from '@/stores/useAppStore';
import { Badge } from '@/components/ui/Badge';

const TYPE_META: Record<string, { icon: string; color: string; label: string }> = {
  chat:    { icon: 'chat-bubble',  color: '#7C6FFF', label: 'Chat' },
  image:   { icon: 'auto-awesome', color: '#00E676', label: 'Image' },
  voice:   { icon: 'mic',         color: '#FF6B9D', label: 'Voice' },
  website: { icon: 'language',    color: '#FF9800', label: 'Website' },
  apk:     { icon: 'android',     color: '#4CAF50', label: 'APK' },
};

const ACTIVITY_TYPES: Array<{ key: string; label: string; icon: string; color: string }> = [
  { key: 'all', label: 'All', icon: 'layers', color: '#7C6FFF' },
  { key: 'chat', label: 'Chats', icon: 'chat-bubble', color: '#7C6FFF' },
  { key: 'image', label: 'Images', icon: 'auto-awesome', color: '#00E676' },
  { key: 'voice', label: 'Voice', icon: 'mic', color: '#FF6B9D' },
  { key: 'website', label: 'Website', icon: 'language', color: '#FF9800' },
  { key: 'apk', label: 'APK', icon: 'android', color: '#4CAF50' },
];

const formatTime = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
};

export default function ActivityCenterScreen() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const { aiHistory } = useAppStore();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [activeFilter, setActiveFilter] = React.useState('all');

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }).start();
  }, []);

  const filtered = activeFilter === 'all' ? aiHistory : aiHistory.filter(h => h.type === activeFilter);

  const totalTokens = aiHistory.reduce((s, h) => s + (h.tokens ?? 0), 0);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <Animated.View style={[styles.flex, { opacity: fadeAnim }]}>
        <PageHeader
          title="Activity Center"
          subtitle={`${aiHistory.length} total activities`}
          actions={[{ icon: 'filter-list', onPress: () => {} }]}
        />

        {/* Overview Stats */}
        <LinearGradient
          colors={isDark ? ['#14142C', '#0F0F1A'] : ['#EAE8FF', '#F0F0FF']}
          style={styles.statsGrid}
        >
          {Object.entries(TYPE_META).map(([type, meta]) => {
            const count = aiHistory.filter(h => h.type === type).length;
            return (
              <Pressable
                key={type}
                onPress={() => setActiveFilter(type)}
                style={[styles.statCell, activeFilter === type && { backgroundColor: `${meta.color}20`, borderColor: `${meta.color}40`, borderWidth: 1 }]}
              >
                <View style={[styles.statCellIcon, { backgroundColor: `${meta.color}20` }]}>
                  <MaterialIcons name={meta.icon as any} size={16} color={meta.color} />
                </View>
                <Text style={[styles.statCellValue, { color: meta.color }]}>{count}</Text>
                <Text style={[styles.statCellLabel, { color: colors.textMuted }]}>{meta.label}</Text>
              </Pressable>
            );
          })}
        </LinearGradient>

        {/* Tokens Summary */}
        <View style={[styles.tokensBanner, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <LinearGradient colors={['#F5C842', '#FF9800']} style={styles.tokensIcon}>
            <MaterialIcons name="bolt" size={20} color="#fff" />
          </LinearGradient>
          <View>
            <Text style={[styles.tokensLabel, { color: colors.textSecondary }]}>Total AI Tokens Used</Text>
            <Text style={[styles.tokensValue, { color: colors.text }]}>{totalTokens.toLocaleString()} tokens</Text>
          </View>
          <View style={styles.tokensRight}>
            <Text style={[styles.tokensSave, { color: '#00E676' }]}>∞ Remaining</Text>
          </View>
        </View>

        {/* Activity Filter */}
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContent}>
            {ACTIVITY_TYPES.map(type => (
              <Pressable
                key={type.key}
                onPress={() => setActiveFilter(type.key)}
                style={({ pressed }) => [
                  styles.filterChip,
                  activeFilter === type.key
                    ? { backgroundColor: type.color, borderColor: type.color }
                    : { backgroundColor: colors.card, borderColor: colors.cardBorder },
                  { opacity: pressed ? 0.8 : 1 },
                ]}
              >
                <MaterialIcons name={type.icon as any} size={12} color={activeFilter === type.key ? '#fff' : colors.textMuted} />
                <Text style={[styles.filterText, { color: activeFilter === type.key ? '#fff' : colors.textSecondary }]}>{type.label}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Activity Timeline */}
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.timeline}>
          {filtered.map((item, idx) => {
            const meta = TYPE_META[item.type];
            const isLast = idx === filtered.length - 1;
            return (
              <View key={item.id} style={styles.timelineRow}>
                {/* Connector */}
                <View style={styles.connectorCol}>
                  <LinearGradient colors={[meta.color, `${meta.color}88`]} style={styles.timelineDot} />
                  {!isLast ? <View style={[styles.timelineLine, { backgroundColor: colors.border }]} /> : null}
                </View>

                {/* Content */}
                <Pressable
                  style={({ pressed }) => [styles.activityCard, { backgroundColor: colors.card, borderColor: colors.cardBorder, opacity: pressed ? 0.85 : 1 }]}
                >
                  <View style={styles.activityHeader}>
                    <View style={[styles.activityIcon, { backgroundColor: `${meta.color}20` }]}>
                      <MaterialIcons name={meta.icon as any} size={16} color={meta.color} />
                    </View>
                    <Text style={[styles.activityTitle, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
                    <Badge label={meta.label} variant="outline" size="sm" />
                  </View>
                  <Text style={[styles.activityPreview, { color: colors.textSecondary }]} numberOfLines={2}>{item.preview}</Text>
                  <View style={styles.activityFooter}>
                    <View style={styles.activityMeta}>
                      <MaterialIcons name="schedule" size={11} color={colors.textMuted} />
                      <Text style={[styles.activityTime, { color: colors.textMuted }]}>{formatTime(item.timestamp)}</Text>
                    </View>
                    {item.tokens ? (
                      <View style={styles.activityMeta}>
                        <MaterialIcons name="bolt" size={11} color="#F5C842" />
                        <Text style={[styles.activityTime, { color: colors.textMuted }]}>{item.tokens} tokens</Text>
                      </View>
                    ) : null}
                  </View>
                </Pressable>
              </View>
            );
          })}
          {filtered.length === 0 ? (
            <View style={styles.empty}>
              <MaterialIcons name="timeline" size={44} color={colors.textMuted} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No activity yet</Text>
              <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>Start using SONA AI to see your activity here</Text>
            </View>
          ) : null}
          <View style={{ height: 32 }} />
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  statsGrid: { flexDirection: 'row', margin: Spacing.md, borderRadius: BorderRadius.xl, overflow: 'hidden' },
  statCell: { flex: 1, alignItems: 'center', gap: 4, paddingVertical: Spacing.md, borderRadius: BorderRadius.xl },
  statCellIcon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  statCellValue: { fontSize: FontSize.lg, fontWeight: FontWeight.extrabold },
  statCellLabel: { fontSize: FontSize.xxs },
  tokensBanner: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginHorizontal: Spacing.md, padding: Spacing.md, borderRadius: BorderRadius.xl, borderWidth: 1, marginBottom: Spacing.sm },
  tokensIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  tokensLabel: { fontSize: FontSize.xs },
  tokensValue: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, marginTop: 2 },
  tokensRight: { marginLeft: 'auto' as any },
  tokensSave: { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  filterContainer: { maxHeight: 46, marginBottom: Spacing.sm },
  filterContent: { paddingHorizontal: Spacing.md, gap: Spacing.sm, alignItems: 'center' },
  filterChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: Spacing.md, paddingVertical: 7, borderRadius: BorderRadius.full, borderWidth: 1 },
  filterText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  timeline: { paddingHorizontal: Spacing.md, paddingTop: Spacing.sm },
  timelineRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md },
  connectorCol: { alignItems: 'center', width: 16, paddingTop: 8 },
  timelineDot: { width: 14, height: 14, borderRadius: 7 },
  timelineLine: { width: 2, flex: 1, marginTop: 4 },
  activityCard: { flex: 1, padding: Spacing.md, borderRadius: BorderRadius.xl, borderWidth: 1, gap: Spacing.sm },
  activityHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  activityIcon: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  activityTitle: { flex: 1, fontSize: FontSize.base, fontWeight: FontWeight.semibold },
  activityPreview: { fontSize: FontSize.sm, lineHeight: 19 },
  activityFooter: { flexDirection: 'row', gap: Spacing.md },
  activityMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  activityTime: { fontSize: FontSize.xxs + 1 },
  empty: { alignItems: 'center', gap: Spacing.md, paddingTop: Spacing.xxl },
  emptyTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold },
  emptyDesc: { fontSize: FontSize.base, textAlign: 'center' },
});
