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
import { MOCK_PLUGINS, AIPlugin } from '@/services/ai-providers.service';

const PLUGIN_CATEGORIES = ['All', 'Connectivity', 'Development', 'Knowledge', 'Creative', 'Productivity', 'Media'];

export default function PluginManagerScreen() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [plugins, setPlugins] = useState(MOCK_PLUGINS);
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeTab, setActiveTab] = useState<'browse' | 'installed'>('browse');

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }).start();
  }, []);

  const installed = plugins.filter(p => p.isInstalled);
  const filtered = (activeTab === 'installed' ? installed : plugins).filter(
    p => activeCategory === 'All' || p.category === activeCategory,
  );

  const togglePlugin = (id: string, field: 'isInstalled' | 'isEnabled') => {
    setPlugins(prev => prev.map(p => p.id === id ? { ...p, [field]: !p[field as keyof AIPlugin] } : p));
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <Animated.View style={[styles.flex, { opacity: fadeAnim }]}>
        <PageHeader title="Plugin Manager" subtitle={`${installed.length} installed`} />

        {/* Tabs */}
        <View style={[styles.tabBar, { borderBottomColor: colors.border }]}>
          {(['browse', 'installed'] as const).map(tab => (
            <Pressable key={tab} onPress={() => setActiveTab(tab)} style={styles.tabItem}>
              <Text style={[styles.tabText, { color: activeTab === tab ? colors.primary : colors.textMuted }]}>
                {tab === 'browse' ? 'Browse' : `Installed (${installed.length})`}
              </Text>
              {activeTab === tab ? <View style={[styles.tabIndicator, { backgroundColor: colors.primary }]} /> : null}
            </Pressable>
          ))}
        </View>

        {/* Categories */}
        <View style={styles.catContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catContent}>
            {PLUGIN_CATEGORIES.map(cat => (
              <Pressable
                key={cat}
                onPress={() => setActiveCategory(cat)}
                style={({ pressed }) => [
                  styles.catChip,
                  activeCategory === cat
                    ? { backgroundColor: colors.primary, borderColor: colors.primary }
                    : { backgroundColor: colors.card, borderColor: colors.cardBorder },
                  { opacity: pressed ? 0.8 : 1 },
                ]}
              >
                <Text style={[styles.catText, { color: activeCategory === cat ? '#fff' : colors.textSecondary }]}>{cat}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
          {/* Featured Banner (browse only) */}
          {activeTab === 'browse' && activeCategory === 'All' ? (
            <View style={styles.featuredBanner}>
              <LinearGradient colors={isDark ? ['#1A1040', '#0D0820'] : ['#EAE8FF', '#F0F0FF']} style={styles.featuredGrad}>
                <View style={[styles.featuredIcon, { backgroundColor: '#7C6FFF20' }]}>
                  <MaterialIcons name="new-releases" size={22} color="#7C6FFF" />
                </View>
                <View>
                  <Text style={[styles.featuredTitle, { color: colors.text }]}>Featured Plugins</Text>
                  <Text style={[styles.featuredSub, { color: colors.textSecondary }]}>Handpicked by SONA team</Text>
                </View>
              </LinearGradient>
            </View>
          ) : null}

          {filtered.map(plugin => (
            <View
              key={plugin.id}
              style={[styles.pluginCard, { backgroundColor: colors.card, borderColor: plugin.isFeatured ? `${plugin.color}40` : colors.cardBorder }]}
            >
              <View style={styles.pluginHeader}>
                <LinearGradient colors={[plugin.color, `${plugin.color}99`]} style={styles.pluginIcon}>
                  <MaterialIcons name={plugin.icon as any} size={22} color="#fff" />
                </LinearGradient>
                <View style={styles.pluginInfo}>
                  <View style={styles.pluginNameRow}>
                    <Text style={[styles.pluginName, { color: colors.text }]}>{plugin.name}</Text>
                    {plugin.isOfficial ? (
                      <View style={styles.officialBadge}>
                        <MaterialIcons name="verified" size={12} color="#4285F4" />
                        <Text style={styles.officialText}>Official</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text style={[styles.pluginAuthor, { color: colors.textMuted }]}>by {plugin.author} · v{plugin.version}</Text>
                </View>
                {plugin.isInstalled ? (
                  <Switch
                    value={plugin.isEnabled}
                    onValueChange={() => togglePlugin(plugin.id, 'isEnabled')}
                    trackColor={{ false: colors.border, true: `${plugin.color}80` }}
                    thumbColor={plugin.isEnabled ? plugin.color : colors.textMuted}
                  />
                ) : (
                  <Pressable
                    onPress={() => togglePlugin(plugin.id, 'isInstalled')}
                    style={({ pressed }) => [styles.installBtn, { backgroundColor: `${plugin.color}20`, borderColor: `${plugin.color}40`, opacity: pressed ? 0.8 : 1 }]}
                  >
                    <MaterialIcons name="add" size={16} color={plugin.color} />
                    <Text style={[styles.installText, { color: plugin.color }]}>Install</Text>
                  </Pressable>
                )}
              </View>
              <Text style={[styles.pluginDesc, { color: colors.textSecondary }]}>{plugin.description}</Text>
              <View style={styles.pluginMeta}>
                <View style={styles.metaItem}>
                  <MaterialIcons name="star" size={13} color="#F5C842" />
                  <Text style={[styles.metaText, { color: colors.textMuted }]}>{plugin.rating}</Text>
                </View>
                <View style={styles.metaItem}>
                  <MaterialIcons name="download" size={13} color={colors.textMuted} />
                  <Text style={[styles.metaText, { color: colors.textMuted }]}>{(plugin.downloads / 1000).toFixed(0)}k</Text>
                </View>
                <View style={[styles.catTag, { backgroundColor: `${plugin.color}15` }]}>
                  <Text style={[styles.catTagText, { color: plugin.color }]}>{plugin.category}</Text>
                </View>
                {plugin.isInstalled && (
                  <Pressable
                    onPress={() => togglePlugin(plugin.id, 'isInstalled')}
                    style={styles.uninstallBtn}
                  >
                    <Text style={[styles.uninstallText, { color: colors.error }]}>Uninstall</Text>
                  </Pressable>
                )}
              </View>
            </View>
          ))}
          <View style={{ height: 32 }} />
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  tabBar: { flexDirection: 'row', borderBottomWidth: StyleSheet.hairlineWidth, paddingHorizontal: Spacing.md },
  tabItem: { paddingVertical: Spacing.sm + 2, paddingRight: Spacing.xl, position: 'relative' },
  tabText: { fontSize: FontSize.base, fontWeight: FontWeight.semibold },
  tabIndicator: { position: 'absolute', bottom: 0, left: 0, right: Spacing.xl, height: 2, borderRadius: 1 },
  catContainer: { maxHeight: 48, marginTop: Spacing.sm },
  catContent: { paddingHorizontal: Spacing.md, gap: Spacing.sm, alignItems: 'center' },
  catChip: { paddingHorizontal: Spacing.md, paddingVertical: 7, borderRadius: BorderRadius.full, borderWidth: 1 },
  catText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  list: { paddingHorizontal: Spacing.md, paddingTop: Spacing.md },
  featuredBanner: { marginBottom: Spacing.md },
  featuredGrad: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.md, borderRadius: BorderRadius.xl },
  featuredIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  featuredTitle: { fontSize: FontSize.base, fontWeight: FontWeight.bold },
  featuredSub: { fontSize: FontSize.sm, marginTop: 2 },
  pluginCard: { borderRadius: BorderRadius.xl, borderWidth: 1, padding: Spacing.md, marginBottom: Spacing.sm, gap: Spacing.sm },
  pluginHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  pluginIcon: { width: 50, height: 50, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center' },
  pluginInfo: { flex: 1 },
  pluginNameRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  pluginName: { fontSize: FontSize.base, fontWeight: FontWeight.bold },
  officialBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#4285F420', paddingHorizontal: 7, paddingVertical: 2, borderRadius: BorderRadius.full },
  officialText: { fontSize: FontSize.xxs, color: '#4285F4', fontWeight: FontWeight.bold },
  pluginAuthor: { fontSize: FontSize.xs, marginTop: 2 },
  installBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: Spacing.sm + 2, paddingVertical: Spacing.xs + 2, borderRadius: BorderRadius.full, borderWidth: 1 },
  installText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  pluginDesc: { fontSize: FontSize.sm, lineHeight: 20 },
  pluginMeta: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: FontSize.xs },
  catTag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: BorderRadius.full },
  catTagText: { fontSize: FontSize.xxs + 1, fontWeight: FontWeight.semibold },
  uninstallBtn: { marginLeft: 'auto' as any },
  uninstallText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
});
