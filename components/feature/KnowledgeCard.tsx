import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/theme';
import type { KnowledgeItem } from '@/stores/useAppStore';

const TYPE_ICONS: Record<KnowledgeItem['type'], keyof typeof MaterialIcons.glyphMap> = {
  document: 'description',
  url: 'link',
  note: 'sticky-note-2',
  image: 'image',
};

const TYPE_COLORS: Record<KnowledgeItem['type'], string> = {
  document: '#6C63FF',
  url: '#00D4FF',
  note: '#FFD700',
  image: '#FF6B9D',
};

interface KnowledgeCardProps {
  item: KnowledgeItem;
  onPress?: () => void;
  onDelete?: () => void;
}

export const KnowledgeCard: React.FC<KnowledgeCardProps> = ({ item, onPress, onDelete }) => {
  const { colors } = useTheme();
  const typeColor = TYPE_COLORS[item.type];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder, opacity: pressed ? 0.9 : 1 },
      ]}
    >
      <View style={[styles.iconBox, { backgroundColor: `${typeColor}22` }]}>
        <MaterialIcons name={TYPE_ICONS[item.type]} size={24} color={typeColor} />
      </View>
      <View style={styles.info}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
        <Text style={[styles.desc, { color: colors.textSecondary }]} numberOfLines={2}>{item.description}</Text>
        <View style={styles.meta}>
          {item.size ? <Text style={[styles.size, { color: colors.textMuted }]}>{item.size}</Text> : null}
          <View style={styles.tags}>
            {item.tags.slice(0, 2).map(t => (
              <View key={t} style={[styles.tagBadge, { backgroundColor: `${colors.primary}22` }]}>
                <Text style={[styles.tagText, { color: colors.primary }]}>{t}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
      <Pressable onPress={onDelete} hitSlop={8} style={styles.deleteBtn}>
        <MaterialIcons name="more-vert" size={20} color={colors.textMuted} />
      </Pressable>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', borderRadius: BorderRadius.xl, borderWidth: 1, padding: Spacing.md, marginBottom: Spacing.sm, gap: Spacing.md },
  iconBox: { width: 48, height: 48, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1, gap: 4 },
  title: { fontSize: FontSize.base, fontWeight: FontWeight.semibold },
  desc: { fontSize: FontSize.sm, lineHeight: 18 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: 4 },
  size: { fontSize: FontSize.xs },
  tags: { flexDirection: 'row', gap: Spacing.xs },
  tagBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.full },
  tagText: { fontSize: FontSize.xs, fontWeight: '600' },
  deleteBtn: { padding: Spacing.xs },
});
