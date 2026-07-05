import React, { useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView, Animated, FlatList,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { useAppStore } from '@/stores/useAppStore';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/theme';

const { width } = Dimensions.get('window');
const IMG_W = (width - Spacing.md * 2 - Spacing.sm) / 2;

export default function FavoritesScreen() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const { knowledgeItems, generatedImages, toggleKnowledgeFavorite, toggleImageFavorite } = useAppStore();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }).start();
  }, []);

  const favKnowledge = knowledgeItems.filter(k => k.isFavorite);
  const favImages = generatedImages.filter(img => img.isFavorite);

  const TYPE_ICON: Record<string, string> = { document: 'description', url: 'link', note: 'sticky-note-2', image: 'image' };
  const TYPE_COLOR: Record<string, string> = { document: '#7C6FFF', url: '#00D4FF', note: '#F5C842', image: '#FF6B9D' };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <Animated.View style={[styles.flex, { opacity: fadeAnim }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Pressable onPress={() => router.back()} hitSlop={8} style={({ pressed }) => [styles.backBtn, { backgroundColor: colors.card, opacity: pressed ? 0.8 : 1 }]}>
            <MaterialIcons name="arrow-back-ios" size={18} color={colors.text} />
          </Pressable>
          <View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Favorites</Text>
            <Text style={[styles.headerSub, { color: colors.textSecondary }]}>{favKnowledge.length + favImages.length} saved items</Text>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
          {favKnowledge.length > 0 ? (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Knowledge</Text>
              {favKnowledge.map(item => (
                <Pressable
                  key={item.id}
                  onPress={() => router.push('/knowledge-vault' as any)}
                  style={({ pressed }) => [styles.knowledgeCard, { backgroundColor: colors.card, borderColor: colors.cardBorder, opacity: pressed ? 0.85 : 1 }]}
                >
                  <View style={[styles.typeIcon, { backgroundColor: `${TYPE_COLOR[item.type]}20` }]}>
                    <MaterialIcons name={TYPE_ICON[item.type] as any} size={20} color={TYPE_COLOR[item.type]} />
                  </View>
                  <View style={styles.knowledgeInfo}>
                    <Text style={[styles.knowledgeTitle, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
                    <Text style={[styles.knowledgeDesc, { color: colors.textSecondary }]} numberOfLines={1}>{item.description}</Text>
                    <View style={styles.tagRow}>
                      {item.tags.slice(0, 2).map(tag => (
                        <View key={tag} style={[styles.tag, { backgroundColor: `${TYPE_COLOR[item.type]}15`, borderColor: `${TYPE_COLOR[item.type]}30` }]}>
                          <Text style={[styles.tagText, { color: TYPE_COLOR[item.type] }]}>#{tag}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                  <Pressable onPress={() => toggleKnowledgeFavorite(item.id)} hitSlop={8}>
                    <MaterialIcons name="favorite" size={20} color="#FF6B9D" />
                  </Pressable>
                </Pressable>
              ))}
            </View>
          ) : null}

          {favImages.length > 0 ? (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>AI Images</Text>
                <Pressable onPress={() => router.push('/image-generator' as any)}>
                  <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
                </Pressable>
              </View>
              <View style={styles.imageGrid}>
                {favImages.map(img => (
                  <Pressable
                    key={img.id}
                    style={({ pressed }) => [styles.imageCard, { opacity: pressed ? 0.9 : 1 }]}
                  >
                    <Image source={{ uri: img.imageUrl }} style={styles.image} contentFit="cover" transition={300} />
                    <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.imageOverlay}>
                      <Text style={styles.imagePrompt} numberOfLines={2}>{img.prompt}</Text>
                    </LinearGradient>
                    <Pressable
                      onPress={() => toggleImageFavorite(img.id)}
                      style={styles.heartBtn}
                      hitSlop={8}
                    >
                      <MaterialIcons name="favorite" size={18} color="#FF6B9D" />
                    </Pressable>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : null}

          {favKnowledge.length === 0 && favImages.length === 0 ? (
            <View style={styles.empty}>
              <LinearGradient colors={['#FF6B9D22', '#7C6FFF11']} style={styles.emptyIcon}>
                <MaterialIcons name="favorite-border" size={44} color={colors.textMuted} />
              </LinearGradient>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No favorites yet</Text>
              <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>Heart items across SONA to save them here</Text>
            </View>
          ) : null}
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm + 4, borderBottomWidth: StyleSheet.hairlineWidth },
  backBtn: { width: 36, height: 36, borderRadius: BorderRadius.sm + 2, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold },
  headerSub: { fontSize: FontSize.xs, marginTop: 1 },

  section: { paddingHorizontal: Spacing.md, marginTop: Spacing.lg },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.md },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, marginBottom: Spacing.md },
  seeAll: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },

  knowledgeCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.md, borderRadius: BorderRadius.xl, borderWidth: 1, marginBottom: Spacing.sm },
  typeIcon: { width: 46, height: 46, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center' },
  knowledgeInfo: { flex: 1, gap: 4 },
  knowledgeTitle: { fontSize: FontSize.base, fontWeight: FontWeight.semibold },
  knowledgeDesc: { fontSize: FontSize.sm },
  tagRow: { flexDirection: 'row', gap: Spacing.xs },
  tag: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: BorderRadius.full, borderWidth: 1 },
  tagText: { fontSize: FontSize.xxs, fontWeight: FontWeight.semibold },

  imageGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  imageCard: { width: IMG_W, height: IMG_W * 1.3, borderRadius: BorderRadius.xl, overflow: 'hidden', position: 'relative' },
  image: { width: '100%', height: '100%' },
  imageOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: Spacing.sm },
  imagePrompt: { fontSize: FontSize.xs, color: '#fff', fontWeight: FontWeight.medium },
  heartBtn: { position: 'absolute', top: Spacing.sm, right: Spacing.sm, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 16, padding: 5 },

  empty: { alignItems: 'center', gap: Spacing.md, paddingTop: Spacing.xxl, paddingHorizontal: Spacing.xl },
  emptyIcon: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold },
  emptyDesc: { fontSize: FontSize.base, textAlign: 'center' },
});
