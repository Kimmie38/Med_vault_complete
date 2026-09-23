import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { radius, spacing } from '../theme/theme';
import { useThemedStyles } from '../theme/ThemeContext';

// Small metric card: icon, big number, label. Used in a row/grid on the admin screens.
export default function StatTile({ icon, value, label, tone = 'green', onPress, style }) {
  const { colors, styles } = useThemedStyles(createStyles);
  const tint = { green: colors.greenLight, warning: colors.warning, danger: colors.danger, info: colors.info }[tone] || colors.greenLight;
  const Wrap = onPress ? Pressable : View;
  return (
    <Wrap onPress={onPress} style={[styles.tile, style]}>
      <Ionicons name={icon} size={19} color={tint} />
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label} numberOfLines={1}>{label}</Text>
    </Wrap>
  );
}

const createStyles = (colors, theme) => StyleSheet.create({
  tile: { flex: 1, backgroundColor: colors.bgElevated, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md, ...theme.shadow },
  value: { color: colors.textPrimary, fontSize: 24, fontWeight: '800', marginTop: 8 },
  label: { color: colors.textMuted, fontSize: 11.5, marginTop: 2 },
});
