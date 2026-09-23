import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import ScreenHeader from '../../components/ScreenHeader';
import SelectField from '../../components/SelectField';
import DateField from '../../components/DateField';
import { spacing, type, radius } from '../../theme/theme';
import { useThemedStyles } from '../../theme/ThemeContext';
import { useInventory } from '../../context/InventoryContext';
import { drugCategories } from '../../data/mockData';
import { addDays, daysUntil, formatDate, fromISO, todayISO } from '../../utils/dates';

const NEW_SUPPLIER = '__new__';

const emptyForm = () => ({
  batchNumber: '',
  quantity: '',
  expiryDate: '',
  dateReceived: todayISO(),
});

// Stock entry (documentation §4.1.2). Reached from the Scan tab:
//   1. scan the barcode  -> drug name + category are auto-filled from the drug record
//   2. enter supplier, batch number, quantity, expiry date (native date picker)
//   3. add more drugs from the same delivery, then save them all in one go (bulk entry)
export default function DataInputScreen({ navigation, route }) {
  const { colors, styles } = useThemedStyles(createStyles);
  const { drugs, suppliers, batches, addDrug, addSupplier, addBatches } = useInventory();

  // Drug selection
  const [barcode, setBarcode] = useState('');
  const [drugId, setDrugId] = useState(null);
  const [autoFilled, setAutoFilled] = useState(false);
  const [unknownCode, setUnknownCode] = useState(false); // scanned a barcode we have no record of
  const [newDrug, setNewDrug] = useState({ name: '', category: '', reorderLevel: '' });

  // Batch details
  const [supplierId, setSupplierId] = useState(null);
  const [newSupplierName, setNewSupplierName] = useState('');
  const [form, setForm] = useState(emptyForm());
  const [errors, setErrors] = useState({});

  // Bulk delivery: entries waiting to be saved together
  const [staged, setStaged] = useState([]);

  const drug = drugs.find((d) => d.drugId === drugId);
  const isNewDrug = !drug && (unknownCode || newDrug.name.length > 0);
  const update = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  // A code arrives from the scanner screen.
  useEffect(() => {
    const code = route.params?.scannedCode;
    if (!code) return;
    const match = drugs.find((d) => d.barcode === code);
    setBarcode(code);
    if (match) {
      setDrugId(match.drugId);
      setAutoFilled(true);
      setUnknownCode(false);
    } else {
      setDrugId(null);
      setAutoFilled(false);
      setUnknownCode(true);
    }
    navigation.setParams({ scannedCode: undefined });
  }, [route.params?.scannedCode]); // eslint-disable-line react-hooks/exhaustive-deps

  const pickFromList = (id) => {
    const d = drugs.find((x) => x.drugId === id);
    setDrugId(id);
    setBarcode(d ? d.barcode : '');
    setAutoFilled(false);
    setUnknownCode(false);
  };

  const clearDrug = () => {
    setDrugId(null);
    setBarcode('');
    setAutoFilled(false);
    setUnknownCode(false);
    setNewDrug({ name: '', category: '', reorderLevel: '' });
  };

  const formHasData = !!(drugId || unknownCode || newDrug.name || form.batchNumber || form.quantity || form.expiryDate);

  // Validates the current form and returns a draft entry (or null and sets errors).
  const buildEntry = () => {
    const e = {};
    if (!drug && !isNewDrug) e.drug = 'Scan a barcode or choose a drug';
    if (isNewDrug) {
      if (!newDrug.name.trim()) e.newName = 'Enter the drug name';
      if (!newDrug.category) e.newCategory = 'Choose a category';
      if (!(Number(newDrug.reorderLevel) > 0)) e.newReorder = 'Set a reorder level';
    }
    if (!supplierId) e.supplier = 'Choose a supplier';
    if (supplierId === NEW_SUPPLIER && !newSupplierName.trim()) e.newSupplier = 'Enter the supplier name';
    if (!form.batchNumber.trim()) e.batchNumber = 'Enter the batch number';
    const qty = Number(form.quantity);
    if (!Number.isInteger(qty) || qty <= 0) e.quantity = 'Enter a whole number above 0';
    if (!form.expiryDate) e.expiryDate = 'Pick the expiry date';
    else if (daysUntil(form.expiryDate) < 0) e.expiryDate = 'This date has already passed';

    // Same batch number for the same drug already recorded?
    const bn = form.batchNumber.trim().toLowerCase();
    if (!e.batchNumber && bn) {
      const dupInStock = drug && batches.some((b) => b.drugId === drug.drugId && b.batchNumber.toLowerCase() === bn && b.quantity > 0);
      const key = drug ? drug.drugId : `new:${(barcode || newDrug.name).toLowerCase()}`;
      const dupStaged = staged.some((s) => s.drugKey === key && s.batchNumber.toLowerCase() === bn);
      if (dupInStock || dupStaged) e.batchNumber = 'This batch number is already recorded for this drug';
    }

    setErrors(e);
    if (Object.keys(e).length) return null;

    const supplierName = supplierId === NEW_SUPPLIER ? newSupplierName.trim() : suppliers.find((s) => s.supplierId === supplierId)?.name;
    return {
      key: `${Date.now()}-${Math.random()}`,
      drugKey: drug ? drug.drugId : `new:${(barcode || newDrug.name).toLowerCase()}`,
      drugId: drug ? drug.drugId : null,
      newDrug: drug ? null : { name: newDrug.name.trim(), category: newDrug.category, reorderLevel: Number(newDrug.reorderLevel), barcode },
      drugName: drug ? drug.name : newDrug.name.trim(),
      supplierId: supplierId === NEW_SUPPLIER ? null : supplierId,
      newSupplierName: supplierId === NEW_SUPPLIER ? newSupplierName.trim() : '',
      supplierName,
      batchNumber: form.batchNumber.trim(),
      quantity: qty,
      expiryDate: form.expiryDate,
      dateReceived: form.dateReceived || todayISO(),
    };
  };

  // Keep the supplier + received date (usually the same for the whole delivery) and clear the rest.
  const resetForNext = () => {
    clearDrug();
    setForm((f) => ({ ...emptyForm(), dateReceived: f.dateReceived }));
    setErrors({});
  };

  const handleAddToDelivery = () => {
    const entry = buildEntry();
    if (!entry) return;
    setStaged((prev) => [...prev, entry]);
    resetForNext();
  };

  const handleSave = () => {
    let entries = [...staged];
    if (formHasData) {
      const entry = buildEntry();
      if (!entry) return;
      entries = [...entries, entry];
    }
    if (!entries.length) {
      setErrors({ drug: 'Scan a barcode or choose a drug' });
      return;
    }

    // Create any new drugs / suppliers once, then record the batches.
    const drugMap = {};
    const supplierMap = {};
    const list = entries.map((en) => {
      let dId = en.drugId;
      if (!dId) {
        if (!drugMap[en.drugKey]) drugMap[en.drugKey] = addDrug(en.newDrug).drugId;
        dId = drugMap[en.drugKey];
      }
      let sId = en.supplierId;
      if (!sId) {
        const k = en.newSupplierName.toLowerCase();
        if (!supplierMap[k]) supplierMap[k] = addSupplier({ name: en.newSupplierName }).supplierId;
        sId = supplierMap[k];
      }
      return { drugId: dId, supplierId: sId, batchNumber: en.batchNumber, quantity: en.quantity, expiryDate: en.expiryDate, dateReceived: en.dateReceived };
    });
    addBatches(list);

    setStaged([]);
    resetForNext();
    setSupplierId(null);
    setNewSupplierName('');
    Alert.alert(
      list.length > 1 ? 'Delivery saved' : 'Batch saved',
      `${list.length} batch${list.length > 1 ? 'es have' : ' has'} been added to your inventory.`,
      [
        { text: 'Add more', style: 'cancel' },
        { text: 'View inventory', onPress: () => navigation.navigate('Home', { screen: 'Inventory' }) },
      ]
    );
  };

  const totalToSave = staged.length + (formHasData ? 1 : 0);

  const supplierOptions = [
    ...suppliers.map((s) => ({ value: s.supplierId, label: s.name, sub: s.address })),
    { value: NEW_SUPPLIER, label: '+ New supplier' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenHeader title="Add stock" subtitle="Scan a drug, then enter the batch details" />
      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: 60 }} keyboardShouldPersistTaps="handled">

        {staged.length > 0 && (
          <Card style={styles.stagedCard}>
            <Text style={styles.stagedTitle}>This delivery · {staged.length} batch{staged.length > 1 ? 'es' : ''} waiting</Text>
            {staged.map((s) => (
              <View key={s.key} style={styles.stagedRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.stagedName}>{s.drugName}</Text>
                  <Text style={styles.stagedMeta}>Batch {s.batchNumber} · Qty {s.quantity} · Exp {formatDate(s.expiryDate)}</Text>
                </View>
                <Pressable onPress={() => setStaged((prev) => prev.filter((x) => x.key !== s.key))} hitSlop={8}>
                  <Ionicons name="close-circle" size={20} color={colors.textMuted} />
                </Pressable>
              </View>
            ))}
          </Card>
        )}

        {/* 1. Drug */}
        <Text style={styles.label}>Drug</Text>
        {drug ? (
          <Card style={styles.drugCard}>
            <View style={styles.drugIcon}>
              <Ionicons name="medical" size={20} color={colors.greenLight} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.drugName}>{drug.name}</Text>
              <Text style={styles.drugMeta}>{drug.category}{barcode ? ` · ${barcode}` : ''}</Text>
              {autoFilled && (
                <View style={styles.autoRow}>
                  <Ionicons name="checkmark-circle" size={14} color={colors.success} />
                  <Text style={styles.autoText}>Auto-filled from drug record</Text>
                </View>
              )}
            </View>
            <Pressable onPress={clearDrug} hitSlop={8}>
              <Text style={styles.change}>Change</Text>
            </Pressable>
          </Card>
        ) : (
          <>
            <Pressable style={[styles.scanBox, errors.drug && { borderColor: colors.danger }]} onPress={() => navigation.navigate('ScanBatchCode')}>
              <View style={styles.scanIconWrap}>
                <Ionicons name="barcode-outline" size={22} color={colors.greenLight} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.scanTitle}>Scan barcode / QR code</Text>
                <Text style={styles.scanSub}>Fills in the drug name and category for you</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </Pressable>
            {errors.drug ? <Text style={styles.errorText}>{errors.drug}</Text> : null}

            {!unknownCode && (
              <View style={{ marginTop: spacing.md }}>
                <SelectField
                  label="Or choose from your drug list"
                  value={drugId}
                  options={drugs.map((d) => ({ value: d.drugId, label: d.name, sub: d.category }))}
                  onSelect={pickFromList}
                  placeholder="Select a drug"
                  icon="medical-outline"
                />
                <Pressable onPress={() => setUnknownCode(true)} style={{ marginTop: -4, marginBottom: spacing.sm }}>
                  <Text style={styles.linkText}>Drug not in the list? Add it as a new drug</Text>
                </Pressable>
              </View>
            )}

            {unknownCode && (
              <Card style={styles.newDrugCard}>
                <View style={styles.newDrugHeader}>
                  <Badge label="New drug" tone="info" />
                  <Pressable onPress={clearDrug} hitSlop={8}><Text style={styles.change}>Cancel</Text></Pressable>
                </View>
                <Text style={styles.newDrugNote}>
                  {barcode ? `No record found for barcode ${barcode}. ` : ''}Enter the details once — next time the barcode fills them in.
                </Text>
                <Input label="Drug name" placeholder="e.g. Amoxicillin 500mg" value={newDrug.name} onChangeText={(v) => setNewDrug((n) => ({ ...n, name: v }))} icon="medical-outline" error={errors.newName} />
                <SelectField label="Category" value={newDrug.category} options={drugCategories.map((c) => ({ value: c, label: c }))} onSelect={(v) => setNewDrug((n) => ({ ...n, category: v }))} placeholder="Choose a category" icon="pricetag-outline" error={errors.newCategory} />
                {!barcode && (
                  <Input label="Barcode (optional)" placeholder="Digits under the barcode" value={barcode} onChangeText={setBarcode} icon="barcode-outline" keyboardType="numeric" />
                )}
                <Input label="Reorder level" placeholder="Flag as low stock below this quantity" value={newDrug.reorderLevel} onChangeText={(v) => setNewDrug((n) => ({ ...n, reorderLevel: v.replace(/[^0-9]/g, '') }))} icon="layers-outline" keyboardType="numeric" error={errors.newReorder} />
              </Card>
            )}
          </>
        )}

        {/* 2. Batch details */}
        <Text style={[styles.label, { marginTop: spacing.md }]}>Batch details</Text>
        <SelectField label="Supplier" value={supplierId} options={supplierOptions} onSelect={setSupplierId} placeholder="Choose a supplier" icon="business-outline" error={errors.supplier} />
        {supplierId === NEW_SUPPLIER && (
          <Input label="New supplier name" placeholder="e.g. Fidson Healthcare" value={newSupplierName} onChangeText={setNewSupplierName} icon="business-outline" error={errors.newSupplier} />
        )}

        <View style={styles.dateRow}>
          <View style={{ flex: 1 }}>
            <Input label="Batch number" placeholder="e.g. P2207" value={form.batchNumber} onChangeText={update('batchNumber')} icon="pricetag-outline" autoCapitalize="characters" error={errors.batchNumber} />
          </View>
          <View style={{ width: spacing.sm }} />
          <View style={{ flex: 1 }}>
            <Input label="Quantity" placeholder="0" value={form.quantity} onChangeText={(v) => update('quantity')(v.replace(/[^0-9]/g, ''))} icon="layers-outline" keyboardType="numeric" error={errors.quantity} />
          </View>
        </View>

        <DateField label="Expiry date" value={form.expiryDate} onChange={update('expiryDate')} minimumDate={fromISO(addDays(todayISO(), 1))} error={errors.expiryDate} />
        <DateField label="Date received" value={form.dateReceived} onChange={update('dateReceived')} />

        <Text style={styles.hint}>
          Expiry dates are printed on the pack, not in the barcode, so they are entered once per batch delivery.
        </Text>

        <Button label="Add another drug from this delivery" variant="outline" icon={<Ionicons name="add-circle-outline" size={18} color={colors.greenLight} />} onPress={handleAddToDelivery} style={{ marginTop: spacing.lg }} />
        <Button
          label={totalToSave > 1 ? `Save delivery (${totalToSave} batches)` : 'Save batch'}
          onPress={handleSave}
          style={{ marginTop: spacing.sm }}
        />
      </ScrollView>
    </View>
  );
}

const createStyles = (colors, theme) => StyleSheet.create({
  label: { color: colors.textSecondary, ...type.small, marginBottom: 8, marginTop: spacing.sm, fontWeight: '600' },
  scanBox: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.bgElevated, borderWidth: 1.5, borderColor: colors.green, borderStyle: 'dashed', borderRadius: radius.md, padding: spacing.md },
  scanIconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.greenTintStrong, alignItems: 'center', justifyContent: 'center' },
  scanTitle: { color: colors.textPrimary, fontSize: 14, fontWeight: '700' },
  scanSub: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  errorText: { color: colors.danger, ...type.small, marginTop: 4 },
  drugCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderColor: colors.green },
  drugIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.greenTintStrong, alignItems: 'center', justifyContent: 'center' },
  drugName: { color: colors.textPrimary, fontSize: 15, fontWeight: '700' },
  drugMeta: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  autoRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6 },
  autoText: { color: colors.success, fontSize: 11.5, fontWeight: '600' },
  change: { color: colors.greenLight, fontSize: 12.5, fontWeight: '700' },
  linkText: { color: colors.greenLight, fontSize: 12.5, fontWeight: '600' },
  newDrugCard: { marginTop: spacing.md },
  newDrugHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  newDrugNote: { color: colors.textMuted, fontSize: 12, lineHeight: 17, marginTop: spacing.sm, marginBottom: spacing.md },
  dateRow: { flexDirection: 'row' },
  hint: { color: colors.textMuted, fontSize: 11.5, lineHeight: 16 },
  stagedCard: { marginBottom: spacing.md, borderColor: colors.teal },
  stagedTitle: { color: colors.textPrimary, fontSize: 13, fontWeight: '700', marginBottom: spacing.sm },
  stagedRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderTopWidth: 1, borderTopColor: colors.border },
  stagedName: { color: colors.textPrimary, fontSize: 13, fontWeight: '600' },
  stagedMeta: { color: colors.textMuted, fontSize: 11.5, marginTop: 2 },
});
