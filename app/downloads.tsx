import React, { useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView, Animated,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { useAppStore } from '@/stores/useAppStore';
import { Badge } from '@/components/ui/Badge';
import { BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/theme';

export default function DownloadsScreen() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const { downloads } = useAppStore();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }).start();
  }, []);

  const completed = downloads.filter(d => d.status === 'completed');
  const inProgress = downloads.filter(d => d.status === 'in_progress');

  const totalSize = completed.reduce((acc, d) => {
    const mb = parseFloat(d.size);
    return acc + (isNaN(mb) ? 0 : mb);
  }, 0);

  const STATUS_META: Record<string, { label: string; variant: any; icon: string }> = {
    completed: { label: 'Done', variant: 'success', icon: 'check-circle' },
    failed: { label: 'Failed', variant: 'error', icon: 'error' },
    in_progress: { label: 'Downloading', variant: 'primary', icon: 'downloading' },
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <Animated.View style={[styles.flex, { opacity: fadeAnim }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Pressable onPress={() => router.back()} hitSlop={8} style={({ pressed }) => [styles.backBtn, { backgroundColor: colors.card, opacity: pressed ? 0.8 : 1 }]}>
            <MaterialIcons name="arrow-back-ios" size={18} color={colors.text} />
          </Pressable>
          <View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Downloads</Text>
            <Text style={[styles.headerSub, { color: colors.textSecondary }]}>{completed.length} files · {totalSize.toFixed(1)} MB</Text>
          </View>
          <Pressable style={({ pressed }) => [styles.sortBtn, { backgroundColor: colors.card, borderColor: colors.cardBorder, opacity: pressed ? 0.8 : 1 }]}>
            <MaterialIcons name="sort" size={18} color={colors.textSecondary} />
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
          {inProgress.length > 0 ? (
            <View style={styles.section}>
              <Text style={[styles.groupLabel, { color: colors.textMuted }]}>IN PROGRESS</Text>
              {inProgress.map(item => (
                <View
                  key={item.id}
                  style={[styles.downloadCard, { backgroundColor: `${item.color}0D`, borderColor: `${item.color}30` }]}
                >
                  <View style={[styles.fileIcon, { backgroundColor: `${item.color}20` }]}>
                    <MaterialIcons name={item.icon as any} size={24} color={item.color} />
                  </View>
                  <View style={styles.fileInfo}>
                    <Text style={[styles.fileName, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
                    <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
                      <View style={[styles.progressFill, { backgroundColor: item.color, width: `${item.progress ?? 0}%` }]} />
                    </View>
                    <Text style={[styles.fileSize, { color: item.color }]}>{item.progress}% · Downloading...</Text>
                  </View>
                  <Pressable hitSlop={8}>
                    <MaterialIcons name="close" size={18} color={colors.textMuted} />
                  </Pressable>
                </View>
              ))}
            </View>
          ) : null}

          {completed.length > 0 ? (
            <View style={styles.section}>
              <Text style={[styles.groupLabel, { color: colors.textMuted }]}>COMPLETED</Text>
              {completed.map(item => (
                <Pressable
                  key={item.id}
                  style={({ pressed }) => [styles.downloadCard, { backgroundColor: colors.card, borderColor: colors.cardBorder, opacity: pressed ? 0.85 : 1 }]}
                >
                  <LinearGradient colors={[item.color, `${item.color}BB`]} style={styles.fileIcon}>
                    <MaterialIcons name={item.icon as any} size={24} color="#fff" />
                  </LinearGradient>
                  <View style={styles.fileInfo}>
                    <Text style={[styles.fileName, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
                    <View style={styles.fileMetaRow}>
                      <Badge label="Done" variant="success" size="sm" />
                      <Text style={[styles.fileSize, { color: colors.textMuted }]}>{item.size}</Text>
                    </View>
                  </View>
                  <Pressable hitSlop={8}>
                    <MaterialIcons name="more-vert" size={18} color={colors.textMuted} />
                  </Pressable>
                </Pressable>
              ))}
            </View>
          ) : null}

          {downloads.length === 0 ? (
            <View style={styles.empty}>
              <LinearGradient colors={['#7C6FFF22', '#00D4FF11']} style={styles.emptyIcon}>
                <MaterialIcons name="download" size={44} color={colors.textMuted} />
              </LinearGradient>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No downloads yet</Text>
              <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>Generated files will appear here</Text>
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
  sortBtn: { width: 38, height: 38, borderRadius: BorderRadius.sm + 2, alignItems: 'center', justifyContent: 'center', borderWidth: 1, marginLeft: 'auto' as any },

  section: { paddingHorizontal: Spacing.md, paddingTop: Spacing.lg },
  groupLabel: { fontSize: FontSize.xxs + 1, fontWeight: FontWeight.bold, letterSpacing: 1.2, marginBottom: Spacing.md },

  downloadCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.md, borderRadius: BorderRadius.xl, borderWidth: 1, marginBottom: Spacing.sm },
  fileIcon: { width: 52, height: 52, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center' },
  fileInfo: { flex: 1, gap: 5 },
  fileName: { fontSize: FontSize.base, fontWeight: FontWeight.semibold },
  fileMetaRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  fileSize: { fontSize: FontSize.sm },
  progressTrack: { height: 5, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },

  empty: { alignItems: 'center', gap: Spacing.md, paddingTop: Spacing.xxl, paddingHorizontal: Spacing.xl },
  emptyIcon: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold },
  emptyDesc: { fontSize: FontSize.base, textAlign: 'center' },
});
