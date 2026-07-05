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
import { MOCK_PROJECTS } from '@/services/workspace.service';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';

type FilterStatus = 'all' | 'active' | 'completed' | 'paused' | 'archived';

const PROJECT_TYPE_ICON: Record<string, string> = {
  ai_app: 'phone-android',
  website: 'language',
  research: 'science',
  content: 'article',
  general: 'folder',
};

export default function ProjectManagerScreen() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'progress' | 'deadline'>('recent');

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }).start();
  }, []);

  const filtered = MOCK_PROJECTS.filter(p => filter === 'all' || p.status === filter);
  const activeCount = MOCK_PROJECTS.filter(p => p.status === 'active').length;
  const completedCount = MOCK_PROJECTS.filter(p => p.status === 'completed').length;

  const formatDeadline = (deadline?: string) => {
    if (!deadline) return null;
    const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000);
    if (days < 0) return { text: 'Overdue', color: '#FF5252' };
    if (days === 0) return { text: 'Due today', color: '#FF9800' };
    if (days <= 7) return { text: `${days}d left`, color: '#FF9800' };
    return { text: `${days}d left`, color: '#9E9E9E' };
  };

  const FILTER_OPTIONS: FilterStatus[] = ['all', 'active', 'completed', 'paused', 'archived'];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <Animated.View style={[styles.flex, { opacity: fadeAnim }]}>
        <PageHeader
          title="Projects"
          subtitle={`${activeCount} active · ${completedCount} completed`}
          actions={[
            { icon: 'sort', onPress: () => {} },
            { icon: 'add-circle-outline', onPress: () => {} },
          ]}
        />

        {/* Stats */}
        <LinearGradient
          colors={isDark ? ['#14142C', '#0F0F1A'] : ['#EAE8FF', '#F5F5FF']}
          style={styles.statsRow}
        >
          {[
            { label: 'Total', value: MOCK_PROJECTS.length, color: '#7C6FFF', icon: 'folder' },
            { label: 'Active', value: activeCount, color: '#00E676', icon: 'play-circle' },
            { label: 'Completed', value: completedCount, color: '#00D4FF', icon: 'check-circle' },
            { label: 'Paused', value: MOCK_PROJECTS.filter(p => p.status === 'paused').length, color: '#FF9800', icon: 'pause-circle' },
          ].map(stat => (
            <Pressable
              key={stat.label}
              onPress={() => setFilter(stat.label.toLowerCase() as FilterStatus)}
              style={styles.statItem}
            >
              <View style={[styles.statIcon, { backgroundColor: `${stat.color}20` }]}>
                <MaterialIcons name={stat.icon as any} size={18} color={stat.color} />
              </View>
              <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>{stat.label}</Text>
            </Pressable>
          ))}
        </LinearGradient>

        {/* Filter Chips */}
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContent}>
            {FILTER_OPTIONS.map(f => (
              <Pressable
                key={f}
                onPress={() => setFilter(f)}
                style={({ pressed }) => [
                  styles.filterChip,
                  filter === f
                    ? { backgroundColor: colors.primary, borderColor: colors.primary }
                    : { backgroundColor: colors.card, borderColor: colors.cardBorder },
                  { opacity: pressed ? 0.8 : 1 },
                ]}
              >
                <Text style={[styles.filterText, { color: filter === f ? '#fff' : colors.textSecondary }]}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
          {filtered.length === 0 ? (
            <EmptyState
              icon="folder-open"
              title="No projects"
              description="Create your first AI project to get started"
              actionLabel="New Project"
              onAction={() => {}}
              color={colors.primary}
            />
          ) : filtered.map(project => {
            const deadline = formatDeadline(project.deadline);
            return (
              <Pressable
                key={project.id}
                style={({ pressed }) => [
                  styles.projectCard,
                  { backgroundColor: colors.card, borderColor: colors.cardBorder, opacity: pressed ? 0.88 : 1 },
                ]}
              >
                {/* Header */}
                <View style={styles.projectHeader}>
                  <LinearGradient colors={[project.color, `${project.color}99`]} style={styles.projectIcon}>
                    <MaterialIcons name={project.icon as any} size={22} color="#fff" />
                  </LinearGradient>
                  <View style={styles.projectTitleBlock}>
                    <Text style={[styles.projectName, { color: colors.text }]}>{project.name}</Text>
                    <Text style={[styles.projectDesc, { color: colors.textSecondary }]} numberOfLines={1}>{project.description}</Text>
                  </View>
                  <StatusBadge status={project.status} />
                </View>

                {/* Progress */}
                <ProgressBar
                  value={project.progress}
                  color={project.color}
                  height={6}
                  gradient={[project.color, `${project.color}88`]}
                  showLabel
                  label={`${project.completedTasks}/${project.taskCount} tasks`}
                />

                {/* Footer */}
                <View style={styles.projectFooter}>
                  {deadline ? (
                    <View style={styles.deadlineChip}>
                      <MaterialIcons name="event" size={12} color={deadline.color} />
                      <Text style={[styles.deadlineText, { color: deadline.color }]}>{deadline.text}</Text>
                    </View>
                  ) : <View />}

                  <View style={styles.projectActions}>
                    {project.collaborators ? (
                      <View style={styles.collaborators}>
                        <MaterialIcons name="group" size={13} color={colors.textMuted} />
                        <Text style={[styles.collaboratorText, { color: colors.textMuted }]}>{project.collaborators}</Text>
                      </View>
                    ) : null}
                    <Pressable style={({ pressed }) => [styles.projectActionBtn, { backgroundColor: `${project.color}20`, opacity: pressed ? 0.8 : 1 }]}>
                      <MaterialIcons name="auto-awesome" size={14} color={project.color} />
                      <Text style={[styles.projectActionText, { color: project.color }]}>Open</Text>
                    </Pressable>
                  </View>
                </View>

                {/* Tags */}
                <View style={styles.tagRow}>
                  {project.tags.map(tag => (
                    <View key={tag} style={[styles.tag, { backgroundColor: colors.cardBorder }]}>
                      <Text style={[styles.tagText, { color: colors.textMuted }]}>#{tag}</Text>
                    </View>
                  ))}
                </View>
              </Pressable>
            );
          })}

          {/* Create new */}
          <Pressable style={[styles.createBtn, { borderColor: colors.primary, backgroundColor: `${colors.primary}10` }]}>
            <MaterialIcons name="add-circle-outline" size={22} color={colors.primary} />
            <Text style={[styles.createText, { color: colors.primary }]}>Create New Project</Text>
          </Pressable>
          <View style={{ height: 32 }} />
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', padding: Spacing.md, marginHorizontal: Spacing.md, borderRadius: BorderRadius.xl, marginBottom: Spacing.sm },
  statItem: { alignItems: 'center', gap: 4 },
  statIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: FontSize.xl, fontWeight: FontWeight.extrabold },
  statLabel: { fontSize: FontSize.xxs },
  filterContainer: { maxHeight: 46, marginBottom: Spacing.sm },
  filterContent: { paddingHorizontal: Spacing.md, gap: Spacing.sm, alignItems: 'center' },
  filterChip: { paddingHorizontal: Spacing.md, paddingVertical: 7, borderRadius: BorderRadius.full, borderWidth: 1 },
  filterText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  list: { paddingHorizontal: Spacing.md, paddingTop: Spacing.sm },
  projectCard: { borderRadius: BorderRadius.xl, borderWidth: 1, padding: Spacing.md, marginBottom: Spacing.sm, gap: Spacing.sm },
  projectHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  projectIcon: { width: 50, height: 50, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center' },
  projectTitleBlock: { flex: 1 },
  projectName: { fontSize: FontSize.base, fontWeight: FontWeight.bold },
  projectDesc: { fontSize: FontSize.sm, marginTop: 2 },
  projectFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  deadlineChip: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  deadlineText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  projectActions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  collaborators: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  collaboratorText: { fontSize: FontSize.xs },
  projectActionBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: Spacing.sm + 2, paddingVertical: Spacing.xs + 2, borderRadius: BorderRadius.full },
  projectActionText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  tag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: BorderRadius.full },
  tagText: { fontSize: FontSize.xxs + 1 },
  createBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, padding: Spacing.md + 2, borderRadius: BorderRadius.xl, borderWidth: 1.5, borderStyle: 'dashed', marginTop: Spacing.sm },
  createText: { fontSize: FontSize.base, fontWeight: FontWeight.bold },
});
