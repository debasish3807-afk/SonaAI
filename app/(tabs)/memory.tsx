import React, { useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, Pressable, Modal,
  TextInput, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/hooks/useTheme';
import { useMemory } from '@/hooks/useMemory';
import { MemoryCard } from '@/components/feature/MemoryCard';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/theme';
import type { MemoryCategory } from '@/stores/useMemoryStore';

const CATEGORIES: { key: MemoryCategory | 'all'; label: string; icon: string; color: string }[] = [
  { key: 'all', label: 'All', icon: 'apps', color: '#6C63FF' },
  { key: 'personal', label: 'Personal', icon: 'person', color: '#FF6B9D' },
  { key: 'work', label: 'Work', icon: 'work', color: '#6C63FF' },
  { key: 'learning', label: 'Learning', icon: 'school', color: '#00D4FF' },
  { key: 'creative', label: 'Creative', icon: 'palette', color: '#FFD700' },
  { key: 'health', label: 'Health', icon: 'favorite', color: '#00E676' },
];

export default function MemoryScreen() {
  const { colors } = useTheme();
  const { memories, searchQuery, activeCategory, addMemory, deleteMemory, togglePin, setSearch, setCategory } = useMemory();
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<MemoryCategory>('personal');
  const [newTags, setNewTags] = useState('');

  const handleAdd = () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    addMemory({
      title: newTitle.trim(),
      content: newContent.trim(),
      category: newCategory,
      tags: newTags.split(',').map(t => t.trim()).filter(Boolean),
      isPinned: false,
    });
    setNewTitle(''); setNewContent(''); setNewTags(''); setNewCategory('personal');
    setShowAdd(false);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>Memory</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{memories.length} memories stored</Text>
        </View>
        <Pressable
          onPress={() => setShowAdd(true)}
          style={({ pressed }) => [styles.addBtn, { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 }]}
        >
          <MaterialIcons name="add" size={24} color="#fff" />
        </Pressable>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Input
          placeholder="Search memories..."
          value={searchQuery}
          onChangeText={setSearch}
          leftIcon="search"
        />
      </View>

      {/* Categories */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categories}>
        {CATEGORIES.map(cat => (
          <Pressable
            key={cat.key}
            onPress={() => setCategory(cat.key)}
            style={[
              styles.categoryChip,
              { backgroundColor: activeCategory === cat.key ? cat.color : colors.card, borderColor: activeCategory === cat.key ? cat.color : colors.border },
            ]}
          >
            <MaterialIcons name={cat.icon as any} size={14} color={activeCategory === cat.key ? '#fff' : colors.textSecondary} />
            <Text style={[styles.categoryLabel, { color: activeCategory === cat.key ? '#fff' : colors.textSecondary }]}>
              {cat.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Memories */}
      {memories.length === 0 ? (
        <View style={styles.empty}>
          <LinearGradient colors={['#6C63FF22', '#00D4FF11']} style={styles.emptyIcon}>
            <MaterialIcons name="psychology" size={40} color="#6C63FF" />
          </LinearGradient>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No memories yet</Text>
          <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>Start storing your knowledge and insights</Text>
        </View>
      ) : (
        <FlatList
          data={memories}
          keyExtractor={m => m.id}
          renderItem={({ item }) => (
            <MemoryCard
              memory={item}
              onPin={() => togglePin(item.id)}
              onDelete={() => deleteMemory(item.id)}
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Add Modal */}
      <Modal visible={showAdd} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setShowAdd(false)} />
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHandle} />
            <Text style={[styles.modalTitle, { color: colors.text }]}>New Memory</Text>

            <Input label="Title" placeholder="Memory title..." value={newTitle} onChangeText={setNewTitle} />
            <Input label="Content" placeholder="What do you want to remember?" value={newContent} onChangeText={setNewContent} multiline numberOfLines={4} style={{ marginTop: Spacing.md }} />
            <Input label="Tags (comma separated)" placeholder="tag1, tag2, tag3" value={newTags} onChangeText={setNewTags} style={{ marginTop: Spacing.md }} />

            <Text style={[styles.catLabel, { color: colors.textSecondary }]}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: Spacing.sm }}>
              <View style={styles.catRow}>
                {CATEGORIES.filter(c => c.key !== 'all').map(cat => (
                  <Pressable
                    key={cat.key}
                    onPress={() => setNewCategory(cat.key as MemoryCategory)}
                    style={[styles.catBtn, { backgroundColor: newCategory === cat.key ? cat.color : colors.card, borderColor: cat.color }]}
                  >
                    <Text style={[styles.catBtnText, { color: newCategory === cat.key ? '#fff' : cat.color }]}>{cat.label}</Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <Button label="Cancel" onPress={() => setShowAdd(false)} variant="ghost" style={{ flex: 1 }} />
              <Button label="Save Memory" onPress={handleAdd} style={{ flex: 2 }} />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.md, paddingTop: Spacing.md, paddingBottom: Spacing.sm },
  title: { fontSize: FontSize.xxl, fontWeight: FontWeight.extrabold },
  subtitle: { fontSize: FontSize.sm, marginTop: 2 },
  addBtn: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  searchContainer: { paddingHorizontal: Spacing.md, marginBottom: Spacing.sm },
  categories: { paddingHorizontal: Spacing.md, gap: Spacing.sm, paddingBottom: Spacing.sm },
  categoryChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full, borderWidth: 1 },
  categoryLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.medium },
  list: { paddingHorizontal: Spacing.md, paddingBottom: 24 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  emptyIcon: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold },
  emptyDesc: { fontSize: FontSize.sm, textAlign: 'center' },
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { flex: 1 },
  modalContent: { borderTopLeftRadius: BorderRadius.xxl, borderTopRightRadius: BorderRadius.xxl, padding: Spacing.lg, gap: Spacing.md },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#ccc', alignSelf: 'center', marginBottom: Spacing.sm },
  modalTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold },
  catLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.medium },
  catRow: { flexDirection: 'row', gap: Spacing.sm },
  catBtn: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full, borderWidth: 1 },
  catBtnText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  modalActions: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.sm },
});
