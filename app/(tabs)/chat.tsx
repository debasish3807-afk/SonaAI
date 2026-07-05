/**
 * SONA AI — Chat Screen (Phase 2)
 * Production-ready AI chat with:
 *  - Streaming Gemini responses
 *  - Real-time Firestore sync
 *  - Conversation drawer (search, pin, rename, delete)
 *  - Message actions (copy, edit, regenerate, delete)
 *  - AI typing animation
 *  - Empty state with suggested prompts
 *  - Theme-aware Material 3 design
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/hooks/useTheme';
import { useChat } from '@/hooks/useChat';
import { ChatBubble } from '@/components/feature/ChatBubble';
import { ChatInput } from '@/components/feature/ChatInput';
import { ConversationDrawer } from '@/components/feature/ConversationDrawer';
import { BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/theme';

// ─── Suggested Prompts ────────────────────────────────────────────────────────

const SUGGESTED_PROMPTS = [
  { text: 'Help me plan my day', icon: 'wb-sunny' },
  { text: 'Explain quantum computing', icon: 'science' },
  { text: 'Write a Python function', icon: 'code' },
  { text: 'Give me creative ideas', icon: 'lightbulb' },
  { text: 'Summarize a topic', icon: 'article' },
  { text: 'Debug my code', icon: 'bug-report' },
];

// ─── Typing Indicator ─────────────────────────────────────────────────────────

const TypingIndicator: React.FC<{ colors: any }> = ({ colors }) => {
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animate = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: 1, duration: 350, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0.3, duration: 350, useNativeDriver: true }),
        ])
      );
    const anim = Animated.parallel([
      animate(dot1, 0),
      animate(dot2, 150),
      animate(dot3, 300),
    ]);
    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <View style={styles.typingContainer}>
      <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.typingAvatar}>
        <MaterialIcons name="auto-awesome" size={12} color="#fff" />
      </LinearGradient>
      <View style={[styles.typingBubble, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        {[dot1, dot2, dot3].map((dot, i) => (
          <Animated.View
            key={i}
            style={[styles.typingDot, { backgroundColor: colors.primary, opacity: dot }]}
          />
        ))}
      </View>
    </View>
  );
};

// ─── Chat Screen ──────────────────────────────────────────────────────────────

export default function ChatScreen() {
  const { colors, isDark } = useTheme();
  const {
    conversation,
    conversations,
    pinnedConversations,
    recentConversations,
    isTyping,
    showDrawer,
    searchQuery,
    activeConversationId,
    sendMessage,
    copyMessage,
    editMessage,
    regenerateResponse,
    deleteMessage,
    clearConversation,
    createConversation,
    setActiveConversation,
    renameConversation,
    pinConversation,
    unpinConversation,
    deleteConversation,
    setSearchQuery,
    toggleDrawer,
    setShowDrawer,
  } = useChat();

  const [editMode, setEditMode] = useState<{ messageId: string; content: string } | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const headerFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerFade, { toValue: 1, duration: 350, useNativeDriver: true }).start();
  }, []);

  // Auto-scroll to bottom when new messages arrive
  const messages = conversation?.messages ?? [];
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages.length, isTyping]);

  const handleSend = useCallback((content: string) => {
    if (editMode) {
      editMessage(editMode.messageId, content);
      setEditMode(null);
    } else {
      sendMessage(content);
    }
  }, [editMode, editMessage, sendMessage]);

  const handleEdit = useCallback((id: string, content: string) => {
    setEditMode({ messageId: id, content });
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditMode(null);
  }, []);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      {/* ── Header ── */}
      <Animated.View style={[styles.header, { borderBottomColor: isDark ? colors.cardBorder : colors.border, opacity: headerFade }]}>
        <View style={styles.headerLeft}>
          <Pressable
            onPress={toggleDrawer}
            hitSlop={8}
            style={({ pressed }) => [styles.headerIconBtn, { backgroundColor: isDark ? colors.card : 'rgba(0,0,0,0.04)', opacity: pressed ? 0.7 : 1 }]}
          >
            <MaterialIcons name="menu" size={20} color={colors.textSecondary} />
          </Pressable>

          <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.aiAvatar}>
            <MaterialIcons name="auto-awesome" size={16} color="#fff" />
          </LinearGradient>

          <View>
            <Text style={[styles.aiName, { color: colors.text }]}>SONA AI</Text>
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, { backgroundColor: colors.success }]} />
              <Text style={[styles.statusText, { color: colors.textMuted }]}>
                {isTyping ? 'Typing...' : 'Online'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.headerActions}>
          <Pressable
            onPress={clearConversation}
            hitSlop={8}
            style={({ pressed }) => [styles.headerIconBtn, { backgroundColor: isDark ? colors.card : 'rgba(0,0,0,0.04)', opacity: pressed ? 0.7 : 1 }]}
          >
            <MaterialIcons name="refresh" size={20} color={colors.textSecondary} />
          </Pressable>
          <Pressable
            onPress={() => createConversation()}
            hitSlop={8}
            style={({ pressed }) => [styles.headerIconBtn, { backgroundColor: isDark ? colors.card : 'rgba(0,0,0,0.04)', opacity: pressed ? 0.7 : 1 }]}
          >
            <MaterialIcons name="add" size={20} color={colors.textSecondary} />
          </Pressable>
        </View>
      </Animated.View>

      {/* ── Main Content ── */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {messages.length === 0 ? (
          /* ── Empty State ── */
          <View style={styles.emptyContainer}>
            <LinearGradient
              colors={[`${colors.primary}30`, `${colors.secondary}10`]}
              style={styles.emptyIconBg}
            >
              <MaterialIcons name="auto-awesome" size={48} color={colors.primary} />
            </LinearGradient>

            <Text style={[styles.emptyTitle, { color: colors.text }]}>How can I help?</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Your intelligent AI companion is ready to assist
            </Text>

            <View style={styles.suggestionsGrid}>
              {SUGGESTED_PROMPTS.map((p) => (
                <Pressable
                  key={p.text}
                  onPress={() => sendMessage(p.text)}
                  style={({ pressed }) => [
                    styles.suggestionChip,
                    {
                      backgroundColor: isDark ? colors.card : '#fff',
                      borderColor: isDark ? colors.cardBorder : colors.border,
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}
                >
                  <MaterialIcons name={p.icon as any} size={14} color={colors.primary} />
                  <Text style={[styles.suggestionText, { color: colors.textSecondary }]} numberOfLines={1}>
                    {p.text}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : (
          /* ── Message List ── */
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={m => m.id}
            renderItem={({ item, index }) => (
              <ChatBubble
                message={item}
                isNew={index === messages.length - 1}
                onCopy={copyMessage}
                onEdit={item.role === 'user' ? handleEdit : undefined}
                onRegenerate={item.role === 'assistant' ? regenerateResponse : undefined}
                onDelete={deleteMessage}
              />
            )}
            contentContainerStyle={styles.messageList}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={isTyping && !messages.some(m => m.isStreaming) ? <TypingIndicator colors={colors} /> : null}
          />
        )}

        {/* ── Input Bar ── */}
        <ChatInput
          onSend={handleSend}
          isTyping={isTyping}
          editMode={editMode}
          onCancelEdit={handleCancelEdit}
        />
      </KeyboardAvoidingView>

      {/* ── Conversation Drawer ── */}
      <ConversationDrawer
        visible={showDrawer}
        onClose={() => setShowDrawer(false)}
        conversations={conversations}
        pinnedConversations={pinnedConversations}
        recentConversations={recentConversations}
        activeConversationId={activeConversationId}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSelectConversation={setActiveConversation}
        onNewConversation={() => createConversation()}
        onRenameConversation={renameConversation}
        onPinConversation={pinConversation}
        onUnpinConversation={unpinConversation}
        onDeleteConversation={deleteConversation}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  headerActions: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  headerIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiAvatar: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    letterSpacing: -0.2,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 10,
    fontWeight: FontWeight.medium,
  },

  // Empty state
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
  },
  emptyIconBg: {
    width: 96,
    height: 96,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    letterSpacing: -0.5,
  },
  emptySubtitle: {
    fontSize: FontSize.md,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  suggestionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.sm,
    maxWidth: 360,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  suggestionText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },

  // Message list
  messageList: {
    paddingVertical: Spacing.sm,
    paddingBottom: Spacing.md,
  },

  // Typing indicator
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    marginVertical: Spacing.xs,
  },
  typingAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typingBubble: {
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 4,
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  typingDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
});
