import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { FontSize, FontWeight, Spacing } from '@/constants/theme';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  rightAction?: {
    icon: keyof typeof MaterialIcons.glyphMap;
    onPress: () => void;
  };
  rightElement?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  title, subtitle, showBack = false, rightAction, rightElement,
}) => {
  const { colors } = useTheme();
  const router = useRouter();

  return (
    <View style={[styles.container, { borderBottomColor: colors.border }]}>
      <View style={styles.left}>
        {showBack ? (
          <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
            <MaterialIcons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
        ) : null}
        <View>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          {subtitle ? <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text> : null}
        </View>
      </View>
      <View style={styles.right}>
        {rightElement ?? null}
        {rightAction ? (
          <Pressable onPress={rightAction.onPress} style={styles.actionBtn} hitSlop={8}>
            <MaterialIcons name={rightAction.icon} size={24} color={colors.text} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  left: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: Spacing.sm },
  right: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  backBtn: { padding: Spacing.xs, marginRight: Spacing.xs },
  actionBtn: { padding: Spacing.xs },
  title: { fontSize: FontSize.xl, fontWeight: FontWeight.bold },
  subtitle: { fontSize: FontSize.sm, marginTop: 2 },
});
