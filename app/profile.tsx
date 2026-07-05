import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView, Animated, Switch,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { Badge } from '@/components/ui/Badge';
import { BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/theme';

const STATS = [
  { label: 'Memories', value: '24', icon: 'psychology', color: '#7C6FFF' },
  { label: 'AI Chats', value: '8', icon: 'chat-bubble', color: '#00D4FF' },
  { label: 'Images', value: '12', icon: 'auto-awesome', color: '#00E676' },
  { label: 'Downloads', value: '5', icon: 'download', color: '#FF9800' },
];

const QUICK_LINKS = [
  { label: 'AI History', icon: 'history', color: '#7C6FFF', route: '/ai-history' },
  { label: 'Favorites', icon: 'favorite', color: '#FF6B9D', route: '/favorites' },
  { label: 'Downloads', icon: 'download', color: '#FF9800', route: '/downloads' },
  { label: 'Activity', icon: 'timeline', color: '#00D4FF', route: '/recent-activity' },
];

export default function ProfileScreen() {
  const { colors, isDark, toggleTheme } = useTheme();
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [notifications, setNotifications] = useState(true);
  const [cloudSync, setCloudSync] = useState(false);

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }).start();
  }, []);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <Animated.View style={[styles.flex, { opacity: fadeAnim }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Pressable onPress={() => router.back()} hitSlop={8} style={({ pressed }) => [styles.backBtn, { backgroundColor: colors.card, opacity: pressed ? 0.8 : 1 }]}>
            <MaterialIcons name="arrow-back-ios" size={18} color={colors.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Profile</Text>
          <Pressable style={({ pressed }) => [styles.editBtn, { backgroundColor: colors.card, borderColor: colors.cardBorder, opacity: pressed ? 0.8 : 1 }]}>
            <MaterialIcons name="edit" size={18} color={colors.textSecondary} />
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          {/* Profile Hero */}
          <LinearGradient
            colors={isDark ? ['#12121E', '#0F0F1A'] : ['#EAE8FF', '#F0F0FF']}
            style={styles.profileHero}
          >
            <View style={styles.avatarSection}>
              <View style={styles.avatarWrap}>
                <LinearGradient colors={['#7C6FFF', '#00D4FF']} style={styles.avatar}>
                  <Text style={styles.avatarText}>S</Text>
                </LinearGradient>
                <Pressable style={[styles.cameraBtn, { backgroundColor: colors.surface, borderColor: colors.background }]}>
                  <MaterialIcons name="camera-alt" size={14} color={colors.textSecondary} />
                </Pressable>
              </View>
              <View style={styles.profileInfo}>
                <Text style={[styles.profileName, { color: colors.text }]}>SONA User</Text>
                <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>user@sona.ai</Text>
                <View style={styles.profileBadges}>
                  <Badge label="Free Plan" variant="outline" size="sm" />
                  <Badge label="Member since 2025" variant="secondary" size="sm" />
                </View>
              </View>
            </View>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
              {STATS.map(stat => (
                <View key={stat.label} style={[styles.statCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)', borderColor: colors.cardBorder }]}>
                  <View style={[styles.statIcon, { backgroundColor: `${stat.color}20` }]}>
                    <MaterialIcons name={stat.icon as any} size={16} color={stat.color} />
                  </View>
                  <Text style={[styles.statValue, { color: colors.text }]}>{stat.value}</Text>
                  <Text style={[styles.statLabel, { color: colors.textMuted }]}>{stat.label}</Text>
                </View>
              ))}
            </View>
          </LinearGradient>

          {/* Upgrade Banner */}
          <Pressable style={({ pressed }) => [styles.upgradeWrapper, { opacity: pressed ? 0.92 : 1 }]}>
            <LinearGradient colors={['#7C6FFF', '#00D4FF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.upgradeBanner}>
              <MaterialIcons name="workspace-premium" size={22} color="#fff" />
              <View style={{ flex: 1 }}>
                <Text style={styles.upgradeTitle}>Upgrade to SONA Pro</Text>
                <Text style={styles.upgradeSub}>Unlimited AI · Voice · Image Gen · Priority Support</Text>
              </View>
              <View style={styles.upgradePrice}>
                <Text style={styles.priceText}>$9.99</Text>
                <Text style={styles.priceSub}>/mo</Text>
              </View>
            </LinearGradient>
          </Pressable>

          {/* Quick Links */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Access</Text>
            <View style={styles.quickGrid}>
              {QUICK_LINKS.map(link => (
                <Pressable
                  key={link.label}
                  onPress={() => router.push(link.route as any)}
                  style={({ pressed }) => [styles.quickCard, { backgroundColor: colors.card, borderColor: colors.cardBorder, opacity: pressed ? 0.85 : 1 }]}
                >
                  <View style={[styles.quickIcon, { backgroundColor: `${link.color}20` }]}>
                    <MaterialIcons name={link.icon as any} size={22} color={link.color} />
                  </View>
                  <Text style={[styles.quickLabel, { color: colors.text }]}>{link.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Quick Settings */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Settings</Text>
            <View style={[styles.settingsCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              {[
                { icon: 'dark-mode', label: 'Dark Mode', color: '#7C6FFF', value: isDark, onToggle: toggleTheme },
                { icon: 'notifications-active', label: 'Notifications', color: '#00D4FF', value: notifications, onToggle: setNotifications },
                { icon: 'cloud-sync', label: 'Cloud Sync', color: '#00E676', value: cloudSync, onToggle: setCloudSync },
              ].map((item, idx) => (
                <View key={item.label}>
                  <View style={styles.settingRow}>
                    <View style={[styles.settingIcon, { backgroundColor: `${item.color}20` }]}>
                      <MaterialIcons name={item.icon as any} size={18} color={item.color} />
                    </View>
                    <Text style={[styles.settingLabel, { color: colors.text }]}>{item.label}</Text>
                    <Switch
                      value={item.value}
                      onValueChange={item.onToggle}
                      trackColor={{ false: colors.border, true: `${item.color}80` }}
                      thumbColor={item.value ? item.color : colors.textMuted}
                    />
                  </View>
                  {idx < 2 ? <View style={[styles.divider, { backgroundColor: colors.border }]} /> : null}
                </View>
              ))}
            </View>
          </View>

          {/* Account Actions */}
          <View style={[styles.section, { marginBottom: 0 }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Account</Text>
            <View style={[styles.settingsCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              {[
                { icon: 'settings', label: 'Full Settings', color: '#9E9E9E', route: '/(tabs)/settings' },
                { icon: 'help-outline', label: 'Help Center', color: '#00D4FF', route: '/help-center' },
                { icon: 'info-outline', label: 'About SONA AI', color: '#7C6FFF', route: '/about' },
              ].map((item, idx) => (
                <View key={item.label}>
                  <Pressable
                    onPress={() => router.push(item.route as any)}
                    style={({ pressed }) => [styles.settingRow, { opacity: pressed ? 0.75 : 1 }]}
                  >
                    <View style={[styles.settingIcon, { backgroundColor: `${item.color}20` }]}>
                      <MaterialIcons name={item.icon as any} size={18} color={item.color} />
                    </View>
                    <Text style={[styles.settingLabel, { color: colors.text }]}>{item.label}</Text>
                    <MaterialIcons name="chevron-right" size={20} color={colors.textMuted} />
                  </Pressable>
                  {idx < 2 ? <View style={[styles.divider, { backgroundColor: colors.border }]} /> : null}
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
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm + 4, borderBottomWidth: StyleSheet.hairlineWidth },
  backBtn: { width: 36, height: 36, borderRadius: BorderRadius.sm + 2, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, flex: 1, textAlign: 'center' },
  editBtn: { width: 38, height: 38, borderRadius: BorderRadius.sm + 2, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },

  profileHero: { padding: Spacing.lg, gap: Spacing.lg },
  avatarSection: { flexDirection: 'row', gap: Spacing.md, alignItems: 'center' },
  avatarWrap: { position: 'relative' },
  avatar: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: FontSize.xxl + 4, fontWeight: FontWeight.extrabold, color: '#fff' },
  cameraBtn: { position: 'absolute', bottom: 0, right: 0, width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  profileInfo: { flex: 1, gap: 4 },
  profileName: { fontSize: FontSize.xl, fontWeight: FontWeight.bold },
  profileEmail: { fontSize: FontSize.sm },
  profileBadges: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginTop: 4 },

  statsGrid: { flexDirection: 'row', gap: Spacing.sm },
  statCard: { flex: 1, alignItems: 'center', padding: Spacing.sm, borderRadius: BorderRadius.xl, borderWidth: 1, gap: 4 },
  statIcon: { width: 32, height: 32, borderRadius: BorderRadius.sm, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: FontSize.xl, fontWeight: FontWeight.extrabold },
  statLabel: { fontSize: FontSize.xxs, fontWeight: '600' },

  upgradeWrapper: { marginHorizontal: Spacing.md, marginTop: Spacing.md },
  upgradeBanner: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, borderRadius: BorderRadius.xl, padding: Spacing.md + 2, overflow: 'hidden' },
  upgradeTitle: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: '#fff' },
  upgradeSub: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  upgradePrice: { alignItems: 'flex-end' },
  priceText: { fontSize: FontSize.xxl, fontWeight: FontWeight.extrabold, color: '#fff' },
  priceSub: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.7)' },

  section: { paddingHorizontal: Spacing.md, marginTop: Spacing.lg },
  sectionTitle: { fontSize: FontSize.base, fontWeight: FontWeight.bold, marginBottom: Spacing.md },

  quickGrid: { flexDirection: 'row', gap: Spacing.sm },
  quickCard: { flex: 1, alignItems: 'center', padding: Spacing.md, borderRadius: BorderRadius.xl, borderWidth: 1, gap: 8 },
  quickIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  quickLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, textAlign: 'center' },

  settingsCard: { borderRadius: BorderRadius.xl, borderWidth: 1, overflow: 'hidden' },
  settingRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm + 2 },
  settingIcon: { width: 38, height: 38, borderRadius: BorderRadius.sm + 2, alignItems: 'center', justifyContent: 'center' },
  settingLabel: { flex: 1, fontSize: FontSize.base, fontWeight: FontWeight.medium },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: 70 },
});
