import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import Input from './Input';
import { radius, spacing, type } from '../theme/theme';
import { useThemedStyles } from '../theme/ThemeContext';
import { formatDate, fromISO, toISO } from '../utils/dates';

// Native date picker (documentation §3.4.3.2: avoids free-text date formatting errors).
// Value is an ISO string "YYYY-MM-DD". On web (no native picker) it falls back to a text field.
export default function DateField({ label, value, onChange, minimumDate, placeholder = 'Select date', error }) {
  const { colors, isDark, styles } = useThemedStyles(createStyles);
  const [show, setShow] = useState(false);

  if (Platform.OS === 'web') {
    return <Input label={label} placeholder="YYYY-MM-DD" value={value} onChangeText={onChange} icon="calendar-outline" autoCapitalize="none" error={error} />;
  }

  const handleChange = (event, date) => {
    if (Platform.OS === 'android') setShow(false);
    if (event.type === 'dismissed') { setShow(false); return; }
    if (date) onChange(toISO(date));
  };

  return (
    <View style={{ marginBottom: spacing.md }}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <Pressable style={[styles.field, show && styles.fieldOpen, error && styles.fieldError]} onPress={() => setShow(true)}>
        <Ionicons name="calendar-outline" size={18} color={value ? colors.greenLight : colors.textMuted} style={{ marginRight: 10 }} />
        <Text style={[styles.text, !value && { color: colors.textMuted }]}>{value ? formatDate(value) : placeholder}</Text>
      </Pressable>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {show && (
        <View>
          <DateTimePicker
            value={value ? fromISO(value) : new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleChange}
            minimumDate={minimumDate}
            themeVariant={isDark ? 'dark' : 'light'}
          />
          {Platform.OS === 'ios' && (
            <Pressable style={styles.doneBtn} onPress={() => setShow(false)}>
              <Text style={styles.doneText}>Done</Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

const createStyles = (colors, theme) => StyleSheet.create({
  label: { color: colors.textSecondary, ...type.small, marginBottom: 6, fontWeight: '600' },
  field: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bgElevated2, borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md, height: 52 },
  fieldOpen: { borderColor: colors.green },
  fieldError: { borderColor: colors.danger },
  text: { flex: 1, color: colors.textPrimary, ...type.body, fontSize: 15 },
  errorText: { color: colors.danger, ...type.small, marginTop: 4 },
  doneBtn: { alignSelf: 'flex-end', paddingVertical: 8, paddingHorizontal: 16 },
  doneText: { color: colors.greenLight, fontWeight: '700' },
});
