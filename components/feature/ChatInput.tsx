/**
 * SONA AI — ChatInput Component (Phase 2)
 * Premium Material 3 chat input with:
 *  - Multi-line expandable text input
 *  - Send button with gradient + disabled state
 *  - Attachment button (image picker architecture)
 *  - Voice message button (architecture ready)
 *  - Focus animation on border
 *  - Character limit indicator
 *  - Edit mode for editing existing messages
 *  - Theme-aware dark/light styling
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  View,
  TextInput,
  Pressable,
  StyleSheet,
  Animated,
  Platform,
  Keyboard,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/hooks/useTheme';
import { BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/theme';
import type { Attachment } from '@/stores/useChatStore';

// ─── Props ────────────────────────────────────────────────────────────────────

interface ChatInputProps {
  onSend: (content: string, attachments?: Attachment[]) => void;
  isTyping?: boolean;
  editMode?: { messageId: string; content: string } | null;
  onCancelEdit?: () => void;
  placeholder?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_CHARS = 4000;
const MAX_INPUT_HEIGHT = 120;

// ─── Component ────────────────────────────────────────────────────────────────

export const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  isTyping = false,
  editMode = null,
  onCancelEdit,
  placeholder = 'Message SONA AI...',
}) => {
  const { colors, isDark } = useTheme();
  const [input, setInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [inputHeight, setInputHeight] = useState(44);
  const inputRef = useRef<TextInput>(null);

  // Animations
  const borderAnim = useRef(new Animated.Value(0)).current;
  const sendScale = useRef(new Animated.Value(0.8)).current;
  const editBarAnim = useRef(new Animated.Value(0)).current;

  // Focus animation
  useEffect(() => {
    Animated.timing(borderAnim, {
      toValue: isFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused]);

  // Send button scale
  useEffect(() => {
    Animated.spring(sendScale, {
      toValue: input.trim() ? 1 : 0.8,
      tension: 80,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [input]);

  // Edit mode
  useEffect(() => {
    if (editMode) {
      setInput(editMode.content);
      inputRef.current?.focus();
      Animated.timing(editBarAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(editBarAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  }, [editMode]);

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || isTyping) return;

    onSend(trimmed);
    setInput('');
    setInputHeight(44);
    Keyboard.dismiss();
  }, [input, isTyping, onSend]);

  const handleCancelEdit = useCallback(() => {
    setInput('');
    onCancelEdit?.();
  }, [onCancelEdit]);

  const handleAttachment = useCallback(() => {
    // Architecture: This will open image picker
    // Implementation: Use expo-image-picker to select image
    // Then create an Attachment object and include with message
    // For now this shows the infrastructure is ready
  }, []);

  const handleVoice = useCallback(() => {
    // Architecture: This will start voice recording
    // Implementation: Use expo-av to record audio
    // Then create a voice Attachment and send
  }, []);

  const handleContentSizeChange = useCallback((event: any) => {
    const height = Math.min(event.nativeEvent.contentSize.height, MAX_INPUT_HEIGHT);
    setInputHeight(Math.max(44, height));
  }, []);

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [isDark ? colors.cardBorder : colors.border, colors.primary],
  });

  const canSend = input.trim().length > 0 && !isTyping;
  const charCount = input.length;
  const showCharWarning = charCount > MAX_CHARS * 0.9;

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderTopColor: isDark ? colors.cardBorder : colors.border }]}>
      {/* Edit Mode Bar */}
      {editMode && (
        <Animated.View
          style={[
            styles.editBar,
            {
              backgroundColor: `${colors.primary}10`,
              borderLeftColor: colors.primary,
              opacity: editBarAnim,
            },
          ]}
        >
          <View style={styles.editBarContent}>
            <MaterialIcons name="edit" size={14} color={colors.primary} />
            <Animated.Text
              style={[styles.editBarText, { color: colors.primary }]}
              numberOfLines={1}
            >
              Editing message
            </Animated.Text>
          </View>
          <Pressable onPress={handleCancelEdit} hitSlop={8}>
            <MaterialIcons name="close" size={18} color={colors.textMuted} />
          </Pressable>
        </Animated.View>
      )}

      {/* Input Row */}
      <View style={styles.inputRow}>
        {/* Attachment Button */}
        <Pressable
          onPress={handleAttachment}
          hitSlop={8}
          style={({ pressed }) => [
            styles.iconButton,
            {
              backgroundColor: isDark ? colors.card : 'rgba(0,0,0,0.04)',
              opacity: pressed ? 0.6 : 1,
            },
          ]}
        >
          <MaterialIcons name="add" size={20} color={colors.textSecondary} />
        </Pressable>

        {/* Text Input */}
        <Animated.View
          style={[
            styles.inputWrapper,
            {
              backgroundColor: isDark ? colors.card : 'rgba(0,0,0,0.03)',
              borderColor: borderColor,
              height: Math.max(44, inputHeight + 8),
            },
          ]}
        >
          <TextInput
            ref={inputRef}
            value={input}
            onChangeText={setInput}
            placeholder={editMode ? 'Edit your message...' : placeholder}
            placeholderTextColor={colors.textMuted}
            multiline
            maxLength={MAX_CHARS}
            style={[
              styles.input,
              {
                color: colors.text,
                maxHeight: MAX_INPUT_HEIGHT,
              },
            ]}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onContentSizeChange={handleContentSizeChange}
            returnKeyType={Platform.OS === 'ios' ? 'default' : 'send'}
            blurOnSubmit={false}
            onSubmitEditing={Platform.OS === 'android' ? handleSend : undefined}
            editable={!isTyping}
          />

          {/* Voice button inside input (when empty) */}
          {!input.trim() && !editMode && (
            <Pressable
              onPress={handleVoice}
              hitSlop={8}
              style={({ pressed }) => [styles.voiceButton, { opacity: pressed ? 0.6 : 1 }]}
            >
              <MaterialIcons name="mic" size={20} color={colors.textMuted} />
            </Pressable>
          )}
        </Animated.View>

        {/* Send Button */}
        <Animated.View style={{ transform: [{ scale: sendScale }] }}>
          <Pressable
            onPress={handleSend}
            disabled={!canSend}
            style={({ pressed }) => [
              styles.sendButton,
              { opacity: pressed && canSend ? 0.8 : 1 },
            ]}
          >
            <LinearGradient
              colors={canSend ? [colors.primary, colors.primaryDark] : [isDark ? colors.card : '#E0E0E0', isDark ? colors.card : '#E0E0E0']}
              style={styles.sendButtonGradient}
            >
              <MaterialIcons
                name={editMode ? 'check' : 'arrow-upward'}
                size={18}
                color={canSend ? '#fff' : colors.textMuted}
              />
            </LinearGradient>
          </Pressable>
        </Animated.View>
      </View>

      {/* Character count warning */}
      {showCharWarning && (
        <View style={styles.charCounter}>
          <Animated.Text
            style={[
              styles.charCountText,
              { color: charCount >= MAX_CHARS ? colors.error : colors.textMuted },
            ]}
          >
            {charCount}/{MAX_CHARS}
          </Animated.Text>
        </View>
      )}
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: Spacing.sm,
  },

  // Edit bar
  editBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.sm,
    borderLeftWidth: 3,
    borderRadius: BorderRadius.sm,
  },
  editBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  editBarText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },

  // Input row
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
  },

  // Icon buttons
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 3,
  },

  // Input wrapper
  inputWrapper: {
    flex: 1,
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    paddingHorizontal: Spacing.md,
    paddingVertical: Platform.OS === 'ios' ? 8 : 4,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    fontSize: FontSize.md,
    lineHeight: 20,
    paddingTop: Platform.OS === 'ios' ? 4 : 8,
    paddingBottom: Platform.OS === 'ios' ? 4 : 8,
    textAlignVertical: 'center',
  },

  // Voice button
  voiceButton: {
    paddingLeft: 8,
    paddingBottom: Platform.OS === 'ios' ? 2 : 6,
  },

  // Send button
  sendButton: {
    marginBottom: 3,
  },
  sendButtonGradient: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Character counter
  charCounter: {
    alignItems: 'flex-end',
    paddingRight: Spacing.md,
    paddingTop: 4,
  },
  charCountText: {
    fontSize: 10,
    fontWeight: FontWeight.medium,
  },
});

export default ChatInput;
