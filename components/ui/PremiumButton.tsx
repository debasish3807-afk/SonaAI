import React, { useRef } from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator, ViewStyle, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { BorderRadius, FontSize, FontWeight, Shadow, Spacing } from '@/constants/theme';

type Variant = 'gradient' | 'primary' | 'outline' | 'ghost' | 'danger' | 'success';
type Size = 'sm' | 'md' | 'lg';

interface PremiumButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  icon?: keyof typeof MaterialIcons.glyphMap;
  iconRight?: keyof typeof MaterialIcons.glyphMap;
  gradientColors?: readonly [string, string, ...string[]];
  fullWidth?: boolean;
  glow?: boolean;
}

export const PremiumButton: React.FC<PremiumButtonProps> = ({
  label, onPress, variant = 'gradient', size = 'md',
  loading = false, disabled = false, style, icon, iconRight,
  gradientColors, fullWidth = false, glow = false,
}) => {
  const { colors } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.96, ...{ useNativeDriver: true, tension: 90, friction: 10 } }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, ...{ useNativeDriver: true, tension: 65, friction: 9 } }).start();
  };

  const heights = { sm: 38, md: 50, lg: 58 };
  const fontSizes = { sm: FontSize.sm, md: FontSize.base, lg: FontSize.lg };
  const iconSizes = { sm: 16, md: 20, lg: 22 };
  const padH = { sm: Spacing.md, md: Spacing.lg, lg: Spacing.xl };

  const getGradient = (): readonly [string, string, ...string[]] => {
    if (gradientColors) return gradientColors;
    switch (variant) {
      case 'danger': return [colors.error, '#CC3333'];
      case 'success': return [colors.success, '#00AA55'];
      default: return [colors.primary, colors.secondary];
    }
  };

  const content = (
    <>
      {loading ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <>
          {icon ? <MaterialIcons name={icon} size={iconSizes[size]} color={variant === 'outline' || variant === 'ghost' ? colors.primary : '#fff'} /> : null}
          <Text style={[
            styles.label,
            {
              fontSize: fontSizes[size],
              color: variant === 'outline' || variant === 'ghost' ? colors.primary : '#fff',
            },
          ]}>
            {label}
          </Text>
          {iconRight ? <MaterialIcons name={iconRight} size={iconSizes[size]} color={variant === 'outline' || variant === 'ghost' ? colors.primary : '#fff'} /> : null}
        </>
      )}
    </>
  );

  const containerStyle: ViewStyle = {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...(glow ? Shadow.glow : {}),
    ...(fullWidth ? { width: '100%' } : {}),
  };

  if (variant === 'gradient' || variant === 'danger' || variant === 'success') {
    return (
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        style={[{ opacity: disabled ? 0.5 : 1 }, style]}
      >
        <Animated.View style={[containerStyle, { transform: [{ scale }] }]}>
          <LinearGradient
            colors={getGradient()}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.inner, { height: heights[size], paddingHorizontal: padH[size] }]}
          >
            {content}
          </LinearGradient>
        </Animated.View>
      </Pressable>
    );
  }

  if (variant === 'outline') {
    return (
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        style={[{ opacity: disabled ? 0.5 : 1 }, style]}
      >
        <Animated.View style={[
          containerStyle,
          styles.inner,
          { height: heights[size], paddingHorizontal: padH[size], borderWidth: 1.5, borderColor: colors.primary, backgroundColor: 'transparent', transform: [{ scale }] },
        ]}>
          {content}
        </Animated.View>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={[{ opacity: disabled ? 0.5 : 1 }, style]}
    >
      <Animated.View style={[
        containerStyle,
        styles.inner,
        { height: heights[size], paddingHorizontal: padH[size], backgroundColor: 'transparent', transform: [{ scale }] },
      ]}>
        {content}
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  label: {
    fontWeight: FontWeight.bold,
    letterSpacing: 0.3,
  },
});
