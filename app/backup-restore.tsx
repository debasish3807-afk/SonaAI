import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView, Animated,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/theme';
import { PageHeader } from '@/components/ui/PageHeader';
import { MOCK_BACKUPS } from '@/services/workspace.service';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useAlert } from '@/template';

const BACKUP_TYPE_META: Record<string, { icon: string; color: string; label: string }> = {
  auto:   { icon: 'autorenew', color: '#00D4FF', label: 'Auto' },
  manual: { icon: 'backup', color: '#7C6FFF', label: 'Manual' },
  cloud:  { icon: 'cloud-upload', color: '#00E676', label: 'Cloud' },
};

export default function BackupRestoreScreen() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const { showAlert } = useAlert();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [backupProgress, setBackupProgress] = useState<number | null>(null);
  const [isBackingUp, setIsBackingUp] = useState(false);

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }).start();
  }, []);

  const startBackup = () => {
    setIsBackingUp(true);
    setBackupProgress(0);
    const interval = setInterval(() => {
      setBackupProgress(prev => {
        if (prev === null || prev >= 100) {
          clearInterval(interval);
          setIsBackingUp(false);
          setBackupProgress(null);
          showAlert('Backup Complete', 'Your data has been backed up successfully');
          return null;
        }
        return prev + 8;
      });
    }, 180);
  };

  const handleRestore = (id: string) => {
    showAlert('Restore Backup?', 'This will replace your current data with the selected backup. This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Restore', style: 'destructive', onPress: () => {} },
    ]);
  };

  const lastBackup = MOCK_BACKUPS.find(b => b.status === 'completed');

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <Animated.View style={[styles.flex, { opacity: fadeAnim }]}>
        <PageHeader title="Backup & Restore" subtitle="Protect your SONA data" />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          {/* Status Card */}
          <LinearGradient
            colors={['#00E676', '#00AA55']}
            style={styles.statusCard}
          >
            <View style={styles.statusCardBg} />
            <View style={styles.statusIcon}>
              <MaterialIcons name="cloud-done" size={32} color="#fff" />
            </View>
            <View style={styles.statusInfo}>
              <Text style={styles.statusTitle}>Data Protected</Text>
              <Text style={styles.statusSub}>Last backed up: Today, 2 hours ago</Text>
              {lastBackup ? (
                <Text style={styles.statusDetails}>{lastBackup.size} · {lastBackup.itemCount} items</Text>
              ) : null}
            </View>
          </LinearGradient>

          {/* Backup Progress */}
          {isBackingUp && backupProgress !== null ? (
            <View style={[styles.progressCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <View style={styles.progressHeader}>
                <MaterialIcons name="cloud-upload" size={20} color="#7C6FFF" />
                <Text style={[styles.progressTitle, { color: colors.text }]}>Backing up...</Text>
                <Text style={[styles.progressPct, { color: '#7C6FFF' }]}>{backupProgress}%</Text>
              </View>
              <ProgressBar value={backupProgress} color="#7C6FFF" gradient={['#7C6FFF', '#00D4FF']} height={6} />
            </View>
          ) : null}

          {/* Auto Backup Settings */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Auto Backup</Text>
            <View style={[styles.settingsCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              {[
                { icon: 'schedule', color: '#00D4FF', label: 'Backup Frequency', value: 'Daily' },
                { icon: 'wifi', color: '#00E676', label: 'Wi-Fi Only', value: 'Enabled' },
                { icon: 'storage', color: '#F5C842', label: 'Storage Limit', value: '500 MB' },
                { icon: 'history', color: '#7C6FFF', label: 'Keep Backups', value: '30 days' },
              ].map((item, idx, arr) => (
                <View key={item.label}>
                  <Pressable style={({ pressed }) => [styles.settingRow, { opacity: pressed ? 0.8 : 1 }]}>
                    <View style={[styles.settingIcon, { backgroundColor: `${item.color}20` }]}>
                      <MaterialIcons name={item.icon as any} size={18} color={item.color} />
                    </View>
                    <Text style={[styles.settingLabel, { color: colors.text }]}>{item.label}</Text>
                    <Text style={[styles.settingValue, { color: colors.primary }]}>{item.value}</Text>
                    <MaterialIcons name="chevron-right" size={18} color={colors.textMuted} />
                  </Pressable>
                  {idx < arr.length - 1 ? <View style={[styles.divider, { backgroundColor: colors.border, marginLeft: 54 }]} /> : null}
                </View>
              ))}
            </View>
          </View>

          {/* Manual Backup Button */}
          <View style={styles.section}>
            <Pressable
              onPress={startBackup}
              disabled={isBackingUp}
              style={({ pressed }) => [{ opacity: pressed ? 0.9 : isBackingUp ? 0.6 : 1 }]}
            >
              <LinearGradient colors={['#7C6FFF', '#4A42CC']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.backupBtn}>
                <MaterialIcons name="backup" size={22} color="#fff" />
                <Text style={styles.backupBtnText}>{isBackingUp ? 'Creating Backup...' : 'Create Backup Now'}</Text>
              </LinearGradient>
            </Pressable>
          </View>

          {/* Backup History */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Backup History</Text>
            {MOCK_BACKUPS.map(backup => {
              const meta = BACKUP_TYPE_META[backup.type];
              return (
                <View key={backup.id} style={[styles.backupCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                  <View style={styles.backupHeader}>
                    <LinearGradient colors={[meta.color, `${meta.color}99`]} style={styles.backupIcon}>
                      <MaterialIcons name={meta.icon as any} size={20} color="#fff" />
                    </LinearGradient>
                    <View style={styles.backupInfo}>
                      <Text style={[styles.backupName, { color: colors.text }]}>{backup.name}</Text>
                      <Text style={[styles.backupMeta, { color: colors.textMuted }]}>
                        {backup.size} · {backup.itemCount} items · {meta.label}
                      </Text>
                    </View>
                    <StatusBadge status={backup.status === 'completed' ? 'completed' : backup.status === 'failed' ? 'error' : 'in_progress'} />
                  </View>

                  {backup.status === 'completed' ? (
                    <View style={styles.includesRow}>
                      {backup.includes.map(inc => (
                        <View key={inc} style={[styles.includeChip, { backgroundColor: `${meta.color}15` }]}>
                          <Text style={[styles.includeText, { color: meta.color }]}>{inc}</Text>
                        </View>
                      ))}
                    </View>
                  ) : null}

                  {backup.status === 'completed' ? (
                    <View style={styles.backupActions}>
                      <Pressable
                        onPress={() => handleRestore(backup.id)}
                        style={({ pressed }) => [styles.restoreBtn, { backgroundColor: `${meta.color}20`, borderColor: `${meta.color}40`, opacity: pressed ? 0.8 : 1 }]}
                      >
                        <MaterialIcons name="restore" size={15} color={meta.color} />
                        <Text style={[styles.restoreBtnText, { color: meta.color }]}>Restore</Text>
                      </Pressable>
                      <Pressable style={({ pressed }) => [styles.exportBtn, { backgroundColor: colors.cardBorder, opacity: pressed ? 0.8 : 1 }]}>
                        <MaterialIcons name="share" size={15} color={colors.textSecondary} />
                        <Text style={[styles.exportBtnText, { color: colors.textSecondary }]}>Export</Text>
                      </Pressable>
                    </View>
                  ) : null}
                </View>
              );
            })}
          </View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  statusCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, margin: Spacing.md, borderRadius: BorderRadius.xxl, padding: Spacing.lg, overflow: 'hidden' },
  statusCardBg: { position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(255,255,255,0.08)', top: -60, right: -40 },
  statusIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  statusInfo: { flex: 1 },
  statusTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.extrabold, color: '#fff' },
  statusSub: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.75)', marginTop: 3 },
  statusDetails: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  progressCard: { marginHorizontal: Spacing.md, padding: Spacing.md, borderRadius: BorderRadius.xl, borderWidth: 1, gap: Spacing.sm, marginBottom: Spacing.sm },
  progressHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  progressTitle: { flex: 1, fontSize: FontSize.base, fontWeight: FontWeight.semibold },
  progressPct: { fontSize: FontSize.base, fontWeight: FontWeight.bold },
  section: { paddingHorizontal: Spacing.md, marginBottom: Spacing.lg },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, marginBottom: Spacing.md },
  settingsCard: { borderRadius: BorderRadius.xl, borderWidth: 1, paddingVertical: Spacing.xs, paddingHorizontal: Spacing.md },
  settingRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.sm + 2 },
  settingIcon: { width: 38, height: 38, borderRadius: BorderRadius.sm + 2, alignItems: 'center', justifyContent: 'center' },
  settingLabel: { flex: 1, fontSize: FontSize.base, fontWeight: FontWeight.medium },
  settingValue: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  divider: { height: StyleSheet.hairlineWidth },
  backupBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, padding: Spacing.md + 2, borderRadius: BorderRadius.xl },
  backupBtnText: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: '#fff' },
  backupCard: { borderRadius: BorderRadius.xl, borderWidth: 1, padding: Spacing.md, marginBottom: Spacing.sm, gap: Spacing.sm },
  backupHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  backupIcon: { width: 48, height: 48, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center' },
  backupInfo: { flex: 1 },
  backupName: { fontSize: FontSize.base, fontWeight: FontWeight.semibold },
  backupMeta: { fontSize: FontSize.xs, marginTop: 2 },
  includesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  includeChip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: BorderRadius.full },
  includeText: { fontSize: FontSize.xxs + 1, fontWeight: FontWeight.semibold },
  backupActions: { flexDirection: 'row', gap: Spacing.sm },
  restoreBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full, borderWidth: 1 },
  restoreBtnText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  exportBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full },
  exportBtnText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
});
