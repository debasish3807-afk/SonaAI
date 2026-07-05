import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, Pressable, StyleSheet, Animated, ScrollView, Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/hooks/useTheme';
import { useAppStore } from '@/stores/useAppStore';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { BorderRadius, FontSize, FontWeight, Shadow, Spacing } from '@/constants/theme';

const { width } = Dimensions.get('window');

const VOICE_COMMANDS = [
  { cmd: 'Tell me a joke', icon: 'sentiment-very-satisfied', color: '#FF6B9D' },
  { cmd: 'What is the weather?', icon: 'wb-sunny', color: '#F5C842' },
  { cmd: 'Set a timer for 5 minutes', icon: 'timer', color: '#00D4FF' },
  { cmd: 'Summarize my notes', icon: 'summarize', color: '#7C6FFF' },
  { cmd: 'What did I add to memory?', icon: 'psychology', color: '#00E676' },
  { cmd: 'Help me brainstorm', icon: 'lightbulb', color: '#FF9800' },
];

const VOICE_HISTORY = [
  { id: '1', query: 'Explain quantum entanglement', response: 'Quantum entanglement is a phenomenon where particles become interconnected...', time: '10:24 AM' },
  { id: '2', query: 'Set a reminder for the meeting', response: 'I have noted that for you. Your meeting reminder is set.', time: '09:15 AM' },
  { id: '3', query: 'What is machine learning?', response: 'Machine learning is a subset of AI that enables systems to learn automatically...', time: 'Yesterday' },
];

export default function VoiceScreen() {
  const { colors } = useTheme();
  const { voiceMode, setVoiceMode } = useAppStore();
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const outerRingAnim = useRef(new Animated.Value(1)).current;
  const waveAnims = [0, 1, 2, 3, 4].map(() => useRef(new Animated.Value(0.2)).current);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const micScaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  useEffect(() => {
    if (voiceMode === 'listening') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.12, duration: 700, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
        ])
      ).start();
      Animated.loop(
        Animated.sequence([
          Animated.timing(outerRingAnim, { toValue: 1.25, duration: 1000, useNativeDriver: true }),
          Animated.timing(outerRingAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        ])
      ).start();
      waveAnims.forEach((anim, i) => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim, { toValue: 1, duration: 350 + i * 60, useNativeDriver: true }),
            Animated.timing(anim, { toValue: 0.2, duration: 350 + i * 60, useNativeDriver: true }),
          ])
        ).start();
      });
    } else if (voiceMode === 'processing') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(micScaleAnim, { toValue: 1.06, duration: 500, useNativeDriver: true }),
          Animated.timing(micScaleAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation(); pulseAnim.setValue(1);
      outerRingAnim.stopAnimation(); outerRingAnim.setValue(1);
      micScaleAnim.stopAnimation(); micScaleAnim.setValue(1);
      waveAnims.forEach(a => { a.stopAnimation(); a.setValue(0.2); });
    }
  }, [voiceMode]);

  const handleVoiceToggle = async () => {
    if (voiceMode === 'idle') {
      setVoiceMode('listening');
      setTranscript('');
      setResponse('');
      // Voice recording integration using expo-av
      // In production, connect to a dedicated speech-to-text service
      setTimeout(() => {
        setTranscript('What can you help me with today?');
        setVoiceMode('processing');
        setTimeout(() => {
          setResponse('I can help you with almost anything! Ask questions, set reminders, analyze memories, generate images, or just have a conversation. What would you like to explore?');
          setVoiceMode('speaking');
          setTimeout(() => setVoiceMode('idle'), 3500);
        }, 1400);
      }, 2800);
    } else {
      setVoiceMode('idle');
      setTranscript('');
      setResponse('');
    }
  };

  const getMicGradient = (): [string, string] => {
    switch (voiceMode) {
      case 'listening': return ['#FF6B9D', '#CC3366'];
      case 'processing': return ['#F5C842', '#FF9800'];
      case 'speaking': return ['#00D4FF', '#0099CC'];
      default: return ['#7C6FFF', '#4A42CC'];
    }
  };

  const getStatusLabel = () => {
    switch (voiceMode) {
      case 'listening': return 'Listening...';
      case 'processing': return 'Processing...';
      case 'speaking': return 'Speaking...';
      default: return 'Tap to speak';
    }
  };

  const getStatusVariant = (): any => {
    switch (voiceMode) {
      case 'listening': return 'error';
      case 'processing': return 'gold';
      case 'speaking': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <Animated.View style={[styles.flex, { opacity: fadeAnim }]}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* ── Header ── */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.title, { color: colors.text }]}>Voice AI</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Speak naturally with SONA</Text>
            </View>
            <Badge label={voiceMode === 'idle' ? 'Ready' : getStatusLabel()} variant={getStatusVariant()} pulse={voiceMode !== 'idle'} />
          </View>

          {/* ── Voice Circle ── */}
          <View style={styles.voiceSection}>
            {/* Outer pulse rings */}
            {voiceMode === 'listening' ? (
              <>
                <Animated.View style={[styles.ring, styles.ring3, { borderColor: `${colors.error}18`, transform: [{ scale: outerRingAnim }] }]} />
                <Animated.View style={[styles.ring, styles.ring2, { borderColor: `${colors.error}30`, transform: [{ scale: pulseAnim }] }]} />
                <Animated.View style={[styles.ring, styles.ring1, { borderColor: `${colors.error}50` }]} />
              </>
            ) : voiceMode === 'speaking' ? (
              <>
                <Animated.View style={[styles.ring, styles.ring3, { borderColor: `${colors.secondary}15`, transform: [{ scale: outerRingAnim }] }]} />
                <Animated.View style={[styles.ring, styles.ring2, { borderColor: `${colors.secondary}28`, transform: [{ scale: pulseAnim }] }]} />
                <Animated.View style={[styles.ring, styles.ring1, { borderColor: `${colors.secondary}45` }]} />
              </>
            ) : null}

            <Animated.View style={{ transform: [{ scale: micScaleAnim }] }}>
              <Pressable
                onPress={handleVoiceToggle}
                style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1, ...Shadow.glow }]}
              >
                <LinearGradient colors={getMicGradient()} style={styles.micBtn}>
                  <MaterialIcons
                    name={
                      voiceMode === 'idle' ? 'mic' :
                      voiceMode === 'listening' ? 'mic' :
                      voiceMode === 'processing' ? 'hourglass-top' : 'volume-up'
                    }
                    size={52}
                    color="#fff"
                  />
                </LinearGradient>
              </Pressable>
            </Animated.View>

            <Text style={[styles.statusText, { color: voiceMode === 'idle' ? colors.textSecondary : colors.primary }]}>
              {getStatusLabel()}
            </Text>

            {/* Waveform bars */}
            {voiceMode === 'listening' ? (
              <View style={styles.waveform}>
                {waveAnims.map((anim, i) => (
                  <Animated.View
                    key={i}
                    style={[
                      styles.wave,
                      {
                        backgroundColor: i === 2 ? colors.accent : colors.primary,
                        height: 24 + i * 12 - Math.abs(i - 2) * 8,
                        opacity: anim,
                        transform: [{ scaleY: anim }],
                      },
                    ]}
                  />
                ))}
              </View>
            ) : null}
          </View>

          {/* ── Transcript ── */}
          {transcript ? (
            <Card style={[styles.transcriptCard, { marginHorizontal: Spacing.md }] as any}>
              <View style={styles.transcriptHeader}>
                <View style={[styles.transcriptAvatar, { backgroundColor: colors.surfaceElevated }]}>
                  <MaterialIcons name="person" size={14} color={colors.textMuted} />
                </View>
                <Text style={[styles.transcriptLabel, { color: colors.textMuted }]}>You said</Text>
              </View>
              <Text style={[styles.transcriptText, { color: colors.text }]}>{transcript}</Text>
            </Card>
          ) : null}

          {response ? (
            <Card
              style={[styles.transcriptCard, { marginHorizontal: Spacing.md, marginTop: Spacing.sm }] as any}
              variant="glass"
            >
              <View style={styles.transcriptHeader}>
                <LinearGradient colors={['#7C6FFF', '#00D4FF']} style={styles.transcriptAvatar}>
                  <MaterialIcons name="auto-awesome" size={14} color="#fff" />
                </LinearGradient>
                <Text style={[styles.transcriptLabel, { color: colors.primary }]}>SONA AI</Text>
              </View>
              <Text style={[styles.transcriptText, { color: colors.text }]}>{response}</Text>
            </Card>
          ) : null}

          {/* ── Quick Commands ── */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Try saying...</Text>
            <View style={styles.commandsGrid}>
              {VOICE_COMMANDS.map(item => (
                <Pressable
                  key={item.cmd}
                  onPress={() => { setTranscript(item.cmd); }}
                  style={({ pressed }) => [
                    styles.commandChip,
                    { backgroundColor: colors.card, borderColor: colors.cardBorder, opacity: pressed ? 0.8 : 1 },
                  ]}
                >
                  <View style={[styles.cmdIcon, { backgroundColor: `${item.color}22` }]}>
                    <MaterialIcons name={item.icon as any} size={14} color={item.color} />
                  </View>
                  <Text style={[styles.commandText, { color: colors.textSecondary }]}>{item.cmd}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* ── History ── */}
          <View style={[styles.section, { paddingBottom: 36 }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Voice History</Text>
            {VOICE_HISTORY.map(item => (
              <Card key={item.id} style={styles.historyCard}>
                <View style={styles.historyHeader}>
                  <View style={[styles.historyQ, { backgroundColor: `${colors.primary}22` }]}>
                    <MaterialIcons name="record-voice-over" size={14} color={colors.primary} />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  title: { fontSize: FontSize.xxl, fontWeight: FontWeight.extrabold },
  subtitle: { fontSize: FontSize.sm, marginTop: 2 },
  voiceSection: { alignItems: 'center', paddingVertical: Spacing.xl + 8, position: 'relative' },
  ring: { position: 'absolute', borderRadius: 9999, borderWidth: 1.5 },
  ring1: { width: 190, height: 190 },
  ring2: { width: 235, height: 235 },
  ring3: { width: 280, height: 280 },
  micBtn: { width: 148, height: 148, borderRadius: 74, alignItems: 'center', justifyContent: 'center' },
  statusText: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, marginTop: Spacing.lg + 4 },
  waveform: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: Spacing.md, height: 64 },
  wave: { width: 7, borderRadius: 4 },

  transcriptCard: {},
  transcriptHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  transcriptAvatar: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  transcriptLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  transcriptText: { fontSize: FontSize.base, lineHeight: 24 },

  section: { paddingHorizontal: Spacing.md, marginTop: Spacing.lg },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, marginBottom: Spacing.md },
  commandsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  commandChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: Spacing.sm + 4,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  cmdIcon: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  commandText: { fontSize: FontSize.sm },

  historyCard: { marginBottom: Spacing.sm },
  historyHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: 8 },
  historyQ: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  historyQuery: { flex: 1, fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  historyTime: { fontSize: FontSize.xxs },
  historyResponse: { fontSize: FontSize.sm, lineHeight: 18, paddingLeft: 42 },
});
