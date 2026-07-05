import React, { useState } from 'react';
import { View, Text, Switch, ScrollView, Pressable, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/hooks/useTheme';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/theme';

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
  disabled?: boolean;
}

const SettingRow: React.FC<SettingRowProps> = ({
  icon, iconColor, label, description, toggle, value, onToggle, onPress, badge, disabled,
}) => {
  const { colors } = useTheme();
  const Wrapper = toggle ? View : Pressable;
  const wrapperProps = toggle ? {} : { onPress, style: ({ pressed }: any) => ({ opacity: pressed ? 0.8 : 1 }) };

  return (
    <Pressable
      onPress={!toggle ? onPress : undefined}
      disabled={disabled}
      style={({ pressed }) => [styles.settingRow, { opacity: pressed && !toggle ? 0.8 : 1 }]}
    >
      <View style={[styles.settingIcon, { backgroundColor: `${iconColor}22` }]}>
        <MaterialIcons name={icon as any} size={20} color={iconColor} />
      </View>
      <View style={styles.settingInfo}>
        <Text style={[styles.settingLabel, { color: disabled ? colors.textMuted : colors.text }]}>{label}</Text>
        {description ? <Text style={[styles.settingDesc, { color: colors.textMuted }]}>{description}</Text> : null}
      </View>
      {badge ? <Badge label={badge} variant="primary" /> : null}
      {toggle ? (
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: colors.border, true: `${colors.primary}88` }}
          thumbColor={value ? colors.primary : colors.textMuted}
        />
      ) : (
        <MaterialIcons name="chevron-right" size={20} color={colors.textMuted} />
      )}
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

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileSection}>
          <LinearGradient colors={['#6C63FF', '#00D4FF']} style={styles.profileAvatar}>
            <Text style={styles.avatarText}>S</Text>
          </LinearGradient>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: colors.text }]}>SONA User</Text>
            <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>user@sona.ai · Free Plan</Text>
          </View>
          <Badge label="Free" variant="secondary" />
        </View>

        {/* Upgrade Banner */}
        <Pressable style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1, marginHorizontal: Spacing.md, marginBottom: Spacing.lg }]}>
          <LinearGradient colors={['#6C63FF', '#00D4FF']} style={styles.upgradeBanner}>
            <View>
              <Text style={styles.upgradeTitle}>Upgrade to SONA Pro</Text>
              <Text style={styles.upgradeDesc}>Unlimited AI, voice, image generation & more</Text>
            </View>
            <MaterialIcons name="arrow-forward" size={24} color="#fff" />
          </LinearGradient>
        </Pressable>

        {/* Appearance */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Appearance</Text>
          <Card>
            <SettingRow icon="dark-mode" iconColor="#6C63FF" label="Dark Mode" description="Switch between light and dark" toggle value={isDark} onToggle={toggleTheme} />
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <SettingRow icon="text-fields" iconColor="#00D4FF" label="Font Size" description="Adjust text size" onPress={() => {}} />
          </Card>
        </View>

        {/* AI Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>AI Settings</Text>
          <Card>
            <SettingRow icon="auto-awesome" iconColor="#FFD700" label="AI Model" description="Gemini 2.0 Flash" badge="Default" onPress={() => {}} />
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <SettingRow icon="mic" iconColor="#FF6B9D" label="Voice Assistant" description="Enable voice interactions" toggle value={voiceEnabled} onToggle={setVoiceEnabled} />
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <SettingRow icon="memory" iconColor="#00E676" label="Smart Memory" description="AI-powered memory recall" toggle value={true} onToggle={() => {}} />
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <SettingRow icon="image" iconColor="#FF9800" label="Image Generation" description="AI image creation quality" onPress={() => {}} />
          </Card>
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Notifications</Text>
          <Card>
            <SettingRow icon="notifications" iconColor="#00D4FF" label="Push Notifications" toggle value={notifications} onToggle={setNotifications} />
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <SettingRow icon="vibration" iconColor="#9C27B0" label="Haptic Feedback" toggle value={haptics} onToggle={setHaptics} />
          </Card>
        </View>

        {/* Data & Privacy */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Data & Privacy</Text>
          <Card>
            <SettingRow icon="cloud-sync" iconColor="#4CAF50" label="Cloud Sync" description="Sync data to cloud" toggle value={cloudSync} onToggle={setCloudSync} badge={cloudSync ? undefined : 'Soon'} />
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <SettingRow icon="analytics" iconColor="#FF9800" label="Analytics" description="Help improve SONA AI" toggle value={analytics} onToggle={setAnalytics} />
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <SettingRow icon="delete-forever" iconColor="#FF5252" label="Clear All Data" description="Remove all local data" onPress={() => {}} />
          </Card>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>About</Text>
          <Card>
            <SettingRow icon="info" iconColor="#6C63FF" label="Version" description="SONA AI v1.0.0" />
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <SettingRow icon="description" iconColor="#00D4FF" label="Privacy Policy" onPress={() => {}} />
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <SettingRow icon="gavel" iconColor="#FFD700" label="Terms of Service" onPress={() => {}} />
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <SettingRow icon="star" iconColor="#FF6B9D" label="Rate SONA AI" onPress={() => {}} />
          </Card>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  profileSection: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.lg, gap: Spacing.md },
  profileAvatar: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: FontSize.xxl, fontWeight: FontWeight.extrabold, color: '#fff' },
  profileInfo: { flex: 1 },
  profileName: { fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  profileEmail: { fontSize: FontSize.sm, marginTop: 2 },
  upgradeBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: BorderRadius.xl, padding: Spacing.lg },
  upgradeTitle: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: '#fff' },
  upgradeDesc: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  section: { paddingHorizontal: Spacing.md, marginBottom: Spacing.lg },
  sectionTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: Spacing.sm },
  settingRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.sm },
  settingIcon: { width: 40, height: 40, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center' },
  settingInfo: { flex: 1 },
  settingLabel: { fontSize: FontSize.base, fontWeight: FontWeight.medium },
  settingDesc: { fontSize: FontSize.xs, marginTop: 2 },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: 56 },
});
