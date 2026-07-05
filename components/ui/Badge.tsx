import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { BorderRadius, FontSize } from '@/constants/theme';

type BadgeVariant = 'primary' | 'success' | 'warning' | 'error' | 'secondary' | 'outline';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'primary', size = 'sm' }) => {
  const { colors } = useTheme();

  const getColors = () => {
    switch (variant) {
      case 'success': return { bg: `${colors.success}22`, text: colors.success };
      case 'warning': return { bg: `${colors.warning}22`, text: colors.warning };
      case 'error': return { bg: `${colors.error}22`, text: colors.error };
      case 'secondary': return { bg: `${colors.secondary}22`, text: colors.secondary };
      case 'outline': return { bg: 'transparent', text: colors.textSecondary, border: colors.border };
      default: return { bg: `${colors.primary}22`, text: colors.primary };
    }
  };

  const { bg, text, border } = getColors();
  const isSmall = size === 'sm';

  return (
    <View style={[
      styles.badge,
      { backgroundColor: bg, borderColor: border ?? 'transparent', borderWidth: border ? 1 : 0 },
      isSmall ? styles.small : styles.medium,
    ]}>
      <Text style={[styles.text, { color: text, fontSize: isSmall ? FontSize.xs : FontSize.sm }]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: { borderRadius: BorderRadius.full, alignSelf: 'flex-start' },
  small: { paddingHorizontal: 8, paddingVertical: 3 },
  medium: { paddingHorizontal: 12, paddingVertical: 5 },
  text: { fontWeight: '600' },
});
