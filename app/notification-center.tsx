import React, { useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView, Animated, Switch,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/theme';
import { PageHeader } from '@/components/ui/PageHeader';
import { useAppStore } from '@/stores/useAppStore';
import { Badge } from '@/components/ui/Badge';

export default function NotificationCenterScreen() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const { notifications, markNotificationRead, markAllNotificationsRead } = useAppStore();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [notifSettings, setNotifSettings] = React.useState({
    ai: true,
    system: true,
    update: true,
    reminder: false,
  });

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }).start();
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const groupedNotifications = notifications.reduce<Record<string, typeof notifications>>((acc, notif) => {
    const date = new Date(notif.time.includes('ago') ? Date.now() : Date.now());
    const today = 'Today';
    if (!acc[today]) acc[today] = [];
    acc[today].push(notif);
    return acc;
  }, {});

  const TYPE_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
    ai:       { label: 'AI',       color: '#7C6FFF', icon: 'auto-awesome' },
    system:   { label: 'System',   color: '#00D4FF', icon: 'settings' },
    update:   { label: 'Update',   color: '#F5C842', icon: 'new-releases' },
    reminder: { label: 'Reminder', color: '#FF6B9D', icon: 'alarm' },
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <Animated.View style={[styles.flex, { opacity: fadeAnim }]}>
        <PageHeader
          title="Notification Center"
          subtitle={unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          actions={[
            { icon: 'done-all', onPress: markAllNotificationsRead, badge: unreadCount > 0 },
          ]}
        />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          {/* Unread Banner */}
          {unreadCount > 0 ? (
            <LinearGradient
              colors={['#7C6FFF', '#4A42CC']}
              style={styles.unreadBanner}
            >
              <View style={styles.unreadBannerBg} />
              <View style={[styles.unreadBadge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
              </View>
              <View>
                <Text style={styles.unreadTitle}>You have {unreadCount} new notification{unreadCount !== 1 ? 's' : ''}</Text>
                <Text style={styles.unreadSub}>Tap each to mark as read</Text>
              </View>
              <Pressable
                onPress={markAllNotificationsRead}
                style={({ pressed }) => [styles.markAllBtn, { opacity: pressed ? 0.8 : 1 }]}
              >
                <Text style={styles.markAllText}>Mark all</Text>
              </Pressable>
            </LinearGradient>
          ) : null}

          {/* Notification List */}
          {Object.entries(groupedNotifications).map(([group, items]) => (
            <View key={group} style={styles.section}>
              <Text style={[styles.groupLabel, { color: colors.textMuted }]}>{group.toUpperCase()}</Text>
              {items.map(notification => (
                <Pressable
                  key={notification.id}
                  onPress={() => markNotificationRead(notification.id)}
                  style={({ pressed }) => [
                    styles.notifCard,
                    {
                      backgroundColor: !notification.isRead ? `${notification.color}10` : colors.card,
                      borderColor: !notification.isRead ? `${notification.color}30` : colors.cardBorder,
                      opacity: pressed ? 0.85 : 1,
                    },
                  ]}
                >
                  {!notification.isRead ? <View style={[styles.unreadDot, { backgroundColor: notification.color }]} /> : null}
                  <View style={[styles.notifIcon, { backgroundColor: `${notification.color}20` }]}>
                    <MaterialIcons name={notification.icon as any} size={20} color={notification.color} />
                  </View>
                  <View style={styles.notifContent}>
                    <View style={styles.notifHeaderRow}>
                      <Text style={[styles.notifTitle, { color: colors.text }]}>{notification.title}</Text>
                      <Badge label={TYPE_CONFIG[notification.type]?.label ?? 'Info'} variant="outline" size="sm" />
                    </View>
                    <Text style={[styles.notifBody, { color: colors.textSecondary }]}>{notification.body}</Text>
                    <View style={styles.notifMeta}>
                      <MaterialIcons name="schedule" size={11} color={colors.textMuted} />
                      <Text style={[styles.notifTime, { color: colors.textMuted }]}>{notification.time}</Text>
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          ))}

          {/* Notification Settings */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Notification Preferences</Text>
            <View style={[styles.settingsCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              {Object.entries(TYPE_CONFIG).map(([type, config], idx, arr) => (
                <View key={type}>
                  <View style={styles.prefRow}>
                    <View style={[styles.prefIcon, { backgroundColor: `${config.color}20` }]}>
                      <MaterialIcons name={config.icon as any} size={18} color={config.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.prefLabel, { color: colors.text }]}>{config.label} Notifications</Text>
                    </View>
                    <Switch
                      value={notifSettings[type as keyof typeof notifSettings]}
                      onValueChange={(v) => setNotifSettings(prev => ({ ...prev, [type]: v }))}
                      trackColor={{ false: colors.border, true: `${config.color}70` }}
                      thumbColor={notifSettings[type as keyof typeof notifSettings] ? config.color : colors.textMuted}
                    />
                  </View>
                  {idx < arr.length - 1 ? <View style={[styles.divider, { backgroundColor: colors.border, marginLeft: 54 }]} /> : null}
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  unreadBanner: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, margin: Spacing.md, borderRadius: BorderRadius.xxl, padding: Spacing.md, overflow: 'hidden' },
  unreadBannerBg: { position: 'absolute', width: 150, height: 150, borderRadius: 75, backgroundColor: 'rgba(255,255,255,0.06)', top: -40, right: -30 },
  unreadBadge: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  unreadBadgeText: { fontSize: FontSize.xl, fontWeight: FontWeight.extrabold, color: '#fff' },
  unreadTitle: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: '#fff' },
  unreadSub: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  markAllBtn: { marginLeft: 'auto' as any, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full },
  markAllText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: '#fff' },
  section: { paddingHorizontal: Spacing.md, marginBottom: Spacing.md },
  groupLabel: { fontSize: FontSize.xxs + 1, fontWeight: FontWeight.bold, letterSpacing: 1.2, marginBottom: Spacing.md },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, marginBottom: Spacing.md },
  notifCard: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md, padding: Spacing.md, borderRadius: BorderRadius.xl, borderWidth: 1, marginBottom: Spacing.sm, position: 'relative' },
  unreadDot: { position: 'absolute', top: Spacing.md, left: 7, width: 7, height: 7, borderRadius: 4 },
  notifIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  notifContent: { flex: 1, gap: 4 },
  notifHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.sm },
  notifTitle: { flex: 1, fontSize: FontSize.base, fontWeight: FontWeight.semibold },
  notifBody: { fontSize: FontSize.sm, lineHeight: 20 },
  notifMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  notifTime: { fontSize: FontSize.xxs + 1 },
  settingsCard: { borderRadius: BorderRadius.xl, borderWidth: 1, paddingVertical: Spacing.xs, paddingHorizontal: Spacing.md },
  prefRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.sm + 2 },
  prefIcon: { width: 38, height: 38, borderRadius: BorderRadius.sm + 2, alignItems: 'center', justifyContent: 'center' },
  prefLabel: { fontSize: FontSize.base, fontWeight: FontWeight.medium },
  divider: { height: StyleSheet.hairlineWidth },
});
