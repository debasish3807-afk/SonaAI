import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, TextInput, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/hooks/useTheme';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/theme';

const TEMPLATES = [
  { id: '1', name: 'Portfolio', icon: 'person', color: '#6C63FF', desc: 'Personal portfolio website' },
  { id: '2', name: 'Landing Page', icon: 'rocket-launch', color: '#00D4FF', desc: 'Product launch page' },
  { id: '3', name: 'Blog', icon: 'article', color: '#FFD700', desc: 'Content publishing blog' },
  { id: '4', name: 'E-Commerce', icon: 'shopping-cart', color: '#FF6B9D', desc: 'Online store' },
  { id: '5', name: 'SaaS App', icon: 'cloud', color: '#00E676', desc: 'Software as a service' },
  { id: '6', name: 'Restaurant', icon: 'restaurant', color: '#FF9800', desc: 'Food business website' },
];

const BUILD_STEPS = [
  { id: 1, title: 'Design', desc: 'AI creates layout & design', icon: 'design-services', done: false },
  { id: 2, title: 'Content', desc: 'Generate pages & copy', icon: 'article', done: false },
  { id: 3, title: 'Styling', desc: 'Apply colors & typography', icon: 'palette', done: false },
  { id: 4, title: 'Deploy', desc: 'Publish to the web', icon: 'rocket-launch', done: false },
];

type BuildState = 'idle' | 'building' | 'done';

export default function WebsiteBuilderScreen() {
  const { colors } = useTheme();
  const [description, setDescription] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [buildState, setBuildState] = useState<BuildState>('idle');
  const [currentStep, setCurrentStep] = useState(0);
  const [previewUrl, setPreviewUrl] = useState('');

  const handleBuild = async () => {
    if (!description.trim()) return;
    setBuildState('building');
    setCurrentStep(0);

    for (let i = 1; i <= 4; i++) {
      await new Promise(res => setTimeout(res, 1000));
      setCurrentStep(i);
    }
    setPreviewUrl('https://sona-generated.vercel.app/preview');
    setBuildState('done');
  };

  const handleReset = () => {
    setBuildState('idle');
    setCurrentStep(0);
    setPreviewUrl('');
    setDescription('');
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <Header title="Website Builder" subtitle="Build websites with AI" showBack />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <LinearGradient colors={['#FF9800', '#FF6B9D']} style={styles.hero}>
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>AI Website Builder</Text>
            <Text style={styles.heroSub}>Describe your website, SONA builds it in seconds</Text>
          </View>
          <MaterialIcons name="language" size={60} color="rgba(255,255,255,0.3)" />
        </LinearGradient>

        {buildState === 'done' ? (
          /* Success State */
          <View style={styles.section}>
            <Card style={styles.successCard} variant="glass">
              <LinearGradient colors={['#00E67622', '#00E67644']} style={styles.successIcon}>
                <MaterialIcons name="check-circle" size={40} color="#00E676" />
              </LinearGradient>
              <Text style={[styles.successTitle, { color: colors.text }]}>Website Ready!</Text>
              <Text style={[styles.successDesc, { color: colors.textSecondary }]}>Your website has been generated and is ready to deploy.</Text>
              <View style={[styles.urlBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <MaterialIcons name="link" size={16} color={colors.primary} />
                <Text style={[styles.urlText, { color: colors.primary }]}>{previewUrl}</Text>
              </View>
              <View style={styles.actionRow}>
                <Pressable style={[styles.actionBtn, { backgroundColor: colors.primary }]}>
                  <MaterialIcons name="visibility" size={18} color="#fff" />
                  <Text style={styles.actionBtnText}>Preview</Text>
                </Pressable>
                <Pressable style={[styles.actionBtn, { backgroundColor: '#00E676' }]}>
                  <MaterialIcons name="rocket-launch" size={18} color="#fff" />
                  <Text style={styles.actionBtnText}>Deploy</Text>
                </Pressable>
                <Pressable style={[styles.actionBtn, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }]} onPress={handleReset}>
                  <MaterialIcons name="refresh" size={18} color={colors.text} />
                  <Text style={[styles.actionBtnText, { color: colors.text }]}>New</Text>
                </Pressable>
              </View>
            </Card>
          </View>
        ) : buildState === 'building' ? (
          /* Building State */
          <View style={styles.section}>
            <Card>
              <Text style={[styles.buildingTitle, { color: colors.text }]}>Building your website...</Text>
              {BUILD_STEPS.map((step, idx) => (
                <View key={step.id} style={styles.stepRow}>
                  <View style={[
                    styles.stepIcon,
                    { backgroundColor: idx < currentStep ? '#00E676' : idx === currentStep - 1 ? `${colors.primary}22` : colors.card },
                  ]}>
                    {idx < currentStep ? (
                      <MaterialIcons name="check" size={16} color="#00E676" />
                    ) : idx === currentStep - 1 ? (
                      <ActivityIndicator size="small" color={colors.primary} />
                    ) : (
                      <MaterialIcons name={step.icon as any} size={16} color={colors.textMuted} />
                    )}
                  </View>
                  <View style={styles.stepInfo}>
                    <Text style={[styles.stepTitle, { color: idx < currentStep ? colors.text : colors.textMuted }]}>
                      {step.title}
                    </Text>
                    <Text style={[styles.stepDesc, { color: colors.textMuted }]}>{step.desc}</Text>
                  </View>
                  {idx < currentStep ? <MaterialIcons name="check-circle" size={18} color="#00E676" /> : null}
                </View>
              ))}
            </Card>
          </View>
        ) : (
          /* Build Form */
          <>
            {/* Template Selection */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Choose Template</Text>
              <View style={styles.templatesGrid}>
                {TEMPLATES.map(tpl => (
                  <Pressable
                    key={tpl.id}
                    onPress={() => setSelectedTemplate(tpl.id)}
                    style={({ pressed }) => [
                      styles.templateCard,
                      { backgroundColor: selectedTemplate === tpl.id ? `${tpl.color}22` : colors.card, borderColor: selectedTemplate === tpl.id ? tpl.color : colors.border, opacity: pressed ? 0.85 : 1 },
                    ]}
                  >
                    <MaterialIcons name={tpl.icon as any} size={24} color={tpl.color} />
                    <Text style={[styles.templateName, { color: colors.text }]}>{tpl.name}</Text>
                    <Text style={[styles.templateDesc, { color: colors.textMuted }]}>{tpl.desc}</Text>
                    {selectedTemplate === tpl.id ? (
                      <View style={[styles.templateCheck, { backgroundColor: tpl.color }]}>
                        <MaterialIcons name="check" size={12} color="#fff" />
                      </View>
                    ) : null}
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Describe Your Site */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Describe Your Website</Text>
              <View style={[styles.descBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  placeholder="E.g. A modern portfolio website for a UI/UX designer with dark theme, project showcase, and contact form..."
                  placeholderTextColor={colors.textMuted}
                  multiline
                  numberOfLines={5}
                  style={[styles.descInput, { color: colors.text }]}
                />
              </View>
            </View>

            {/* Build Button */}
            <View style={[styles.section, { paddingBottom: 32 }]}>
              <Pressable
                onPress={handleBuild}
                disabled={!description.trim()}
                style={({ pressed }) => [styles.buildBtn, { opacity: !description.trim() ? 0.5 : pressed ? 0.85 : 1 }]}
              >
                <LinearGradient colors={['#FF9800', '#FF6B9D']} style={styles.buildGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                  <MaterialIcons name="auto-awesome" size={22} color="#fff" />
                  <Text style={styles.buildBtnText}>Build Website with AI</Text>
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
  templatesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  templateCard: { width: '47%', borderRadius: BorderRadius.xl, borderWidth: 1.5, padding: Spacing.md, gap: 6, position: 'relative' },
  templateName: { fontSize: FontSize.base, fontWeight: FontWeight.bold },
  templateDesc: { fontSize: FontSize.xs, lineHeight: 16 },
  templateCheck: { position: 'absolute', top: Spacing.sm, right: Spacing.sm, width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  descBox: { borderRadius: BorderRadius.md, borderWidth: 1, padding: Spacing.md },
  descInput: { fontSize: FontSize.base, lineHeight: 22, minHeight: 100, includeFontPadding: false },
  buildBtn: { borderRadius: BorderRadius.xl, overflow: 'hidden' },
  buildGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, paddingVertical: Spacing.md + 4 },
  buildBtnText: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: '#fff' },
  buildingTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, marginBottom: Spacing.lg },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.sm },
  stepIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  stepInfo: { flex: 1 },
  stepTitle: { fontSize: FontSize.base, fontWeight: FontWeight.semibold },
  stepDesc: { fontSize: FontSize.xs, marginTop: 2 },
  successCard: { alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.xl },
  successIcon: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center' },
  successTitle: { fontSize: FontSize.xxl, fontWeight: FontWeight.extrabold },
  successDesc: { fontSize: FontSize.base, textAlign: 'center', lineHeight: 24 },
  urlBox: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, borderRadius: BorderRadius.md, borderWidth: 1, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, width: '100%' },
  urlText: { fontSize: FontSize.sm, flex: 1 },
  actionRow: { flexDirection: 'row', gap: Spacing.sm, width: '100%' },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: Spacing.sm, borderRadius: BorderRadius.md },
  actionBtnText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: '#fff' },
});
