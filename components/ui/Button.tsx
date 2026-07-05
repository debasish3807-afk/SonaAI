import React from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
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
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  label, onPress, variant = 'primary', size = 'md',
  loading = false, disabled = false, style, textStyle, fullWidth = false,
}) => {
  const { colors } = useTheme();

  const getSizeStyle = (): ViewStyle => {
    switch (size) {
      case 'sm': return { paddingVertical: Spacing.xs, paddingHorizontal: Spacing.md, minHeight: 36 };
      case 'lg': return { paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl, minHeight: 56 };
      default: return { paddingVertical: Spacing.sm + 4, paddingHorizontal: Spacing.lg, minHeight: 48 };
    }
  };

  const getVariantStyle = (pressed: boolean): ViewStyle => {
    const opacity = (disabled || loading) ? 0.5 : pressed ? 0.85 : 1;
    const base: ViewStyle = { opacity, borderRadius: BorderRadius.lg };
    switch (variant) {
      case 'primary': return { ...base, backgroundColor: colors.primary };
      case 'secondary': return { ...base, backgroundColor: colors.secondary };
      case 'outline': return { ...base, backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.primary };
      case 'ghost': return { ...base, backgroundColor: 'transparent' };
      case 'danger': return { ...base, backgroundColor: colors.error };
      default: return base;
    }
  };

  const getTextColor = () => {
    if (variant === 'ghost') return colors.primary;
    if (variant === 'outline') return colors.primary;
    return '#FFFFFF';
  };

  const getTextSize = () => {
    switch (size) {
      case 'sm': return FontSize.sm;
      case 'lg': return FontSize.lg;
      default: return FontSize.base;
    }
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        getSizeStyle(),
        getVariantStyle(pressed),
        fullWidth && styles.fullWidth,
        style,
      ]}
      accessibilityLabel={label}
      accessibilityRole="button"
    >
      {loading ? (
        <ActivityIndicator size="small" color={getTextColor()} />
      ) : (
        <Text style={[styles.text, { color: getTextColor(), fontSize: getTextSize() }, textStyle]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  fullWidth: { width: '100%' },
  text: { fontWeight: FontWeight.semibold, letterSpacing: 0.3 },
});
