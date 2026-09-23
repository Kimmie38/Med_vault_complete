import { daysBetween, todayISO } from './dates';

// Demand forecasting (documentation §3.4.5): data aggregation + trend computation.
// Sales are grouped into rolling 7-day buckets, then a moving average and an
// exponential smoothing trend are computed over those weekly totals.

export const HISTORY_WEEKS = 6; // Figure 4.1.5: trend over the past six weeks
export const MA_WINDOW = 4;
export const ES_ALPHA = 0.4;

// Weekly totals, oldest -> newest. The last bucket is the most recent 7 days (including today).
// Sale rows point to a batch (ERD), so the drug is found through the batch.
export function weeklyTotals(sales, batches, drugId, weeks = HISTORY_WEEKS) {
  const today = todayISO();
  const drugBatchIds = new Set(batches.filter((b) => b.drugId === drugId).map((b) => b.batchId));
  const buckets = Array(weeks).fill(0);
  sales.forEach((s) => {
    if (!drugBatchIds.has(s.batchId)) return;
    const age = daysBetween(s.dateSold.slice(0, 10), today); // 0 = today
    if (age < 0) return;
    const idx = Math.floor(age / 7);
    if (idx < weeks) buckets[weeks - 1 - idx] += s.quantitySold;
  });
  return buckets;
}

export function movingAverage(series, window = MA_WINDOW) {
  const slice = series.slice(-window);
  if (!slice.length) return 0;
  return slice.reduce((a, b) => a + b, 0) / slice.length;
}

export function exponentialSmoothing(series, alpha = ES_ALPHA) {
  if (!series.length) return 0;
  let level = series[0];
  for (let i = 1; i < series.length; i += 1) {
    level = alpha * series[i] + (1 - alpha) * level;
  }
  return level;
}

// Combines both methods into one weekly projection and turns it into a reorder suggestion:
//   suggested = projected weekly demand x restocking period + reorder level (safety stock) - stock on hand
export function forecastDrug({ sales, batches, drugId, stock, reorderLevel, leadTimeWeeks }) {
  const series = weeklyTotals(sales, batches, drugId);
  const ma = movingAverage(series);
  const es = exponentialSmoothing(series);
  const weekly = (ma + es) / 2;
  const demandOverPeriod = weekly * leadTimeWeeks;
  const suggested = Math.max(0, Math.ceil(demandOverPeriod + reorderLevel - stock));
  return { series, ma, es, weekly, demandOverPeriod, suggested };
}

export function weekLabels(count) {
  // e.g. count=6 -> ['5w ago', '4w ago', ..., 'This wk']
  return Array.from({ length: count }, (_, i) => {
    const back = count - 1 - i;
    return back === 0 ? 'This wk' : `${back}w ago`;
  });
}
