import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import Input from '../../components/Input';
import Button from '../../components/Button';
import ScreenHeader from '../../components/ScreenHeader';
import SelectField from '../../components/SelectField';
import DateField from '../../components/DateField';
import { spacing, type } from '../../theme/theme';
import { useThemedStyles } from '../../theme/ThemeContext';
import { useInventory } from '../../context/InventoryContext';

// Update a stock batch record (functional requirement a): correct a typo in the batch number,
// quantity or expiry date, or change the supplier.
export default function EditBatchScreen({ navigation, route }) {
  const { colors, styles } = useThemedStyles(createStyles);
  const { batches, drugs, suppliers, updateBatch } = useInventory();
  const batch = batches.find((b) => b.batchId === route.params?.batchId);
  const drug = batch ? drugs.find((d) => d.drugId === batch.drugId) : null;

  const [form, setForm] = useState({
    supplierId: batch?.supplierId ?? null,
    batchNumber: batch?.batchNumber ?? '',
    quantity: String(batch?.quantity ?? ''),
    expiryDate: batch?.expiryDate ?? '',
    dateReceived: batch?.dateReceived ?? '',
  });
  const [errors, setErrors] = useState({});
  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  if (!batch || !drug) return null;

  const save = () => {
    const e = {};
    if (!form.supplierId) e.supplierId = 'Choose a supplier';
    if (!form.batchNumber.trim()) e.batchNumber = 'Enter the batch number';
    const qty = Number(form.quantity);
    if (form.quantity === '' || !Number.isInteger(qty) || qty < 0) e.quantity = 'Enter a whole number (0 or more)';
    if (!form.expiryDate) e.expiryDate = 'Pick the expiry date';
    const clash = batches.some(
      (b) => b.batchId !== batch.batchId && b.drugId === batch.drugId && b.quantity > 0 && b.batchNumber.toLowerCase() === form.batchNumber.trim().toLowerCase()
    );
    if (!e.batchNumber && clash) e.batchNumber = 'Another batch of this drug already has this number';
    setErrors(e);
    if (Object.keys(e).length) return;

    updateBatch(batch.batchId, {
      supplierId: form.supplierId,
      batchNumber: form.batchNumber.trim(),
      quantity: qty,
      expiryDate: form.expiryDate,
      dateReceived: form.dateReceived,
    });
    Alert.alert('Batch updated', `Batch ${form.batchNumber.trim()} has been saved.`, [{ text: 'OK', onPress: () => navigation.goBack() }]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenHeader title="Edit batch" subtitle={drug.name} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: 60 }} keyboardShouldPersistTaps="handled">
        <SelectField
          label="Supplier"
          value={form.supplierId}
          options={suppliers.map((s) => ({ value: s.supplierId, label: s.name, sub: s.address }))}
          onSelect={set('supplierId')}
          icon="business-outline"
          error={errors.supplierId}
        />
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Input label="Batch number" value={form.batchNumber} onChangeText={set('batchNumber')} icon="pricetag-outline" autoCapitalize="characters" error={errors.batchNumber} />
          </View>
          <View style={{ width: spacing.sm }} />
          <View style={{ flex: 1 }}>
            <Input label="Quantity" value={form.quantity} onChangeText={(v) => set('quantity')(v.replace(/[^0-9]/g, ''))} icon="layers-outline" keyboardType="numeric" error={errors.quantity} />
          </View>
        </View>
        <DateField label="Expiry date" value={form.expiryDate} onChange={set('expiryDate')} error={errors.expiryDate} />
        <DateField label="Date received" value={form.dateReceived} onChange={set('dateReceived')} />
        <Text style={styles.hint}>Changing the expiry date or quantity updates this batch's alerts straight away.</Text>
        <Button label="Save changes" onPress={save} style={{ marginTop: spacing.lg }} />
      </ScrollView>
    </View>
  );
}

const createStyles = (colors, theme) => StyleSheet.create({
  row: { flexDirection: 'row' },
  hint: { color: colors.textMuted, ...type.small, lineHeight: 17 },
});
