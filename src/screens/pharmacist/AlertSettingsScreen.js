import React from 'react';
import { View, Text, StyleSheet, ScrollView, Switch } from 'react-native';
import Card from '../../components/Card';
import ScreenHeader from '../../components/ScreenHeader';
import { spacing, type } from '../../theme/theme';
import { useThemedStyles } from '../../theme/ThemeContext';
import { useInventory } from '../../context/InventoryContext';
import { TIER_THRESHOLDS } from '../../utils/inventory';

// How alerts work (documentation §3.4.3.2). The expiry tiers are fixed system rules; the
// pharmacist-defined threshold is each drug's reorder level, edited from Inventory > Drugs.
export default function AlertSettingsScreen({ navigation }) {
  const { colors, styles } = useThemedStyles(createStyles);
  const { settings, updateSettings } = useInventory();

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenHeader title="Alert settings" subtitle="How MedVault flags stock" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: 60 }}>
        <Card style={{ gap: spacing.md }}>
          <Tier color={colors.danger} title="Expired" rule="Expiry date has passed" />
          <Tier color={colors.danger} title="Critical" rule={`Expires within ${TIER_THRESHOLDS.critical} days`} />
          <Tier color={colors.warning} title="Warning" rule={`Expires within ${TIER_THRESHOLDS.warning} days`} />
          <Tier color={colors.info} title="Upcoming" rule={`Expires within ${TIER_THRESHOLDS.upcoming} days`} />
          <Tier color={colors.warning} title="Low stock" rule="Sellable stock is below the drug's reorder level" last />
        </Card>
        <Text style={styles.note}>Set each drug's reorder level from Home › Inventory › Drugs. Expired batches are never counted as sellable stock.</Text>

        <Card style={styles.switchCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowTitle}>Push notifications</Text>
            <Text style={styles.hint}>Get notified when a batch reaches a new alert tier or stock runs low.</Text>
          </View>
          <Switch
            value={settings.pushEnabled}
            onValueChange={(v) => updateSettings({ pushEnabled: v })}
            trackColor={{ false: colors.bgElevated2, true: colors.green }}
            thumbColor="#fff"
          />
        </Card>
        <Text style={styles.note}>Notification delivery is switched on with the backend; this setting is saved for then.</Text>
      </ScrollView>
    </View>
  );
}

function Tier({ color, title, rule, last }) {
  const { styles } = useThemedStyles(createStyles);
  return (
    <View style={[styles.tierRow, !last && styles.tierBorder]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <View style={{ flex: 1 }}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.hint}>{rule}</Text>
      </View>
    </View>
  );
}

const createStyles = (colors, theme) => StyleSheet.create({
  tierRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingBottom: spacing.md },
  tierBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  dot: { width: 12, height: 12, borderRadius: 6 },
  rowTitle: { color: colors.textPrimary, ...type.h3 },
  hint: { color: colors.textMuted, fontSize: 11.5, marginTop: 3, lineHeight: 16 },
  note: { color: colors.textMuted, fontSize: 11.5, lineHeight: 16, marginTop: spacing.sm, marginBottom: spacing.lg },
  switchCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
});
