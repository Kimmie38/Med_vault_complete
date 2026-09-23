import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { radius } from '../theme/theme';
import { useThemedStyles } from '../theme/ThemeContext';

// Lightweight bar chart (no chart library needed).
// data: [{ label, value, highlight? }]  highlight = projected bar drawn in a different colour.
export default function BarChart({ data, height = 150 }) {
  const { colors, styles } = useThemedStyles(createStyles);
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <View style={styles.wrap}>
      <View style={[styles.plot, { height }]}>
        {data.map((d) => {
          const h = Math.max(4, (d.value / max) * (height - 22));
          return (
            <View key={d.label} style={styles.col}>
              <Text style={[styles.value, d.highlight && { color: colors.greenLight }]}>{Math.round(d.value)}</Text>
              <View style={[styles.bar, { height: h }, d.highlight ? styles.barHighlight : styles.barNormal]} />
            </View>
          );
        })}
      </View>
      <View style={styles.labels}>
        {data.map((d) => (
          <Text key={d.label} style={[styles.label, d.highlight && { color: colors.greenLight, fontWeight: '700' }]} numberOfLines={1}>
            {d.label}
          </Text>
        ))}
      </View>
    </View>
  );
}

const createStyles = (colors, theme) => StyleSheet.create({
  wrap: { width: '100%' },
  plot: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
  col: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  value: { color: colors.textSecondary, fontSize: 11, fontWeight: '700', marginBottom: 4 },
  bar: { width: '100%', borderTopLeftRadius: radius.sm - 2, borderTopRightRadius: radius.sm - 2 },
  barNormal: { backgroundColor: colors.teal },
  barHighlight: { backgroundColor: colors.greenLight },
  labels: { flexDirection: 'row', gap: 8, marginTop: 6 },
  label: { flex: 1, textAlign: 'center', color: colors.textMuted, fontSize: 9.5 },
});
