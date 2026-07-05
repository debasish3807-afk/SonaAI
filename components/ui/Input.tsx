import React, { useState, useRef } from 'react';
import { View, TextInput, Text, StyleSheet, Pressable, Animated } from 'react-native';
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
  hint?: string;
  style?: any;
  autoFocus?: boolean;
  onSubmitEditing?: () => void;
  returnKeyType?: 'done' | 'send' | 'search' | 'next';
}

export const Input: React.FC<InputProps> = ({
  label, placeholder, value, onChangeText, secureTextEntry = false,
  multiline = false, numberOfLines = 1, leftIcon, rightIcon, onRightIconPress,
  error, hint, style, autoFocus, onSubmitEditing, returnKeyType,
}) => {
  const { colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const anim = useRef(new Animated.Value(0)).current;

  const onFocus = () => {
    setIsFocused(true);
    Animated.timing(anim, { toValue: 1, duration: 200, useNativeDriver: false }).start();
  };
  const onBlur = () => {
    setIsFocused(false);
    Animated.timing(anim, { toValue: 0, duration: 200, useNativeDriver: false }).start();
  };

  const borderColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [error ? colors.error : colors.border, error ? colors.error : colors.primary],
  });

  return (
    <View style={[styles.container, style]}>
      {label ? (
        <Text style={[styles.label, { color: isFocused ? colors.primary : colors.textSecondary }]}>
          {label}
        </Text>
      ) : null}
      <Animated.View style={[
        styles.inputContainer,
        { backgroundColor: colors.surfaceElevated, borderColor },
      ]}>
        {leftIcon ? (
          <MaterialIcons
            name={leftIcon}
            size={20}
            color={isFocused ? colors.primary : colors.textMuted}
            style={styles.leftIcon}
          />
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
          onFocus={onFocus}
          onBlur={onBlur}
          style={[styles.input, { color: colors.text, minHeight: multiline ? numberOfLines * 26 : undefined }]}
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
      </Animated.View>
      {error ? (
        <View style={styles.errorRow}>
          <MaterialIcons name="error-outline" size={13} color={colors.error} />
          <Text style={[styles.error, { color: colors.error }]}>{error}</Text>
        </View>
      ) : hint ? (
        <Text style={[styles.hint, { color: colors.textMuted }]}>{hint}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: 6 },
  label: { fontSize: FontSize.sm, fontWeight: '600', letterSpacing: 0.2 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    minHeight: 50,
  },
  leftIcon: { marginRight: Spacing.sm },
  input: { flex: 1, fontSize: FontSize.base, includeFontPadding: false, lineHeight: 22 },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  error: { fontSize: FontSize.xs, marginTop: 0 },
  hint: { fontSize: FontSize.xs, marginTop: 0 },
});
