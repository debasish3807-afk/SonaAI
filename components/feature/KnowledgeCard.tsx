import React, { useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/hooks/useTheme';
import { BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/theme';
import type { KnowledgeItem } from '@/stores/useAppStore';

const TYPE_CONFIG: Record<KnowledgeItem['type'], { icon: string; color: string; gradient: [string, string]; label: string }> = {
  document: { icon: 'description', color: '#7C6FFF', gradient: ['#7C6FFF', '#4A42CC'], label: 'Document' },
  url: { icon: 'link', color: '#00D4FF', gradient: ['#00D4FF', '#0099CC'], label: 'Link' },
  note: { icon: 'sticky-note-2', color: '#F5C842', gradient: ['#F5C842', '#D4A000'], label: 'Note' },
  image: { icon: 'image', color: '#FF6B9D', gradient: ['#FF6B9D', '#CC3366'], label: 'Image' },
};

interface KnowledgeCardProps {
  item: KnowledgeItem;
  onPress?: () => void;
  onDelete?: () => void;
}

export const KnowledgeCard: React.FC<KnowledgeCardProps> = ({ item, onPress, onDelete }) => {
  const { colors } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;
  const cfg = TYPE_CONFIG[item.type];

  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.975, useNativeDriver: true, tension: 90, friction: 10 }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 65, friction: 9 }).start();
  };

  return (
    <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <Animated.View
        style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder, transform: [{ scale }] }]}
      >
        {/* Icon */}
        <LinearGradient colors={cfg.gradient} style={styles.iconBox}>
          <MaterialIcons name={cfg.icon as any} size={22} color="#fff" />
        </LinearGradient>

        {/* Info */}
        <View style={styles.info}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
            <View style={[styles.typeTag, { backgroundColor: `${cfg.color}22` }]}>
              <Text style={[styles.typeText, { color: cfg.color }]}>{cfg.label}</Text>
            </View>
          </View>
          <Text style={[styles.desc, { color: colors.textSecondary }]} numberOfLines={2}>
            {item.description}
          </Text>
          <View style={styles.meta}>
            {item.size ? (
              <View style={[styles.metaChip, { backgroundColor: colors.surfaceElevated }]}>
                <MaterialIcons name="data-usage" size={11} color={colors.textMuted} />
                <Text style={[styles.metaText, { color: colors.textMuted }]}>{item.size}</Text>
              </View>
            ) : null}
            {item.tags.slice(0, 2).map(t => (
              <View key={t} style={[styles.metaChip, { backgroundColor: `${colors.primary}18` }]}>
                <Text style={[styles.metaText, { color: colors.primary }]}>#{t}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Menu */}
        <Pressable
          onPress={onDelete}
          hitSlop={8}
          style={({ pressed }) => [styles.menuBtn, { opacity: pressed ? 0.6 : 1 }]}
        >
          <MaterialIcons name="more-vert" size={20} color={colors.textMuted} />
        </Pressable>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  iconBox: {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1, gap: 4 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  title: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, flex: 1 },
  typeTag: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: BorderRadius.full },
  typeText: { fontSize: FontSize.xxs, fontWeight: '700', letterSpacing: 0.2 },
  desc: { fontSize: FontSize.sm, lineHeight: 18 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4, flexWrap: 'wrap' },
  metaChip: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 7, paddingVertical: 2, borderRadius: BorderRadius.full },
  metaText: { fontSize: FontSize.xxs, fontWeight: '600' },
  menuBtn: { padding: Spacing.xs },
});
