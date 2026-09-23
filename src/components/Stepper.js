import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { radius, spacing } from '../theme/theme';
import { useThemedStyles } from '../theme/ThemeContext';

// Simple +/- control used for sale quantity and alert thresholds.
export default function Stepper({ value, onChange, min = 0, max = 9999, step = 1, suffix }) {
  const { colors, styles } = useThemedStyles(createStyles);
  const dec = () => onChange(Math.max(min, value - step));
  const inc = () => onChange(Math.min(max, value + step));
  return (
    <View style={styles.row}>
      <Pressable onPress={dec} disabled={value <= min} style={[styles.btn, value <= min && styles.btnDisabled]} hitSlop={6}>
        <Ionicons name="remove" size={20} color={colors.textPrimary} />
      </Pressable>
      <View style={styles.valueWrap}>
        <Text style={styles.value}>{value}</Text>
        {suffix ? <Text style={styles.suffix}>{suffix}</Text> : null}
      </View>
      <Pressable onPress={inc} disabled={value >= max} style={[styles.btn, value >= max && styles.btnDisabled]} hitSlop={6}>
        <Ionicons name="add" size={20} color={colors.textPrimary} />
      </Pressable>
    </View>
  );
}

const createStyles = (colors, theme) => StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  btn: { width: 42, height: 42, borderRadius: radius.md, backgroundColor: colors.bgElevated2, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  btnDisabled: { opacity: 0.4 },
  valueWrap: { minWidth: 64, alignItems: 'center' },
  value: { color: colors.textPrimary, fontSize: 22, fontWeight: '800' },
  suffix: { color: colors.textMuted, fontSize: 11, marginTop: 1 },
});
