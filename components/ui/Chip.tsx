import React, { useRef } from 'react';
import { Pressable, Text, StyleSheet, Animated, ViewStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/theme';

interface ChipProps {
  label: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
  selected?: boolean;
  onPress?: () => void;
  onRemove?: () => void;
  color?: string;
  size?: 'sm' | 'md';
  style?: ViewStyle;
  variant?: 'filled' | 'outlined' | 'tinted';
}

export const Chip: React.FC<ChipProps> = ({
  label, icon, selected = false, onPress, onRemove, color,
  size = 'md', style, variant = 'tinted',
}) => {
  const { colors } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;

  const activeColor = color ?? colors.primary;
  const height = size === 'sm' ? 30 : 36;
  const fontSize = size === 'sm' ? FontSize.xs : FontSize.sm;
  const padH = size === 'sm' ? Spacing.sm : Spacing.md;

  const getBg = () => {
    if (selected) {
      if (variant === 'filled') return activeColor;
      if (variant === 'outlined') return 'transparent';
      return `${activeColor}22`;
    }
    return colors.card;
  };

  const getTextColor = () => {
    if (selected) {
      if (variant === 'filled') return '#fff';
      return activeColor;
    }
    return colors.textSecondary;
  };

  const getBorderColor = () => {
    if (selected) {
      if (variant === 'outlined') return activeColor;
      if (variant === 'tinted') return `${activeColor}55`;
      return 'transparent';
    }
    return colors.cardBorder;
  };

  const onPressIn = () =>
    Animated.spring(scale, { toValue: 0.93, useNativeDriver: true, tension: 100, friction: 10 }).start();
  const onPressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 65, friction: 9 }).start();

  return (
    <Pressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={style}
    >
      <Animated.View
        style={[
          styles.chip,
          {
            height,
            paddingHorizontal: padH,
            backgroundColor: getBg(),
            borderColor: getBorderColor(),
          },
          { transform: [{ scale }] },
        ]}
      >
        {icon ? (
          <MaterialIcons name={icon} size={size === 'sm' ? 12 : 14} color={getTextColor()} />
        ) : null}
        <Text style={[styles.label, { fontSize, color: getTextColor(), fontWeight: selected ? FontWeight.semibold : FontWeight.medium }]}>
          {label}
        </Text>
        {onRemove ? (
          <Pressable onPress={onRemove} hitSlop={8}>
            <MaterialIcons name="cancel" size={14} color={getTextColor()} />
          </Pressable>
        ) : null}
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    gap: 5,
  },
  label: { includeFontPadding: false },
});
