import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Avatar from './Avatar';
import Badge from './Badge';
import { radius, spacing } from '../theme/theme';
import { useThemedStyles } from '../theme/ThemeContext';
import { timeAgo, daysSince } from '../utils/adminStats';

// One pharmacy account in a list (Users tab, "needs attention" on the overview).
export default function UserRow({ user = {}, onPress }) {
  const { colors, styles } = useThemedStyles(createStyles);
  const suspended = user && user.status === 'suspended';
  const isNew = user && user.createdAt ? daysSince(`${user.createdAt} 00:00`) <= 7 : false;
  const dormant = !suspended && user && user.lastActive ? daysSince(user.lastActive) > 30 : false;
  const attention = user && user.counts ? user.counts.attention || 0 : 0;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, { opacity: pressed ? 0.85 : 1 }]}> 
      <Avatar name={user && user.name} size={46} tone={suspended ? 'muted' : 'brand'} />
      <View style={{ flex: 1, marginLeft: spacing.md }}>
        <Text style={[styles.name, suspended && { color: colors.textSecondary }]} numberOfLines={1}>{user && user.name}</Text>
        <Text style={styles.pharmacy} numberOfLines={1}>{user && user.pharmacyName}</Text>
        <View style={styles.badges}>
          {suspended ? <Badge label="Suspended" tone="danger" /> : isNew ? <Badge label="New" tone="info" /> : dormant ? <Badge label="Inactive" tone="warning" /> : <Badge label="Active" tone="success" />}
            {attention > 0 ? <Badge label={`${attention} alert${attention > 1 ? 's' : ''}`} tone="warning" /> : null}
        </View>
      </View>
      <View style={styles.right}>
        <Text style={styles.seen}>{timeAgo(user.lastActive)}</Text>
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} style={{ marginTop: 10 }} />
      </View>
    </Pressable>
  );
}

const createStyles = (colors, theme) => StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bgElevated, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md, ...theme.shadow },
  name: { color: colors.textPrimary, fontSize: 15, fontWeight: '700' },
  pharmacy: { color: colors.textMuted, fontSize: 12, marginTop: 1 },
  badges: { flexDirection: 'row', gap: 6, marginTop: 8, flexWrap: 'wrap' },
  right: { alignItems: 'flex-end', marginLeft: spacing.sm },
  seen: { color: colors.textMuted, fontSize: 11 },
});
