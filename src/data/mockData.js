// Shared catalog constants and sample-independent field definitions used by the forms.
// Shapes and field names follow the ERD (Figure 3.4.6.2): User, Supplier, Drug, Batch, Sale, Alert.
// Primary keys are userId / supplierId / drugId / batchId / saleId / alertId; foreign keys reuse the same names.
// Date helpers keep form examples relative to the current day.

import { addDays, todayISO } from '../utils/dates';

const today = todayISO();
const inDays = (n) => addDays(today, n);

// ---- User -------------------------------------------------------------------
export const pharmacistProfile = {
  userId: 'u1',
  name: 'Adaeze Okonkwo',
  role: 'Pharmacist',
  staffId: 'STF-0142',
  pharmacyName: 'Okonkwo Pharmacy',
  email: 'adaeze.okonkwo@medvault.app',
};

// ---- Supplier ---------------------------------------------------------------
export const suppliers = [
  { supplierId: 's1', userId: 'u1', name: 'Emzor Distribution Ltd', contactInfo: '+234 803 111 2233', address: 'Ikeja, Lagos' },
  { supplierId: 's2', userId: 'u1', name: 'May & Baker Nigeria Plc', contactInfo: '+234 802 445 9087', address: 'Apapa, Lagos' },
  { supplierId: 's3', userId: 'u1', name: 'Fidson Healthcare', contactInfo: '+234 805 300 1122', address: 'Ilupeju, Lagos' },
  { supplierId: 's4', userId: 'u1', name: 'Health Bridge Pharma', contactInfo: '+234 807 654 3210', address: 'Yaba, Lagos' },
];

// ---- Drug -------------------------------------------------------------------
export const drugCategories = ['Antibiotic', 'Analgesic', 'Antimalarial', 'Antidiabetic', 'Antihistamine', 'Supplement', 'Other'];

const drugSeed = [
  { drugId: 'd1', userId: 'u1', name: 'Amoxicillin 500mg', category: 'Antibiotic', barcode: '5012345678901', reorderLevel: 150, weeklyDemand: 90 },
  { drugId: 'd2', userId: 'u1', name: 'Paracetamol 500mg', category: 'Analgesic', barcode: '5019988771234', reorderLevel: 300, weeklyDemand: 220 },
  { drugId: 'd3', userId: 'u1', name: 'Ciprofloxacin 250mg', category: 'Antibiotic', barcode: '5013321459087', reorderLevel: 80, weeklyDemand: 20 },
  { drugId: 'd4', userId: 'u1', name: 'Artemether/Lumefantrine', category: 'Antimalarial', barcode: '5010098234561', reorderLevel: 100, weeklyDemand: 45 },
  { drugId: 'd5', userId: 'u1', name: 'Metformin 850mg', category: 'Antidiabetic', barcode: '5017765432198', reorderLevel: 120, weeklyDemand: 60 },
  { drugId: 'd6', userId: 'u1', name: 'Ibuprofen 400mg', category: 'Analgesic', barcode: '5011122334455', reorderLevel: 150, weeklyDemand: 70 },
  { drugId: 'd7', userId: 'u1', name: 'Vitamin C 1000mg', category: 'Supplement', barcode: '5016677889900', reorderLevel: 100, weeklyDemand: 40 },
  { drugId: 'd8', userId: 'u1', name: 'Loratadine 10mg', category: 'Antihistamine', barcode: '5014455667788', reorderLevel: 60, weeklyDemand: 25 },
];

export const drugs = drugSeed.map(({ weeklyDemand, ...drug }) => drug);

// ---- Batch ------------------------------------------------------------------
export const batches = [
  { batchId: 'b1', drugId: 'd1', supplierId: 's1', batchNumber: 'P2207', quantity: 240, dateReceived: inDays(-200), expiryDate: inDays(20) },
  { batchId: 'b2', drugId: 'd1', supplierId: 's1', batchNumber: 'P2411', quantity: 300, dateReceived: inDays(-30), expiryDate: inDays(400) },
  { batchId: 'b3', drugId: 'd2', supplierId: 's2', batchNumber: 'PC-8812', quantity: 180, dateReceived: inDays(-150), expiryDate: inDays(9) },
  { batchId: 'b4', drugId: 'd2', supplierId: 's2', batchNumber: 'PC-9034', quantity: 250, dateReceived: inDays(-20), expiryDate: inDays(300) },
  { batchId: 'b5', drugId: 'd3', supplierId: 's3', batchNumber: 'CF-1120', quantity: 45, dateReceived: inDays(-90), expiryDate: inDays(640) },
  { batchId: 'b6', drugId: 'd4', supplierId: 's4', batchNumber: 'AL-0407', quantity: 60, dateReceived: inDays(-400), expiryDate: inDays(-167) },
  { batchId: 'b7', drugId: 'd4', supplierId: 's4', batchNumber: 'AL-0912', quantity: 30, dateReceived: inDays(-15), expiryDate: inDays(200) },
  { batchId: 'b8', drugId: 'd5', supplierId: 's3', batchNumber: 'MF-2210', quantity: 320, dateReceived: inDays(-60), expiryDate: inDays(487) },
  { batchId: 'b9', drugId: 'd6', supplierId: 's1', batchNumber: 'IB-3301', quantity: 210, dateReceived: inDays(-100), expiryDate: inDays(70) },
  { batchId: 'b10', drugId: 'd6', supplierId: 's1', batchNumber: 'IB-3350', quantity: 150, dateReceived: inDays(-10), expiryDate: inDays(500) },
  { batchId: 'b11', drugId: 'd7', supplierId: 's4', batchNumber: 'VC-7710', quantity: 140, dateReceived: inDays(-120), expiryDate: inDays(55) },
  { batchId: 'b12', drugId: 'd8', supplierId: 's2', batchNumber: 'LT-5502', quantity: 90, dateReceived: inDays(-180), expiryDate: inDays(25) },
];

// ---- Sale (12 weeks of history so the forecast has something to work with) --
// Follows the ERD: every Sale row points to ONE batch (SaleID, BatchID, QuantitySold, DateSold).
// A sale that is taken from two batches (FEFO) is therefore stored as two rows.
function mulberry32(seed) {
  let a = seed;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildSalesHistory() {
  const rows = [];
  drugSeed.forEach((drug, di) => {
    const rnd = mulberry32(1000 + di * 77);
    const perDay = drug.weeklyDemand / 7;
    // Oldest batch first, so older sales are attributed to older deliveries.
    const drugBatches = batches.filter((b) => b.drugId === drug.drugId).sort((a, b) => (a.dateReceived < b.dateReceived ? -1 : 1));
    for (let age = 1; age <= 84; age += 1) {
      // Gentle upward trend towards recent weeks, with day-to-day noise.
      const trend = 0.85 + ((84 - age) / 84) * 0.3;
      const qty = Math.round(perDay * trend * (0.5 + rnd()));
      if (qty <= 0) continue;
      const date = inDays(-age);
      const batch = [...drugBatches].reverse().find((b) => b.dateReceived <= date) || drugBatches[0];
      rows.push({ saleId: `h-${drug.drugId}-${age}`, batchId: batch.batchId, quantitySold: qty, dateSold: `${date} 12:00` });
    }
  });
  return rows;
}

// A couple of sales already logged today so the "Today's sales" list has content.
export const sales = [
  ...buildSalesHistory(),
  { saleId: 'sale-seed-1', batchId: 'b3', quantitySold: 12, dateSold: `${today} 09:14` },
  { saleId: 'sale-seed-2', batchId: 'b1', quantitySold: 6, dateSold: `${today} 10:02` },
];

// Consumer-side lookup (parked "Check a drug" screens — not part of the documented pharmacist app).
export const drugDirectory = {
  '5012345678901': {
    name: 'Amoxicillin', strength: '500mg', form: 'Capsule', manufacturer: 'Emzor Pharmaceuticals',
    manufactureDate: '2025-02-10', expiryDate: '2026-10-05', batchCode: '5012345678901',
    registeredPharmacy: 'Okonkwo Pharmacy, Yaba, Lagos', verified: true,
  },
  '5019988771234': {
    name: 'Paracetamol', strength: '500mg', form: 'Tablet', manufacturer: 'May & Baker Nigeria',
    manufactureDate: '2024-11-01', expiryDate: '2026-09-29', batchCode: '5019988771234',
    registeredPharmacy: 'Okonkwo Pharmacy, Yaba, Lagos', verified: true,
  },
};

export default { pharmacistProfile, suppliers, drugs, batches, sales, drugDirectory };
