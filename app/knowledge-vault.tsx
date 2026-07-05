import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/hooks/useTheme';
import { useAppStore } from '@/stores/useAppStore';
import { KnowledgeCard } from '@/components/feature/KnowledgeCard';
import { Badge } from '@/components/ui/Badge';
import { Header } from '@/components/layout/Header';
import { BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/theme';
import type { KnowledgeItem } from '@/stores/useAppStore';

const FILTER_TYPES: { key: KnowledgeItem['type'] | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'document', label: 'Docs' },
  { key: 'url', label: 'Links' },
  { key: 'note', label: 'Notes' },
  { key: 'image', label: 'Images' },
];

export default function KnowledgeVaultScreen() {
  const { colors } = useTheme();
  const { knowledgeItems, deleteKnowledgeItem, addKnowledgeItem } = useAppStore();
  const [activeType, setActiveType] = useState<KnowledgeItem['type'] | 'all'>('all');
  const [search, setSearch] = useState('');

  const filtered = knowledgeItems
    .filter(k => activeType === 'all' || k.type === activeType)
    .filter(k => !search || k.title.toLowerCase().includes(search.toLowerCase()) || k.description.toLowerCase().includes(search.toLowerCase()));

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <Header title="Knowledge Vault" subtitle={`${knowledgeItems.length} items stored`} showBack />

      {/* Stats Banner */}
      <LinearGradient colors={[`${colors.primary}22`, `${colors.secondary}11`]} style={styles.banner}>
        {[{ label: 'Documents', count: knowledgeItems.filter(k => k.type === 'document').length, color: '#6C63FF' },
          { label: 'Links', count: knowledgeItems.filter(k => k.type === 'url').length, color: '#00D4FF' },
          { label: 'Notes', count: knowledgeItems.filter(k => k.type === 'note').length, color: '#FFD700' },
          { label: 'Images', count: knowledgeItems.filter(k => k.type === 'image').length, color: '#FF6B9D' }].map(stat => (
          <View key={stat.label} style={styles.statItem}>
            <Text style={[styles.statCount, { color: stat.color }]}>{stat.count}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>{stat.label}</Text>
          </View>
        ))}
      </LinearGradient>

      {/* Search */}
      <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <MaterialIcons name="search" size={20} color={colors.textMuted} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search knowledge..."
          placeholderTextColor={colors.textMuted}
          style={[styles.searchInput, { color: colors.text }]}
        />
      </View>

      {/* Filter */}
      <View style={styles.filterRow}>
        {FILTER_TYPES.map(ft => (
          <Pressable
            key={ft.key}
            onPress={() => setActiveType(ft.key)}
            style={[
              styles.filterBtn,
              { backgroundColor: activeType === ft.key ? colors.primary : colors.card, borderColor: activeType === ft.key ? colors.primary : colors.border },
            ]}
          >
            <Text style={[styles.filterText, { color: activeType === ft.key ? '#fff' : colors.textSecondary }]}>{ft.label}</Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={k => k.id}
        renderItem={({ item }) => (
          <KnowledgeCard item={item} onDelete={() => deleteKnowledgeItem(item.id)} />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialIcons name="folder-special" size={56} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>No items found</Text>
          </View>
        }
      />

      {/* FAB */}
      <Pressable
        onPress={() => addKnowledgeItem({ title: 'New Note', description: 'Tap to edit this note', type: 'note', tags: ['new'] })}
        style={({ pressed }) => [styles.fab, { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 }]}
      >
        <MaterialIcons name="add" size={28} color="#fff" />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  banner: { flexDirection: 'row', justifyContent: 'space-around', padding: Spacing.md, marginHorizontal: Spacing.md, borderRadius: BorderRadius.xl, marginBottom: Spacing.md },
  statItem: { alignItems: 'center', gap: 4 },
  statCount: { fontSize: FontSize.xxl, fontWeight: FontWeight.extrabold },
  statLabel: { fontSize: FontSize.xs },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginHorizontal: Spacing.md, borderRadius: BorderRadius.md, borderWidth: 1, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, marginBottom: Spacing.sm },
  searchInput: { flex: 1, fontSize: FontSize.base, includeFontPadding: false },
  filterRow: { flexDirection: 'row', gap: Spacing.sm, paddingHorizontal: Spacing.md, marginBottom: Spacing.md },
  filterBtn: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs + 2, borderRadius: BorderRadius.full, borderWidth: 1 },
  filterText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  list: { paddingHorizontal: Spacing.md, paddingBottom: 100 },
  empty: { alignItems: 'center', gap: Spacing.md, paddingTop: Spacing.xxl },
  emptyText: { fontSize: FontSize.base },
  fab: { position: 'absolute', right: Spacing.lg, bottom: Spacing.xl, width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
});
