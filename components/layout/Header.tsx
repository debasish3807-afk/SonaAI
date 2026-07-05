import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/hooks/useTheme';
import { FontSize, FontWeight, Spacing, BorderRadius } from '@/constants/theme';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  rightAction?: {
    icon: keyof typeof MaterialIcons.glyphMap;
    onPress: () => void;
  };
  rightElement?: React.ReactNode;
  gradient?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title, subtitle, showBack = false, rightAction, rightElement, gradient = false,
}) => {
  const { colors } = useTheme();
  const router = useRouter();

  const content = (
    <View style={[styles.container, { borderBottomColor: colors.border }]}>
      <View style={styles.left}>
        {showBack ? (
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [styles.backBtn, { backgroundColor: colors.card, opacity: pressed ? 0.8 : 1 }]}
            hitSlop={8}
          >
            <MaterialIcons name="arrow-back-ios" size={18} color={colors.text} />
          </Pressable>
        ) : null}
        <View style={styles.titleGroup}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>{title}</Text>
          {subtitle ? <Text style={[styles.subtitle, { color: colors.textSecondary }]} numberOfLines={1}>{subtitle}</Text> : null}
        </View>
      </View>
      <View style={styles.right}>
        {rightElement ?? null}
        {rightAction ? (
          <Pressable
            onPress={rightAction.onPress}
            style={({ pressed }) => [styles.actionBtn, { backgroundColor: colors.card, opacity: pressed ? 0.8 : 1 }]}
            hitSlop={8}
          >
            <MaterialIcons name={rightAction.icon} size={20} color={colors.text} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );

  return content;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  left: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: Spacing.sm },
  right: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm + 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtn: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.sm + 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleGroup: { flex: 1 },
  title: { fontSize: FontSize.xl, fontWeight: FontWeight.bold },
  subtitle: { fontSize: FontSize.xs, marginTop: 1 },
});
