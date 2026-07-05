import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, FlatList, StyleSheet, Pressable, TextInput, Animated, RefreshControl,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/hooks/useTheme';
import { useAppStore } from '@/stores/useAppStore';
import { KnowledgeCard } from '@/components/feature/KnowledgeCard';
import { Badge } from '@/components/ui/Badge';
import { Header } from '@/components/layout/Header';
import { PremiumButton } from '@/components/ui/PremiumButton';
import { SkeletonList } from '@/components/ui/SkeletonLoader';
import { BorderRadius, FontSize, FontWeight, Shadow, Spacing } from '@/constants/theme';
import type { KnowledgeItem } from '@/stores/useAppStore';

const FILTER_TYPES: { key: KnowledgeItem['type'] | 'all'; label: string; icon: string; color: string }[] = [
  { key: 'all', label: 'All', icon: 'layers', color: '#7C6FFF' },
  { key: 'document', label: 'Docs', icon: 'description', color: '#7C6FFF' },
  { key: 'url', label: 'Links', icon: 'link', color: '#00D4FF' },
  { key: 'note', label: 'Notes', icon: 'sticky-note-2', color: '#F5C842' },
  { key: 'image', label: 'Images', icon: 'image', color: '#FF6B9D' },
];

export default function KnowledgeVaultScreen() {
  const { colors, isDark } = useTheme();
  const { knowledgeItems, deleteKnowledgeItem, addKnowledgeItem } = useAppStore();
  const [activeType, setActiveType] = useState<KnowledgeItem['type'] | 'all'>('all');
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchFocused, setSearchFocused] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const searchBorderAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setTimeout(() => setLoading(false), 700);
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  useEffect(() => {
    Animated.timing(searchBorderAnim, {
      toValue: searchFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [searchFocused]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise(r => setTimeout(r, 1000));
    setRefreshing(false);
  };

  const filtered = knowledgeItems
    .filter(k => activeType === 'all' || k.type === activeType)
    .filter(k => !search || k.title.toLowerCase().includes(search.toLowerCase()) || k.description.toLowerCase().includes(search.toLowerCase()));

  const TYPE_STATS = [
    { label: 'Documents', count: knowledgeItems.filter(k => k.type === 'document').length, color: '#7C6FFF', icon: 'description' },
    { label: 'Links', count: knowledgeItems.filter(k => k.type === 'url').length, color: '#00D4FF', icon: 'link' },
    { label: 'Notes', count: knowledgeItems.filter(k => k.type === 'note').length, color: '#F5C842', icon: 'sticky-note-2' },
    { label: 'Images', count: knowledgeItems.filter(k => k.type === 'image').length, color: '#FF6B9D', icon: 'image' },
  ];

  const searchBorderColor = searchBorderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.border, colors.primary],
  });

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <Animated.View style={[styles.flex, { opacity: fadeAnim }]}>
        <Header
          title="Knowledge Vault"
          subtitle={`${knowledgeItems.length} items`}
          showBack
          rightAction={{
            icon: 'sort',
            onPress: () => {},
          }}
        />

        {/* ── Stats Banner ── */}
        <LinearGradient
          colors={isDark ? ['#14142C', '#0F0F1A'] : ['#EAE8FF', '#F0F0FF']}
          style={styles.statsBanner}
        >
          {TYPE_STATS.map(stat => (
            <Pressable
              key={stat.label}
              onPress={() => setActiveType(stat.label === 'Documents' ? 'document' : stat.label === 'Links' ? 'url' : stat.label === 'Notes' ? 'note' : 'image')}
              style={({ pressed }) => [styles.statItem, { opacity: pressed ? 0.8 : 1 }]}
            >
              <LinearGradient colors={[`${stat.color}30`, `${stat.color}15`]} style={styles.statIconBg}>
                <MaterialIcons name={stat.icon as any} size={16} color={stat.color} />
              </LinearGradient>
              <Text style={[styles.statCount, { color: stat.color }]}>{stat.count}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>{stat.label}</Text>
            </Pressable>
          ))}
        </LinearGradient>

        {/* ── Search ── */}
        <Animated.View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: searchBorderColor }]}>
          <MaterialIcons name="search" size={20} color={searchFocused ? colors.primary : colors.textMuted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search your knowledge..."
            placeholderTextColor={colors.textMuted}
            style={[styles.searchInput, { color: colors.text }]}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          {search.length > 0 ? (
            <Pressable onPress={() => setSearch('')} hitSlop={8}>
              <MaterialIcons name="cancel" size={18} color={colors.textMuted} />
            </Pressable>
          ) : null}
        </Animated.View>

        {/* ── Filter Tabs ── */}
        <View style={styles.filterRow}>
          {FILTER_TYPES.map(ft => {
            const isActive = activeType === ft.key;
            return (
              <Pressable
                key={ft.key}
                onPress={() => setActiveType(ft.key)}
                style={({ pressed }) => [
                  styles.filterBtn,
                  isActive
                    ? { backgroundColor: `${ft.color}22`, borderColor: ft.color }
                    : { backgroundColor: colors.card, borderColor: colors.cardBorder },
                  { opacity: pressed ? 0.85 : 1 },
                ]}
              >
                <MaterialIcons name={ft.icon as any} size={13} color={isActive ? ft.color : colors.textMuted} />
                <Text style={[styles.filterText, { color: isActive ? ft.color : colors.textSecondary }]}>
                  {ft.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* ── List ── */}
        {loading ? (
          <SkeletonList count={4} />
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={k => k.id}
            renderItem={({ item }) => (
              <KnowledgeCard item={item} onDelete={() => deleteKnowledgeItem(item.id)} />
            )}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={colors.primary}
                colors={[colors.primary]}
              />
            }
            ListEmptyComponent={
              <View style={styles.empty}>
                <LinearGradient colors={['#7C6FFF33', '#F5C84211']} style={styles.emptyIcon}>
                  <MaterialIcons name="folder-special" size={44} color={colors.primary} />
                </LinearGradient>
                <Text style={[styles.emptyTitle, { color: colors.text }]}>Nothing found</Text>
                <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
                  {search ? 'Try a different search term' : 'Add items to your vault'}
                </Text>
              </View>
            }
          />
        )}

        {/* ── FAB ── */}
        <Pressable
          onPress={() => addKnowledgeItem({
            title: `Quick Note ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
            description: 'Tap to expand and edit this note.',
            type: 'note',
            tags: ['quick'],
          })}
          style={({ pressed }) => [styles.fab, { opacity: pressed ? 0.85 : 1, ...Shadow.lg }]}
        >
          <LinearGradient colors={['#7C6FFF', '#4A42CC']} style={styles.fabInner}>
            <MaterialIcons name="add" size={28} color="#fff" />
          </LinearGradient>
        </Pressable>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  statsBanner: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: Spacing.md,
    marginHorizontal: Spacing.md,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.md,
  },
  statItem: { alignItems: 'center', gap: 5 },
  statIconBg: { width: 36, height: 36, borderRadius: BorderRadius.sm, alignItems: 'center', justifyContent: 'center' },
  statCount: { fontSize: FontSize.xl, fontWeight: FontWeight.extrabold },
  statLabel: { fontSize: FontSize.xxs, fontWeight: '600' },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    marginBottom: Spacing.sm,
  },
  searchInput: { flex: 1, fontSize: FontSize.base, includeFontPadding: false },

  filterRow: { flexDirection: 'row', gap: Spacing.sm, paddingHorizontal: Spacing.md, marginBottom: Spacing.md },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm + 4,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  filterText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },

  list: { paddingHorizontal: Spacing.md, paddingBottom: 120 },
  empty: { alignItems: 'center', gap: Spacing.md, paddingTop: Spacing.xxl, paddingHorizontal: Spacing.xl },
  emptyIcon: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold },
  emptyDesc: { fontSize: FontSize.base, textAlign: 'center' },

  fab: { position: 'absolute', right: Spacing.lg, bottom: Spacing.xl },
  fabInner: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
});
