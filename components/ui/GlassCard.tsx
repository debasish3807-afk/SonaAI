import React from 'react';
import { Pressable, View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/hooks/useTheme';
import { BorderRadius, Shadow, Spacing } from '@/constants/theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  gradient?: readonly [string, string, ...string[]];
  borderColor?: string;
  padding?: number;
  elevated?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  onPress,
  gradient,
  borderColor,
  padding = Spacing.md,
  elevated = false,
}) => {
  const { colors, isDark } = useTheme();

  const inner = (
    <View style={[styles.inner, elevated ? Shadow.md : {}, style]}>
      {gradient ? (
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.gradient, { borderRadius: BorderRadius.xl, borderColor: borderColor ?? colors.cardBorder, padding }]}
        >
          {children}
        </LinearGradient>
      ) : (
        <View style={[
          styles.card,
          {
            backgroundColor: colors.glass,
            borderColor: borderColor ?? colors.cardBorder,
            padding,
          },
        ]}>
          {children}
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [{ opacity: pressed ? 0.88 : 1, transform: [{ scale: pressed ? 0.985 : 1 }] }]}
      >
        {inner}
      </Pressable>
    );
  }

  return inner;
};

const styles = StyleSheet.create({
  inner: {},
  gradient: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  card: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
});
