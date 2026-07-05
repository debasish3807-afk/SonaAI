import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Switch, ScrollView, Pressable, StyleSheet, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/hooks/useTheme';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { BorderRadius, FontSize, FontWeight, Shadow, Spacing } from '@/constants/theme';

interface SettingRowProps {
  icon: string;
  iconColor: string;
  label: string;
  description?: string;
  toggle?: boolean;
  value?: boolean;
  onToggle?: (v: boolean) => void;
  onPress?: () => void;
  badge?: string;
  badgeVariant?: any;
  disabled?: boolean;
  destructive?: boolean;
}

const SettingRow: React.FC<SettingRowProps> = ({
  icon, iconColor, label, description, toggle, value, onToggle,
  onPress, badge, badgeVariant = 'primary', disabled, destructive,
}) => {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={!toggle ? onPress : undefined}
      disabled={disabled}
      style={({ pressed }) => [
        styles.settingRow,
        { opacity: (pressed && !toggle && onPress) ? 0.75 : disabled ? 0.45 : 1 },
      ]}
    >
      <LinearGradient
        colors={[`${iconColor}30`, `${iconColor}15`]}
        style={styles.settingIcon}
      >
        <MaterialIcons name={icon as any} size={18} color={iconColor} />
      </LinearGradient>
      <View style={styles.settingInfo}>
        <Text style={[styles.settingLabel, { color: destructive ? colors.error : colors.text }]}>
          {label}
        </Text>
        {description ? (
          <Text style={[styles.settingDesc, { color: colors.textMuted }]} numberOfLines={1}>{description}</Text>
        ) : null}
      </View>
      {badge ? <Badge label={badge} variant={badgeVariant} size="sm" /> : null}
      {toggle ? (
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: colors.border, true: `${iconColor}80` }}
          thumbColor={value ? iconColor : colors.textMuted}
        />
      ) : onPress ? (
        <MaterialIcons name="chevron-right" size={20} color={colors.textMuted} />
      ) : null}
    </Pressable>
  );
};

export default function SettingsScreen() {
  const { colors, isDark, toggleTheme } = useTheme();
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
            <LinearGradient colors={['#7C6FFF', '#00D4FF']} style={styles.profileAvatar}>
              <Text style={styles.avatarText}>S</Text>
            </LinearGradient>
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: colors.text }]}>SONA User</Text>
              <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>user@sona.ai</Text>
              <Badge label="Free Plan" variant="outline" size="sm" />
            </View>
            <Pressable
              style={({ pressed }) => [styles.editProfileBtn, { backgroundColor: colors.card, borderColor: colors.cardBorder, opacity: pressed ? 0.8 : 1 }]}
            >
              <MaterialIcons name="edit" size={16} color={colors.textSecondary} />
            </Pressable>
          </LinearGradient>

          {/* ── Upgrade Banner ── */}
          <Pressable style={({ pressed }) => [styles.upgradeWrapper, { opacity: pressed ? 0.92 : 1 }]}>
            <LinearGradient
              colors={['#7C6FFF', '#00D4FF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.upgradeBanner, Shadow.md]}
            >
              <View style={styles.upgradeLeft}>
                <MaterialIcons name="workspace-premium" size={22} color="#fff" />
                <View>
                  <Text style={styles.upgradeTitle}>Upgrade to SONA Pro</Text>
                  <Text style={styles.upgradeDesc}>Unlimited AI · Voice · Image Gen</Text>
                </View>
              </View>
              <View style={styles.upgradeArrow}>
                <MaterialIcons name="arrow-forward-ios" size={14} color="#fff" />
              </View>
            </LinearGradient>
          </Pressable>

          {/* ── Appearance ── */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Appearance</Text>
            <Card>
              <SettingRow
                icon="dark-mode"
                iconColor="#7C6FFF"
                label="Dark Mode"
                description={isDark ? 'Currently dark theme' : 'Currently light theme'}
                toggle
                value={isDark}
                onToggle={toggleTheme}
              />
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <SettingRow icon="text-fields" iconColor="#00D4FF" label="Font Size" description="Medium (default)" onPress={() => {}} />
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <SettingRow icon="language" iconColor="#00E676" label="Language" description="English (US)" onPress={() => {}} />
            </Card>
          </View>

          {/* ── AI Settings ── */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>AI Configuration</Text>
            <Card>
              <SettingRow
                icon="auto-awesome"
                iconColor="#F5C842"
                label="AI Model"
                description="Gemini 2.0 Flash"
                badge="Default"
                badgeVariant="gold"
                onPress={() => {}}
              />
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <SettingRow
                icon="mic"
                iconColor="#FF6B9D"
                label="Voice Assistant"
                description="Enable voice interactions"
                toggle
                value={voiceEnabled}
                onToggle={setVoiceEnabled}
              />
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <SettingRow
                icon="memory"
                iconColor="#00E676"
                label="Smart Memory"
                description="AI-powered context recall"
                toggle
                value={smartMemory}
                onToggle={setSmartMemory}
              />
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <SettingRow
                icon="auto-fix-high"
                iconColor="#FF9800"
                label="Response Quality"
                description="Balanced (recommended)"
                onPress={() => {}}
              />
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <SettingRow
                icon="tune"
                iconColor="#00D4FF"
                label="AI Personality"
                description="Professional & Helpful"
                onPress={() => {}}
              />
            </Card>
          </View>

          {/* ── Notifications ── */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Notifications</Text>
            <Card>
              <SettingRow
                icon="notifications-active"
                iconColor="#00D4FF"
                label="Push Notifications"
                description="Alerts and reminders"
                toggle
                value={notifications}
                onToggle={setNotifications}
              />
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <SettingRow
                icon="vibration"
                iconColor="#9C27B0"
                label="Haptic Feedback"
                description="Vibration on interactions"
                toggle
                value={haptics}
                onToggle={setHaptics}
              />
            </Card>
          </View>

          {/* ── Data & Privacy ── */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Data & Privacy</Text>
            <Card>
              <SettingRow
                icon="cloud-sync"
                iconColor="#4CAF50"
                label="Cloud Sync"
                description="Sync across all devices"
                toggle
                value={cloudSync}
                onToggle={setCloudSync}
                badge={cloudSync ? undefined : 'Pro'}
                badgeVariant="gold"
              />
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <SettingRow
                icon="analytics"
                iconColor="#FF9800"
                label="Usage Analytics"
                description="Help improve SONA AI"
                toggle
                value={analytics}
                onToggle={setAnalytics}
              />
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <SettingRow
                icon="security"
                iconColor="#7C6FFF"
                label="Privacy Settings"
                description="Data handling preferences"
                onPress={() => {}}
              />
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <SettingRow
                icon="delete-forever"
                iconColor="#FF5252"
                label="Clear All Data"
                description="Remove all local data permanently"
                onPress={() => {}}
                destructive
              />
            </Card>
          </View>

          {/* ── About ── */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>About SONA AI</Text>
            <Card>
              <SettingRow icon="info-outline" iconColor="#7C6FFF" label="Version" description="SONA AI v1.0.0 (Build 100)" />
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <SettingRow icon="new-releases" iconColor="#00E676" label="What's New" badge="v1.0" badgeVariant="success" onPress={() => {}} />
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <SettingRow icon="description" iconColor="#00D4FF" label="Privacy Policy" onPress={() => {}} />
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <SettingRow icon="gavel" iconColor="#F5C842" label="Terms of Service" onPress={() => {}} />
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <SettingRow icon="star-rate" iconColor="#FF6B9D" label="Rate SONA AI" description="Leave us a review" onPress={() => {}} />
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
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.lg,
    gap: Spacing.md,
  },
  profileAvatar: { width: 68, height: 68, borderRadius: 34, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: FontSize.xxl + 4, fontWeight: FontWeight.extrabold, color: '#fff' },
  profileInfo: { flex: 1, gap: 4 },
  profileName: { fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  profileEmail: { fontSize: FontSize.sm },
  editProfileBtn: { width: 38, height: 38, borderRadius: BorderRadius.sm + 2, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },

  upgradeWrapper: { marginHorizontal: Spacing.md, marginBottom: Spacing.lg },
  upgradeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: BorderRadius.xl,
    padding: Spacing.md + 4,
    overflow: 'hidden',
  },
  upgradeLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  upgradeTitle: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: '#fff' },
  upgradeDesc: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.78)', marginTop: 2 },
  upgradeArrow: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  section: { paddingHorizontal: Spacing.md, marginBottom: Spacing.md },
  sectionTitle: {
    fontSize: FontSize.xxs + 1,
    fontWeight: FontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: Spacing.sm,
    paddingLeft: 2,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.sm + 2,
  },
  settingIcon: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.sm + 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingInfo: { flex: 1 },
  settingLabel: { fontSize: FontSize.base, fontWeight: FontWeight.medium },
  settingDesc: { fontSize: FontSize.xs, marginTop: 1 },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: 54 },
});
