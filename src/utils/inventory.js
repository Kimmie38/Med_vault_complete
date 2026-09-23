import { daysUntil, stampDate, stampTime } from './dates';
import { uid } from './ids';

// Alert tiers (documentation §3.4.3.2): Upcoming, Warning, Critical, Expired.
export const TIERS = {
  expired: { label: 'Expired', tone: 'danger', rank: 0 },
  critical: { label: 'Critical', tone: 'danger', rank: 1 },
  warning: { label: 'Warning', tone: 'warning', rank: 2 },
  upcoming: { label: 'Upcoming', tone: 'info', rank: 3 },
  ok: { label: 'Good', tone: 'success', rank: 4 },
};

// Fixed system thresholds (days to expiry). The only pharmacist-defined threshold is each
// drug's ReorderLevel, which lives on the Drug table in the ERD.
export const TIER_THRESHOLDS = { critical: 14, warning: 30, upcoming: 90 };

// Client-side preferences (not stored in the database).
export const DEFAULT_SETTINGS = { leadTimeWeeks: 2, pushEnabled: true };

export function getTier(days) {
  if (days < 0) return 'expired';
  if (days <= TIER_THRESHOLDS.critical) return 'critical';
  if (days <= TIER_THRESHOLDS.warning) return 'warning';
  if (days <= TIER_THRESHOLDS.upcoming) return 'upcoming';
  return 'ok';
}

// ---- Stock -------------------------------------------------------------------

// Stock that can actually be sold: expired batches are excluded.
export function usableStock(batches, drugId) {
  return batches
    .filter((b) => b.drugId === drugId && b.quantity > 0 && daysUntil(b.expiryDate) >= 0)
    .reduce((sum, b) => sum + b.quantity, 0);
}

// Sellable batches for a drug in First-Expired-First-Out order.
export function fefoBatches(batches, drugId) {
  return batches
    .filter((b) => b.drugId === drugId && b.quantity > 0 && daysUntil(b.expiryDate) >= 0)
    .sort((a, b) => (a.expiryDate < b.expiryDate ? -1 : a.expiryDate > b.expiryDate ? 1 : 0));
}

// Works out which batches a sale of `quantity` units would be taken from (FEFO).
// Returns null when there is not enough sellable stock.
export function allocateFefo(batches, drugId, quantity) {
  const list = fefoBatches(batches, drugId);
  let remaining = quantity;
  const picks = [];
  for (const b of list) {
    if (remaining <= 0) break;
    const take = Math.min(b.quantity, remaining);
    picks.push({ batchId: b.batchId, batchNumber: b.batchNumber, quantity: take, expiryDate: b.expiryDate });
    remaining -= take;
  }
  return remaining > 0 ? null : picks;
}

// ---- Alerts (ERD: AlertID, BatchID, DrugID, AlertType, AlertTier, Status, CreatedAt, ResolvedAt) ----

const conditionKey = (alertType, batchId, drugId) => (alertType === 'expiry' ? `expiry:${batchId}` : `low_stock:${drugId}`);

// Everything that is abnormal right now: batches in an expiry tier, and drugs below their reorder level.
export function currentConditions({ drugs, batches }) {
  const list = [];
  batches.forEach((b) => {
    if (b.quantity <= 0) return;
    const tier = getTier(daysUntil(b.expiryDate));
    if (tier === 'ok') return;
    list.push({ key: conditionKey('expiry', b.batchId), alertType: 'expiry', alertTier: tier, batchId: b.batchId, drugId: null });
  });
  drugs.forEach((d) => {
    const stock = usableStock(batches, d.drugId);
    if (stock < d.reorderLevel) {
      list.push({ key: conditionKey('low_stock', null, d.drugId), alertType: 'low_stock', alertTier: stock === 0 ? 'critical' : 'warning', batchId: null, drugId: d.drugId });
    }
  });
  return list;
}

// Keeps the stored Alert records in step with the stock: opens a record when something becomes
// abnormal, updates its tier if it gets worse, and closes it (Resolved + ResolvedAt) when the
// problem goes away (discarded, sold out, restocked). Returns the same array if nothing changed.
export function reconcileAlerts(prev, conditions, now) {
  const byKey = {};
  conditions.forEach((c) => { byKey[c.key] = c; });
  let changed = false;

  const next = prev.map((a) => {
    if (a.status !== 'Open') return a;
    const c = byKey[conditionKey(a.alertType, a.batchId, a.drugId)];
    if (!c) { changed = true; return { ...a, status: 'Resolved', resolvedAt: now }; }
    if (c.alertTier !== a.alertTier) { changed = true; return { ...a, alertTier: c.alertTier }; }
    return a;
  });

  const open = new Set(next.filter((a) => a.status === 'Open').map((a) => conditionKey(a.alertType, a.batchId, a.drugId)));
  conditions.forEach((c) => {
    if (open.has(c.key)) return;
    changed = true;
    next.push({ alertId: uid('a'), batchId: c.batchId, drugId: c.drugId, alertType: c.alertType, alertTier: c.alertTier, status: 'Open', createdAt: now, resolvedAt: null });
  });

  return changed ? next : prev;
}

// Joins stored alerts with their batch / drug so screens can show names, dates and quantities.
export function buildAlertViews({ alerts, drugs, batches }) {
  const views = [];
  alerts.forEach((a) => {
    const batch = a.batchId ? batches.find((b) => b.batchId === a.batchId) : null;
    const drug = a.drugId ? drugs.find((d) => d.drugId === a.drugId) : batch ? drugs.find((d) => d.drugId === batch.drugId) : null;
    if (!drug) return;
    views.push({
      ...a,
      batch,
      drug,
      days: batch ? daysUntil(batch.expiryDate) : null,
      stock: a.alertType === 'low_stock' ? usableStock(batches, drug.drugId) : null,
    });
  });
  return views;
}

export function sortAlerts(views) {
  return [...views].sort((a, b) => {
    const r = TIERS[a.alertTier].rank - TIERS[b.alertTier].rank;
    if (r !== 0) return r;
    if (a.alertType !== b.alertType) return a.alertType === 'expiry' ? -1 : 1;
    return (a.days ?? 0) - (b.days ?? 0);
  });
}

// ---- Sales -------------------------------------------------------------------

// The ERD stores one Sale row per batch. For display, rows from the same drug sold at the same
// minute (one FEFO sale spanning two batches) are shown together. Newest first.
export function groupSales(sales, batches) {
  const batchById = {};
  batches.forEach((b) => { batchById[b.batchId] = b; });
  const groups = {};
  sales.forEach((s) => {
    const batch = batchById[s.batchId];
    if (!batch) return;
    const key = `${batch.drugId}|${s.dateSold}`;
    if (!groups[key]) groups[key] = { key, drugId: batch.drugId, date: stampDate(s.dateSold), time: stampTime(s.dateSold), stamp: s.dateSold, quantity: 0, batches: [] };
    groups[key].quantity += s.quantitySold;
    groups[key].batches.push({ batchNumber: batch.batchNumber, quantity: s.quantitySold });
  });
  return Object.values(groups).sort((a, b) => (a.stamp < b.stamp ? 1 : -1));
}

// ---- Export ------------------------------------------------------------------

export function buildInventoryCsv({ drugs, batches, suppliers }) {
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const header = ['Drug', 'Category', 'Barcode', 'Batch number', 'Supplier', 'Quantity', 'Date received', 'Expiry date', 'Days to expiry'];
  const rows = batches
    .filter((b) => b.quantity > 0)
    .map((b) => {
      const d = drugs.find((x) => x.drugId === b.drugId) || {};
      const s = suppliers.find((x) => x.supplierId === b.supplierId) || {};
      return [d.name, d.category, d.barcode, b.batchNumber, s.name, b.quantity, b.dateReceived, b.expiryDate, daysUntil(b.expiryDate)];
    });
  return [header, ...rows].map((r) => r.map(esc).join(',')).join('\n');
}
