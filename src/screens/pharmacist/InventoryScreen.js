import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, TextInput, Share, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import EmptyState from '../../components/EmptyState';
import SegmentedControl from '../../components/SegmentedControl';
import ScreenHeader from '../../components/ScreenHeader';
import { spacing, radius } from '../../theme/theme';
import { useThemedStyles } from '../../theme/ThemeContext';
import { useInventory } from '../../context/InventoryContext';
import { TIERS, buildInventoryCsv, getTier, usableStock } from '../../utils/inventory';
import { daysUntil, formatDate } from '../../utils/dates';

export default function InventoryScreen({ navigation }) {
  const { colors, styles } = useThemedStyles(createStyles);
  const { drugs, batches, suppliers } = useInventory();
  const [view, setView] = useState('batches');
  const [query, setQuery] = useState('');

  const q = query.trim().toLowerCase();

  // Batches closest to expiry / most urgent tier are surfaced first (documentation §3.4.3.2).
  const batchRows = useMemo(() => {
    return batches
      .filter((b) => b.quantity > 0)
      .map((b) => {
        const drug = drugs.find((d) => d.drugId === b.drugId);
        const supplier = suppliers.find((s) => s.supplierId === b.supplierId);
        const days = daysUntil(b.expiryDate);
        return { ...b, drug, supplier, days, tier: getTier(days) };
      })
      .filter((b) => b.drug && (b.drug.name.toLowerCase().includes(q) || b.batchNumber.toLowerCase().includes(q)))
      .sort((a, b) => TIERS[a.tier].rank - TIERS[b.tier].rank || a.days - b.days);
  }, [batches, drugs, suppliers, q]);

  const drugRows = useMemo(() => {
    return drugs
      .filter((d) => d.name.toLowerCase().includes(q) || d.category.toLowerCase().includes(q))
      .map((d) => ({ ...d, stock: usableStock(batches, d.drugId) }))
      .sort((a, b) => Number(b.stock < b.reorderLevel) - Number(a.stock < a.reorderLevel) || a.name.localeCompare(b.name));
  }, [drugs, batches, q]);

  const exportCsv = async () => {
    try {
      await Share.share({ title: 'MedVault inventory', message: buildInventoryCsv({ drugs, batches, suppliers }) });
    } catch (e) {
      Alert.alert('Export failed', 'Could not open the share sheet.');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenHeader
        title="Inventory"
        subtitle="Tap a batch or drug to edit it"
        onBack={() => navigation.goBack()}
        right={
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <Pressable style={styles.iconBtn} onPress={exportCsv} hitSlop={6}>
              <Ionicons name="download-outline" size={20} color={colors.greenLight} />
            </Pressable>
            <Pressable style={styles.addBtn} onPress={() => navigation.navigate('Scan')}>
              <Ionicons name="add" size={22} color="#fff" />
            </Pressable>
          </View>
        }
      />

      <SegmentedControl
        value={view}
        onChange={setView}
        options={[{ value: 'batches', label: `Batches (${batchRows.length})` }, { value: 'drugs', label: `Drugs (${drugRows.length})` }]}
      />

      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color={colors.textMuted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={view === 'batches' ? 'Search drug or batch number...' : 'Search drugs or categories...'}
          placeholderTextColor={colors.textMuted}
          style={styles.searchInput}
        />
      </View>

      {view === 'batches' ? (
        <FlatList
          data={batchRows}
          keyExtractor={(b) => b.batchId}
          contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: 40 }}
          ListEmptyComponent={<EmptyState icon="cube-outline" tint={colors.textMuted} title="No batches found" subtitle="Add stock from the Scan tab." />}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
          renderItem={({ item }) => (
            <Pressable onPress={() => navigation.navigate('EditBatch', { batchId: item.batchId })}>
              <Card style={styles.row}>
                <View style={styles.iconWrap}>
                  <Ionicons name="medical-outline" size={20} color={colors.greenLight} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.drugName}>{item.drug.name}</Text>
                  <Text style={styles.meta}>Batch {item.batchNumber} · Qty {item.quantity}</Text>
                  <Text style={styles.meta}>
                    Exp {formatDate(item.expiryDate)}
                    {item.days >= 0 ? ` · ${item.days}d left` : ` · ${Math.abs(item.days)}d ago`}
                  </Text>
                  {item.supplier ? <Text style={styles.meta}>{item.supplier.name}</Text> : null}
                </View>
                <View style={{ alignItems: 'flex-end', gap: 8 }}>
                  <Badge label={TIERS[item.tier].label} tone={TIERS[item.tier].tone} />
                  <Ionicons name="create-outline" size={16} color={colors.textMuted} />
                </View>
              </Card>
            </Pressable>
          )}
        />
      ) : (
        <FlatList
          data={drugRows}
          keyExtractor={(d) => d.drugId}
          contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: 40 }}
          ListEmptyComponent={<EmptyState icon="medical-outline" tint={colors.textMuted} title="No drugs found" />}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
          renderItem={({ item }) => {
            const low = item.stock < item.reorderLevel;
            return (
              <Pressable onPress={() => navigation.navigate('EditDrug', { drugId: item.drugId })}>
                <Card style={styles.row}>
                  <View style={styles.iconWrap}>
                    <Ionicons name="medkit-outline" size={20} color={colors.greenLight} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.drugName}>{item.name}</Text>
                    <Text style={styles.meta}>{item.category}</Text>
                    <Text style={styles.meta}>In stock {item.stock} · reorder level {item.reorderLevel}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 8 }}>
                    <Badge label={low ? 'Low stock' : 'In stock'} tone={low ? 'danger' : 'success'} />
                    <Pressable onPress={() => navigation.navigate('Forecast', { drugId: item.drugId })} hitSlop={8}>
                      <Ionicons name="trending-up-outline" size={18} color={colors.greenLight} />
                    </Pressable>
                  </View>
                </Card>
              </Pressable>
            );
          }}
        />
      )}
    </View>
  );
}

const createStyles = (colors, theme) => StyleSheet.create({
  iconBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.bgElevated2, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  addBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.green, alignItems: 'center', justifyContent: 'center' },
  searchBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.bgElevated2, marginHorizontal: spacing.lg, borderRadius: radius.md, paddingHorizontal: spacing.md, height: 46, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border },
  searchInput: { flex: 1, color: colors.textPrimary, fontSize: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  iconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.greenTint, alignItems: 'center', justifyContent: 'center' },
  drugName: { color: colors.textPrimary, fontSize: 14, fontWeight: '700' },
  meta: { color: colors.textMuted, fontSize: 11.5, marginTop: 2 },
});
