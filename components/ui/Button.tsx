import React, { useRef } from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator, ViewStyle, Animated } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/theme';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  label, onPress, variant = 'primary', size = 'md',
  loading = false, disabled = false, style, fullWidth = false,
}) => {
  const { colors } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, tension: 90, friction: 10 }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 65, friction: 9 }).start();
  };

  const heights = { sm: 36, md: 48, lg: 56 };
  const fontSizes = { sm: FontSize.sm, md: FontSize.base, lg: FontSize.lg };
  const padH = { sm: Spacing.md, md: Spacing.lg, lg: Spacing.xl };

  const getBg = () => {
    switch (variant) {
      case 'primary': return colors.primary;
      case 'secondary': return colors.secondary;
      case 'danger': return colors.error;
      case 'outline': case 'ghost': return 'transparent';
      default: return colors.primary;
    }
  };

  const getTextColor = () => {
    if (variant === 'ghost' || variant === 'outline') return colors.primary;
    return '#fff';
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      accessibilityLabel={label}
      accessibilityRole="button"
      style={[{ opacity: disabled || loading ? 0.5 : 1 }, fullWidth && { width: '100%' }, style]}
    >
      <Animated.View
        style={[
          styles.base,
          {
            height: heights[size],
            paddingHorizontal: padH[size],
            backgroundColor: getBg(),
            borderRadius: BorderRadius.lg,
            borderWidth: variant === 'outline' ? 1.5 : 0,
            borderColor: variant === 'outline' ? colors.primary : 'transparent',
            transform: [{ scale }],
          },
        ]}
      >
        {loading ? (
          <ActivityIndicator size="small" color={getTextColor()} />
        ) : (
          <Text style={[styles.text, { color: getTextColor(), fontSize: fontSizes[size] }]}>
            {label}
          </Text>
        )}
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
  text: { fontWeight: FontWeight.semibold, letterSpacing: 0.3 },
});
