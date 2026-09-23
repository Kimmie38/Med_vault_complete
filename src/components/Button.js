import React from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { radius, type, spacing } from '../theme/theme';
import { useThemedStyles } from '../theme/ThemeContext';

export default function Button({
  label,
  onPress,
  variant = 'primary', // primary | outline | ghost | danger
  loading = false,
  disabled = false,
  icon = null,
  style,
}) {
  const { gradients, styles } = useThemedStyles(createStyles);
  const isDisabled = disabled || loading;

  if (variant === 'primary') {
    return (
      <Pressable onPress={onPress} disabled={isDisabled} style={({ pressed }) => [
        style,
        { opacity: isDisabled ? 0.6 : pressed ? 0.9 : 1 },
      ]}>
        <LinearGradient
          colors={gradients.brand}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.primaryBtn}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <View style={styles.row}>
              {icon}
              <Text style={styles.primaryLabel}>{label}</Text>
            </View>
          )}
        </LinearGradient>
      </Pressable>
    );
  }

  if (variant === 'danger') {
    return (
      <Pressable onPress={onPress} disabled={isDisabled} style={({ pressed }) => [
        styles.dangerBtn,
        style,
        { opacity: isDisabled ? 0.6 : pressed ? 0.85 : 1 },
      ]}>
        {loading ? <ActivityIndicator color="#fff" /> : (
          <View style={styles.row}>{icon}<Text style={styles.primaryLabel}>{label}</Text></View>
        )}
      </Pressable>
    );
  }

  if (variant === 'outline') {
    return (
      <Pressable onPress={onPress} disabled={isDisabled} style={({ pressed }) => [
        styles.outlineBtn,
        style,
        { opacity: isDisabled ? 0.5 : pressed ? 0.7 : 1 },
      ]}>
        <View style={styles.row}>{icon}<Text style={styles.outlineLabel}>{label}</Text></View>
      </Pressable>
    );
  }

  // ghost
  return (
    <Pressable onPress={onPress} disabled={isDisabled} style={({ pressed }) => [
      styles.ghostBtn,
      style,
      { opacity: isDisabled ? 0.5 : pressed ? 0.6 : 1 },
    ]}>
      <View style={styles.row}>{icon}<Text style={styles.ghostLabel}>{label}</Text></View>
    </Pressable>
  );
}

const createStyles = (colors, theme) => StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  primaryBtn: {
    height: 54,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  primaryLabel: { color: '#F2FFFA', ...type.bodyMedium, fontSize: 16 },
  dangerBtn: {
    height: 54,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.danger,
    paddingHorizontal: spacing.lg,
  },
  outlineBtn: {
    height: 54,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.teal,
    paddingHorizontal: spacing.lg,
  },
  outlineLabel: { color: colors.greenLight, ...type.bodyMedium, fontSize: 16 },
  ghostBtn: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostLabel: { color: colors.textSecondary, ...type.bodyMedium },
});
