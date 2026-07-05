import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { BorderRadius } from '@/constants/theme';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 16,
  borderRadius = BorderRadius.sm,
  style,
}) => {
  const { colors } = useTheme();
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const opacity = shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0.9] });

  return (
    <Animated.View
      style={[
        { width: width as any, height, borderRadius, backgroundColor: colors.shimmer, opacity },
        style,
      ]}
    />
  );
};

export const SkeletonCard: React.FC<{ style?: ViewStyle }> = ({ style }) => {
  const { colors } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }, style]}>
      <View style={styles.row}>
        <Skeleton width={44} height={44} borderRadius={BorderRadius.md} />
        <View style={styles.lines}>
          <Skeleton width="60%" height={14} />
          <Skeleton width="40%" height={11} style={{ marginTop: 8 }} />
        </View>
      </View>
      <Skeleton width="100%" height={12} style={{ marginTop: 12 }} />
      <Skeleton width="80%" height={12} style={{ marginTop: 8 }} />
    </View>
  );
};

export const SkeletonList: React.FC<{ count?: number }> = ({ count = 4 }) => (
  <View style={styles.list}>
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} style={{ marginBottom: 12 }} />
    ))}
  </View>
);

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  lines: { flex: 1, gap: 0 },
  list: { paddingHorizontal: 16 },
});
