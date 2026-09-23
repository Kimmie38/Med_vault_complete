import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { radius, spacing, type } from '../theme/theme';
import { useThemedStyles } from '../theme/ThemeContext';

// Dropdown-style picker. options: [{ value, label, sub? }]
export default function SelectField({ label, value, options, onSelect, placeholder = 'Select', icon = 'list-outline', error }) {
  const { colors, styles } = useThemedStyles(createStyles);
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <View style={{ marginBottom: spacing.md }}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <Pressable style={[styles.field, open && styles.fieldOpen, error && styles.fieldError]} onPress={() => setOpen(!open)}>
        <Ionicons name={icon} size={18} color={selected ? colors.greenLight : colors.textMuted} style={{ marginRight: 10 }} />
        <Text style={[styles.text, !selected && { color: colors.textMuted }]} numberOfLines={1}>
          {selected ? selected.label : placeholder}
        </Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textMuted} />
      </Pressable>
      {open && (
        <View style={styles.list}>
          <ScrollView style={{ maxHeight: 240 }} nestedScrollEnabled keyboardShouldPersistTaps="handled">
            {options.map((o, i) => (
              <Pressable
                key={String(o.value)}
                style={[styles.item, i === options.length - 1 && { borderBottomWidth: 0 }]}
                onPress={() => { onSelect(o.value); setOpen(false); }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemText}>{o.label}</Text>
                  {o.sub ? <Text style={styles.itemSub}>{o.sub}</Text> : null}
                </View>
                {value === o.value && <Ionicons name="checkmark" size={18} color={colors.greenLight} />}
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const createStyles = (colors, theme) => StyleSheet.create({
  label: { color: colors.textSecondary, ...type.small, marginBottom: 6, fontWeight: '600' },
  field: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bgElevated2, borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md, height: 52 },
  fieldOpen: { borderColor: colors.green },
  fieldError: { borderColor: colors.danger },
  text: { flex: 1, color: colors.textPrimary, ...type.body, fontSize: 15 },
  list: { backgroundColor: colors.bgElevated2, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, marginTop: 6, overflow: 'hidden' },
  item: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  itemText: { color: colors.textPrimary, fontSize: 14 },
  itemSub: { color: colors.textMuted, fontSize: 11.5, marginTop: 2 },
  errorText: { color: colors.danger, ...type.small, marginTop: 4 },
});
