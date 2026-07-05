import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView, Animated, Switch, TextInput,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/theme';
import { PageHeader } from '@/components/ui/PageHeader';
import { MOCK_SECURITY_EVENTS, MOCK_API_KEYS, APIKey } from '@/services/workspace.service';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useAlert } from '@/template';

const SEVERITY_COLOR: Record<string, string> = {
  low: '#00E676',
  medium: '#FF9800',
  high: '#FF5252',
};

export default function SecurityCenterScreen() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const { showAlert } = useAlert();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [sessionLockEnabled, setSessionLockEnabled] = useState(true);
  const [activityLogging, setActivityLogging] = useState(true);
  const [showKey, setShowKey] = useState<string | null>(null);

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }).start();
  }, []);

  const securityScore = [twoFAEnabled, biometricEnabled, sessionLockEnabled, activityLogging].filter(Boolean).length;
  const securityPct = (securityScore / 4) * 100;
  const securityColor = securityPct >= 75 ? '#00E676' : securityPct >= 50 ? '#FF9800' : '#FF5252';
  const securityLabel = securityPct >= 75 ? 'Strong' : securityPct >= 50 ? 'Moderate' : 'Weak';

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <Animated.View style={[styles.flex, { opacity: fadeAnim }]}>
        <PageHeader title="Security Center" subtitle="Protect your account" />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          {/* Security Score */}
          <LinearGradient
            colors={[securityColor, `${securityColor}99`]}
            style={styles.scoreCard}
          >
            <View style={styles.scoreBg} />
            <View style={styles.scoreLeft}>
              <View style={[styles.scoreCircle, { borderColor: 'rgba(255,255,255,0.3)' }]}>
                <Text style={styles.scoreNumber}>{securityScore * 25}</Text>
                <Text style={styles.scorePct}>/ 100</Text>
              </View>
            </View>
            <View style={styles.scoreRight}>
              <Text style={styles.scoreLabel}>Security Score</Text>
              <Text style={styles.scoreLevel}>{securityLabel} Protection</Text>
              <Text style={styles.scoreHint}>
                {securityPct < 100 ? `Enable ${4 - securityScore} more option${4 - securityScore !== 1 ? 's' : ''} to maximize security` : 'All security features enabled!'}
              </Text>
            </View>
          </LinearGradient>

          {/* Authentication */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Authentication</Text>
            <View style={[styles.settingsCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              {[
                { icon: 'security', color: '#7C6FFF', label: 'Two-Factor Auth', desc: 'Add an extra layer of security', value: twoFAEnabled, onToggle: setTwoFAEnabled },
                { icon: 'fingerprint', color: '#00D4FF', label: 'Biometric Login', desc: 'Use Face ID or fingerprint', value: biometricEnabled, onToggle: setBiometricEnabled },
                { icon: 'lock-clock', color: '#00E676', label: 'Session Lock', desc: 'Lock after 5 min inactivity', value: sessionLockEnabled, onToggle: setSessionLockEnabled },
              ].map((item, idx, arr) => (
                <View key={item.label}>
                  <View style={styles.settingRow}>
                    <View style={[styles.settingIcon, { backgroundColor: `${item.color}20` }]}>
                      <MaterialIcons name={item.icon as any} size={18} color={item.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.settingLabel, { color: colors.text }]}>{item.label}</Text>
                      <Text style={[styles.settingDesc, { color: colors.textMuted }]}>{item.desc}</Text>
                    </View>
                    <Switch
                      value={item.value}
                      onValueChange={item.onToggle}
                      trackColor={{ false: colors.border, true: `${item.color}70` }}
                      thumbColor={item.value ? item.color : colors.textMuted}
                    />
                  </View>
                  {idx < arr.length - 1 ? <View style={[styles.divider, { backgroundColor: colors.border, marginLeft: 54 }]} /> : null}
                </View>
              ))}
            </View>
          </View>

          {/* API Keys */}
          <View style={styles.section}>
            <View style={styles.sectionRow}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>API Keys</Text>
              <Pressable onPress={() => router.push('/api-manager' as any)}>
                <Text style={[styles.seeAll, { color: colors.primary }]}>Manage</Text>
              </Pressable>
            </View>
            {MOCK_API_KEYS.map(key => (
              <View key={key.id} style={[styles.keyCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                <View style={[styles.keyIcon, { backgroundColor: `${key.color}20` }]}>
                  <MaterialIcons name={key.icon as any} size={20} color={key.color} />
                </View>
                <View style={styles.keyInfo}>
                  <Text style={[styles.keyName, { color: colors.text }]}>{key.name}</Text>
                  <Text style={[styles.keyValue, { color: colors.textMuted }]}>
                    {showKey === key.id ? key.key : key.key.replace(/•{10,}/g, '••••••••')}
                  </Text>
                </View>
                <Pressable onPress={() => setShowKey(showKey === key.id ? null : key.id)} hitSlop={8}>
                  <MaterialIcons name={showKey === key.id ? 'visibility-off' : 'visibility'} size={18} color={colors.textMuted} />
                </Pressable>
                <View style={[styles.keyStatus, { backgroundColor: key.isActive ? '#00E67620' : '#9E9E9E20' }]}>
                  <View style={[styles.keyDot, { backgroundColor: key.isActive ? '#00E676' : '#9E9E9E' }]} />
                </View>
              </View>
            ))}
          </View>

          {/* Activity Log */}
          <View style={styles.section}>
            <View style={styles.sectionRow}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Security Activity</Text>
              <View style={[styles.loggingBadge, { backgroundColor: activityLogging ? '#00E67620' : colors.cardBorder }]}>
                <MaterialIcons name={activityLogging ? 'fiber-manual-record' : 'stop'} size={10} color={activityLogging ? '#00E676' : colors.textMuted} />
                <Text style={[styles.loggingText, { color: activityLogging ? '#00E676' : colors.textMuted }]}>
                  {activityLogging ? 'Logging' : 'Paused'}
                </Text>
              </View>
            </View>
            {MOCK_SECURITY_EVENTS.map(event => (
              <Pressable
                key={event.id}
                style={({ pressed }) => [styles.eventCard, { backgroundColor: colors.card, borderColor: colors.cardBorder, opacity: pressed ? 0.85 : 1 }]}
              >
                <View style={[styles.eventSeverity, { backgroundColor: `${SEVERITY_COLOR[event.severity]}20` }]}>
                  <View style={[styles.severityDot, { backgroundColor: SEVERITY_COLOR[event.severity] }]} />
                </View>
                <View style={styles.eventInfo}>
                  <Text style={[styles.eventDesc, { color: colors.text }]}>{event.description}</Text>
                  <View style={styles.eventMeta}>
                    <MaterialIcons name="devices" size={11} color={colors.textMuted} />
                    <Text style={[styles.eventMetaText, { color: colors.textMuted }]}>{event.device}</Text>
                    <MaterialIcons name="location-on" size={11} color={colors.textMuted} />
                    <Text style={[styles.eventMetaText, { color: colors.textMuted }]}>{event.location}</Text>
                  </View>
                </View>
                <Text style={[styles.eventTime, { color: colors.textMuted }]}>
                  {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Danger Zone */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.error ?? '#FF5252' }]}>Danger Zone</Text>
            <View style={[styles.dangerCard, { backgroundColor: '#FF525210', borderColor: '#FF525230' }]}>
              {[
                { label: 'Sign Out All Devices', icon: 'logout', desc: 'Revoke access from all other sessions' },
                { label: 'Delete Account', icon: 'delete-forever', desc: 'Permanently delete your SONA account' },
              ].map((item, idx) => (
                <View key={item.label}>
                  <Pressable
                    onPress={() => showAlert(`${item.label}?`, item.desc, [
                      { text: 'Cancel', style: 'cancel' },
                      { text: item.label, style: 'destructive', onPress: () => {} },
                    ])}
                    style={({ pressed }) => [styles.dangerRow, { opacity: pressed ? 0.8 : 1 }]}
                  >
                    <View style={styles.dangerIcon}>
                      <MaterialIcons name={item.icon as any} size={18} color="#FF5252" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.dangerLabel}>{item.label}</Text>
                      <Text style={[styles.dangerDesc, { color: '#FF525280' }]}>{item.desc}</Text>
                    </View>
                    <MaterialIcons name="chevron-right" size={18} color="#FF5252" />
                  </Pressable>
                  {idx === 0 ? <View style={[styles.divider, { backgroundColor: '#FF525220', marginLeft: 54 }]} /> : null}
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
  scoreCard: { flexDirection: 'row', margin: Spacing.md, borderRadius: BorderRadius.xxl, padding: Spacing.lg, overflow: 'hidden', gap: Spacing.md },
  scoreBg: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.08)', top: -60, right: -50 },
  scoreLeft: { alignItems: 'center', justifyContent: 'center' },
  scoreCircle: { width: 76, height: 76, borderRadius: 38, borderWidth: 3, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.15)' },
  scoreNumber: { fontSize: FontSize.xxl, fontWeight: FontWeight.extrabold, color: '#fff' },
  scorePct: { fontSize: FontSize.xxs, color: 'rgba(255,255,255,0.7)' },
  scoreRight: { flex: 1, justifyContent: 'center', gap: 4 },
  scoreLabel: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.7)' },
  scoreLevel: { fontSize: FontSize.xl, fontWeight: FontWeight.extrabold, color: '#fff' },
  scoreHint: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.65)', lineHeight: 17 },
  section: { paddingHorizontal: Spacing.md, marginBottom: Spacing.lg },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.md },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, marginBottom: Spacing.md },
  seeAll: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  settingsCard: { borderRadius: BorderRadius.xl, borderWidth: 1, paddingVertical: Spacing.xs, paddingHorizontal: Spacing.md },
  settingRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.sm + 2 },
  settingIcon: { width: 38, height: 38, borderRadius: BorderRadius.sm + 2, alignItems: 'center', justifyContent: 'center' },
  settingLabel: { fontSize: FontSize.base, fontWeight: FontWeight.medium },
  settingDesc: { fontSize: FontSize.xs, marginTop: 1 },
  divider: { height: StyleSheet.hairlineWidth },
  keyCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.md, borderRadius: BorderRadius.xl, borderWidth: 1, marginBottom: Spacing.sm },
  keyIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  keyInfo: { flex: 1 },
  keyName: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  keyValue: { fontSize: FontSize.xs, marginTop: 2, fontFamily: 'monospace' as any },
  keyStatus: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  keyDot: { width: 8, height: 8, borderRadius: 4 },
  loggingBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 9, paddingVertical: 4, borderRadius: BorderRadius.full },
  loggingText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold },
  eventCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.md, borderRadius: BorderRadius.xl, borderWidth: 1, marginBottom: Spacing.sm },
  eventSeverity: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  severityDot: { width: 8, height: 8, borderRadius: 4 },
  eventInfo: { flex: 1 },
  eventDesc: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  eventMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  eventMetaText: { fontSize: FontSize.xxs },
  eventTime: { fontSize: FontSize.xs },
  dangerCard: { borderRadius: BorderRadius.xl, borderWidth: 1, paddingVertical: Spacing.xs, paddingHorizontal: Spacing.md },
  dangerRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.sm + 2 },
  dangerIcon: { width: 38, height: 38, borderRadius: BorderRadius.sm + 2, backgroundColor: '#FF525215', alignItems: 'center', justifyContent: 'center' },
  dangerLabel: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: '#FF5252' },
  dangerDesc: { fontSize: FontSize.xs, marginTop: 1 },
});
