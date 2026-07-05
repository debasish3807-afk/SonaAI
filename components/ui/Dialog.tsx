import React, { useEffect, useRef } from 'react';
import {
  Modal, View, Text, Pressable, StyleSheet, Animated, BackHandler,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/hooks/useTheme';
import { BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/theme';

interface DialogAction {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'danger' | 'cancel';
  icon?: keyof typeof MaterialIcons.glyphMap;
}

interface DialogProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message?: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
  iconColor?: string;
  actions?: DialogAction[];
  children?: React.ReactNode;
}

export const Dialog: React.FC<DialogProps> = ({
  visible, onClose, title, message, icon, iconColor, actions, children,
}) => {
  const { colors, isDark } = useTheme();
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, tension: 70, friction: 9, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      scaleAnim.setValue(0.85);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  useEffect(() => {
    const handler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (visible) { onClose(); return true; }
      return false;
    });
    return () => handler.remove();
  }, [visible]);

  const getActionStyle = (variant: DialogAction['variant'] = 'primary') => {
    switch (variant) {
      case 'danger': return { bg: `${colors.error}15`, text: colors.error, border: `${colors.error}40` };
      case 'cancel': return { bg: colors.card, text: colors.textSecondary, border: colors.cardBorder };
      default: return { bg: `${colors.primary}15`, text: colors.primary, border: `${colors.primary}40` };
    }
  };

  const accentColor = iconColor ?? colors.primary;

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent onRequestClose={onClose}>
      <Animated.View style={[styles.overlay, { opacity: opacityAnim }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <Animated.View
          style={[
            styles.container,
            { backgroundColor: colors.surface, borderColor: colors.cardBorder, transform: [{ scale: scaleAnim }] },
          ]}
        >
          {/* Icon */}
          {icon ? (
            <LinearGradient
              colors={[`${accentColor}30`, `${accentColor}10`]}
              style={styles.iconBg}
            >
              <MaterialIcons name={icon} size={32} color={accentColor} />
            </LinearGradient>
          ) : null}

          {/* Text */}
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          {message ? <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text> : null}

          {/* Custom content */}
          {children ? <View style={styles.childrenWrapper}>{children}</View> : null}

          {/* Actions */}
          {actions && actions.length > 0 ? (
            <View style={[styles.actions, actions.length > 2 && styles.actionsColumn]}>
              {actions.map((action) => {
                const s = getActionStyle(action.variant);
                return (
                  <Pressable
                    key={action.label}
                    onPress={action.onPress}
                    style={({ pressed }) => [
                      styles.actionBtn,
                      actions.length <= 2 && { flex: 1 },
                      { backgroundColor: s.bg, borderColor: s.border, opacity: pressed ? 0.8 : 1 },
                    ]}
                  >
                    {action.icon ? <MaterialIcons name={action.icon} size={16} color={s.text} /> : null}
                    <Text style={[styles.actionText, { color: s.text }]}>{action.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          ) : null}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  container: {
    width: '100%',
    maxWidth: 360,
    borderRadius: BorderRadius.xxl,
    borderWidth: 1,
    padding: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconBg: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  title: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, textAlign: 'center' },
  message: { fontSize: FontSize.base, textAlign: 'center', lineHeight: 24 },
  childrenWrapper: { width: '100%', marginTop: Spacing.xs },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    width: '100%',
    marginTop: Spacing.sm,
  },
  actionsColumn: { flexDirection: 'column' },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Spacing.sm + 4,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  actionText: { fontSize: FontSize.base, fontWeight: FontWeight.semibold },
});
