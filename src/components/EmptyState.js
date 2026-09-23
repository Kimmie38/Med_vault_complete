import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, type } from '../theme/theme';
import { useThemedStyles } from '../theme/ThemeContext';

export default function EmptyState({ icon = 'checkmark-done-circle-outline', title, subtitle, tint }) {
  const { colors, styles } = useThemedStyles(createStyles);
  return (
    <View style={styles.wrap}>
      <Ionicons name={icon} size={52} color={tint || colors.success} />
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.sub}>{subtitle}</Text> : null}
    </View>
  );
}

const createStyles = (colors) => StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl, paddingVertical: spacing.xxl },
  title: { color: colors.textPrimary, ...type.h2, marginTop: spacing.md, textAlign: 'center' },
  sub: { color: colors.textMuted, ...type.small, marginTop: 6, textAlign: 'center', lineHeight: 18 },
});
