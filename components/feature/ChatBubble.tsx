import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/hooks/useTheme';
import { BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/theme';
import type { Message } from '@/stores/useChatStore';

interface ChatBubbleProps {
  message: Message;
  isNew?: boolean;
}

// ── Lightweight Markdown Renderer ──────────────────────────────────────────
// Handles: **bold**, `inline code`, ```code blocks```, # headings, - lists
interface TextSegment {
  text: string;
  bold?: boolean;
  code?: boolean;
  heading?: boolean;
}

function parseInline(line: string): TextSegment[] {
  const segments: TextSegment[] = [];
  // Pattern: **bold** or `code`
  const pattern = /(\*\*(.+?)\*\*|`([^`]+)`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(line)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ text: line.slice(lastIndex, match.index) });
    }
    if (match[0].startsWith('**')) {
      segments.push({ text: match[2], bold: true });
    } else {
      segments.push({ text: match[3], code: true });
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
}

const MarkdownText: React.FC<MarkdownProps> = ({ content, textColor, codeBackground, codeBorder }) => {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let codeBlock: string[] = [];
  let inCodeBlock = false;

  lines.forEach((line, idx) => {
    // Code block fence
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        // End code block
        elements.push(
          <View key={`cb-${idx}`} style={[styles.codeBlock, { backgroundColor: codeBackground, borderColor: codeBorder }]}>
            <Text style={styles.codeBlockText}>{codeBlock.join('\n')}</Text>
          </View>
        );
        codeBlock = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      return;
    }

    if (inCodeBlock) {
      codeBlock.push(line);
      return;
    }

    // Heading
    const headingMatch = line.match(/^#{1,3}\s+(.+)/);
    if (headingMatch) {
      elements.push(
        <Text key={idx} style={[styles.heading, { color: textColor }]}>
          {headingMatch[1]}
        </Text>
      );
      return;
    }

    // List item
    const listMatch = line.match(/^[-*•]\s+(.+)/);
    if (listMatch) {
      const segs = parseInline(listMatch[1]);
      elements.push(
        <View key={idx} style={styles.listRow}>
          <Text style={[styles.listBullet, { color: textColor }]}>•</Text>
          <Text style={[styles.bodyText, { color: textColor }]}>
            {segs.map((s, si) => (
              <Text key={si} style={[
                s.bold && styles.bold,
                s.code && { ...styles.inlineCode, backgroundColor: codeBackground, color: '#FF6B9D' },
              ]}>
                {s.text}
              </Text>
            ))}
          </Text>
        </View>
      );
      return;
    }

    // Empty line → spacing
    if (!line.trim()) {
      elements.push(<View key={idx} style={{ height: 6 }} />);
      return;
    }

    // Normal line with inline formatting
    const segs = parseInline(line);
    elements.push(
      <Text key={idx} style={[styles.bodyText, { color: textColor }]}>
        {segs.map((s, si) => (
          <Text key={si} style={[
            s.bold && styles.bold,
            s.code && { ...styles.inlineCode, backgroundColor: codeBackground, color: '#FF6B9D' },
          ]}>
            {s.text}
          </Text>
        ))}
      </Text>
    );
  });

  // Unclosed code block
  if (inCodeBlock && codeBlock.length > 0) {
    elements.push(
      <View key="cb-end" style={[styles.codeBlock, { backgroundColor: codeBackground, borderColor: codeBorder }]}>
        <Text style={styles.codeBlockText}>{codeBlock.join('\n')}</Text>
      </View>
    );
  }

  return <View style={styles.markdownContainer}>{elements}</View>;
};

// ── ChatBubble Component ───────────────────────────────────────────────────
export const ChatBubble: React.FC<ChatBubbleProps> = ({ message, isNew = false }) => {
  const { colors, isDark } = useTheme();
  const isUser = message.role === 'user';
  const isStreaming = message.isStreaming;
  const isError = message.isError;

  const fadeAnim = useRef(new Animated.Value(isNew ? 0 : 1)).current;
  const slideAnim = useRef(new Animated.Value(isNew ? 14 : 0)).current;
  const cursorAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isNew) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, tension: 85, friction: 10, useNativeDriver: true }),
      ]).start();
    }
  }, []);

  // Blinking cursor animation while streaming
  useEffect(() => {
    if (!isStreaming) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(cursorAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
        Animated.timing(cursorAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [isStreaming]);

  const codeBackground = isDark ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.06)';
  const codeBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)';
  const bubbleBorder = isError ? colors.error : colors.cardBorder;

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
      {!isUser ? (
        <LinearGradient
          colors={isError ? ['#FF5252', '#CC2222'] : ['#7C6FFF', '#00D4FF']}
          style={styles.avatar}
        >
          <MaterialIcons
            name={isError ? 'error-outline' : 'auto-awesome'}
            size={15}
            color="#fff"
          />
        </LinearGradient>
      ) : null}

      <View style={[styles.bubbleWrapper, isUser ? styles.userBubbleWrapper : styles.aiBubbleWrapper]}>
        {/* User Bubble */}
        {isUser ? (
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.bubble, styles.userBubble]}
          >
            <Text style={styles.userText}>{message.content}</Text>
            <Text style={styles.userTime}>{timeString}</Text>
          </LinearGradient>
        ) : (
          /* AI Bubble */
          <View
            style={[
              styles.bubble,
              styles.aiBubble,
              {
                backgroundColor: colors.card,
                borderColor: bubbleBorder,
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
              />
            ) : (
              // Empty placeholder while streaming starts
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
            {!isStreaming ? (
              <View style={[styles.aiFooter, { borderTopColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
                <View style={styles.modelBadge}>
                  <MaterialIcons name="auto-awesome" size={10} color={colors.primary} />
                  <Text style={[styles.modelLabel, { color: colors.primary }]}>Gemini 2.5 Flash</Text>
                </View>
                <Text style={[styles.aiTime, { color: colors.textMuted }]}>{timeString}</Text>
              </View>
            ) : (
              <View style={styles.streamingFooter}>
                <MaterialIcons name="sync" size={11} color={colors.textMuted} />
                <Text style={[styles.streamingLabel, { color: colors.textMuted }]}>Generating…</Text>
              </View>
            )}
          </View>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginVertical: 5,
    paddingHorizontal: Spacing.md,
    alignItems: 'flex-end',
  },
  userRow: { justifyContent: 'flex-end' },
  aiRow: { justifyContent: 'flex-start', gap: Spacing.sm },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
    flexShrink: 0,
  },
  bubbleWrapper: { maxWidth: '80%' },
  userBubbleWrapper: {},
  aiBubbleWrapper: {},
  bubble: { borderRadius: BorderRadius.xl, padding: Spacing.md, gap: 4 },
  userBubble: { borderBottomRightRadius: 4 },
  aiBubble: { borderBottomLeftRadius: 4 },

  userText: { fontSize: FontSize.base, lineHeight: 23, color: '#fff' },
  userTime: { fontSize: FontSize.xxs, color: 'rgba(255,255,255,0.5)', textAlign: 'right', marginTop: 2 },

  aiFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
  },
  modelBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  modelLabel: { fontSize: FontSize.xxs, fontWeight: FontWeight.semibold },
  aiTime: { fontSize: FontSize.xxs },

  streamingFooter: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  streamingLabel: { fontSize: FontSize.xxs },
  cursor: { fontSize: FontSize.base, lineHeight: 20 },

  loadingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: Spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  // Markdown styles
  markdownContainer: { gap: 2 },
  bodyText: { fontSize: FontSize.base, lineHeight: 23, flexWrap: 'wrap' },
  bold: { fontWeight: FontWeight.bold },
  inlineCode: {
    fontFamily: 'monospace',
    fontSize: FontSize.sm,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  heading: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    lineHeight: 28,
    marginTop: 4,
    marginBottom: 2,
  },
  listRow: { flexDirection: 'row', gap: 6, alignItems: 'flex-start' },
  listBullet: { fontSize: FontSize.base, lineHeight: 23, marginTop: 1 },
  codeBlock: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.sm + 4,
    marginVertical: 4,
  },
  codeBlockText: {
    fontFamily: 'monospace',
    fontSize: FontSize.sm,
    color: '#00E676',
    lineHeight: 20,
  },
});
