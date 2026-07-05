import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { FontSize, FontWeight, BorderRadius } from '@/constants/theme';

type StatusType = 'active' | 'idle' | 'training' | 'error' | 'completed' | 'paused' | 'archived' | 'in_progress' | 'failed';

interface StatusBadgeProps {
  status: StatusType;
  size?: 'sm' | 'md';
  showDot?: boolean;
}

const STATUS_CONFIG: Record<StatusType, { label: string; color: string; icon?: string }> = {
  active:      { label: 'Active',      color: '#00E676', icon: 'check-circle' },
  idle:        { label: 'Idle',        color: '#9E9E9E' },
  training:    { label: 'Training',    color: '#F5C842', icon: 'hourglass-top' },
  error:       { label: 'Error',       color: '#FF5252', icon: 'error' },
  completed:   { label: 'Completed',   color: '#00E676', icon: 'check-circle' },
  paused:      { label: 'Paused',      color: '#FF9800', icon: 'pause-circle' },
  archived:    { label: 'Archived',    color: '#9E9E9E' },
  in_progress: { label: 'In Progress', color: '#00D4FF', icon: 'downloading' },
  failed:      { label: 'Failed',      color: '#FF5252', icon: 'error' },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm', showDot = true }) => {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.idle;
  const isSmall = size === 'sm';

  return (
    <View style={[
      styles.badge,
      { backgroundColor: `${config.color}20`, borderColor: `${config.color}40` },
      isSmall ? styles.sm : styles.md,
    ]}>
      {showDot ? (
        <View style={[styles.dot, { backgroundColor: config.color, width: isSmall ? 5 : 7, height: isSmall ? 5 : 7 }]} />
      ) : config.icon ? (
        <MaterialIcons name={config.icon as any} size={isSmall ? 11 : 14} color={config.color} />
      ) : null}
      <Text style={[styles.label, { color: config.color, fontSize: isSmall ? FontSize.xxs : FontSize.sm }]}>
        {config.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  sm: { paddingHorizontal: 8, paddingVertical: 2 },
  md: { paddingHorizontal: 10, paddingVertical: 4 },
  dot: { borderRadius: 99 },
  label: { fontWeight: FontWeight.bold },
});

export default StatusBadge;
