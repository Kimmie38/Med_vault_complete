import React, { useMemo } from 'react';
import { View, Text, StyleSheet, SectionList } from 'react-native';
import ScreenHeader from '../../components/ScreenHeader';
import EmptyState from '../../components/EmptyState';
import { spacing, radius } from '../../theme/theme';
import { useThemedStyles } from '../../theme/ThemeContext';
import { useInventory } from '../../context/InventoryContext';
import { groupSales } from '../../utils/inventory';
import { addDays, formatDate, todayISO } from '../../utils/dates';

const DAYS = 30;

// Historical dispensing data (functional requirement f): every sale from the last 30 days,
// newest first, grouped by day.
export default function SalesHistoryScreen({ navigation }) {
  const { colors, styles } = useThemedStyles(createStyles);
  const { sales, batches, drugs } = useInventory();

  const sections = useMemo(() => {
    const since = addDays(todayISO(), -DAYS);
    const rows = groupSales(sales, batches).filter((g) => g.date >= since);
    const byDate = {};
    rows.forEach((g) => { (byDate[g.date] = byDate[g.date] || []).push(g); });
    return Object.keys(byDate)
      .sort()
      .reverse()
      .map((date) => ({
        date,
        total: byDate[date].reduce((s, g) => s + g.quantity, 0),
        data: byDate[date],
      }));
  }, [sales, batches]);

  const totalUnits = sections.reduce((s, x) => s + x.total, 0);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenHeader title="Sales history" subtitle={`Last ${DAYS} days · ${totalUnits} units dispensed`} onBack={() => navigation.goBack()} />
      <SectionList
        sections={sections}
        keyExtractor={(g) => g.key}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: 40 }}
        stickySectionHeadersEnabled={false}
        ListEmptyComponent={<EmptyState icon="receipt-outline" tint={colors.textMuted} title="No sales yet" subtitle="Recorded sales will appear here." />}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{section.date === todayISO() ? 'Today' : formatDate(section.date)}</Text>
            <Text style={styles.sectionMeta}>{section.total} units</Text>
          </View>
        )}
        renderItem={({ item }) => {
          const d = drugs.find((x) => x.drugId === item.drugId);
          return (
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{d ? d.name : 'Unknown drug'}</Text>
                <Text style={styles.meta}>{item.time} · Batch {item.batches.map((b) => b.batchNumber).join(', ')}</Text>
              </View>
              <Text style={styles.qty}>× {item.quantity}</Text>
            </View>
          );
        }}
      />
    </View>
  );
}

const createStyles = (colors, theme) => StyleSheet.create({
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: spacing.md, paddingBottom: spacing.sm },
  sectionTitle: { color: colors.textPrimary, fontSize: 14, fontWeight: '700' },
  sectionMeta: { color: colors.textMuted, fontSize: 12 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bgElevated, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md, marginBottom: spacing.sm },
  name: { color: colors.textPrimary, fontSize: 14, fontWeight: '600' },
  meta: { color: colors.textMuted, fontSize: 11.5, marginTop: 2 },
  qty: { color: colors.greenLight, fontSize: 15, fontWeight: '800' },
});
