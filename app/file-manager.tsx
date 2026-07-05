import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView, Animated,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/theme';
import { PageHeader } from '@/components/ui/PageHeader';
import { MOCK_FILES, FileItem } from '@/services/workspace.service';

const FILE_TYPE_META: Record<string, { icon: string; color: string }> = {
  folder:   { icon: 'folder', color: '#F5C842' },
  document: { icon: 'description', color: '#4285F4' },
  image:    { icon: 'image', color: '#00E676' },
  audio:    { icon: 'audiotrack', color: '#FF6B9D' },
  video:    { icon: 'videocam', color: '#FF9800' },
  code:     { icon: 'code', color: '#00D4FF' },
  archive:  { icon: 'archive', color: '#9C27B0' },
};

const formatSize = (bytes?: number) => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(1)} MB`;
  return `${(bytes / 1073741824).toFixed(1)} GB`;
};

export default function FileManagerScreen() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [currentPath, setCurrentPath] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size'>('name');

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }).start();
  }, []);

  const files = MOCK_FILES.filter(f => f.parentId === (currentPath ?? undefined));
  const breadcrumb = currentPath
    ? MOCK_FILES.find(f => f.id === currentPath)
    : null;

  const folderCount = files.filter(f => f.type === 'folder').length;
  const fileCount = files.filter(f => f.type !== 'folder').length;

  const sorted = [...files].sort((a, b) => {
    if (a.type === 'folder' && b.type !== 'folder') return -1;
    if (a.type !== 'folder' && b.type === 'folder') return 1;
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'date') return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    if (sortBy === 'size') return (b.size ?? 0) - (a.size ?? 0);
    return 0;
  });

  const openFile = (file: FileItem) => {
    if (file.type === 'folder') setCurrentPath(file.id);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <Animated.View style={[styles.flex, { opacity: fadeAnim }]}>
        <PageHeader
          title="File Manager"
          subtitle={`${folderCount} folders · ${fileCount} files`}
          actions={[
            { icon: viewMode === 'list' ? 'grid-view' : 'view-list', onPress: () => setViewMode(v => v === 'list' ? 'grid' : 'list') },
            { icon: 'add', onPress: () => {} },
          ]}
        />

        {/* Breadcrumb */}
        <View style={styles.breadcrumb}>
          <Pressable onPress={() => setCurrentPath(null)} style={styles.breadcrumbItem}>
            <MaterialIcons name="home" size={16} color={currentPath ? colors.textMuted : colors.primary} />
            <Text style={[styles.breadcrumbText, { color: currentPath ? colors.textMuted : colors.primary }]}>Root</Text>
          </Pressable>
          {breadcrumb ? (
            <>
              <MaterialIcons name="chevron-right" size={16} color={colors.textMuted} />
              <Text style={[styles.breadcrumbText, { color: colors.primary }]}>{breadcrumb.name}</Text>
            </>
          ) : null}
        </View>

        {/* Storage Overview */}
        {!currentPath ? (
          <LinearGradient colors={isDark ? ['#1A1040', '#0F0F1A'] : ['#EAE8FF', '#F0F0FF']} style={styles.storageBar}>
            {[
              { label: 'Documents', color: '#4285F4', percent: 28 },
              { label: 'Images', color: '#00E676', percent: 35 },
              { label: 'Code', color: '#00D4FF', percent: 18 },
              { label: 'Other', color: '#9E9E9E', percent: 19 },
            ].map(item => (
              <View key={item.label} style={[styles.storageSegment, { flex: item.percent, backgroundColor: item.color }]} />
            ))}
          </LinearGradient>
        ) : null}

        {/* Sort Controls */}
        <View style={styles.sortRow}>
          <Text style={[styles.sortLabel, { color: colors.textMuted }]}>Sort by:</Text>
          {(['name', 'date', 'size'] as const).map(s => (
            <Pressable
              key={s}
              onPress={() => setSortBy(s)}
              style={[styles.sortChip, { backgroundColor: sortBy === s ? colors.primary : colors.card, borderColor: sortBy === s ? colors.primary : colors.cardBorder }]}
            >
              <Text style={[styles.sortChipText, { color: sortBy === s ? '#fff' : colors.textSecondary }]}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.fileList}>
          {viewMode === 'list' ? sorted.map(file => {
            const meta = FILE_TYPE_META[file.type] ?? FILE_TYPE_META.document;
            return (
              <Pressable
                key={file.id}
                onPress={() => openFile(file)}
                style={({ pressed }) => [styles.fileRow, { backgroundColor: colors.card, borderColor: colors.cardBorder, opacity: pressed ? 0.85 : 1 }]}
              >
                {file.thumbnailUrl ? (
                  <Image source={{ uri: file.thumbnailUrl }} style={styles.fileThumbnail} contentFit="cover" />
                ) : (
                  <LinearGradient colors={[meta.color, `${meta.color}99`]} style={styles.fileIcon}>
                    <MaterialIcons name={meta.icon as any} size={22} color="#fff" />
                  </LinearGradient>
                )}
                <View style={styles.fileInfo}>
                  <Text style={[styles.fileName, { color: colors.text }]} numberOfLines={1}>{file.name}</Text>
                  <View style={styles.fileMetaRow}>
                    {file.size ? <Text style={[styles.fileSize, { color: colors.textMuted }]}>{formatSize(file.size)}</Text> : null}
                    <Text style={[styles.fileMeta, { color: colors.textMuted }]}>
                      {new Date(file.updatedAt).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
                <View style={styles.fileActions}>
                  {file.isStarred ? <MaterialIcons name="star" size={16} color="#F5C842" /> : null}
                  {file.type === 'folder'
                    ? <MaterialIcons name="chevron-right" size={20} color={colors.textMuted} />
                    : <Pressable hitSlop={8}><MaterialIcons name="more-vert" size={18} color={colors.textMuted} /></Pressable>
                  }
                </View>
              </Pressable>
            );
          }) : (
            <View style={styles.gridLayout}>
              {sorted.map(file => {
                const meta = FILE_TYPE_META[file.type] ?? FILE_TYPE_META.document;
                return (
                  <Pressable
                    key={file.id}
                    onPress={() => openFile(file)}
                    style={({ pressed }) => [styles.gridCell, { backgroundColor: colors.card, borderColor: colors.cardBorder, opacity: pressed ? 0.85 : 1 }]}
                  >
                    {file.thumbnailUrl ? (
                      <Image source={{ uri: file.thumbnailUrl }} style={styles.gridThumb} contentFit="cover" />
                    ) : (
                      <LinearGradient colors={[meta.color, `${meta.color}88`]} style={styles.gridIcon}>
                        <MaterialIcons name={meta.icon as any} size={28} color="#fff" />
                      </LinearGradient>
                    )}
                    <Text style={[styles.gridFileName, { color: colors.text }]} numberOfLines={2}>{file.name}</Text>
                    {file.size ? <Text style={[styles.gridFileSize, { color: colors.textMuted }]}>{formatSize(file.size)}</Text> : null}
                  </Pressable>
                );
              })}
            </View>
          )}
          <View style={{ height: 32 }} />
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  breadcrumb: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: Spacing.md, marginBottom: Spacing.sm },
  breadcrumbItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  breadcrumbText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  storageBar: { flexDirection: 'row', marginHorizontal: Spacing.md, height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: Spacing.md },
  storageSegment: { height: '100%' },
  sortRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingHorizontal: Spacing.md, marginBottom: Spacing.sm },
  sortLabel: { fontSize: FontSize.sm },
  sortChip: { paddingHorizontal: Spacing.sm + 2, paddingVertical: 4, borderRadius: BorderRadius.full, borderWidth: 1 },
  sortChipText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  fileList: { paddingHorizontal: Spacing.md },
  fileRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.sm + 4, borderRadius: BorderRadius.xl, borderWidth: 1, marginBottom: Spacing.sm },
  fileThumbnail: { width: 48, height: 48, borderRadius: BorderRadius.md },
  fileIcon: { width: 48, height: 48, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center' },
  fileInfo: { flex: 1 },
  fileName: { fontSize: FontSize.base, fontWeight: FontWeight.semibold },
  fileMetaRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: 3 },
  fileSize: { fontSize: FontSize.xs },
  fileMeta: { fontSize: FontSize.xs },
  fileActions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  gridLayout: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  gridCell: { width: '30%', padding: Spacing.sm, borderRadius: BorderRadius.xl, borderWidth: 1, alignItems: 'center', gap: 6 },
  gridThumb: { width: '100%', height: 70, borderRadius: BorderRadius.md },
  gridIcon: { width: 56, height: 56, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center' },
  gridFileName: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, textAlign: 'center' },
  gridFileSize: { fontSize: FontSize.xxs },
});
