import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Badge from './Badge';
import { radius, spacing } from '../theme/theme';
import { useThemedStyles } from '../theme/ThemeContext';
import { TIER_LABEL, TIER_TONE } from '../utils/adminStats';

// One alert from any pharmacy. `showPharmacy=false` is used inside a single user's page.
export default function AdminAlertRow({ alert, onPress, showPharmacy = true }) {
  const { colors, styles } = useThemedStyles(createStyles);
  const tierTone = TIER_TONE[alert?.tier];
  const stripe = { danger: colors.danger, warning: colors.warning, info: colors.info }[tierTone];
  const drugName = alert?.drug ? (typeof alert.drug === 'string' ? alert.drug : alert.drug.name || alert.drug.drugName) : alert?.drugName || 'Unknown drug';
  const tierLabel = TIER_LABEL[alert?.tier] || 'Alert';
  return (
    <Pressable onPress={onPress} disabled={!onPress} style={({ pressed }) => [styles.card, { borderLeftColor: stripe, opacity: pressed ? 0.85 : 1 }]}>
      <View style={{ flex: 1 }}>
        <Text style={styles.drug} numberOfLines={1}>{drugName}</Text>
        {showPharmacy ? <Text style={styles.pharmacy} numberOfLines={1}>{alert?.pharmacyName || ''}</Text> : null}
        <Text style={styles.detail}>
          {alert?.batchNumber ? `Batch ${alert.batchNumber} · Qty ${alert.quantity} · ` : ''}{alert?.detail || ''}
        </Text>
      </View>
      <Badge label={tierLabel} tone={tierTone} />
    </Pressable>
  );
}

const createStyles = (colors, theme) => StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, backgroundColor: colors.bgElevated, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, borderLeftWidth: 4, padding: spacing.md, ...theme.shadow },
  drug: { color: colors.textPrimary, fontSize: 15, fontWeight: '700' },
  pharmacy: { color: colors.greenLight, fontSize: 12, fontWeight: '600', marginTop: 2 },
  detail: { color: colors.textMuted, fontSize: 12, marginTop: 4 },
});
