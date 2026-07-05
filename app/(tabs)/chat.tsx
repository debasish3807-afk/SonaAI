import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, Pressable, KeyboardAvoidingView,
  Platform, Animated, TextInput,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/hooks/useTheme';
import { useChat } from '@/hooks/useChat';
import { ChatBubble } from '@/components/feature/ChatBubble';
import { BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/theme';

const SUGGESTED_PROMPTS = [
  'Help me plan my day',
  'Explain quantum computing',
  'Write a Python function',
  'Give me creative ideas',
];

export default function ChatScreen() {
  const { colors } = useTheme();
  const { conversation, isTyping, sendMessage, clearConversation } = useChat();
  const [input, setInput] = useState('');
  const flatListRef = useRef<FlatList>(null);
  const typingDot1 = useRef(new Animated.Value(0)).current;
  const typingDot2 = useRef(new Animated.Value(0)).current;
  const typingDot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isTyping) {
      const animate = (dot: Animated.Value, delay: number) =>
        Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(dot, { toValue: -6, duration: 300, useNativeDriver: true }),
            Animated.timing(dot, { toValue: 0, duration: 300, useNativeDriver: true }),
          ])
        );
      Animated.parallel([
        animate(typingDot1, 0),
        animate(typingDot2, 150),
        animate(typingDot3, 300),
      ]).start();
    }
  }, [isTyping]);

  useEffect(() => {
    if (conversation?.messages?.length) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [conversation?.messages?.length, isTyping]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    setInput('');
    await sendMessage(trimmed);
  };

  const messages = conversation?.messages ?? [];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={styles.headerLeft}>
          <LinearGradient colors={['#6C63FF', '#00D4FF']} style={styles.aiAvatar}>
            <MaterialIcons name="auto-awesome" size={18} color="#fff" />
          </LinearGradient>
          <View>
            <Text style={[styles.aiName, { color: colors.text }]}>SONA AI</Text>
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, { backgroundColor: '#00E676' }]} />
              <Text style={[styles.statusText, { color: colors.textMuted }]}>Online · Ready to help</Text>
            </View>
          </View>
        </View>
        <View style={styles.headerActions}>
          <Pressable onPress={clearConversation} hitSlop={8} style={styles.iconBtn}>
            <MaterialIcons name="refresh" size={22} color={colors.textSecondary} />
          </Pressable>
          <Pressable hitSlop={8} style={styles.iconBtn}>
            <MaterialIcons name="more-vert" size={22} color={colors.textSecondary} />
          </Pressable>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {messages.length === 0 ? (
          <View style={styles.emptyContainer}>
            <LinearGradient colors={['#6C63FF22', '#00D4FF11']} style={styles.emptyIconBg}>
              <MaterialIcons name="auto-awesome" size={48} color="#6C63FF" />
            </LinearGradient>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>How can I help you?</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Ask me anything — I am your intelligent AI assistant
            </Text>
            <View style={styles.suggestionsGrid}>
              {SUGGESTED_PROMPTS.map(p => (
                <Pressable
                  key={p}
                  onPress={() => { setInput(p); }}
                  style={({ pressed }) => [
                    styles.suggestionChip,
                    { backgroundColor: colors.card, borderColor: colors.cardBorder, opacity: pressed ? 0.8 : 1 },
                  ]}
                >
                  <Text style={[styles.suggestionText, { color: colors.textSecondary }]}>{p}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={m => m.id}
            renderItem={({ item }) => <ChatBubble message={item} />}
            contentContainerStyle={styles.messageList}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={isTyping ? (
              <View style={styles.typingContainer}>
                <View style={[styles.aiAvatarSmall, { backgroundColor: `${colors.primary}22` }]}>
                  <MaterialIcons name="auto-awesome" size={14} color={colors.primary} />
                </View>
                <View style={[styles.typingBubble, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                  {[typingDot1, typingDot2, typingDot3].map((dot, i) => (
                    <Animated.View
                      key={i}
                      style={[styles.typingDot, { backgroundColor: colors.primary, transform: [{ translateY: dot }] }]}
                    />
                  ))}
                </View>
              </View>
            ) : null}
          />
        )}

        {/* Input */}
        <View style={[styles.inputRow, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
          <Pressable hitSlop={8} style={styles.iconBtn}>
            <MaterialIcons name="add" size={22} color={colors.textSecondary} />
          </Pressable>
          <View style={[styles.textInputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Message SONA AI..."
              placeholderTextColor={colors.textMuted}
              multiline
              style={[styles.textInput, { color: colors.text }]}
              onSubmitEditing={handleSend}
              returnKeyType="send"
            />
          </View>
          <Pressable
            onPress={handleSend}
            disabled={!input.trim()}
            style={({ pressed }) => [
              styles.sendBtn,
              { backgroundColor: input.trim() ? colors.primary : colors.card, opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <MaterialIcons name="send" size={20} color={input.trim() ? '#fff' : colors.textMuted} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, borderBottomWidth: StyleSheet.hairlineWidth },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  aiAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  aiName: { fontSize: FontSize.base, fontWeight: FontWeight.bold },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: FontSize.xs },
  headerActions: { flexDirection: 'row', gap: Spacing.xs },
  iconBtn: { padding: Spacing.xs },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl, gap: Spacing.md },
  emptyIconBg: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, textAlign: 'center' },
  emptySubtitle: { fontSize: FontSize.base, textAlign: 'center', lineHeight: 24 },
  suggestionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, justifyContent: 'center', marginTop: Spacing.sm },
  suggestionChip: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full, borderWidth: 1 },
  suggestionText: { fontSize: FontSize.sm },
  messageList: { paddingVertical: Spacing.md },
  typingContainer: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: Spacing.md, gap: Spacing.sm, marginBottom: Spacing.sm },
  aiAvatarSmall: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  typingBubble: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 16, paddingVertical: 14, borderRadius: BorderRadius.xl, borderWidth: 1, borderBottomLeftRadius: 4 },
  typingDot: { width: 7, height: 7, borderRadius: 4 },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, gap: Spacing.sm, borderTopWidth: StyleSheet.hairlineWidth },
  textInputWrapper: { flex: 1, borderRadius: BorderRadius.xl, borderWidth: 1, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, maxHeight: 120 },
  textInput: { fontSize: FontSize.base, includeFontPadding: false, lineHeight: 22 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
});
