import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/theme';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  actions?: Array<{
    icon: string;
    onPress: () => void;
    badge?: boolean;
  }>;
  borderless?: boolean;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title, subtitle, showBack = true, actions, borderless = false,
}) => {
  const { colors } = useTheme();
  const router = useRouter();

  return (
    <View style={[
      styles.header,
      !borderless && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
    ]}>
      {showBack ? (
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          style={({ pressed }) => [styles.backBtn, { backgroundColor: colors.card, opacity: pressed ? 0.8 : 1 }]}
        >
          <MaterialIcons name="arrow-back-ios" size={18} color={colors.text} />
        </Pressable>
      ) : null}

      <View style={styles.titleBlock}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        {subtitle ? <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text> : null}
      </View>

      {actions ? (
        <View style={styles.actions}>
          {actions.map((action, i) => (
            <Pressable
              key={i}
              onPress={action.onPress}
              style={({ pressed }) => [styles.actionBtn, { backgroundColor: colors.card, borderColor: colors.cardBorder, opacity: pressed ? 0.8 : 1 }]}
            >
              <MaterialIcons name={action.icon as any} size={18} color={colors.textSecondary} />
              {action.badge ? <View style={[styles.actionBadge, { backgroundColor: colors.error }]} /> : null}
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 4,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm + 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleBlock: { flex: 1 },
  title: { fontSize: FontSize.xl, fontWeight: FontWeight.bold },
  subtitle: { fontSize: FontSize.xs, marginTop: 1 },
  actions: { flexDirection: 'row', gap: Spacing.xs },
  actionBtn: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.sm + 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    position: 'relative',
  },
  actionBadge: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 7,
    height: 7,
    borderRadius: 4,
  },
});

export default PageHeader;
