import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView, Animated, TextInput, FlatList,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/theme';
import { PageHeader } from '@/components/ui/PageHeader';

type LogLevel = 'info' | 'warn' | 'error' | 'debug' | 'success';

interface LogEntry {
  id: string;
  level: LogLevel;
  message: string;
  timestamp: string;
  source?: string;
  data?: string;
}

const LOG_COLORS: Record<LogLevel, string> = {
  info:    '#00D4FF',
  warn:    '#FF9800',
  error:   '#FF5252',
  debug:   '#9E9E9E',
  success: '#00E676',
};

const LOG_ICONS: Record<LogLevel, string> = {
  info:    'info',
  warn:    'warning',
  error:   'error',
  debug:   'bug-report',
  success: 'check-circle',
};

const MOCK_LOGS: LogEntry[] = [
  { id: 'l1', level: 'info', message: 'App initialized successfully', timestamp: new Date(Date.now() - 5000).toISOString(), source: 'App' },
  { id: 'l2', level: 'success', message: 'Theme loaded: Cosmic Dark', timestamp: new Date(Date.now() - 4800).toISOString(), source: 'ThemeStore' },
  { id: 'l3', level: 'debug', message: 'Navigation state initialized', timestamp: new Date(Date.now() - 4600).toISOString(), source: 'Router' },
  { id: 'l4', level: 'info', message: 'AsyncStorage loaded: 14 keys', timestamp: new Date(Date.now() - 4200).toISOString(), source: 'Storage' },
  { id: 'l5', level: 'warn', message: 'Slow render detected: HomeScreen (84ms)', timestamp: new Date(Date.now() - 3800).toISOString(), source: 'Performance' },
  { id: 'l6', level: 'success', message: 'Mock AI service ready', timestamp: new Date(Date.now() - 3000).toISOString(), source: 'AIService' },
  { id: 'l7', level: 'debug', message: 'Store hydrated: useAppStore', timestamp: new Date(Date.now() - 2500).toISOString(), source: 'Zustand' },
  { id: 'l8', level: 'info', message: 'Component tree rendered (48 nodes)', timestamp: new Date(Date.now() - 2000).toISOString(), source: 'React' },
  { id: 'l9', level: 'error', message: 'Network request failed: timeout after 5000ms', timestamp: new Date(Date.now() - 1500).toISOString(), source: 'Network', data: 'URL: https://api.gemini.example.com/v1/chat' },
  { id: 'l10', level: 'warn', message: 'Image cache miss: splash-hero.png', timestamp: new Date(Date.now() - 1000).toISOString(), source: 'ImageCache' },
  { id: 'l11', level: 'info', message: 'User interaction: HomeScreen tap', timestamp: new Date(Date.now() - 500).toISOString(), source: 'Events' },
  { id: 'l12', level: 'success', message: 'Navigation: HomeScreen → DebugConsole', timestamp: new Date(Date.now() - 200).toISOString(), source: 'Router' },
];

export default function DebugConsoleScreen() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [logs, setLogs] = useState<LogEntry[]>(MOCK_LOGS);
  const [filter, setFilter] = useState<LogLevel | 'all'>('all');
  const [search, setSearch] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }).start();
    // Simulate live logs
    const interval = setInterval(() => {
      const liveLogs: LogEntry[] = [
        { id: `live_${Date.now()}`, level: 'debug', message: 'Heartbeat ping', timestamp: new Date().toISOString(), source: 'System' },
        { id: `live2_${Date.now()}`, level: 'info', message: 'State update: voiceMode → idle', timestamp: new Date().toISOString(), source: 'Zustand' },
      ];
      setLogs(prev => [...prev, liveLogs[Math.floor(Math.random() * liveLogs.length)]].slice(-50));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const filteredLogs = logs.filter(log => {
    const matchLevel = filter === 'all' || log.level === filter;
    const matchSearch = !search || log.message.toLowerCase().includes(search.toLowerCase()) || (log.source ?? '').toLowerCase().includes(search.toLowerCase());
    return matchLevel && matchSearch;
  });

  const counts = logs.reduce((acc, log) => {
    acc[log.level] = (acc[log.level] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const formatTime = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <Animated.View style={[styles.flex, { opacity: fadeAnim }]}>
        <PageHeader
          title="Debug Console"
          subtitle={`${logs.length} entries`}
          actions={[
            { icon: 'delete-sweep', onPress: () => setLogs([]) },
          ]}
        />

        {/* Console Header */}
        <View style={[styles.consoleBar, { backgroundColor: isDark ? '#0A0A14' : '#F0F0FF', borderBottomColor: colors.border }]}>
          {/* Search */}
          <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <MaterialIcons name="search" size={16} color={colors.textMuted} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Filter logs..."
              placeholderTextColor={colors.textMuted}
              style={[styles.searchInput, { color: colors.text }]}
            />
          </View>

          {/* Level Filters */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
            {(['all', 'info', 'success', 'warn', 'error', 'debug'] as const).map(level => (
              <Pressable
                key={level}
                onPress={() => setFilter(level)}
                style={[
                  styles.filterChip,
                  { backgroundColor: filter === level ? (level === 'all' ? colors.primary : LOG_COLORS[level as LogLevel]) : colors.card },
                ]}
              >
                <Text style={[styles.filterText, { color: filter === level ? '#fff' : colors.textMuted }]}>
                  {level.toUpperCase()}
                  {level !== 'all' && counts[level] ? ` (${counts[level]})` : ''}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Log Entries */}
        <View style={[styles.logContainer, { backgroundColor: isDark ? '#06060E' : '#F8F8FF' }]}>
          <FlatList
            data={filteredLogs}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.logList}
            renderItem={({ item: log }) => {
              const logColor = LOG_COLORS[log.level];
              const isExpanded = expandedId === log.id;
              return (
                <Pressable
                  onPress={() => setExpandedId(isExpanded ? null : log.id)}
                  style={[styles.logEntry, { borderLeftColor: logColor, backgroundColor: isExpanded ? `${logColor}08` : 'transparent' }]}
                >
                  <View style={styles.logHeader}>
                    <MaterialIcons name={LOG_ICONS[log.level] as any} size={13} color={logColor} />
                    <Text style={[styles.logTime, { color: colors.textMuted }]}>{formatTime(log.timestamp)}</Text>
                    {log.source ? (
                      <View style={[styles.sourceTag, { backgroundColor: `${logColor}15` }]}>
                        <Text style={[styles.sourceText, { color: logColor }]}>{log.source}</Text>
                      </View>
                    ) : null}
                    <Text style={[styles.logMessage, { color: colors.text }]} numberOfLines={isExpanded ? undefined : 1}>{log.message}</Text>
                  </View>
                  {isExpanded && log.data ? (
                    <View style={[styles.logData, { backgroundColor: `${logColor}10`, borderColor: `${logColor}20` }]}>
                      <Text style={[styles.logDataText, { color: logColor }]}>{log.data}</Text>
                    </View>
                  ) : null}
                </Pressable>
              );
            }}
          />
        </View>

        {/* Bottom Controls */}
        <View style={[styles.bottomBar, { backgroundColor: isDark ? '#0A0A14' : '#F0F0FF', borderTopColor: colors.border }]}>
          <View style={styles.autoScrollRow}>
            <MaterialIcons name="swap-vert" size={16} color={colors.textMuted} />
            <Text style={[styles.autoScrollLabel, { color: colors.textMuted }]}>Auto-scroll</Text>
            <View style={[styles.toggleBtn, { backgroundColor: autoScroll ? '#00E67630' : colors.cardBorder }]}>
              <Pressable onPress={() => setAutoScroll(p => !p)}>
                <Text style={{ fontSize: FontSize.xs, color: autoScroll ? '#00E676' : colors.textMuted, fontWeight: FontWeight.bold }}>
                  {autoScroll ? 'ON' : 'OFF'}
                </Text>
              </Pressable>
            </View>
          </View>
          <View style={styles.logCount}>
            <View style={[styles.liveDot, { backgroundColor: '#00E676' }]} />
            <Text style={[styles.logCountText, { color: colors.textMuted }]}>{filteredLogs.length} shown of {logs.length}</Text>
          </View>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  consoleBar: { paddingHorizontal: Spacing.md, paddingTop: Spacing.sm, paddingBottom: Spacing.xs, borderBottomWidth: StyleSheet.hairlineWidth },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, borderRadius: BorderRadius.xl, borderWidth: 1, paddingHorizontal: Spacing.sm + 2, paddingVertical: Spacing.xs + 1, marginBottom: Spacing.xs },
  searchInput: { flex: 1, fontSize: FontSize.sm, includeFontPadding: false },
  filterRow: { gap: Spacing.xs, paddingBottom: Spacing.sm, alignItems: 'center' },
  filterChip: { paddingHorizontal: Spacing.sm + 2, paddingVertical: 4, borderRadius: BorderRadius.full },
  filterText: { fontSize: FontSize.xxs + 1, fontWeight: FontWeight.bold },
  logContainer: { flex: 1 },
  logList: { padding: Spacing.sm },
  logEntry: { borderLeftWidth: 2, paddingLeft: Spacing.sm, marginBottom: 2, paddingVertical: 3 },
  logHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, flexWrap: 'wrap' },
  logTime: { fontSize: FontSize.xxs, fontFamily: 'monospace' as any },
  sourceTag: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4 },
  sourceText: { fontSize: FontSize.xxs, fontWeight: FontWeight.bold },
  logMessage: { flex: 1, fontSize: FontSize.xxs + 1, lineHeight: 16, fontFamily: 'monospace' as any },
  logData: { marginTop: 4, padding: Spacing.sm, borderRadius: BorderRadius.md, borderWidth: 1 },
  logDataText: { fontSize: FontSize.xxs + 1, fontFamily: 'monospace' as any },
  bottomBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.md, borderTopWidth: StyleSheet.hairlineWidth },
  autoScrollRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  autoScrollLabel: { fontSize: FontSize.sm },
  toggleBtn: { paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: BorderRadius.full },
  logCount: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  liveDot: { width: 6, height: 6, borderRadius: 3 },
  logCountText: { fontSize: FontSize.xs },
});
