import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView, Animated, Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { BorderRadius, FontSize, FontWeight, Shadow, Spacing } from '@/constants/theme';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { MOCK_AI_AGENTS, AIAgent } from '@/services/ai-providers.service';
import { ProgressBar } from '@/components/ui/ProgressBar';

const { width } = Dimensions.get('window');

export default function AIAgentsScreen() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [selectedAgent, setSelectedAgent] = useState<AIAgent | null>(null);

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }).start();
  }, []);

  const activeCount = MOCK_AI_AGENTS.filter(a => a.status === 'active').length;
  const totalTasks = MOCK_AI_AGENTS.reduce((s, a) => s + a.tasks, 0);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <Animated.View style={[styles.flex, { opacity: fadeAnim }]}>
        <PageHeader title="AI Agents" subtitle={`${activeCount} active · ${MOCK_AI_AGENTS.length} total`} />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
          {/* Stats Banner */}
          <LinearGradient
            colors={isDark ? ['#14142C', '#0F0F1A'] : ['#EAE8FF', '#F0F0FF']}
            style={styles.statsBanner}
          >
            {[
              { label: 'Active Agents', value: activeCount, color: '#00E676', icon: 'check-circle' },
              { label: 'Total Tasks', value: totalTasks.toLocaleString(), color: '#7C6FFF', icon: 'task-alt' },
              { label: 'Avg Success', value: '96.2%', color: '#00D4FF', icon: 'trending-up' },
            ].map(s => (
              <View key={s.label} style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: `${s.color}20` }]}>
                  <MaterialIcons name={s.icon as any} size={18} color={s.color} />
                </View>
                <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>{s.label}</Text>
              </View>
            ))}
          </LinearGradient>

          {/* Agents List */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Agents</Text>
            {MOCK_AI_AGENTS.map(agent => (
              <Pressable
                key={agent.id}
                onPress={() => setSelectedAgent(selectedAgent?.id === agent.id ? null : agent)}
                style={({ pressed }) => [
                  styles.agentCard,
                  { backgroundColor: colors.card, borderColor: agent.status === 'active' ? `${agent.color}40` : colors.cardBorder, opacity: pressed ? 0.92 : 1 },
                  agent.status === 'active' && { shadowColor: agent.color, shadowOpacity: 0.15, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
                ]}
              >
                {/* Agent Header */}
                <View style={styles.agentHeader}>
                  <LinearGradient colors={[agent.color, `${agent.color}99`]} style={styles.agentAvatar}>
                    <MaterialIcons name={agent.avatar as any} size={28} color="#fff" />
                  </LinearGradient>
                  <View style={styles.agentInfo}>
                    <View style={styles.agentNameRow}>
                      <Text style={[styles.agentName, { color: colors.text }]}>{agent.name}</Text>
                      <StatusBadge status={agent.status} />
                    </View>
                    <Text style={[styles.agentModel, { color: colors.textMuted }]}>
                      <MaterialIcons name="memory" size={11} color={colors.textMuted} /> {agent.model}
                    </Text>
                  </View>
                  <Pressable
                    style={({ pressed }) => [styles.chatBtn, { backgroundColor: `${agent.color}20`, borderColor: `${agent.color}30`, opacity: pressed ? 0.8 : 1 }]}
                    onPress={() => router.push('/(tabs)/chat' as any)}
                  >
                    <MaterialIcons name="chat-bubble" size={16} color={agent.color} />
                  </Pressable>
                </View>

                {/* Description */}
                <Text
                  style={[styles.agentDesc, { color: colors.textSecondary }]}
                  numberOfLines={selectedAgent?.id === agent.id ? undefined : 2}
                >
                  {agent.description}
                </Text>

                {/* Stats */}
                <View style={styles.agentStats}>
                  <View style={styles.agentStatItem}>
                    <Text style={[styles.agentStatValue, { color: colors.text }]}>{agent.tasks.toLocaleString()}</Text>
                    <Text style={[styles.agentStatLabel, { color: colors.textMuted }]}>Tasks</Text>
                  </View>
                  <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                  <View style={styles.agentStatItem}>
                    <Text style={[styles.agentStatValue, { color: agent.color }]}>{agent.successRate}%</Text>
                    <Text style={[styles.agentStatLabel, { color: colors.textMuted }]}>Success</Text>
                  </View>
                  <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                  <View style={styles.agentStatItem}>
                    <Text style={[styles.agentStatValue, { color: colors.text }]}>
                      {agent.lastUsed ?? '—'}
                    </Text>
                    <Text style={[styles.agentStatLabel, { color: colors.textMuted }]}>Last Used</Text>
                  </View>
                </View>

                <ProgressBar value={agent.successRate} color={agent.color} height={4} animated />

                {/* Expanded Capabilities */}
                {selectedAgent?.id === agent.id ? (
                  <View style={styles.capabilitiesSection}>
                    <Text style={[styles.capTitle, { color: colors.textMuted }]}>CAPABILITIES</Text>
                    <View style={styles.capGrid}>
                      {agent.capabilities.map(cap => (
                        <View key={cap} style={[styles.capChip, { backgroundColor: `${agent.color}18`, borderColor: `${agent.color}30` }]}>
                          <Text style={[styles.capText, { color: agent.color }]}>{cap}</Text>
                        </View>
                      ))}
                    </View>
                    <Pressable
                      onPress={() => router.push('/(tabs)/chat' as any)}
                      style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1, marginTop: Spacing.sm }]}
                    >
                      <LinearGradient colors={[agent.color, `${agent.color}CC`]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.chatWithBtn}>
                        <MaterialIcons name="auto-awesome" size={16} color="#fff" />
                        <Text style={styles.chatWithText}>Chat with {agent.name}</Text>
                      </LinearGradient>
                    </Pressable>
                  </View>
                ) : null}
              </Pressable>
            ))}
          </View>

          {/* Create Custom Agent */}
          <View style={[styles.section, { paddingBottom: 0 }]}>
            <Pressable
              style={({ pressed }) => [
                styles.createAgentCard,
                { borderColor: colors.primary, backgroundColor: `${colors.primary}10`, opacity: pressed ? 0.85 : 1 },
              ]}
            >
              <LinearGradient colors={[colors.primary, '#00D4FF']} style={styles.createIcon}>
                <MaterialIcons name="add" size={26} color="#fff" />
              </LinearGradient>
              <View style={{ flex: 1 }}>
                <Text style={[styles.createTitle, { color: colors.text }]}>Create Custom Agent</Text>
                <Text style={[styles.createDesc, { color: colors.textSecondary }]}>Build your own AI agent with custom instructions, tools, and memory</Text>
              </View>
              <MaterialIcons name="chevron-right" size={22} color={colors.primary} />
            </Pressable>
          </View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  statsBanner: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: Spacing.md,
    margin: Spacing.md,
    borderRadius: BorderRadius.xl,
    gap: Spacing.sm,
  },
  statItem: { alignItems: 'center', gap: 5 },
  statIcon: { width: 38, height: 38, borderRadius: BorderRadius.sm, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: FontSize.xl, fontWeight: FontWeight.extrabold },
  statLabel: { fontSize: FontSize.xxs, fontWeight: '600', textAlign: 'center' },
  section: { paddingHorizontal: Spacing.md, marginBottom: Spacing.lg },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, marginBottom: Spacing.md },
  agentCard: { borderRadius: BorderRadius.xl, borderWidth: 1.5, padding: Spacing.md, marginBottom: Spacing.md, gap: Spacing.md },
  agentHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  agentAvatar: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  agentInfo: { flex: 1 },
  agentNameRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  agentName: { fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  agentModel: { fontSize: FontSize.xs, marginTop: 3 },
  chatBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  agentDesc: { fontSize: FontSize.sm, lineHeight: 20 },
  agentStats: { flexDirection: 'row', alignItems: 'center' },
  agentStatItem: { flex: 1, alignItems: 'center', gap: 3 },
  agentStatValue: { fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  agentStatLabel: { fontSize: FontSize.xxs },
  statDivider: { width: 1, height: 36 },
  capabilitiesSection: { gap: Spacing.sm },
  capTitle: { fontSize: FontSize.xxs + 1, fontWeight: FontWeight.bold, letterSpacing: 1 },
  capGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  capChip: { paddingHorizontal: Spacing.sm + 2, paddingVertical: Spacing.xs + 1, borderRadius: BorderRadius.full, borderWidth: 1 },
  capText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  chatWithBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: Spacing.sm + 2, borderRadius: BorderRadius.xl },
  chatWithText: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: '#fff' },
  createAgentCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.md + 2, borderRadius: BorderRadius.xl, borderWidth: 1.5, borderStyle: 'dashed' },
  createIcon: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  createTitle: { fontSize: FontSize.base, fontWeight: FontWeight.bold },
  createDesc: { fontSize: FontSize.sm, marginTop: 3, lineHeight: 19 },
});
