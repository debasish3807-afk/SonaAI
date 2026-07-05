import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView,
  Animated, TextInput, Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/theme';
import { PageHeader } from '@/components/ui/PageHeader';
import { MOCK_PROMPTS, PromptCategory, PromptTemplate } from '@/services/ai-providers.service';

const { width } = Dimensions.get('window');

const CATEGORIES: Array<{ key: PromptCategory | 'all'; label: string; icon: string; color: string }> = [
  { key: 'all', label: 'All', icon: 'layers', color: '#7C6FFF' },
  { key: 'coding', label: 'Coding', icon: 'code', color: '#00D4FF' },
  { key: 'writing', label: 'Writing', icon: 'edit', color: '#FF6B9D' },
  { key: 'business', label: 'Business', icon: 'business-center', color: '#FF9800' },
  { key: 'creative', label: 'Creative', icon: 'auto-stories', color: '#F5C842' },
  { key: 'analysis', label: 'Analysis', icon: 'analytics', color: '#00E676' },
  { key: 'education', label: 'Education', icon: 'school', color: '#9C27B0' },
  { key: 'image', label: 'Image', icon: 'auto-fix-high', color: '#7C6FFF' },
  { key: 'productivity', label: 'Productivity', icon: 'task-alt', color: '#4CAF50' },
];

export default function PromptLibraryScreen() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<PromptCategory | 'all'>('all');
  const [expandedPrompt, setExpandedPrompt] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set(['p5', 'p7']));

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }).start();
  }, []);

  const filtered = MOCK_PROMPTS.filter(p => {
    const matchCat = activeCategory === 'all' || p.category === activeCategory;
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.tags.some(t => t.includes(search.toLowerCase()));
    return matchCat && matchSearch;
  });

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleUsePrompt = (prompt: PromptTemplate) => {
    router.push('/(tabs)/chat' as any);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <Animated.View style={[styles.flex, { opacity: fadeAnim }]}>
        <PageHeader
          title="Prompt Library"
          subtitle={`${MOCK_PROMPTS.length} templates`}
          actions={[{ icon: 'bookmark', onPress: () => {} }]}
        />

        {/* Search */}
        <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <MaterialIcons name="search" size={20} color={colors.primary} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search prompts, tags..."
            placeholderTextColor={colors.textMuted}
            style={[styles.searchInput, { color: colors.text }]}
          />
          {search ? (
            <Pressable onPress={() => setSearch('')} hitSlop={8}>
              <MaterialIcons name="cancel" size={18} color={colors.textMuted} />
            </Pressable>
          ) : null}
        </View>

        {/* Categories */}
        <View style={styles.catContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catContent}>
            {CATEGORIES.map(cat => {
              const isActive = activeCategory === cat.key;
              return (
                <Pressable
                  key={cat.key}
                  onPress={() => setActiveCategory(cat.key)}
                  style={({ pressed }) => [
                    styles.catChip,
                    isActive
                      ? { backgroundColor: cat.color, borderColor: cat.color }
                      : { backgroundColor: colors.card, borderColor: colors.cardBorder },
                    { opacity: pressed ? 0.8 : 1 },
                  ]}
                >
                  <MaterialIcons name={cat.icon as any} size={13} color={isActive ? '#fff' : colors.textMuted} />
                  <Text style={[styles.catText, { color: isActive ? '#fff' : colors.textSecondary }]}>{cat.label}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
          {filtered.map(prompt => {
            const isExpanded = expandedPrompt === prompt.id;
            const isFav = favorites.has(prompt.id);
            return (
              <Pressable
                key={prompt.id}
                onPress={() => setExpandedPrompt(isExpanded ? null : prompt.id)}
                style={({ pressed }) => [
                  styles.promptCard,
                  { backgroundColor: colors.card, borderColor: colors.cardBorder, opacity: pressed ? 0.92 : 1 },
                ]}
              >
                {/* Card Header */}
                <View style={styles.cardHeader}>
                  <LinearGradient colors={[prompt.color, `${prompt.color}99`]} style={styles.promptIcon}>
                    <MaterialIcons name={prompt.icon as any} size={20} color="#fff" />
                  </LinearGradient>
                  <View style={styles.cardTitle}>
                    <Text style={[styles.promptTitle, { color: colors.text }]}>{prompt.title}</Text>
                    <Text style={[styles.promptDesc, { color: colors.textSecondary }]} numberOfLines={1}>{prompt.description}</Text>
                  </View>
                  <Pressable onPress={() => toggleFavorite(prompt.id)} hitSlop={8}>
                    <MaterialIcons name={isFav ? 'bookmark' : 'bookmark-border'} size={20} color={isFav ? prompt.color : colors.textMuted} />
                  </Pressable>
                </View>

                {/* Stats Row */}
                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <MaterialIcons name="trending-up" size={13} color={colors.textMuted} />
                    <Text style={[styles.statText, { color: colors.textMuted }]}>{(prompt.usageCount / 1000).toFixed(1)}k uses</Text>
                  </View>
                  {prompt.rating ? (
                    <View style={styles.statItem}>
                      <MaterialIcons name="star" size={13} color="#F5C842" />
                      <Text style={[styles.statText, { color: colors.textMuted }]}>{prompt.rating}</Text>
                    </View>
                  ) : null}
                  {prompt.variables ? (
                    <View style={styles.statItem}>
                      <MaterialIcons name="tune" size={13} color={colors.textMuted} />
                      <Text style={[styles.statText, { color: colors.textMuted }]}>{prompt.variables.length} vars</Text>
                    </View>
                  ) : null}
                  <View style={[styles.catTag, { backgroundColor: `${prompt.color}18`, borderColor: `${prompt.color}30` }]}>
                    <Text style={[styles.catTagText, { color: prompt.color }]}>{prompt.category}</Text>
                  </View>
                </View>

                {/* Expanded */}
                {isExpanded ? (
                  <View style={styles.expanded}>
                    {/* Tags */}
                    <View style={styles.tagRow}>
                      {prompt.tags.map(tag => (
                        <View key={tag} style={[styles.tag, { backgroundColor: colors.cardBorder }]}>
                          <Text style={[styles.tagText, { color: colors.textSecondary }]}>#{tag}</Text>
                        </View>
                      ))}
                    </View>

                    {/* Prompt Preview */}
                    <View style={[styles.promptPreview, { backgroundColor: isDark ? '#0F0F1A' : '#F5F5FF', borderColor: colors.border }]}>
                      <Text style={[styles.promptText, { color: colors.textSecondary }]} numberOfLines={4}>
                        {prompt.prompt}
                      </Text>
                    </View>

                    {/* Variables */}
                    {prompt.variables && prompt.variables.length > 0 ? (
                      <View style={styles.varSection}>
                        <Text style={[styles.varTitle, { color: colors.textMuted }]}>VARIABLES</Text>
                        {prompt.variables.map(v => (
                          <View key={v.name} style={[styles.varRow, { backgroundColor: colors.cardBorder }]}>
                            <View style={[styles.varDot, { backgroundColor: prompt.color }]} />
                            <Text style={[styles.varName, { color: colors.text }]}>{v.label}</Text>
                            <Text style={[styles.varType, { color: colors.textMuted }]}>{v.type}</Text>
                            {v.required ? <View style={styles.reqDot}><Text style={styles.reqText}>required</Text></View> : null}
                          </View>
                        ))}
                      </View>
                    ) : null}

                    {/* Actions */}
                    <View style={styles.cardActions}>
                      <Pressable
                        onPress={() => handleUsePrompt(prompt)}
                        style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1, flex: 1 }]}
                      >
                        <LinearGradient
                          colors={[prompt.color, `${prompt.color}CC`]}
                          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                          style={styles.useBtn}
                        >
                          <MaterialIcons name="send" size={16} color="#fff" />
                          <Text style={styles.useBtnText}>Use Prompt</Text>
                        </LinearGradient>
                      </Pressable>
                      <Pressable style={({ pressed }) => [styles.copyBtn, { backgroundColor: colors.cardBorder, opacity: pressed ? 0.8 : 1 }]}>
                        <MaterialIcons name="content-copy" size={16} color={colors.textSecondary} />
                      </Pressable>
                    </View>
                  </View>
                ) : null}
              </Pressable>
            );
          })}
          <View style={{ height: 32 }} />
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
  },
  searchInput: { flex: 1, fontSize: FontSize.base, includeFontPadding: false },
  catContainer: { maxHeight: 48 },
  catContent: { paddingHorizontal: Spacing.md, gap: Spacing.sm, alignItems: 'center' },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  catText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  list: { paddingHorizontal: Spacing.md, paddingTop: Spacing.md },
  promptCard: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  promptIcon: { width: 46, height: 46, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { flex: 1 },
  promptTitle: { fontSize: FontSize.base, fontWeight: FontWeight.bold },
  promptDesc: { fontSize: FontSize.sm, marginTop: 2 },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flexWrap: 'wrap' },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statText: { fontSize: FontSize.xs },
  catTag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: BorderRadius.full, borderWidth: 1, marginLeft: 'auto' as any },
  catTagText: { fontSize: FontSize.xxs + 1, fontWeight: FontWeight.semibold },
  expanded: { gap: Spacing.sm, marginTop: Spacing.xs },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  tag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: BorderRadius.full },
  tagText: { fontSize: FontSize.xxs + 1 },
  promptPreview: { padding: Spacing.md, borderRadius: BorderRadius.lg, borderWidth: 1 },
  promptText: { fontSize: FontSize.sm, lineHeight: 20, fontFamily: 'monospace' as any },
  varSection: { gap: Spacing.xs },
  varTitle: { fontSize: FontSize.xxs + 1, fontWeight: FontWeight.bold, letterSpacing: 1 },
  varRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingHorizontal: Spacing.sm + 2, paddingVertical: Spacing.sm, borderRadius: BorderRadius.md },
  varDot: { width: 6, height: 6, borderRadius: 3 },
  varName: { flex: 1, fontSize: FontSize.sm, fontWeight: FontWeight.medium },
  varType: { fontSize: FontSize.xs },
  reqDot: { backgroundColor: '#FF5252', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 99 },
  reqText: { fontSize: FontSize.xxs, color: '#fff', fontWeight: FontWeight.bold },
  cardActions: { flexDirection: 'row', gap: Spacing.sm },
  useBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, paddingVertical: Spacing.sm + 2, borderRadius: BorderRadius.xl },
  useBtnText: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: '#fff' },
  copyBtn: { width: 46, height: 46, borderRadius: BorderRadius.xl, alignItems: 'center', justifyContent: 'center' },
});
