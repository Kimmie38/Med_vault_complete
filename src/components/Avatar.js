import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemedStyles } from '../theme/ThemeContext';

// Initials in a circle. `tone="muted"` is used for suspended accounts.
export default function Avatar({ name = '', size = 44, tone = 'brand' }) {
  const { colors, styles } = useThemedStyles(createStyles);
  const safeName = typeof name === 'string' ? name : (name && String(name)) || '';
  const initials = safeName.split(' ').filter(Boolean).map((n) => n[0]).join('').slice(0, 2).toUpperCase();
  const muted = tone === 'muted';
  return (
    <View style={[styles.circle, { width: size, height: size, borderRadius: size / 2 }, muted && { backgroundColor: colors.bgElevated2, borderColor: colors.danger }]}>
      <Text style={[styles.text, { fontSize: size * 0.34 }, muted && { color: colors.textMuted }]}>{initials}</Text>
    </View>
  );
}

const createStyles = (colors) => StyleSheet.create({
  circle: { backgroundColor: colors.tealDeep, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: colors.green },
  text: { color: '#fff', fontWeight: '800' },
});
