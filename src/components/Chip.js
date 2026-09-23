import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { radius } from '../theme/theme';
import { useThemedStyles } from '../theme/ThemeContext';

export default function Chip({ label, active, onPress, count }) {
  const { styles } = useThemedStyles(createStyles);
  return (
    <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
      <Text style={[styles.text, active && styles.textActive]}>
        {label}
        {count !== undefined ? `  ${count}` : ''}
      </Text>
    </Pressable>
  );
}

const createStyles = (colors, theme) => StyleSheet.create({
  chip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: radius.pill, backgroundColor: colors.bgElevated2, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.greenTintStrong, borderColor: colors.green },
  text: { color: colors.textSecondary, fontSize: 12.5, fontWeight: '600' },
  textActive: { color: colors.greenLight },
});
