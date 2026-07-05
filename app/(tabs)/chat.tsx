import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, Pressable, KeyboardAvoidingView,
  Platform, Animated, TextInput, RefreshControl,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/hooks/useTheme';
import { useChat } from '@/hooks/useChat';
import { ChatBubble } from '@/components/feature/ChatBubble';
import { Badge } from '@/components/ui/Badge';
import { BorderRadius, FontSize, FontWeight, Shadow, Spacing } from '@/constants/theme';

const SUGGESTED_PROMPTS = [
  { text: 'Help me plan my day', icon: 'wb-sunny' },
  { text: 'Explain quantum computing', icon: 'science' },
  { text: 'Write a Python function', icon: 'code' },
  { text: 'Give me creative ideas', icon: 'lightbulb' },
];

export default function ChatScreen() {
  const { colors, isDark } = useTheme();
  const { conversation, isTyping, sendMessage, clearConversation } = useChat();
  const [input, setInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const typingDot1 = useRef(new Animated.Value(0.3)).current;
  const typingDot2 = useRef(new Animated.Value(0.3)).current;
  const typingDot3 = useRef(new Animated.Value(0.3)).current;
  const inputBarAnim = useRef(new Animated.Value(0)).current;
  const headerFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerFade, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  useEffect(() => {
    Animated.timing(inputBarAnim, {
      toValue: isFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused]);

  useEffect(() => {
    if (!isTyping) return;
    const animate = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: 1, duration: 350, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0.3, duration: 350, useNativeDriver: true }),
        ])
      );
    Animated.parallel([
      animate(typingDot1, 0),
      animate(typingDot2, 160),
      animate(typingDot3, 320),
    ]).start();
    return () => {
      typingDot1.stopAnimation();
      typingDot2.stopAnimation();
      typingDot3.stopAnimation();
    };
  }, [isTyping]);

  useEffect(() => {
    if (conversation?.messages?.length) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 120);
    }
  }, [conversation?.messages?.length, isTyping]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    setInput('');
    await sendMessage(trimmed);
  };

  const messages = conversation?.messages ?? [];

  const inputBorderColor = inputBarAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.border, colors.primary],
  });

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      {/* ── Header ── */}
      <Animated.View style={[styles.header, { borderBottomColor: colors.border, opacity: headerFade }]}>
        <View style={styles.headerLeft}>
          <LinearGradient colors={['#7C6FFF', '#00D4FF']} style={styles.aiAvatar}>
            <MaterialIcons name="auto-awesome" size={18} color="#fff" />
          </LinearGradient>
          <View>
            <Text style={[styles.aiName, { color: colors.text }]}>SONA AI</Text>
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, { backgroundColor: colors.success }]} />
              <Text style={[styles.statusText, { color: colors.textMuted }]}>Online · Gemini 2.5 Flash</Text>
            </View>
          </View>
        </View>
        <View style={styles.headerActions}>
          <Pressable
            onPress={clearConversation}
            hitSlop={8}
            style={({ pressed }) => [styles.iconBtn, { backgroundColor: colors.card, opacity: pressed ? 0.7 : 1 }]}
          >
            <MaterialIcons name="refresh" size={20} color={colors.textSecondary} />
          </Pressable>
          <Pressable
            hitSlop={8}
            style={({ pressed }) => [styles.iconBtn, { backgroundColor: colors.card, opacity: pressed ? 0.7 : 1 }]}
          >
            <MaterialIcons name="more-vert" size={20} color={colors.textSecondary} />
          </Pressable>
        </View>
      </Animated.View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {messages.length === 0 ? (
          /* ── Empty State ── */
          <View style={styles.emptyContainer}>
            <LinearGradient
              colors={['#7C6FFF33', '#00D4FF11']}
              style={styles.emptyIconBg}
            >
              <MaterialIcons name="auto-awesome" size={52} color={colors.primary} />
            </LinearGradient>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>How can I help?</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Your intelligent AI companion is ready to assist with anything
            </Text>

            <View style={styles.suggestionsGrid}>
              {SUGGESTED_PROMPTS.map((p) => (
                <Pressable
                  key={p.text}
                  onPress={() => setInput(p.text)}
                  style={({ pressed }) => [
                    styles.suggestionChip,
                    { backgroundColor: colors.card, borderColor: colors.cardBorder, opacity: pressed ? 0.85 : 1 },
                  ]}
                >
                  <MaterialIcons name={p.icon as any} size={15} color={colors.primary} />
                  <Text style={[styles.suggestionText, { color: colors.textSecondary }]}>{p.text}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={m => m.id}
            renderItem={({ item, index }) => (
              <ChatBubble message={item} isNew={index === messages.length - 1} />
            )}
            contentContainerStyle={styles.messageList}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={
              isTyping ? (
                <View style={styles.typingContainer}>
                  <LinearGradient colors={['#7C6FFF', '#00D4FF']} style={styles.aiAvatarSmall}>
                    <MaterialIcons name="auto-awesome" size={13} color="#fff" />
                  </LinearGradient>
                  <View style={[styles.typingBubble, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                    {[typingDot1, typingDot2, typingDot3].map((dot, i) => (
                      <Animated.View
                        key={i}
                        style={[styles.typingDot, { backgroundColor: colors.primary, opacity: dot }]}
                      />
                    ))}
                  </View>
                </View>
              ) : null
            }
          />
        )}

        {/* ── Input Bar ── */}
        <View style={[styles.inputRow, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
          <Pressable
            hitSlop={8}
            style={({ pressed }) => [styles.inputIconBtn, { backgroundColor: colors.card, opacity: pressed ? 0.7 : 1 }]}
          >
            <MaterialIcons name="add" size={20} color={colors.textSecondary} />
          </Pressable>

          <Animated.View style={[styles.textInputWrapper, { backgroundColor: colors.card, borderColor: inputBorderColor }]}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Message SONA AI..."
              placeholderTextColor={colors.textMuted}
              multiline
              style={[styles.textInput, { color: colors.text }]}
              onSubmitEditing={handleSend}
              returnKeyType="send"
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            />
          </Animated.View>

          <Pressable
            onPress={handleSend}
            disabled={!input.trim()}
            style={({ pressed }) => [styles.sendBtn, { opacity: pressed ? 0.8 : 1 }]}
          >
            <LinearGradient
              colors={input.trim() ? ['#7C6FFF', '#4A42CC'] : [colors.card, colors.card]}
              style={styles.sendBtnInner}
            >
              <MaterialIcons
                name="send"
                size={18}
                color={input.trim() ? '#fff' : colors.textMuted}
              />
            </LinearGradient>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  aiAvatar: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  aiName: { fontSize: FontSize.base, fontWeight: FontWeight.bold },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 1 },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusText: { fontSize: FontSize.xxs + 1 },
  headerActions: { flexDirection: 'row', gap: Spacing.sm },
  iconBtn: { width: 36, height: 36, borderRadius: BorderRadius.sm, alignItems: 'center', justifyContent: 'center' },

  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  emptyIconBg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: { fontSize: FontSize.xxl, fontWeight: FontWeight.extrabold, textAlign: 'center' },
  emptySubtitle: { fontSize: FontSize.base, textAlign: 'center', lineHeight: 24, maxWidth: 280 },
  suggestionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    justifyContent: 'center',
    marginTop: Spacing.sm,
    width: '100%',
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  suggestionText: { fontSize: FontSize.sm, fontWeight: '500' },

  messageList: { paddingVertical: Spacing.md, paddingBottom: Spacing.lg },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
    marginTop: 4,
  },
  aiAvatarSmall: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 4,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderBottomLeftRadius: 4,
  },
  typingDot: { width: 8, height: 8, borderRadius: 4 },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  inputIconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInputWrapper: {
    flex: 1,
    borderRadius: BorderRadius.xxl,
    borderWidth: 1.5,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    maxHeight: 130,
  },
  textInput: { fontSize: FontSize.base, includeFontPadding: false, lineHeight: 22 },
  sendBtn: { width: 44, height: 44 },
  sendBtnInner: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
});
