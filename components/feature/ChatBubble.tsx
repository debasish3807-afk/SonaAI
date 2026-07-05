/**
 * SONA AI — ChatBubble Component (Phase 2)
 * Premium Material 3 chat bubble with:
 *  - Lightweight markdown renderer (bold, italic, code, headings, lists, code blocks)
 *  - Copy / Edit / Regenerate action bar
 *  - Message status indicators (sending, sent, delivered, error)
 *  - Streaming cursor animation
 *  - Theme-aware dark/light styling
 *  - Entry animations
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, Pressable, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/hooks/useTheme';
import { BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/theme';
import type { Message, MessageStatus } from '@/stores/useChatStore';

// ─── Props ────────────────────────────────────────────────────────────────────

interface ChatBubbleProps {
  message: Message;
  isNew?: boolean;
  onCopy?: (id: string) => void;
  onEdit?: (id: string, content: string) => void;
  onRegenerate?: (id: string) => void;
  onDelete?: (id: string) => void;
}

// ─── Markdown Renderer ────────────────────────────────────────────────────────

interface TextSegment {
  text: string;
  bold?: boolean;
  italic?: boolean;
  code?: boolean;
}

function parseInline(line: string): TextSegment[] {
  const segments: TextSegment[] = [];
  const pattern = /(\*\*(.+?)\*\*|_(.+?)_|`([^`]+)`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(line)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ text: line.slice(lastIndex, match.index) });
    }
    if (match[0].startsWith('**')) {
      segments.push({ text: match[2], bold: true });
    } else if (match[0].startsWith('_')) {
      segments.push({ text: match[3], italic: true });
    } else {
      segments.push({ text: match[4], code: true });
    }
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < line.length) {
    segments.push({ text: line.slice(lastIndex) });
  }
  return segments.length > 0 ? segments : [{ text: line }];
}

interface MarkdownProps {
  content: string;
  textColor: string;
  codeBackground: string;
  codeBorder: string;
  codeTextColor: string;
  headingColor: string;
}

const MarkdownText: React.FC<MarkdownProps> = ({
  content,
  textColor,
  codeBackground,
  codeBorder,
  codeTextColor,
  headingColor,
}) => {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let codeBlock: string[] = [];
  let codeLanguage = '';
  let inCodeBlock = false;

  lines.forEach((line, idx) => {
    // Code block fence
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <View key={`cb-${idx}`} style={[mdStyles.codeBlock, { backgroundColor: codeBackground, borderColor: codeBorder }]}>
            {codeLanguage ? (
              <View style={mdStyles.codeLanguageBadge}>
                <Text style={[mdStyles.codeLanguageText, { color: codeTextColor }]}>{codeLanguage}</Text>
              </View>
            ) : null}
            <Text style={[mdStyles.codeBlockText, { color: textColor }]} selectable>
              {codeBlock.join('\n')}
            </Text>
          </View>
        );
        codeBlock = [];
        codeLanguage = '';
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
        codeLanguage = line.trim().slice(3).trim();
      }
      return;
    }

    if (inCodeBlock) {
      codeBlock.push(line);
      return;
    }

    // Heading
    const headingMatch = line.match(/^(#{1,3})\s+(.+)/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const size = level === 1 ? FontSize.lg : level === 2 ? FontSize.md + 1 : FontSize.md;
      elements.push(
        <Text key={idx} style={[mdStyles.heading, { color: headingColor, fontSize: size }]}>
          {headingMatch[2]}
        </Text>
      );
      return;
    }

    // Numbered list
    const numberedMatch = line.match(/^(\d+)\.\s+(.+)/);
    if (numberedMatch) {
      const segs = parseInline(numberedMatch[2]);
      elements.push(
        <View key={idx} style={mdStyles.listRow}>
          <Text style={[mdStyles.listBullet, { color: textColor }]}>{numberedMatch[1]}.</Text>
          <Text style={[mdStyles.bodyText, { color: textColor }]}>
            {renderSegments(segs, textColor, codeBackground, codeTextColor)}
          </Text>
        </View>
      );
      return;
    }

    // Bullet list
    const listMatch = line.match(/^[-*•]\s+(.+)/);
    if (listMatch) {
      const segs = parseInline(listMatch[1]);
      elements.push(
        <View key={idx} style={mdStyles.listRow}>
          <Text style={[mdStyles.listBullet, { color: textColor }]}>•</Text>
          <Text style={[mdStyles.bodyText, { color: textColor }]}>
            {renderSegments(segs, textColor, codeBackground, codeTextColor)}
          </Text>
        </View>
      );
      return;
    }

    // Empty line
    if (!line.trim()) {
      elements.push(<View key={idx} style={{ height: 6 }} />);
      return;
    }

    // Normal line
    const segs = parseInline(line);
    elements.push(
      <Text key={idx} style={[mdStyles.bodyText, { color: textColor }]}>
        {renderSegments(segs, textColor, codeBackground, codeTextColor)}
      </Text>
    );
  });

  // Unclosed code block
  if (inCodeBlock && codeBlock.length > 0) {
    elements.push(
      <View key="cb-end" style={[mdStyles.codeBlock, { backgroundColor: codeBackground, borderColor: codeBorder }]}>
        <Text style={[mdStyles.codeBlockText, { color: textColor }]} selectable>
          {codeBlock.join('\n')}
        </Text>
      </View>
    );
  }

  return <View style={mdStyles.container}>{elements}</View>;
};

function renderSegments(
  segments: TextSegment[],
  textColor: string,
  codeBackground: string,
  codeTextColor: string,
): React.ReactNode[] {
  return segments.map((s, si) => (
    <Text
      key={si}
      style={[
        s.bold && { fontWeight: FontWeight.bold },
        s.italic && { fontStyle: 'italic' },
        s.code && {
          fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
          fontSize: FontSize.sm - 1,
          backgroundColor: codeBackground,
          color: codeTextColor,
          paddingHorizontal: 4,
          borderRadius: 3,
        },
      ]}
    >
      {s.text}
    </Text>
  ));
}

// ─── Status Icon ──────────────────────────────────────────────────────────────

const StatusIcon: React.FC<{ status: MessageStatus; color: string }> = ({ status, color }) => {
  switch (status) {
    case 'sending':
      return <MaterialIcons name="schedule" size={12} color={color} />;
    case 'sent':
      return <MaterialIcons name="done" size={12} color={color} />;
    case 'delivered':
      return <MaterialIcons name="done-all" size={12} color={color} />;
    case 'error':
      return <MaterialIcons name="error-outline" size={12} color={color} />;
    default:
      return null;
  }
};

// ─── ChatBubble Component ─────────────────────────────────────────────────────

export const ChatBubble: React.FC<ChatBubbleProps> = ({
  message,
  isNew = false,
  onCopy,
  onEdit,
  onRegenerate,
  onDelete,
}) => {
  const { colors, isDark } = useTheme();
  const isUser = message.role === 'user';
  const isStreaming = message.isStreaming;
  const isError = message.isError;
  const [showActions, setShowActions] = useState(false);

  const fadeAnim = useRef(new Animated.Value(isNew ? 0 : 1)).current;
  const slideAnim = useRef(new Animated.Value(isNew ? 12 : 0)).current;
  const cursorAnim = useRef(new Animated.Value(1)).current;
  const actionsAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isNew) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, tension: 80, friction: 10, useNativeDriver: true }),
      ]).start();
    }
  }, []);

  // Blinking cursor while streaming
  useEffect(() => {
    if (!isStreaming) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(cursorAnim, { toValue: 0.2, duration: 400, useNativeDriver: true }),
        Animated.timing(cursorAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [isStreaming]);

  // Action bar animation
  const toggleActions = useCallback(() => {
    const next = !showActions;
    setShowActions(next);
    Animated.timing(actionsAnim, {
      toValue: next ? 1 : 0,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, [showActions, actionsAnim]);

  const codeBackground = isDark ? 'rgba(0,0,0,0.45)' : 'rgba(0,0,0,0.05)';
  const codeBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const codeTextColor = isDark ? '#FF6B9D' : '#D63384';

  const timeString = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Animated.View
      style={[
        styles.row,
        isUser ? styles.userRow : styles.aiRow,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      {/* AI Avatar */}
      {!isUser && (
        <LinearGradient
          colors={isError ? [colors.error, '#CC2222'] : [colors.primary, colors.secondary]}
          style={styles.avatar}
        >
          <MaterialIcons
            name={isError ? 'error-outline' : 'auto-awesome'}
            size={14}
            color="#fff"
          />
        </LinearGradient>
      )}

      <View style={[styles.bubbleWrapper, isUser ? styles.userBubbleWrapper : styles.aiBubbleWrapper]}>
        {/* User Bubble */}
        {isUser ? (
          <Pressable onLongPress={toggleActions}>
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.bubble, styles.userBubble]}
            >
              <Text style={styles.userText} selectable>{message.content}</Text>
              <View style={styles.userFooter}>
                {message.isEdited && (
                  <Text style={styles.editedLabel}>edited</Text>
                )}
                <Text style={styles.userTime}>{timeString}</Text>
                <StatusIcon status={message.status} color="rgba(255,255,255,0.55)" />
              </View>
            </LinearGradient>
          </Pressable>
        ) : (
          /* AI Bubble */
          <Pressable onLongPress={toggleActions}>
            <View
              style={[
                styles.bubble,
                styles.aiBubble,
                {
                  backgroundColor: isDark ? colors.card : colors.surface,
                  borderColor: isError ? colors.error : (isDark ? colors.cardBorder : colors.border),
                  borderWidth: isError ? 1 : StyleSheet.hairlineWidth,
                },
              ]}
            >
              {message.content ? (
                <MarkdownText
                  content={message.content}
                  textColor={isError ? colors.error : colors.text}
                  codeBackground={codeBackground}
                  codeBorder={codeBorder}
                  codeTextColor={codeTextColor}
                  headingColor={colors.text}
                />
              ) : (
                <View style={styles.loadingDots}>
                  <View style={[styles.dot, { backgroundColor: colors.primary }]} />
                  <View style={[styles.dot, { backgroundColor: colors.primary, opacity: 0.6 }]} />
                  <View style={[styles.dot, { backgroundColor: colors.primary, opacity: 0.3 }]} />
                </View>
              )}

              {/* Streaming cursor */}
              {isStreaming && message.content ? (
                <Animated.Text style={[styles.cursor, { color: colors.primary, opacity: cursorAnim }]}>
                  ▍
                </Animated.Text>
              ) : null}

              {/* Footer */}
              {!isStreaming && (
                <View style={[styles.aiFooter, { borderTopColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }]}>
                  <View style={styles.modelBadge}>
                    <MaterialIcons name="auto-awesome" size={10} color={colors.primary} />
                    <Text style={[styles.modelLabel, { color: colors.primary }]}>Gemini 2.0 Flash</Text>
                  </View>
                  <View style={styles.aiFooterRight}>
                    {message.isEdited && (
                      <Text style={[styles.editedLabelAi, { color: colors.textMuted }]}>edited</Text>
                    )}
                    <Text style={[styles.aiTime, { color: colors.textMuted }]}>{timeString}</Text>
                  </View>
                </View>
              )}

              {isStreaming && (
                <View style={styles.streamingFooter}>
                  <MaterialIcons name="sync" size={11} color={colors.textMuted} />
                  <Text style={[styles.streamingLabel, { color: colors.textMuted }]}>Generating…</Text>
                </View>
              )}
            </View>
          </Pressable>
        )}

        {/* Action Bar */}
        {showActions && !isStreaming && (
          <Animated.View
            style={[
              styles.actionsBar,
              {
                backgroundColor: isDark ? colors.surfaceElevated : '#fff',
                borderColor: isDark ? colors.cardBorder : colors.border,
                opacity: actionsAnim,
                transform: [{ scale: actionsAnim.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) }],
              },
            ]}
          >
            <Pressable
              onPress={() => { onCopy?.(message.id); setShowActions(false); }}
              style={({ pressed }) => [styles.actionBtn, { opacity: pressed ? 0.6 : 1 }]}
            >
              <MaterialIcons name="content-copy" size={16} color={colors.textSecondary} />
              <Text style={[styles.actionLabel, { color: colors.textSecondary }]}>Copy</Text>
            </Pressable>

            {isUser && onEdit && (
              <Pressable
                onPress={() => { onEdit(message.id, message.content); setShowActions(false); }}
                style={({ pressed }) => [styles.actionBtn, { opacity: pressed ? 0.6 : 1 }]}
              >
                <MaterialIcons name="edit" size={16} color={colors.textSecondary} />
                <Text style={[styles.actionLabel, { color: colors.textSecondary }]}>Edit</Text>
              </Pressable>
            )}

            {!isUser && onRegenerate && (
              <Pressable
                onPress={() => { onRegenerate(message.id); setShowActions(false); }}
                style={({ pressed }) => [styles.actionBtn, { opacity: pressed ? 0.6 : 1 }]}
              >
                <MaterialIcons name="refresh" size={16} color={colors.textSecondary} />
                <Text style={[styles.actionLabel, { color: colors.textSecondary }]}>Retry</Text>
              </Pressable>
            )}

            {onDelete && (
              <Pressable
                onPress={() => { onDelete(message.id); setShowActions(false); }}
                style={({ pressed }) => [styles.actionBtn, { opacity: pressed ? 0.6 : 1 }]}
              >
                <MaterialIcons name="delete-outline" size={16} color={colors.error} />
                <Text style={[styles.actionLabel, { color: colors.error }]}>Delete</Text>
              </Pressable>
            )}
          </Animated.View>
        )}
      </View>
    </Animated.View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const mdStyles = StyleSheet.create({
  container: { gap: 2 },
  heading: {
    fontWeight: FontWeight.bold,
    marginTop: 6,
    marginBottom: 2,
    lineHeight: 24,
  },
  bodyText: {
    fontSize: FontSize.base - 0.5,
    lineHeight: 22,
  },
  listRow: {
    flexDirection: 'row',
    paddingLeft: 4,
    gap: 6,
  },
  listBullet: {
    fontSize: FontSize.base - 0.5,
    lineHeight: 22,
    width: 14,
  },
  codeBlock: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
    marginVertical: 6,
    overflow: 'hidden',
  },
  codeBlockText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: FontSize.sm - 1,
    lineHeight: 18,
  },
  codeLanguageBadge: {
    position: 'absolute',
    top: 6,
    right: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: 'rgba(124,111,255,0.15)',
  },
  codeLanguageText: {
    fontSize: 9,
    fontWeight: FontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginVertical: 4,
    paddingHorizontal: Spacing.md,
    alignItems: 'flex-end',
  },
  userRow: { justifyContent: 'flex-end' },
  aiRow: { justifyContent: 'flex-start', gap: Spacing.sm },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
    flexShrink: 0,
  },
  bubbleWrapper: { maxWidth: '82%' },
  userBubbleWrapper: {},
  aiBubbleWrapper: {},
  bubble: {
    borderRadius: BorderRadius.lg + 2,
    padding: Spacing.md,
  },
  userBubble: { borderBottomRightRadius: 4 },
  aiBubble: { borderBottomLeftRadius: 4 },

  userText: {
    fontSize: FontSize.base - 0.5,
    lineHeight: 22,
    color: '#fff',
  },
  userFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: 4,
  },
  editedLabel: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.4)',
    fontStyle: 'italic',
  },
  userTime: {
    fontSize: FontSize.xxs,
    color: 'rgba(255,255,255,0.5)',
  },

  // AI footer
  aiFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  aiFooterRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  editedLabelAi: {
    fontSize: 9,
    fontStyle: 'italic',
  },
  modelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  modelLabel: {
    fontSize: 10,
    fontWeight: FontWeight.medium,
  },
  aiTime: {
    fontSize: FontSize.xxs,
  },
  streamingFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  streamingLabel: {
    fontSize: 10,
    fontWeight: FontWeight.medium,
  },

  // Streaming
  cursor: {
    fontSize: FontSize.base,
    marginTop: -2,
  },
  loadingDots: {
    flexDirection: 'row',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  // Action bar
  actionsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 6,
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignSelf: 'flex-start',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: { elevation: 4 },
    }),
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.sm,
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: FontWeight.medium,
  },
});

export default ChatBubble;
