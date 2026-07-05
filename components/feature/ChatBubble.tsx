import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { BorderRadius, FontSize, Spacing } from '@/constants/theme';
import type { Message } from '@/stores/useChatStore';

interface ChatBubbleProps {
  message: Message;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const { colors } = useTheme();
  const isUser = message.role === 'user';

  return (
    <View style={[styles.row, isUser ? styles.userRow : styles.aiRow]}>
      {!isUser ? (
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <MaterialIcons name="auto-awesome" size={16} color="#fff" />
        </View>
      ) : null}
      <View
        style={[
          styles.bubble,
          isUser
            ? [styles.userBubble, { backgroundColor: colors.primary }]
            : [styles.aiBubble, { backgroundColor: colors.card, borderColor: colors.cardBorder }],
        ]}
      >
        <Text style={[styles.text, { color: isUser ? '#fff' : colors.text }]}>
          {message.content}
        </Text>
        <Text style={[styles.time, { color: isUser ? 'rgba(255,255,255,0.6)' : colors.textMuted }]}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', marginVertical: 4, paddingHorizontal: Spacing.md, alignItems: 'flex-end' },
  userRow: { justifyContent: 'flex-end' },
  aiRow: { justifyContent: 'flex-start', gap: Spacing.sm },
  avatar: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  bubble: { maxWidth: '78%', borderRadius: BorderRadius.xl, padding: Spacing.md },
  userBubble: { borderBottomRightRadius: 4 },
  aiBubble: { borderWidth: 1, borderBottomLeftRadius: 4 },
  text: { fontSize: FontSize.base, lineHeight: 22 },
  time: { fontSize: FontSize.xs, marginTop: 4, textAlign: 'right' },
});
