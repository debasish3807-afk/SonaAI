/**
 * SONA AI — ConversationDrawer Component (Phase 2)
 * Slide-in drawer for conversation management:
 *  - Search conversations
 *  - Pinned conversations section
 *  - Recent conversations list
 *  - New chat button
 *  - Rename, pin/unpin, delete actions (swipe or long-press menu)
 *  - Theme-aware Material 3 design
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  StyleSheet,
  Animated,
  Dimensions,
  Modal,
  Alert,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/hooks/useTheme';
import { BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/theme';
import type { Conversation } from '@/stores/useChatStore';

// ─── Props ────────────────────────────────────────────────────────────────────

interface ConversationDrawerProps {
  visible: boolean;
  onClose: () => void;
  conversations: Conversation[];
  pinnedConversations: Conversation[];
  recentConversations: Conversation[];
  activeConversationId: string | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onRenameConversation: (id: string, title: string) => void;
  onPinConversation: (id: string) => void;
  onUnpinConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
}

// ─── Rename Dialog ────────────────────────────────────────────────────────────

interface RenameDialogProps {
  visible: boolean;
  currentTitle: string;
  onConfirm: (newTitle: string) => void;
  onCancel: () => void;
  colors: any;
  isDark: boolean;
}

const RenameDialog: React.FC<RenameDialogProps> = ({
  visible,
  currentTitle,
  onConfirm,
  onCancel,
  colors,
  isDark,
}) => {
  const [title, setTitle] = useState(currentTitle);

  useEffect(() => {
    setTitle(currentTitle);
  }, [currentTitle, visible]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={dialogStyles.overlay}>
        <View style={[dialogStyles.container, { backgroundColor: isDark ? colors.surfaceElevated : '#fff', borderColor: colors.cardBorder }]}>
          <Text style={[dialogStyles.title, { color: colors.text }]}>Rename Conversation</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Enter new title"
            placeholderTextColor={colors.textMuted}
            style={[
              dialogStyles.input,
              {
                backgroundColor: isDark ? colors.card : 'rgba(0,0,0,0.04)',
                borderColor: colors.primary,
                color: colors.text,
              },
            ]}
            autoFocus
            selectTextOnFocus
            maxLength={60}
          />
          <View style={dialogStyles.buttons}>
            <Pressable
              onPress={onCancel}
              style={({ pressed }) => [dialogStyles.btn, dialogStyles.cancelBtn, { borderColor: colors.border, opacity: pressed ? 0.7 : 1 }]}
            >
              <Text style={[dialogStyles.btnText, { color: colors.textSecondary }]}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={() => { if (title.trim()) onConfirm(title.trim()); }}
              style={({ pressed }) => [dialogStyles.btn, { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 }]}
            >
              <Text style={[dialogStyles.btnText, { color: '#fff' }]}>Rename</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ─── Conversation Item ────────────────────────────────────────────────────────

interface ConvItemProps {
  conversation: Conversation;
  isActive: boolean;
  colors: any;
  isDark: boolean;
  onSelect: () => void;
  onRename: () => void;
  onPin: () => void;
  onUnpin: () => void;
  onDelete: () => void;
}

const ConversationItem: React.FC<ConvItemProps> = ({
  conversation,
  isActive,
  colors,
  isDark,
  onSelect,
  onRename,
  onPin,
  onUnpin,
  onDelete,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const timeAgo = useCallback((date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }, []);

  return (
    <View>
      <Pressable
        onPress={onSelect}
        onLongPress={() => setShowMenu(!showMenu)}
        style={({ pressed }) => [
          styles.convItem,
          {
            backgroundColor: isActive
              ? `${colors.primary}12`
              : pressed
                ? (isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)')
                : 'transparent',
            borderColor: isActive ? `${colors.primary}30` : 'transparent',
          },
        ]}
      >
        {/* Icon */}
        <View style={[styles.convIcon, { backgroundColor: isActive ? `${colors.primary}20` : (isDark ? colors.card : 'rgba(0,0,0,0.04)') }]}>
          <MaterialIcons
            name={conversation.isPinned ? 'push-pin' : 'chat-bubble-outline'}
            size={16}
            color={isActive ? colors.primary : colors.textMuted}
          />
        </View>

        {/* Content */}
        <View style={styles.convContent}>
          <Text
            style={[styles.convTitle, { color: isActive ? colors.primary : colors.text }]}
            numberOfLines={1}
          >
            {conversation.title}
          </Text>
          {conversation.lastMessage ? (
            <Text style={[styles.convPreview, { color: colors.textMuted }]} numberOfLines={1}>
              {conversation.lastMessage}
            </Text>
          ) : null}
        </View>

        {/* Meta */}
        <View style={styles.convMeta}>
          <Text style={[styles.convTime, { color: colors.textMuted }]}>
            {timeAgo(conversation.updatedAt)}
          </Text>
          {conversation.messageCount > 0 && (
            <View style={[styles.countBadge, { backgroundColor: isDark ? colors.card : 'rgba(0,0,0,0.05)' }]}>
              <Text style={[styles.countText, { color: colors.textMuted }]}>{conversation.messageCount}</Text>
            </View>
          )}
        </View>

        {/* More button */}
        <Pressable
          onPress={() => setShowMenu(!showMenu)}
          hitSlop={8}
          style={({ pressed }) => [styles.moreBtn, { opacity: pressed ? 0.5 : 0.7 }]}
        >
          <MaterialIcons name="more-horiz" size={18} color={colors.textMuted} />
        </Pressable>
      </Pressable>

      {/* Context Menu */}
      {showMenu && (
        <View style={[styles.contextMenu, { backgroundColor: isDark ? colors.surfaceElevated : '#fff', borderColor: colors.cardBorder }]}>
          <Pressable onPress={() => { setShowMenu(false); onRename(); }} style={styles.menuItem}>
            <MaterialIcons name="edit" size={16} color={colors.textSecondary} />
            <Text style={[styles.menuLabel, { color: colors.textSecondary }]}>Rename</Text>
          </Pressable>
          <Pressable onPress={() => { setShowMenu(false); conversation.isPinned ? onUnpin() : onPin(); }} style={styles.menuItem}>
            <MaterialIcons name={conversation.isPinned ? 'push-pin' : 'push-pin'} size={16} color={colors.textSecondary} />
            <Text style={[styles.menuLabel, { color: colors.textSecondary }]}>{conversation.isPinned ? 'Unpin' : 'Pin'}</Text>
          </Pressable>
          <View style={[styles.menuDivider, { backgroundColor: isDark ? colors.cardBorder : colors.border }]} />
          <Pressable onPress={() => { setShowMenu(false); onDelete(); }} style={styles.menuItem}>
            <MaterialIcons name="delete-outline" size={16} color={colors.error} />
            <Text style={[styles.menuLabel, { color: colors.error }]}>Delete</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
};

// ─── Main Drawer Component ────────────────────────────────────────────────────

export const ConversationDrawer: React.FC<ConversationDrawerProps> = ({
  visible,
  onClose,
  conversations,
  pinnedConversations,
  recentConversations,
  activeConversationId,
  searchQuery,
  onSearchChange,
  onSelectConversation,
  onNewConversation,
  onRenameConversation,
  onPinConversation,
  onUnpinConversation,
  onDeleteConversation,
}) => {
  const { colors, isDark } = useTheme();
  const slideAnim = useRef(new Animated.Value(-320)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const [searchFocused, setSearchFocused] = useState(false);
  const [renameTarget, setRenameTarget] = useState<{ id: string; title: string } | null>(null);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, tension: 65, friction: 11, useNativeDriver: true }),
        Animated.timing(backdropAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: -320, duration: 200, useNativeDriver: true }),
        Animated.timing(backdropAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  const handleDelete = useCallback((id: string, title: string) => {
    if (Platform.OS === 'web') {
      if (confirm(`Delete "${title}"?`)) {
        onDeleteConversation(id);
      }
    } else {
      Alert.alert(
        'Delete Conversation',
        `Are you sure you want to delete "${title}"? This cannot be undone.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: () => onDeleteConversation(id) },
        ]
      );
    }
  }, [onDeleteConversation]);

  const handleRenameConfirm = useCallback((newTitle: string) => {
    if (renameTarget) {
      onRenameConversation(renameTarget.id, newTitle);
      setRenameTarget(null);
    }
  }, [renameTarget, onRenameConversation]);

  const displayConversations = searchQuery.trim()
    ? conversations.filter(c =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : null;

  if (!visible) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, { opacity: backdropAnim }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      {/* Drawer Panel */}
      <Animated.View
        style={[
          styles.drawer,
          {
            backgroundColor: isDark ? colors.background : '#FAFBFF',
            borderRightColor: isDark ? colors.cardBorder : colors.border,
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        {/* Header */}
        <View style={[styles.drawerHeader, { borderBottomColor: isDark ? colors.cardBorder : colors.border }]}>
          <View style={styles.drawerHeaderLeft}>
            <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.drawerLogo}>
              <Text style={styles.drawerLogoText}>S</Text>
            </LinearGradient>
            <Text style={[styles.drawerTitle, { color: colors.text }]}>Chats</Text>
          </View>
          <Pressable onPress={onClose} hitSlop={8} style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}>
            <MaterialIcons name="close" size={22} color={colors.textSecondary} />
          </Pressable>
        </View>

        {/* New Chat Button */}
        <Pressable
          onPress={onNewConversation}
          style={({ pressed }) => [styles.newChatBtn, { opacity: pressed ? 0.85 : 1 }]}
        >
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.newChatGradient}
          >
            <MaterialIcons name="add" size={18} color="#fff" />
            <Text style={styles.newChatText}>New Chat</Text>
          </LinearGradient>
        </Pressable>

        {/* Search */}
        <View style={[styles.searchContainer, { borderColor: searchFocused ? colors.primary : (isDark ? colors.cardBorder : colors.border), backgroundColor: isDark ? colors.card : 'rgba(0,0,0,0.03)' }]}>
          <MaterialIcons name="search" size={18} color={searchFocused ? colors.primary : colors.textMuted} />
          <TextInput
            value={searchQuery}
            onChangeText={onSearchChange}
            placeholder="Search conversations..."
            placeholderTextColor={colors.textMuted}
            style={[styles.searchInput, { color: colors.text }]}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          {searchQuery ? (
            <Pressable onPress={() => onSearchChange('')} hitSlop={8}>
              <MaterialIcons name="close" size={16} color={colors.textMuted} />
            </Pressable>
          ) : null}
        </View>

        {/* Conversation List */}
        <FlatList
          data={displayConversations ?? [...pinnedConversations, ...recentConversations]}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            !displayConversations && pinnedConversations.length > 0 ? (
              <View style={styles.sectionHeader}>
                <MaterialIcons name="push-pin" size={12} color={colors.textMuted} />
                <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Pinned</Text>
              </View>
            ) : null
          }
          renderItem={({ item, index }) => {
            // Show "Recent" section header after pinned items
            const showRecentHeader =
              !displayConversations &&
              pinnedConversations.length > 0 &&
              index === pinnedConversations.length;

            return (
              <View>
                {showRecentHeader && (
                  <View style={[styles.sectionHeader, { marginTop: Spacing.sm }]}>
                    <MaterialIcons name="schedule" size={12} color={colors.textMuted} />
                    <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Recent</Text>
                  </View>
                )}
                <ConversationItem
                  conversation={item}
                  isActive={item.id === activeConversationId}
                  colors={colors}
                  isDark={isDark}
                  onSelect={() => onSelectConversation(item.id)}
                  onRename={() => setRenameTarget({ id: item.id, title: item.title })}
                  onPin={() => onPinConversation(item.id)}
                  onUnpin={() => onUnpinConversation(item.id)}
                  onDelete={() => handleDelete(item.id, item.title)}
                />
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyList}>
              <MaterialIcons name="chat-bubble-outline" size={32} color={colors.textMuted} />
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                {searchQuery ? 'No conversations found' : 'No conversations yet'}
              </Text>
              {!searchQuery && (
                <Text style={[styles.emptySubtext, { color: colors.textMuted }]}>
                  Start a new chat to begin
                </Text>
              )}
            </View>
          }
        />
      </Animated.View>

      {/* Rename Dialog */}
      <RenameDialog
        visible={!!renameTarget}
        currentTitle={renameTarget?.title ?? ''}
        onConfirm={handleRenameConfirm}
        onCancel={() => setRenameTarget(null)}
        colors={colors}
        isDark={isDark}
      />
    </View>
  );
};

// ─── Dialog Styles ────────────────────────────────────────────────────────────

const dialogStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  container: {
    width: '100%',
    maxWidth: 340,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    gap: Spacing.md,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  input: {
    height: 48,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    paddingHorizontal: Spacing.md,
    fontSize: FontSize.md,
  },
  buttons: {
    flexDirection: 'row',
    gap: Spacing.sm,
    justifyContent: 'flex-end',
  },
  btn: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.md,
  },
  cancelBtn: {
    borderWidth: 1,
  },
  btnText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
});

// ─── Main Styles ──────────────────────────────────────────────────────────────

const DRAWER_WIDTH = 310;
const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    borderRightWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 0 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
      },
      android: { elevation: 16 },
    }),
  },

  // Header
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Platform.OS === 'ios' ? 56 : 40,
    paddingBottom: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  drawerHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  drawerLogo: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerLogoText: {
    fontSize: 16,
    fontWeight: FontWeight.black,
    color: '#fff',
  },
  drawerTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },

  // New chat
  newChatBtn: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  newChatGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    gap: 6,
    borderRadius: BorderRadius.md,
  },
  newChatText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: '#fff',
  },

  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    height: 40,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSize.sm,
    paddingVertical: 0,
  },

  // List
  listContent: {
    paddingBottom: 40,
  },

  // Section headers
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: Spacing.md + 4,
    paddingVertical: Spacing.xs,
    marginTop: Spacing.xs,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  // Conversation item
  convItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    marginHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  convIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  convContent: {
    flex: 1,
    gap: 2,
  },
  convTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    lineHeight: 18,
  },
  convPreview: {
    fontSize: 11,
    lineHeight: 15,
  },
  convMeta: {
    alignItems: 'flex-end',
    gap: 4,
    flexShrink: 0,
  },
  convTime: {
    fontSize: 9,
    fontWeight: FontWeight.medium,
  },
  countBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 8,
    minWidth: 18,
    alignItems: 'center',
  },
  countText: {
    fontSize: 9,
    fontWeight: FontWeight.bold,
  },
  moreBtn: {
    padding: 4,
    marginLeft: -4,
  },

  // Context menu
  contextMenu: {
    marginHorizontal: Spacing.md + Spacing.sm,
    marginTop: 2,
    marginBottom: Spacing.xs,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingVertical: 4,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
      },
      android: { elevation: 6 },
    }),
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
  },
  menuLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  menuDivider: {
    height: 1,
    marginVertical: 2,
    marginHorizontal: Spacing.md,
  },

  // Empty state
  emptyList: {
    alignItems: 'center',
    paddingTop: Spacing.xxxl,
    gap: Spacing.sm,
  },
  emptyText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
  },
  emptySubtext: {
    fontSize: FontSize.sm,
  },
});

export default ConversationDrawer;
