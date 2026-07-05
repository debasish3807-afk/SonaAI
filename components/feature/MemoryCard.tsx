import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { Badge } from '@/components/ui/Badge';
import { BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/theme';
import type { Memory, MemoryCategory } from '@/stores/useMemoryStore';

const CATEGORY_COLORS: Record<MemoryCategory, string> = {
  personal: '#FF6B9D',
  work: '#6C63FF',
  learning: '#00D4FF',
  creative: '#FFD700',
  health: '#00E676',
};

interface MemoryCardProps {
  memory: Memory;
  onPress?: () => void;
  onPin?: () => void;
  onDelete?: () => void;
}

export const MemoryCard: React.FC<MemoryCardProps> = ({ memory, onPress, onPin, onDelete }) => {
  const { colors } = useTheme();
  const categoryColor = CATEGORY_COLORS[memory.category];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.cardBorder, opacity: pressed ? 0.9 : 1 },
      ]}
    >
      <View style={[styles.colorBar, { backgroundColor: categoryColor }]} />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>{memory.title}</Text>
          <View style={styles.actions}>
            {memory.isPinned ? (
              <Pressable onPress={onPin} hitSlop={8}>
                <MaterialIcons name="push-pin" size={16} color={colors.primary} />
              </Pressable>
            ) : (
              <Pressable onPress={onPin} hitSlop={8}>
                <MaterialIcons name="push-pin" size={16} color={colors.textMuted} />
              </Pressable>
            )}
            <Pressable onPress={onDelete} hitSlop={8}>
              <MaterialIcons name="delete-outline" size={16} color={colors.textMuted} />
            </Pressable>
          </View>
        </View>
        <Text style={[styles.content_text, { color: colors.textSecondary }]} numberOfLines={2}>
          {memory.content}
        </Text>
        <View style={styles.footer}>
          <Badge label={memory.category} variant="primary" />
          <View style={styles.tags}>
            {memory.tags.slice(0, 2).map(tag => (
              <Text key={tag} style={[styles.tag, { color: colors.textMuted }]}>#{tag}</Text>
            ))}
          </View>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: { flexDirection: 'row', borderRadius: BorderRadius.xl, borderWidth: 1, overflow: 'hidden', marginBottom: Spacing.sm },
  colorBar: { width: 4 },
  content: { flex: 1, padding: Spacing.md, gap: Spacing.xs },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, flex: 1 },
  actions: { flexDirection: 'row', gap: Spacing.sm },
  content_text: { fontSize: FontSize.sm, lineHeight: 20 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: Spacing.xs },
  tags: { flexDirection: 'row', gap: Spacing.xs },
  tag: { fontSize: FontSize.xs },
});
