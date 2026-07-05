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
import { MOCK_AI_PROVIDERS, MOCK_AI_AGENTS, MOCK_PLUGINS } from '@/services/ai-providers.service';
import { Badge } from '@/components/ui/Badge';

const MARKETPLACE_CATEGORIES = [
  { key: 'all', label: 'All', icon: 'layers', color: '#7C6FFF' },
  { key: 'featured', label: 'Featured', icon: 'star', color: '#F5C842' },
  { key: 'models', label: 'AI Models', icon: 'psychology', color: '#00D4FF' },
  { key: 'agents', label: 'Agents', icon: 'smart-toy', color: '#00E676' },
  { key: 'plugins', label: 'Plugins', icon: 'extension', color: '#FF9800' },
];

export default function AIMarketplaceScreen() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }).start();
  }, []);

  const featuredProviders = MOCK_AI_PROVIDERS.slice(0, 3);
  const featuredAgents = MOCK_AI_AGENTS.slice(0, 3);
  const featuredPlugins = MOCK_PLUGINS.filter(p => p.isFeatured).slice(0, 4);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <Animated.View style={[styles.flex, { opacity: fadeAnim }]}>
        <PageHeader title="AI Marketplace" subtitle="Extend SONA's capabilities" />

        {/* Category Filter */}
        <View style={styles.catContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catContent}>
            {MARKETPLACE_CATEGORIES.map(cat => {
              const isActive = activeCategory === cat.key;
              return (
                <Pressable
                  key={cat.key}
                  onPress={() => setActiveCategory(cat.key)}
                  style={({ pressed }) => [
                    styles.catChip,
                    isActive
                      ? { backgroundColor: cat.color, borderColor: cat.color }
                      : { backgroundColor: colors.card, borderColor: colors.cardBorder },
                    { opacity: pressed ? 0.8 : 1 },
                  ]}
                >
                  <MaterialIcons name={cat.icon as any} size={13} color={isActive ? '#fff' : colors.textMuted} />
                  <Text style={[styles.catText, { color: isActive ? '#fff' : colors.textSecondary }]}>{cat.label}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {/* Hero Banner */}
          <LinearGradient colors={['#7C6FFF', '#00D4FF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.heroBanner}>
            <View style={styles.heroBg} />
            <View style={{ flex: 1 }}>
              <View style={styles.heroBadge}>
                <MaterialIcons name="new-releases" size={12} color="#fff" />
                <Text style={styles.heroBadgeText}>New Arrivals</Text>
              </View>
              <Text style={styles.heroTitle}>Gemini 2.5 Pro{'\n'}is now available</Text>
              <Text style={styles.heroSub}>2M token context · Multimodal · Best reasoning</Text>
              <Pressable
                onPress={() => router.push('/ai-models' as any)}
                style={({ pressed }) => [styles.heroBtn, { opacity: pressed ? 0.9 : 1 }]}
              >
                <Text style={styles.heroBtnText}>Explore Models</Text>
                <MaterialIcons name="arrow-forward" size={14} color="#7C6FFF" />
              </Pressable>
            </View>
            <View style={[styles.heroIcon, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
              <MaterialIcons name="auto-awesome" size={48} color="#fff" />
            </View>
          </LinearGradient>

          {/* Stats */}
          <View style={styles.statsRow}>
            {[
              { value: MOCK_AI_PROVIDERS.length, label: 'Providers', color: '#7C6FFF' },
              { value: MOCK_AI_PROVIDERS.reduce((s, p) => s + p.models.length, 0), label: 'AI Models', color: '#00D4FF' },
              { value: MOCK_AI_AGENTS.length, label: 'Agents', color: '#00E676' },
              { value: MOCK_PLUGINS.length, label: 'Plugins', color: '#FF9800' },
            ].map(stat => (
              <View key={stat.label} style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>{stat.label}</Text>
              </View>
            ))}
          </View>

          {/* AI Providers */}
          {(activeCategory === 'all' || activeCategory === 'models') ? (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>AI Providers</Text>
                <Pressable onPress={() => router.push('/ai-models' as any)}>
                  <Text style={[styles.seeAll, { color: colors.primary }]}>View all</Text>
                </Pressable>
              </View>
              {featuredProviders.map(provider => (
                <Pressable
                  key={provider.id}
                  onPress={() => router.push('/ai-models' as any)}
                  style={({ pressed }) => [styles.providerCard, { backgroundColor: colors.card, borderColor: colors.cardBorder, opacity: pressed ? 0.85 : 1 }]}
                >
                  <LinearGradient colors={[provider.color, `${provider.color}99`]} style={styles.providerIcon}>
                    <MaterialIcons name={provider.icon as any} size={24} color="#fff" />
                  </LinearGradient>
                  <View style={styles.providerInfo}>
                    <View style={styles.providerNameRow}>
                      <Text style={[styles.providerName, { color: colors.text }]}>{provider.name}</Text>
                      {provider.isEnabled ? (
                        <View style={styles.enabledBadge}>
                          <MaterialIcons name="check-circle" size={12} color="#00E676" />
                          <Text style={styles.enabledText}>Enabled</Text>
                        </View>
                      ) : null}
                    </View>
                    <Text style={[styles.providerDesc, { color: colors.textSecondary }]} numberOfLines={1}>{provider.description}</Text>
                    <Text style={[styles.providerMeta, { color: colors.textMuted }]}>{provider.models.length} models available</Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={20} color={colors.textMuted} />
                </Pressable>
              ))}
            </View>
          ) : null}

          {/* AI Agents */}
          {(activeCategory === 'all' || activeCategory === 'agents' || activeCategory === 'featured') ? (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>AI Agents</Text>
                <Pressable onPress={() => router.push('/ai-agents' as any)}>
                  <Text style={[styles.seeAll, { color: colors.primary }]}>View all</Text>
                </Pressable>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.agentsRail}>
                {featuredAgents.map(agent => (
                  <Pressable
                    key={agent.id}
                    onPress={() => router.push('/ai-agents' as any)}
                    style={({ pressed }) => [styles.agentCard, { backgroundColor: colors.card, borderColor: `${agent.color}40`, opacity: pressed ? 0.85 : 1 }]}
                  >
                    <LinearGradient colors={[agent.color, `${agent.color}88`]} style={styles.agentAvatar}>
                      <MaterialIcons name={agent.avatar as any} size={26} color="#fff" />
                    </LinearGradient>
                    <Text style={[styles.agentName, { color: colors.text }]}>{agent.name}</Text>
                    <Text style={[styles.agentModel, { color: colors.textMuted }]} numberOfLines={1}>{agent.model}</Text>
                    <View style={[styles.agentRating, { backgroundColor: `${agent.color}15` }]}>
                      <MaterialIcons name="check-circle" size={11} color={agent.color} />
                      <Text style={[styles.agentRatingText, { color: agent.color }]}>{agent.successRate}%</Text>
                    </View>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          ) : null}

          {/* Featured Plugins */}
          {(activeCategory === 'all' || activeCategory === 'plugins' || activeCategory === 'featured') ? (
            <View style={[styles.section, { paddingBottom: 0 }]}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Featured Plugins</Text>
                <Pressable onPress={() => router.push('/plugin-manager' as any)}>
                  <Text style={[styles.seeAll, { color: colors.primary }]}>Browse all</Text>
                </Pressable>
              </View>
              <View style={styles.pluginsGrid}>
                {featuredPlugins.map(plugin => (
                  <Pressable
                    key={plugin.id}
                    onPress={() => router.push('/plugin-manager' as any)}
                    style={({ pressed }) => [styles.pluginCard, { backgroundColor: colors.card, borderColor: colors.cardBorder, opacity: pressed ? 0.85 : 1 }]}
                  >
                    <LinearGradient colors={[plugin.color, `${plugin.color}88`]} style={styles.pluginIcon}>
                      <MaterialIcons name={plugin.icon as any} size={20} color="#fff" />
                    </LinearGradient>
                    <Text style={[styles.pluginName, { color: colors.text }]} numberOfLines={1}>{plugin.name}</Text>
                    <Text style={[styles.pluginDownloads, { color: colors.textMuted }]}>{(plugin.downloads / 1000).toFixed(0)}k</Text>
                    <View style={styles.pluginRating}>
                      <MaterialIcons name="star" size={11} color="#F5C842" />
                      <Text style={[styles.pluginRatingText, { color: colors.textMuted }]}>{plugin.rating}</Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : null}

          <View style={{ height: 32 }} />
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  catContainer: { maxHeight: 48, marginBottom: Spacing.xs },
  catContent: { paddingHorizontal: Spacing.md, gap: Spacing.sm, alignItems: 'center' },
  catChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: Spacing.md, paddingVertical: 7, borderRadius: BorderRadius.full, borderWidth: 1 },
  catText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  content: { paddingHorizontal: Spacing.md, paddingTop: Spacing.sm },
  heroBanner: { borderRadius: BorderRadius.xxl, padding: Spacing.lg, flexDirection: 'row', alignItems: 'center', overflow: 'hidden', marginBottom: Spacing.md, gap: Spacing.md },
  heroBg: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.06)', top: -60, right: -50 },
  heroBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: BorderRadius.full, alignSelf: 'flex-start', marginBottom: 8 },
  heroBadgeText: { fontSize: FontSize.xxs, fontWeight: FontWeight.bold, color: '#fff' },
  heroTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.extrabold, color: '#fff', lineHeight: 28, marginBottom: 6 },
  heroSub: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.7)', marginBottom: Spacing.md },
  heroBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#fff', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full, alignSelf: 'flex-start' },
  heroBtnText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: '#7C6FFF' },
  heroIcon: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
  statsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
  statCard: { flex: 1, alignItems: 'center', gap: 3, paddingVertical: Spacing.sm + 2, borderRadius: BorderRadius.xl, borderWidth: 1 },
  statValue: { fontSize: FontSize.xl, fontWeight: FontWeight.extrabold },
  statLabel: { fontSize: FontSize.xxs },
  section: { marginBottom: Spacing.lg },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.md },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  seeAll: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  providerCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.md, borderRadius: BorderRadius.xl, borderWidth: 1, marginBottom: Spacing.sm },
  providerIcon: { width: 50, height: 50, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center' },
  providerInfo: { flex: 1 },
  providerNameRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  providerName: { fontSize: FontSize.base, fontWeight: FontWeight.bold },
  enabledBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#00E67618', paddingHorizontal: 7, paddingVertical: 2, borderRadius: BorderRadius.full },
  enabledText: { fontSize: FontSize.xxs, color: '#00E676', fontWeight: FontWeight.bold },
  providerDesc: { fontSize: FontSize.sm, marginTop: 2 },
  providerMeta: { fontSize: FontSize.xs, marginTop: 2 },
  agentsRail: { gap: Spacing.sm, paddingRight: Spacing.sm },
  agentCard: { width: 130, padding: Spacing.md, borderRadius: BorderRadius.xl, borderWidth: 1.5, alignItems: 'center', gap: 6 },
  agentAvatar: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  agentName: { fontSize: FontSize.base, fontWeight: FontWeight.bold, textAlign: 'center' },
  agentModel: { fontSize: FontSize.xxs, textAlign: 'center' },
  agentRating: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: BorderRadius.full },
  agentRatingText: { fontSize: FontSize.xxs, fontWeight: FontWeight.bold },
  pluginsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  pluginCard: { width: '22%', alignItems: 'center', gap: 5, padding: Spacing.sm, borderRadius: BorderRadius.xl, borderWidth: 1 },
  pluginIcon: { width: 44, height: 44, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center' },
  pluginName: { fontSize: FontSize.xxs + 1, fontWeight: FontWeight.semibold, textAlign: 'center' },
  pluginDownloads: { fontSize: FontSize.xxs },
  pluginRating: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  pluginRatingText: { fontSize: FontSize.xxs },
});
