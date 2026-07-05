import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/hooks/useTheme';
import { FontSize, FontWeight, BorderRadius } from '@/constants/theme';

interface ProgressBarProps {
  value: number;      // 0-100
  max?: number;
  color?: string;
  height?: number;
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
  gradient?: [string, string];
  style?: object;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  color,
  height = 6,
  showLabel = false,
  label,
  animated = true,
  gradient,
  style,
}) => {
  const { colors } = useTheme();
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const barColor = color ?? colors.primary;

  useEffect(() => {
    if (animated) {
      Animated.spring(progressAnim, {
        toValue: pct,
        tension: 60,
        friction: 12,
        useNativeDriver: false,
      }).start();
    } else {
      progressAnim.setValue(pct);
    }
  }, [pct]);

  const width = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  return (
    <View style={[styles.container, style]}>
      {(showLabel || label) ? (
        <View style={styles.labelRow}>
          {label ? <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text> : null}
          {showLabel ? <Text style={[styles.pctText, { color: barColor }]}>{Math.round(pct)}%</Text> : null}
        </View>
      ) : null}
      <View style={[styles.track, { backgroundColor: `${barColor}20`, height, borderRadius: height / 2 }]}>
        <Animated.View style={[styles.fill, { width, height, borderRadius: height / 2, overflow: 'hidden' }]}>
          {gradient ? (
            <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: barColor }]} />
          )}
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: '100%' },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  label: { fontSize: FontSize.sm },
  pctText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  track: { overflow: 'hidden' },
  fill: {},
});

export default ProgressBar;
