import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/hooks/useTheme';
import { Badge } from '@/components/ui/Badge';
import { BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/theme';
import type { Message } from '@/stores/useChatStore';

interface ChatBubbleProps {
  message: Message;
  isNew?: boolean;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message, isNew = false }) => {
  const { colors } = useTheme();
  const isUser = message.role === 'user';
  const fadeAnim = useRef(new Animated.Value(isNew ? 0 : 1)).current;
  const slideAnim = useRef(new Animated.Value(isNew ? 12 : 0)).current;

  useEffect(() => {
    if (isNew) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, tension: 80, friction: 10, useNativeDriver: true }),
      ]).start();
    }
  }, []);

  return (
    <Animated.View
      style={[
        styles.row,
        isUser ? styles.userRow : styles.aiRow,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      {!isUser ? (
        <LinearGradient colors={['#7C6FFF', '#00D4FF']} style={styles.avatar}>
          <MaterialIcons name="auto-awesome" size={15} color="#fff" />
        </LinearGradient>
      ) : null}

      <View style={[
        styles.bubbleWrapper,
        isUser ? styles.userBubbleWrapper : styles.aiBubbleWrapper,
      ]}>
        {isUser ? (
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.bubble, styles.userBubble]}
          >
            <Text style={[styles.text, { color: '#fff' }]}>{message.content}</Text>
            <Text style={[styles.time, { color: 'rgba(255,255,255,0.55)' }]}>
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </LinearGradient>
        ) : (
          <View style={[styles.bubble, styles.aiBubble, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={[styles.text, { color: colors.text }]}>{message.content}</Text>
            <View style={styles.aiFooter}>
              <Badge label="SONA AI" variant="primary" size="sm" />
              <Text style={[styles.time, { color: colors.textMuted }]}>
                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          </View>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', marginVertical: 5, paddingHorizontal: Spacing.md, alignItems: 'flex-end' },
  userRow: { justifyContent: 'flex-end' },
  aiRow: { justifyContent: 'flex-start', gap: Spacing.sm },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  bubbleWrapper: { maxWidth: '78%' },
  userBubbleWrapper: {},
  aiBubbleWrapper: {},
  bubble: { borderRadius: BorderRadius.xl, padding: Spacing.md, gap: 6 },
  userBubble: { borderBottomRightRadius: 4 },
  aiBubble: { borderWidth: 1, borderBottomLeftRadius: 4 },
  text: { fontSize: FontSize.base, lineHeight: 23 },
  time: { fontSize: FontSize.xxs, textAlign: 'right' },
  aiFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
});
