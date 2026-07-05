import React, { useRef, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated, ScrollView, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/hooks/useTheme';
import { useAppStore } from '@/stores/useAppStore';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/theme';

const { width } = Dimensions.get('window');

const VOICE_COMMANDS = [
  { cmd: 'Tell me a joke', icon: 'sentiment-very-satisfied' },
  { cmd: 'What is the weather?', icon: 'wb-sunny' },
  { cmd: 'Set a timer for 5 minutes', icon: 'timer' },
  { cmd: 'Summarize my notes', icon: 'summarize' },
  { cmd: 'What did I add to memory?', icon: 'psychology' },
  { cmd: 'Help me brainstorm', icon: 'lightbulb' },
];

const VOICE_HISTORY = [
  { id: '1', query: 'Explain quantum entanglement', response: 'Quantum entanglement is a phenomenon...', time: '10:24 AM' },
  { id: '2', query: 'Set a reminder for the meeting', response: 'I have noted that for you...', time: '09:15 AM' },
  { id: '3', query: 'What is machine learning?', response: 'Machine learning is a subset of AI...', time: 'Yesterday' },
];

export default function VoiceScreen() {
  const { colors } = useTheme();
  const { voiceMode, setVoiceMode } = useAppStore();
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveAnims = Array.from({ length: 5 }, () => useRef(new Animated.Value(0.3)).current);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  useEffect(() => {
    if (voiceMode === 'listening') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      ).start();

      waveAnims.forEach((anim, i) => {
        Animated.loop(
          Animated.sequence([
            Animated.delay(i * 100),
            Animated.timing(anim, { toValue: 1, duration: 400 + i * 80, useNativeDriver: true }),
            Animated.timing(anim, { toValue: 0.3, duration: 400 + i * 80, useNativeDriver: true }),
          ])
        ).start();
      });
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
      waveAnims.forEach(a => { a.stopAnimation(); a.setValue(0.3); });
    }
  }, [voiceMode]);

  const handleVoiceToggle = async () => {
    if (voiceMode === 'idle') {
      setVoiceMode('listening');
      setTranscript('');
      setResponse('');
      // TODO: Start real voice recording
      setTimeout(() => {
        setTranscript('What can you help me with today?');
        setVoiceMode('processing');
        setTimeout(() => {
          setResponse('I can help you with almost anything! You can ask me questions, set reminders, analyze your memories, generate images, or just have a conversation. What would you like to do?');
          setVoiceMode('speaking');
          setTimeout(() => setVoiceMode('idle'), 3000);
        }, 1200);
      }, 2500);
    } else if (voiceMode !== 'idle') {
      setVoiceMode('idle');
      setTranscript('');
      setResponse('');
    }
  };

  const getMicColor = () => {
    switch (voiceMode) {
      case 'listening': return ['#FF6B9D', '#FF4081'];
      case 'processing': return ['#FFD700', '#FF9800'];
      case 'speaking': return ['#00D4FF', '#0099CC'];
      default: return ['#6C63FF', '#4A42CC'];
    }
  };

  const getStatusText = () => {
    switch (voiceMode) {
      case 'listening': return 'Listening...';
      case 'processing': return 'Processing...';
      case 'speaking': return 'SONA is speaking...';
      default: return 'Tap to speak';
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <Animated.View style={[styles.flex, { opacity: fadeAnim }]}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.title, { color: colors.text }]}>Voice AI</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Speak with SONA naturally</Text>
            </View>
            <Badge label={voiceMode === 'idle' ? 'Ready' : voiceMode} variant={voiceMode === 'listening' ? 'error' : 'primary'} />
          </View>

          {/* Voice Circle */}
          <View style={styles.voiceSection}>
            {/* Outer Rings */}
            {voiceMode === 'listening' ? (
              <>
                <Animated.View style={[styles.ring, styles.ring3, { borderColor: `${colors.primary}15`, transform: [{ scale: pulseAnim }] }]} />
                <Animated.View style={[styles.ring, styles.ring2, { borderColor: `${colors.primary}25`, transform: [{ scale: pulseAnim }] }]} />
                <Animated.View style={[styles.ring, styles.ring1, { borderColor: `${colors.primary}40`, transform: [{ scale: pulseAnim }] }]} />
              </>
            ) : null}

            <Animated.View style={{ transform: [{ scale: voiceMode === 'listening' ? pulseAnim : new Animated.Value(1) }] }}>
              <Pressable onPress={handleVoiceToggle} style={styles.micBtnWrapper}>
                <LinearGradient colors={getMicColor()} style={styles.micBtn}>
                  <MaterialIcons
                    name={voiceMode === 'idle' ? 'mic' : voiceMode === 'listening' ? 'mic' : voiceMode === 'processing' ? 'hourglass-empty' : 'volume-up'}
                    size={48}
                    color="#fff"
                  />
                </LinearGradient>
              </Pressable>
            </Animated.View>

            <Text style={[styles.statusText, { color: voiceMode === 'idle' ? colors.textSecondary : colors.primary }]}>
              {getStatusText()}
            </Text>

            {/* Waveform */}
            {voiceMode === 'listening' ? (
              <View style={styles.waveform}>
                {waveAnims.map((anim, i) => (
                  <Animated.View
                    key={i}
                    style={[
                      styles.wave,
                      { backgroundColor: colors.primary, transform: [{ scaleY: anim }], height: 40 + i * 10 },
                    ]}
                  />
                ))}
              </View>
            ) : null}
          </View>

          {/* Transcript / Response */}
          {transcript ? (
            <Card style={styles.transcriptCard}>
              <View style={styles.transcriptHeader}>
                <MaterialIcons name="person" size={16} color={colors.textMuted} />
                <Text style={[styles.transcriptLabel, { color: colors.textMuted }]}>You said</Text>
              </View>
              <Text style={[styles.transcriptText, { color: colors.text }]}>{transcript}</Text>
            </Card>
          ) : null}

          {response ? (
            <Card style={[styles.transcriptCard, { marginTop: Spacing.sm }]} variant="glass">
              <View style={styles.transcriptHeader}>
                <MaterialIcons name="auto-awesome" size={16} color={colors.primary} />
                <Text style={[styles.transcriptLabel, { color: colors.primary }]}>SONA</Text>
              </View>
              <Text style={[styles.transcriptText, { color: colors.text }]}>{response}</Text>
            </Card>
          ) : null}

          {/* Quick Commands */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Try saying...</Text>
            <View style={styles.commandsGrid}>
              {VOICE_COMMANDS.map(item => (
                <Pressable
                  key={item.cmd}
                  onPress={() => setTranscript(item.cmd)}
                  style={({ pressed }) => [
                    styles.commandChip,
                    { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.8 : 1 },
                  ]}
                >
                  <MaterialIcons name={item.icon as any} size={16} color={colors.primary} />
                  <Text style={[styles.commandText, { color: colors.textSecondary }]}>{item.cmd}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* History */}
          <View style={[styles.section, { paddingBottom: 32 }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Voice History</Text>
            {VOICE_HISTORY.map(item => (
              <Card key={item.id} style={styles.historyCard}>
                <View style={styles.historyHeader}>
                  <View style={[styles.historyIcon, { backgroundColor: `${colors.primary}22` }]}>
                    <MaterialIcons name="person" size={14} color={colors.primary} />
                  </View>
                  <Text style={[styles.historyQuery, { color: colors.text }]}>{item.query}</Text>
                  <Text style={[styles.historyTime, { color: colors.textMuted }]}>{item.time}</Text>
                </View>
                <Text style={[styles.historyResponse, { color: colors.textSecondary }]} numberOfLines={2}>
                  {item.response}
                </Text>
              </Card>
            ))}
          </View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.md, paddingTop: Spacing.md, paddingBottom: Spacing.lg },
  title: { fontSize: FontSize.xxl, fontWeight: FontWeight.extrabold },
  subtitle: { fontSize: FontSize.sm, marginTop: 2 },
  voiceSection: { alignItems: 'center', paddingVertical: Spacing.xl, position: 'relative' },
  ring: { position: 'absolute', borderRadius: 9999, borderWidth: 2 },
  ring1: { width: 180, height: 180 },
  ring2: { width: 220, height: 220 },
  ring3: { width: 260, height: 260 },
  micBtnWrapper: { zIndex: 10 },
  micBtn: { width: 140, height: 140, borderRadius: 70, alignItems: 'center', justifyContent: 'center' },
  statusText: { fontSize: FontSize.base, fontWeight: FontWeight.medium, marginTop: Spacing.lg },
  waveform: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: Spacing.md, height: 80 },
  wave: { width: 6, borderRadius: 3 },
  transcriptCard: { marginHorizontal: Spacing.md },
  transcriptHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: Spacing.sm },
  transcriptLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  transcriptText: { fontSize: FontSize.base, lineHeight: 24 },
  section: { paddingHorizontal: Spacing.md, marginTop: Spacing.lg },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, marginBottom: Spacing.md },
  commandsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  commandChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full, borderWidth: 1 },
  commandText: { fontSize: FontSize.sm },
  historyCard: { marginBottom: Spacing.sm },
  historyHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: 6 },
  historyIcon: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  historyQuery: { flex: 1, fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  historyTime: { fontSize: FontSize.xs },
  historyResponse: { fontSize: FontSize.sm, lineHeight: 18, marginLeft: 36 },
});
