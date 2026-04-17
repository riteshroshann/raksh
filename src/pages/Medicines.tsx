import React, { useState, useEffect, useRef } from 'react';
import { Plus, Check, X, Pill, Clock, AlertTriangle, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../context/AppContext';
import { useMedicines } from '../hooks/useMedicines';
import type { MedicineFrequency, Condition } from '../lib/types';
import { saveRemindersForMedicine, scheduleAllReminders, notificationsGranted } from '../lib/notifications';

const CONDITIONS: Condition[] = ['Diabetes', 'Thyroid', 'Heart', 'Kidney', 'Hypertension'];
const SUGGESTIONS = ['Metformin', 'Amlodipine', 'Atorvastatin', 'Aspirin', 'Levothyroxine', 'Losartan', 'Pantoprazole', 'Vitamin D3', 'Telmisartan', 'Glimepiride', 'Rosuvastatin', 'Ramipril'];
const FOOD_OPTS = ['Before food', 'After food', 'With food', 'Empty stomach', 'Anytime'];

// Utility to generate initial time arrays based on frequency
function getDefaultTimes(fq: MedicineFrequency) {
  if (fq === 'once' || fq === 'weekly') return ['08:00'];
  if (fq === 'twice') return ['08:00', '14:00'];
  if (fq === 'thrice') return ['08:00', '14:00', '21:00'];
  return []; // as_needed
}

// Convert 24h "14:00" to "02:00 PM"
function formatTime12h(time24: string) {
  if (!time24) return '';
  const [h, m] = time24.split(':');
  let hours = parseInt(h, 10);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${hours.toString().padStart(2, '0')}:${m} ${ampm}`;
}

export default function Medicines() {
  const { user } = useAppContext();
  const userId = user?.id;
  const { medicines, loading, todayDoses, addMedicine, markDose, deleteMedicine } = useMedicines(userId, null);

  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState('');

  const taken = todayDoses.filter(d => d.status === 'taken').length;
  const total = todayDoses.length;

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
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors hover:opacity-90"
          style={{ background: '#B91C1C', boxShadow: '0 2px 8px rgba(185,28,28,0.25)' }}
        >
          <Plus size={16} /> Add medicine
        </button>
      </div>

      {total > 0 && (
        <div className="bg-white rounded-2xl border p-4 mb-6 flex items-center gap-3" style={{ borderColor: 'rgba(0,0,0,0.07)' }}>
          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${(taken / total) * 100}%`, background: '#B91C1C' }}
            />
          </div>
          <span style={{ fontSize: 13, fontWeight: 500, color: '#374151', flexShrink: 0 }}>{taken}/{total} taken</span>
        </div>
      )}

      {/* Main grids... (unchanged conceptually, minor tint adjustments to match new red) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2">
          {/* Today's schedule UI */}
          <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: 'rgba(0,0,0,0.07)' }}>
            <div className="px-5 py-4 border-b" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#6B7280' }}>Today's schedule</p>
            </div>
            {loading ? (
              <div className="p-5 space-y-3">
                {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-14 rounded-xl" />)}
              </div>
            ) : todayDoses.length === 0 ? (
              <div className="flex flex-col items-center py-12 px-6 text-center">
                <Pill size={28} style={{ color: '#E5E7EB', marginBottom: 12 }} />
                <p style={{ fontSize: 14, fontWeight: 500, color: '#6B7280' }}>No medicines added yet</p>
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: 'rgba(0,0,0,0.04)' }}>
                {todayDoses.map((dose, i) => (
                  <div key={i} className="flex items-center gap-3 px-5 py-4">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 bg-red-50 text-red-600">
                      <Clock size={13} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p style={{ fontSize: 14, fontWeight: 500, color: '#111827' }} className="truncate">{dose.medicine.name}</p>
                      <p style={{ fontSize: 12, color: '#9CA3AF', textTransform: 'capitalize' }}>
                        {dose.medicine.dosage} · {dose.slot.replace(/_/g, ' ')}
                      </p>
                    </div>
                    <div className="flex gap-1.5">
                      <button onClick={() => markDose(dose.medicine.id, dose.slot, true)} className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${dose.status === 'taken' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'}`}><Check size={13} /></button>
                      <button onClick={() => markDose(dose.medicine.id, dose.slot, false)} className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${dose.status === 'skipped' ? 'bg-red-400 text-white' : 'bg-gray-100 text-gray-400'}`}><X size={13} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-3">
          {/* All medicines UI */}
          <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: 'rgba(0,0,0,0.07)' }}>
            <div className="px-5 py-4 border-b" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
               <p style={{ fontSize: 12, fontWeight: 600, color: '#6B7280' }}>All medicines</p>
            </div>
            {medicines.length === 0 && !loading ? (
              <div className="flex flex-col items-center py-12 px-6 text-center">
                <Pill size={28} style={{ color: '#E5E7EB', marginBottom: 12 }} />
                <p style={{ fontSize: 14, fontWeight: 500, color: '#6B7280' }}>No medicines yet</p>
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: 'rgba(0,0,0,0.04)' }}>
                {medicines.map(med => (
                  <div key={med.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50/50 transition-colors group">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 bg-red-50">
                      <Pill size={16} style={{ color: '#B91C1C' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p style={{ fontSize: 14, fontWeight: 500, color: '#111827' }}>{med.name}</p>
                      <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>
                        {med.dosage} · {med.frequency.replace(/_/g, ' ')}
                      </p>
                      <div className="flex gap-1.5 mt-1.5 flex-wrap">
                        {(med.times ?? []).map((t, i) => (
                           <span key={i} style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 6, background: '#FEF2F2', color: '#B91C1C' }}>
                             {formatTime12h(t)}
                           </span>
                        ))}
                      </div>
                    </div>
                    {med.quantity_remaining != null && (
                      <div className="flex flex-col items-end gap-1">
                        <span style={{ fontSize: 12, fontWeight: 500, color: med.quantity_remaining <= 5 ? '#D97706' : '#6B7280' }}>{med.quantity_remaining} tabs</span>
                      </div>
                    )}
                    <button onClick={() => deleteMedicine(med.id)} className="opacity-0 group-hover:opacity-100 hidden md:flex w-7 h-7 rounded-full bg-red-50 text-red-500 items-center justify-center transition-all ml-2">
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
          <AddMedicineSheet 
            key="sheet"
            onClose={() => setShowForm(false)} 
            onSuccess={(name) => { setShowForm(false); setToast(`${name} added ✓`); setTimeout(() => setToast(''), 2000); }} 
            userId={userId} 
            addMedicine={addMedicine} 
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} style={{ position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)', background: '#374151', color: 'white', padding: '12px 24px', borderRadius: 999, fontSize: 14, fontWeight: 500, zIndex: 100, boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}>
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── THE ADD MEDICINE SHEET EXACTLY TO PROMPT SPEC ──
function AddMedicineSheet({ onClose, onSuccess, userId, addMedicine }: { onClose: () => void, onSuccess: (name: string) => void, userId?: string, addMedicine: any }) {
  const [form, setForm] = useState({
    name: '', dosage: '', frequency: 'once' as MedicineFrequency,
    times: ['08:00'], food: 'After food',
    stock: '', refillAlert: '5', condition: '', doctor: ''
  });
  
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [saving, setSaving] = useState(false);

  const dosesPerDay = form.frequency === 'twice' ? 2 : form.frequency === 'thrice' ? 3 : form.frequency === 'as_needed' ? 0 : 1;
  const supplyDays = form.stock && dosesPerDay > 0 ? Math.floor(parseInt(form.stock) / dosesPerDay) : null;
  
  // Validation
  const errName = touched.name && form.name.length < 2 ? "Enter a medicine name" : null;
  const errDose = touched.dosage && !form.dosage ? "Enter the dosage (e.g. 500mg)" : null;
  const errTime = touched.times && dosesPerDay > 0 && form.times.some(t => !t) ? "Set at least one reminder time" : null;
  const errStock = touched.stock && form.stock !== '' && parseInt(form.stock) <= 0 ? "Enter a valid number" : null;

  const isValid = form.name.length >= 2 && form.dosage && !(dosesPerDay > 0 && form.times.some(t => !t)) && !(form.stock !== '' && parseInt(form.stock) <= 0);

  const setField = (key: string, val: any) => setForm(f => ({ ...f, [key]: val }));
  const blur = (key: string) => setTouched(t => ({ ...t, [key]: true }));

  // Adjust times array when frequency changes
  useEffect(() => {
    setForm(f => ({ ...f, times: getDefaultTimes(f.frequency) }));
  }, [form.frequency]);

  const handleSave = async () => {
    if (!isValid || saving || !userId) return;
    setSaving(true);
    
    // 1. Save to DB
    await addMedicine({
      user_id: userId, family_member_id: null,
      name: form.name.trim(), dosage: form.dosage.trim(), frequency: form.frequency,
      times: form.times, food_instruction: form.food.toLowerCase().replace(' ', '_'),
      condition_tag: form.condition || null, 
      quantity_total: form.stock ? parseInt(form.stock) : null,
      quantity_remaining: form.stock ? parseInt(form.stock) : null,
      refill_threshold: form.stock ? parseInt(form.refillAlert) : null,
      start_date: new Date().toISOString().split('T')[0],
      doctor: form.doctor.trim() || null, notes: null, is_active: true
    });

    // 2. Schedule push notifications locally based on exact custom times
    if (notificationsGranted() && form.times.length > 0) {
      saveRemindersForMedicine(form.name, form.times.map(t => ({
        medicineName: form.name, dosage: form.dosage, slot: 'custom', time: t
      })));
      scheduleAllReminders();
    }

    setSaving(false);
    onSuccess(form.name);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center md:items-center items-end justify-center">
      {/* Dimmed Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
        className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.4)' }}
        onClick={() => {
          if (Object.keys(touched).length > 0) {
             if (window.confirm('Discard changes?')) onClose();
          } else onClose();
        }}
      />

      {/* Modal Sheet */}
      <motion.div
        initial={{ y: '100%', opacity: 1 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 1 }}
        transition={{ type: 'tween', duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
        className="relative bg-white w-full max-w-[500px] flex flex-col md:rounded-[20px] rounded-t-[24px]"
        style={{ maxHeight: '90vh' }}
      >
        {/* Mobile handle */}
        <div className="w-full flex justify-center md:hidden pt-3 pb-1">
           <div className="w-8 h-1 rounded-full bg-gray-200" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 pb-2">
           <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 20, color: '#111827' }}>Add medicine</h2>
           <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
             <X size={18} strokeWidth={2.5} />
           </button>
        </div>

        {/* Scrollable Form */}
        <div className="px-6 py-4 overflow-y-auto space-y-6" style={{ paddingBottom: 100 }}>
           
           {/* 1. Name */}
           <div>
             <label style={{ fontSize: 13, color: '#6B7280', display: 'block', marginBottom: 8 }}>Medicine name *</label>
             <input type="text"
               value={form.name}
               onFocus={() => setShowSuggestions(true)}
               onChange={e => setField('name', e.target.value)} onBlur={() => blur('name')}
               style={{ width: '100%', height: 52, padding: '0 16px', borderRadius: 12, border: '1.5px solid #E5E7EB', background: '#F9FAFB', fontSize: 15, outline: 'none' }}
               onFocusCapture={e => e.currentTarget.style.borderColor = '#B91C1C'}
               onBlurCapture={e => e.currentTarget.style.borderColor = '#E5E7EB'}
             />
             {errName && <p className="text-red-500 text-xs mt-1.5 font-medium">{errName}</p>}
             
             {/* Suggestions */}
             <AnimatePresence>
               {showSuggestions && !form.name && (
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
                   className="flex gap-2 overflow-x-auto mt-2 pb-1 scrollbar-hide no-scrollbar" style={{ WebkitOverflowScrolling: 'touch' }}>
                   {SUGGESTIONS.map(s => (
                     <button key={s} type="button" onClick={() => { setField('name', s); setShowSuggestions(false); }}
                       style={{ padding: '6px 14px', borderRadius: 999, background: '#F3F4F6', fontSize: 13, color: '#374151', whiteSpace: 'nowrap' }}>
                       {s}
                     </button>
                   ))}
                 </motion.div>
               )}
             </AnimatePresence>
           </div>

           {/* 2. Dosage + Frequency */}
           <div className="grid grid-cols-2 gap-4">
             <div>
               <label style={{ fontSize: 13, color: '#6B7280', display: 'block', marginBottom: 8 }}>Dosage *</label>
               <input type="text" placeholder="e.g. 500mg"
                 value={form.dosage} onChange={e => setField('dosage', e.target.value)} onBlur={() => blur('dosage')}
                 style={{ width: '100%', height: 52, padding: '0 16px', borderRadius: 12, border: '1.5px solid #E5E7EB', background: '#F9FAFB', fontSize: 15, outline: 'none' }}
                 onFocusCapture={e => e.currentTarget.style.borderColor = '#B91C1C'} onBlurCapture={e => e.currentTarget.style.borderColor = '#E5E7EB'}
               />
               {errDose && <p className="text-red-500 text-xs mt-1.5 font-medium">{errDose}</p>}
             </div>
             <div>
               <label style={{ fontSize: 13, color: '#6B7280', display: 'block', marginBottom: 8 }}>Frequency</label>
               <div className="relative">
                 <select value={form.frequency} onChange={e => setField('frequency', e.target.value as MedicineFrequency)}
                   style={{ width: '100%', height: 52, padding: '0 16px', borderRadius: 12, border: '1.5px solid #E5E7EB', background: 'white', fontSize: 15, outline: 'none', appearance: 'none' }}>
                   <option value="once">Once daily</option>
                   <option value="twice">Twice daily</option>
                   <option value="thrice">Thrice daily</option>
                   <option value="every_other">Every other day</option>
                   <option value="weekly">Weekly</option>
                   <option value="as_needed">As needed</option>
                 </select>
                 <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
               </div>
             </div>
           </div>

           {/* 3. When to take it. Hide totally if as_needed */}
           {form.frequency !== 'as_needed' && (
             <div>
               <label style={{ fontSize: 13, color: '#6B7280', display: 'block', marginBottom: 8 }}>When to take it *</label>
               <div className="space-y-3">
                 <AnimatePresence initial={false}>
                   {form.times.map((t, i) => (
                     <motion.div key={i} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                       <div className="flex items-center justify-between">
                         <span style={{ color: '#6B7280', fontSize: 13, fontWeight: 500 }}>Dose {i + 1}</span>
                         <div className="relative">
                           <input type="time" required value={t} 
                             onChange={e => { const nt=[...form.times]; nt[i]=e.target.value; setField('times', nt); }} 
                             onBlur={() => blur('times')}
                             style={{ background: '#F9FAFB', border: '1.5px solid #E5E7EB', borderRadius: 10, padding: '8px 14px', outline: 'none', fontSize: 14, fontWeight: 600, color: '#111827', cursor: 'pointer', appearance: 'none', minWidth: 110, textAlign: 'center' }} 
                           />
                         </div>
                       </div>
                       <p className="text-[#9CA3AF] text-[11px] mt-1 text-right">Reminder will be sent at this time</p>
                     </motion.div>
                   ))}
                 </AnimatePresence>
               </div>
               {errTime && <p className="text-red-500 text-xs mt-1.5 font-medium">{errTime}</p>}

               <div className="flex gap-2 overflow-x-auto mt-4 pb-1 scrollbar-hide no-scrollbar" style={{ WebkitOverflowScrolling: 'touch' }}>
                 {FOOD_OPTS.map(fo => {
                   const sel = form.food === fo;
                   return (
                     <button key={fo} type="button" onClick={() => setField('food', fo)}
                       style={{ padding: '6px 14px', borderRadius: 999, fontSize: 13, whiteSpace: 'nowrap', fontWeight: 500, transition: 'all 0.15s',
                         background: sel ? '#FEF2F2' : '#F3F4F6', color: sel ? '#B91C1C' : '#374151', border: `1.5px solid ${sel ? '#B91C1C' : 'transparent'}` }}>
                       {fo}
                     </button>
                   );
                 })}
               </div>
             </div>
           )}

           {/* 4. Tablets in stock */}
           <div>
             <label style={{ fontSize: 13, color: '#111827', display: 'block', marginBottom: 8, fontWeight: 500 }}>
               Tablets in hand <span className="text-[#9CA3AF] font-normal">(optional)</span>
             </label>
             <input type="number" min="0" placeholder="e.g. 30"
               value={form.stock} onChange={e => setField('stock', e.target.value)} onBlur={() => blur('stock')}
               style={{ width: '100%', height: 52, padding: '0 16px', borderRadius: 12, border: '1.5px solid #E5E7EB', background: 'white', fontSize: 15, outline: 'none' }}
               onFocusCapture={e => e.currentTarget.style.borderColor = '#B91C1C'} onBlurCapture={e => e.currentTarget.style.borderColor = '#E5E7EB'}
             />
             {errStock ? <p className="text-red-500 text-xs mt-1.5 font-medium">{errStock}</p> : 
               supplyDays && supplyDays > 0 ? <p className="text-[#9CA3AF] text-[12px] mt-1.5">Estimated supply: {supplyDays} days</p> : null
             }

             {/* Refill conditional */}
             <AnimatePresence>
               {form.stock && parseInt(form.stock) > 0 && (
                 <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-4">
                   <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 8 }}>Remind me when</p>
                   <div className="flex gap-2">
                     {['3', '5', '7'].map(num => {
                       const sel = form.refillAlert === num;
                       return (
                         <button key={num} type="button" onClick={() => setField('refillAlert', num)}
                           style={{ padding: '6px 14px', borderRadius: 999, fontSize: 13, fontWeight: 500, transition: 'all 0.15s',
                             background: sel ? '#FEF2F2' : '#F3F4F6', color: sel ? '#B91C1C' : '#374151', border: `1.5px solid ${sel ? '#B91C1C' : 'transparent'}` }}>
                           {num} tabs left
                         </button>
                       );
                     })}
                   </div>
                 </motion.div>
               )}
             </AnimatePresence>
           </div>

           {/* 5. Condition + Doctor */}
           <div className="grid grid-cols-2 gap-4">
             <div>
               <label style={{ fontSize: 13, color: '#6B7280', display: 'block', marginBottom: 8 }}>Condition</label>
               <div className="relative">
                 <select value={form.condition} onChange={e => setField('condition', e.target.value)}
                   style={{ width: '100%', height: 52, padding: '0 16px', borderRadius: 12, border: '1.5px solid #E5E7EB', background: 'white', fontSize: 15, outline: 'none', appearance: 'none', borderLeftWidth: form.condition ? 4 : 1.5, borderLeftColor: form.condition ? '#B91C1C' : '#E5E7EB' }}>
                   <option value="">Select condition</option>
                   {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                   <option value="Other">Other</option>
                 </select>
                 <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
               </div>
             </div>
             <div>
               <label style={{ fontSize: 13, color: '#6B7280', display: 'block', marginBottom: 8 }}>Doctor</label>
               <input type="text" placeholder="Dr. name"
                 value={form.doctor} onChange={e => setField('doctor', e.target.value)}
                 style={{ width: '100%', height: 52, padding: '0 16px', borderRadius: 12, border: '1.5px solid #E5E7EB', background: 'white', fontSize: 15, outline: 'none' }}
                 onFocusCapture={e => e.currentTarget.style.borderColor = '#B91C1C'} onBlurCapture={e => e.currentTarget.style.borderColor = '#E5E7EB'}
               />
             </div>
           </div>
        </div>

        {/* Absolute Bottom Save Button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100" style={{ zIndex: 10 }}>
           <motion.button
             whileTap={isValid ? { scale: 0.97 } : {}}
             onClick={handleSave}
             disabled={!isValid || saving}
             style={{
                width: '100%', height: 52, borderRadius: 14, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 16,
                background: isValid ? '#B91C1C' : '#FECACA', color: 'white', cursor: isValid ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', transition: 'background 0.2s'
             }}
           >
             {saving ? 'Saving...' : '+ Add medicine'}
           </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
