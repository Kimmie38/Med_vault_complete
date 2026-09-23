import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { radius, spacing, type } from '../theme/theme';
import { useThemedStyles } from '../theme/ThemeContext';

export default function Input({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  icon,
  autoCapitalize = 'sentences',
  error,
}) {
  const { colors, styles } = useThemedStyles(createStyles);
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(secureTextEntry);

  return (
    <View style={{ marginBottom: spacing.md }}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[
        styles.field,
        focused && styles.fieldFocused,
        error && styles.fieldError,
      ]}>
        {icon ? <Ionicons name={icon} size={18} color={focused ? colors.greenLight : colors.textMuted} style={{ marginRight: 10 }} /> : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={hidden}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          style={styles.input}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {secureTextEntry ? (
          <Pressable onPress={() => setHidden(!hidden)} hitSlop={10}>
            <Ionicons name={hidden ? 'eye-outline' : 'eye-off-outline'} size={19} color={colors.textMuted} />
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const createStyles = (colors, theme) => StyleSheet.create({
  label: { color: colors.textSecondary, ...type.small, marginBottom: 6, fontWeight: '600' },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgElevated2,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 52,
  },
  fieldFocused: { borderColor: colors.green },
  fieldError: { borderColor: colors.danger },
  input: { flex: 1, color: colors.textPrimary, ...type.body, fontSize: 15, height: '100%' },
  errorText: { color: colors.danger, ...type.small, marginTop: 4 },
});
