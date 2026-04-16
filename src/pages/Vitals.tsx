import React, { useState } from 'react';
import { Plus, TrendingUp, Check } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useVitals } from '../hooks/useVitals';
import type { VitalType } from '../lib/types';

const VITAL_TABS: { type: VitalType; label: string; unit: string; fields: string[]; color: string }[] = [
  { type: 'blood_sugar_fasting',  label: 'Fasting sugar',    unit: 'mg/dL', fields: ['Glucose'],             color: '#C0203E' },
  { type: 'blood_sugar_postmeal', label: 'Post-meal sugar',  unit: 'mg/dL', fields: ['Glucose'],             color: '#EA580C' },
  { type: 'blood_pressure',       label: 'Blood pressure',   unit: 'mmHg',  fields: ['Systolic','Diastolic'], color: '#7C3AED' },
  { type: 'heart_rate',           label: 'Heart rate',       unit: 'bpm',   fields: ['BPM'],                 color: '#2563EB' },
  { type: 'weight',               label: 'Weight',           unit: 'kg',    fields: ['Weight'],               color: '#0D9488' },
  { type: 'spo2',                 label: 'SpO2',             unit: '%',     fields: ['Oxygen'],               color: '#D97706' },
];

function classify(type: VitalType, v1: number, v2?: number | null): { label: string; color: string; bg: string } {
  if (type === 'blood_sugar_fasting') {
    if (v1 < 70)   return { label: 'Below range', color: '#2563EB', bg: '#DBEAFE' };
    if (v1 <= 100) return { label: 'Normal',      color: '#15803D', bg: '#DCFCE7' };
    if (v1 <= 125) return { label: 'Elevated',    color: '#D97706', bg: '#FEF3C7' };
    return               { label: 'Above range',  color: '#DC2626', bg: '#FEE2E2' };
  }
  if (type === 'blood_pressure') {
    const sys = v1, dia = v2 ?? 0;
    if (sys < 120 && dia < 80) return { label: 'Normal',   color: '#15803D', bg: '#DCFCE7' };
    if (sys < 130 && dia < 80) return { label: 'Elevated', color: '#D97706', bg: '#FEF3C7' };
    return                          { label: 'Above range',color: '#DC2626', bg: '#FEE2E2' };
  }
  if (type === 'heart_rate') {
    if (v1 < 60)   return { label: 'Below range', color: '#2563EB', bg: '#DBEAFE' };
    if (v1 <= 100) return { label: 'Normal',      color: '#15803D', bg: '#DCFCE7' };
    return               { label: 'Above range',  color: '#DC2626', bg: '#FEE2E2' };
  }
  if (type === 'spo2') {
    if (v1 < 95) return { label: 'Below range', color: '#DC2626', bg: '#FEE2E2' };
    return             { label: 'Normal',       color: '#15803D', bg: '#DCFCE7' };
  }
  return { label: 'Logged', color: '#6B7280', bg: '#F9FAFB' };
}

function timeAgo(iso: string) {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (d < 1)    return 'just now';
  if (d < 60)   return `${d}m ago`;
  if (d < 1440) return `${Math.floor(d / 60)}h ago`;
  return `${Math.floor(d / 1440)}d ago`;
}

export default function Vitals() {
  const { user } = useAppContext();
  const userId = user?.id;

  const [activeTab, setActiveTab] = useState(0);
  const [val1,  setVal1]  = useState('');
  const [val2,  setVal2]  = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);

  const tab = VITAL_TABS[activeTab];
  const { logs, loading, addLog } = useVitals(userId, tab.type, null, 30);

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
    <div className="p-5 lg:p-8 max-w-4xl mx-auto pb-24 lg:pb-12">

      <div className="mb-6">
        <h1 style={{ fontSize: 22, fontWeight: 500, color: '#111827' }}>Vitals</h1>
        <p style={{ fontSize: 14, color: '#6B7280', marginTop: 2 }}>Track your health readings over time</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar mb-6">
        {VITAL_TABS.map((t, i) => (
          <button
            key={t.type}
            onClick={() => { setActiveTab(i); setVal1(''); setVal2(''); }}
            className="flex-shrink-0 px-4 py-2 rounded-full transition-all"
            style={{
              fontSize: 13, fontWeight: activeTab === i ? 600 : 500,
              background: activeTab === i ? tab.color : 'white',
              color: activeTab === i ? 'white' : '#6B7280',
              border: `1.5px solid ${activeTab === i ? tab.color : '#E5E7EB'}`,
              boxShadow: activeTab === i ? `0 4px 12px ${tab.color}30` : 'none',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border p-5" style={{ borderColor: 'rgba(0,0,0,0.07)' }}>
            <p style={{ fontSize: 12, fontWeight: 500, color: '#6B7280', marginBottom: 16 }}>Log {tab.label}</p>

            <div className="space-y-3">
              {tab.fields.map((field, fi) => (
                <div key={field}>
                  <label style={{ fontSize: 12, fontWeight: 500, color: '#6B7280', display: 'block', marginBottom: 6 }}>{field} ({tab.unit})</label>
                  <input
                    type="number"
                    value={fi === 0 ? val1 : val2}
                    onChange={e => fi === 0 ? setVal1(e.target.value) : setVal2(e.target.value)}
                    placeholder={`Enter ${field.toLowerCase()}`}
                    className="w-full px-4 py-3 rounded-xl border text-gray-900 text-sm focus:outline-none transition-all"
                    style={{ background: '#F9FAFB', borderColor: '#E5E7EB', fontSize: 14 }}
                  />
                </div>
              ))}

              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: '#6B7280', display: 'block', marginBottom: 6 }}>Notes (optional)</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Any symptoms or context…"
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border text-gray-900 text-sm resize-none focus:outline-none transition-all"
                  style={{ background: '#F9FAFB', borderColor: '#E5E7EB', fontSize: 14 }}
                />
              </div>

              <button
                onClick={handleSave}
                disabled={!val1 || saving}
                className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all flex items-center justify-center gap-2 disabled:opacity-40"
                style={{ background: tab.color }}
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : saved ? (
                  <><Check size={15} /> Saved!</>
                ) : (
                  <><Plus size={15} /> Save reading</>
                )}
              </button>
            </div>
          </div>

          {logs.length > 1 && (
            <div className="bg-white rounded-2xl border p-5" style={{ borderColor: 'rgba(0,0,0,0.07)' }}>
              <p style={{ fontSize: 12, fontWeight: 500, color: '#6B7280', marginBottom: 12 }}>Trend</p>
              <div className="flex items-end gap-1.5 h-20">
                {logs.slice(0, 10).reverse().map((log, i) => {
                  const max = Math.max(...logs.slice(0, 10).map(l => l.value_1));
                  const min = Math.min(...logs.slice(0, 10).map(l => l.value_1));
                  const pct = max === min ? 0.5 : (log.value_1 - min) / (max - min);
                  const st = classify(tab.type, log.value_1, log.value_2);
                  return (
                    <div key={i} className="flex-1">
                      <div
                        className="w-full rounded-t-md"
                        style={{ height: `${Math.max(8, pct * 64)}px`, background: st.color + '25', borderTop: `2px solid ${st.color}` }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: 'rgba(0,0,0,0.07)' }}>
            <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
              <p style={{ fontSize: 12, fontWeight: 500, color: '#6B7280' }}>History</p>
              <span style={{ fontSize: 12, color: '#9CA3AF' }}>{logs.length} readings</span>
            </div>

            {loading ? (
              <div className="p-5 space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="skeleton" style={{ height: 52, borderRadius: 12 }} />
                ))}
              </div>
            ) : logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3" style={{ background: tab.color + '15' }}>
                  <TrendingUp size={20} style={{ color: tab.color }} />
                </div>
                <p style={{ fontSize: 14, fontWeight: 500, color: '#6B7280' }}>No readings yet</p>
                <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 4 }}>Use the form to log your first {tab.label} reading</p>
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: 'rgba(0,0,0,0.04)' }}>
                {logs.map(log => {
                  const st = classify(tab.type, log.value_1, log.value_2);
                  return (
                    <div key={log.id} className="flex items-center px-5 py-4 hover:bg-gray-50/50 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-baseline gap-2">
                          <span style={{ fontSize: 20, fontWeight: 300, color: '#111827', fontVariantNumeric: 'tabular-nums' }}>
                            {log.value_2 ? `${log.value_1}/${log.value_2}` : log.value_1}
                          </span>
                          <span style={{ fontSize: 12, color: '#9CA3AF' }}>{log.unit}</span>
                          <span style={{ fontSize: 12, fontWeight: 500, borderRadius: 6, padding: '2px 8px', background: st.bg, color: st.color }}>
                            {st.label}
                          </span>
                        </div>
                        {log.notes && <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>{log.notes}</p>}
                      </div>
                      <span style={{ fontSize: 12, color: '#9CA3AF', flexShrink: 0 }}>{timeAgo(log.logged_at)}</span>
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
