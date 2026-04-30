import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import {
  FileText,
  Copy,
  Check,
  Search,
  Moon,
  Sun,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Loader,
  Calculator,
  Anchor,
  TrendingUp,
  DollarSign,
  Plus,
  Trash2,
  Trophy,
  BarChart2,
  Gift,
  Wallet,
  ChevronDown,
  ChevronUp,
  Info,
} from 'lucide-react';

// Set up the worker for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const BASE_URL =
  'https://www.royalcaribbean.com/content/dam/royal/resources/pdf/casino/offers/';

// ─── Trip Finance OS ────────────────────────────────────────────────────────
const PERK_PRESETS = [
  { label: 'Free Interior Cabin (3-night)', value: 450 },
  { label: 'Free Interior Cabin (5-night)', value: 700 },
  { label: 'Free Interior Cabin (7-night)', value: 950 },
  { label: 'Free Balcony Cabin (3-night)', value: 750 },
  { label: 'Free Balcony Cabin (5-night)', value: 1100 },
  { label: 'Free Balcony Cabin (7-night)', value: 1450 },
  { label: 'Onboard Credit $50', value: 50 },
  { label: 'Onboard Credit $100', value: 100 },
  { label: 'Onboard Credit $200', value: 200 },
  { label: 'Onboard Credit $300', value: 300 },
  { label: 'Free Surf WiFi (7 nights)', value: 105 },
  { label: 'Free Stream WiFi (7 nights)', value: 175 },
  { label: 'Free Drinks Package', value: 350 },
  { label: 'Free Specialty Dining', value: 75 },
  { label: 'Casino Cash Play Credit', value: 100 },
  { label: 'Custom Perk', value: 0 },
];

const EMPTY_TRIP = {
  id: Date.now(),
  name: '',
  sailDate: '',
  ship: '',
  nights: '',
  cruiseCost: '',
  taxes: '',
  airfare: '',
  hotel: '',
  foodDrinks: '',
  excursions: '',
  spa: '',
  shopping: '',
  otherOnboard: '',
  casinoSpend: '',
  casinoPointsEarned: '',
  casinoPointsGoal: '',
  perks: [],
  notes: '',
};

// Safe localStorage helpers — won't crash in restricted or SSR environments
const storageGet = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key) ?? 'null') ?? fallback; } catch { return fallback; }
};
const storageSet = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
};

function TripFinanceOS({ dark }) {
  const d = (light, darkCls) => (dark ? darkCls : light);

  const savedTrips = () => storageGet('rc_trips', []);

  const [trips, setTrips] = useState(savedTrips);
  const [activeTrip, setActiveTrip] = useState(null);
  const [showNewTripForm, setShowNewTripForm] = useState(false);
  const [newTrip, setNewTrip] = useState({ ...EMPTY_TRIP, id: Date.now() });
  const [perkInput, setPerkInput] = useState({ preset: '', customLabel: '', customValue: '' });
  const [expandedSection, setExpandedSection] = useState('cruise');
  const [viewingTrip, setViewingTrip] = useState(null);

  useEffect(() => {
    storageSet('rc_trips', trips);
  }, [trips]);

  const num = (v) => parseFloat(v) || 0;

  const calcTotals = (t) => {
    const cruiseBase = num(t.cruiseCost) + num(t.taxes);
    const travel = num(t.airfare) + num(t.hotel);
    const onboard = num(t.foodDrinks) + num(t.excursions) + num(t.spa) + num(t.shopping) + num(t.otherOnboard);
    const casino = num(t.casinoSpend);
    const total = cruiseBase + travel + onboard + casino;
    const perksValue = (t.perks || []).reduce((s, p) => s + num(p.value), 0);
    const net = total - perksValue;
    const pts = num(t.casinoPointsEarned);
    const costPerPoint = pts > 0 ? casino / pts : 0;
    const goalPct = t.casinoPointsGoal > 0 ? Math.min((pts / num(t.casinoPointsGoal)) * 100, 100) : 0;
    return { cruiseBase, travel, onboard, casino, total, perksValue, net, pts, costPerPoint, goalPct };
  };

  const addPerk = () => {
    const preset = PERK_PRESETS.find(p => p.label === perkInput.preset);
    if (!preset) return;
    const label = preset.label === 'Custom Perk' ? (perkInput.customLabel || 'Custom Perk') : preset.label;
    const value = preset.label === 'Custom Perk' ? num(perkInput.customValue) : preset.value;
    if (!label || value <= 0) return;
    setNewTrip(t => ({ ...t, perks: [...(t.perks || []), { id: Date.now(), label, value }] }));
    setPerkInput({ preset: '', customLabel: '', customValue: '' });
  };

  const removePerk = (id) => setNewTrip(t => ({ ...t, perks: t.perks.filter(p => p.id !== id) }));

  const saveTrip = () => {
    if (!newTrip.name) return;
    if (activeTrip) {
      setTrips(ts => ts.map(t => t.id === activeTrip ? newTrip : t));
      setActiveTrip(null);
    } else {
      setTrips(ts => [...ts, newTrip]);
    }
    setNewTrip({ ...EMPTY_TRIP, id: Date.now() });
    setShowNewTripForm(false);
    setExpandedSection('cruise');
  };

  const editTrip = (trip) => {
    setNewTrip(trip);
    setActiveTrip(trip.id);
    setShowNewTripForm(true);
    setViewingTrip(null);
  };

  const deleteTrip = (id) => setTrips(ts => ts.filter(t => t.id !== id));

  const field = (key, label, placeholder = '', type = 'number', prefix = '$') => (
    <div className="flex flex-col gap-1">
      <label className={`text-xs font-medium ${d('text-gray-500', 'text-gray-400')}`}>{label}</label>
      <div className="relative">
        {type === 'number' && (
          <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm ${d('text-gray-400', 'text-gray-500')}`}>{prefix}</span>
        )}
        <input
          type={type}
          placeholder={placeholder}
          value={newTrip[key] || ''}
          onChange={e => setNewTrip(t => ({ ...t, [key]: e.target.value }))}
          className={`w-full ${type === 'number' ? 'pl-7' : 'pl-3'} pr-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${d('bg-white border-gray-200 text-gray-800', 'bg-gray-800 border-gray-600 text-white placeholder-gray-500')}`}
        />
      </div>
    </div>
  );

  const Section = ({ id, title, icon: Icon, children }) => (
    <div className={`rounded-xl overflow-hidden border mb-3 ${d('border-gray-200', 'border-gray-700')}`}>
      <button
        onClick={() => setExpandedSection(expandedSection === id ? null : id)}
        className={`w-full flex items-center justify-between px-4 py-3 text-sm font-semibold ${d('bg-gray-50 text-gray-700 hover:bg-gray-100', 'bg-gray-800 text-gray-200 hover:bg-gray-750')}`}
      >
        <span className="flex items-center gap-2"><Icon className="w-4 h-4" />{title}</span>
        {expandedSection === id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {expandedSection === id && (
        <div className={`px-4 py-4 ${d('bg-white', 'bg-gray-900')}`}>{children}</div>
      )}
    </div>
  );

  const fmt = (n) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 });
  const fmtPts = (n) => n.toLocaleString('en-US');

  // Summary card for trip list
  const TripCard = ({ t }) => {
    const totals = calcTotals(t);
    return (
      <div
        className={`rounded-xl border p-4 cursor-pointer transition-all hover:shadow-md ${d('bg-white border-gray-200 hover:border-blue-300', 'bg-gray-800 border-gray-700 hover:border-blue-600')}`}
        onClick={() => setViewingTrip(viewingTrip === t.id ? null : t.id)}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className={`font-bold ${d('text-gray-900', 'text-white')}`}>{t.name || 'Unnamed Trip'}</p>
            <p className={`text-xs mt-0.5 ${d('text-gray-500', 'text-gray-400')}`}>{t.ship}{t.sailDate ? ` · ${t.sailDate}` : ''}{t.nights ? ` · ${t.nights}N` : ''}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={e => { e.stopPropagation(); editTrip(t); }} className={`p-1.5 rounded-lg text-xs ${d('bg-gray-100 hover:bg-gray-200 text-gray-600', 'bg-gray-700 hover:bg-gray-600 text-gray-300')}`}>Edit</button>
            <button onClick={e => { e.stopPropagation(); deleteTrip(t.id); }} className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-3">
          <div className={`rounded-lg p-2 text-center ${d('bg-red-50', 'bg-red-900/20')}`}>
            <p className={`text-xs ${d('text-red-500', 'text-red-400')}`}>Total Spent</p>
            <p className={`text-sm font-bold ${d('text-red-600', 'text-red-300')}`}>{fmt(totals.total)}</p>
          </div>
          <div className={`rounded-lg p-2 text-center ${d('bg-green-50', 'bg-green-900/20')}`}>
            <p className={`text-xs ${d('text-green-600', 'text-green-400')}`}>Perks Value</p>
            <p className={`text-sm font-bold ${d('text-green-700', 'text-green-300')}`}>{fmt(totals.perksValue)}</p>
          </div>
          <div className={`rounded-lg p-2 text-center ${totals.net <= 0 ? d('bg-blue-50', 'bg-blue-900/20') : d('bg-orange-50', 'bg-orange-900/20')}`}>
            <p className={`text-xs ${totals.net <= 0 ? d('text-blue-500', 'text-blue-400') : d('text-orange-500', 'text-orange-400')}`}>Net Cost</p>
            <p className={`text-sm font-bold ${totals.net <= 0 ? d('text-blue-700', 'text-blue-300') : d('text-orange-700', 'text-orange-300')}`}>{fmt(totals.net)}</p>
          </div>
        </div>

        {totals.pts > 0 && (
          <div className={`mt-2 flex items-center gap-2 text-xs ${d('text-gray-500', 'text-gray-400')}`}>
            <Trophy className="w-3.5 h-3.5 text-yellow-500" />
            <span>{fmtPts(totals.pts)} pts earned</span>
            {totals.costPerPoint > 0 && <span className={`ml-auto ${d('text-gray-400', 'text-gray-500')}`}>{fmt(totals.costPerPoint)}/pt</span>}
          </div>
        )}

        {/* Expanded detail */}
        {viewingTrip === t.id && (
          <div className={`mt-3 pt-3 border-t ${d('border-gray-100', 'border-gray-700')}`} onClick={e => e.stopPropagation()}>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                ['Cruise + Taxes', totals.cruiseBase],
                ['Travel (Air/Hotel)', totals.travel],
                ['Onboard Spend', totals.onboard],
                ['Casino Spend', totals.casino],
              ].map(([label, val]) => val > 0 && (
                <div key={label} className="flex justify-between">
                  <span className={d('text-gray-500', 'text-gray-400')}>{label}</span>
                  <span className={d('text-gray-700', 'text-gray-300')}>{fmt(val)}</span>
                </div>
              ))}
            </div>
            {t.perks?.length > 0 && (
              <div className={`mt-2 pt-2 border-t ${d('border-gray-100', 'border-gray-700')}`}>
                <p className={`text-xs font-semibold mb-1 ${d('text-gray-500', 'text-gray-400')}`}>Perks Received</p>
                {t.perks.map(p => (
                  <div key={p.id} className="flex justify-between text-xs">
                    <span className={d('text-gray-600', 'text-gray-400')}>{p.label}</span>
                    <span className={d('text-green-600', 'text-green-400')}>{fmt(p.value)}</span>
                  </div>
                ))}
              </div>
            )}
            {totals.goalPct > 0 && (
              <div className="mt-2">
                <div className="flex justify-between text-xs mb-1">
                  <span className={d('text-gray-500', 'text-gray-400')}>Points Goal Progress</span>
                  <span className={d('text-gray-600', 'text-gray-300')}>{totals.goalPct.toFixed(0)}%</span>
                </div>
                <div className={`h-1.5 rounded-full ${d('bg-gray-100', 'bg-gray-700')}`}>
                  <div className="h-full rounded-full bg-yellow-400" style={{ width: `${totals.goalPct}%` }} />
                </div>
              </div>
            )}
            {t.notes && <p className={`mt-2 text-xs italic ${d('text-gray-400', 'text-gray-500')}`}>{t.notes}</p>}
          </div>
        )}
      </div>
    );
  };

  // Aggregate stats
  const allTotals = trips.map(calcTotals);
  const aggTotal = allTotals.reduce((s, t) => s + t.total, 0);
  const aggPerks = allTotals.reduce((s, t) => s + t.perksValue, 0);
  const aggNet = allTotals.reduce((s, t) => s + t.net, 0);
  const aggPts = allTotals.reduce((s, t) => s + t.pts, 0);
  const aggCasino = allTotals.reduce((s, t) => s + t.casino, 0);

  return (
    <div>
      {/* Aggregate Banner */}
      {trips.length > 1 && (
        <div className={`rounded-xl p-4 mb-5 border ${d('bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100', 'bg-gradient-to-r from-blue-900/20 to-indigo-900/20 border-blue-800')}`}>
          <p className={`text-xs font-semibold uppercase tracking-wide mb-3 ${d('text-blue-700', 'text-blue-300')}`}><BarChart2 className="w-4 h-4 inline mr-1" />All Trips Summary</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              ['Total Spent', fmt(aggTotal), d('text-red-600', 'text-red-300')],
              ['Perks Value', fmt(aggPerks), d('text-green-600', 'text-green-300')],
              ['Net Cost', fmt(aggNet), d('text-blue-700', 'text-blue-300')],
              ['Casino Points', fmtPts(aggPts), d('text-yellow-600', 'text-yellow-400')],
            ].map(([l, v, cls]) => (
              <div key={l}>
                <p className={`text-xs ${d('text-gray-500', 'text-gray-400')}`}>{l}</p>
                <p className={`text-base font-bold ${cls}`}>{v}</p>
              </div>
            ))}
          </div>
          {aggCasino > 0 && aggPts > 0 && (
            <p className={`text-xs mt-2 ${d('text-gray-500', 'text-gray-400')}`}>
              Average casino cost-per-point: <span className="font-semibold">{fmt(aggCasino / aggPts)}</span> across all trips
            </p>
          )}
        </div>
      )}

      {/* Trip List */}
      {trips.length > 0 && !showNewTripForm && (
        <div className="space-y-3 mb-5">
          {trips.map(t => <TripCard key={t.id} t={t} />)}
        </div>
      )}

      {/* New/Edit Trip Form */}
      {showNewTripForm ? (
        <div className={`rounded-xl border p-5 ${d('border-blue-200 bg-blue-50/30', 'border-blue-800 bg-blue-900/10')}`}>
          <h3 className={`text-base font-bold mb-4 ${d('text-gray-800', 'text-white')}`}>
            {activeTrip ? '✏️ Edit Trip' : '🚢 New Trip'}
          </h3>

          {/* Trip Name & Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <div className="flex flex-col gap-1">
              <label className={`text-xs font-medium ${d('text-gray-500', 'text-gray-400')}`}>Trip Name *</label>
              <input type="text" placeholder="e.g. Harmony 5-night Aug 2025" value={newTrip.name} onChange={e => setNewTrip(t => ({ ...t, name: e.target.value }))}
                className={`px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${d('bg-white border-gray-200 text-gray-800', 'bg-gray-800 border-gray-600 text-white placeholder-gray-500')}`} />
            </div>
            <div className="flex flex-col gap-1">
              <label className={`text-xs font-medium ${d('text-gray-500', 'text-gray-400')}`}>Ship</label>
              <input type="text" placeholder="e.g. Harmony of the Seas" value={newTrip.ship} onChange={e => setNewTrip(t => ({ ...t, ship: e.target.value }))}
                className={`px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${d('bg-white border-gray-200 text-gray-800', 'bg-gray-800 border-gray-600 text-white placeholder-gray-500')}`} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <label className={`text-xs font-medium ${d('text-gray-500', 'text-gray-400')}`}>Sail Date</label>
                <input type="date" value={newTrip.sailDate} onChange={e => setNewTrip(t => ({ ...t, sailDate: e.target.value }))}
                  className={`px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${d('bg-white border-gray-200 text-gray-800', 'bg-gray-800 border-gray-600 text-white')}`} />
              </div>
              <div className="flex flex-col gap-1">
                <label className={`text-xs font-medium ${d('text-gray-500', 'text-gray-400')}`}>Nights</label>
                <input type="number" placeholder="7" value={newTrip.nights} onChange={e => setNewTrip(t => ({ ...t, nights: e.target.value }))}
                  className={`px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${d('bg-white border-gray-200 text-gray-800', 'bg-gray-800 border-gray-600 text-white')}`} />
              </div>
            </div>
          </div>

          <Section id="cruise" title="Cruise Cost" icon={Anchor}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {field('cruiseCost', 'Cruise Fare (Ticket)', '0')}
              {field('taxes', 'Taxes & Port Fees', '0')}
              {field('airfare', 'Airfare', '0')}
              {field('hotel', 'Pre/Post Hotel', '0')}
            </div>
          </Section>

          <Section id="onboard" title="Onboard Spending" icon={DollarSign}>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {field('foodDrinks', 'Food & Drinks', '0')}
              {field('excursions', 'Excursions', '0')}
              {field('spa', 'Spa & Wellness', '0')}
              {field('shopping', 'Shopping', '0')}
              {field('otherOnboard', 'Other Onboard', '0')}
            </div>
          </Section>

          <Section id="casino" title="Casino (Optional)" icon={Trophy}>
            <div className={`flex items-start gap-2 mb-3 p-2 rounded-lg text-xs ${d('bg-amber-50 text-amber-700', 'bg-amber-900/20 text-amber-400')}`}>
              <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span>Casino data is stored locally on your device and never shared.</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {field('casinoSpend', 'Casino Buy-ins / Losses', '0')}
              {field('casinoPointsEarned', 'Casino Points Earned', '0', 'number', '🏆')}
              {field('casinoPointsGoal', 'Points Goal (optional)', '0', 'number', '🎯')}
            </div>
          </Section>

          <Section id="perks" title="Perks & Rewards Received" icon={Gift}>
            <div className="flex gap-2 mb-3 flex-wrap">
              <select value={perkInput.preset} onChange={e => setPerkInput(p => ({ ...p, preset: e.target.value }))}
                className={`flex-1 px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${d('bg-white border-gray-200 text-gray-800', 'bg-gray-800 border-gray-600 text-white')}`}>
                <option value="">Select a perk…</option>
                {PERK_PRESETS.map(p => <option key={p.label} value={p.label}>{p.label}{p.value > 0 ? ` (~$${p.value})` : ''}</option>)}
              </select>
              {perkInput.preset === 'Custom Perk' && (
                <>
                  <input type="text" placeholder="Perk description" value={perkInput.customLabel} onChange={e => setPerkInput(p => ({ ...p, customLabel: e.target.value }))}
                    className={`w-40 px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${d('bg-white border-gray-200 text-gray-800', 'bg-gray-800 border-gray-600 text-white placeholder-gray-500')}`} />
                  <input type="number" placeholder="$ value" value={perkInput.customValue} onChange={e => setPerkInput(p => ({ ...p, customValue: e.target.value }))}
                    className={`w-24 px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${d('bg-white border-gray-200 text-gray-800', 'bg-gray-800 border-gray-600 text-white placeholder-gray-500')}`} />
                </>
              )}
              <button onClick={addPerk} disabled={!perkInput.preset} className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-sm rounded-lg flex items-center gap-1">
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>
            {newTrip.perks?.length > 0 && (
              <div className="space-y-1">
                {newTrip.perks.map(p => (
                  <div key={p.id} className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-sm ${d('bg-green-50 text-green-800', 'bg-green-900/20 text-green-300')}`}>
                    <span>{p.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{fmt(p.value)}</span>
                      <button onClick={() => removePerk(p.id)} className="text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>

          {/* Live Summary */}
          {(() => {
            const t = calcTotals(newTrip);
            return (
              <div className={`rounded-xl p-4 mb-4 ${d('bg-gray-50 border border-gray-200', 'bg-gray-800 border border-gray-700')}`}>
                <p className={`text-xs font-semibold uppercase tracking-wide mb-3 ${d('text-gray-500', 'text-gray-400')}`}>Live Summary</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <p className={`text-xs ${d('text-gray-500', 'text-gray-400')}`}>Total Spent</p>
                    <p className={`text-lg font-bold ${d('text-red-600', 'text-red-400')}`}>{fmt(t.total)}</p>
                  </div>
                  <div>
                    <p className={`text-xs ${d('text-gray-500', 'text-gray-400')}`}>Perks Value</p>
                    <p className={`text-lg font-bold ${d('text-green-600', 'text-green-400')}`}>{fmt(t.perksValue)}</p>
                  </div>
                  <div>
                    <p className={`text-xs ${d('text-gray-500', 'text-gray-400')}`}>Net Cost</p>
                    <p className={`text-lg font-bold ${t.net <= 0 ? d('text-blue-700', 'text-blue-400') : d('text-orange-600', 'text-orange-400')}`}>{fmt(t.net)}</p>
                    {t.net <= 0 && <p className={`text-xs ${d('text-blue-500', 'text-blue-400')}`}>🎉 Perks exceed cost!</p>}
                  </div>
                  {t.pts > 0 && (
                    <div>
                      <p className={`text-xs ${d('text-gray-500', 'text-gray-400')}`}>Casino Points</p>
                      <p className={`text-lg font-bold ${d('text-yellow-600', 'text-yellow-400')}`}>{fmtPts(t.pts)}</p>
                      {t.costPerPoint > 0 && <p className={`text-xs ${d('text-gray-400', 'text-gray-500')}`}>{fmt(t.costPerPoint)}/pt</p>}
                    </div>
                  )}
                </div>
                {t.goalPct > 0 && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className={d('text-gray-500', 'text-gray-400')}>Points Goal</span>
                      <span className={d('text-gray-600', 'text-gray-300')}>{fmtPts(num(newTrip.casinoPointsEarned))} / {fmtPts(num(newTrip.casinoPointsGoal))} ({t.goalPct.toFixed(0)}%)</span>
                    </div>
                    <div className={`h-2 rounded-full ${d('bg-gray-200', 'bg-gray-700')}`}>
                      <div className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-yellow-500 transition-all duration-500" style={{ width: `${t.goalPct}%` }} />
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          <div className="flex flex-col gap-2 mb-3">
            <label className={`text-xs font-medium ${d('text-gray-500', 'text-gray-400')}`}>Notes</label>
            <textarea rows={2} placeholder="Anything else to remember about this trip…" value={newTrip.notes} onChange={e => setNewTrip(t => ({ ...t, notes: e.target.value }))}
              className={`px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${d('bg-white border-gray-200 text-gray-800', 'bg-gray-800 border-gray-600 text-white placeholder-gray-500')}`} />
          </div>

          <div className="flex gap-2">
            <button onClick={saveTrip} disabled={!newTrip.name} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-lg text-sm">
              {activeTrip ? 'Update Trip' : 'Save Trip'}
            </button>
            <button onClick={() => { setShowNewTripForm(false); setActiveTrip(null); setNewTrip({ ...EMPTY_TRIP, id: Date.now() }); }} className={`px-4 py-2.5 rounded-lg text-sm font-medium ${d('bg-gray-100 hover:bg-gray-200 text-gray-700', 'bg-gray-700 hover:bg-gray-600 text-gray-200')}`}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowNewTripForm(true)} className="w-full py-3 border-2 border-dashed border-blue-400 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors">
          <Plus className="w-5 h-5" /> Add New Trip
        </button>
      )}
    </div>
  );
}
// ─── End Trip Finance OS ─────────────────────────────────────────────────────

export default function App() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(1);
  const [links, setLinks] = useState([]);
  const [copied, setCopied] = useState(null);
  const [dark, setDark] = useState(false);
  const [lookupCode, setLookupCode] = useState('');
  const [lookupResult, setLookupResult] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  // pdfLoading removed — loading state is handled by react-pdf's built-in loading prop
  const [pdfError, setPdfError] = useState(null);
  const [activeTab, setActiveTab] = useState('generator');

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  // Points reference for each code
  const pointsReference = {
    'CHN01': '48,088',
    'CHN02': '28,088',
    'CHN03': '16,088',
    'CHN04': '12,888',
    'CHN05': '6,488',
    'CHN06': '2,808',
    'CHN07': '2,088',
    'SVIP2': '40,000',
    'S01': '25,000',
    'S02': '15,000',
    'S02A': '9,000',
    'S03': '6,500',
    'S03A': '4,000',
    'S04': '3,000',
    'S05': '2,000',
    'S06': '1,500',
    'S07': '1,200',
    'S08': '800',
  };

  const d = (light, darkCls) => (dark ? darkCls : light);

  const generate = () => {
    const yy = String(year).slice(-2);
    const mm = String(month).padStart(2, '0');
    const generated = [];
    
    // Generate CHN codes (CHN01 through CHN07)
    for (let x = 1; x <= 7; x++) {
      const f = `${yy}${mm}CHN0${x}.pdf`;
      generated.push({
        label: `CHN0${x}`,
        filename: f,
        url: BASE_URL + f,
        group: 'CHN',
      });
    }
    
    // Generate Singapore codes in correct order
    // SVIP2
    const svip2 = `${yy}${mm}SVIP2.pdf`;
    generated.push({
      label: 'SVIP2',
      filename: svip2,
      url: BASE_URL + svip2,
      group: 'S',
    });
    
    // S01
    const s01 = `${yy}${mm}S01.pdf`;
    generated.push({
      label: 'S01',
      filename: s01,
      url: BASE_URL + s01,
      group: 'S',
    });
    
    // S02
    const s02 = `${yy}${mm}S02.pdf`;
    generated.push({
      label: 'S02',
      filename: s02,
      url: BASE_URL + s02,
      group: 'S',
    });
    
    // S02A
    const s02a = `${yy}${mm}S02A.pdf`;
    generated.push({
      label: 'S02A',
      filename: s02a,
      url: BASE_URL + s02a,
      group: 'S',
    });
    
    // S03
    const s03 = `${yy}${mm}S03.pdf`;
    generated.push({
      label: 'S03',
      filename: s03,
      url: BASE_URL + s03,
      group: 'S',
    });
    
    // S03A
    const s03a = `${yy}${mm}S03A.pdf`;
    generated.push({
      label: 'S03A',
      filename: s03a,
      url: BASE_URL + s03a,
      group: 'S',
    });
    
    // S04 through S08
    for (let x = 4; x <= 8; x++) {
      const f = `${yy}${mm}S0${x}.pdf`;
      generated.push({
        label: `S0${x}`,
        filename: f,
        url: BASE_URL + f,
        group: 'S',
      });
    }
    
    setLinks(generated);
    setCopied(null);
  };

  const openPdf = (url) => window.open(url, '_blank');

  const previewPdf = (url) => {
    setPreviewUrl(url);
    setPageNumber(1);
    setNumPages(null);
    setPdfError(null);
  };

  const closePreview = () => {
    setPreviewUrl(null);
    setPageNumber(1);
    setNumPages(null);
    setPdfError(null);
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPdfError(null);
  };

  const onDocumentLoadError = (error) => {
    console.error('PDF Load Error:', error);
    setPdfError('Failed to load PDF. The server may be blocking access.');
  };

  const goToPrevPage = () => {
    setPageNumber((prev) => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setPageNumber((prev) => Math.min(prev + 1, numPages || 1));
  };

  const copyAll = () => {
    navigator.clipboard.writeText(links.map((l) => l.url).join('\n'));
    setCopied('all');
    setTimeout(() => setCopied(null), 2000);
  };

  const copyGroup = (group) => {
    const key = 'group-' + group;
    navigator.clipboard.writeText(
      links
        .filter((l) => l.group === group)
        .map((l) => l.url)
        .join('\n')
    );
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const copySingle = (url, key) => {
    navigator.clipboard.writeText(url);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleLookup = () => {
    const code = lookupCode.trim().toUpperCase();
    if (!code) return;
    const filename = code.endsWith('.PDF') ? code : code + '.pdf';
    const url = BASE_URL + filename;
    setLookupResult({ filename, url });
  };

  const chnLinks = links.filter((l) => l.group === 'CHN');
  const sLinks = links.filter((l) => l.group === 'S');

  return (
    <div
      className={`min-h-screen transition-colors duration-300 p-6 ${d(
        'bg-gradient-to-br from-blue-50 to-indigo-100',
        'bg-gray-950'
      )}`}
    >
      <div
        className={`max-w-4xl mx-auto rounded-2xl shadow-xl p-8 transition-colors duration-300 ${d(
          'bg-white',
          'bg-gray-900'
        )}`}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <Anchor
              className={`w-8 h-8 ${d('text-blue-600', 'text-blue-400')}`}
            />
            <h1
              className={`text-xl font-bold leading-tight ${d(
                'text-gray-800',
                'text-white'
              )}`}
            >
              Royal Caribbean Casino Royale
              <br />
              <span
                className={`text-sm font-semibold ${d(
                  'text-blue-600',
                  'text-blue-400'
                )}`}
              >
                Cruise Tools Dashboard
              </span>
            </h1>
          </div>
          <button
            onClick={() => setDark(!dark)}
            className={`p-2 rounded-full transition-colors ${d(
              'bg-gray-100 hover:bg-gray-200 text-gray-700',
              'bg-gray-700 hover:bg-gray-600 text-yellow-300'
            )}`}
          >
            {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>

        {/* Tab Navigation */}
        <div className={`flex gap-1 p-1 rounded-xl mb-6 ${d('bg-gray-100', 'bg-gray-800')}`}>
          {[
            { id: 'generator', label: 'PDF Generator', icon: FileText },
            { id: 'finance', label: 'Trip Finance OS', icon: Calculator },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all ${
                activeTab === id
                  ? d('bg-white text-blue-700 shadow-sm', 'bg-gray-700 text-blue-300')
                  : d('text-gray-500 hover:text-gray-700', 'text-gray-500 hover:text-gray-300')
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Trip Finance OS Tab */}
        {activeTab === 'finance' && <TripFinanceOS dark={dark} />}

        {/* PDF Generator Tab */}
        {activeTab === 'generator' && <>

        {/* Offer Code Lookup */}
        <div
          className={`rounded-xl p-5 mb-6 border ${d(
            'bg-blue-50 border-blue-100',
            'bg-gray-800 border-gray-700'
          )}`}
        >
          <h2
            className={`text-sm font-semibold uppercase tracking-wide mb-3 ${d(
              'text-blue-700',
              'text-blue-300'
            )}`}
          >
            <Search className="w-4 h-4 inline mr-1 mb-0.5" />
            Offer Code Lookup
          </h2>
          <p className={`text-xs mb-3 ${d('text-gray-500', 'text-gray-400')}`}>
            Enter an offer code (e.g.{' '}
            <span className="font-mono">2601CHN03</span>) to get its direct PDF
            link.
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. 2601CHN03 or 2601S04"
              value={lookupCode}
              onChange={(e) => setLookupCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
              className={`flex-1 px-4 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${d(
                'bg-white border-gray-300 text-gray-800',
                'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
              )}`}
            />
            <button
              onClick={handleLookup}
              disabled={!lookupCode.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg flex items-center gap-1 transition-colors"
            >
              <Search className="w-4 h-4" /> Lookup
            </button>
          </div>
          {lookupResult && (
            <div
              className={`mt-3 p-3 rounded-lg flex items-center justify-between border ${d(
                'bg-white border-gray-200',
                'bg-gray-700 border-gray-600'
              )}`}
            >
              <div className="min-w-0">
                <p
                  className={`text-sm font-mono font-medium truncate ${d(
                    'text-gray-700',
                    'text-gray-200'
                  )}`}
                >
                  {lookupResult.filename}
                </p>
                <p
                  className={`text-xs mt-0.5 font-mono truncate ${d(
                    'text-gray-400',
                    'text-gray-400'
                  )}`}
                >
                  {lookupResult.url}
                </p>
              </div>
              <div className="flex gap-2 ml-3 shrink-0">
                <button
                  onClick={() => previewPdf(lookupResult.url)}
                  className={`text-xs flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${d(
                    'bg-gray-100 hover:bg-gray-200 text-gray-700',
                    'bg-gray-600 hover:bg-gray-500 text-gray-200'
                  )}`}
                >
                  <FileText className="w-3 h-3" />
                  Preview
                </button>
                <button
                  onClick={() => copySingle(lookupResult.url, 'lookup')}
                  className={`text-xs flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${d(
                    'bg-gray-100 hover:bg-gray-200 text-gray-700',
                    'bg-gray-600 hover:bg-gray-500 text-gray-200'
                  )}`}
                >
                  {copied === 'lookup' ? (
                    <Check className="w-3 h-3 text-green-500" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                  {copied === 'lookup' ? 'Copied!' : 'Copy'}
                </button>
                <button
                  onClick={() => openPdf(lookupResult.url)}
                  className="text-xs flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <ExternalLink className="w-3 h-3" /> Open
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Generator Controls */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label
              className={`block text-sm font-medium mb-1 ${d(
                'text-gray-700',
                'text-gray-300'
              )}`}
            >
              Year
            </label>
            <input
              type="number"
              min="2020"
              max="2099"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${d(
                'border-gray-300 text-gray-800',
                'bg-gray-800 border-gray-600 text-white'
              )}`}
            />
          </div>
          <div>
            <label
              className={`block text-sm font-medium mb-1 ${d(
                'text-gray-700',
                'text-gray-300'
              )}`}
            >
              Month
            </label>
            <select
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value))}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${d(
                'border-gray-300 text-gray-800',
                'bg-gray-800 border-gray-600 text-white'
              )}`}
            >
              {monthNames.map((name, i) => (
                <option key={i + 1} value={i + 1}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={generate}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 mb-6"
        >
          <FileText className="w-5 h-5" /> Generate Links
        </button>

        {/* Results */}
        {links.length > 0 && (
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <p className={`text-sm ${d('text-gray-500', 'text-gray-400')}`}>
                {links.length} links —{' '}
                <span className="font-semibold">
                  {monthNames[month - 1]} {year}
                </span>
              </p>
              <button
                onClick={copyAll}
                className={`flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg transition-colors ${d(
                  'bg-gray-100 hover:bg-gray-200 text-gray-700',
                  'bg-gray-700 hover:bg-gray-600 text-gray-200'
                )}`}
              >
                {copied === 'all' ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                {copied === 'all' ? 'Copied!' : 'Copy all'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: 'China (CHN)', data: chnLinks, group: 'CHN' },
                { title: 'Singapore (S)', data: sLinks, group: 'S' },
              ].map(({ title, data, group }) => (
                <div
                  key={group}
                  className={`border rounded-xl overflow-hidden ${d(
                    'border-gray-200',
                    'border-gray-700'
                  )}`}
                >
                  <div
                    className={`flex items-center justify-between px-4 py-2 ${d(
                      'bg-gray-50',
                      'bg-gray-800'
                    )}`}
                  >
                    <span
                      className={`text-xs font-semibold uppercase tracking-wide ${d(
                        'text-gray-500',
                        'text-gray-400'
                      )}`}
                    >
                      {title}
                    </span>
                    <button
                      onClick={() => copyGroup(group)}
                      className={`flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors ${d(
                        'bg-white hover:bg-gray-100 text-gray-600 border border-gray-200',
                        'bg-gray-700 hover:bg-gray-600 text-gray-300 border border-gray-600'
                      )}`}
                    >
                      {copied === 'group-' + group ? (
                        <Check className="w-3 h-3 text-green-500" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      {copied === 'group-' + group ? 'Copied!' : 'Copy group'}
                    </button>
                  </div>
                  <ul
                    className={`divide-y ${d(
                      'divide-gray-100',
                      'divide-gray-700'
                    )}`}
                  >
                    {data.map((link) => (
                      <li
                        key={link.filename}
                        className={`flex items-center justify-between px-4 py-2 transition-colors ${d(
                          'hover:bg-gray-50',
                          'hover:bg-gray-800/60'
                        )}`}
                      >
                        <div className="flex flex-col min-w-0">
                          <span
                            className={`text-sm font-mono truncate ${d(
                              'text-blue-600',
                              'text-blue-400'
                            )}`}
                          >
                            {link.filename}
                          </span>
                          <span
                            className={`text-xs ${d(
                              'text-gray-500',
                              'text-gray-400'
                            )}`}
                          >
                            {pointsReference[link.label]} points
                          </span>
                        </div>
                        <div className="flex items-center gap-1 ml-2 shrink-0">
                          <button
                            onClick={() => previewPdf(link.url)}
                            title="Preview PDF"
                            className={`p-1 rounded transition-colors ${d(
                              'text-gray-400 hover:text-gray-700',
                              'text-gray-500 hover:text-gray-300'
                            )}`}
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => copySingle(link.url, link.filename)}
                            title="Copy URL"
                            className={`p-1 rounded transition-colors ${d(
                              'text-gray-400 hover:text-gray-700',
                              'text-gray-500 hover:text-gray-300'
                            )}`}
                          >
                            {copied === link.filename ? (
                              <Check className="w-4 h-4 text-green-500" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => openPdf(link.url)}
                            title="Open PDF"
                            className={`p-1 rounded transition-colors ${d(
                              'text-gray-400 hover:text-blue-600',
                              'text-gray-500 hover:text-blue-400'
                            )}`}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PDF Preview Modal */}
        {previewUrl && (
          <div
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
            onClick={closePreview}
          >
            <div
              className={`relative w-full h-full max-w-6xl max-h-[90vh] rounded-lg overflow-hidden shadow-2xl flex flex-col ${d(
                'bg-white',
                'bg-gray-900'
              )}`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div
                className={`flex items-center justify-between p-4 border-b shrink-0 ${d(
                  'bg-gray-50 border-gray-200',
                  'bg-gray-800 border-gray-700'
                )}`}
              >
                <h3
                  className={`text-lg font-semibold ${d(
                    'text-gray-800',
                    'text-white'
                  )}`}
                >
                  Certificate Preview
                  {numPages && (
                    <span
                      className={`ml-3 text-sm font-normal ${d(
                        'text-gray-500',
                        'text-gray-400'
                      )}`}
                    >
                      Page {pageNumber} of {numPages}
                    </span>
                  )}
                </h3>
                <div className="flex items-center gap-2">
                  {numPages && numPages > 1 && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={goToPrevPage}
                        disabled={pageNumber <= 1}
                        className="p-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={goToNextPage}
                        disabled={pageNumber >= numPages}
                        className="p-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  <button
                    onClick={() => window.open(previewUrl, '_blank')}
                    className="text-sm flex items-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open Full PDF
                  </button>
                  <button
                    onClick={closePreview}
                    className={`text-2xl font-bold leading-none px-2 ${d(
                      'text-gray-500 hover:text-gray-700',
                      'text-gray-400 hover:text-gray-200'
                    )}`}
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* PDF Content */}
              <div
                className={`flex-1 overflow-auto flex items-center justify-center p-4 ${d(
                  'bg-gray-100',
                  'bg-gray-950'
                )}`}
              >
                {pdfError ? (
                  <div className="text-center">
                    <p
                      className={`text-lg mb-4 ${d(
                        'text-gray-700',
                        'text-gray-300'
                      )}`}
                    >
                      {pdfError}
                    </p>
                    <button
                      onClick={() => window.open(previewUrl, '_blank')}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      Open PDF in New Tab Instead
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Document
                      file={previewUrl}
                      onLoadSuccess={onDocumentLoadSuccess}
                      onLoadError={onDocumentLoadError}
                      loading={
                        <div className="flex flex-col items-center gap-3">
                          <Loader className="w-8 h-8 animate-spin text-blue-600" />
                          <p
                            className={`text-sm ${d(
                              'text-gray-600',
                              'text-gray-400'
                            )}`}
                          >
                            Loading PDF...
                          </p>
                        </div>
                      }
                      options={{
                        cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
                        cMapPacked: true,
                      }}
                    >
                      <Page
                        pageNumber={pageNumber}
                        renderTextLayer={true}
                        renderAnnotationLayer={true}
                        className="shadow-lg"
                        width={Math.min(window.innerWidth * 0.8, 900)}
                      />
                    </Document>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
