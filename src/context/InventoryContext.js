import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, getToken, subscribeAuth } from '../api/client';

const InventoryContext = createContext(null);
const DEFAULT_SETTINGS = { lowStockEnabled: true, expiryEnabled: true, pushEnabled: false, leadTimeWeeks: 2 };
const withAlertAliases = (alert) => ({ ...alert, tier: alert.tier || alert.alertTier, type: alert.type || alert.alertType });

export function InventoryProvider({ children }) {
  const [profile, setProfile] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [drugs, setDrugs] = useState([]);
  const [batches, setBatches] = useState([]);
  const [sales, setSales] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [resolvedAlerts, setResolvedAlerts] = useState([]);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  const load = useCallback(async () => {
    if (!getToken()) return;
    const [me, supplierResult, drugResult, batchResult, saleResult, alertResult, resolvedResult] = await Promise.all([
      api.me(), api.request('/suppliers'), api.request('/drugs'), api.request('/batches?status=active'),
      api.request('/sales?days=365'), api.request('/alerts?status=Open'), api.request('/alerts?status=Resolved'),
    ]);
    setProfile(me.user);
    setSuppliers(supplierResult.suppliers || []);
    setDrugs(drugResult.drugs || []);
    setBatches(batchResult.batches || []);
    setSales(saleResult.sales || []);
    setAlerts((alertResult.alerts || []).map(withAlertAliases));
    setResolvedAlerts((resolvedResult.alerts || []).map(withAlertAliases));
  }, []);

  useEffect(() => {
    let active = true;
    const refresh = () => { if (active && getToken()) load().catch(() => {}); };
    refresh();
    const unsubscribe = subscribeAuth(refresh);
    return () => { active = false; unsubscribe(); };
  }, [load]);

  const addDrug = useCallback(async (data) => {
    const result = await api.request('/drugs', { method: 'POST', body: { name: data.name.trim(), category: data.category || 'Other', barcode: (data.barcode || '').trim(), reorderLevel: Number(data.reorderLevel) || 1 } });
    setDrugs((prev) => [...prev, result.drug]);
    return result.drug;
  }, []);
  const updateDrug = useCallback(async (drugId, patch) => {
    const result = await api.request(`/drugs/${drugId}`, { method: 'PATCH', body: patch });
    setDrugs((prev) => prev.map((drug) => drug.drugId === drugId ? result.drug : drug));
  }, []);
  const addSupplier = useCallback(async (data) => {
    const result = await api.request('/suppliers', { method: 'POST', body: { name: data.name.trim(), contactInfo: data.contactInfo || '', address: data.address || '' } });
    setSuppliers((prev) => prev.some((item) => item.supplierId === result.supplier.supplierId) ? prev : [...prev, result.supplier]);
    return result.supplier;
  }, []);
  const addBatches = useCallback(async (list) => {
    const result = await api.request('/batches', { method: 'POST', body: { batches: list.map((batch) => ({ drugId: batch.drugId, newDrug: batch.newDrug, supplierId: batch.supplierId, newSupplierName: batch.newSupplierName, batchNumber: batch.batchNumber, quantity: Number(batch.quantity), expiryDate: batch.expiryDate, dateReceived: batch.dateReceived })) } });
    setBatches((prev) => [...prev, ...(result.batches || [])]);
    if (result.createdDrugs?.length) setDrugs((prev) => [...prev, ...result.createdDrugs]);
    if (result.createdSuppliers?.length) setSuppliers((prev) => [...prev, ...result.createdSuppliers]);
    return result;
  }, []);
  const updateBatch = useCallback(async (batchId, patch) => {
    const result = await api.request(`/batches/${batchId}`, { method: 'PATCH', body: patch });
    setBatches((prev) => prev.map((batch) => batch.batchId === batchId ? { ...batch, ...result.batch } : batch));
  }, []);
  const recordSale = useCallback(async ({ drugId, quantity }) => {
    try {
      const result = await api.request('/sales', { method: 'POST', body: { drugId, quantity: Number(quantity) } });
      await load();
      return { ok: true, picks: result.picks || [] };
    } catch (error) { return { ok: false, error: error.message }; }
  }, [load]);
  const discardBatch = useCallback(async (batchId) => {
    const result = await api.request(`/batches/${batchId}/discard`, { method: 'POST' });
    setBatches((prev) => prev.map((batch) => batch.batchId === batchId ? { ...batch, ...result.batch } : batch));
    setAlerts((prev) => prev.filter((alert) => alert.batchId !== batchId));
  }, []);
  const updateSettings = useCallback((patch) => setSettings((prev) => ({ ...prev, ...patch })), []);
  const stockOf = useCallback((drugId) => batches.filter((batch) => batch.drugId === drugId && Number(batch.quantity) > 0).reduce((sum, batch) => sum + Number(batch.quantity), 0), [batches]);
  const value = useMemo(() => ({ profile, setProfile, suppliers, drugs, batches, sales, settings, alerts, resolvedAlerts, alertRecords: [...alerts, ...resolvedAlerts], todaySalesRows: sales, addDrug, updateDrug, addSupplier, addBatches, updateBatch, recordSale, discardBatch, updateSettings, stockOf }), [profile, suppliers, drugs, batches, sales, settings, alerts, resolvedAlerts, addDrug, updateDrug, addSupplier, addBatches, updateBatch, recordSale, discardBatch, updateSettings, stockOf]);
  return <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>;
}
export function useInventory() {
  const ctx = useContext(InventoryContext);
  if (!ctx) throw new Error('useInventory must be used inside <InventoryProvider>');
  return ctx;
}
