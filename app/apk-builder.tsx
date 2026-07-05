import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, TextInput, Switch, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/hooks/useTheme';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/theme';

const APP_CATEGORIES = ['Productivity', 'Social', 'Finance', 'Health', 'Education', 'Entertainment', 'Utility', 'Games'];
const BUILD_PHASES = [
  { id: 1, title: 'Analyzing Requirements', icon: 'analytics' },
  { id: 2, title: 'Generating Code Structure', icon: 'code' },
  { id: 3, title: 'Building UI Components', icon: 'design-services' },
  { id: 4, title: 'Compiling APK', icon: 'build' },
  { id: 5, title: 'Optimizing & Signing', icon: 'security' },
];

type BuildStatus = 'idle' | 'building' | 'done' | 'error';

export default function ApkBuilderScreen() {
  const { colors } = useTheme();
  const [appName, setAppName] = useState('');
  const [packageName, setPackageName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [darkTheme, setDarkTheme] = useState(true);
  const [offlineMode, setOfflineMode] = useState(false);
  const [buildStatus, setBuildStatus] = useState<BuildStatus>('idle');
  const [currentPhase, setCurrentPhase] = useState(0);
  const [progress, setProgress] = useState(0);

  const isFormValid = appName.trim() && description.trim() && category;

  const handleBuild = async () => {
    if (!isFormValid) return;
    setBuildStatus('building');
    setCurrentPhase(0);
    setProgress(0);

    for (let i = 1; i <= BUILD_PHASES.length; i++) {
      await new Promise(res => setTimeout(res, 1200));
      setCurrentPhase(i);
      setProgress(Math.round((i / BUILD_PHASES.length) * 100));
    }
    setBuildStatus('done');
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <Header title="APK Builder" subtitle="Build Android apps with AI" showBack />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <LinearGradient colors={['#4CAF50', '#00E676']} style={styles.hero}>
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>AI APK Builder</Text>
            <Text style={styles.heroSub}>Describe your app idea and get a working APK</Text>
          </View>
          <MaterialIcons name="android" size={60} color="rgba(255,255,255,0.3)" />
        </LinearGradient>

        {buildStatus === 'done' ? (
          <View style={styles.section}>
            <Card style={styles.successCard} variant="glass">
              <View style={[styles.successIcon, { backgroundColor: '#00E67622' }]}>
                <MaterialIcons name="android" size={40} color="#00E676" />
              </View>
              <Badge label="APK Ready" variant="success" />
              <Text style={[styles.successTitle, { color: colors.text }]}>{appName}.apk</Text>
              <Text style={[styles.successSize, { color: colors.textSecondary }]}>12.4 MB · Optimized</Text>
              <View style={styles.apkActions}>
                <Pressable style={[styles.apkBtn, { backgroundColor: '#00E676' }]}>
                  <MaterialIcons name="download" size={20} color="#fff" />
                  <Text style={styles.apkBtnText}>Download APK</Text>
                </Pressable>
                <Pressable style={[styles.apkBtnOutline, { borderColor: colors.primary }]}>
                  <MaterialIcons name="share" size={20} color={colors.primary} />
                  <Text style={[styles.apkBtnOutlineText, { color: colors.primary }]}>Share</Text>
                </Pressable>
              </View>
              <Pressable onPress={() => { setBuildStatus('idle'); setCurrentPhase(0); setProgress(0); }} style={styles.buildAgainBtn}>
                <Text style={[styles.buildAgainText, { color: colors.primary }]}>Build Another App</Text>
              </Pressable>
            </Card>
          </View>
        ) : buildStatus === 'building' ? (
          <View style={styles.section}>
            <Card>
              <Text style={[styles.buildingTitle, { color: colors.text }]}>Building {appName}...</Text>
              {/* Progress Bar */}
              <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
                <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: '#4CAF50' }]} />
              </View>
              <Text style={[styles.progressText, { color: colors.textSecondary }]}>{progress}% complete</Text>

              {BUILD_PHASES.map((phase, idx) => (
                <View key={phase.id} style={styles.phaseRow}>
                  <View style={[
                    styles.phaseIcon,
                    { backgroundColor: idx < currentPhase ? '#00E67622' : idx === currentPhase - 1 ? `${colors.primary}22` : colors.card },
                  ]}>
                    {idx < currentPhase ? (
                      <MaterialIcons name="check" size={16} color="#00E676" />
                    ) : idx === currentPhase - 1 ? (
                      <ActivityIndicator size="small" color={colors.primary} />
                    ) : (
                      <MaterialIcons name={phase.icon as any} size={16} color={colors.textMuted} />
                    )}
                  </View>
                  <Text style={[styles.phaseTitle, { color: idx < currentPhase ? colors.text : idx === currentPhase - 1 ? colors.primary : colors.textMuted }]}>
                    {phase.title}
                  </Text>
                  {idx < currentPhase ? <MaterialIcons name="check-circle" size={16} color="#00E676" /> : null}
                </View>
              ))}
            </Card>
          </View>
        ) : (
          <>
            {/* App Info */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>App Information</Text>
              <View style={styles.formGroup}>
                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>App Name *</Text>
                <View style={[styles.fieldInput, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <TextInput value={appName} onChangeText={setAppName} placeholder="My Amazing App" placeholderTextColor={colors.textMuted} style={[styles.input, { color: colors.text }]} />
                </View>
              </View>
              <View style={styles.formGroup}>
                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Package Name</Text>
                <View style={[styles.fieldInput, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <TextInput value={packageName} onChangeText={setPackageName} placeholder="com.yourname.app" placeholderTextColor={colors.textMuted} style={[styles.input, { color: colors.text }]} />
                </View>
              </View>
              <View style={styles.formGroup}>
                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>App Description *</Text>
                <View style={[styles.fieldInput, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <TextInput value={description} onChangeText={setDescription} placeholder="Describe what your app does, its features, target users..." placeholderTextColor={colors.textMuted} multiline numberOfLines={4} style={[styles.input, { color: colors.text, minHeight: 80 }]} />
                </View>
              </View>
            </View>

            {/* Category */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Category *</Text>
              <View style={styles.categoriesGrid}>
                {APP_CATEGORIES.map(cat => (
                  <Pressable
                    key={cat}
                    onPress={() => setCategory(cat)}
                    style={[
                      styles.categoryBtn,
                      { backgroundColor: category === cat ? '#4CAF5022' : colors.card, borderColor: category === cat ? '#4CAF50' : colors.border },
                    ]}
                  >
                    <Text style={[styles.categoryText, { color: category === cat ? '#4CAF50' : colors.textSecondary }]}>{cat}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Options */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Options</Text>
              <Card>
                <View style={styles.optionRow}>
                  <View style={styles.optionInfo}>
                    <Text style={[styles.optionLabel, { color: colors.text }]}>Dark Theme</Text>
                    <Text style={[styles.optionDesc, { color: colors.textMuted }]}>Enable dark mode by default</Text>
                  </View>
                  <Switch value={darkTheme} onValueChange={setDarkTheme} trackColor={{ false: colors.border, true: '#4CAF5088' }} thumbColor={darkTheme ? '#4CAF50' : colors.textMuted} />
                </View>
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                <View style={styles.optionRow}>
                  <View style={styles.optionInfo}>
                    <Text style={[styles.optionLabel, { color: colors.text }]}>Offline Mode</Text>
                    <Text style={[styles.optionDesc, { color: colors.textMuted }]}>Work without internet connection</Text>
                  </View>
                  <Switch value={offlineMode} onValueChange={setOfflineMode} trackColor={{ false: colors.border, true: '#4CAF5088' }} thumbColor={offlineMode ? '#4CAF50' : colors.textMuted} />
                </View>
              </Card>
            </View>

            {/* Build */}
            <View style={[styles.section, { paddingBottom: 32 }]}>
              <Pressable
                onPress={handleBuild}
                disabled={!isFormValid}
                style={({ pressed }) => [styles.buildBtn, { opacity: !isFormValid ? 0.5 : pressed ? 0.85 : 1 }]}
              >
                <LinearGradient colors={['#4CAF50', '#00E676']} style={styles.buildGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                  <MaterialIcons name="android" size={24} color="#fff" />
                  <Text style={styles.buildBtnText}>Build APK with AI</Text>
                </LinearGradient>
              </Pressable>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  hero: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', margin: Spacing.md, borderRadius: BorderRadius.xxl, padding: Spacing.lg, overflow: 'hidden' },
  heroContent: { flex: 1 },
  heroTitle: { fontSize: FontSize.xxl, fontWeight: FontWeight.extrabold, color: '#fff' },
  heroSub: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.8)', marginTop: 6, lineHeight: 20 },
  section: { paddingHorizontal: Spacing.md, marginBottom: Spacing.lg },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, marginBottom: Spacing.md },
  formGroup: { marginBottom: Spacing.md },
  fieldLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, marginBottom: 6 },
  fieldInput: { borderRadius: BorderRadius.md, borderWidth: 1, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  input: { fontSize: FontSize.base, includeFontPadding: false },
  categoriesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  categoryBtn: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full, borderWidth: 1.5 },
  categoryText: { fontSize: FontSize.sm, fontWeight: FontWeight.medium },
  optionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.sm },
  optionInfo: { flex: 1 },
  optionLabel: { fontSize: FontSize.base, fontWeight: FontWeight.medium },
  optionDesc: { fontSize: FontSize.xs, marginTop: 2 },
  divider: { height: StyleSheet.hairlineWidth, marginVertical: Spacing.xs },
  buildBtn: { borderRadius: BorderRadius.xl, overflow: 'hidden' },
  buildGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, paddingVertical: Spacing.md + 4 },
  buildBtnText: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: '#fff' },
  buildingTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, marginBottom: Spacing.md },
  progressTrack: { height: 8, borderRadius: 4, marginBottom: Spacing.sm, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  progressText: { fontSize: FontSize.sm, marginBottom: Spacing.lg },
  phaseRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.sm },
  phaseIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  phaseTitle: { flex: 1, fontSize: FontSize.base, fontWeight: FontWeight.medium },
  successCard: { alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.xl },
  successIcon: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center' },
  successTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.extrabold },
  successSize: { fontSize: FontSize.sm },
  apkActions: { flexDirection: 'row', gap: Spacing.md, width: '100%' },
  apkBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: Spacing.md, borderRadius: BorderRadius.md },
  apkBtnText: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: '#fff' },
  apkBtnOutline: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: Spacing.md, borderRadius: BorderRadius.md, borderWidth: 1.5 },
  apkBtnOutlineText: { fontSize: FontSize.base, fontWeight: FontWeight.bold },
  buildAgainBtn: { paddingVertical: Spacing.sm },
  buildAgainText: { fontSize: FontSize.base, fontWeight: FontWeight.medium },
});
