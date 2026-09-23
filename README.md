# MedVault — Pharmacy Inventory, Expiry Alert & Demand Forecast App

React Native (Expo) mobile app for a community pharmacy. It tracks stock by batch, raises tiered
expiry and low-stock alerts, records sales (oldest expiry first) and forecasts demand to suggest how
much to reorder.

This build is the **integrated frontend**. Authentication, inventory, batches, suppliers, sales,
alerts, and administrator operations are connected to the supplied Node.js/Express + MongoDB API
through `src/api/client.js` and the two context providers.

## Run it

You need [Node.js](https://nodejs.org) and the **Expo Go** app on your phone (or an emulator).

```bash
cd medvault-main
npm install
npx expo start
```

Copy `.env.example` to `.env` and set `EXPO_PUBLIC_API_URL` to the backend URL including `/api`.
Use `http://10.0.2.2:4000/api` for an Android emulator, `http://localhost:4000/api` for a simulator
or web, and the computer's LAN IP for a physical phone. Start MongoDB, then run the backend from its
project directory with `npm install` and `npm start`.

Scan the QR code with Expo Go. If Expo warns about package versions, run `npx expo install --fix`.

On an emulator, grant camera access when prompted and use a printed or displayed barcode inside the scan frame.

## Screens (follows Chapter 4 of the documentation)

Bottom tabs match the interface figures: **Home · Alerts · Scan · Forecast · Account**. Record sale,
Inventory, Edit batch/drug and Sales history open from Home.

| Documentation | Screen | File |
| --- | --- | --- |
| 4.1.0 Login screen (email or staff ID + password) | Login / Register | `src/screens/pharmacist/LoginScreen.js`, `RegisterScreen.js` |
| 4.1.1 Dashboard (totals + "Needs attention" with tiers) | Dashboard | `DashboardScreen.js` |
| 4.1.2 Adding a stock batch (scan → auto-fill, date picker, bulk entry) | Scan tab | `DataInputScreen.js`, `ScanBatchCodeScreen.js` |
| 4.1.3 Alerts screen (filter chips, colour-coded tiers) | Alerts tab | `AlertsScreen.js` |
| 4.1.4 Recording a sale (FEFO batch, stepper, day log) | Home › Record sale | `SalesScreen.js`, `SalesHistoryScreen.js` |
| 4.1.5 Demand forecast (6-week chart, projection, reorder figure) | Forecast tab | `ForecastScreen.js` |
| 3.4.2 Add **and update** records | Home › Inventory › tap a batch or drug | `EditBatchScreen.js`, `EditDrugScreen.js` |
| 3.4.2 Reorder level per drug (pharmacist-defined) | Edit drug | `EditDrugScreen.js` |
| 3.4.2 Historical dispensing data | Record sale › History | `SalesHistoryScreen.js` |
| Profile, light/dark mode | Home › gear icon, or Account tab | `ProfileScreen.js`, `src/theme/ThemeContext.js` |
| 3.4.2 CSV export | Inventory / Account | `InventoryScreen.js`, `ProfileScreen.js` |
| 3.4.3.2 How alerts work | Account › Alert settings | `AlertSettingsScreen.js` |

Business logic lives in `src/utils/`:
- `inventory.js` — alert tiers (Upcoming / Warning / Critical / Expired), low-stock check, FEFO allocation, CSV
- `forecast.js` — weekly aggregation, moving average, exponential smoothing, suggested reorder
- `dates.js` — date helpers

## Data model = the ERD

The API-backed context uses the same six tables and field names as the ERD
(`docs/ERD_MedVault.png`, source `docs/erd.dot`): User, Supplier, Drug, Batch, Sale, Alert. Primary keys are
`userId`, `supplierId`, `drugId`, `batchId`, `saleId`, `alertId`, and foreign keys reuse the same names.

- **Sale** has one row per batch used (a FEFO sale spanning two batches is two rows); the drug comes from the batch.
- **Alert** is a stored record (`alertType`, `alertTier`, `status`, `createdAt`, `resolvedAt`). It opens when a batch or drug
  turns abnormal and resolves itself when it is fixed. Expiry alerts point to a batch, low-stock alerts to a drug.
- Expiry tiers use fixed thresholds (Critical ≤ 14 days, Warning ≤ 30, Upcoming ≤ 90); the pharmacist-defined threshold is
  each drug's `reorderLevel`.
- `docs/screenshots/` has real screenshots of Figures 4.1.0 – 4.1.5.

## Admin section (API-backed)

One administrator controls and monitors every pharmacy account. It uses the same design system and light/dark themes.

The administrator credentials come from the backend's `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `ADMIN_ID`
environment variables. There is no hard-coded demo password in the integrated frontend.

| Tab | What the admin can do |
|---|---|
| Overview | System totals, sales across all pharmacies (6 weeks), pharmacies needing attention, recent activity |
| Users | Search and filter all accounts (Active / Suspended / New / Inactive); open a user for profile, stock health, alerts, activity |
| Users › detail | **Suspend / reactivate**, **reset password** (one-time temporary password), **delete account** — each with a confirmation |
| Monitor | Every open alert from every pharmacy, filtered by Expired / Critical / Low stock / Warning / Upcoming |
| Activity | System-wide log grouped by day; the admin's own actions are recorded too |
| Account | Admin profile, dark mode switch, export all users (CSV), log out |

**Only one admin:** there is no screen that creates, promotes, suspends or deletes an admin, sign-up rejects the admin's
reserved email / ID, and the backend enforces the unique administrator account. Suspended or deleted users are blocked
by the API at login.

Files: `src/screens/admin/`, `src/navigation/AdminTabs.js`, `src/context/AdminContext.js`, and
`src/api/client.js`.

## Theming and branding

- **Light / dark mode:** tap the gear on Home (or the Account tab) and use the **Dark mode** switch. The choice is saved
  on the device. First launch uses `DEFAULT_MODE` in `src/theme/ThemeContext.js` (currently dark).
- Both palettes share the same token names in `src/theme/theme.js`. In a screen, use
  `const { colors, styles } = useThemedStyles(createStyles)` — never import a palette directly.
- **Splash:** `SplashScreen.js` plays the "vault unlocks" animation using the layers `assets/images/mark-*.png`.
- **Logo:** `assets/images/` holds the app icon, adaptive icon, splash image and mark. Source SVGs and light/dark
  logo files are in `assets/branding/`.

## Project structure

```
App.js
src/
  screens/        SplashScreen + pharmacist/ (all app screens)
  navigation/     MainTabs (five bottom tabs + stacks), navigationRef
  api/            API client and authentication token handling
  context/        API-backed InventoryContext and AdminContext
  components/     Button, Input, Card, Badge, Chip, SelectField, DateField, Stepper, BarChart, ...
  utils/          inventory, forecast, dates
  data/           catalog constants and validation options
  theme/          theme.js (dark + light palettes, spacing, type), ThemeContext.js (saved light/dark choice)
  _parked/        earlier buyer-side screens (not part of the documented scope, not wired in)
```

## Backend notes

The API project uses MongoDB rather than MySQL. Its automated tests require a running MongoDB instance
at the configured `MONGODB_URI` (the default is `mongodb://127.0.0.1:27017/medvault`).
