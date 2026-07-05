import React from 'react';
import { Pressable, View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { BorderRadius, Shadow, Spacing } from '@/constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  variant?: 'default' | 'glass' | 'elevated';
  padding?: number;
}

export const Card: React.FC<CardProps> = ({
  children, style, onPress, variant = 'default', padding = Spacing.md,
}) => {
  const { colors } = useTheme();

  const getCardStyle = (): ViewStyle => {
    const base: ViewStyle = {
      borderRadius: BorderRadius.xl,
      padding,
      borderWidth: 1,
      borderColor: colors.cardBorder,
    };
    switch (variant) {
      case 'glass': return { ...base, backgroundColor: colors.glass };
      case 'elevated': return { ...base, backgroundColor: colors.card, ...Shadow.md };
      default: return { ...base, backgroundColor: colors.card };
    }
  };

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [getCardStyle(), { opacity: pressed ? 0.88 : 1 }, style]}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={[getCardStyle(), style]}>{children}</View>;
};

const styles = StyleSheet.create({});
