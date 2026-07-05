import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Pressable, TextInput,
  Dimensions, ActivityIndicator, Animated,
} from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/hooks/useTheme';
import { useAppStore } from '@/stores/useAppStore';
import { Header } from '@/components/layout/Header';
import { PremiumButton } from '@/components/ui/PremiumButton';
import { Badge } from '@/components/ui/Badge';
import { generateImage } from '@/services/ai.service';
import { BorderRadius, FontSize, FontWeight, Shadow, Spacing } from '@/constants/theme';

const { width } = Dimensions.get('window');
const IMG_SIZE = (width - Spacing.md * 2 - Spacing.sm) / 2;

const STYLE_OPTIONS = [
  { label: 'Photorealistic', icon: 'photo-camera', color: '#7C6FFF' },
  { label: 'Cinematic', icon: 'movie', color: '#00D4FF' },
  { label: 'Abstract', icon: 'blur-on', color: '#FF6B9D' },
  { label: 'Anime', icon: 'face', color: '#F5C842' },
  { label: '3D Render', icon: 'view-in-ar', color: '#00E676' },
  { label: 'Oil Painting', icon: 'brush', color: '#FF9800' },
  { label: 'Pixel Art', icon: 'grid-on', color: '#9C27B0' },
  { label: 'Watercolor', icon: 'water-drop', color: '#4CAF50' },
];

const SAMPLE_PROMPTS = [
  'Futuristic city at sunset with neon lights',
  'Majestic dragon over misty mountains',
  'Deep ocean bioluminescent creatures',
  'AI robot in an enchanted garden',
];

const ASPECT_RATIOS = ['1:1', '4:3', '16:9', '9:16'];

export default function ImageGeneratorScreen() {
  const { colors, isDark } = useTheme();
  const { generatedImages, addGeneratedImage } = useAppStore();
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('Photorealistic');
  const [selectedRatio, setSelectedRatio] = useState('1:1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'create' | 'gallery'>('create');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const generateAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true);
    Animated.loop(
      Animated.sequence([
        Animated.timing(generateAnim, { toValue: 1.03, duration: 600, useNativeDriver: true }),
        Animated.timing(generateAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    ).start();
    try {
      const result = await generateImage({ prompt: prompt.trim(), style: selectedStyle });
      addGeneratedImage({ prompt: prompt.trim(), imageUrl: result.imageUrl, style: selectedStyle });
      setPrompt('');
      setActiveTab('gallery');
    } finally {
      setIsGenerating(false);
      generateAnim.stopAnimation();
      generateAnim.setValue(1);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <Animated.View style={[styles.flex, { opacity: fadeAnim }]}>
        <Header
          title="AI Image Generator"
          subtitle="Create stunning visuals with AI"
          showBack
        />

        {/* ── Tabs ── */}
        <View style={[styles.tabs, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          {(['create', 'gallery'] as const).map(tab => (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={({ pressed }) => [
                styles.tab,
                activeTab === tab && { backgroundColor: colors.primary },
                { opacity: pressed ? 0.85 : 1 },
              ]}
            >
              <MaterialIcons
                name={tab === 'create' ? 'auto-awesome' : 'photo-library'}
                size={16}
                color={activeTab === tab ? '#fff' : colors.textSecondary}
              />
              <Text style={[styles.tabText, { color: activeTab === tab ? '#fff' : colors.textSecondary }]}>
                {tab === 'create' ? 'Create' : `Gallery (${generatedImages.length})`}
              </Text>
            </Pressable>
          ))}
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {activeTab === 'create' ? (
            <>
              {/* ── Hero ── */}
              <LinearGradient
                colors={['#00E676', '#00AA55', '#006633']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.hero}
              >
                <View style={styles.heroBg} />
                <View style={styles.heroLeft}>
                  <Badge label="AI Powered" variant="success" />
                  <Text style={styles.heroTitle}>Generate AI Art</Text>
                  <Text style={styles.heroSub}>Describe any image and SONA brings it to life</Text>
                </View>
                <MaterialIcons name="auto-awesome" size={56} color="rgba(255,255,255,0.25)" />
              </LinearGradient>

              {/* ── Prompt ── */}
              <View style={styles.section}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Describe your image</Text>
                <View style={[styles.promptBox, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                  <TextInput
                    value={prompt}
                    onChangeText={setPrompt}
                    placeholder="A majestic dragon perched on a crystal mountain at dawn..."
                    placeholderTextColor={colors.textMuted}
                    multiline
                    numberOfLines={4}
                    style={[styles.promptInput, { color: colors.text }]}
                  />
                  {prompt.length > 0 ? (
                    <Pressable
                      onPress={() => setPrompt('')}
                      style={styles.clearBtn}
                      hitSlop={8}
                    >
                      <MaterialIcons name="cancel" size={18} color={colors.textMuted} />
                    </Pressable>
                  ) : null}
                </View>

                {/* Sample prompts */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: Spacing.sm }}>
                  <View style={styles.samplesRow}>
                    {SAMPLE_PROMPTS.map(p => (
                      <Pressable
                        key={p}
                        onPress={() => setPrompt(p)}
                        style={({ pressed }) => [
                          styles.sampleChip,
                          { backgroundColor: colors.card, borderColor: colors.cardBorder, opacity: pressed ? 0.8 : 1 },
                        ]}
                      >
                        <MaterialIcons name="lightbulb-outline" size={12} color={colors.primary} />
                        <Text style={[styles.sampleText, { color: colors.textSecondary }]}>{p}</Text>
                      </Pressable>
                    ))}
                  </View>
                </ScrollView>
              </View>

              {/* ── Style ── */}
              <View style={styles.section}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Art Style</Text>
                <View style={styles.stylesGrid}>
                  {STYLE_OPTIONS.map(s => {
                    const isActive = selectedStyle === s.label;
                    return (
                      <Pressable
                        key={s.label}
                        onPress={() => setSelectedStyle(s.label)}
                        style={({ pressed }) => [
                          styles.styleBtn,
                          isActive
                            ? { backgroundColor: `${s.color}22`, borderColor: s.color, borderWidth: 1.5 }
                            : { backgroundColor: colors.card, borderColor: colors.cardBorder, borderWidth: 1 },
                          { opacity: pressed ? 0.85 : 1 },
                        ]}
                      >
                        <MaterialIcons name={s.icon as any} size={16} color={isActive ? s.color : colors.textMuted} />
                        <Text style={[styles.styleText, { color: isActive ? s.color : colors.textSecondary }]}>{s.label}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* ── Aspect Ratio ── */}
              <View style={styles.section}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Aspect Ratio</Text>
                <View style={styles.ratioRow}>
                  {ASPECT_RATIOS.map(r => (
                    <Pressable
                      key={r}
                      onPress={() => setSelectedRatio(r)}
                      style={[
                        styles.ratioBtn,
                        {
                          backgroundColor: selectedRatio === r ? colors.primary : colors.card,
                          borderColor: selectedRatio === r ? colors.primary : colors.cardBorder,
                        },
                      ]}
                    >
                      <Text style={[styles.ratioText, { color: selectedRatio === r ? '#fff' : colors.textSecondary }]}>
                        {r}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* ── Generate ── */}
              <View style={[styles.section, { paddingBottom: 36 }]}>
                <Animated.View style={{ transform: [{ scale: generateAnim }] }}>
                  <PremiumButton
                    label={isGenerating ? 'Generating...' : 'Generate Image'}
                    onPress={handleGenerate}
                    disabled={!prompt.trim() || isGenerating}
                    loading={isGenerating}
                    icon="auto-awesome"
                    fullWidth
                    glow={!isGenerating && prompt.trim().length > 0}
                    gradientColors={['#00E676', '#0099CC']}
                    size="lg"
                  />
                </Animated.View>
              </View>
            </>
          ) : (
            /* ── Gallery Tab ── */
            <View style={[styles.section, { paddingBottom: 36 }]}>
              {generatedImages.length === 0 ? (
                <View style={styles.galleryEmpty}>
                  <LinearGradient colors={['#00E67633', '#00D4FF11']} style={styles.galleryEmptyIcon}>
                    <MaterialIcons name="photo-library" size={44} color={colors.success} />
                  </LinearGradient>
                  <Text style={[styles.emptyTitle, { color: colors.text }]}>No images yet</Text>
                  <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
                    Switch to Create to generate your first image
                  </Text>
                  <PremiumButton
                    label="Create First Image"
                    onPress={() => setActiveTab('create')}
                    icon="auto-awesome"
                    gradientColors={['#00E676', '#0099CC']}
                  />
                </View>
              ) : (
                <View style={styles.gallery}>
                  {generatedImages.map(img => (
                    <Pressable
                      key={img.id}
                      style={({ pressed }) => [styles.galleryItem, { opacity: pressed ? 0.9 : 1, ...Shadow.md }]}
                    >
                      <Image
                        source={{ uri: img.imageUrl }}
                        style={styles.galleryImg}
                        contentFit="cover"
                        transition={300}
                      />
                      <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.82)']}
                        style={styles.galleryOverlay}
                      >
                        <View style={[styles.galleryStyleTag, { backgroundColor: 'rgba(0,230,118,0.25)' }]}>
                          <Text style={styles.galleryStyleText}>{img.style}</Text>
                        </View>
                        <Text style={styles.galleryPrompt} numberOfLines={2}>{img.prompt}</Text>
                      </LinearGradient>
                    </Pressable>
                  ))}
                </View>
              )}
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
  tabs: {
    flexDirection: 'row',
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: 3,
    gap: 3,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  tabText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },

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

  section: { paddingHorizontal: Spacing.md, marginBottom: Spacing.md },
  label: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, marginBottom: Spacing.sm },

  promptBox: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.md,
    position: 'relative',
  },
  promptInput: { fontSize: FontSize.base, lineHeight: 23, minHeight: 90, includeFontPadding: false },
  clearBtn: { position: 'absolute', top: Spacing.sm, right: Spacing.sm },

  samplesRow: { flexDirection: 'row', gap: Spacing.sm },
  sampleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    maxWidth: 220,
  },
  sampleText: { fontSize: FontSize.xxs + 1 },

  stylesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  styleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: Spacing.sm + 4,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  styleText: { fontSize: FontSize.sm, fontWeight: FontWeight.medium },

  ratioRow: { flexDirection: 'row', gap: Spacing.sm },
  ratioBtn: { flex: 1, paddingVertical: Spacing.sm, borderRadius: BorderRadius.md, borderWidth: 1, alignItems: 'center' },
  ratioText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },

  gallery: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  galleryItem: { width: IMG_SIZE, height: IMG_SIZE * 1.25, borderRadius: BorderRadius.xl, overflow: 'hidden' },
  galleryImg: { width: '100%', height: '100%' },
  galleryOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: Spacing.sm,
    gap: 4,
  },
  galleryStyleTag: { alignSelf: 'flex-start', paddingHorizontal: 7, paddingVertical: 2, borderRadius: BorderRadius.full },
  galleryStyleText: { fontSize: FontSize.xxs, color: '#00E676', fontWeight: '700' },
  galleryPrompt: { fontSize: FontSize.xs, color: '#fff', fontWeight: '500', lineHeight: 16 },

  galleryEmpty: { alignItems: 'center', gap: Spacing.md, paddingTop: Spacing.xxl, paddingHorizontal: Spacing.xl },
  galleryEmptyIcon: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold },
  emptyDesc: { fontSize: FontSize.base, textAlign: 'center', lineHeight: 24, maxWidth: 240 },
});
