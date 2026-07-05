import React, { useRef } from 'react';
import { Pressable, View, StyleSheet, ViewStyle, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/hooks/useTheme';
import { BorderRadius, Shadow, Spacing } from '@/constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  variant?: 'default' | 'glass' | 'elevated' | 'gradient';
  padding?: number;
  gradientColors?: readonly [string, string, ...string[]];
  borderColor?: string;
  noPress?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children, style, onPress, variant = 'default',
  padding = Spacing.md, gradientColors, borderColor, noPress = false,
}) => {
  const { colors } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (!onPress) return;
    Animated.spring(scale, { toValue: 0.98, useNativeDriver: true, tension: 90, friction: 10 }).start();
  };
  const handlePressOut = () => {
    if (!onPress) return;
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 65, friction: 9 }).start();
  };

  const getCardStyle = (): ViewStyle => {
    const base: ViewStyle = { borderRadius: BorderRadius.xl, padding, borderWidth: 1, borderColor: borderColor ?? colors.cardBorder };
    switch (variant) {
      case 'glass': return { ...base, backgroundColor: colors.glass };
      case 'elevated': return { ...base, backgroundColor: colors.card, ...Shadow.md };
      case 'gradient': return { ...base, overflow: 'hidden' };
      default: return { ...base, backgroundColor: colors.card };
    }
  };

  const inner =
    variant === 'gradient' && gradientColors ? (
      <LinearGradient colors={gradientColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[getCardStyle(), style]}>
        {children}
      </LinearGradient>
    ) : (
      <View style={[getCardStyle(), style]}>{children}</View>
    );

  if (onPress && !noPress) {
    return (
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Animated.View style={{ transform: [{ scale }] }}>
          {inner}
        </Animated.View>
      </Pressable>
    );
  }

  return inner;
};

const styles = StyleSheet.create({});
