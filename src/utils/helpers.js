import { BASE_URL, S_CODES } from '../data/constants';

/** Generate all PDF link objects for a given year + month */
export function generateLinks(year, month) {
  const yy = String(year).slice(-2);
  const mm = String(month).padStart(2, '0');
  const links = [];

  for (let x = 1; x <= 7; x++) {
    const label = `CHN0${x}`;
    const filename = `${yy}${mm}${label}.pdf`;
    links.push({ label, filename, url: BASE_URL + filename, group: 'CHN' });
  }

  for (const code of S_CODES) {
    const filename = `${yy}${mm}${code}.pdf`;
    links.push({ label: code, filename, url: BASE_URL + filename, group: 'S' });
  }

  return links;
}

/** Build a PDF URL from a raw offer code */
export function buildLookupResult(raw) {
  const code = raw.trim().toUpperCase();
  if (!code) return null;
  const filename = code.endsWith('.PDF') ? code : code + '.pdf';
  return { filename, url: BASE_URL + filename };
}

/** Safe localStorage helpers */
export const storageGet = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key) ?? 'null') ?? fallback; }
  catch { return fallback; }
};
export const storageSet = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
};

/** Format a number as USD */
export const fmt = (n) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 });

/** Format a number with thousands separators */
export const fmtPts = (n) => n.toLocaleString('en-US');

/** Parse a value as float, return 0 on failure */
export const num = (v) => parseFloat(v) || 0;

/** Calculate trip financial totals */
export function calcTotals(t) {
  const cruiseBase = num(t.cruiseCost) + num(t.taxes);
  const travel = num(t.airfare) + num(t.hotel);
  const onboard = num(t.foodDrinks) + num(t.excursions) + num(t.spa) + num(t.shopping) + num(t.otherOnboard);
  const casino = num(t.casinoSpend);
  const total = cruiseBase + travel + onboard + casino;
  const perksValue = (t.perks || []).reduce((s, p) => s + num(p.value), 0);
  const net = total - perksValue;
  const pts = num(t.casinoPointsEarned);
  const costPerPoint = pts > 0 ? casino / pts : 0;
  const goalPct = t.casinoPointsGoal > 0
    ? Math.min((pts / num(t.casinoPointsGoal)) * 100, 100)
    : 0;
  return { cruiseBase, travel, onboard, casino, total, perksValue, net, pts, costPerPoint, goalPct };
}
