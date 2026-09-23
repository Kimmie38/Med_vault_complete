import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing } from '../theme/theme';
import { useThemedStyles } from '../theme/ThemeContext';
import { timeAgo, clockTime } from '../utils/adminStats';

export const ACTIVITY_ICONS = {
  login: 'log-in-outline',
  signup: 'person-add-outline',
  stock: 'cube-outline',
  sale: 'cart-outline',
  alert: 'notifications-outline',
  admin: 'shield-checkmark-outline',
};

// One line of the activity log. `compact` hides the pharmacy name (used inside a user's page).
export default function ActivityRow({ item, compact = false, absoluteTime = false }) {
  const { colors, styles } = useThemedStyles(createStyles);
  const isAdmin = item.type === 'admin';
  const tint = isAdmin ? colors.warning : colors.greenLight;
  const tintBg = isAdmin ? colors.warningTint : colors.greenTint;
  return (
    <View style={styles.row}>
      <View style={[styles.icon, { backgroundColor: tintBg }]}>
        <Ionicons name={ACTIVITY_ICONS[item.type] || 'ellipse-outline'} size={17} color={tint} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.message}>
          {compact ? '' : <Text style={styles.actor}>{isAdmin ? 'Admin' : item.userName}{' · '}</Text>}
          {item.message}
        </Text>
        <Text style={styles.meta}>
          {compact || isAdmin ? '' : `${item.pharmacyName} · `}{absoluteTime ? clockTime(item.at) : timeAgo(item.at)}
        </Text>
      </View>
    </View>
  );
}

const createStyles = (colors) => StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 10, gap: spacing.sm + 2 },
  icon: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  message: { color: colors.textSecondary, fontSize: 13, lineHeight: 18 },
  actor: { color: colors.textPrimary, fontWeight: '700' },
  meta: { color: colors.textMuted, fontSize: 11.5, marginTop: 2 },
});
