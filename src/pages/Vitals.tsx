import React, { useState } from 'react';
import { Plus, TrendingUp, Check } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useVitals } from '../hooks/useVitals';
import type { VitalType } from '../lib/types';

const VITAL_TABS: { type: VitalType; label: string; unit: string; fields: string[]; placeholder: string[] }[] = [
  { type: 'blood_sugar_fasting',  label: 'Fasting sugar',    unit: 'mg/dL', fields: ['Glucose'],              placeholder: ['e.g. 95'] },
  { type: 'blood_sugar_postmeal', label: 'Post-meal sugar',  unit: 'mg/dL', fields: ['Glucose'],              placeholder: ['e.g. 130'] },
  { type: 'blood_pressure',       label: 'Blood pressure',   unit: 'mmHg',  fields: ['Systolic','Diastolic'],  placeholder: ['e.g. 120', 'e.g. 80'] },
  { type: 'heart_rate',           label: 'Heart rate',       unit: 'bpm',   fields: ['BPM'],                  placeholder: ['e.g. 72'] },
  { type: 'weight',               label: 'Weight',           unit: 'kg',    fields: ['Weight'],                placeholder: ['e.g. 68'] },
  { type: 'spo2',                 label: 'SpO2',             unit: '%',     fields: ['Oxygen %'],              placeholder: ['e.g. 98'] },
];

function classify(type: VitalType, v1: number, v2?: number | null) {
  if (type === 'blood_sugar_fasting' || type === 'blood_sugar_postmeal') {
    if (v1 < 70)   return { label: 'Below range', color: '#92400E', bg: '#FFF7ED', darkBg: 'rgba(146,64,14,0.2)' };
    if (v1 <= 100) return { label: 'Normal',      color: '#15803D', bg: '#DCFCE7', darkBg: 'rgba(21,128,61,0.2)' };
    if (v1 <= 125) return { label: 'Elevated',    color: '#D97706', bg: '#FEF3C7', darkBg: 'rgba(217,119,6,0.2)' };
    return               { label: 'Above range',  color: '#C0203E', bg: '#FFF0F2', darkBg: 'rgba(192,32,62,0.2)' };
  }
  if (type === 'blood_pressure') {
    const sys = v1, dia = v2 ?? 0;
    if (sys < 120 && dia < 80)  return { label: 'Normal',      color: '#15803D', bg: '#DCFCE7', darkBg: 'rgba(21,128,61,0.2)' };
    if (sys < 130 && dia < 80)  return { label: 'Elevated',    color: '#D97706', bg: '#FEF3C7', darkBg: 'rgba(217,119,6,0.2)' };
    return                             { label: 'Above range',  color: '#C0203E', bg: '#FFF0F2', darkBg: 'rgba(192,32,62,0.2)' };
  }
  if (type === 'heart_rate') {
    if (v1 < 60)   return { label: 'Below range', color: '#92400E', bg: '#FFF7ED', darkBg: 'rgba(146,64,14,0.2)' };
    if (v1 <= 100) return { label: 'Normal',      color: '#15803D', bg: '#DCFCE7', darkBg: 'rgba(21,128,61,0.2)' };
    return               { label: 'Above range',  color: '#C0203E', bg: '#FFF0F2', darkBg: 'rgba(192,32,62,0.2)' };
  }
  if (type === 'spo2') {
    if (v1 < 95) return { label: 'Below range', color: '#C0203E', bg: '#FFF0F2', darkBg: 'rgba(192,32,62,0.2)' };
    return             { label: 'Normal',       color: '#15803D', bg: '#DCFCE7', darkBg: 'rgba(21,128,61,0.2)' };
  }
  return { label: 'Logged', color: '#6B7280', bg: '#F9FAFB', darkBg: 'rgba(107,114,128,0.2)' };
}

function timeAgo(iso: string) {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (d < 1)    return 'just now';
  if (d < 60)   return `${d}m ago`;
  if (d < 1440) return `${Math.floor(d / 60)}h ago`;
  return `${Math.floor(d / 1440)}d ago`;
}

export default function Vitals() {
  const { user, isDarkMode } = useAppContext();
  const userId = user?.id;

  const [activeTab, setActiveTab] = useState(0);
  const [val1,   setVal1]   = useState('');
  const [val2,   setVal2]   = useState('');
  const [notes,  setNotes]  = useState('');
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);

  const tab = VITAL_TABS[activeTab];
  const { logs, loading, addLog } = useVitals(userId, tab.type, null, 30);

  // Theme tokens
  const cardBg   = isDarkMode ? 'rgba(22,22,30,0.72)' : 'rgba(255,255,255,0.9)';
  const cardBd   = isDarkMode ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
  const textPri  = isDarkMode ? '#F3F4F6' : '#111827';
  const textSec  = isDarkMode ? 'rgba(255,255,255,0.45)' : '#6B7280';
  const textMut  = isDarkMode ? 'rgba(255,255,255,0.28)' : '#9CA3AF';
  const inputBg  = isDarkMode ? 'rgba(255,255,255,0.04)' : '#F9FAFB';
  const inputBd  = isDarkMode ? 'rgba(255,255,255,0.1)' : '#E5E7EB';
  const tabInact = isDarkMode ? 'rgba(255,255,255,0.07)' : '#FFFFFF';
  const tabBdIn  = isDarkMode ? 'rgba(255,255,255,0.1)' : '#E5E7EB';
  const divider  = isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';
  const hoverRow = isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)';

  const handleSave = async () => {
    if (!val1 || !userId) return;
    setSaving(true);
    const { error } = await addLog({
      user_id: userId,
      family_member_id: null,
      vital_type: tab.type,
      value_1: parseFloat(val1),
      value_2: val2 ? parseFloat(val2) : null,
      unit: tab.unit,
      notes: notes || null,
      logged_at: new Date().toISOString(),
    });
    setSaving(false);
    if (!error) {
      setVal1(''); setVal2(''); setNotes('');
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  return (
    <div style={{ padding: '20px 20px 96px', maxWidth: 900, margin: '0 auto' }} className="lg:px-8 lg:pb-12">

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: textPri, letterSpacing: '-0.02em' }}>Vitals</h1>
        <p style={{ fontSize: 13, color: textSec, marginTop: 3 }}>Track your health readings over time</p>
      </div>

      {/* Tab strip */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, marginBottom: 24 }} className="no-scrollbar">
        {VITAL_TABS.map((t, i) => (
          <button
            key={t.type}
            onClick={() => { setActiveTab(i); setVal1(''); setVal2(''); }}
            style={{
              flexShrink: 0, padding: '7px 16px', borderRadius: 999, fontSize: 13, cursor: 'pointer',
              fontWeight: activeTab === i ? 600 : 500, transition: 'all 0.18s',
              background: activeTab === i ? '#C0203E' : tabInact,
              color: activeTab === i ? 'white' : textSec,
              border: `1.5px solid ${activeTab === i ? '#C0203E' : tabBdIn}`,
              boxShadow: activeTab === i ? '0 4px 14px rgba(192,32,62,0.35)' : 'none',
              fontFamily: 'inherit',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }} className="lg:grid-cols-5">

        {/* Log form */}
        <div style={{ gridColumn: 'span 1' }} className="lg:col-span-2">
          <div style={{ background: cardBg, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: `1px solid ${cardBd}`, borderRadius: 20, padding: 20, boxShadow: isDarkMode ? '0 4px 20px rgba(0,0,0,0.3)' : '0 2px 16px rgba(0,0,0,0.05)' }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: textSec, marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Log {tab.label}</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {tab.fields.map((field, fi) => (
                <div key={field}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: textSec, marginBottom: 6 }}>{field} <span style={{ color: textMut }}>({tab.unit})</span></label>
                  <input
                    type="number" inputMode="decimal"
                    value={fi === 0 ? val1 : val2}
                    onChange={e => fi === 0 ? setVal1(e.target.value) : setVal2(e.target.value)}
                    placeholder={tab.placeholder[fi]}
                    style={{ width: '100%', padding: '11px 14px', background: inputBg, border: `1px solid ${inputBd}`, borderRadius: 12, color: textPri, fontSize: 15, outline: 'none', transition: 'border-color 0.15s', boxSizing: 'border-box' }}
                    onFocus={e => { e.currentTarget.style.borderColor = '#C0203E'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(192,32,62,0.12)'; }}
                    onBlur={e => { e.currentTarget.style.borderColor = inputBd; e.currentTarget.style.boxShadow = 'none'; }}
                  />
                </div>
              ))}

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: textSec, marginBottom: 6 }}>Notes <span style={{ color: textMut }}>(optional)</span></label>
                <textarea
                  value={notes} onChange={e => setNotes(e.target.value)}
                  placeholder="Any symptoms or context…" rows={2}
                  style={{ width: '100%', padding: '11px 14px', background: inputBg, border: `1px solid ${inputBd}`, borderRadius: 12, color: textPri, fontSize: 13, outline: 'none', resize: 'none', transition: 'border-color 0.15s', boxSizing: 'border-box', fontFamily: 'inherit' }}
                  onFocus={e => { e.currentTarget.style.borderColor = '#C0203E'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(192,32,62,0.12)'; }}
                  onBlur={e => { e.currentTarget.style.borderColor = inputBd; e.currentTarget.style.boxShadow = 'none'; }}
                />
              </div>

              <button
                onClick={handleSave} disabled={!val1 || saving}
                style={{ width: '100%', padding: '13px', borderRadius: 12, background: saved ? '#15803D' : '#C0203E', color: 'white', fontWeight: 700, fontSize: 14, border: 'none', cursor: !val1 || saving ? 'not-allowed' : 'pointer', opacity: !val1 || saving ? 0.5 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s', boxShadow: !val1 || saving ? 'none' : '0 4px 16px rgba(192,32,62,0.3)', fontFamily: 'inherit' }}
              >
                {saving ? (
                  <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                ) : saved ? (
                  <><Check size={15} /> Saved!</>
                ) : (
                  <><Plus size={15} /> Save reading</>
                )}
              </button>
            </div>
          </div>

          {/* Mini trend chart */}
          {logs.length > 1 && (
            <div style={{ background: cardBg, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: `1px solid ${cardBd}`, borderRadius: 20, padding: 20, marginTop: 12, boxShadow: isDarkMode ? '0 4px 20px rgba(0,0,0,0.3)' : '0 2px 16px rgba(0,0,0,0.05)' }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: textSec, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Trend</p>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 60 }}>
                {logs.slice(0, 12).reverse().map((log, i) => {
                  const max = Math.max(...logs.slice(0, 12).map(l => l.value_1));
                  const min = Math.min(...logs.slice(0, 12).map(l => l.value_1));
                  const pct = max === min ? 0.5 : (log.value_1 - min) / (max - min);
                  const st = classify(tab.type, log.value_1, log.value_2);
                  return (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch', justifyContent: 'flex-end', height: '100%' }}>
                      <div style={{ width: '100%', height: `${Math.max(8, pct * 52)}px`, borderRadius: '4px 4px 0 0', background: isDarkMode ? st.darkBg : st.bg, borderTop: `2px solid ${st.color}` }} />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* History panel */}
        <div style={{ gridColumn: 'span 1' }} className="lg:col-span-3">
          <div style={{ background: cardBg, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: `1px solid ${cardBd}`, borderRadius: 20, overflow: 'hidden', boxShadow: isDarkMode ? '0 4px 20px rgba(0,0,0,0.3)' : '0 2px 16px rgba(0,0,0,0.05)' }}>
            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${divider}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: textSec, textTransform: 'uppercase', letterSpacing: '0.06em' }}>History</p>
              <span style={{ fontSize: 12, color: textMut }}>{loading ? '…' : `${logs.length} reading${logs.length !== 1 ? 's' : ''}`}</span>
            </div>

            {loading ? (
              // Dark-mode aware skeleton
              <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[...Array(4)].map((_, i) => (
                  <div key={i} style={{ height: 52, borderRadius: 12, background: isDarkMode ? 'rgba(255,255,255,0.05)' : '#F3F4F6', animation: 'skeleton-shimmer 1.5s ease-in-out infinite', backgroundSize: '200% 100%', backgroundImage: isDarkMode ? 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)' : 'linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)' }} />
                ))}
              </div>
            ) : logs.length === 0 ? (
              // Intentional empty state — not an error
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '56px 24px', textAlign: 'center' }}>
                <div style={{ width: 48, height: 48, borderRadius: 16, background: isDarkMode ? 'rgba(192,32,62,0.15)' : 'rgba(192,32,62,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                  <TrendingUp size={20} style={{ color: '#C0203E' }} />
                </div>
                <p style={{ fontSize: 14, fontWeight: 600, color: textPri, marginBottom: 6 }}>No readings yet</p>
                <p style={{ fontSize: 12, color: textMut, lineHeight: 1.6, maxWidth: 200 }}>
                  Log your first {tab.label} reading using the form on the left.
                </p>
              </div>
            ) : (
              <div>
                {logs.map((log, idx) => {
                  const st = classify(tab.type, log.value_1, log.value_2);
                  return (
                    <div key={log.id} style={{ display: 'flex', alignItems: 'center', padding: '14px 20px', borderBottom: idx < logs.length - 1 ? `1px solid ${divider}` : 'none', transition: 'background 0.15s', cursor: 'default' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = hoverRow; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                          <span style={{ fontSize: 22, fontWeight: 300, color: textPri, fontVariantNumeric: 'tabular-nums' }}>
                            {log.value_2 ? `${log.value_1}/${log.value_2}` : log.value_1}
                          </span>
                          <span style={{ fontSize: 11, color: textMut }}>{log.unit}</span>
                          <span style={{ fontSize: 11, fontWeight: 600, borderRadius: 6, padding: '2px 8px', background: isDarkMode ? st.darkBg : st.bg, color: st.color }}>
                            {st.label}
                          </span>
                        </div>
                        {log.notes && <p style={{ fontSize: 11, color: textMut, marginTop: 2 }}>{log.notes}</p>}
                      </div>
                      <span style={{ fontSize: 11, color: textMut, flexShrink: 0 }}>{timeAgo(log.logged_at)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
