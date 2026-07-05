import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/hooks/useTheme';
import { BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/theme';

interface EmptyStateProps {
  icon: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  color?: string;
  compact?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon, title, description, actionLabel, onAction, color, compact = false,
}) => {
  const { colors } = useTheme();
  const accentColor = color ?? colors.primary;

  return (
    <View style={[styles.container, compact && styles.compact]}>
      <LinearGradient
        colors={[`${accentColor}25`, `${accentColor}08`]}
        style={[styles.iconBg, compact && styles.iconBgCompact]}
      >
        <MaterialIcons name={icon as any} size={compact ? 32 : 44} color={`${accentColor}99`} />
      </LinearGradient>
      <Text style={[styles.title, { color: colors.text }, compact && styles.titleCompact]}>{title}</Text>
      {description ? (
        <Text style={[styles.description, { color: colors.textSecondary }, compact && styles.descCompact]}>
          {description}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <Pressable
          onPress={onAction}
          style={({ pressed }) => [styles.action, { backgroundColor: accentColor, opacity: pressed ? 0.85 : 1 }]}
        >
          <Text style={styles.actionText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.xl,
  },
  compact: { paddingVertical: Spacing.lg, gap: Spacing.sm },
  iconBg: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBgCompact: { width: 68, height: 68, borderRadius: 34 },
  title: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, textAlign: 'center' },
  titleCompact: { fontSize: FontSize.lg },
  description: { fontSize: FontSize.base, textAlign: 'center', lineHeight: 24, maxWidth: 280 },
  descCompact: { fontSize: FontSize.sm },
  action: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.xs,
  },
  actionText: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: '#fff' },
});

export default EmptyState;
