import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, type } from '../theme/theme';
import { useThemedStyles } from '../theme/ThemeContext';

export default function ScreenHeader({ title, subtitle, onBack, right }) {
  const { colors, styles } = useThemedStyles(createStyles);
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        {onBack ? (
          <Pressable onPress={onBack} hitSlop={10} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
          </Pressable>
        ) : null}
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {right}
      </View>
    </View>
  );
}

const createStyles = (colors, theme) => StyleSheet.create({
  wrap: { paddingHorizontal: spacing.lg, paddingTop: 60, paddingBottom: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center' },
  backBtn: { marginRight: spacing.sm, width: 34, height: 34, borderRadius: 17, backgroundColor: colors.bgElevated2, alignItems: 'center', justifyContent: 'center' },
  title: { color: colors.textPrimary, ...type.h1 },
  subtitle: { color: colors.textSecondary, ...type.small, marginTop: 2 },
});
