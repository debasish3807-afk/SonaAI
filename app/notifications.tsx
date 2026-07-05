import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView, Animated,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { useAppStore } from '@/stores/useAppStore';
import { Badge } from '@/components/ui/Badge';
import { BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/theme';

export default function NotificationsScreen() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const { notifications, markNotificationRead, markAllNotificationsRead } = useAppStore();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }).start();
  }, []);

  const TYPE_LABEL: Record<string, string> = { ai: 'AI', system: 'System', update: 'Update', reminder: 'Reminder' };
  const TYPE_VARIANT: Record<string, any> = { ai: 'primary', system: 'success', update: 'gold', reminder: 'secondary' };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <Animated.View style={[styles.flex, { opacity: fadeAnim }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Pressable onPress={() => router.back()} hitSlop={8} style={({ pressed }) => [styles.backBtn, { backgroundColor: colors.card, opacity: pressed ? 0.8 : 1 }]}>
            <MaterialIcons name="arrow-back-ios" size={18} color={colors.text} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Notifications</Text>
            {unreadCount > 0 ? <Text style={[styles.headerSub, { color: colors.textSecondary }]}>{unreadCount} unread</Text> : null}
          </View>
          {unreadCount > 0 ? (
            <Pressable
              onPress={markAllNotificationsRead}
              style={({ pressed }) => [styles.markAllBtn, { backgroundColor: `${colors.primary}18`, opacity: pressed ? 0.8 : 1 }]}
            >
              <Text style={[styles.markAllText, { color: colors.primary }]}>Mark all read</Text>
            </Pressable>
          ) : null}
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {unreadCount > 0 ? (
            <View style={styles.section}>
              <Text style={[styles.groupLabel, { color: colors.textMuted }]}>UNREAD</Text>
              {notifications.filter(n => !n.isRead).map(n => (
                <Pressable
                  key={n.id}
                  onPress={() => markNotificationRead(n.id)}
                  style={({ pressed }) => [
                    styles.notifCard,
                    { backgroundColor: `${n.color}0D`, borderColor: `${n.color}30`, opacity: pressed ? 0.85 : 1 },
                  ]}
                >
                  <LinearGradient colors={[n.color, `${n.color}CC`]} style={styles.notifIcon}>
                    <MaterialIcons name={n.icon as any} size={18} color="#fff" />
                  </LinearGradient>
                  <View style={styles.notifContent}>
                    <View style={styles.notifTop}>
                      <Text style={[styles.notifTitle, { color: colors.text }]}>{n.title}</Text>
                      <Badge label={TYPE_LABEL[n.type]} variant={TYPE_VARIANT[n.type]} size="sm" />
                    </View>
                    <Text style={[styles.notifBody, { color: colors.textSecondary }]}>{n.body}</Text>
                    <Text style={[styles.notifTime, { color: colors.textMuted }]}>{n.time}</Text>
                  </View>
                  <View style={[styles.unreadDot, { backgroundColor: n.color }]} />
                </Pressable>
              ))}
            </View>
          ) : null}

          <View style={[styles.section, { paddingBottom: 32 }]}>
            <Text style={[styles.groupLabel, { color: colors.textMuted }]}>EARLIER</Text>
            {notifications.filter(n => n.isRead).map(n => (
              <Pressable
                key={n.id}
                style={({ pressed }) => [
                  styles.notifCard,
                  { backgroundColor: colors.card, borderColor: colors.cardBorder, opacity: pressed ? 0.8 : 1 },
                ]}
              >
                <View style={[styles.notifIcon, { backgroundColor: `${n.color}20` }]}>
                  <MaterialIcons name={n.icon as any} size={18} color={n.color} />
                </View>
                <View style={styles.notifContent}>
                  <View style={styles.notifTop}>
                    <Text style={[styles.notifTitle, { color: colors.textSecondary }]}>{n.title}</Text>
                  </View>
                  <Text style={[styles.notifBody, { color: colors.textMuted }]}>{n.body}</Text>
                  <Text style={[styles.notifTime, { color: colors.textMuted }]}>{n.time}</Text>
                </View>
              </Pressable>
            ))}
          </View>

          {notifications.length === 0 ? (
            <View style={styles.empty}>
              <LinearGradient colors={['#7C6FFF22', '#00D4FF11']} style={styles.emptyIcon}>
                <MaterialIcons name="notifications-none" size={44} color={colors.textMuted} />
              </LinearGradient>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>All caught up!</Text>
              <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>No new notifications right now</Text>
            </View>
          ) : null}
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm + 4, borderBottomWidth: StyleSheet.hairlineWidth },
  backBtn: { width: 36, height: 36, borderRadius: BorderRadius.sm + 2, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold },
  headerSub: { fontSize: FontSize.xs, marginTop: 1 },
  markAllBtn: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs + 2, borderRadius: BorderRadius.full },
  markAllText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },

  section: { paddingHorizontal: Spacing.md, paddingTop: Spacing.lg },
  groupLabel: { fontSize: FontSize.xxs + 1, fontWeight: FontWeight.bold, letterSpacing: 1.2, marginBottom: Spacing.md },

  notifCard: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md, padding: Spacing.md, borderRadius: BorderRadius.xl, borderWidth: 1, marginBottom: Spacing.sm, position: 'relative' },
  notifIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  notifContent: { flex: 1, gap: 3 },
  notifTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  notifTitle: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, flex: 1 },
  notifBody: { fontSize: FontSize.sm, lineHeight: 20 },
  notifTime: { fontSize: FontSize.xs },
  unreadDot: { width: 9, height: 9, borderRadius: 5, marginTop: 4 },

  empty: { alignItems: 'center', gap: Spacing.md, paddingTop: Spacing.xxl, paddingHorizontal: Spacing.xl },
  emptyIcon: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold },
  emptyDesc: { fontSize: FontSize.base, textAlign: 'center' },
});
