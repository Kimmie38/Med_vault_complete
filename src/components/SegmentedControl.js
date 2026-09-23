import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { radius, spacing } from '../theme/theme';
import { useThemedStyles } from '../theme/ThemeContext';

export default function SegmentedControl({ options, value, onChange, style }) {
  const { styles } = useThemedStyles(createStyles);
  return (
    <View style={[styles.row, style]}>
      {options.map((o) => (
        <Pressable key={o.value} style={[styles.tab, value === o.value && styles.tabActive]} onPress={() => onChange(o.value)}>
          <Text style={[styles.text, value === o.value && styles.textActive]}>{o.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const createStyles = (colors, theme) => StyleSheet.create({
  row: { flexDirection: 'row', backgroundColor: colors.bgElevated2, borderRadius: radius.md, padding: 4, marginHorizontal: spacing.lg, marginBottom: spacing.md },
  tab: { flex: 1, paddingVertical: 10, borderRadius: radius.sm, alignItems: 'center' },
  tabActive: { backgroundColor: colors.green },
  text: { color: colors.textSecondary, fontSize: 13, fontWeight: '600' },
  textActive: { color: colors.onGreen },
});
