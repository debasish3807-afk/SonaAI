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
import { MOCK_AI_PROVIDERS, AIProviderConfig, AIModel } from '@/services/ai-providers.service';

const CAPABILITY_ICONS: Record<string, string> = {
  text: 'chat-bubble',
  vision: 'visibility',
  audio: 'mic',
  image_gen: 'image',
  video_gen: 'videocam',
  code: 'code',
  embedding: 'scatter-plot',
  tts: 'volume-up',
  stt: 'hearing',
};

const formatNum = (n: number) => {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
  return n.toString();
};

export default function AIModelsScreen() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [providers, setProviders] = useState(MOCK_AI_PROVIDERS);
  const [expandedProvider, setExpandedProvider] = useState<string | null>('gemini');
  const [selectedModel, setSelectedModel] = useState('gemini-2.0-flash');

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }).start();
  }, []);

  const toggleProvider = (id: string) => {
    setProviders(prev => prev.map(p => p.id === id ? { ...p, isEnabled: !p.isEnabled } : p));
  };

  const enabledCount = providers.filter(p => p.isEnabled).length;
  const totalModels = providers.reduce((s, p) => s + p.models.length, 0);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <Animated.View style={[styles.flex, { opacity: fadeAnim }]}>
        <PageHeader title="AI Models" subtitle={`${enabledCount} providers · ${totalModels} models`} />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {/* Active Model Banner */}
          <LinearGradient colors={['#7C6FFF', '#4A42CC']} style={styles.activeBanner}>
            <View style={styles.activeBannerBg} />
            <View style={styles.activeBadge}>
              <MaterialIcons name="check-circle" size={14} color="#00E676" />
              <Text style={styles.activeBadgeText}>Active Model</Text>
            </View>
            <Text style={styles.activeModelName}>Gemini 2.0 Flash</Text>
            <Text style={styles.activeModelSub}>by Google · Fast · Cost-effective · 1M context</Text>
            <View style={styles.activeStats}>
              <View style={styles.activeStatItem}>
                <Text style={styles.activeStatValue}>∞</Text>
                <Text style={styles.activeStatLabel}>Remaining</Text>
              </View>
              <View style={styles.activeSep} />
              <View style={styles.activeStatItem}>
                <Text style={styles.activeStatValue}>$0.10</Text>
                <Text style={styles.activeStatLabel}>Per 1M tokens</Text>
              </View>
              <View style={styles.activeSep} />
              <View style={styles.activeStatItem}>
                <Text style={styles.activeStatValue}>87%</Text>
                <Text style={styles.activeStatLabel}>MMLU Score</Text>
              </View>
            </View>
          </LinearGradient>

          {/* Providers */}
          {providers.map(provider => {
            const isExpanded = expandedProvider === provider.id;
            return (
              <View key={provider.id} style={[styles.providerCard, { backgroundColor: colors.card, borderColor: provider.isEnabled ? `${provider.color}40` : colors.cardBorder }]}>
                {/* Provider Header */}
                <Pressable
                  onPress={() => setExpandedProvider(isExpanded ? null : provider.id)}
                  style={({ pressed }) => [styles.providerHeader, { opacity: pressed ? 0.8 : 1 }]}
                >
                  <LinearGradient colors={[provider.color, `${provider.color}99`]} style={styles.providerIcon}>
                    <MaterialIcons name={provider.icon as any} size={22} color="#fff" />
                  </LinearGradient>
                  <View style={styles.providerInfo}>
                    <Text style={[styles.providerName, { color: colors.text }]}>{provider.name}</Text>
                    <Text style={[styles.providerDesc, { color: colors.textMuted }]} numberOfLines={1}>
                      {provider.models.length} model{provider.models.length !== 1 ? 's' : ''} available
                    </Text>
                  </View>
                  <Switch
                    value={provider.isEnabled}
                    onValueChange={() => toggleProvider(provider.id)}
                    trackColor={{ false: colors.border, true: `${provider.color}60` }}
                    thumbColor={provider.isEnabled ? provider.color : colors.textMuted}
                  />
                  <MaterialIcons
                    name={isExpanded ? 'expand-less' : 'expand-more'}
                    size={22}
                    color={colors.textMuted}
                  />
                </Pressable>

                {/* Models */}
                {isExpanded ? (
                  <View style={styles.modelsList}>
                    {provider.models.map(model => {
                      const isSelected = selectedModel === model.id;
                      return (
                        <Pressable
                          key={model.id}
                          onPress={() => { setSelectedModel(model.id); }}
                          style={({ pressed }) => [
                            styles.modelCard,
                            {
                              backgroundColor: isSelected ? `${provider.color}15` : isDark ? '#0F0F1A' : '#F8F8FF',
                              borderColor: isSelected ? `${provider.color}50` : colors.border,
                              opacity: pressed ? 0.85 : 1,
                            },
                          ]}
                        >
                          {/* Model Name Row */}
                          <View style={styles.modelNameRow}>
                            <Text style={[styles.modelName, { color: colors.text }]}>{model.name}</Text>
                            <View style={styles.modelBadges}>
                              {model.isNew ? <View style={[styles.modelBadge, { backgroundColor: '#00E67620' }]}><Text style={[styles.modelBadgeText, { color: '#00E676' }]}>New</Text></View> : null}
                              {model.isBeta ? <View style={[styles.modelBadge, { backgroundColor: '#FF980020' }]}><Text style={[styles.modelBadgeText, { color: '#FF9800' }]}>Beta</Text></View> : null}
                              {isSelected ? <View style={[styles.modelBadge, { backgroundColor: `${provider.color}25` }]}><Text style={[styles.modelBadgeText, { color: provider.color }]}>Active</Text></View> : null}
                            </View>
                          </View>

                          {/* Description */}
                          <Text style={[styles.modelDesc, { color: colors.textSecondary }]} numberOfLines={2}>{model.description}</Text>

                          {/* Capabilities */}
                          <View style={styles.capRow}>
                            {model.capabilities.map(cap => (
                              <View key={cap} style={[styles.capChip, { backgroundColor: `${provider.color}15` }]}>
                                <MaterialIcons name={CAPABILITY_ICONS[cap] as any ?? 'auto-awesome'} size={11} color={provider.color} />
                                <Text style={[styles.capText, { color: provider.color }]}>{cap}</Text>
                              </View>
                            ))}
                          </View>

                          {/* Stats */}
                          <View style={styles.modelStats}>
                            <View style={styles.modelStatItem}>
                              <Text style={[styles.modelStatLabel, { color: colors.textMuted }]}>Context</Text>
                              <Text style={[styles.modelStatValue, { color: colors.text }]}>{formatNum(model.contextWindow)}</Text>
                            </View>
                            {model.benchmark?.mmlu ? (
                              <View style={styles.modelStatItem}>
                                <Text style={[styles.modelStatLabel, { color: colors.textMuted }]}>MMLU</Text>
                                <Text style={[styles.modelStatValue, { color: provider.color }]}>{model.benchmark.mmlu}%</Text>
                              </View>
                            ) : null}
                            {model.inputCostPer1M > 0 ? (
                              <View style={styles.modelStatItem}>
                                <Text style={[styles.modelStatLabel, { color: colors.textMuted }]}>Input/1M</Text>
                                <Text style={[styles.modelStatValue, { color: colors.text }]}>${model.inputCostPer1M}</Text>
                              </View>
                            ) : null}
                            <Pressable
                              onPress={() => setSelectedModel(model.id)}
                              style={({ pressed }) => [
                                styles.selectBtn,
                                { backgroundColor: isSelected ? provider.color : `${provider.color}20`, opacity: pressed ? 0.8 : 1 },
                              ]}
                            >
                              <Text style={[styles.selectBtnText, { color: isSelected ? '#fff' : provider.color }]}>
                                {isSelected ? 'Active' : 'Select'}
                              </Text>
                            </Pressable>
                          </View>
                        </Pressable>
                      );
                    })}

                    {/* Configure API Key */}
                    {!provider.isEnabled ? (
                      <Pressable style={[styles.apiKeyBtn, { borderColor: provider.color, backgroundColor: `${provider.color}10` }]}>
                        <MaterialIcons name="key" size={16} color={provider.color} />
                        <Text style={[styles.apiKeyText, { color: provider.color }]}>Configure API Key to enable</Text>
                        <MaterialIcons name="chevron-right" size={16} color={provider.color} />
                      </Pressable>
                    ) : null}
                  </View>
                ) : null}
              </View>
            );
          })}
          <View style={{ height: 32 }} />
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  content: { padding: Spacing.md, gap: Spacing.md },
  activeBanner: { borderRadius: BorderRadius.xxl, padding: Spacing.lg, overflow: 'hidden', gap: 6 },
  activeBannerBg: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.06)', top: -60, right: -50 },
  activeBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(0,230,118,0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: BorderRadius.full, alignSelf: 'flex-start' },
  activeBadgeText: { fontSize: FontSize.xs, color: '#00E676', fontWeight: FontWeight.bold },
  activeModelName: { fontSize: FontSize.xxl, fontWeight: FontWeight.extrabold, color: '#fff' },
  activeModelSub: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.65)' },
  activeStats: { flexDirection: 'row', marginTop: Spacing.sm },
  activeStatItem: { flex: 1, alignItems: 'center', gap: 3 },
  activeStatValue: { fontSize: FontSize.xl, fontWeight: FontWeight.extrabold, color: '#fff' },
  activeStatLabel: { fontSize: FontSize.xxs, color: 'rgba(255,255,255,0.6)' },
  activeSep: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginHorizontal: Spacing.sm },
  providerCard: { borderRadius: BorderRadius.xl, borderWidth: 1.5, overflow: 'hidden' },
  providerHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.md },
  providerIcon: { width: 48, height: 48, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center' },
  providerInfo: { flex: 1 },
  providerName: { fontSize: FontSize.base, fontWeight: FontWeight.bold },
  providerDesc: { fontSize: FontSize.xs, marginTop: 2 },
  modelsList: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.md, gap: Spacing.sm },
  modelCard: { borderRadius: BorderRadius.xl, borderWidth: 1.5, padding: Spacing.md, gap: Spacing.sm },
  modelNameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  modelName: { fontSize: FontSize.base, fontWeight: FontWeight.bold, flex: 1 },
  modelBadges: { flexDirection: 'row', gap: Spacing.xs },
  modelBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: BorderRadius.full },
  modelBadgeText: { fontSize: FontSize.xxs, fontWeight: FontWeight.bold },
  modelDesc: { fontSize: FontSize.sm, lineHeight: 19 },
  capRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  capChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: BorderRadius.full },
  capText: { fontSize: FontSize.xxs + 1, fontWeight: FontWeight.semibold },
  modelStats: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  modelStatItem: { gap: 2, flex: 1 },
  modelStatLabel: { fontSize: FontSize.xxs },
  modelStatValue: { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  selectBtn: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs + 2, borderRadius: BorderRadius.full },
  selectBtnText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  apiKeyBtn: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.md, borderRadius: BorderRadius.xl, borderWidth: 1, borderStyle: 'dashed' },
  apiKeyText: { flex: 1, fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
});
