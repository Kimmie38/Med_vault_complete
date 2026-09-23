import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import SelectField from '../../components/SelectField';
import Stepper from '../../components/Stepper';
import EmptyState from '../../components/EmptyState';
import ScreenHeader from '../../components/ScreenHeader';
import { spacing, type, radius } from '../../theme/theme';
import { useThemedStyles } from '../../theme/ThemeContext';
import { useInventory } from '../../context/InventoryContext';
import { allocateFefo, fefoBatches, groupSales } from '../../utils/inventory';
import { formatDate } from '../../utils/dates';

// Recording a sale (documentation §4.1.4): the app picks the batch with the earliest expiry
// (FEFO), the pharmacist only chooses the drug and quantity. The sale deducts stock and is added
// to the sales history that feeds the demand forecast.
export default function SalesScreen({ navigation, route }) {
  const { colors, styles } = useThemedStyles(createStyles);
  const { drugs, batches, todaySalesRows, recordSale, stockOf } = useInventory();
  const [drugId, setDrugId] = useState(null);
  const [qty, setQty] = useState(1);

  // "Sell first" from an alert pre-selects the drug.
  useEffect(() => {
    if (route?.params?.drugId) {
      setDrugId(route.params.drugId);
      setQty(1);
    }
  }, [route?.params?.drugId]);

  const drug = drugs.find((d) => d.drugId === drugId);
  const available = drug ? stockOf(drug.drugId) : 0;
  const sellable = drug ? fefoBatches(batches, drug.drugId) : [];
  const picks = useMemo(
    () => (drug && available > 0 ? allocateFefo(batches, drug.drugId, Math.min(qty, available)) : null),
    [batches, drug, qty, available]
  );

  // Keep the quantity within what is available after stock changes.
  useEffect(() => {
    if (drug && available > 0 && qty > available) setQty(available);
  }, [available]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRecord = () => {
    if (!drug || available <= 0) return;
    const res = recordSale({ drugId: drug.drugId, quantity: qty });
    if (!res.ok) {
      Alert.alert('Could not record sale', res.error);
      return;
    }
    const from = res.picks.map((p) => `${p.batchNumber} (${p.quantity})`).join(', ');
    Alert.alert('Sale recorded', `${qty} × ${drug.name}\nTaken from batch ${from}.`);
    setQty(1);
  };

  const todayGroups = useMemo(() => groupSales(todaySalesRows, batches), [todaySalesRows, batches]);
  const unitsToday = todayGroups.reduce((s, x) => s + x.quantity, 0);
  const options = drugs.map((d) => ({ value: d.drugId, label: d.name, sub: `${stockOf(d.drugId)} in stock` }));

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenHeader
        title="Record sale"
        subtitle="Stock is deducted automatically, oldest expiry first"
        onBack={() => navigation.goBack()}
        right={
          <Pressable style={styles.historyBtn} onPress={() => navigation.navigate('SalesHistory')} hitSlop={6}>
            <Ionicons name="time-outline" size={18} color={colors.greenLight} />
            <Text style={styles.historyText}>History</Text>
          </Pressable>
        }
      />
      <ScrollView contentContainerStyle={{ paddingBottom: 60 }} keyboardShouldPersistTaps="handled">
        <View style={{ paddingHorizontal: spacing.lg }}>
          <SelectField label="Drug sold" value={drugId} options={options} onSelect={(id) => { setDrugId(id); setQty(1); }} placeholder="Select the drug" icon="medical-outline" />

          {drug && available <= 0 && (
            <Card style={styles.noStock}>
              <Ionicons name="alert-circle-outline" size={22} color={colors.danger} />
              <Text style={styles.noStockText}>No sellable stock for {drug.name}. Expired batches are never sold — add new stock from the Scan tab.</Text>
            </Card>
          )}

          {drug && available > 0 && (
            <>
              <Card style={styles.fefoCard}>
                <View style={styles.fefoTop}>
                  <Text style={styles.fefoLabel}>Batch to sell from</Text>
                  <Badge label="FEFO" tone="success" />
                </View>
                {(picks || [{ batchNumber: sellable[0]?.batchNumber, quantity: qty, expiryDate: sellable[0]?.expiryDate }]).map((p) => (
                  <View key={p.batchNumber} style={styles.pickRow}>
                    <Text style={styles.batchText}>Batch #{p.batchNumber} <Text style={styles.check}>✓ FEFO</Text></Text>
                    <Text style={styles.pickMeta}>{p.quantity} unit{p.quantity === 1 ? '' : 's'} · exp {formatDate(p.expiryDate)}</Text>
                  </View>
                ))}
              </Card>

              <View style={styles.qtyRow}>
                <View>
                  <Text style={styles.qtyLabel}>Quantity</Text>
                  <Text style={styles.qtyHint}>{available} available · {available - qty} left after sale</Text>
                </View>
                <Stepper value={qty} onChange={setQty} min={1} max={available} />
              </View>

              <Button label={`Record sale of ${qty}`} onPress={handleRecord} icon={<Ionicons name="checkmark-circle-outline" size={20} color="#F2FFFA" />} />
            </>
          )}
        </View>

        <View style={styles.logHeader}>
          <Text style={styles.sectionTitle}>Today's sales</Text>
          <Text style={styles.sectionMeta}>{todayGroups.length} sale{todayGroups.length !== 1 ? 's' : ''} · {unitsToday} units</Text>
        </View>

        {todayGroups.length === 0 ? (
          <EmptyState icon="receipt-outline" tint={colors.textMuted} title="No sales yet today" subtitle="Sales you record will appear here." />
        ) : (
          <View style={{ paddingHorizontal: spacing.lg }}>
            {todayGroups.map((g) => {
              const d = drugs.find((x) => x.drugId === g.drugId);
              return (
                <View key={g.key} style={styles.logRow}>
                  <View style={styles.logIcon}>
                    <Ionicons name="checkmark" size={16} color={colors.greenLight} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.logName}>{d ? d.name : 'Unknown drug'}</Text>
                    <Text style={styles.logMeta}>{g.time} · Batch {g.batches.map((b) => b.batchNumber).join(', ')}</Text>
                  </View>
                  <Text style={styles.logQty}>× {g.quantity}</Text>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const createStyles = (colors, theme) => StyleSheet.create({
  historyBtn: { flexDirection: 'row', gap: 5, alignItems: 'center', paddingHorizontal: 12, height: 36, borderRadius: 18, backgroundColor: colors.bgElevated2, borderWidth: 1, borderColor: colors.border },
  historyText: { color: colors.greenLight, fontSize: 12.5, fontWeight: '700' },
  noStock: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center', borderColor: colors.danger },
  noStockText: { flex: 1, color: colors.textSecondary, fontSize: 12.5, lineHeight: 18 },
  fefoCard: { borderColor: colors.green, marginBottom: spacing.md },
  fefoTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  fefoLabel: { color: colors.textSecondary, fontSize: 12.5, fontWeight: '600' },
  pickRow: { paddingVertical: 6 },
  batchText: { color: colors.textPrimary, fontSize: 15, fontWeight: '700' },
  check: { color: colors.success, fontSize: 13 },
  pickMeta: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  qtyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  qtyLabel: { color: colors.textPrimary, fontSize: 15, fontWeight: '700' },
  qtyHint: { color: colors.textMuted, fontSize: 11.5, marginTop: 3 },
  logHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, marginTop: spacing.xl, marginBottom: spacing.sm },
  sectionTitle: { color: colors.textPrimary, ...type.h3 },
  sectionMeta: { color: colors.textMuted, fontSize: 12 },
  logRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.bgElevated, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md, marginBottom: spacing.sm },
  logIcon: { width: 30, height: 30, borderRadius: 15, backgroundColor: colors.greenTintStrong, alignItems: 'center', justifyContent: 'center' },
  logName: { color: colors.textPrimary, fontSize: 14, fontWeight: '600' },
  logMeta: { color: colors.textMuted, fontSize: 11.5, marginTop: 2 },
  logQty: { color: colors.greenLight, fontSize: 15, fontWeight: '800' },
});
