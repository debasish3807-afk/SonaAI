import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { FontSize, FontWeight, Spacing } from '@/constants/theme';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: string;
  iconColor?: string;
  badge?: string | number;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title, subtitle, actionLabel, onAction, icon, iconColor, badge,
}) => {
  const { colors } = useTheme();
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        {icon ? (
          <View style={[styles.iconBg, { backgroundColor: `${iconColor ?? colors.primary}20` }]}>
            <MaterialIcons name={icon as any} size={16} color={iconColor ?? colors.primary} />
          </View>
        ) : null}
        <View>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          {subtitle ? <Text style={[styles.subtitle, { color: colors.textMuted }]}>{subtitle}</Text> : null}
        </View>
      </View>
      <View style={styles.right}>
        {badge !== undefined ? (
          <View style={[styles.badge, { backgroundColor: `${colors.primary}20` }]}>
            <Text style={[styles.badgeText, { color: colors.primary }]}>{badge}</Text>
          </View>
        ) : null}
        {actionLabel && onAction ? (
          <Pressable onPress={onAction} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
            <Text style={[styles.action, { color: colors.primary }]}>{actionLabel}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flex: 1 },
  iconBg: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  subtitle: { fontSize: FontSize.xs, marginTop: 1 },
  right: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 99 },
  badgeText: { fontSize: FontSize.xxs + 1, fontWeight: FontWeight.bold },
  action: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
});

export default SectionHeader;
