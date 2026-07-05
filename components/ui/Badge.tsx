import React, { useRef } from 'react';
import { Animated, View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { BorderRadius, FontSize } from '@/constants/theme';

type BadgeVariant = 'primary' | 'success' | 'warning' | 'error' | 'secondary' | 'outline' | 'gold';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  pulse?: boolean;
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'primary', size = 'sm', pulse = false, style }) => {
  const { colors } = useTheme();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    if (!pulse) return;
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, [pulse]);

  const getColors = () => {
    switch (variant) {
      case 'success': return { bg: colors.successGlow, text: colors.success, dot: colors.success };
      case 'warning': return { bg: colors.warningGlow, text: colors.warning, dot: colors.warning };
      case 'error': return { bg: colors.errorGlow, text: colors.error, dot: colors.error };
      case 'secondary': return { bg: colors.secondaryGlow, text: colors.secondary, dot: colors.secondary };
      case 'gold': return { bg: colors.goldGlow, text: colors.gold, dot: colors.gold };
      case 'outline': return { bg: 'transparent', text: colors.textSecondary, dot: colors.textMuted, border: colors.border };
      default: return { bg: colors.primaryGlow, text: colors.primary, dot: colors.primary };
    }
  };

  const { bg, text, dot, border } = getColors();
  const isSmall = size === 'sm';

  return (
    <Animated.View style={[
      styles.badge,
      {
        backgroundColor: bg,
        borderColor: border ?? 'transparent',
        borderWidth: border ? 1 : 0,
        paddingHorizontal: isSmall ? 8 : 12,
        paddingVertical: isSmall ? 3 : 5,
        transform: [{ scale: pulseAnim }],
      },
      style,
    ]}>
      <View style={[styles.dot, { backgroundColor: dot }]} />
      <Text style={[styles.text, { color: text, fontSize: isSmall ? FontSize.xs : FontSize.sm }]}>
        {label}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dot: { width: 5, height: 5, borderRadius: 3 },
  text: { fontWeight: '700', letterSpacing: 0.2 },
});
