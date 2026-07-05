import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, Switch, ScrollView, Pressable, StyleSheet, Animated,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/theme';

interface SettingRowProps {
  icon: string; iconColor: string; label: string; description?: string;
  toggle?: boolean; value?: boolean; onToggle?: (v: boolean) => void;
  onPress?: () => void; badge?: string; badgeVariant?: any;
  disabled?: boolean; destructive?: boolean; isLast?: boolean;
}

const SettingRow: React.FC<SettingRowProps> = ({
  icon, iconColor, label, description, toggle, value, onToggle,
  onPress, badge, badgeVariant = 'primary', disabled, destructive, isLast = false,
}) => {
  const { colors } = useTheme();
  return (
    <>
      <Pressable
        onPress={!toggle ? onPress : undefined}
        disabled={disabled}
        style={({ pressed }) => [
          styles.settingRow,
          { opacity: (pressed && !toggle && onPress) ? 0.75 : disabled ? 0.45 : 1 },
        ]}
      >
        <LinearGradient colors={[`${iconColor}30`, `${iconColor}15`]} style={styles.settingIcon}>
          <MaterialIcons name={icon as any} size={18} color={iconColor} />
        </LinearGradient>
        <View style={styles.settingInfo}>
          <Text style={[styles.settingLabel, { color: destructive ? colors.error : colors.text }]}>{label}</Text>
          {description ? <Text style={[styles.settingDesc, { color: colors.textMuted }]} numberOfLines={1}>{description}</Text> : null}
        </View>
        {badge ? <Badge label={badge} variant={badgeVariant} size="sm" /> : null}
        {toggle ? (
          <Switch value={value} onValueChange={onToggle} trackColor={{ false: colors.border, true: `${iconColor}80` }} thumbColor={value ? iconColor : colors.textMuted} />
        ) : onPress ? (
          <MaterialIcons name="chevron-right" size={20} color={colors.textMuted} />
        ) : null}
      </Pressable>
      {!isLast ? <View style={[styles.divider, { backgroundColor: colors.border }]} /> : null}
    </>
  );
};

export default function SettingsScreen() {
  const { colors, isDark, toggleTheme } = useTheme();
  const router = useRouter();
  const [notifications, setNotifications] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [cloudSync, setCloudSync] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [haptics, setHaptics] = useState(true);
  const [smartMemory, setSmartMemory] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <Animated.View style={[styles.flex, { opacity: fadeAnim }]}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* ── Profile Header ── */}
          <LinearGradient
            colors={isDark ? ['#161624', '#0F0F1A'] : ['#EAE8FF', '#F0F0FF']}
            style={styles.profileSection}
          >
            <Pressable onPress={() => router.push('/profile' as any)}>
              <LinearGradient colors={['#7C6FFF', '#00D4FF']} style={styles.profileAvatar}>
                <Text style={styles.avatarText}>S</Text>
              </LinearGradient>
            </Pressable>
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: colors.text }]}>SONA User</Text>
              <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>user@sona.ai</Text>
              <Badge label="Free Plan" variant="outline" size="sm" />
            </View>
            <Pressable
              onPress={() => router.push('/profile' as any)}
              style={({ pressed }) => [styles.editProfileBtn, { backgroundColor: colors.card, borderColor: colors.cardBorder, opacity: pressed ? 0.8 : 1 }]}
            >
              <MaterialIcons name="chevron-right" size={20} color={colors.textSecondary} />
            </Pressable>
          </LinearGradient>

          {/* ── Upgrade Banner ── */}
          <Pressable style={({ pressed }) => [styles.upgradeWrapper, { opacity: pressed ? 0.92 : 1 }]}>
            <LinearGradient colors={['#7C6FFF', '#00D4FF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.upgradeBanner}>
              <MaterialIcons name="workspace-premium" size={22} color="#fff" />
              <View style={{ flex: 1 }}>
                <Text style={styles.upgradeTitle}>Upgrade to SONA Pro</Text>
                <Text style={styles.upgradeDesc}>Unlimited AI · Voice · Image Gen</Text>
              </View>
              <View style={styles.upgradeArrow}>
                <MaterialIcons name="arrow-forward-ios" size={14} color="#fff" />
              </View>
            </LinearGradient>
          </Pressable>

          {/* ── Quick Navigation ── */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Quick Access</Text>
            <View style={styles.quickGrid}>
              {[
                { label: 'Profile', icon: 'person', color: '#7C6FFF', route: '/profile' },
                { label: 'Notifications', icon: 'notifications', color: '#FF6B9D', route: '/notifications' },
                { label: 'Favorites', icon: 'favorite', color: '#F5C842', route: '/favorites' },
                { label: 'Downloads', icon: 'download', color: '#00E676', route: '/downloads' },
                { label: 'AI History', icon: 'history', color: '#00D4FF', route: '/ai-history' },
                { label: 'Activity', icon: 'timeline', color: '#FF9800', route: '/recent-activity' },
              ].map(item => (
                <Pressable
                  key={item.label}
                  onPress={() => router.push(item.route as any)}
                  style={({ pressed }) => [styles.quickCard, { backgroundColor: colors.card, borderColor: colors.cardBorder, opacity: pressed ? 0.8 : 1 }]}
                >
                  <View style={[styles.quickIcon, { backgroundColor: `${item.color}20` }]}>
                    <MaterialIcons name={item.icon as any} size={20} color={item.color} />
                  </View>
                  <Text style={[styles.quickLabel, { color: colors.textSecondary }]}>{item.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* ── Appearance ── */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Appearance</Text>
            <Card>
              <SettingRow icon="dark-mode" iconColor="#7C6FFF" label="Dark Mode" description={isDark ? 'Currently dark theme' : 'Currently light theme'} toggle value={isDark} onToggle={toggleTheme} />
              <SettingRow icon="text-fields" iconColor="#00D4FF" label="Font Size" description="Medium (default)" onPress={() => {}} />
              <SettingRow icon="language" iconColor="#00E676" label="Language" description="English (US)" onPress={() => {}} isLast />
            </Card>
          </View>

          {/* ── AI Settings ── */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>AI Configuration</Text>
            <Card>
              <SettingRow icon="auto-awesome" iconColor="#F5C842" label="AI Model" description="Gemini 2.0 Flash" badge="Default" badgeVariant="gold" onPress={() => {}} />
              <SettingRow icon="mic" iconColor="#FF6B9D" label="Voice Assistant" description="Enable voice interactions" toggle value={voiceEnabled} onToggle={setVoiceEnabled} />
              <SettingRow icon="memory" iconColor="#00E676" label="Smart Memory" description="AI-powered context recall" toggle value={smartMemory} onToggle={setSmartMemory} />
              <SettingRow icon="tune" iconColor="#00D4FF" label="AI Personality" description="Professional & Helpful" onPress={() => {}} />
              <SettingRow icon="auto-fix-high" iconColor="#FF9800" label="Response Quality" description="Balanced (recommended)" onPress={() => {}} isLast />
            </Card>
          </View>

          {/* ── Notifications ── */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Notifications</Text>
            <Card>
              <SettingRow icon="notifications-active" iconColor="#00D4FF" label="Push Notifications" description="Alerts and reminders" toggle value={notifications} onToggle={setNotifications} />
              <SettingRow icon="vibration" iconColor="#9C27B0" label="Haptic Feedback" description="Vibration on interactions" toggle value={haptics} onToggle={setHaptics} isLast />
            </Card>
          </View>

          {/* ── Data & Privacy ── */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Data & Privacy</Text>
            <Card>
              <SettingRow icon="cloud-sync" iconColor="#4CAF50" label="Cloud Sync" description="Sync across all devices" toggle value={cloudSync} onToggle={setCloudSync} badge={cloudSync ? undefined : 'Pro'} badgeVariant="gold" />
              <SettingRow icon="analytics" iconColor="#FF9800" label="Usage Analytics" description="Help improve SONA AI" toggle value={analytics} onToggle={setAnalytics} />
              <SettingRow icon="security" iconColor="#7C6FFF" label="Privacy Settings" description="Data handling preferences" onPress={() => router.push('/privacy-policy' as any)} />
              <SettingRow icon="delete-forever" iconColor="#FF5252" label="Clear All Data" description="Remove all local data permanently" onPress={() => {}} destructive isLast />
            </Card>
          </View>

          {/* ── About ── */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>About</Text>
            <Card>
              <SettingRow icon="info-outline" iconColor="#7C6FFF" label="Version" description="SONA AI v1.0.0 (Build 100)" />
              <SettingRow icon="new-releases" iconColor="#00E676" label="What's New" badge="v1.0" badgeVariant="success" onPress={() => {}} />
              <SettingRow icon="help-outline" iconColor="#00D4FF" label="Help Center" onPress={() => router.push('/help-center' as any)} />
              <SettingRow icon="description" iconColor="#F5C842" label="Privacy Policy" onPress={() => router.push('/privacy-policy' as any)} />
              <SettingRow icon="gavel" iconColor="#FF9800" label="Terms of Service" onPress={() => router.push('/terms-of-service' as any)} />
              <SettingRow icon="info" iconColor="#9E9E9E" label="About SONA AI" onPress={() => router.push('/about' as any)} />
              <SettingRow icon="star-rate" iconColor="#FF6B9D" label="Rate SONA AI" description="Leave us a review" onPress={() => {}} isLast />
            </Card>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  profileSection: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.lg, gap: Spacing.md },
  profileAvatar: { width: 68, height: 68, borderRadius: 34, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: FontSize.xxl + 4, fontWeight: FontWeight.extrabold, color: '#fff' },
  profileInfo: { flex: 1, gap: 4 },
  profileName: { fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  profileEmail: { fontSize: FontSize.sm },
  editProfileBtn: { width: 38, height: 38, borderRadius: BorderRadius.sm + 2, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },

  upgradeWrapper: { marginHorizontal: Spacing.md, marginBottom: Spacing.sm },
  upgradeBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: BorderRadius.xl, padding: Spacing.md + 4, overflow: 'hidden' },
  upgradeTitle: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: '#fff' },
  upgradeDesc: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.78)', marginTop: 2 },
  upgradeArrow: { width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },

  section: { paddingHorizontal: Spacing.md, marginBottom: Spacing.md },
  sectionTitle: { fontSize: FontSize.xxs + 1, fontWeight: FontWeight.bold, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: Spacing.sm, paddingLeft: 2 },

  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  quickCard: { width: '30%', flex: undefined, aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: BorderRadius.xl, borderWidth: 1, gap: 7, padding: Spacing.sm },
  quickIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  quickLabel: { fontSize: FontSize.xxs + 1, fontWeight: FontWeight.semibold, textAlign: 'center' },

  settingRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.sm + 2 },
  settingIcon: { width: 38, height: 38, borderRadius: BorderRadius.sm + 2, alignItems: 'center', justifyContent: 'center' },
  settingInfo: { flex: 1 },
  settingLabel: { fontSize: FontSize.base, fontWeight: FontWeight.medium },
  settingDesc: { fontSize: FontSize.xs, marginTop: 1 },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: 54 },
});
