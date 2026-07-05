import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView, Animated, TextInput, Switch,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/theme';
import { PageHeader } from '@/components/ui/PageHeader';
import { MOCK_API_KEYS, APIKey } from '@/services/workspace.service';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useAlert } from '@/template';

export default function APIManagerScreen() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const { showAlert } = useAlert();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [keys, setKeys] = useState(MOCK_API_KEYS);
  const [showKeyId, setShowKeyId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyValue, setNewKeyValue] = useState('');

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }).start();
  }, []);

  const totalRequests = keys.reduce((s, k) => s + k.requestCount, 0);
  const totalSpend = keys.reduce((s, k) => s + (k.currentSpend ?? 0), 0);
  const activeCount = keys.filter(k => k.isActive).length;

  const toggleKeyActive = (id: string) => {
    setKeys(prev => prev.map(k => k.id === id ? { ...k, isActive: !k.isActive } : k));
  };

  const deleteKey = (id: string) => {
    showAlert('Delete API Key?', 'This will permanently remove this API key. Any integrations using it will stop working.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => setKeys(prev => prev.filter(k => k.id !== id)) },
    ]);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <Animated.View style={[styles.flex, { opacity: fadeAnim }]}>
        <PageHeader
          title="API Manager"
          subtitle="Manage your AI provider keys"
          actions={[{ icon: 'add-circle-outline', onPress: () => setShowAddForm(!showAddForm) }]}
        />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          {/* Stats */}
          <LinearGradient
            colors={isDark ? ['#14142C', '#0F0F1A'] : ['#EAE8FF', '#F0F0FF']}
            style={styles.statsRow}
          >
            {[
              { label: 'Active Keys', value: activeCount, icon: 'key', color: '#00E676' },
              { label: 'Requests', value: totalRequests.toLocaleString(), icon: 'swap-horiz', color: '#7C6FFF' },
              { label: 'This Month', value: `$${totalSpend.toFixed(2)}`, icon: 'attach-money', color: '#F5C842' },
            ].map(stat => (
              <View key={stat.label} style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: `${stat.color}20` }]}>
                  <MaterialIcons name={stat.icon as any} size={18} color={stat.color} />
                </View>
                <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>{stat.label}</Text>
              </View>
            ))}
          </LinearGradient>

          {/* Add Key Form */}
          {showAddForm ? (
            <View style={[styles.addForm, { backgroundColor: colors.card, borderColor: colors.primary }]}>
              <Text style={[styles.addFormTitle, { color: colors.text }]}>Add New API Key</Text>
              <TextInput
                value={newKeyName}
                onChangeText={setNewKeyName}
                placeholder="Key name (e.g., Gemini Production)"
                placeholderTextColor={colors.textMuted}
                style={[styles.formInput, { backgroundColor: isDark ? '#0F0F1A' : '#F5F5FF', color: colors.text, borderColor: colors.border }]}
              />
              <TextInput
                value={newKeyValue}
                onChangeText={setNewKeyValue}
                placeholder="API key value"
                placeholderTextColor={colors.textMuted}
                style={[styles.formInput, { backgroundColor: isDark ? '#0F0F1A' : '#F5F5FF', color: colors.text, borderColor: colors.border }]}
                secureTextEntry
              />
              <View style={styles.formActions}>
                <Pressable
                  onPress={() => setShowAddForm(false)}
                  style={({ pressed }) => [styles.cancelBtn, { borderColor: colors.cardBorder, opacity: pressed ? 0.8 : 1 }]}
                >
                  <Text style={[styles.cancelBtnText, { color: colors.textSecondary }]}>Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={() => { setShowAddForm(false); setNewKeyName(''); setNewKeyValue(''); }}
                  style={({ pressed }) => [styles.saveBtn, { backgroundColor: colors.primary, opacity: pressed ? 0.9 : 1 }]}
                >
                  <Text style={styles.saveBtnText}>Add Key</Text>
                </Pressable>
              </View>
            </View>
          ) : null}

          {/* API Keys */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Your API Keys</Text>
            {keys.map(key => {
              const spendPercent = key.monthlyBudget ? ((key.currentSpend ?? 0) / key.monthlyBudget) * 100 : 0;
              return (
                <View
                  key={key.id}
                  style={[styles.keyCard, { backgroundColor: colors.card, borderColor: key.isActive ? `${key.color}40` : colors.cardBorder }]}
                >
                  {/* Header */}
                  <View style={styles.keyHeader}>
                    <LinearGradient colors={[key.color, `${key.color}99`]} style={styles.keyIcon}>
                      <MaterialIcons name={key.icon as any} size={20} color="#fff" />
                    </LinearGradient>
                    <View style={styles.keyInfo}>
                      <Text style={[styles.keyName, { color: colors.text }]}>{key.name}</Text>
                      <Text style={[styles.keyProvider, { color: colors.textMuted }]}>{key.provider}</Text>
                    </View>
                    <Switch
                      value={key.isActive}
                      onValueChange={() => toggleKeyActive(key.id)}
                      trackColor={{ false: colors.border, true: `${key.color}60` }}
                      thumbColor={key.isActive ? key.color : colors.textMuted}
                    />
                  </View>

                  {/* Key Value */}
                  <View style={[styles.keyValueRow, { backgroundColor: isDark ? '#0F0F1A' : '#F5F5FF', borderColor: colors.border }]}>
                    <Text style={[styles.keyValueText, { color: colors.textSecondary }]} numberOfLines={1}>
                      {showKeyId === key.id ? key.key : key.key}
                    </Text>
                    <View style={styles.keyActions}>
                      <Pressable onPress={() => setShowKeyId(showKeyId === key.id ? null : key.id)} hitSlop={8}>
                        <MaterialIcons name={showKeyId === key.id ? 'visibility-off' : 'visibility'} size={16} color={colors.textMuted} />
                      </Pressable>
                      <Pressable hitSlop={8}>
                        <MaterialIcons name="content-copy" size={16} color={colors.textMuted} />
                      </Pressable>
                    </View>
                  </View>

                  {/* Stats */}
                  <View style={styles.keyStats}>
                    <View style={styles.keyStatItem}>
                      <MaterialIcons name="swap-horiz" size={13} color={colors.textMuted} />
                      <Text style={[styles.keyStatText, { color: colors.textMuted }]}>{key.requestCount.toLocaleString()} req</Text>
                    </View>
                    {key.lastUsed ? (
                      <View style={styles.keyStatItem}>
                        <MaterialIcons name="schedule" size={13} color={colors.textMuted} />
                        <Text style={[styles.keyStatText, { color: colors.textMuted }]}>Used {key.lastUsed}</Text>
                      </View>
                    ) : null}
                    <View style={[styles.keyStatusBadge, { backgroundColor: key.isActive ? '#00E67220' : '#9E9E9E20' }]}>
                      <View style={[styles.keyStatusDot, { backgroundColor: key.isActive ? '#00E676' : '#9E9E9E' }]} />
                      <Text style={[styles.keyStatusText, { color: key.isActive ? '#00E676' : '#9E9E9E' }]}>
                        {key.isActive ? 'Active' : 'Inactive'}
                      </Text>
                    </View>
                  </View>

                  {/* Budget */}
                  {key.monthlyBudget ? (
                    <View style={styles.budgetSection}>
                      <ProgressBar
                        value={spendPercent}
                        color={spendPercent > 80 ? '#FF5252' : key.color}
                        height={5}
                        showLabel
                        label={`$${key.currentSpend?.toFixed(2)} / $${key.monthlyBudget} budget`}
                      />
                    </View>
                  ) : null}

                  {/* Delete */}
                  <Pressable
                    onPress={() => deleteKey(key.id)}
                    style={({ pressed }) => [styles.deleteBtn, { opacity: pressed ? 0.7 : 1 }]}
                  >
                    <MaterialIcons name="delete-outline" size={14} color={colors.error ?? '#FF5252'} />
                    <Text style={[styles.deleteText, { color: colors.error ?? '#FF5252' }]}>Remove</Text>
                  </Pressable>
                </View>
              );
            })}
          </View>

          {/* Supported Providers */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Supported Providers</Text>
            <View style={styles.providersGrid}>
              {[
                { name: 'Gemini', color: '#4285F4', icon: 'auto-awesome' },
                { name: 'OpenAI', color: '#10A37F', icon: 'psychology' },
                { name: 'Claude', color: '#D4704A', icon: 'chat-bubble' },
                { name: 'DeepSeek', color: '#2563EB', icon: 'explore' },
                { name: 'Grok', color: '#9B59B6', icon: 'bolt' },
                { name: 'ElevenLabs', color: '#F59E0B', icon: 'mic' },
                { name: 'Whisper', color: '#06B6D4', icon: 'hearing' },
                { name: 'Stability', color: '#7C3AED', icon: 'image' },
              ].map(provider => (
                <Pressable
                  key={provider.name}
                  onPress={() => router.push('/ai-models' as any)}
                  style={({ pressed }) => [styles.providerChip, { backgroundColor: colors.card, borderColor: colors.cardBorder, opacity: pressed ? 0.8 : 1 }]}
                >
                  <View style={[styles.providerDot, { backgroundColor: `${provider.color}20` }]}>
                    <MaterialIcons name={provider.icon as any} size={14} color={provider.color} />
                  </View>
                  <Text style={[styles.providerName, { color: colors.textSecondary }]}>{provider.name}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', padding: Spacing.md, marginHorizontal: Spacing.md, borderRadius: BorderRadius.xl, marginBottom: Spacing.md },
  statItem: { alignItems: 'center', gap: 4 },
  statIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: FontSize.xl, fontWeight: FontWeight.extrabold },
  statLabel: { fontSize: FontSize.xxs },
  addForm: { marginHorizontal: Spacing.md, marginBottom: Spacing.md, padding: Spacing.md, borderRadius: BorderRadius.xl, borderWidth: 1.5, gap: Spacing.sm },
  addFormTitle: { fontSize: FontSize.base, fontWeight: FontWeight.bold },
  formInput: { borderRadius: BorderRadius.xl, borderWidth: 1, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm + 2, fontSize: FontSize.base },
  formActions: { flexDirection: 'row', gap: Spacing.sm },
  cancelBtn: { flex: 1, alignItems: 'center', padding: Spacing.sm + 2, borderRadius: BorderRadius.xl, borderWidth: 1 },
  cancelBtnText: { fontSize: FontSize.base, fontWeight: FontWeight.semibold },
  saveBtn: { flex: 1, alignItems: 'center', padding: Spacing.sm + 2, borderRadius: BorderRadius.xl },
  saveBtnText: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: '#fff' },
  section: { paddingHorizontal: Spacing.md, marginBottom: Spacing.lg },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, marginBottom: Spacing.md },
  keyCard: { borderRadius: BorderRadius.xl, borderWidth: 1.5, padding: Spacing.md, marginBottom: Spacing.md, gap: Spacing.sm },
  keyHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  keyIcon: { width: 44, height: 44, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center' },
  keyInfo: { flex: 1 },
  keyName: { fontSize: FontSize.base, fontWeight: FontWeight.bold },
  keyProvider: { fontSize: FontSize.xs, marginTop: 2 },
  keyValueRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.sm + 2, borderRadius: BorderRadius.lg, borderWidth: 1 },
  keyValueText: { flex: 1, fontSize: FontSize.xs, fontFamily: 'monospace' as any },
  keyActions: { flexDirection: 'row', gap: Spacing.sm },
  keyStats: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flexWrap: 'wrap' },
  keyStatItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  keyStatText: { fontSize: FontSize.xs },
  keyStatusBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 9, paddingVertical: 3, borderRadius: BorderRadius.full, marginLeft: 'auto' as any },
  keyStatusDot: { width: 6, height: 6, borderRadius: 3 },
  keyStatusText: { fontSize: FontSize.xxs, fontWeight: FontWeight.bold },
  budgetSection: {},
  deleteBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-end' },
  deleteText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  providersGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  providerChip: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full, borderWidth: 1 },
  providerDot: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  providerName: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
});
