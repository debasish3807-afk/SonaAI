import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, TextInput, FlatList, Dimensions, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/hooks/useTheme';
import { useAppStore } from '@/stores/useAppStore';
import { Header } from '@/components/layout/Header';
import { generateImage } from '@/services/ai.service';
import { BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/theme';

const { width } = Dimensions.get('window');
const IMG_SIZE = (width - Spacing.md * 2 - Spacing.sm) / 2;

const STYLES = ['Photorealistic', 'Cinematic', 'Abstract', 'Anime', 'Oil Painting', 'Pixel Art', '3D Render', 'Watercolor'];
const SAMPLE_PROMPTS = [
  'Futuristic city at sunset, neon lights',
  'Majestic dragon flying over mountains',
  'Abstract digital art with purple waves',
  'Astronaut exploring alien planet',
];

export default function ImageGeneratorScreen() {
  const { colors } = useTheme();
  const { generatedImages, addGeneratedImage } = useAppStore();
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('Photorealistic');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true);
    try {
      const result = await generateImage({ prompt: prompt.trim(), style: selectedStyle });
      addGeneratedImage({ prompt: prompt.trim(), imageUrl: result.imageUrl, style: selectedStyle });
      setPrompt('');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <Header title="AI Image Generator" subtitle="Create stunning images with AI" showBack />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <LinearGradient colors={[`${colors.primary}22`, `${colors.secondary}11`]} style={styles.hero}>
          <MaterialIcons name="auto-awesome" size={32} color={colors.primary} />
          <Text style={[styles.heroTitle, { color: colors.text }]}>Generate AI Art</Text>
          <Text style={[styles.heroSub, { color: colors.textSecondary }]}>Describe your vision, SONA brings it to life</Text>
        </LinearGradient>

        {/* Prompt Input */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Your Prompt</Text>
          <View style={[styles.promptBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TextInput
              value={prompt}
              onChangeText={setPrompt}
              placeholder="Describe the image you want to create..."
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={3}
              style={[styles.promptInput, { color: colors.text }]}
            />
          </View>

          {/* Sample Prompts */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: Spacing.sm }}>
            <View style={styles.sampleRow}>
              {SAMPLE_PROMPTS.map(p => (
                <Pressable
                  key={p}
                  onPress={() => setPrompt(p)}
                  style={({ pressed }) => [
                    styles.sampleChip,
                    { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.8 : 1 },
                  ]}
                >
                  <Text style={[styles.sampleText, { color: colors.textSecondary }]}>{p}</Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Style Selection */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Style</Text>
          <View style={styles.stylesGrid}>
            {STYLES.map(s => (
              <Pressable
                key={s}
                onPress={() => setSelectedStyle(s)}
                style={[
                  styles.styleBtn,
                  { backgroundColor: selectedStyle === s ? colors.primary : colors.card, borderColor: selectedStyle === s ? colors.primary : colors.border },
                ]}
              >
                <Text style={[styles.styleText, { color: selectedStyle === s ? '#fff' : colors.textSecondary }]}>{s}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Generate Button */}
        <View style={styles.section}>
          <Pressable
            onPress={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            style={({ pressed }) => [styles.generateBtn, { opacity: (!prompt.trim() || isGenerating) ? 0.6 : pressed ? 0.85 : 1 }]}
          >
            <LinearGradient colors={['#6C63FF', '#00D4FF']} style={styles.generateGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              {isGenerating ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <MaterialIcons name="auto-awesome" size={20} color="#fff" />
              )}
              <Text style={styles.generateText}>
                {isGenerating ? 'Generating...' : 'Generate Image'}
              </Text>
            </LinearGradient>
          </Pressable>
        </View>

        {/* Gallery */}
        <View style={[styles.section, { paddingBottom: 32 }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Gallery</Text>
          <View style={styles.gallery}>
            {generatedImages.map(img => (
              <Pressable key={img.id} style={({ pressed }) => [styles.galleryItem, { opacity: pressed ? 0.9 : 1 }]}>
                <Image source={{ uri: img.imageUrl }} style={styles.galleryImg} contentFit="cover" />
                <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.galleryOverlay}>
                  <Text style={styles.galleryPrompt} numberOfLines={2}>{img.prompt}</Text>
                  <Text style={styles.galleryStyle}>{img.style}</Text>
                </LinearGradient>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  hero: { margin: Spacing.md, borderRadius: BorderRadius.xl, padding: Spacing.lg, alignItems: 'center', gap: Spacing.sm },
  heroTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold },
  heroSub: { fontSize: FontSize.sm, textAlign: 'center' },
  section: { paddingHorizontal: Spacing.md, marginBottom: Spacing.lg },
  label: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, marginBottom: Spacing.sm },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, marginBottom: Spacing.md },
  promptBox: { borderRadius: BorderRadius.md, borderWidth: 1, padding: Spacing.md },
  promptInput: { fontSize: FontSize.base, lineHeight: 22, minHeight: 80, includeFontPadding: false },
  sampleRow: { flexDirection: 'row', gap: Spacing.sm },
  sampleChip: { borderRadius: BorderRadius.full, borderWidth: 1, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs + 2, maxWidth: 200 },
  sampleText: { fontSize: FontSize.xs },
  stylesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  styleBtn: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full, borderWidth: 1 },
  styleText: { fontSize: FontSize.sm, fontWeight: FontWeight.medium },
  generateBtn: { borderRadius: BorderRadius.xl, overflow: 'hidden' },
  generateGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, paddingVertical: Spacing.md + 4 },
  generateText: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: '#fff' },
  gallery: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  galleryItem: { width: IMG_SIZE, height: IMG_SIZE * 1.2, borderRadius: BorderRadius.xl, overflow: 'hidden' },
  galleryImg: { width: '100%', height: '100%' },
  galleryOverlay: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: Spacing.sm, borderBottomLeftRadius: BorderRadius.xl, borderBottomRightRadius: BorderRadius.xl },
  galleryPrompt: { fontSize: FontSize.xs, color: '#fff', fontWeight: FontWeight.medium },
  galleryStyle: { fontSize: 10, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
});
