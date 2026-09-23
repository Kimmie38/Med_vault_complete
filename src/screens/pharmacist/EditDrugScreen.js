import React, { useState } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import Input from '../../components/Input';
import Button from '../../components/Button';
import ScreenHeader from '../../components/ScreenHeader';
import SelectField from '../../components/SelectField';
import { spacing } from '../../theme/theme';
import { useTheme } from '../../theme/ThemeContext';
import { useInventory } from '../../context/InventoryContext';
import { drugCategories } from '../../data/mockData';

// Update a drug record (functional requirement a). The reorder level is the pharmacist-defined
// low-stock threshold (Table 3.1, row 5).
export default function EditDrugScreen({ navigation, route }) {
  const { colors } = useTheme();
  const { drugs, updateDrug, stockOf } = useInventory();
  const drug = drugs.find((d) => d.drugId === route.params?.drugId);

  const [form, setForm] = useState({
    name: drug?.name ?? '',
    category: drug?.category ?? '',
    barcode: drug?.barcode ?? '',
    reorderLevel: String(drug?.reorderLevel ?? ''),
  });
  const [errors, setErrors] = useState({});
  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  if (!drug) return null;

  const save = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Enter the drug name';
    if (!form.category) e.category = 'Choose a category';
    if (form.reorderLevel === '' || Number(form.reorderLevel) < 0) e.reorderLevel = 'Enter a reorder level (0 or more)';
    setErrors(e);
    if (Object.keys(e).length) return;
    updateDrug(drug.drugId, {
      name: form.name.trim(),
      category: form.category,
      barcode: form.barcode.trim(),
      reorderLevel: Number(form.reorderLevel),
    });
    Alert.alert('Drug updated', `${form.name.trim()} has been saved.`, [{ text: 'OK', onPress: () => navigation.goBack() }]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenHeader title="Edit drug" subtitle={`${stockOf(drug.drugId)} units in stock`} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: 60 }} keyboardShouldPersistTaps="handled">
        <Input label="Drug name" value={form.name} onChangeText={set('name')} icon="medical-outline" error={errors.name} />
        <SelectField label="Category" value={form.category} options={drugCategories.map((c) => ({ value: c, label: c }))} onSelect={set('category')} icon="pricetag-outline" error={errors.category} />
        <Input label="Barcode" placeholder="Digits under the barcode" value={form.barcode} onChangeText={set('barcode')} icon="barcode-outline" keyboardType="numeric" />
        <Input label="Reorder level" placeholder="Flag as low stock below this quantity" value={form.reorderLevel} onChangeText={(v) => set('reorderLevel')(v.replace(/[^0-9]/g, ''))} icon="layers-outline" keyboardType="numeric" error={errors.reorderLevel} />
        <Button label="Save changes" onPress={save} style={{ marginTop: spacing.md }} />
      </ScrollView>
    </View>
  );
}
