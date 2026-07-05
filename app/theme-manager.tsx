import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView, Animated, Switch, TextInput,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { BorderRadius, FontSize, FontWeight, Spacing, Colors } from '@/constants/theme';
import { PageHeader } from '@/components/ui/PageHeader';
import { useAlert } from '@/template';

const PRESET_THEMES = [
  { id: 'cosmic', name: 'Cosmic Dark', primary: '#7C6FFF', background: '#080810', card: '#161624', isDark: true },
  { id: 'ocean', name: 'Deep Ocean', primary: '#00D4FF', background: '#060E18', card: '#0E1E2E', isDark: true },
  { id: 'forest', name: 'Forest Night', primary: '#00E676', background: '#060E08', card: '#0E1E0E', isDark: true },
  { id: 'sunset', name: 'Sunset Glow', primary: '#FF6B9D', background: '#120808', card: '#1E0E10', isDark: true },
  { id: 'amber', name: 'Golden Amber', primary: '#F5C842', background: '#100E00', card: '#1E1A00', isDark: true },
  { id: 'pure_light', name: 'Pure Light', primary: '#6C63FF', background: '#F0F0FF', card: '#FFFFFF', isDark: false },
  { id: 'minimal', name: 'Minimal White', primary: '#007AFF', background: '#F5F5F5', card: '#FFFFFF', isDark: false },
  { id: 'cream', name: 'Warm Cream', primary: '#D4804A', background: '#FBF5EC', card: '#FFFFFF', isDark: false },
];

const ACCENT_COLORS = [
  '#7C6FFF', '#00D4FF', '#FF6B9D', '#00E676', '#F5C842', '#FF9800', '#4CAF50', '#9C27B0',
];

const FONT_OPTIONS = [
  { id: 'system', name: 'System Default', preview: 'Aa' },
  { id: 'rounded', name: 'Rounded', preview: 'Aa' },
  { id: 'mono', name: 'Monospace', preview: 'Aa' },
];

export default function ThemeManagerScreen() {
  const { colors, isDark, toggleTheme } = useTheme();
  const router = useRouter();
  const { showAlert } = useAlert();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [selectedTheme, setSelectedTheme] = useState('cosmic');
  const [accentColor, setAccentColor] = useState('#7C6FFF');
  const [borderRadius, setBorderRadius] = useState<'sharp' | 'rounded' | 'pill'>('rounded');
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [selectedFont, setSelectedFont] = useState('system');
  const [reduceMotion, setReduceMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [compactMode, setCompactMode] = useState(false);

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }).start();
  }, []);

  const handleApplyTheme = (themeId: string) => {
    setSelectedTheme(themeId);
    const theme = PRESET_THEMES.find(t => t.id === themeId);
    if (theme && theme.isDark !== isDark) toggleTheme();
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <Animated.View style={[styles.flex, { opacity: fadeAnim }]}>
        <PageHeader title="Theme Manager" subtitle="Personalize your SONA" />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          {/* Live Preview */}
          <View style={[styles.previewCard, { borderColor: colors.cardBorder }]}>
            <LinearGradient colors={[accentColor, `${accentColor}88`]} style={styles.previewHeader}>
              <View style={styles.previewBg} />
              <Text style={styles.previewHeaderText}>Preview</Text>
              <Text style={styles.previewHeaderSub}>Live theme preview</Text>
            </LinearGradient>
            <View style={[styles.previewBody, { backgroundColor: isDark ? Colors.dark.background : Colors.light.background }]}>
              <View style={[styles.previewMsgUser, { backgroundColor: accentColor }]}>
                <Text style={styles.previewMsgText}>Hello SONA AI!</Text>
              </View>
              <View style={[styles.previewMsgAI, { backgroundColor: isDark ? Colors.dark.card : Colors.light.card, borderColor: isDark ? Colors.dark.cardBorder : Colors.light.cardBorder }]}>
                <Text style={[styles.previewMsgText, { color: isDark ? Colors.dark.text : Colors.light.text }]}>Hi! How can I help you today?</Text>
              </View>
              <View style={[styles.previewInput, { backgroundColor: isDark ? Colors.dark.card : Colors.light.card, borderColor: accentColor }]}>
                <Text style={[styles.previewInputText, { color: isDark ? Colors.dark.textMuted : Colors.light.textMuted }]}>Type a message...</Text>
                <LinearGradient colors={[accentColor, `${accentColor}CC`]} style={styles.previewSendBtn}>
                  <MaterialIcons name="send" size={14} color="#fff" />
                </LinearGradient>
              </View>
            </View>
          </View>

          {/* Preset Themes */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Theme Presets</Text>
            <View style={styles.themeGrid}>
              {PRESET_THEMES.map(theme => {
                const isSelected = selectedTheme === theme.id;
                return (
                  <Pressable
                    key={theme.id}
                    onPress={() => handleApplyTheme(theme.id)}
                    style={({ pressed }) => [
                      styles.themeCard,
                      { borderColor: isSelected ? theme.primary : colors.cardBorder, opacity: pressed ? 0.85 : 1 },
                    ]}
                  >
                    <View style={[styles.themePreview, { backgroundColor: theme.background }]}>
                      <View style={[styles.themeCardInner, { backgroundColor: theme.card }]}>
                        <View style={[styles.themeAccentDot, { backgroundColor: theme.primary }]} />
                        <View style={[styles.themeTextLine, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)' }]} />
                        <View style={[styles.themeTextLineSm, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)' }]} />
                      </View>
                    </View>
                    {isSelected ? (
                      <View style={[styles.themeCheck, { backgroundColor: theme.primary }]}>
                        <MaterialIcons name="check" size={12} color="#fff" />
                      </View>
                    ) : null}
                    <Text style={[styles.themeName, { color: colors.textSecondary }]} numberOfLines={1}>{theme.name}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Accent Color */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Accent Color</Text>
            <View style={styles.colorRow}>
              {ACCENT_COLORS.map(color => (
                <Pressable
                  key={color}
                  onPress={() => setAccentColor(color)}
                  style={[
                    styles.colorSwatch,
                    { backgroundColor: color },
                    accentColor === color && { borderWidth: 3, borderColor: '#fff' },
                  ]}
                >
                  {accentColor === color ? <MaterialIcons name="check" size={14} color="#fff" /> : null}
                </Pressable>
              ))}
              <Pressable style={[styles.colorSwatch, { backgroundColor: colors.cardBorder, borderWidth: 1.5, borderColor: colors.border, borderStyle: 'dashed' }]}>
                <MaterialIcons name="colorize" size={16} color={colors.textMuted} />
              </Pressable>
            </View>
          </View>

          {/* Typography */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Typography</Text>
            <View style={[styles.settingsCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              {/* Font Size */}
              <View style={styles.settingRow}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>Font Size</Text>
                <View style={styles.segmented}>
                  {(['sm', 'md', 'lg'] as const).map(size => (
                    <Pressable
                      key={size}
                      onPress={() => setFontSize(size)}
                      style={[styles.segment, { backgroundColor: fontSize === size ? accentColor : colors.background }]}
                    >
                      <Text style={[styles.segmentText, { color: fontSize === size ? '#fff' : colors.textMuted }]}>
                        {size === 'sm' ? 'Aa' : size === 'md' ? 'Aa' : 'Aa'}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              {/* Border Radius */}
              <View style={styles.settingRow}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>Corners</Text>
                <View style={styles.segmented}>
                  {(['sharp', 'rounded', 'pill'] as const).map(r => (
                    <Pressable
                      key={r}
                      onPress={() => setBorderRadius(r)}
                      style={[styles.segment, { backgroundColor: borderRadius === r ? accentColor : colors.background }]}
                    >
                      <Text style={[styles.segmentText, { color: borderRadius === r ? '#fff' : colors.textMuted, fontSize: FontSize.xxs }]}>
                        {r === 'sharp' ? 'Sharp' : r === 'rounded' ? 'Round' : 'Pill'}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>
          </View>

          {/* Accessibility */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Accessibility</Text>
            <View style={[styles.settingsCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              {[
                { label: 'Reduce Motion', desc: 'Minimize animations', value: reduceMotion, onToggle: setReduceMotion, color: '#7C6FFF', icon: 'animation' },
                { label: 'High Contrast', desc: 'Increase text contrast', value: highContrast, onToggle: setHighContrast, color: '#F5C842', icon: 'contrast' },
                { label: 'Compact Mode', desc: 'Reduce spacing density', value: compactMode, onToggle: setCompactMode, color: '#00D4FF', icon: 'compress' },
              ].map((item, idx, arr) => (
                <View key={item.label}>
                  <View style={styles.settingRow}>
                    <View style={[styles.settingIconBg, { backgroundColor: `${item.color}20` }]}>
                      <MaterialIcons name={item.icon as any} size={18} color={item.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.settingLabel, { color: colors.text }]}>{item.label}</Text>
                      <Text style={[styles.settingDesc, { color: colors.textMuted }]}>{item.desc}</Text>
                    </View>
                    <Switch
                      value={item.value}
                      onValueChange={item.onToggle}
                      trackColor={{ false: colors.border, true: `${item.color}70` }}
                      thumbColor={item.value ? item.color : colors.textMuted}
                    />
                  </View>
                  {idx < arr.length - 1 ? <View style={[styles.divider, { backgroundColor: colors.border, marginLeft: 54 }]} /> : null}
                </View>
              ))}
            </View>
          </View>

          {/* Apply & Reset */}
          <View style={[styles.section, { gap: Spacing.sm }]}>
            <Pressable style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}>
              <LinearGradient colors={[accentColor, `${accentColor}CC`]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.applyBtn}>
                <MaterialIcons name="palette" size={20} color="#fff" />
                <Text style={styles.applyBtnText}>Apply Theme</Text>
              </LinearGradient>
            </Pressable>
            <Pressable
              onPress={() => showAlert('Reset Theme?', 'This will restore SONA to the default Cosmic Dark theme.', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Reset', style: 'destructive', onPress: () => { setSelectedTheme('cosmic'); setAccentColor('#7C6FFF'); } },
              ])}
              style={({ pressed }) => [styles.resetBtn, { borderColor: colors.cardBorder, backgroundColor: colors.card, opacity: pressed ? 0.8 : 1 }]}
            >
              <Text style={[styles.resetBtnText, { color: colors.textSecondary }]}>Reset to Default</Text>
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
  previewCard: { margin: Spacing.md, borderRadius: BorderRadius.xxl, overflow: 'hidden', borderWidth: 1 },
  previewHeader: { padding: Spacing.md, overflow: 'hidden' },
  previewBg: { position: 'absolute', width: 150, height: 150, borderRadius: 75, backgroundColor: 'rgba(255,255,255,0.08)', top: -40, right: -30 },
  previewHeaderText: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: '#fff' },
  previewHeaderSub: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.7)' },
  previewBody: { padding: Spacing.md, gap: Spacing.sm },
  previewMsgUser: { alignSelf: 'flex-end', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.xl, maxWidth: '70%' },
  previewMsgAI: { alignSelf: 'flex-start', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.xl, borderWidth: 1, maxWidth: '70%' },
  previewMsgText: { fontSize: FontSize.sm, color: '#fff', fontWeight: '500' },
  previewInput: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full, borderWidth: 1.5 },
  previewInputText: { fontSize: FontSize.sm },
  previewSendBtn: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  section: { paddingHorizontal: Spacing.md, marginBottom: Spacing.lg },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, marginBottom: Spacing.md },
  themeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  themeCard: { width: '22%', borderRadius: BorderRadius.xl, borderWidth: 2, overflow: 'hidden', position: 'relative' },
  themePreview: { padding: Spacing.sm, height: 64 },
  themeCardInner: { flex: 1, borderRadius: BorderRadius.md, padding: 6, gap: 4 },
  themeAccentDot: { width: 10, height: 10, borderRadius: 5 },
  themeTextLine: { height: 4, borderRadius: 2, width: '80%' },
  themeTextLineSm: { height: 3, borderRadius: 2, width: '50%' },
  themeCheck: { position: 'absolute', top: 4, right: 4, width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  themeName: { fontSize: FontSize.xxs, padding: 4, textAlign: 'center' },
  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  colorSwatch: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  settingsCard: { borderRadius: BorderRadius.xl, borderWidth: 1, paddingVertical: Spacing.xs, paddingHorizontal: Spacing.md },
  settingRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.sm + 2 },
  settingLabel: { fontSize: FontSize.base, fontWeight: FontWeight.medium },
  settingDesc: { fontSize: FontSize.xs, marginTop: 1 },
  settingIconBg: { width: 38, height: 38, borderRadius: BorderRadius.sm + 2, alignItems: 'center', justifyContent: 'center' },
  divider: { height: StyleSheet.hairlineWidth },
  segmented: { flexDirection: 'row', backgroundColor: 'transparent', borderRadius: BorderRadius.md, overflow: 'hidden', gap: 3 },
  segment: { paddingHorizontal: Spacing.sm + 2, paddingVertical: 6, borderRadius: BorderRadius.md },
  segmentText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  applyBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, padding: Spacing.md + 2, borderRadius: BorderRadius.xl },
  applyBtnText: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: '#fff' },
  resetBtn: { alignItems: 'center', padding: Spacing.md, borderRadius: BorderRadius.xl, borderWidth: 1 },
  resetBtnText: { fontSize: FontSize.base, fontWeight: FontWeight.semibold },
});
