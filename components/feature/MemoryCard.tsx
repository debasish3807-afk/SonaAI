import React, { useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/hooks/useTheme';
import { Badge } from '@/components/ui/Badge';
import { BorderRadius, FontSize, FontWeight, Spacing, Shadow } from '@/constants/theme';
import type { Memory, MemoryCategory, ImportanceLevel } from '@/stores/useMemoryStore';

const CATEGORY_CONFIG: Record<MemoryCategory, { color: string; icon: string; gradient: [string, string] }> = {
  personal: { color: '#FF6B9D', icon: 'person', gradient: ['#FF6B9D', '#CC3366'] },
  work: { color: '#7C6FFF', icon: 'work', gradient: ['#7C6FFF', '#4A42CC'] },
  study: { color: '#00D4FF', icon: 'school', gradient: ['#00D4FF', '#0099CC'] },
  finance: { color: '#F5C842', icon: 'account-balance-wallet', gradient: ['#F5C842', '#D4A000'] },
  health: { color: '#00E676', icon: 'favorite', gradient: ['#00E676', '#00AA55'] },
  travel: { color: '#FF9800', icon: 'flight', gradient: ['#FF9800', '#E65100'] },
  shopping: { color: '#E91E63', icon: 'shopping-bag', gradient: ['#E91E63', '#AD1457'] },
  ideas: { color: '#FFEB3B', icon: 'lightbulb', gradient: ['#FFEB3B', '#F9A825'] },
  tasks: { color: '#8BC34A', icon: 'check-circle', gradient: ['#8BC34A', '#558B2F'] },
  other: { color: '#9E9E9E', icon: 'more-horiz', gradient: ['#9E9E9E', '#616161'] },
};

interface MemoryCardProps {
  memory: Memory;
  onPress?: () => void;
  onPin?: () => void;
  onDelete?: () => void;
  onFavorite?: () => void;
}

export const MemoryCard: React.FC<MemoryCardProps> = ({ memory, onPress, onPin, onDelete, onFavorite }) => {
  const { colors } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;
  const cfg = CATEGORY_CONFIG[memory.category];

  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.975, useNativeDriver: true, tension: 90, friction: 10 }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 65, friction: 9 }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View
        style={[
          styles.card,
          { backgroundColor: colors.card, borderColor: colors.cardBorder, transform: [{ scale }] },
          memory.isPinned ? { borderColor: `${cfg.color}55`, ...Shadow.sm } : {},
        ]}
      >
        {/* Left accent bar */}
        <LinearGradient colors={cfg.gradient} style={styles.colorBar} />

        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.categoryIcon, { backgroundColor: `${cfg.color}22` }]}>
              <MaterialIcons name={cfg.icon as any} size={14} color={cfg.color} />
            </View>
            <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>{memory.title}</Text>
            <View style={styles.actions}>
              <Pressable
                onPress={onPin}
                hitSlop={10}
                style={({ pressed }) => [styles.actionBtn, { backgroundColor: memory.isPinned ? `${colors.primary}22` : 'transparent', opacity: pressed ? 0.7 : 1 }]}
              >
                <MaterialIcons
                  name={memory.isPinned ? 'push-pin' : 'push-pin'}
                  size={15}
                  color={memory.isPinned ? colors.primary : colors.textMuted}
                />
              </Pressable>
              <Pressable
                onPress={onFavorite}
                hitSlop={10}
                style={({ pressed }) => [styles.actionBtn, { backgroundColor: memory.isFavorite ? '#FFD60A22' : 'transparent', opacity: pressed ? 0.7 : 1 }]}
              >
                <MaterialIcons
                  name={memory.isFavorite ? 'star' : 'star-border'}
                  size={15}
                  color={memory.isFavorite ? '#FFD60A' : colors.textMuted}
                />
              </Pressable>
              <Pressable
                onPress={onDelete}
                hitSlop={10}
                style={({ pressed }) => [styles.actionBtn, { opacity: pressed ? 0.7 : 1 }]}
              >
                <MaterialIcons name="delete-outline" size={15} color={colors.textMuted} />
              </Pressable>
            </View>
          </View>

          {/* Content */}
          <Text style={[styles.contentText, { color: colors.textSecondary }]} numberOfLines={2}>
            {memory.content}
          </Text>

          {/* Footer */}
          <View style={styles.footer}>
            <Badge label={memory.category} variant="primary" size="sm" />
            {memory.importance && memory.importance !== 'medium' && (
              <View style={[styles.tag, { backgroundColor: memory.importance === 'high' ? '#F4433622' : '#8BC34A22' }]}>
                <Text style={[styles.tagText, { color: memory.importance === 'high' ? '#F44336' : '#8BC34A' }]}>
                  {memory.importance === 'high' ? '↑ High' : '↓ Low'}
                </Text>
              </View>
            )}
            <View style={styles.tagsRow}>
              {memory.tags.slice(0, 3).map(tag => (
                <View key={tag} style={[styles.tag, { backgroundColor: colors.surfaceElevated }]}>
                  <Text style={[styles.tagText, { color: colors.textMuted }]}>#{tag}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Pinned badge */}
          {memory.isPinned ? (
            <View style={[styles.pinnedBadge, { backgroundColor: `${colors.primary}22` }]}>
              <MaterialIcons name="push-pin" size={10} color={colors.primary} />
              <Text style={[styles.pinnedText, { color: colors.primary }]}>Pinned</Text>
            </View>
          ) : null}
        </View>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  colorBar: { width: 5 },
  content: { flex: 1, padding: Spacing.md, gap: Spacing.xs },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  categoryIcon: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.xs + 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, flex: 1 },
  actions: { flexDirection: 'row', gap: 4 },
  actionBtn: { padding: 4, borderRadius: BorderRadius.xs },
  contentText: { fontSize: FontSize.sm, lineHeight: 20 },
  footer: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: 4 },
  tagsRow: { flexDirection: 'row', gap: 4, flex: 1, flexWrap: 'wrap' },
  tag: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.full },
  tagText: { fontSize: FontSize.xxs, fontWeight: '500' },
  pinnedBadge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  pinnedText: { fontSize: FontSize.xxs, fontWeight: '700' },
});
