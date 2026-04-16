import React, { useState } from 'react';
import { Plus, Check, X, Pill, Clock, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../context/AppContext';
import { useMedicines } from '../hooks/useMedicines';
import type { MedicineFrequency, Condition } from '../lib/types';

const CONDITIONS: Condition[] = ['Diabetes', 'Thyroid', 'Heart', 'Kidney', 'Hypertension'];
const SLOT_COLORS: Record<string, string> = {
  morning: '#F59E0B', afternoon: '#3B82F6', evening: '#8B5CF6', night: '#374151',
};

export default function Medicines() {
  const { user } = useAppContext();
  const userId = user?.id;
  const { medicines, loading, todayDoses, addMedicine, markDose, deleteMedicine } = useMedicines(userId, null);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '', dosage: '', frequency: 'once' as MedicineFrequency,
    times: ['morning'], condition_tag: '' as Condition | '', doctor: '', notes: '',
  });
  const [saving, setSaving] = useState(false);

  const taken = todayDoses.filter(d => d.status === 'taken').length;
  const total = todayDoses.length;

  const handleAdd = async () => {
    if (!form.name || !form.dosage || !userId) return;
    setSaving(true);
    await addMedicine({
      user_id: userId,
      family_member_id: null,
      name: form.name,
      dosage: form.dosage,
      frequency: form.frequency,
      times: form.times,
      food_instruction: null,
      condition_tag: form.condition_tag || null,
      quantity_total: null,
      quantity_remaining: null,
      start_date: new Date().toISOString().split('T')[0],
      refill_threshold: 7,
      doctor: form.doctor || null,
      notes: form.notes || null,
      is_active: true,
    });
    setSaving(false);
    setShowForm(false);
    setForm({ name: '', dosage: '', frequency: 'once', times: ['morning'], condition_tag: '', doctor: '', notes: '' });
  };

  const toggleSlot = (slot: string) => {
    setForm(f => ({
      ...f,
      times: f.times.includes(slot) ? f.times.filter(t => t !== slot) : [...f.times, slot],
    }));
  };

  return (
    <div className="p-5 lg:p-8 max-w-4xl mx-auto pb-24 lg:pb-12">

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 500, color: '#111827' }}>Medicines</h1>
          <p style={{ fontSize: 14, color: '#6B7280', marginTop: 2 }}>
            {total > 0 ? `${taken} of ${total} doses taken today` : 'Manage your medications'}
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors"
          style={{ background: '#C0203E', boxShadow: '0 2px 8px rgba(192,32,62,0.25)' }}
        >
          <Plus size={16} /> Add medicine
        </button>
      </div>

      {total > 0 && (
        <div className="bg-white rounded-2xl border p-4 mb-6 flex items-center gap-3" style={{ borderColor: 'rgba(0,0,0,0.07)' }}>
          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${total > 0 ? (taken / total) * 100 : 0}%`, background: '#0D9488' }}
            />
          </div>
          <span style={{ fontSize: 13, fontWeight: 500, color: '#374151', flexShrink: 0 }}>{taken}/{total} taken</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: 'rgba(0,0,0,0.07)' }}>
            <div className="px-5 py-4 border-b" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
              <p style={{ fontSize: 12, fontWeight: 500, color: '#6B7280' }}>Today's schedule</p>
            </div>

            {loading ? (
              <div className="p-5 space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="skeleton" style={{ height: 60, borderRadius: 12 }} />
                ))}
              </div>
            ) : todayDoses.length === 0 ? (
              <div className="flex flex-col items-center py-12 px-6 text-center">
                <Pill size={28} style={{ color: '#E5E7EB', marginBottom: 12 }} />
                <p style={{ fontSize: 14, fontWeight: 500, color: '#6B7280' }}>No medicines added yet</p>
                <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 4 }}>Click "Add medicine" to get started</p>
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: 'rgba(0,0,0,0.04)' }}>
                {todayDoses.map((dose, i) => (
                  <div key={i} className="flex items-center gap-3 px-5 py-4">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: (SLOT_COLORS[dose.slot] ?? '#6B7280') + '18' }}
                    >
                      <Clock size={13} style={{ color: SLOT_COLORS[dose.slot] ?? '#6B7280' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p style={{ fontSize: 14, fontWeight: 500, color: '#111827' }} className="truncate">{dose.medicine.name}</p>
                      <p style={{ fontSize: 12, color: '#9CA3AF', textTransform: 'capitalize' }}>{dose.medicine.dosage} · {dose.slot}</p>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => markDose(dose.medicine.id, dose.slot, true)}
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                          dose.status === 'taken' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400 hover:bg-green-100 hover:text-green-600'
                        }`}
                      >
                        <Check size={13} />
                      </button>
                      <button
                        onClick={() => markDose(dose.medicine.id, dose.slot, false)}
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                          dose.status === 'skipped' ? 'bg-red-400 text-white' : 'bg-gray-100 text-gray-400 hover:bg-red-100 hover:text-red-400'
                        }`}
                      >
                        <X size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: 'rgba(0,0,0,0.07)' }}>
            <div className="px-5 py-4 border-b" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
              <p style={{ fontSize: 12, fontWeight: 500, color: '#6B7280' }}>All medicines</p>
            </div>

            {medicines.length === 0 && !loading ? (
              <div className="flex flex-col items-center py-12 px-6 text-center">
                <Pill size={28} style={{ color: '#E5E7EB', marginBottom: 12 }} />
                <p style={{ fontSize: 14, fontWeight: 500, color: '#6B7280' }}>No medicines yet</p>
                <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 4 }}>Add your first medicine to start tracking</p>
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: 'rgba(0,0,0,0.04)' }}>
                {medicines.map(med => (
                  <div key={med.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50/50 transition-colors group">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: '#F5F3FF' }}>
                      <Pill size={16} style={{ color: '#7C3AED' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p style={{ fontSize: 14, fontWeight: 500, color: '#111827' }}>{med.name}</p>
                      <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>
                        {med.dosage} · {med.frequency}
                        {med.condition_tag && ` · ${med.condition_tag}`}
                        {med.doctor && ` · Dr. ${med.doctor}`}
                      </p>
                      <div className="flex gap-1.5 mt-1.5">
                        {(med.times ?? []).map(slot => (
                          <span
                            key={slot}
                            style={{
                              fontSize: 10, fontWeight: 500, padding: '2px 8px', borderRadius: 4,
                              textTransform: 'capitalize',
                              background: (SLOT_COLORS[slot] ?? '#6B7280') + '18',
                              color: SLOT_COLORS[slot] ?? '#6B7280',
                            }}
                          >
                            {slot}
                          </span>
                        ))}
                      </div>
                    </div>
                    {med.quantity_remaining != null && med.quantity_remaining <= 7 && (
                      <div className="flex items-center gap-1" style={{ color: '#D97706' }}>
                        <AlertTriangle size={13} />
                        <span style={{ fontSize: 12, fontWeight: 500 }}>{med.quantity_remaining} left</span>
                      </div>
                    )}
                    <button
                      onClick={() => deleteMedicine(med.id)}
                      className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-full bg-red-50 text-red-400 flex items-center justify-center transition-all"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={e => { if (e.target === e.currentTarget) setShowForm(false); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 style={{ fontSize: 16, fontWeight: 500, color: '#111827' }}>Add medicine</h2>
                <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">
                  <X size={15} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label style={{ fontSize: 12, fontWeight: 500, color: '#6B7280', display: 'block', marginBottom: 6 }}>Medicine name *</label>
                  <input
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Metformin"
                    className="w-full px-4 py-3 rounded-xl border text-sm text-gray-900 focus:outline-none"
                    style={{ background: '#F9FAFB', borderColor: '#E5E7EB' }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 500, color: '#6B7280', display: 'block', marginBottom: 6 }}>Dosage *</label>
                    <input
                      value={form.dosage}
                      onChange={e => setForm(f => ({ ...f, dosage: e.target.value }))}
                      placeholder="e.g. 500mg"
                      className="w-full px-4 py-3 rounded-xl border text-sm text-gray-900 focus:outline-none"
                      style={{ background: '#F9FAFB', borderColor: '#E5E7EB' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 500, color: '#6B7280', display: 'block', marginBottom: 6 }}>Frequency</label>
                    <select
                      value={form.frequency}
                      onChange={e => setForm(f => ({ ...f, frequency: e.target.value as MedicineFrequency }))}
                      className="w-full px-4 py-3 rounded-xl border text-sm text-gray-900 focus:outline-none"
                      style={{ background: '#F9FAFB', borderColor: '#E5E7EB' }}
                    >
                      <option value="once">Once daily</option>
                      <option value="twice">Twice daily</option>
                      <option value="thrice">Thrice daily</option>
                      <option value="as_needed">As needed</option>
                      <option value="weekly">Weekly</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 500, color: '#6B7280', display: 'block', marginBottom: 8 }}>Time slots</label>
                  <div className="flex gap-2 flex-wrap">
                    {['morning', 'afternoon', 'evening', 'night'].map(slot => (
                      <button
                        key={slot}
                        onClick={() => toggleSlot(slot)}
                        className="px-3 py-1.5 rounded-xl transition-all capitalize"
                        style={{
                          fontSize: 12, fontWeight: 500,
                          background: form.times.includes(slot) ? (SLOT_COLORS[slot] + '22') : '#F9FAFB',
                          color: form.times.includes(slot) ? SLOT_COLORS[slot] : '#9CA3AF',
                          border: `1.5px solid ${form.times.includes(slot) ? SLOT_COLORS[slot] + '50' : '#E5E7EB'}`,
                        }}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 500, color: '#6B7280', display: 'block', marginBottom: 6 }}>Condition</label>
                    <select
                      value={form.condition_tag}
                      onChange={e => setForm(f => ({ ...f, condition_tag: e.target.value as Condition | '' }))}
                      className="w-full px-4 py-3 rounded-xl border text-sm text-gray-900 focus:outline-none"
                      style={{ background: '#F9FAFB', borderColor: '#E5E7EB' }}
                    >
                      <option value="">Select condition</option>
                      {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 500, color: '#6B7280', display: 'block', marginBottom: 6 }}>Doctor</label>
                    <input
                      value={form.doctor}
                      onChange={e => setForm(f => ({ ...f, doctor: e.target.value }))}
                      placeholder="Dr. Name"
                      className="w-full px-4 py-3 rounded-xl border text-sm text-gray-900 focus:outline-none"
                      style={{ background: '#F9FAFB', borderColor: '#E5E7EB' }}
                    />
                  </div>
                </div>

                <button
                  onClick={handleAdd}
                  disabled={!form.name || !form.dosage || saving}
                  className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
                  style={{ background: '#C0203E' }}
                >
                  {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Plus size={15} /> Add medicine</>}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
