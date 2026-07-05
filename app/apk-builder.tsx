import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Pressable, TextInput,
  Switch, ActivityIndicator, Animated,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/hooks/useTheme';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PremiumButton } from '@/components/ui/PremiumButton';
import { BorderRadius, FontSize, FontWeight, Shadow, Spacing } from '@/constants/theme';

const APP_CATEGORIES = [
  { label: 'Productivity', icon: 'check-circle', color: '#7C6FFF' },
  { label: 'Social', icon: 'people', color: '#FF6B9D' },
  { label: 'Finance', icon: 'account-balance', color: '#00E676' },
  { label: 'Health', icon: 'favorite', color: '#FF5252' },
  { label: 'Education', icon: 'school', color: '#00D4FF' },
  { label: 'Entertainment', icon: 'movie', color: '#F5C842' },
  { label: 'Utility', icon: 'build', color: '#9C27B0' },
  { label: 'Games', icon: 'sports-esports', color: '#FF9800' },
];

const BUILD_PHASES = [
  { id: 1, title: 'Analyzing Requirements', desc: 'Processing your app idea', icon: 'analytics', color: '#7C6FFF' },
  { id: 2, title: 'Generating Code Structure', desc: 'Setting up architecture', icon: 'code', color: '#00D4FF' },
  { id: 3, title: 'Building UI Components', desc: 'Creating the interface', icon: 'design-services', color: '#F5C842' },
  { id: 4, title: 'Compiling APK', desc: 'Building the package', icon: 'build', color: '#FF9800' },
  { id: 5, title: 'Optimizing & Signing', desc: 'Finalizing the release', icon: 'security', color: '#00E676' },
];

type BuildStatus = 'idle' | 'building' | 'done';

export default function ApkBuilderScreen() {
  const { colors } = useTheme();
  const [appName, setAppName] = useState('');
  const [packageName, setPackageName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [darkTheme, setDarkTheme] = useState(true);
  const [offlineMode, setOfflineMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [buildStatus, setBuildStatus] = useState<BuildStatus>('idle');
  const [currentPhase, setCurrentPhase] = useState(0);

  const progressAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const successAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  const isFormValid = appName.trim().length > 0 && description.trim().length > 0 && category.length > 0;

  const handleBuild = async () => {
    if (!isFormValid) return;
    setBuildStatus('building');
    setCurrentPhase(0);
    progressAnim.setValue(0);

    for (let i = 1; i <= BUILD_PHASES.length; i++) {
      await new Promise(res => setTimeout(res, 1200));
      setCurrentPhase(i);
      Animated.timing(progressAnim, {
        toValue: i / BUILD_PHASES.length,
        duration: 1000,
        useNativeDriver: false,
      }).start();
    }

    setBuildStatus('done');
    Animated.spring(successAnim, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }).start();
  };

  const handleReset = () => {
    setBuildStatus('idle');
    setCurrentPhase(0);
    progressAnim.setValue(0);
    successAnim.setValue(0);
    setAppName('');
    setDescription('');
    setCategory('');
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const progressPercent = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 100],
  });

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <Animated.View style={[styles.flex, { opacity: fadeAnim }]}>
        <Header title="APK Builder" subtitle="AI Android app generator" showBack />

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* ── Hero ── */}
          <LinearGradient
            colors={['#4CAF50', '#2E7D32', '#1B5E20']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            <View style={styles.heroBg} />
            <View style={styles.heroLeft}>
              <Badge label="AI Powered" variant="success" />
              <Text style={styles.heroTitle}>APK Builder</Text>
              <Text style={styles.heroSub}>Describe your app idea, get a working Android APK</Text>
            </View>
            <MaterialIcons name="android" size={60} color="rgba(255,255,255,0.22)" />
          </LinearGradient>

          {buildStatus === 'done' ? (
            /* ── Success ── */
            <View style={styles.section}>
              <Animated.View style={{ transform: [{ scale: successAnim }] }}>
                <Card variant="glass">
                  <View style={styles.successContent}>
                    <LinearGradient colors={['#00E67633', '#00E67611']} style={styles.successIcon}>
                      <MaterialIcons name="android" size={44} color="#00E676" />
                    </LinearGradient>
                    <Badge label="APK Ready" variant="success" />
                    <Text style={[styles.successAppName, { color: colors.text }]}>{appName}.apk</Text>
                    <Text style={[styles.successMeta, { color: colors.textSecondary }]}>
                      12.4 MB · {category} · Optimized & Signed
                    </Text>

                    <View style={styles.apkInfo}>
                      {[
                        { label: 'Package', value: packageName || `com.sona.${appName.toLowerCase().replace(/\s/g, '')}` },
                        { label: 'Category', value: category },
                        { label: 'Min API', value: 'API 24 (Android 7.0+)' },
                        { label: 'Size', value: '12.4 MB' },
                      ].map(item => (
                        <View key={item.label} style={[styles.apkInfoRow, { borderBottomColor: colors.border }]}>
                          <Text style={[styles.apkInfoLabel, { color: colors.textMuted }]}>{item.label}</Text>
                          <Text style={[styles.apkInfoValue, { color: colors.text }]}>{item.value}</Text>
                        </View>
                      ))}
                    </View>

                    <View style={styles.apkActions}>
                      <PremiumButton
                        label="Download APK"
                        icon="download"
                        onPress={() => {}}
                        style={{ flex: 1 }}
                        gradientColors={['#00E676', '#00AA55']}
                        glow
                      />
                      <PremiumButton
                        label="Share"
                        icon="share"
                        onPress={() => {}}
                        variant="outline"
                        style={{ flex: 1 }}
                      />
                    </View>
                    <PremiumButton
                      label="Build Another App"
                      onPress={handleReset}
                      variant="ghost"
                      icon="refresh"
                      fullWidth
                    />
                  </View>
                </Card>
              </Animated.View>
            </View>
          ) : buildStatus === 'building' ? (
            /* ── Building ── */
            <View style={styles.section}>
              <Card>
                <Text style={[styles.buildingTitle, { color: colors.text }]}>
                  Building <Text style={{ color: colors.primary }}>{appName}</Text>...
                </Text>

                <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
                  <Animated.View style={[styles.progressFill, { width: progressWidth }]}>
                    <LinearGradient
                      colors={['#4CAF50', '#00E676']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={StyleSheet.absoluteFill}
                    />
                  </Animated.View>
                </View>
                <View style={styles.progressLabelRow}>
                  <Text style={[styles.progressLabel, { color: colors.textMuted }]}>
                    Phase {Math.min(currentPhase, BUILD_PHASES.length)} of {BUILD_PHASES.length}
                  </Text>
                  <Animated.Text style={[styles.progressPercent, { color: colors.primary }]}>
                    {String(Math.round((currentPhase / BUILD_PHASES.length) * 100))}%
                  </Animated.Text>
                </View>

                <View style={styles.phasesContainer}>
                  {BUILD_PHASES.map((phase, idx) => {
                    const isDone = idx < currentPhase;
                    const isActive = idx === currentPhase - 1;
                    return (
                      <View key={phase.id} style={styles.phaseRow}>
                        <View style={[
                          styles.phaseIcon,
                          {
                            backgroundColor: isDone
                              ? `${colors.success}22`
                              : isActive ? `${phase.color}22` : colors.card,
                          },
                        ]}>
                          {isDone ? (
                            <MaterialIcons name="check" size={16} color={colors.success} />
                          ) : isActive ? (
                            <ActivityIndicator size="small" color={phase.color} />
                          ) : (
                            <MaterialIcons name={phase.icon as any} size={16} color={colors.textMuted} />
                          )}
                        </View>
                        <View style={styles.phaseInfo}>
                          <Text style={[styles.phaseTitle, { color: isDone ? colors.text : isActive ? phase.color : colors.textMuted }]}>
                            {phase.title}
                          </Text>
                          <Text style={[styles.phaseDesc, { color: colors.textMuted }]}>{phase.desc}</Text>
                        </View>
                        {isDone ? <MaterialIcons name="check-circle" size={18} color={colors.success} /> : null}
                      </View>
                    );
                  })}
                </View>
              </Card>
            </View>
          ) : (
            /* ── Form ── */
            <>
              {/* App Info */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>App Information</Text>
                <View style={styles.formGroup}>
                  <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>App Name *</Text>
                  <View style={[styles.fieldInput, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                    <MaterialIcons name="apps" size={18} color={colors.textMuted} style={styles.fieldIcon} />
                    <TextInput
                      value={appName}
                      onChangeText={setAppName}
                      placeholder="My Amazing App"
                      placeholderTextColor={colors.textMuted}
                      style={[styles.input, { color: colors.text }]}
                    />
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Package Name</Text>
                  <View style={[styles.fieldInput, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                    <MaterialIcons name="code" size={18} color={colors.textMuted} style={styles.fieldIcon} />
                    <TextInput
                      value={packageName}
                      onChangeText={setPackageName}
                      placeholder="com.yourname.app"
                      placeholderTextColor={colors.textMuted}
                      style={[styles.input, { color: colors.text }]}
                    />
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>App Description *</Text>
                  <View style={[styles.fieldInputMulti, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                    <TextInput
                      value={description}
                      onChangeText={setDescription}
                      placeholder="Describe what your app does, its core features, and target audience..."
                      placeholderTextColor={colors.textMuted}
                      multiline
                      numberOfLines={4}
                      style={[styles.input, { color: colors.text, minHeight: 90 }]}
                    />
                  </View>
                </View>
              </View>

              {/* Category */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>App Category *</Text>
                <View style={styles.categoriesGrid}>
                  {APP_CATEGORIES.map(cat => {
                    const isSelected = category === cat.label;
                    return (
                      <Pressable
                        key={cat.label}
                        onPress={() => setCategory(cat.label)}
                        style={({ pressed }) => [
                          styles.categoryBtn,
                          {
                            backgroundColor: isSelected ? `${cat.color}22` : colors.card,
                            borderColor: isSelected ? cat.color : colors.cardBorder,
                            borderWidth: isSelected ? 1.5 : 1,
                            opacity: pressed ? 0.85 : 1,
                          },
                        ]}
                      >
                        <MaterialIcons name={cat.icon as any} size={16} color={isSelected ? cat.color : colors.textMuted} />
                        <Text style={[styles.categoryText, { color: isSelected ? cat.color : colors.textSecondary }]}>
                          {cat.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Options */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Build Options</Text>
                <Card>
                  {[
                    { label: 'Dark Theme', desc: 'Enable dark mode by default', value: darkTheme, onChange: setDarkTheme, color: '#7C6FFF' },
                    { label: 'Offline Mode', desc: 'Works without internet connection', value: offlineMode, onChange: setOfflineMode, color: '#4CAF50' },
                    { label: 'Push Notifications', desc: 'Enable notification support', value: notifications, onChange: setNotifications, color: '#FF9800' },
                  ].map((opt, idx, arr) => (
                    <View key={opt.label}>
                      <View style={styles.optionRow}>
                        <View style={styles.optionInfo}>
                          <Text style={[styles.optionLabel, { color: colors.text }]}>{opt.label}</Text>
                          <Text style={[styles.optionDesc, { color: colors.textMuted }]}>{opt.desc}</Text>
                        </View>
                        <Switch
                          value={opt.value}
                          onValueChange={opt.onChange}
                          trackColor={{ false: colors.border, true: `${opt.color}88` }}
                          thumbColor={opt.value ? opt.color : colors.textMuted}
                        />
                      </View>
                      {idx < arr.length - 1 ? (
                        <View style={[styles.divider, { backgroundColor: colors.border }]} />
                      ) : null}
                    </View>
                  ))}
                </Card>
              </View>

              {/* Build */}
              <View style={[styles.section, { paddingBottom: 36 }]}>
                <PremiumButton
                  label="Build APK with AI"
                  onPress={handleBuild}
                  disabled={!isFormValid}
                  icon="android"
                  fullWidth
                  glow={isFormValid}
                  gradientColors={['#4CAF50', '#00E676']}
                  size="lg"
                />
                {!isFormValid ? (
                  <Text style={[styles.validationHint, { color: colors.textMuted }]}>
                    Fill in App Name, Description, and Category to continue
                  </Text>
                ) : null}
              </View>
            </>
          )}
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    margin: Spacing.md,
    borderRadius: BorderRadius.xxl,
    padding: Spacing.lg,
    overflow: 'hidden',
    gap: Spacing.md,
  },
  heroBg: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.05)',
    top: -50,
    right: -40,
  },
  heroLeft: { flex: 1, gap: Spacing.sm },
  heroTitle: { fontSize: FontSize.xxl, fontWeight: FontWeight.extrabold, color: '#fff' },
  heroSub: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.75)', lineHeight: 20 },

  section: { paddingHorizontal: Spacing.md, marginBottom: Spacing.lg },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, marginBottom: Spacing.md },

  formGroup: { marginBottom: Spacing.md },
  fieldLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, marginBottom: 6 },
  fieldInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    minHeight: 50,
  },
  fieldInputMulti: { borderRadius: BorderRadius.md, borderWidth: 1, padding: Spacing.md },
  fieldIcon: { marginRight: Spacing.sm },
  input: { flex: 1, fontSize: FontSize.base, includeFontPadding: false, lineHeight: 22 },

  categoriesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  categoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  categoryText: { fontSize: FontSize.sm, fontWeight: FontWeight.medium },

  optionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.sm },
  optionInfo: { flex: 1 },
  optionLabel: { fontSize: FontSize.base, fontWeight: FontWeight.medium },
  optionDesc: { fontSize: FontSize.xs, marginTop: 2 },
  divider: { height: StyleSheet.hairlineWidth },
  validationHint: { fontSize: FontSize.xs, textAlign: 'center', marginTop: Spacing.sm },

  buildingTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, marginBottom: Spacing.md },
  progressTrack: { height: 10, borderRadius: 5, overflow: 'hidden', marginBottom: Spacing.xs },
  progressFill: { height: '100%', borderRadius: 5, overflow: 'hidden' },
  progressLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.lg },
  progressLabel: { fontSize: FontSize.sm },
  progressPercent: { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  phasesContainer: { gap: 2 },
  phaseRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.sm },
  phaseIcon: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  phaseInfo: { flex: 1 },
  phaseTitle: { fontSize: FontSize.base, fontWeight: FontWeight.semibold },
  phaseDesc: { fontSize: FontSize.xs, marginTop: 1 },

  successContent: { alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.md },
  successIcon: { width: 90, height: 90, borderRadius: 45, alignItems: 'center', justifyContent: 'center' },
  successAppName: { fontSize: FontSize.xxl, fontWeight: FontWeight.extrabold },
  successMeta: { fontSize: FontSize.sm },
  apkInfo: { width: '100%', borderRadius: BorderRadius.lg, overflow: 'hidden' },
  apkInfoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: Spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth },
  apkInfoLabel: { fontSize: FontSize.sm },
  apkInfoValue: { fontSize: FontSize.sm, fontWeight: FontWeight.medium },
  apkActions: { flexDirection: 'row', gap: Spacing.sm, width: '100%' },
});
