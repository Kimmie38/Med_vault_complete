// Turns each pharmacy's raw stock into the numbers the admin screens show (stock health, alerts, totals).
// Tier rules match the pharmacist app: critical ≤ 14 days, warning ≤ 30, upcoming ≤ 90, expired < 0.

export const TIER_ORDER = ['expired', 'critical', 'low', 'warning', 'upcoming'];

export const TIER_LABEL = { expired: 'Expired', critical: 'Critical', low: 'Low stock', warning: 'Warning', upcoming: 'Upcoming' };
export const TIER_TONE = { expired: 'danger', critical: 'danger', low: 'warning', warning: 'warning', upcoming: 'info', ok: 'success' };

const expiryTier = (days) => (days < 0 ? 'expired' : days <= 14 ? 'critical' : days <= 30 ? 'warning' : days <= 90 ? 'upcoming' : null);

export function analyzeUser(user) {
  const drugs = [];
  const alerts = [];

  for (const d of user.inventory) {
    const usable = d.batches.filter((b) => b.expiryDays >= 0);
    const stockUnits = usable.reduce((s, b) => s + b.quantity, 0);
    const nearest = usable.length ? Math.min(...usable.map((b) => b.expiryDays)) : null;

    let worst = null;
    const push = (tier) => {
      if (worst === null || TIER_ORDER.indexOf(tier) < TIER_ORDER.indexOf(worst)) worst = tier;
    };

    for (const b of d.batches) {
      const tier = expiryTier(b.expiryDays);
      if (!tier || b.quantity <= 0) continue;
      push(tier);
      alerts.push({
        alertId: `${user.userId}-${b.batchNumber}`,
        userId: user.userId, userName: user.name, pharmacyName: user.pharmacyName,
        type: 'expiry', tier, drug: d.name, batchNumber: b.batchNumber, quantity: b.quantity, days: b.expiryDays,
        detail: b.expiryDays < 0 ? `Expired ${-b.expiryDays} days ago` : `${b.expiryDays} days to expiry`,
      });
    }
    if (d.reorderLevel > 0 && stockUnits <= d.reorderLevel) {
      push('low');
      alerts.push({
        alertId: `${user.userId}-low-${d.key}`,
        userId: user.userId, userName: user.name, pharmacyName: user.pharmacyName,
        type: 'low_stock', tier: 'low', drug: d.name, batchNumber: null, quantity: stockUnits, days: null,
        detail: `${stockUnits} in stock · reorder level ${d.reorderLevel}`,
      });
    }

    drugs.push({ key: d.key, name: d.name, category: d.category, reorderLevel: d.reorderLevel, stock: stockUnits, nearestExpiry: nearest, status: worst || 'ok' });
  }

  alerts.sort((a, b) => TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier));

  const count = (tier) => alerts.filter((a) => a.tier === tier).length;
  return {
    drugs,
    alerts,
    counts: {
      drugs: drugs.length,
      batches: user.inventory.reduce((s, d) => s + d.batches.length, 0),
      units: drugs.reduce((s, d) => s + d.stock, 0),
      soldThisWeek: user.weekly[user.weekly.length - 1] || 0,
      openAlerts: alerts.length,
      expired: count('expired'),
      critical: count('critical'),
      // "needs attention" = everything except the early 90-day heads-up
      attention: alerts.filter((a) => a.tier !== 'upcoming').length,
    },
  };
}

// ---- time helpers -----------------------------------------------------------------------------
const pad = (n) => String(n).padStart(2, '0');
export const stampFromDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
export const stampMinutesAgo = (min) => stampFromDate(new Date(Date.now() - min * 60000));
export const dateDaysAgo = (days) => stampFromDate(new Date(Date.now() - days * 86400000)).slice(0, 10);
const parseStamp = (s) => {
  const [d, t = '00:00'] = s.split(' ');
  const [y, m, day] = d.split('-').map(Number);
  const [h, mi] = t.split(':').map(Number);
  return new Date(y, m - 1, day, h, mi);
};

export function timeAgo(stamp) {
  const min = Math.max(0, Math.round((Date.now() - parseStamp(stamp).getTime()) / 60000));
  if (min < 1) return 'just now';
  if (min < 60) return `${min}m ago`;
  const h = Math.round(min / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.round(h / 24);
  return days === 1 ? 'yesterday' : `${days}d ago`;
}

export const daysSince = (stamp) => Math.floor((Date.now() - parseStamp(stamp).getTime()) / 86400000);

export function dayHeading(stamp) {
  const d = daysSince(stamp.slice(0, 10) + ' 00:00');
  if (d <= 0) return 'Today';
  if (d === 1) return 'Yesterday';
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const [y, m, day] = stamp.slice(0, 10).split('-').map(Number);
  return `${pad(day)} ${MONTHS[m - 1]} ${y}`;
}
export const clockTime = (stamp) => stamp.slice(11, 16);
export const joinedLabel = (iso) => {
  if (!iso) return 'Not available';
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const [y, m, d] = iso.split('-').map(Number);
  return `${pad(d)} ${MONTHS[m - 1]} ${y}`;
};
