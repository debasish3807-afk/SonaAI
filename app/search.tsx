import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, Pressable, TextInput,
  ScrollView, Animated, FlatList,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { useAppStore } from '@/stores/useAppStore';
import { BorderRadius, FontSize, FontWeight, Shadow, Spacing } from '@/constants/theme';

const SEARCH_CATEGORIES = [
  { key: 'all', label: 'All', icon: 'layers' },
  { key: 'memory', label: 'Memory', icon: 'psychology' },
  { key: 'chat', label: 'Chat', icon: 'chat-bubble' },
  { key: 'knowledge', label: 'Knowledge', icon: 'folder-special' },
  { key: 'images', label: 'Images', icon: 'image' },
];

const TRENDING = [
  'React Native performance',
  'AI image generation',
  'Quantum computing basics',
  'Machine learning algorithms',
  'Design systems 2025',
];

export default function SearchScreen() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const { knowledgeItems, aiHistory } = useAppStore();
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [recentSearches, setRecentSearches] = useState(['SONA features', 'ChatGPT vs Gemini', 'mobile app design']);
  const inputRef = useRef<TextInput>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    setTimeout(() => inputRef.current?.focus(), 200);
  }, []);

  const filtered = query.length > 1
    ? knowledgeItems.filter(k =>
        k.title.toLowerCase().includes(query.toLowerCase()) ||
        k.description.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const historyFiltered = query.length > 1
    ? aiHistory.filter(h => h.title.toLowerCase().includes(query.toLowerCase()))
    : [];

  const handleSearch = (term: string) => {
    setQuery(term);
    if (term && !recentSearches.includes(term)) {
      setRecentSearches(prev => [term, ...prev].slice(0, 5));
    }
  };

  const hasResults = filtered.length > 0 || historyFiltered.length > 0;

  const TYPE_ICON: Record<string, string> = { document: 'description', url: 'link', note: 'sticky-note-2', image: 'image' };
  const TYPE_COLOR: Record<string, string> = { document: '#7C6FFF', url: '#00D4FF', note: '#F5C842', image: '#FF6B9D' };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <Animated.View style={[styles.flex, { opacity: fadeAnim }]}>
        {/* ── Search Bar ── */}
        <View style={styles.searchHeader}>
          <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <MaterialIcons name="search" size={22} color={colors.primary} />
            <TextInput
              ref={inputRef}
              value={query}
              onChangeText={setQuery}
              placeholder="Search everything in SONA..."
              placeholderTextColor={colors.textMuted}
              style={[styles.searchInput, { color: colors.text }]}
              returnKeyType="search"
              onSubmitEditing={() => handleSearch(query)}
              autoFocus
            />
            {query.length > 0 ? (
              <Pressable onPress={() => setQuery('')} hitSlop={10}>
                <MaterialIcons name="cancel" size={20} color={colors.textMuted} />
              </Pressable>
            ) : null}
          </View>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [styles.cancelBtn, { opacity: pressed ? 0.7 : 1 }]}
          >
            <Text style={[styles.cancelText, { color: colors.primary }]}>Cancel</Text>
          </Pressable>
        </View>

        {/* ── Category Chips ── */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categories} contentContainerStyle={styles.categoriesContent}>
          {SEARCH_CATEGORIES.map(cat => {
            const isActive = activeCategory === cat.key;
            return (
              <Pressable
                key={cat.key}
                onPress={() => setActiveCategory(cat.key)}
                style={({ pressed }) => [
                  styles.categoryChip,
                  isActive ? { backgroundColor: colors.primary, borderColor: colors.primary } : { backgroundColor: colors.card, borderColor: colors.cardBorder },
                  { opacity: pressed ? 0.8 : 1 },
                ]}
              >
                <MaterialIcons name={cat.icon as any} size={13} color={isActive ? '#fff' : colors.textMuted} />
                <Text style={[styles.categoryText, { color: isActive ? '#fff' : colors.textSecondary }]}>{cat.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <ScrollView showsVerticalScrollIndicator={false}>
          {query.length === 0 ? (
            <>
              {/* Recent Searches */}
              {recentSearches.length > 0 ? (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent</Text>
                    <Pressable onPress={() => setRecentSearches([])}>
                      <Text style={[styles.clearText, { color: colors.primary }]}>Clear all</Text>
                    </Pressable>
                  </View>
                  {recentSearches.map(r => (
                    <Pressable
                      key={r}
                      onPress={() => setQuery(r)}
                      style={({ pressed }) => [styles.recentRow, { opacity: pressed ? 0.7 : 1 }]}
                    >
                      <MaterialIcons name="history" size={18} color={colors.textMuted} />
                      <Text style={[styles.recentText, { color: colors.textSecondary }]}>{r}</Text>
                      <Pressable onPress={() => setRecentSearches(p => p.filter(i => i !== r))} hitSlop={8}>
                        <MaterialIcons name="close" size={16} color={colors.textMuted} />
                      </Pressable>
                    </Pressable>
                  ))}
                </View>
              ) : null}

              {/* Trending */}
              <View style={[styles.section, { paddingBottom: 32 }]}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Trending Topics</Text>
                <View style={styles.trendingGrid}>
                  {TRENDING.map((t, i) => (
                    <Pressable
                      key={t}
                      onPress={() => setQuery(t)}
                      style={({ pressed }) => [styles.trendingChip, { backgroundColor: colors.card, borderColor: colors.cardBorder, opacity: pressed ? 0.8 : 1 }]}
                    >
                      <MaterialIcons name="trending-up" size={13} color={colors.primary} />
                      <Text style={[styles.trendingText, { color: colors.textSecondary }]}>{t}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </>
          ) : hasResults ? (
            <View style={{ paddingBottom: 32 }}>
              {filtered.length > 0 ? (
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Knowledge ({filtered.length})</Text>
                  {filtered.map(item => (
                    <Pressable
                      key={item.id}
                      onPress={() => router.push('/knowledge-vault' as any)}
                      style={({ pressed }) => [styles.resultRow, { backgroundColor: colors.card, borderColor: colors.cardBorder, opacity: pressed ? 0.85 : 1 }]}
                    >
                      <View style={[styles.resultIcon, { backgroundColor: `${TYPE_COLOR[item.type]}20` }]}>
                        <MaterialIcons name={TYPE_ICON[item.type] as any} size={18} color={TYPE_COLOR[item.type]} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.resultTitle, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
                        <Text style={[styles.resultDesc, { color: colors.textMuted }]} numberOfLines={1}>{item.description}</Text>
                      </View>
                      <MaterialIcons name="chevron-right" size={18} color={colors.textMuted} />
                    </Pressable>
                  ))}
                </View>
              ) : null}

              {historyFiltered.length > 0 ? (
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>AI History ({historyFiltered.length})</Text>
                  {historyFiltered.map(item => (
                    <Pressable
                      key={item.id}
                      onPress={() => router.push('/ai-history' as any)}
                      style={({ pressed }) => [styles.resultRow, { backgroundColor: colors.card, borderColor: colors.cardBorder, opacity: pressed ? 0.85 : 1 }]}
                    >
                      <View style={[styles.resultIcon, { backgroundColor: '#7C6FFF20' }]}>
                        <MaterialIcons name="auto-awesome" size={18} color="#7C6FFF" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.resultTitle, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
                        <Text style={[styles.resultDesc, { color: colors.textMuted }]} numberOfLines={1}>{item.preview}</Text>
                      </View>
                      <MaterialIcons name="chevron-right" size={18} color={colors.textMuted} />
                    </Pressable>
                  ))}
                </View>
              ) : null}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <LinearGradient colors={['#7C6FFF33', '#00D4FF11']} style={styles.emptyIcon}>
                <MaterialIcons name="search-off" size={44} color={colors.textMuted} />
              </LinearGradient>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No results for</Text>
              <Text style={[styles.emptyQuery, { color: colors.primary }]}>"{query}"</Text>
              <Text style={[styles.emptyHint, { color: colors.textSecondary }]}>Try a different keyword or check spelling</Text>
            </View>
          )}
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  searchHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingHorizontal: Spacing.md, paddingTop: Spacing.sm, paddingBottom: Spacing.md },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, borderRadius: BorderRadius.xl, borderWidth: 1.5, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm + 2 },
  searchInput: { flex: 1, fontSize: FontSize.base, includeFontPadding: false },
  cancelBtn: { paddingVertical: Spacing.sm },
  cancelText: { fontSize: FontSize.base, fontWeight: FontWeight.semibold },

  categories: { maxHeight: 48 },
  categoriesContent: { paddingHorizontal: Spacing.md, gap: Spacing.sm, alignItems: 'center' },
  categoryChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: Spacing.md, paddingVertical: 7, borderRadius: BorderRadius.full, borderWidth: 1 },
  categoryText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },

  section: { paddingHorizontal: Spacing.md, marginTop: Spacing.lg },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  sectionTitle: { fontSize: FontSize.base, fontWeight: FontWeight.bold, marginBottom: Spacing.sm },
  clearText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },

  recentRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.sm + 2 },
  recentText: { flex: 1, fontSize: FontSize.base },

  trendingGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  trendingChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full, borderWidth: 1 },
  trendingText: { fontSize: FontSize.sm },

  resultRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.md, borderRadius: BorderRadius.xl, borderWidth: 1, marginBottom: Spacing.sm },
  resultIcon: { width: 42, height: 42, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center' },
  resultTitle: { fontSize: FontSize.base, fontWeight: FontWeight.semibold },
  resultDesc: { fontSize: FontSize.xs, marginTop: 2 },

  emptyState: { alignItems: 'center', gap: Spacing.sm, paddingTop: Spacing.xxl, paddingHorizontal: Spacing.xl },
  emptyIcon: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  emptyQuery: { fontSize: FontSize.xl, fontWeight: FontWeight.extrabold },
  emptyHint: { fontSize: FontSize.base, textAlign: 'center' },
});
