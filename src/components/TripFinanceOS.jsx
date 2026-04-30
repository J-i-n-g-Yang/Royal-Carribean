import React, { useState, useEffect } from 'react';
import {
  Calculator, DollarSign, Trophy, Gift, Info, Plus, Trash2,
  BarChart2, ChevronDown, ChevronUp, Anchor,
} from 'lucide-react';
import { PERK_PRESETS, EMPTY_TRIP } from '../data/constants';
import { storageGet, storageSet, calcTotals, fmt, fmtPts, num } from '../utils/helpers';

export default function TripFinanceOS({ dark }) {
  const d = (light, darkCls) => (dark ? darkCls : light);

  const [trips, setTrips] = useState(() => storageGet('rc_trips', []));
  const [activeTrip, setActiveTrip] = useState(null);
  const [showNewTripForm, setShowNewTripForm] = useState(false);
  const [newTrip, setNewTrip] = useState({ ...EMPTY_TRIP, id: Date.now() });
  const [perkInput, setPerkInput] = useState({ preset: '', customLabel: '', customValue: '' });
  const [expandedSection, setExpandedSection] = useState('cruise');
  const [viewingTrip, setViewingTrip] = useState(null);

  useEffect(() => { storageSet('rc_trips', trips); }, [trips]);

  // ── Helpers ──────────────────────────────────────────────────────────────

  const addPerk = () => {
    const preset = PERK_PRESETS.find((p) => p.label === perkInput.preset);
    if (!preset) return;
    const label = preset.label === 'Custom Perk' ? (perkInput.customLabel || 'Custom Perk') : preset.label;
    const value = preset.label === 'Custom Perk' ? num(perkInput.customValue) : preset.value;
    if (!label || value <= 0) return;
    setNewTrip((t) => ({ ...t, perks: [...(t.perks || []), { id: Date.now(), label, value }] }));
    setPerkInput({ preset: '', customLabel: '', customValue: '' });
  };

  const removePerk = (id) => setNewTrip((t) => ({ ...t, perks: t.perks.filter((p) => p.id !== id) }));

  const saveTrip = () => {
    if (!newTrip.name) return;
    if (activeTrip) {
      setTrips((ts) => ts.map((t) => (t.id === activeTrip ? newTrip : t)));
      setActiveTrip(null);
    } else {
      setTrips((ts) => [...ts, newTrip]);
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

  const deleteTrip = (id) => setTrips((ts) => ts.filter((t) => t.id !== id));

  // ── Sub-components ───────────────────────────────────────────────────────

  // const NumberField = ({ fieldKey, label, placeholder = '0', prefix = '$' }) => (
  //   <div className="flex flex-col gap-1">
  //     <label className={`text-xs font-medium ${d('text-gray-500', 'text-gray-400')}`}>{label}</label>
  //     <div className="relative">
  //       <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm ${d('text-gray-400', 'text-gray-500')}`}>{prefix}</span>
  //       <input
  //         type="text" inputMode="decimal" placeholder={placeholder}
  //         value={newTrip[fieldKey] || ''}
  //         onChange={(e) => {
  //           let val = e.target.value.replace(/[^\d.]/g, '');
  //           const parts = val.split('.');
  //           if (parts.length > 2) val = parts[0] + '.' + parts.slice(1).join('');
  //           setNewTrip((prev) => ({ ...prev, [fieldKey]: val }));
  //         }}
  //         className={`w-full pl-7 pr-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${d('bg-white border-gray-200 text-gray-800', 'bg-gray-800 border-gray-600 text-white placeholder-gray-500')}`}
  //       />
  //     </div>
  //   </div>
  // );

  const NumberField = ({ fieldKey, label, placeholder = '0', prefix = '$' }) => {
  const [localValue, setLocalValue] = React.useState('');

  // Only initialize when trip changes (NOT every keystroke)
  useEffect(() => {
    setLocalValue(newTrip[fieldKey] ?? '');
    // eslint-disable-next-line
  }, [activeTrip]); // 👈 key fix: depend on trip switch, not field value

  const handleChange = (e) => {
    setLocalValue(e.target.value); // no validation here
  };

  const handleBlur = () => {
    let val = localValue.replace(/[^\d.]/g, '');
    const parts = val.split('.');
    if (parts.length > 2) val = parts[0] + '.' + parts.slice(1).join('');

    setNewTrip((prev) => ({
      ...prev,
      [fieldKey]: val
    }));

    // optional formatting
    if (val) {
      const numVal = parseFloat(val);
      if (!isNaN(numVal)) {
        setLocalValue(
          numVal.toLocaleString(undefined, {
            maximumFractionDigits: 2
          })
        );
      }
    }
  };

  const handleFocus = () => {
    setLocalValue((v) => v.toString().replace(/,/g, ''));
  };

  return (
    <div className="flex flex-col gap-1">
      <label className={`text-xs font-medium ${d('text-gray-500', 'text-gray-400')}`}>
        {label}
      </label>

      <div className="relative">
        <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm ${d('text-gray-400', 'text-gray-500')}`}>
          {prefix}
        </span>

        <input
          type="text"
          inputMode="decimal"
          placeholder={placeholder}
          value={localValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          className={`w-full pl-7 pr-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            d('bg-white border-gray-200 text-gray-800', 'bg-gray-800 border-gray-600 text-white placeholder-gray-500')
          }`}
        />
      </div>
    </div>
  );
};

  const Section = ({ id, title, icon: Icon, children }) => (
    <div className={`rounded-xl overflow-hidden border mb-3 ${d('border-gray-200', 'border-gray-700')}`}>
      <button
        onClick={() => setExpandedSection(expandedSection === id ? null : id)}
        className={`w-full flex items-center justify-between px-4 py-3 text-sm font-semibold ${d('bg-gray-50 text-gray-700 hover:bg-gray-100', 'bg-gray-800 text-gray-200 hover:bg-gray-750')}`}>
        <span className="flex items-center gap-2"><Icon className="w-4 h-4" />{title}</span>
        {expandedSection === id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {expandedSection === id && (
        <div className={`px-4 py-4 ${d('bg-white', 'bg-gray-900')}`}>{children}</div>
      )}
    </div>
  );

  const TripCard = ({ t }) => {
    const totals = calcTotals(t);
    return (
      <div className={`rounded-xl border p-4 cursor-pointer transition-all hover:shadow-md ${d('bg-white border-gray-200 hover:border-blue-300', 'bg-gray-800 border-gray-700 hover:border-blue-600')}`}
        onClick={() => setViewingTrip(viewingTrip === t.id ? null : t.id)}>
        <div className="flex items-start justify-between">
          <div>
            <p className={`font-bold ${d('text-gray-900', 'text-white')}`}>{t.name || 'Unnamed Trip'}</p>
            <p className={`text-xs mt-0.5 ${d('text-gray-500', 'text-gray-400')}`}>
              {t.ship}{t.sailDate ? ` · ${t.sailDate}` : ''}{t.nights ? ` · ${t.nights}N` : ''}
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={(e) => { e.stopPropagation(); editTrip(t); }}
              className={`p-1.5 rounded-lg text-xs ${d('bg-gray-100 hover:bg-gray-200 text-gray-600', 'bg-gray-700 hover:bg-gray-600 text-gray-300')}`}>Edit</button>
            <button onClick={(e) => { e.stopPropagation(); deleteTrip(t.id); }}
              className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-500">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-3">
          {[
            ['Total Spent', fmt(totals.total), d('bg-red-50 text-red-500', 'bg-red-900/20 text-red-400'), d('text-red-600', 'text-red-300')],
            ['Perks Value', fmt(totals.perksValue), d('bg-green-50 text-green-600', 'bg-green-900/20 text-green-400'), d('text-green-700', 'text-green-300')],
            ['Net Cost', fmt(totals.net),
              totals.net <= 0 ? d('bg-blue-50 text-blue-500', 'bg-blue-900/20 text-blue-400') : d('bg-orange-50 text-orange-500', 'bg-orange-900/20 text-orange-400'),
              totals.net <= 0 ? d('text-blue-700', 'text-blue-300') : d('text-orange-700', 'text-orange-300')],
          ].map(([label, val, bgCls, textCls]) => (
            <div key={label} className={`rounded-lg p-2 text-center ${bgCls}`}>
              <p className="text-xs">{label}</p>
              <p className={`text-sm font-bold ${textCls}`}>{val}</p>
            </div>
          ))}
        </div>

        {totals.pts > 0 && (
          <div className={`mt-2 flex items-center gap-2 text-xs ${d('text-gray-500', 'text-gray-400')}`}>
            <Trophy className="w-3.5 h-3.5 text-yellow-500" />
            <span>{fmtPts(totals.pts)} pts earned</span>
            {totals.costPerPoint > 0 && <span className={`ml-auto ${d('text-gray-400', 'text-gray-500')}`}>{fmt(totals.costPerPoint)}/pt</span>}
          </div>
        )}

        {viewingTrip === t.id && (
          <div className={`mt-3 pt-3 border-t ${d('border-gray-100', 'border-gray-700')}`} onClick={(e) => e.stopPropagation()}>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[['Cruise + Taxes', totals.cruiseBase], ['Travel (Air/Hotel)', totals.travel], ['Onboard Spend', totals.onboard], ['Casino Spend', totals.casino]]
                .map(([label, val]) => val > 0 && (
                  <div key={label} className="flex justify-between">
                    <span className={d('text-gray-500', 'text-gray-400')}>{label}</span>
                    <span className={d('text-gray-700', 'text-gray-300')}>{fmt(val)}</span>
                  </div>
                ))}
            </div>
            {t.perks?.length > 0 && (
              <div className={`mt-2 pt-2 border-t ${d('border-gray-100', 'border-gray-700')}`}>
                <p className={`text-xs font-semibold mb-1 ${d('text-gray-500', 'text-gray-400')}`}>Perks Received</p>
                {t.perks.map((p) => (
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

  // ── Aggregate stats ───────────────────────────────────────────────────────

  const allTotals  = trips.map(calcTotals);
  const aggTotal   = allTotals.reduce((s, t) => s + t.total, 0);
  const aggPerks   = allTotals.reduce((s, t) => s + t.perksValue, 0);
  const aggNet     = allTotals.reduce((s, t) => s + t.net, 0);
  const aggPts     = allTotals.reduce((s, t) => s + t.pts, 0);
  const aggCasino  = allTotals.reduce((s, t) => s + t.casino, 0);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div>
      {/* Aggregate Banner */}
      {trips.length > 1 && (
        <div className={`rounded-xl p-4 mb-5 border ${d('bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100', 'bg-gradient-to-r from-blue-900/20 to-indigo-900/20 border-blue-800')}`}>
          <p className={`text-xs font-semibold uppercase tracking-wide mb-3 ${d('text-blue-700', 'text-blue-300')}`}>
            <BarChart2 className="w-4 h-4 inline mr-1" />All Trips Summary
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[['Total Spent', fmt(aggTotal), d('text-red-600','text-red-300')], ['Perks Value', fmt(aggPerks), d('text-green-600','text-green-300')], ['Net Cost', fmt(aggNet), d('text-blue-700','text-blue-300')], ['Casino Points', fmtPts(aggPts), d('text-yellow-600','text-yellow-400')]]
              .map(([l, v, cls]) => (
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
          {trips.map((t) => <TripCard key={t.id} t={t} />)}
        </div>
      )}

      {/* New / Edit Trip Form */}
      {showNewTripForm ? (
        <div className={`rounded-xl border p-5 ${d('border-blue-200 bg-blue-50/30', 'border-blue-800 bg-blue-900/10')}`}>
          <h3 className={`text-base font-bold mb-4 ${d('text-gray-800', 'text-white')}`}>
            {activeTrip ? '✏️ Edit Trip' : '🚢 New Trip'}
          </h3>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <div className="flex flex-col gap-1">
              <label className={`text-xs font-medium ${d('text-gray-500', 'text-gray-400')}`}>Trip Name *</label>
              <input type="text" placeholder="e.g. Harmony 5-night Aug 2025" value={newTrip.name || ''}
                onChange={(e) => setNewTrip((prev) => ({ ...prev, name: e.target.value }))}
                className={`px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${d('bg-white border-gray-200 text-gray-800', 'bg-gray-800 border-gray-600 text-white placeholder-gray-500')}`} />
            </div>
            <div className="flex flex-col gap-1">
              <label className={`text-xs font-medium ${d('text-gray-500', 'text-gray-400')}`}>Ship</label>
              <input type="text" placeholder="e.g. Harmony of the Seas" value={newTrip.ship || ''}
                onChange={(e) => setNewTrip((prev) => ({ ...prev, ship: e.target.value }))}
                className={`px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${d('bg-white border-gray-200 text-gray-800', 'bg-gray-800 border-gray-600 text-white placeholder-gray-500')}`} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <label className={`text-xs font-medium ${d('text-gray-500', 'text-gray-400')}`}>Sail Date</label>
                <input type="date" value={newTrip.sailDate || ''}
                  onChange={(e) => setNewTrip((prev) => ({ ...prev, sailDate: e.target.value }))}
                  className={`px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${d('bg-white border-gray-200 text-gray-800', 'bg-gray-800 border-gray-600 text-white')}`} />
              </div>
              <div className="flex flex-col gap-1">
                <label className={`text-xs font-medium ${d('text-gray-500', 'text-gray-400')}`}>Nights</label>
                <input type="text" inputMode="numeric" placeholder="7" value={newTrip.nights || ''}
                  onChange={(e) => setNewTrip((prev) => ({ ...prev, nights: e.target.value.replace(/[^\d]/g, '') }))}
                  className={`px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${d('bg-white border-gray-200 text-gray-800', 'bg-gray-800 border-gray-600 text-white')}`} />
              </div>
            </div>
          </div>

          <Section id="cruise" title="Cruise Cost" icon={Anchor}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <NumberField fieldKey="cruiseCost" label="Cruise Fare (Ticket)" />
              <NumberField fieldKey="taxes" label="Taxes & Port Fees" />
              <NumberField fieldKey="airfare" label="Airfare" />
              <NumberField fieldKey="hotel" label="Pre/Post Hotel" />
            </div>
          </Section>

          <Section id="onboard" title="Onboard Spending" icon={DollarSign}>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <NumberField fieldKey="foodDrinks" label="Food & Drinks" />
              <NumberField fieldKey="excursions" label="Excursions" />
              <NumberField fieldKey="spa" label="Spa & Wellness" />
              <NumberField fieldKey="shopping" label="Shopping" />
              <NumberField fieldKey="otherOnboard" label="Other Onboard" />
            </div>
          </Section>

          <Section id="casino" title="Casino (Optional)" icon={Trophy}>
            <div className={`flex items-start gap-2 mb-3 p-2 rounded-lg text-xs ${d('bg-amber-50 text-amber-700', 'bg-amber-900/20 text-amber-400')}`}>
              <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span>Casino data is stored locally on your device and never shared.</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <NumberField fieldKey="casinoSpend" label="Casino Buy-ins / Losses" />
              <NumberField fieldKey="casinoPointsEarned" label="Casino Points Earned" prefix="🏆" />
              <NumberField fieldKey="casinoPointsGoal" label="Points Goal (optional)" prefix="🎯" />
            </div>
          </Section>

          <Section id="perks" title="Perks & Rewards Received" icon={Gift}>
            <div className="flex gap-2 mb-3 flex-wrap">
              <select value={perkInput.preset} onChange={(e) => setPerkInput((p) => ({ ...p, preset: e.target.value }))}
                className={`flex-1 px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${d('bg-white border-gray-200 text-gray-800', 'bg-gray-800 border-gray-600 text-white')}`}>
                <option value="">Select a perk…</option>
                {PERK_PRESETS.map((p) => <option key={p.label} value={p.label}>{p.label}{p.value > 0 ? ` (~$${p.value})` : ''}</option>)}
              </select>
              {perkInput.preset === 'Custom Perk' && (
                <>
                  <input type="text" placeholder="Perk description" value={perkInput.customLabel || ''}
                    onChange={(e) => setPerkInput((prev) => ({ ...prev, customLabel: e.target.value }))}
                    className={`w-40 px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${d('bg-white border-gray-200 text-gray-800', 'bg-gray-800 border-gray-600 text-white placeholder-gray-500')}`} />
                  <input type="text" inputMode="decimal" placeholder="$ value" value={perkInput.customValue || ''}
                    onChange={(e) => {
                      let val = e.target.value.replace(/[^\d.]/g, '');
                      const parts = val.split('.');
                      const cleaned = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : val;
                      setPerkInput((prev) => ({ ...prev, customValue: cleaned }));
                    }}
                    className={`w-24 px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${d('bg-white border-gray-200 text-gray-800', 'bg-gray-800 border-gray-600 text-white placeholder-gray-500')}`} />
                </>
              )}
              <button onClick={addPerk} disabled={!perkInput.preset}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-sm rounded-lg flex items-center gap-1">
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>
            {newTrip.perks?.length > 0 && (
              <div className="space-y-1">
                {newTrip.perks.map((p) => (
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
                  {[['Total Spent', fmt(t.total), d('text-red-600','text-red-400')], ['Perks Value', fmt(t.perksValue), d('text-green-600','text-green-400')],
                    ['Net Cost', fmt(t.net), t.net <= 0 ? d('text-blue-700','text-blue-400') : d('text-orange-600','text-orange-400')],
                    t.pts > 0 ? ['Casino Points', fmtPts(t.pts), d('text-yellow-600','text-yellow-400')] : null]
                    .filter(Boolean).map(([l, v, cls]) => (
                      <div key={l}>
                        <p className={`text-xs ${d('text-gray-500','text-gray-400')}`}>{l}</p>
                        <p className={`text-lg font-bold ${cls}`}>{v}</p>
                        {l === 'Net Cost' && t.net <= 0 && <p className={`text-xs ${d('text-blue-500','text-blue-400')}`}>🎉 Perks exceed cost!</p>}
                        {l === 'Casino Points' && t.costPerPoint > 0 && <p className={`text-xs ${d('text-gray-400','text-gray-500')}`}>{fmt(t.costPerPoint)}/pt</p>}
                      </div>
                    ))}
                </div>
                {t.goalPct > 0 && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className={d('text-gray-500','text-gray-400')}>Points Goal</span>
                      <span className={d('text-gray-600','text-gray-300')}>{fmtPts(num(newTrip.casinoPointsEarned))} / {fmtPts(num(newTrip.casinoPointsGoal))} ({t.goalPct.toFixed(0)}%)</span>
                    </div>
                    <div className={`h-2 rounded-full ${d('bg-gray-200','bg-gray-700')}`}>
                      <div className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-yellow-500 transition-all duration-500" style={{ width: `${t.goalPct}%` }} />
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          <div className="flex flex-col gap-2 mb-3">
            <label className={`text-xs font-medium ${d('text-gray-500','text-gray-400')}`}>Notes</label>
            <textarea rows={2} placeholder="Anything else to remember about this trip…" value={newTrip.notes}
              onChange={(e) => setNewTrip((t) => ({ ...t, notes: e.target.value }))}
              className={`px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${d('bg-white border-gray-200 text-gray-800','bg-gray-800 border-gray-600 text-white placeholder-gray-500')}`} />
          </div>

          <div className="flex gap-2">
            <button onClick={saveTrip} disabled={!newTrip.name}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-lg text-sm">
              {activeTrip ? 'Update Trip' : 'Save Trip'}
            </button>
            <button onClick={() => { setShowNewTripForm(false); setActiveTrip(null); setNewTrip({ ...EMPTY_TRIP, id: Date.now() }); }}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium ${d('bg-gray-100 hover:bg-gray-200 text-gray-700','bg-gray-700 hover:bg-gray-600 text-gray-200')}`}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowNewTripForm(true)}
          className="w-full py-3 border-2 border-dashed border-blue-400 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors">
          <Plus className="w-5 h-5" /> Add New Trip
        </button>
      )}
    </div>
  );
}
