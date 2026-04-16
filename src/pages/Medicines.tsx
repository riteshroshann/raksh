import React, { useState } from 'react';
import { Plus, Check, X, Pill, Clock, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../context/AppContext';
import { useMedicines } from '../hooks/useMedicines';
import type { MedicineFrequency, Condition } from '../lib/types';

const CONDITIONS: Condition[] = ['Diabetes', 'Thyroid', 'Heart', 'Kidney', 'Hypertension'];
const SLOT_COLORS: Record<string, string> = {
  morning: '#F59E0B', afternoon: '#3B82F6', evening: '#8B5CF6', night: '#1F2937',
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

  const taken   = todayDoses.filter(d => d.status === 'taken').length;
  const total   = todayDoses.length;

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
    <div className="p-5 lg:p-8 max-w-7xl mx-auto">

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-semibold text-gray-900">Medicines</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {total > 0 ? `${taken} of ${total} doses taken today` : 'Manage your medications'}
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#C0203E] hover:bg-[#A01830] transition-colors shadow-sm shadow-[#C0203E]/30"
        >
          <Plus size={16} /> Add Medicine
        </button>
      </div>

      {total > 0 && (
        <div className="bg-white rounded-2xl border border-black/[0.05] p-4 mb-6 flex items-center gap-3">
          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#C0203E] rounded-full transition-all duration-500"
              style={{ width: `${total > 0 ? (taken / total) * 100 : 0}%` }}
            />
          </div>
          <span className="text-sm font-semibold text-gray-700 flex-shrink-0">{taken}/{total}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl border border-black/[0.05] overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-50">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Today's Schedule</p>
            </div>

            {loading ? (
              <div className="p-6 space-y-3">
                {[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-gray-50 rounded-2xl animate-pulse" />)}
              </div>
            ) : todayDoses.length === 0 ? (
              <div className="flex flex-col items-center py-14 px-6 text-center">
                <Pill size={28} className="text-gray-200 mb-3" />
                <p className="text-sm text-gray-500">No medicines added yet</p>
                <p className="text-xs text-gray-400 mt-1">Click "Add Medicine" to get started</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {todayDoses.map((dose, i) => (
                  <div key={i} className="flex items-center gap-3 px-6 py-4">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: (SLOT_COLORS[dose.slot] ?? '#6B7280') + '18' }}
                    >
                      <Clock size={13} style={{ color: SLOT_COLORS[dose.slot] ?? '#6B7280' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{dose.medicine.name}</p>
                      <p className="text-xs text-gray-400">{dose.medicine.dosage} · {dose.slot}</p>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => markDose(dose.medicine.id, dose.slot, true)}
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                          dose.status === 'taken' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400 hover:bg-green-100 hover:text-green-500'
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
          <div className="bg-white rounded-3xl border border-black/[0.05] overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-50">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">All Medicines</p>
            </div>

            {medicines.length === 0 && !loading ? (
              <div className="flex flex-col items-center py-14 px-6 text-center">
                <Pill size={28} className="text-gray-200 mb-3" />
                <p className="text-sm text-gray-500">No medicines yet</p>
                <p className="text-xs text-gray-400 mt-1">Add your first medicine to start tracking</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {medicines.map(med => (
                  <div key={med.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/50 transition-colors group">
                    <div className="w-10 h-10 bg-[#C0203E]/8 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <Pill size={16} className="text-[#C0203E]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{med.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {med.dosage} · {med.frequency}
                        {med.condition_tag && ` · ${med.condition_tag}`}
                        {med.doctor && ` · Dr. ${med.doctor}`}
                      </p>
                      <div className="flex gap-1.5 mt-1.5">
                        {(med.times ?? []).map(slot => (
                          <span
                            key={slot}
                            className="text-[9px] font-bold px-2 py-0.5 rounded-full capitalize"
                            style={{
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
                      <div className="flex items-center gap-1 text-amber-500">
                        <AlertTriangle size={13} />
                        <span className="text-xs font-medium">{med.quantity_remaining} left</span>
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
              className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-gray-900">Add Medicine</h2>
                <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">
                  <X size={15} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Medicine name *</label>
                  <input
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Metformin"
                    className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#C0203E]/30"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Dosage *</label>
                    <input
                      value={form.dosage}
                      onChange={e => setForm(f => ({ ...f, dosage: e.target.value }))}
                      placeholder="e.g. 500mg"
                      className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#C0203E]/30"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Frequency</label>
                    <select
                      value={form.frequency}
                      onChange={e => setForm(f => ({ ...f, frequency: e.target.value as MedicineFrequency }))}
                      className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#C0203E]/30"
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
                  <label className="block text-xs font-medium text-gray-500 mb-2">Time slots</label>
                  <div className="flex gap-2 flex-wrap">
                    {['morning', 'afternoon', 'evening', 'night'].map(slot => (
                      <button
                        key={slot}
                        onClick={() => toggleSlot(slot)}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all capitalize"
                        style={{
                          background: form.times.includes(slot) ? (SLOT_COLORS[slot] + '22') : '#F9FAFB',
                          color: form.times.includes(slot) ? SLOT_COLORS[slot] : '#9CA3AF',
                          border: `1.5px solid ${form.times.includes(slot) ? SLOT_COLORS[slot] + '40' : '#E5E7EB'}`,
                        }}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Condition</label>
                    <select
                      value={form.condition_tag}
                      onChange={e => setForm(f => ({ ...f, condition_tag: e.target.value as Condition | '' }))}
                      className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#C0203E]/30"
                    >
                      <option value="">Select condition</option>
                      {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Doctor</label>
                    <input
                      value={form.doctor}
                      onChange={e => setForm(f => ({ ...f, doctor: e.target.value }))}
                      placeholder="Dr. Name"
                      className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#C0203E]/30"
                    />
                  </div>
                </div>

                <button
                  onClick={handleAdd}
                  disabled={!form.name || !form.dosage || saving}
                  className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-[#C0203E] hover:bg-[#A01830] transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Plus size={15} /> Add Medicine</>}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
