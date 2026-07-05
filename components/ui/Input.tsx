import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, Pressable, ViewStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { BorderRadius, FontSize, Spacing } from '@/constants/theme';

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  leftIcon?: keyof typeof MaterialIcons.glyphMap;
  rightIcon?: keyof typeof MaterialIcons.glyphMap;
  onRightIconPress?: () => void;
  error?: string;
  style?: ViewStyle;
  autoFocus?: boolean;
  onSubmitEditing?: () => void;
  returnKeyType?: 'done' | 'send' | 'search' | 'next';
}

export const Input: React.FC<InputProps> = ({
  label, placeholder, value, onChangeText, secureTextEntry = false,
  multiline = false, numberOfLines = 1, leftIcon, rightIcon, onRightIconPress,
  error, style, autoFocus, onSubmitEditing, returnKeyType,
}) => {
  const { colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const borderColor = error ? colors.error : isFocused ? colors.primary : colors.border;

  return (
    <View style={[styles.container, style]}>
      {label ? (
        <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      ) : null}
      <View style={[styles.inputContainer, { borderColor, backgroundColor: colors.surface }]}>
        {leftIcon ? (
          <MaterialIcons name={leftIcon} size={20} color={isFocused ? colors.primary : colors.textMuted} style={styles.leftIcon} />
        ) : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={secureTextEntry && !showPassword}
          multiline={multiline}
          numberOfLines={numberOfLines}
          autoFocus={autoFocus}
          onSubmitEditing={onSubmitEditing}
          returnKeyType={returnKeyType}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={[styles.input, { color: colors.text, minHeight: multiline ? numberOfLines * 24 : undefined }]}
          accessibilityLabel={label ?? placeholder}
        />
        {secureTextEntry ? (
          <Pressable onPress={() => setShowPassword(v => !v)} hitSlop={8}>
            <MaterialIcons name={showPassword ? 'visibility-off' : 'visibility'} size={20} color={colors.textMuted} />
          </Pressable>
        ) : rightIcon ? (
          <Pressable onPress={onRightIconPress} hitSlop={8}>
            <MaterialIcons name={rightIcon} size={20} color={colors.textMuted} />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <Text style={[styles.error, { color: colors.error }]}>{error}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: 6 },
  label: { fontSize: FontSize.sm, fontWeight: '500' },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    minHeight: 48,
  },
  leftIcon: { marginRight: Spacing.sm },
  input: { flex: 1, fontSize: FontSize.base, includeFontPadding: false },
  error: { fontSize: FontSize.xs, marginTop: 2 },
});
