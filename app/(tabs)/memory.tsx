import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, FlatList, StyleSheet, Pressable, Modal,
  TextInput, ScrollView, KeyboardAvoidingView, Platform, Animated,
  RefreshControl,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/hooks/useTheme';
import { useMemory } from '@/hooks/useMemory';
import { MemoryCard } from '@/components/feature/MemoryCard';
import { Input } from '@/components/ui/Input';
import { PremiumButton } from '@/components/ui/PremiumButton';
import { Badge } from '@/components/ui/Badge';
import { SkeletonList } from '@/components/ui/SkeletonLoader';
import { BorderRadius, FontSize, FontWeight, Shadow, Spacing } from '@/constants/theme';
import type { MemoryCategory, ImportanceLevel, SortMode, MemoryStatus } from '@/stores/useMemoryStore';

const CATEGORIES = [
  { key: 'all' as const, label: 'All', icon: 'apps', color: '#7C6FFF' },
  { key: 'personal' as const, label: 'Personal', icon: 'person', color: '#FF6B9D' },
  { key: 'work' as const, label: 'Work', icon: 'work', color: '#7C6FFF' },
  { key: 'study' as const, label: 'Study', icon: 'school', color: '#00D4FF' },
  { key: 'finance' as const, label: 'Finance', icon: 'account-balance-wallet', color: '#F5C842' },
  { key: 'health' as const, label: 'Health', icon: 'favorite', color: '#00E676' },
  { key: 'travel' as const, label: 'Travel', icon: 'flight', color: '#FF9800' },
  { key: 'shopping' as const, label: 'Shopping', icon: 'shopping-bag', color: '#E91E63' },
  { key: 'ideas' as const, label: 'Ideas', icon: 'lightbulb', color: '#FFEB3B' },
  { key: 'tasks' as const, label: 'Tasks', icon: 'check-circle', color: '#8BC34A' },
  { key: 'other' as const, label: 'Other', icon: 'more-horiz', color: '#9E9E9E' },
];

export default function MemoryScreen() {
  const { colors, isDark } = useTheme();
  const { memories, searchQuery, activeCategory, sortMode, viewMode, addMemory, updateMemory, deleteMemory, togglePin, toggleFavorite, trashMemory, restoreMemory, archiveMemory, setSearch, setCategory, setSortMode, setViewMode, isLoading } = useMemory();
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editingMemory, setEditingMemory] = useState<import('@/stores/useMemoryStore').Memory | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<MemoryCategory>('personal');
  const [newTags, setNewTags] = useState('');
  const [newImportance, setNewImportance] = useState<ImportanceLevel>('medium');
  const [newFavorite, setNewFavorite] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editCategory, setEditCategory] = useState<MemoryCategory>('personal');
  const [editTags, setEditTags] = useState('');
  const [editImportance, setEditImportance] = useState<ImportanceLevel>('medium');
  const [editFavorite, setEditFavorite] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const modalSlide = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  useEffect(() => {
    if (showAdd) {
      Animated.spring(modalSlide, { toValue: 0, tension: 65, friction: 9, useNativeDriver: true }).start();
    } else {
      modalSlide.setValue(300);
    }
  }, [showAdd]);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Re-initialize Firestore listener to force-refresh data
    const store = require('@/stores/useMemoryStore').useMemoryStore.getState();
    store.cleanup();
    store.initialize();
    // Brief delay for UI feedback
    await new Promise(r => setTimeout(r, 800));
    setRefreshing(false);
  };

  const handleAdd = () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    addMemory({
      title: newTitle.trim(),
      content: newContent.trim(),
      category: newCategory,
      importance: newImportance,
      isFavorite: newFavorite,
      tags: newTags.split(',').map(t => t.trim()).filter(Boolean),
      isPinned: false,
      status: 'active',
      isLocked: false,
      attachments: [],
    });
    setNewTitle(''); setNewContent(''); setNewTags(''); setNewCategory('personal');
    setNewImportance('medium'); setNewFavorite(false);
    setShowAdd(false);
  };

  const handleOpenEdit = (memory: import('@/stores/useMemoryStore').Memory) => {
    setEditingMemory(memory);
    setEditTitle(memory.title);
    setEditContent(memory.content);
    setEditCategory(memory.category);
    setEditTags(memory.tags.join(', '));
    setEditImportance(memory.importance ?? 'medium');
    setEditFavorite(memory.isFavorite ?? false);
    setShowEdit(true);
  };

  const handleSaveEdit = () => {
    if (!editingMemory || !editTitle.trim() || !editContent.trim()) return;
    updateMemory(editingMemory.id, {
      title: editTitle.trim(),
      content: editContent.trim(),
      category: editCategory,
      importance: editImportance,
      isFavorite: editFavorite,
      tags: editTags.split(',').map(t => t.trim()).filter(Boolean),
    });
    setShowEdit(false);
    setEditingMemory(null);
  };

  const pinnedMemories = memories.filter(m => m.isPinned);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <Animated.View style={[styles.flex, { opacity: fadeAnim }]}>
        {/* ── Header ── */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.title, { color: colors.text }]}>Memory</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{memories.length} memories stored</Text>
          </View>
          <Pressable
            onPress={() => setShowAdd(true)}
            style={({ pressed }) => [styles.addBtn, { opacity: pressed ? 0.8 : 1, ...Shadow.md }]}
          >
            <LinearGradient colors={['#7C6FFF', '#4A42CC']} style={styles.addBtnInner}>
              <MaterialIcons name="add" size={24} color="#fff" />
            </LinearGradient>
          </Pressable>
        </View>

        {/* ── Search ── */}
        <View style={styles.searchWrapper}>
          <Input
            placeholder="Search memories..."
            value={searchQuery}
            onChangeText={setSearch}
            leftIcon="search"
          />
        </View>

        {/* ── Sort ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sortRow}
        >
          {([
            { key: 'newest', label: 'Newest', icon: 'schedule' },
            { key: 'oldest', label: 'Oldest', icon: 'history' },
            { key: 'importance', label: 'Importance', icon: 'priority-high' },
            { key: 'favorites', label: 'Favorites', icon: 'star' },
          ] as const).map(s => (
            <Pressable
              key={s.key}
              onPress={() => setSortMode(s.key)}
              style={({ pressed }) => [
                styles.sortChip,
                {
                  backgroundColor: sortMode === s.key ? `${colors.primary}18` : 'transparent',
                  borderColor: sortMode === s.key ? colors.primary : colors.cardBorder,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <MaterialIcons name={s.icon as any} size={13} color={sortMode === s.key ? colors.primary : colors.textMuted} />
              <Text style={{ fontSize: 11, fontWeight: '600', color: sortMode === s.key ? colors.primary : colors.textMuted }}>{s.label}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* ── Category Pills ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categories}
        >
          {CATEGORIES.map(cat => {
            const isActive = activeCategory === cat.key;
            return (
              <Pressable
                key={cat.key}
                onPress={() => setCategory(cat.key)}
                style={({ pressed }) => [
                  styles.categoryChip,
                  isActive
                    ? { backgroundColor: cat.color, borderColor: cat.color, ...Shadow.sm }
                    : { backgroundColor: colors.card, borderColor: colors.cardBorder },
                  { opacity: pressed ? 0.85 : 1 },
                ]}
              >
                <MaterialIcons name={cat.icon as any} size={14} color={isActive ? '#fff' : colors.textSecondary} />
                <Text style={[styles.categoryLabel, { color: isActive ? '#fff' : colors.textSecondary }]}>
                  {cat.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* ── List ── */}
        {isLoading ? (
          <SkeletonList count={4} />
        ) : memories.length === 0 ? (
          <View style={styles.empty}>
            <LinearGradient colors={['#7C6FFF33', '#00D4FF11']} style={styles.emptyIcon}>
              <MaterialIcons name="psychology" size={44} color={colors.primary} />
            </LinearGradient>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No memories yet</Text>
            <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
              Start capturing your knowledge and insights
            </Text>
            <PremiumButton
              label="Add First Memory"
              onPress={() => setShowAdd(true)}
              icon="add"
              size="md"
            />
          </View>
        ) : (
          <FlatList
            data={memories}
            keyExtractor={m => m.id}
            renderItem={({ item }) => (
              <MemoryCard
                memory={item}
                onPress={() => handleOpenEdit(item)}
                onPin={() => togglePin(item.id)}
                onFavorite={() => toggleFavorite(item.id)}
                onDelete={() => deleteMemory(item.id)}
              />
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
            ListHeaderComponent={
              pinnedMemories.length > 0 ? (
                <View style={styles.sectionLabel}>
                  <MaterialIcons name="push-pin" size={13} color={colors.primary} />
                  <Text style={[styles.sectionLabelText, { color: colors.primary }]}>Pinned</Text>
                </View>
              ) : null
            }
          />
        )}
      </Animated.View>

      {/* ── Add Memory Sheet ── */}
      <Modal visible={showAdd} animationType="fade" transparent statusBarTranslucent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setShowAdd(false)} />
          <Animated.View
            style={[
              styles.modalContent,
              { backgroundColor: colors.surface, transform: [{ translateY: modalSlide }] },
            ]}
          >
            <View style={[styles.modalHandle, { backgroundColor: colors.border }]} />

            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>New Memory</Text>
              <Pressable
                onPress={() => setShowAdd(false)}
                style={({ pressed }) => [styles.closeBtn, { backgroundColor: colors.card, opacity: pressed ? 0.7 : 1 }]}
              >
                <MaterialIcons name="close" size={18} color={colors.textSecondary} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Input
                label="Title"
                placeholder="Give this memory a title..."
                value={newTitle}
                onChangeText={setNewTitle}
                leftIcon="title"
              />

              <View style={{ height: Spacing.md }} />
              <Input
                label="Content"
                placeholder="What do you want to remember?"
                value={newContent}
                onChangeText={setNewContent}
                multiline
                numberOfLines={4}
              />

              <View style={{ height: Spacing.md }} />
              <Input
                label="Tags"
                placeholder="react, goals, health (comma separated)"
                value={newTags}
                onChangeText={setNewTags}
                leftIcon="label"
                hint="Separate tags with commas"
              />

              <Text style={[styles.catSectionLabel, { color: colors.textSecondary }]}>Category</Text>
              <View style={styles.catGrid}>
                {CATEGORIES.filter(c => c.key !== 'all').map(cat => (
                  <Pressable
                    key={cat.key}
                    onPress={() => setNewCategory(cat.key as MemoryCategory)}
                    style={[
                      styles.catBtn,
                      {
                        backgroundColor: newCategory === cat.key ? `${cat.color}22` : colors.card,
                        borderColor: newCategory === cat.key ? cat.color : colors.cardBorder,
                        borderWidth: newCategory === cat.key ? 1.5 : 1,
                      },
                    ]}
                  >
                    <MaterialIcons name={cat.icon as any} size={16} color={newCategory === cat.key ? cat.color : colors.textMuted} />
                    <Text style={[styles.catBtnText, { color: newCategory === cat.key ? cat.color : colors.textSecondary }]}>
                      {cat.label}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Text style={[styles.catSectionLabel, { color: colors.textSecondary }]}>Importance</Text>
              <View style={styles.catGrid}>
                {(['low', 'medium', 'high'] as const).map(level => {
                  const cfg = { low: { color: '#8BC34A', icon: 'arrow-downward' }, medium: { color: '#FF9800', icon: 'remove' }, high: { color: '#F44336', icon: 'arrow-upward' } }[level];
                  return (
                    <Pressable key={level} onPress={() => setNewImportance(level)} style={[styles.catBtn, { backgroundColor: newImportance === level ? `${cfg.color}22` : colors.card, borderColor: newImportance === level ? cfg.color : colors.cardBorder, borderWidth: newImportance === level ? 1.5 : 1 }]}>
                      <MaterialIcons name={cfg.icon as any} size={16} color={newImportance === level ? cfg.color : colors.textMuted} />
                      <Text style={[styles.catBtnText, { color: newImportance === level ? cfg.color : colors.textSecondary }]}>{level.charAt(0).toUpperCase() + level.slice(1)}</Text>
                    </Pressable>
                  );
                })}
              </View>

              <Pressable onPress={() => setNewFavorite(!newFavorite)} style={[styles.catBtn, { marginTop: Spacing.md, backgroundColor: newFavorite ? '#FFD60A22' : colors.card, borderColor: newFavorite ? '#FFD60A' : colors.cardBorder, borderWidth: newFavorite ? 1.5 : 1, alignSelf: 'flex-start' }]}>
                <MaterialIcons name={newFavorite ? 'star' : 'star-border'} size={16} color={newFavorite ? '#FFD60A' : colors.textMuted} />
                <Text style={[styles.catBtnText, { color: newFavorite ? '#FFD60A' : colors.textSecondary }]}>Favorite</Text>
              </Pressable>
            </ScrollView>

            <View style={styles.modalActions}>
              <PremiumButton
                label="Cancel"
                onPress={() => setShowAdd(false)}
                variant="outline"
                style={{ flex: 1 }}
              />
              <PremiumButton
                label="Save Memory"
                onPress={handleAdd}
                icon="check"
                style={{ flex: 2 }}
              />
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── Edit Memory Sheet ── */}
      <Modal visible={showEdit} animationType="fade" transparent statusBarTranslucent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setShowEdit(false)} />
          <Animated.View
            style={[
              styles.modalContent,
              { backgroundColor: colors.surface },
            ]}
          >
            <View style={[styles.modalHandle, { backgroundColor: colors.border }]} />

            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Memory</Text>
              <Pressable
                onPress={() => setShowEdit(false)}
                style={({ pressed }) => [styles.closeBtn, { backgroundColor: colors.card, opacity: pressed ? 0.7 : 1 }]}
              >
                <MaterialIcons name="close" size={18} color={colors.textSecondary} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Input
                label="Title"
                placeholder="Give this memory a title..."
                value={editTitle}
                onChangeText={setEditTitle}
                leftIcon="title"
              />

              <View style={{ height: Spacing.md }} />
              <Input
                label="Content"
                placeholder="What do you want to remember?"
                value={editContent}
                onChangeText={setEditContent}
                multiline
                numberOfLines={4}
              />

              <View style={{ height: Spacing.md }} />
              <Input
                label="Tags"
                placeholder="react, goals, health (comma separated)"
                value={editTags}
                onChangeText={setEditTags}
                leftIcon="label"
                hint="Separate tags with commas"
              />

              <Text style={[styles.catSectionLabel, { color: colors.textSecondary }]}>Category</Text>
              <View style={styles.catGrid}>
                {CATEGORIES.filter(c => c.key !== 'all').map(cat => (
                  <Pressable
                    key={cat.key}
                    onPress={() => setEditCategory(cat.key as MemoryCategory)}
                    style={[
                      styles.catBtn,
                      {
                        backgroundColor: editCategory === cat.key ? `${cat.color}22` : colors.card,
                        borderColor: editCategory === cat.key ? cat.color : colors.cardBorder,
                        borderWidth: editCategory === cat.key ? 1.5 : 1,
                      },
                    ]}
                  >
                    <MaterialIcons name={cat.icon as any} size={16} color={editCategory === cat.key ? cat.color : colors.textMuted} />
                    <Text style={[styles.catBtnText, { color: editCategory === cat.key ? cat.color : colors.textSecondary }]}>
                      {cat.label}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Text style={[styles.catSectionLabel, { color: colors.textSecondary }]}>Importance</Text>
              <View style={styles.catGrid}>
                {(['low', 'medium', 'high'] as const).map(level => {
                  const cfg = { low: { color: '#8BC34A', icon: 'arrow-downward' }, medium: { color: '#FF9800', icon: 'remove' }, high: { color: '#F44336', icon: 'arrow-upward' } }[level];
                  return (
                    <Pressable key={level} onPress={() => setEditImportance(level)} style={[styles.catBtn, { backgroundColor: editImportance === level ? `${cfg.color}22` : colors.card, borderColor: editImportance === level ? cfg.color : colors.cardBorder, borderWidth: editImportance === level ? 1.5 : 1 }]}>
                      <MaterialIcons name={cfg.icon as any} size={16} color={editImportance === level ? cfg.color : colors.textMuted} />
                      <Text style={[styles.catBtnText, { color: editImportance === level ? cfg.color : colors.textSecondary }]}>{level.charAt(0).toUpperCase() + level.slice(1)}</Text>
                    </Pressable>
                  );
                })}
              </View>

              <Pressable onPress={() => setEditFavorite(!editFavorite)} style={[styles.catBtn, { marginTop: Spacing.md, backgroundColor: editFavorite ? '#FFD60A22' : colors.card, borderColor: editFavorite ? '#FFD60A' : colors.cardBorder, borderWidth: editFavorite ? 1.5 : 1, alignSelf: 'flex-start' }]}>
                <MaterialIcons name={editFavorite ? 'star' : 'star-border'} size={16} color={editFavorite ? '#FFD60A' : colors.textMuted} />
                <Text style={[styles.catBtnText, { color: editFavorite ? '#FFD60A' : colors.textSecondary }]}>Favorite</Text>
              </Pressable>
            </ScrollView>

            <View style={styles.modalActions}>
              <PremiumButton
                label="Cancel"
                onPress={() => setShowEdit(false)}
                variant="outline"
                style={{ flex: 1 }}
              />
              <PremiumButton
                label="Save Changes"
                onPress={handleSaveEdit}
                icon="check"
                style={{ flex: 2 }}
              />
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  title: { fontSize: FontSize.xxl, fontWeight: FontWeight.extrabold },
  subtitle: { fontSize: FontSize.sm, marginTop: 2 },
  addBtn: { borderRadius: 26 },
  addBtnInner: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  searchWrapper: { paddingHorizontal: Spacing.md, marginBottom: Spacing.sm },
  sortRow: { paddingHorizontal: Spacing.md, gap: Spacing.xs, marginBottom: Spacing.sm },
  sortChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  categories: { paddingHorizontal: Spacing.md, gap: Spacing.sm, paddingBottom: Spacing.md },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  categoryLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  list: { paddingHorizontal: Spacing.md, paddingBottom: 32 },
  sectionLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: Spacing.sm,
  },
  sectionLabelText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, textTransform: 'uppercase', letterSpacing: 0.8 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md, padding: Spacing.xl },
  emptyIcon: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold },
  emptyDesc: { fontSize: FontSize.base, textAlign: 'center', lineHeight: 24, maxWidth: 260 },

  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)' },
  modalContent: {
    borderTopLeftRadius: BorderRadius.xxxl,
    borderTopRightRadius: BorderRadius.xxxl,
    padding: Spacing.lg,
    maxHeight: '90%',
  },
  modalHandle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: Spacing.md },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
  modalTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold },
  closeBtn: { width: 34, height: 34, borderRadius: BorderRadius.sm, alignItems: 'center', justifyContent: 'center' },
  catSectionLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, marginTop: Spacing.md, marginBottom: Spacing.sm },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  catBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  catBtnText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  modalActions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.lg },
});
