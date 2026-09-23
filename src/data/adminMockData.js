// Administrator form constants and display helpers shared by the account screens.
// There is exactly ONE administrator account. The admin is not part of `users` (those are pharmacy
// accounts) and there is no screen anywhere that creates, promotes or removes an admin.

export const adminProfile = {
  adminId: 'admin-1',
  name: 'MedVault Administrator',
  email: 'admin@medvault.app',
  staffId: 'ADMIN-001',
  role: 'Administrator',
  createdAt: '2026-01-05',
};

// Demo sign-in for the admin (the login screen checks this before the normal pharmacist flow).
export const ADMIN_LOGIN = { identifiers: ['admin@medvault.app', 'admin-001'], password: 'Admin@123' };

// Identifiers nobody can register with, so no second admin can be created through sign-up.
export const RESERVED_IDENTIFIERS = ['admin@medvault.app', 'ADMIN-001'];

// ---- Drug catalogue used to build each pharmacy's stock -------------------------------------
const DRUGS = {
  para: { name: 'Paracetamol 500mg', category: 'Analgesic', reorderLevel: 150 },
  amox: { name: 'Amoxicillin 500mg', category: 'Antibiotic', reorderLevel: 100 },
  arte: { name: 'Artemether/Lumefantrine', category: 'Antimalarial', reorderLevel: 60 },
  lora: { name: 'Loratadine 10mg', category: 'Antihistamine', reorderLevel: 50 },
  vitc: { name: 'Vitamin C 1000mg', category: 'Supplement', reorderLevel: 80 },
  metf: { name: 'Metformin 500mg', category: 'Antidiabetic', reorderLevel: 90 },
  cipro: { name: 'Ciprofloxacin 500mg', category: 'Antibiotic', reorderLevel: 60 },
  ibu: { name: 'Ibuprofen 400mg', category: 'Analgesic', reorderLevel: 100 },
};

// Batches are [batchNumber, quantity, daysToExpiry] so the demo never goes stale (negative = expired).
const stock = (rows) =>
  rows.map(([key, batches]) => ({
    ...DRUGS[key],
    key,
    batches: batches.map(([batchNumber, quantity, expiryDays]) => ({ batchNumber, quantity, expiryDays })),
  }));

// ---- Pharmacy accounts ----------------------------------------------------------------------
// createdDaysAgo / lastActiveMinutesAgo are relative to "now" (resolved in AdminContext).
export const seedUsers = [
  {
    userId: 'u1', name: 'Adaeze Okonkwo', role: 'Pharmacist', email: 'adaeze.okonkwo@medvault.app', staffId: 'STF-0142',
    pharmacyName: 'Okonkwo Pharmacy', location: 'Ikeja, Lagos', status: 'active', createdDaysAgo: 210, lastActiveMinutesAgo: 12,
    weekly: [75, 116, 78, 92, 101, 103],
    inventory: stock([
      ['arte', [['AL-0407', 60, -167], ['AL-0512', 30, 200]]],
      ['para', [['PC-8812', 180, 9], ['PC-9010', 120, 300]]],
      ['amox', [['P2207', 240, 20]]],
      ['lora', [['LT-5502', 90, 25]]],
      ['vitc', [['VC-7710', 140, 55]]],
      ['metf', [['MF-1101', 400, 400]]],
      ['cipro', [['CP-3301', 40, 150]]],
      ['ibu', [['IB-2201', 300, 500]]],
    ]),
  },
  {
    userId: 'u2', name: 'Tunde Bakare', role: 'Pharmacist', email: 'tunde@bakarechemist.ng', staffId: 'STF-0207',
    pharmacyName: 'Bakare & Sons Chemist', location: 'Bodija, Ibadan', status: 'active', createdDaysAgo: 168, lastActiveMinutesAgo: 95,
    weekly: [58, 61, 70, 66, 74, 80],
    inventory: stock([
      ['para', [['PB-4410', 260, 210]]],
      ['amox', [['AX-2231', 55, 11], ['AX-2299', 60, 260]]],
      ['metf', [['MT-8801', 320, 340]]],
      ['ibu', [['IP-1120', 180, 26]]],
      ['vitc', [['VC-3350', 210, 400]]],
    ]),
  },
  {
    userId: 'u3', name: 'Chioma Eze', role: 'Pharmacist', email: 'chioma.eze@healthplus-enu.com', staffId: 'STF-0311',
    pharmacyName: 'HealthPlus Enugu', location: 'Independence Layout, Enugu', status: 'active', createdDaysAgo: 122, lastActiveMinutesAgo: 340,
    weekly: [130, 122, 141, 150, 138, 157],
    inventory: stock([
      ['arte', [['AL-7710', 200, 180]]],
      ['para', [['PA-1180', 90, 5], ['PA-1250', 300, 240]]],
      ['amox', [['AM-6604', 320, 130]]],
      ['cipro', [['CF-2018', 45, -20]]],
      ['lora', [['LR-3302', 150, 320]]],
      ['metf', [['MM-9100', 500, 380]]],
    ]),
  },
  {
    userId: 'u4', name: 'Ibrahim Musa', role: 'Pharmacy attendant', email: 'ibrahim.musa@musacare.ng', staffId: 'STF-0425',
    pharmacyName: 'Musa Care Pharmacy', location: 'Sabon Gari, Kano', status: 'active', createdDaysAgo: 96, lastActiveMinutesAgo: 1500,
    weekly: [44, 50, 47, 39, 52, 41],
    inventory: stock([
      ['para', [['MC-0101', 70, 45]]],
      ['arte', [['MC-0202', 120, 90]]],
      ['ibu', [['MC-0303', 210, 280]]],
      ['vitc', [['MC-0404', 30, 18]]],
    ]),
  },
  {
    userId: 'u5', name: 'Ngozi Adebayo', role: 'Pharmacist', email: 'ngozi@greenleafpharm.ng', staffId: 'STF-0533',
    pharmacyName: 'Greenleaf Pharmacy', location: 'Wuse II, Abuja', status: 'suspended', createdDaysAgo: 140, lastActiveMinutesAgo: 60 * 24 * 9,
    weekly: [90, 84, 77, 31, 0, 0],
    inventory: stock([
      ['amox', [['GL-1001', 140, -12], ['GL-1002', 40, 8]]],
      ['para', [['GL-2001', 200, 160]]],
      ['metf', [['GL-3001', 60, 120]]],
    ]),
  },
  {
    userId: 'u6', name: 'Emeka Nwosu', role: 'Pharmacy attendant', email: 'emeka.nwosu@nwosumeds.com', staffId: 'STF-0648',
    pharmacyName: 'Nwosu Meds', location: 'GRA, Port Harcourt', status: 'active', createdDaysAgo: 61, lastActiveMinutesAgo: 30,
    weekly: [22, 35, 41, 48, 55, 63],
    inventory: stock([
      ['para', [['NM-100', 340, 190]]],
      ['arte', [['NM-200', 25, 70]]],
      ['lora', [['NM-300', 80, 12]]],
      ['ibu', [['NM-400', 260, 330]]],
      ['cipro', [['NM-500', 100, 210]]],
    ]),
  },
  {
    userId: 'u7', name: 'Funmi Alade', role: 'Pharmacist', email: 'funmi@aladefamilypharmacy.ng', staffId: 'STF-0712',
    pharmacyName: 'Alade Family Pharmacy', location: 'Oke-Ilewo, Abeokuta', status: 'active', createdDaysAgo: 33, lastActiveMinutesAgo: 210,
    weekly: [0, 12, 28, 30, 36, 45],
    inventory: stock([
      ['para', [['AF-11', 180, 150]]],
      ['amox', [['AF-12', 210, 100]]],
      ['vitc', [['AF-13', 95, 40]]],
    ]),
  },
  {
    userId: 'u8', name: 'Yusuf Danjuma', role: 'Pharmacist', email: 'yusuf@danjumadrugs.ng', staffId: 'STF-0819',
    pharmacyName: 'Danjuma Drugs', location: 'Barnawa, Kaduna', status: 'active', createdDaysAgo: 188, lastActiveMinutesAgo: 60 * 24 * 41,
    weekly: [12, 9, 4, 0, 0, 0],
    inventory: stock([
      ['para', [['DD-01', 40, -30]]],
      ['metf', [['DD-02', 55, 95]]],
    ]),
  },
  {
    userId: 'u9', name: 'Sade Ogunleye', role: 'Pharmacy attendant', email: 'sade.ogunleye@gmail.com', staffId: 'STF-0904',
    pharmacyName: 'Ogunleye Pharmacy', location: 'Surulere, Lagos', status: 'active', createdDaysAgo: 2, lastActiveMinutesAgo: 400,
    weekly: [0, 0, 0, 0, 0, 0],
    inventory: [],
  },
];

// ---- Activity log ---------------------------------------------------------------------------
// [minutesAgo, userId, type, message]   type: login | stock | sale | alert | signup | admin
export const seedActivity = [
  [4, 'u6', 'sale', 'Recorded a sale of 12 × Paracetamol 500mg'],
  [12, 'u1', 'login', 'Signed in'],
  [26, 'u6', 'stock', 'Added batch NM-400 (260 × Ibuprofen 400mg)'],
  [30, 'u6', 'login', 'Signed in'],
  [58, 'u1', 'sale', 'Recorded a sale of 6 × Amoxicillin 500mg'],
  [95, 'u2', 'login', 'Signed in'],
  [110, 'u2', 'stock', 'Added batch IP-1120 (180 × Ibuprofen 400mg)'],
  [150, 'u1', 'alert', 'Resolved a low-stock alert for Ciprofloxacin 500mg'],
  [210, 'u7', 'sale', 'Recorded a sale of 9 × Vitamin C 1000mg'],
  [212, 'u7', 'login', 'Signed in'],
  [340, 'u3', 'sale', 'Recorded a sale of 20 × Paracetamol 500mg'],
  [345, 'u3', 'login', 'Signed in'],
  [400, 'u9', 'signup', 'Created an account'],
  [520, 'u3', 'stock', 'Added batch AM-6604 (320 × Amoxicillin 500mg)'],
  [760, 'u1', 'stock', 'Added batch VC-7710 (140 × Vitamin C 1000mg)'],
  [900, 'u2', 'sale', 'Recorded a sale of 14 × Metformin 500mg'],
  [1500, 'u4', 'login', 'Signed in'],
  [1510, 'u4', 'sale', 'Recorded a sale of 5 × Artemether/Lumefantrine'],
  [1700, 'u1', 'alert', 'Discarded expired batch AL-0407 (Artemether/Lumefantrine)'],
  [2100, 'u7', 'stock', 'Added batch AF-13 (95 × Vitamin C 1000mg)'],
  [2900, 'u3', 'alert', 'Discarded expired batch CF-2018 (Ciprofloxacin 500mg)'],
  [3300, 'u6', 'sale', 'Recorded a sale of 18 × Loratadine 10mg'],
  [4300, 'u2', 'login', 'Signed in'],
  [5600, 'u9', 'signup', 'Started registration'],
  [7200, 'u5', 'sale', 'Recorded a sale of 31 × Amoxicillin 500mg'],
  [12960, 'u5', 'login', 'Signed in'],
];
