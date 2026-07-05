import React, { useRef, useEffect, useState } from 'react';
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

const DEV_FLAGS = [
  { id: 'mockAI', label: 'Mock AI Responses', desc: 'Use local mock instead of real AI calls', default: true, color: '#7C6FFF' },
  { id: 'logNetwork', label: 'Network Logging', desc: 'Log all API requests to console', default: false, color: '#00D4FF' },
  { id: 'showLayouts', label: 'Show Layout Bounds', desc: 'Visualize component boundaries', default: false, color: '#FF9800' },
  { id: 'fastMode', label: 'Fast Mode', desc: 'Skip animations for faster testing', default: false, color: '#00E676' },
  { id: 'verbose', label: 'Verbose Logging', desc: 'Enable detailed debug output', default: false, color: '#FF6B9D' },
  { id: 'forceOnboard', label: 'Force Onboarding', desc: 'Show onboarding on next launch', default: false, color: '#F5C842' },
];

const PERFORMANCE_STATS = [
  { label: 'JS Bundle', value: '1.24 MB', icon: 'code', color: '#7C6FFF' },
  { label: 'Load Time', value: '248ms', icon: 'speed', color: '#00E676' },
  { label: 'Memory', value: '124 MB', icon: 'memory', color: '#FF9800' },
  { label: 'FPS', value: '60fps', icon: 'movie-filter', color: '#00D4FF' },
];

export default function DeveloperModeScreen() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [flags, setFlags] = useState(() => Object.fromEntries(DEV_FLAGS.map(f => [f.id, f.default])));
  const [devModeEnabled, setDevModeEnabled] = useState(true);

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }).start();
  }, []);

  const toggleFlag = (id: string) => setFlags(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <Animated.View style={[styles.flex, { opacity: fadeAnim }]}>
        <PageHeader title="Developer Mode" subtitle="Advanced debugging tools" />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          {/* Dev Mode Toggle */}
          <LinearGradient
            colors={devModeEnabled ? ['#00D4FF', '#0099CC'] : [colors.card, colors.card]}
            style={[styles.devBanner, { borderColor: devModeEnabled ? '#00D4FF40' : colors.cardBorder }]}
          >
            <View style={styles.devBannerLeft}>
              <View style={[styles.devIcon, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                <MaterialIcons name="developer-mode" size={28} color={devModeEnabled ? '#fff' : colors.textMuted} />
              </View>
              <View>
                <Text style={[styles.devTitle, { color: devModeEnabled ? '#fff' : colors.text }]}>Developer Mode</Text>
                <Text style={[styles.devSubtitle, { color: devModeEnabled ? 'rgba(255,255,255,0.7)' : colors.textMuted }]}>
                  {devModeEnabled ? 'Active · Dev tools enabled' : 'Disabled · Enable for tools'}
                </Text>
              </View>
            </View>
            <Switch
              value={devModeEnabled}
              onValueChange={setDevModeEnabled}
              trackColor={{ false: colors.border, true: 'rgba(255,255,255,0.4)' }}
              thumbColor={devModeEnabled ? '#fff' : colors.textMuted}
            />
          </LinearGradient>

          {devModeEnabled ? (
            <>
              {/* Performance Stats */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Performance</Text>
                <View style={styles.perfGrid}>
                  {PERFORMANCE_STATS.map(stat => (
                    <View key={stat.label} style={[styles.perfCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                      <View style={[styles.perfIcon, { backgroundColor: `${stat.color}20` }]}>
                        <MaterialIcons name={stat.icon as any} size={18} color={stat.color} />
                      </View>
                      <Text style={[styles.perfValue, { color: colors.text }]}>{stat.value}</Text>
                      <Text style={[styles.perfLabel, { color: colors.textMuted }]}>{stat.label}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Feature Flags */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Feature Flags</Text>
                <View style={[styles.flagsCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                  {DEV_FLAGS.map((flag, idx) => (
                    <View key={flag.id}>
                      <View style={styles.flagRow}>
                        <View style={[styles.flagIcon, { backgroundColor: `${flag.color}20` }]}>
                          <MaterialIcons name="flag" size={16} color={flag.color} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.flagLabel, { color: colors.text }]}>{flag.label}</Text>
                          <Text style={[styles.flagDesc, { color: colors.textMuted }]}>{flag.desc}</Text>
                        </View>
                        <Switch
                          value={flags[flag.id]}
                          onValueChange={() => toggleFlag(flag.id)}
                          trackColor={{ false: colors.border, true: `${flag.color}70` }}
                          thumbColor={flags[flag.id] ? flag.color : colors.textMuted}
                        />
                      </View>
                      {idx < DEV_FLAGS.length - 1 ? <View style={[styles.divider, { backgroundColor: colors.border, marginLeft: 50 }]} /> : null}
                    </View>
                  ))}
                </View>
              </View>

              {/* Quick Actions */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
                <View style={styles.actionsGrid}>
                  {[
                    { label: 'Debug Console', icon: 'terminal', color: '#00D4FF', onPress: () => router.push('/debug-console' as any) },
                    { label: 'Clear Cache', icon: 'cleaning-services', color: '#FF9800', onPress: () => {} },
                    { label: 'Reset App', icon: 'refresh', color: '#FF5252', onPress: () => {} },
                    { label: 'Export Logs', icon: 'file-download', color: '#00E676', onPress: () => {} },
                    { label: 'Test Crash', icon: 'bug-report', color: '#FF6B9D', onPress: () => {} },
                    { label: 'Storybook', icon: 'style', color: '#7C6FFF', onPress: () => {} },
                  ].map(action => (
                    <Pressable
                      key={action.label}
                      onPress={action.onPress}
                      style={({ pressed }) => [styles.actionCard, { backgroundColor: colors.card, borderColor: colors.cardBorder, opacity: pressed ? 0.8 : 1 }]}
                    >
                      <View style={[styles.actionIcon, { backgroundColor: `${action.color}20` }]}>
                        <MaterialIcons name={action.icon as any} size={22} color={action.color} />
                      </View>
                      <Text style={[styles.actionLabel, { color: colors.textSecondary }]}>{action.label}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Build Info */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Build Information</Text>
                <View style={[styles.buildCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                  {[
                    { label: 'App Version', value: '1.0.0 (100)' },
                    { label: 'Build Date', value: 'July 5, 2026' },
                    { label: 'Environment', value: 'Development' },
                    { label: 'Platform', value: 'Expo SDK 53' },
                    { label: 'React Native', value: '0.79.x' },
                    { label: 'Node', value: '20.x LTS' },
                  ].map((info, idx, arr) => (
                    <View key={info.label}>
                      <View style={styles.buildRow}>
                        <Text style={[styles.buildLabel, { color: colors.textMuted }]}>{info.label}</Text>
                        <Text style={[styles.buildValue, { color: colors.text }]}>{info.value}</Text>
                      </View>
                      {idx < arr.length - 1 ? <View style={[styles.divider, { backgroundColor: colors.border }]} /> : null}
                    </View>
                  ))}
                </View>
              </View>
            </>
          ) : (
            <View style={styles.disabledState}>
              <MaterialIcons name="lock" size={48} color={colors.textMuted} />
              <Text style={[styles.disabledTitle, { color: colors.text }]}>Developer Mode Disabled</Text>
              <Text style={[styles.disabledDesc, { color: colors.textSecondary }]}>Enable developer mode to access debugging tools, feature flags, and performance monitoring.</Text>
            </View>
          )}
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  devBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', margin: Spacing.md, padding: Spacing.md, borderRadius: BorderRadius.xxl, borderWidth: 1.5 },
  devBannerLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  devIcon: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  devTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  devSubtitle: { fontSize: FontSize.sm, marginTop: 2 },
  section: { paddingHorizontal: Spacing.md, marginBottom: Spacing.lg },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, marginBottom: Spacing.md },
  perfGrid: { flexDirection: 'row', gap: Spacing.sm },
  perfCard: { flex: 1, alignItems: 'center', gap: 5, padding: Spacing.sm + 2, borderRadius: BorderRadius.xl, borderWidth: 1 },
  perfIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  perfValue: { fontSize: FontSize.base, fontWeight: FontWeight.bold },
  perfLabel: { fontSize: FontSize.xxs },
  flagsCard: { borderRadius: BorderRadius.xl, borderWidth: 1, paddingVertical: Spacing.xs, paddingHorizontal: Spacing.md },
  flagRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.sm + 2 },
  flagIcon: { width: 34, height: 34, borderRadius: BorderRadius.sm, alignItems: 'center', justifyContent: 'center' },
  flagLabel: { fontSize: FontSize.base, fontWeight: FontWeight.medium },
  flagDesc: { fontSize: FontSize.xs, marginTop: 1 },
  divider: { height: StyleSheet.hairlineWidth },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  actionCard: { width: '30%', alignItems: 'center', gap: 7, paddingVertical: Spacing.md, borderRadius: BorderRadius.xl, borderWidth: 1 },
  actionIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  actionLabel: { fontSize: FontSize.xxs + 1, fontWeight: FontWeight.semibold, textAlign: 'center' },
  buildCard: { borderRadius: BorderRadius.xl, borderWidth: 1, paddingVertical: Spacing.xs, paddingHorizontal: Spacing.md },
  buildRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.sm + 2 },
  buildLabel: { fontSize: FontSize.sm },
  buildValue: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  disabledState: { alignItems: 'center', gap: Spacing.md, padding: Spacing.xxl },
  disabledTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold },
  disabledDesc: { fontSize: FontSize.base, textAlign: 'center', lineHeight: 24 },
});
