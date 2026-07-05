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
import { MOCK_WORKSPACES, MOCK_PROJECTS } from '@/services/workspace.service';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { StatusBadge } from '@/components/ui/StatusBadge';

export default function WorkspaceScreen() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [activeWorkspace, setActiveWorkspace] = useState(MOCK_WORKSPACES[0]);

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }).start();
  }, []);

  const workspaceProjects = MOCK_PROJECTS.filter(p => p.workspaceId === activeWorkspace.id);

  const storagePercent = (activeWorkspace.storageUsed / activeWorkspace.storageCap) * 100;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <Animated.View style={[styles.flex, { opacity: fadeAnim }]}>
        <PageHeader
          title="Workspaces"
          subtitle="Organize your AI projects"
          actions={[{ icon: 'add-circle-outline', onPress: () => {} }]}
        />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
          {/* Workspace Selector */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>YOUR WORKSPACES</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.workspaceRail}>
              {MOCK_WORKSPACES.map(ws => {
                const isActive = ws.id === activeWorkspace.id;
                return (
                  <Pressable
                    key={ws.id}
                    onPress={() => setActiveWorkspace(ws)}
                    style={({ pressed }) => [
                      styles.wsCard,
                      {
                        backgroundColor: isActive ? ws.color : colors.card,
                        borderColor: isActive ? ws.color : colors.cardBorder,
                        opacity: pressed ? 0.85 : 1,
                      },
                    ]}
                  >
                    <MaterialIcons name={ws.icon as any} size={24} color={isActive ? '#fff' : ws.color} />
                    <Text style={[styles.wsName, { color: isActive ? '#fff' : colors.text }]} numberOfLines={1}>{ws.name}</Text>
                    {ws.isPinned ? <MaterialIcons name="push-pin" size={11} color={isActive ? 'rgba(255,255,255,0.7)' : colors.textMuted} /> : null}
                  </Pressable>
                );
              })}
              <Pressable style={[styles.wsCard, styles.wsAddCard, { borderColor: colors.cardBorder, backgroundColor: colors.card }]}>
                <MaterialIcons name="add" size={24} color={colors.textMuted} />
                <Text style={[styles.wsName, { color: colors.textMuted }]}>New</Text>
              </Pressable>
            </ScrollView>
          </View>

          {/* Active Workspace Details */}
          <LinearGradient
            colors={isDark ? [activeWorkspace.color + '22', '#0F0F1A00'] : [activeWorkspace.color + '15', '#F5F5FF00']}
            style={styles.wsDetailCard}
          >
            <View style={[styles.wsDetailHeader, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <View style={[styles.wsDetailIcon, { backgroundColor: `${activeWorkspace.color}20` }]}>
                <MaterialIcons name={activeWorkspace.icon as any} size={28} color={activeWorkspace.color} />
              </View>
              <View style={styles.wsDetailInfo}>
                <Text style={[styles.wsDetailName, { color: colors.text }]}>{activeWorkspace.name}</Text>
                <Text style={[styles.wsDetailDesc, { color: colors.textSecondary }]} numberOfLines={1}>{activeWorkspace.description}</Text>
                <View style={styles.wsDetailMeta}>
                  <MaterialIcons name="folder" size={12} color={colors.textMuted} />
                  <Text style={[styles.wsDetailMetaText, { color: colors.textMuted }]}>{activeWorkspace.itemCount} items</Text>
                  {activeWorkspace.members ? (
                    <>
                      <MaterialIcons name="group" size={12} color={colors.textMuted} />
                      <Text style={[styles.wsDetailMetaText, { color: colors.textMuted }]}>{activeWorkspace.members} members</Text>
                    </>
                  ) : null}
                </View>
              </View>
              <Pressable style={[styles.wsSettingsBtn, { backgroundColor: `${activeWorkspace.color}20` }]}>
                <MaterialIcons name="settings" size={18} color={activeWorkspace.color} />
              </Pressable>
            </View>

            {/* Storage */}
            <View style={[styles.storageCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <View style={styles.storageHeader}>
                <Text style={[styles.storageLabel, { color: colors.text }]}>Storage</Text>
                <Text style={[styles.storageValue, { color: activeWorkspace.color }]}>
                  {activeWorkspace.storageUsed} / {activeWorkspace.storageCap} GB
                </Text>
              </View>
              <ProgressBar
                value={storagePercent}
                color={storagePercent > 80 ? '#FF5252' : activeWorkspace.color}
                height={6}
                gradient={[activeWorkspace.color, `${activeWorkspace.color}99`]}
              />
            </View>
          </LinearGradient>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>QUICK ACTIONS</Text>
            <View style={styles.quickGrid}>
              {[
                { label: 'New Project', icon: 'add-circle', color: activeWorkspace.color, onPress: () => router.push('/project-manager' as any) },
                { label: 'Files', icon: 'folder', color: '#F5C842', onPress: () => router.push('/file-manager' as any) },
                { label: 'AI Chat', icon: 'auto-awesome', color: '#7C6FFF', onPress: () => router.push('/(tabs)/chat' as any) },
                { label: 'Invite', icon: 'person-add', color: '#00D4FF', onPress: () => {} },
              ].map(action => (
                <Pressable
                  key={action.label}
                  onPress={action.onPress}
                  style={({ pressed }) => [styles.quickCard, { backgroundColor: colors.card, borderColor: colors.cardBorder, opacity: pressed ? 0.8 : 1 }]}
                >
                  <View style={[styles.quickIcon, { backgroundColor: `${action.color}20` }]}>
                    <MaterialIcons name={action.icon as any} size={22} color={action.color} />
                  </View>
                  <Text style={[styles.quickLabel, { color: colors.textSecondary }]}>{action.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Projects in this workspace */}
          <View style={styles.section}>
            <View style={styles.sectionRow}>
              <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>PROJECTS</Text>
              <Pressable onPress={() => router.push('/project-manager' as any)}>
                <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
              </Pressable>
            </View>
            {workspaceProjects.length > 0 ? workspaceProjects.map(project => (
              <Pressable
                key={project.id}
                onPress={() => router.push('/project-manager' as any)}
                style={({ pressed }) => [styles.projectCard, { backgroundColor: colors.card, borderColor: colors.cardBorder, opacity: pressed ? 0.85 : 1 }]}
              >
                <View style={[styles.projectIconBg, { backgroundColor: `${project.color}20` }]}>
                  <MaterialIcons name={project.icon as any} size={22} color={project.color} />
                </View>
                <View style={styles.projectInfo}>
                  <View style={styles.projectNameRow}>
                    <Text style={[styles.projectName, { color: colors.text }]} numberOfLines={1}>{project.name}</Text>
                    <StatusBadge status={project.status} size="sm" />
                  </View>
                  <ProgressBar value={project.progress} color={project.color} height={4} animated style={{ marginTop: 6 }} />
                  <View style={styles.projectMeta}>
                    <Text style={[styles.projectMetaText, { color: colors.textMuted }]}>{project.completedTasks}/{project.taskCount} tasks</Text>
                    <Text style={[styles.projectMetaText, { color: project.color }]}>{project.progress}%</Text>
                  </View>
                </View>
              </Pressable>
            )) : (
              <View style={[styles.emptyProjects, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                <MaterialIcons name="folder-open" size={32} color={colors.textMuted} />
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>No projects yet</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  section: { paddingHorizontal: Spacing.md, marginBottom: Spacing.lg },
  sectionTitle: { fontSize: FontSize.xxs + 1, fontWeight: FontWeight.bold, letterSpacing: 1.2, marginBottom: Spacing.md },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.md },
  seeAll: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  workspaceRail: { paddingRight: Spacing.md, gap: Spacing.sm },
  wsCard: { alignItems: 'center', gap: 6, padding: Spacing.md, borderRadius: BorderRadius.xl, borderWidth: 1.5, minWidth: 90 },
  wsAddCard: { borderStyle: 'dashed' },
  wsName: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, textAlign: 'center' },
  wsDetailCard: { marginHorizontal: Spacing.md, marginBottom: Spacing.lg, padding: Spacing.md, borderRadius: BorderRadius.xxl, gap: Spacing.sm },
  wsDetailHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.md, borderRadius: BorderRadius.xl, borderWidth: 1 },
  wsDetailIcon: { width: 56, height: 56, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center' },
  wsDetailInfo: { flex: 1 },
  wsDetailName: { fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  wsDetailDesc: { fontSize: FontSize.sm, marginTop: 2 },
  wsDetailMeta: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },
  wsDetailMetaText: { fontSize: FontSize.xs, marginRight: 4 },
  wsSettingsBtn: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  storageCard: { padding: Spacing.md, borderRadius: BorderRadius.xl, borderWidth: 1, gap: Spacing.sm },
  storageHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  storageLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  storageValue: { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  quickGrid: { flexDirection: 'row', gap: Spacing.sm },
  quickCard: { flex: 1, alignItems: 'center', gap: 7, paddingVertical: Spacing.md, borderRadius: BorderRadius.xl, borderWidth: 1 },
  quickIcon: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  quickLabel: { fontSize: FontSize.xxs + 1, fontWeight: FontWeight.semibold },
  projectCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.md, borderRadius: BorderRadius.xl, borderWidth: 1, marginBottom: Spacing.sm },
  projectIconBg: { width: 48, height: 48, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center' },
  projectInfo: { flex: 1 },
  projectNameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.sm },
  projectName: { flex: 1, fontSize: FontSize.base, fontWeight: FontWeight.semibold },
  projectMeta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  projectMetaText: { fontSize: FontSize.xs },
  emptyProjects: { alignItems: 'center', gap: Spacing.sm, padding: Spacing.xl, borderRadius: BorderRadius.xl, borderWidth: 1, borderStyle: 'dashed' },
  emptyText: { fontSize: FontSize.sm },
});
