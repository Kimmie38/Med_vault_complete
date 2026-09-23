import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { radius, type } from '../theme/theme';
import { useThemedStyles } from '../theme/ThemeContext';

export default function Badge({ label, tone = 'neutral' }) {
  const { colors, styles } = useThemedStyles(createStyles);
  const tones = {
    success: { bg: colors.successTint, fg: colors.success },
    warning: { bg: colors.warningTint, fg: colors.warning },
    danger: { bg: colors.dangerTint, fg: colors.danger },
    info: { bg: colors.infoTint, fg: colors.info },
    neutral: { bg: colors.bgElevated2, fg: colors.textSecondary },
  };
  const t = tones[tone] || tones.neutral;
  return (
    <View style={[styles.badge, { backgroundColor: t.bg }]}>
      <Text style={[styles.text, { color: t.fg }]}>{label}</Text>
    </View>
  );
}

const createStyles = () => StyleSheet.create({
  badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.pill, alignSelf: 'flex-start' },
  text: { ...type.tiny, textTransform: 'none' },
});
