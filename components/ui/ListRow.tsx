import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/hooks/useTheme';
import { BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/theme';

interface ListRowProps {
  icon: string;
  iconColor?: string;
  iconGradient?: [string, string];
  title: string;
  subtitle?: string;
  onPress?: () => void;
  right?: React.ReactNode;
  disabled?: boolean;
  isLast?: boolean;
  destructive?: boolean;
  badge?: string;
  badgeColor?: string;
}

export const ListRow: React.FC<ListRowProps> = ({
  icon, iconColor, iconGradient, title, subtitle, onPress, right,
  disabled, isLast, destructive, badge, badgeColor,
}) => {
  const { colors } = useTheme();
  const accent = iconColor ?? colors.primary;

  return (
    <>
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={({ pressed }) => [
          styles.row,
          { opacity: pressed && onPress && !disabled ? 0.75 : disabled ? 0.4 : 1 },
        ]}
      >
        {iconGradient ? (
          <LinearGradient colors={iconGradient} style={styles.iconBg}>
            <MaterialIcons name={icon as any} size={18} color="#fff" />
          </LinearGradient>
        ) : (
          <View style={[styles.iconBg, { backgroundColor: `${accent}20` }]}>
            <MaterialIcons name={icon as any} size={18} color={accent} />
          </View>
        )}
        <View style={styles.info}>
          <Text style={[styles.title, { color: destructive ? colors.error : colors.text }]}>{title}</Text>
          {subtitle ? <Text style={[styles.subtitle, { color: colors.textMuted }]} numberOfLines={1}>{subtitle}</Text> : null}
        </View>
        {badge ? (
          <View style={[styles.badge, { backgroundColor: `${badgeColor ?? colors.primary}20` }]}>
            <Text style={[styles.badgeText, { color: badgeColor ?? colors.primary }]}>{badge}</Text>
          </View>
        ) : null}
        {right ?? (onPress ? <MaterialIcons name="chevron-right" size={20} color={colors.textMuted} /> : null)}
      </Pressable>
      {!isLast ? <View style={[styles.divider, { backgroundColor: colors.border, marginLeft: 54 }]} /> : null}
    </>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.sm + 2,
  },
  iconBg: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.sm + 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1 },
  title: { fontSize: FontSize.base, fontWeight: FontWeight.medium },
  subtitle: { fontSize: FontSize.xs, marginTop: 1 },
  badge: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: BorderRadius.full },
  badgeText: { fontSize: FontSize.xxs, fontWeight: FontWeight.bold },
  divider: { height: StyleSheet.hairlineWidth },
});

export default ListRow;
