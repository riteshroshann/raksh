import React, { useState } from 'react';
import { Plus, TrendingUp, ChevronDown, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../context/AppContext';
import { useVitals } from '../hooks/useVitals';
import type { VitalType } from '../lib/types';

const VITAL_TABS: { type: VitalType; label: string; unit: string; fields: string[]; color: string }[] = [
  { type: 'blood_sugar_fasting',  label: 'Fasting Sugar',    unit: 'mg/dL', fields: ['Glucose'],           color: '#C0203E' },
  { type: 'blood_sugar_postmeal', label: 'Post-meal Sugar',  unit: 'mg/dL', fields: ['Glucose'],           color: '#EA580C' },
  { type: 'blood_pressure',       label: 'Blood Pressure',   unit: 'mmHg',  fields: ['Systolic','Diastolic'], color: '#7C3AED' },
  { type: 'heart_rate',           label: 'Heart Rate',       unit: 'bpm',   fields: ['BPM'],               color: '#2563EB' },
  { type: 'weight',               label: 'Weight',           unit: 'kg',    fields: ['Weight'],             color: '#0D9488' },
  { type: 'spo2',                 label: 'SpO2',             unit: '%',     fields: ['Oxygen'],             color: '#D97706' },
];

function classify(type: VitalType, v1: number, v2?: number | null): { label: string; color: string; bg: string } {
  if (type === 'blood_sugar_fasting') {
    if (v1 < 70)  return { label: 'Low',      color: '#2563EB', bg: '#EFF6FF' };
    if (v1 <= 100) return { label: 'Normal',   color: '#16A34A', bg: '#F0FDF4' };
    if (v1 <= 125) return { label: 'Elevated', color: '#D97706', bg: '#FFFBEB' };
    return              { label: 'High',      color: '#DC2626', bg: '#FEF2F2' };
  }
  if (type === 'blood_pressure') {
    const sys = v1, dia = v2 ?? 0;
    if (sys < 120 && dia < 80) return { label: 'Normal',   color: '#16A34A', bg: '#F0FDF4' };
    if (sys < 130 && dia < 80) return { label: 'Elevated', color: '#D97706', bg: '#FFFBEB' };
    return                            { label: 'High',     color: '#DC2626', bg: '#FEF2F2' };
  }
  if (type === 'heart_rate') {
    if (v1 < 60)  return { label: 'Low',    color: '#2563EB', bg: '#EFF6FF' };
    if (v1 <= 100) return { label: 'Normal', color: '#16A34A', bg: '#F0FDF4' };
    return               { label: 'High',   color: '#DC2626', bg: '#FEF2F2' };
  }
  if (type === 'spo2') {
    if (v1 < 95) return { label: 'Low',    color: '#DC2626', bg: '#FEF2F2' };
    return              { label: 'Normal', color: '#16A34A', bg: '#F0FDF4' };
  }
  return { label: 'Logged', color: '#6B7280', bg: '#F9FAFB' };
}

function timeAgo(iso: string) {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (d < 1)   return 'just now';
  if (d < 60)  return `${d}m ago`;
  if (d < 1440) return `${Math.floor(d / 60)}h ago`;
  return `${Math.floor(d / 1440)}d ago`;
}

export default function Vitals() {
  const { user } = useAppContext();
  const userId = user?.id;

  const [activeTab, setActiveTab] = useState(0);
  const [val1, setVal1] = useState('');
  const [val2, setVal2] = useState('');
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
    <div className="p-5 lg:p-8 max-w-7xl mx-auto">

      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-semibold text-gray-900">Vitals</h1>
        <p className="text-sm text-gray-400 mt-0.5">Track your health readings over time</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar mb-6">
        {VITAL_TABS.map((t, i) => (
          <button
            key={t.type}
            onClick={() => { setActiveTab(i); setVal1(''); setVal2(''); }}
            className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all"
            style={{
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
          <div className="bg-white rounded-3xl border border-black/[0.05] p-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-5">Log {tab.label}</p>

            <div className="space-y-3">
              {tab.fields.map((field, fi) => (
                <div key={field}>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">{field} ({tab.unit})</label>
                  <input
                    type="number"
                    value={fi === 0 ? val1 : val2}
                    onChange={e => fi === 0 ? setVal1(e.target.value) : setVal2(e.target.value)}
                    placeholder={`Enter ${field.toLowerCase()}`}
                    className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                    style={{ '--tw-ring-color': tab.color } as React.CSSProperties}
                  />
                </div>
              ))}

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Notes (optional)</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Any symptoms or context…"
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 text-gray-900 text-sm resize-none focus:outline-none focus:ring-2 focus:border-transparent transition-all"
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
                  <><Plus size={15} /> Save Reading</>
                )}
              </button>
            </div>
          </div>

          {logs.length > 0 && (
            <div className="bg-white rounded-3xl border border-black/[0.05] p-6">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Trend</p>
              <div className="flex items-end gap-1.5 h-24">
                {logs.slice(0, 10).reverse().map((log, i) => {
                  const max = Math.max(...logs.slice(0, 10).map(l => l.value_1));
                  const min = Math.min(...logs.slice(0, 10).map(l => l.value_1));
                  const pct = max === min ? 0.5 : (log.value_1 - min) / (max - min);
                  const st = classify(tab.type, log.value_1, log.value_2);
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full rounded-t-lg"
                        style={{
                          height: `${Math.max(8, pct * 72)}px`,
                          background: st.color + '25',
                          borderTop: `2px solid ${st.color}`,
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-3">
          <div className="bg-white rounded-3xl border border-black/[0.05] overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">History</p>
              <span className="text-xs text-gray-400">{logs.length} readings</span>
            </div>

            {loading ? (
              <div className="p-6 space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-14 bg-gray-50 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3" style={{ background: tab.color + '15' }}>
                  <TrendingUp size={20} style={{ color: tab.color }} />
                </div>
                <p className="text-sm font-medium text-gray-600">No readings yet</p>
                <p className="text-xs text-gray-400 mt-1">Use the form to log your first {tab.label} reading</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {logs.map(log => {
                  const st = classify(tab.type, log.value_1, log.value_2);
                  return (
                    <div key={log.id} className="flex items-center px-6 py-4 hover:bg-gray-50/50 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-baseline gap-2">
                          <span className="text-xl font-light text-gray-900">
                            {log.value_2 ? `${log.value_1}/${log.value_2}` : log.value_1}
                          </span>
                          <span className="text-xs text-gray-400">{log.unit}</span>
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full ml-1"
                            style={{ background: st.bg, color: st.color }}
                          >
                            {st.label}
                          </span>
                        </div>
                        {log.notes && <p className="text-xs text-gray-400 mt-0.5">{log.notes}</p>}
                      </div>
                      <span className="text-xs text-gray-400 flex-shrink-0">{timeAgo(log.logged_at)}</span>
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
