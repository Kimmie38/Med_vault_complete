// Small date helpers. All dates in the app are stored as ISO strings: "YYYY-MM-DD".

const pad = (n) => String(n).padStart(2, '0');

export function toISO(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function fromISO(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function todayISO() {
  return toISO(new Date());
}

export function addDays(iso, n) {
  const d = fromISO(iso);
  d.setDate(d.getDate() + n);
  return toISO(d);
}

// Whole days from `fromIso` to `toIso` (negative if toIso is earlier). DST-safe.
export function daysBetween(fromIso, toIso) {
  const [fy, fm, fd] = fromIso.split('-').map(Number);
  const [ty, tm, td] = toIso.split('-').map(Number);
  return Math.round((Date.UTC(ty, tm - 1, td) - Date.UTC(fy, fm - 1, fd)) / 86400000);
}

export function daysUntil(iso) {
  return daysBetween(todayISO(), iso);
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatDate(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  return `${pad(d)} ${MONTHS[m - 1]} ${y}`;
}

export function formatTime(date) {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function isValidISO(str) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(str || '')) return false;
  const d = fromISO(str);
  return toISO(d) === str;
}

// Timestamps are stored as "YYYY-MM-DD HH:mm" (DATETIME in MySQL).
export function nowStamp() {
  const d = new Date();
  return `${toISO(d)} ${formatTime(d)}`;
}

export const stampDate = (stamp) => (stamp || '').slice(0, 10);
export const stampTime = (stamp) => (stamp || '').slice(11, 16);
