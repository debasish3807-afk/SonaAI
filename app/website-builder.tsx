import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Pressable, TextInput,
  ActivityIndicator, Animated,
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

const TEMPLATES = [
  { id: '1', name: 'Portfolio', icon: 'person', color: '#7C6FFF', desc: 'Personal showcase website', gradient: ['#7C6FFF', '#4A42CC'] as [string, string] },
  { id: '2', name: 'Landing Page', icon: 'rocket-launch', color: '#00D4FF', desc: 'Product launch & marketing', gradient: ['#00D4FF', '#0099CC'] as [string, string] },
  { id: '3', name: 'Blog', icon: 'article', color: '#F5C842', desc: 'Content publishing platform', gradient: ['#F5C842', '#D4A000'] as [string, string] },
  { id: '4', name: 'E-Commerce', icon: 'shopping-cart', color: '#FF6B9D', desc: 'Online store with checkout', gradient: ['#FF6B9D', '#CC3366'] as [string, string] },
  { id: '5', name: 'SaaS App', icon: 'cloud', color: '#00E676', desc: 'Software as a service', gradient: ['#00E676', '#00AA55'] as [string, string] },
  { id: '6', name: 'Restaurant', icon: 'restaurant', color: '#FF9800', desc: 'Food & dining business', gradient: ['#FF9800', '#E65100'] as [string, string] },
];

const BUILD_STEPS = [
  { id: 1, title: 'Analyzing Requirements', desc: 'Understanding your vision', icon: 'analytics', color: '#7C6FFF' },
  { id: 2, title: 'Generating Structure', desc: 'Building page layout', icon: 'developer-mode', color: '#00D4FF' },
  { id: 3, title: 'Designing Components', desc: 'Creating UI elements', icon: 'design-services', color: '#F5C842' },
  { id: 4, title: 'Publishing Website', desc: 'Deploying to the cloud', icon: 'rocket-launch', color: '#00E676' },
];

type BuildState = 'idle' | 'building' | 'done';

export default function WebsiteBuilderScreen() {
  const { colors, isDark } = useTheme();
  const [description, setDescription] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [buildState, setBuildState] = useState<BuildState>('idle');
  const [currentStep, setCurrentStep] = useState(0);
  const [previewUrl, setPreviewUrl] = useState('');

  const progressAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const successAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  const handleBuild = async () => {
    if (!description.trim()) return;
    setBuildState('building');
    setCurrentStep(0);
    progressAnim.setValue(0);

    for (let i = 1; i <= BUILD_STEPS.length; i++) {
      await new Promise(res => setTimeout(res, 1100));
      setCurrentStep(i);
      Animated.timing(progressAnim, {
        toValue: i / BUILD_STEPS.length,
        duration: 900,
        useNativeDriver: false,
      }).start();
    }

    setPreviewUrl('https://sona-ai.vercel.app/preview-demo');
    setBuildState('done');
    Animated.spring(successAnim, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }).start();
  };

  const handleReset = () => {
    setBuildState('idle');
    setCurrentStep(0);
    setPreviewUrl('');
    setDescription('');
    progressAnim.setValue(0);
    successAnim.setValue(0);
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <Animated.View style={[styles.flex, { opacity: fadeAnim }]}>
        <Header title="Website Builder" subtitle="Build with AI" showBack />

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* ── Hero ── */}
          <LinearGradient
            colors={['#FF9800', '#E65100', '#8B2A00']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            <View style={styles.heroBg} />
            <View style={styles.heroLeft}>
              <Badge label="AI Builder" variant="warning" />
              <Text style={styles.heroTitle}>Website Builder</Text>
              <Text style={styles.heroSub}>Describe your vision, SONA builds it in seconds</Text>
            </View>
            <MaterialIcons name="language" size={56} color="rgba(255,255,255,0.22)" />
          </LinearGradient>

          {buildState === 'done' ? (
            /* ── Success State ── */
            <View style={styles.section}>
              <Animated.View style={{ transform: [{ scale: successAnim }] }}>
                <Card variant="glass">
                  <View style={styles.successContent}>
                    <LinearGradient colors={['#00E67633', '#00E67611']} style={styles.successIcon}>
                      <MaterialIcons name="check-circle" size={44} color="#00E676" />
                    </LinearGradient>
                    <Badge label="Website Live" variant="success" />
                    <Text style={[styles.successTitle, { color: colors.text }]}>Your Website is Ready!</Text>
                    <Text style={[styles.successDesc, { color: colors.textSecondary }]}>
                      Your AI-generated website has been built and deployed successfully.
                    </Text>
                    <View style={[styles.urlRow, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                      <MaterialIcons name="link" size={15} color={colors.primary} />
                      <Text style={[styles.urlText, { color: colors.primary }]} numberOfLines={1}>{previewUrl}</Text>
                      <MaterialIcons name="content-copy" size={15} color={colors.textMuted} />
                    </View>
                    <View style={styles.successActions}>
                      <PremiumButton
                        label="Preview"
                        icon="visibility"
                        onPress={() => {}}
                        style={{ flex: 1 }}
                        gradientColors={['#7C6FFF', '#4A42CC']}
                      />
                      <PremiumButton
                        label="Deploy"
                        icon="rocket-launch"
                        onPress={() => {}}
                        style={{ flex: 1 }}
                        gradientColors={['#00E676', '#00AA55']}
                      />
                    </View>
                    <PremiumButton
                      label="Build Another"
                      onPress={handleReset}
                      variant="outline"
                      icon="refresh"
                      fullWidth
                    />
                  </View>
                </Card>
              </Animated.View>
            </View>
          ) : buildState === 'building' ? (
            /* ── Building State ── */
            <View style={styles.section}>
              <Card>
                <Text style={[styles.buildingTitle, { color: colors.text }]}>Building your website...</Text>
                {/* Progress bar */}
                <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
                  <Animated.View style={[styles.progressFill, { width: progressWidth }]}>
                    <LinearGradient
                      colors={['#FF9800', '#FF6B9D']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={StyleSheet.absoluteFill}
                    />
                  </Animated.View>
                </View>
                <Text style={[styles.progressLabel, { color: colors.textMuted }]}>
                  Step {Math.min(currentStep, BUILD_STEPS.length)} of {BUILD_STEPS.length}
                </Text>

                <View style={styles.stepsContainer}>
                  {BUILD_STEPS.map((step, idx) => {
                    const isDone = idx < currentStep;
                    const isActive = idx === currentStep - 1;
                    return (
                      <View key={step.id} style={styles.stepRow}>
                        <View style={[
                          styles.stepIcon,
                          {
                            backgroundColor: isDone ? `${colors.success}22` : isActive ? `${step.color}22` : colors.card,
                          },
                        ]}>
                          {isDone ? (
                            <MaterialIcons name="check" size={16} color={colors.success} />
                          ) : isActive ? (
                            <ActivityIndicator size="small" color={step.color} />
                          ) : (
                            <MaterialIcons name={step.icon as any} size={16} color={colors.textMuted} />
                          )}
                        </View>
                        <View style={styles.stepInfo}>
                          <Text style={[styles.stepTitle, { color: isDone ? colors.text : isActive ? step.color : colors.textMuted }]}>
                            {step.title}
                          </Text>
                          <Text style={[styles.stepDesc, { color: colors.textMuted }]}>{step.desc}</Text>
                        </View>
                        {isDone ? <MaterialIcons name="check-circle" size={18} color={colors.success} /> : null}
                      </View>
                    );
                  })}
                </View>
              </Card>
            </View>
          ) : (
            /* ── Build Form ── */
            <>
              {/* Template Grid */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Choose Template</Text>
                <View style={styles.templatesGrid}>
                  {TEMPLATES.map(tpl => {
                    const isSelected = selectedTemplate === tpl.id;
                    return (
                      <Pressable
                        key={tpl.id}
                        onPress={() => setSelectedTemplate(tpl.id)}
                        style={({ pressed }) => [
                          styles.templateCard,
                          {
                            backgroundColor: isSelected ? `${tpl.color}18` : colors.card,
                            borderColor: isSelected ? tpl.color : colors.cardBorder,
                            borderWidth: isSelected ? 1.5 : 1,
                            opacity: pressed ? 0.85 : 1,
                          },
                        ]}
                      >
                        {isSelected ? (
                          <View style={[styles.templateCheck, { backgroundColor: tpl.color }]}>
                            <MaterialIcons name="check" size={11} color="#fff" />
                          </View>
                        ) : null}
                        <LinearGradient colors={tpl.gradient} style={styles.templateIconBg}>
                          <MaterialIcons name={tpl.icon as any} size={22} color="#fff" />
                        </LinearGradient>
                        <Text style={[styles.templateName, { color: colors.text }]}>{tpl.name}</Text>
                        <Text style={[styles.templateDesc, { color: colors.textMuted }]}>{tpl.desc}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Description */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Describe Your Website</Text>
                <View style={[styles.descBox, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                  <TextInput
                    value={description}
                    onChangeText={setDescription}
                    placeholder="E.g. A modern dark-themed portfolio for a UI designer with a project showcase, about section, testimonials, and contact form..."
                    placeholderTextColor={colors.textMuted}
                    multiline
                    numberOfLines={6}
                    style={[styles.descInput, { color: colors.text }]}
                  />
                </View>
                <Text style={[styles.charCount, { color: colors.textMuted }]}>
                  {description.length} characters · More detail = better results
                </Text>
              </View>

              {/* Build Button */}
              <View style={[styles.section, { paddingBottom: 36 }]}>
                <PremiumButton
                  label="Build Website with AI"
                  onPress={handleBuild}
                  disabled={!description.trim()}
                  icon="auto-awesome"
                  fullWidth
                  glow={description.trim().length > 0}
                  gradientColors={['#FF9800', '#FF6B9D']}
                  size="lg"
                />
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
    backgroundColor: 'rgba(255,255,255,0.06)',
    top: -60,
    right: -40,
  },
  heroLeft: { flex: 1, gap: Spacing.sm },
  heroTitle: { fontSize: FontSize.xxl, fontWeight: FontWeight.extrabold, color: '#fff' },
  heroSub: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.75)', lineHeight: 20 },

  section: { paddingHorizontal: Spacing.md, marginBottom: Spacing.lg },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, marginBottom: Spacing.md },

  templatesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  templateCard: {
    width: '47.5%',
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    gap: 7,
    position: 'relative',
    overflow: 'hidden',
  },
  templateCheck: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  templateIconBg: { width: 44, height: 44, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center' },
  templateName: { fontSize: FontSize.base, fontWeight: FontWeight.bold },
  templateDesc: { fontSize: FontSize.xs, lineHeight: 16 },

  descBox: { borderRadius: BorderRadius.xl, borderWidth: 1, padding: Spacing.md },
  descInput: { fontSize: FontSize.base, lineHeight: 23, minHeight: 110, includeFontPadding: false },
  charCount: { fontSize: FontSize.xs, marginTop: Spacing.xs },

  buildingTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, marginBottom: Spacing.md },
  progressTrack: { height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: Spacing.xs },
  progressFill: { height: '100%', borderRadius: 4, overflow: 'hidden' },
  progressLabel: { fontSize: FontSize.sm, marginBottom: Spacing.lg },
  stepsContainer: { gap: 2 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.sm },
  stepIcon: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  stepInfo: { flex: 1 },
  stepTitle: { fontSize: FontSize.base, fontWeight: FontWeight.semibold },
  stepDesc: { fontSize: FontSize.xs, marginTop: 1 },

  successContent: { alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.md },
  successIcon: { width: 90, height: 90, borderRadius: 45, alignItems: 'center', justifyContent: 'center' },
  successTitle: { fontSize: FontSize.xxl, fontWeight: FontWeight.extrabold, textAlign: 'center' },
  successDesc: { fontSize: FontSize.base, textAlign: 'center', lineHeight: 24, maxWidth: 280 },
  urlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    width: '100%',
  },
  urlText: { flex: 1, fontSize: FontSize.sm },
  successActions: { flexDirection: 'row', gap: Spacing.sm, width: '100%' },
});
