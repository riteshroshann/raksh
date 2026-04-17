import React, { useState, useEffect } from 'react';
import { Plus, Check, X, Pill, Clock, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../context/AppContext';
import { useMedicines } from '../hooks/useMedicines';
import type { MedicineFrequency, Condition } from '../lib/types';
import { saveRemindersForMedicine, scheduleAllReminders, notificationsGranted } from '../lib/notifications';

const CONDITIONS: Condition[] = ['Diabetes', 'Thyroid', 'Heart', 'Kidney', 'Hypertension'];
const SUGGESTIONS = ['Metformin', 'Amlodipine', 'Atorvastatin', 'Aspirin', 'Levothyroxine', 'Losartan', 'Pantoprazole', 'Vitamin D3', 'Telmisartan', 'Glimepiride', 'Rosuvastatin', 'Ramipril'];
const FOOD_OPTS = ['Before food', 'After food', 'With food', 'Empty stomach', 'Anytime'];

function getDefaultTimes(fq: MedicineFrequency) {
  if (fq === 'once' || fq === 'weekly') return ['08:00'];
  if (fq === 'twice') return ['08:00', '14:00'];
  if (fq === 'thrice') return ['08:00', '14:00', '21:00'];
  return []; 
}

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
  const { user, isDarkMode } = useAppContext();
  const userId = user?.id;
  const { medicines, loading, todayDoses, addMedicine, markDose, deleteMedicine } = useMedicines(userId, null);

  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState('');

  const taken = todayDoses.filter(d => d.status === 'taken').length;
  const total = todayDoses.length;

  // Theme tokens
  const cardBg   = isDarkMode ? 'rgba(22,22,30,0.72)' : 'rgba(255,255,255,0.9)';
  const cardBd   = isDarkMode ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
  const textPri  = isDarkMode ? '#F3F4F6' : '#111827';
  const textSec  = isDarkMode ? 'rgba(255,255,255,0.45)' : '#6B7280';
  const textMut  = isDarkMode ? 'rgba(255,255,255,0.28)' : '#9CA3AF';
  const divider  = isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';
  const hoverRow = isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)';
  const pillIconBg = isDarkMode ? 'rgba(192,32,62,0.15)' : 'rgba(192,32,62,0.08)';

  return (
    <div style={{ padding: '20px 20px 96px', maxWidth: 900, margin: '0 auto' }} className="lg:px-8 lg:pb-12">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: textPri, letterSpacing: '-0.02em' }}>Medicines</h1>
          <p style={{ fontSize: 13, color: textSec, marginTop: 3 }}>
            {total > 0 ? `${taken} of ${total} doses taken today` : 'Manage your medications'}
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 12, fontSize: 14, fontWeight: 600, color: 'white', background: '#C0203E', border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(192,32,62,0.3)', fontFamily: 'inherit' }}
        >
          <Plus size={16} /> Add medicine
        </button>
      </div>

      {total > 0 && (
        <div style={{ background: cardBg, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: `1px solid ${cardBd}`, borderRadius: 16, padding: 16, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1, height: 6, background: isDarkMode ? 'rgba(255,255,255,0.08)' : '#F3F4F6', borderRadius: 999, overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 999, transition: 'width 0.5s ease', background: '#C0203E', width: `${(taken / total) * 100}%` }} />
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, color: textPri, flexShrink: 0 }}>{taken}/{total} taken</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }} className="lg:grid-cols-5">
        <div style={{ gridColumn: 'span 1' }} className="lg:col-span-2">
          {/* Today's schedule UI */}
          <div style={{ background: cardBg, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: `1px solid ${cardBd}`, borderRadius: 20, overflow: 'hidden', boxShadow: isDarkMode ? '0 4px 20px rgba(0,0,0,0.3)' : '0 2px 16px rgba(0,0,0,0.05)' }}>
            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${divider}` }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: textSec, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Today's schedule</p>
            </div>
            {loading ? (
              <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[...Array(3)].map((_, i) => (
                  <div key={i} style={{ height: 56, borderRadius: 12, background: isDarkMode ? 'rgba(255,255,255,0.05)' : '#F3F4F6', animation: 'skeleton-shimmer 1.5s ease-in-out infinite', backgroundSize: '200% 100%', backgroundImage: isDarkMode ? 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)' : 'linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)' }} />
                ))}
              </div>
            ) : todayDoses.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 24px', textAlign: 'center' }}>
                <Pill size={28} style={{ color: textMut, marginBottom: 12 }} />
                <p style={{ fontSize: 14, fontWeight: 500, color: textSec }}>No schedule today</p>
              </div>
            ) : (
              <div>
                {todayDoses.map((dose, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', borderBottom: i < todayDoses.length - 1 ? `1px solid ${divider}` : 'none' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: pillIconBg, color: '#C0203E' }}>
                      <Clock size={16} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 15, fontWeight: 600, color: textPri, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{dose.medicine.name}</p>
                      <p style={{ fontSize: 12, color: textMut, textTransform: 'capitalize', marginTop: 2 }}>
                        {dose.medicine.dosage} · {dose.slot.replace(/_/g, ' ')}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => markDose(dose.medicine.id, dose.slot, true)} className="transition-colors" style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', background: dose.status === 'taken' ? '#15803D' : (isDarkMode ? 'rgba(255,255,255,0.05)' : '#F3F4F6'), color: dose.status === 'taken' ? 'white' : textMut, boxShadow: dose.status === 'taken' ? '0 2px 8px rgba(21,128,61,0.4)' : 'none' }}><Check size={14} strokeWidth={3} /></button>
                      <button onClick={() => markDose(dose.medicine.id, dose.slot, false)} className="transition-colors" style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', background: dose.status === 'skipped' ? '#C0203E' : (isDarkMode ? 'rgba(255,255,255,0.05)' : '#F3F4F6'), color: dose.status === 'skipped' ? 'white' : textMut, boxShadow: dose.status === 'skipped' ? '0 2px 8px rgba(192,32,62,0.4)' : 'none' }}><X size={14} strokeWidth={3} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{ gridColumn: 'span 1' }} className="lg:col-span-3">
          {/* All medicines UI */}
          <div style={{ background: cardBg, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: `1px solid ${cardBd}`, borderRadius: 20, overflow: 'hidden', boxShadow: isDarkMode ? '0 4px 20px rgba(0,0,0,0.3)' : '0 2px 16px rgba(0,0,0,0.05)' }}>
            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${divider}` }}>
               <p style={{ fontSize: 12, fontWeight: 600, color: textSec, textTransform: 'uppercase', letterSpacing: '0.06em' }}>All medicines</p>
            </div>
            {loading ? (
              <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[...Array(4)].map((_, i) => (
                  <div key={i} style={{ height: 64, borderRadius: 12, background: isDarkMode ? 'rgba(255,255,255,0.05)' : '#F3F4F6', animation: 'skeleton-shimmer 1.5s ease-in-out infinite', backgroundSize: '200% 100%', backgroundImage: isDarkMode ? 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)' : 'linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)' }} />
                ))}
              </div>
            ) : medicines.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '56px 24px', textAlign: 'center' }}>
                <div style={{ width: 48, height: 48, borderRadius: 16, background: pillIconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                  <Pill size={20} style={{ color: '#C0203E' }} />
                </div>
                <p style={{ fontSize: 15, fontWeight: 600, color: textPri, marginBottom: 4 }}>No medicines stored</p>
                <p style={{ fontSize: 13, color: textSec }}>Add your active prescriptions here.</p>
              </div>
            ) : (
              <div>
                {medicines.map((med, idx) => (
                  <div key={med.id} className="group transition-colors" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', borderBottom: idx < medicines.length - 1 ? `1px solid ${divider}` : 'none' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = hoverRow; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                  >
                    <div style={{ width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: pillIconBg, color: '#C0203E' }}>
                      <Pill size={18} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 15, fontWeight: 600, color: textPri }}>{med.name}</p>
                      <p style={{ fontSize: 12, color: textMut, marginTop: 2 }}>
                        {med.dosage} · {med.frequency.replace(/_/g, ' ')}
                      </p>
                      <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                        {(med.times ?? []).map((t, i) => (
                           <span key={i} style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: pillIconBg, color: isDarkMode ? '#ff8a99' : '#C0203E' }}>
                             {formatTime12h(t)}
                           </span>
                        ))}
                      </div>
                    </div>
                    {med.quantity_remaining != null && (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: med.quantity_remaining <= 5 ? '#D97706' : textSec }}>{med.quantity_remaining} tabs</span>
                      </div>
                    )}
                    <button onClick={() => deleteMedicine(med.id)} className="md:opacity-0 group-hover:opacity-100 transition-opacity" style={{ width: 32, height: 32, borderRadius: '50%', background: pillIconBg, color: '#ef4444', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: 8 }}>
                      <X size={14} strokeWidth={3} />
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
            onSuccess={(name) => { setShowForm(false); setToast(`${name} added ✓`); setTimeout(() => setToast(''), 2500); }} 
            userId={userId} 
            addMedicine={addMedicine} 
            isDarkMode={isDarkMode}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: isDarkMode ? '#F3F4F6' : '#111827', color: isDarkMode ? '#111827' : 'white', padding: '12px 24px', borderRadius: 999, fontSize: 14, fontWeight: 600, zIndex: 100, boxShadow: '0 8px 32px rgba(0,0,0,0.15)', border: `1px solid ${isDarkMode ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'}`, whiteSpace: 'nowrap' }}>
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── ADD MEDICINE SHEET ──
function AddMedicineSheet({ onClose, onSuccess, userId, addMedicine, isDarkMode }: { onClose: () => void, onSuccess: (name: string) => void, userId?: string, addMedicine: any, isDarkMode: boolean }) {
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
  
  const errName = touched.name && form.name.length < 2 ? "Enter a medicine name" : null;
  const errDose = touched.dosage && !form.dosage ? "Enter the dosage (e.g. 500mg)" : null;
  const errTime = touched.times && dosesPerDay > 0 && form.times.some(t => !t) ? "Set at least one reminder time" : null;
  const errStock = touched.stock && form.stock !== '' && parseInt(form.stock) <= 0 ? "Enter a valid number" : null;

  const isValid = form.name.length >= 2 && form.dosage && !(dosesPerDay > 0 && form.times.some(t => !t)) && !(form.stock !== '' && parseInt(form.stock) <= 0);

  const setField = (key: string, val: any) => setForm(f => ({ ...f, [key]: val }));
  const blur = (key: string) => setTouched(t => ({ ...t, [key]: true }));

  useEffect(() => {
    setForm(f => ({ ...f, times: getDefaultTimes(f.frequency) }));
  }, [form.frequency]);

  const handleSave = async () => {
    if (!isValid || saving || !userId) return;
    setSaving(true);
    
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

    if (notificationsGranted() && form.times.length > 0) {
      saveRemindersForMedicine(form.name, form.times.map(t => ({
        medicineName: form.name, dosage: form.dosage, slot: 'custom', time: t
      })));
      scheduleAllReminders();
    }

    setSaving(false);
    onSuccess(form.name);
  };

  const bgModal  = isDarkMode ? '#1e1e24' : '#ffffff';
  const textPri  = isDarkMode ? '#f3f4f6' : '#111827';
  const textSec  = isDarkMode ? '#9ca3af' : '#6b7280';
  const textMut  = isDarkMode ? '#6b7280' : '#9ca3af';
  const inputBg  = isDarkMode ? 'rgba(255,255,255,0.04)' : '#f9fafb';
  const inputBd  = isDarkMode ? 'rgba(255,255,255,0.1)' : '#e5e7eb';
  const pillBg   = isDarkMode ? 'rgba(255,255,255,0.08)' : '#f3f4f6';
  const pillText = isDarkMode ? '#d1d5db' : '#374151';
  const optBg    = isDarkMode ? '#1e1e24' : '#ffffff';

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center md:items-center">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
        className="absolute inset-0" style={{ background: isDarkMode ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
        onClick={() => {
          if (Object.keys(touched).length > 0) {
             if (window.confirm('Discard changes?')) onClose();
          } else onClose();
        }}
      />

      <motion.div
        initial={{ y: '100%', opacity: 1 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 1 }}
        transition={{ type: 'tween', duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
        className="relative w-full max-w-[500px] flex flex-col md:rounded-[20px] rounded-t-[24px] shadow-2xl overflow-hidden"
        style={{ maxHeight: '90dvh', background: bgModal, border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : 'none' }}
      >
        <div className="w-full flex justify-center md:hidden pt-3 pb-1">
           <div className="w-8 h-1 rounded-full" style={{ background: isDarkMode ? 'rgba(255,255,255,0.2)' : '#e5e7eb' }} />
        </div>

        <div className="flex items-center justify-between px-6 py-4 pb-2">
           <h2 style={{ fontFamily: "inherit", fontWeight: 700, fontSize: 20, color: textPri, letterSpacing: '-0.02em' }}>Add medicine</h2>
           <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: '50%', background: isDarkMode ? 'rgba(255,255,255,0.05)' : '#f3f4f6', color: textSec, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
             <X size={18} strokeWidth={2.5} />
           </button>
        </div>

        <div className="flex-1 px-6 py-2 overflow-y-auto space-y-6 pb-6">
           {/* Name */}
           <div>
             <label style={{ fontSize: 13, fontWeight: 500, color: textSec, display: 'block', marginBottom: 8 }}>Medicine name *</label>
             <input type="text"
               value={form.name} onFocus={() => setShowSuggestions(true)}
               onChange={e => setField('name', e.target.value)} onBlur={() => blur('name')}
               style={{ width: '100%', height: 52, padding: '0 16px', borderRadius: 12, border: `1.5px solid ${inputBd}`, background: inputBg, color: textPri, fontSize: 15, outline: 'none', transition: 'border-color 0.15s', boxSizing: 'border-box' }}
               onFocusCapture={e => e.currentTarget.style.borderColor = '#C0203E'}
               onBlurCapture={e => e.currentTarget.style.borderColor = inputBd}
             />
             {errName && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 6, fontWeight: 500 }}>{errName}</p>}
             
             <AnimatePresence>
               {showSuggestions && !form.name && (
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
                   className="flex gap-2 overflow-x-auto mt-3 pb-1 no-scrollbar" style={{ WebkitOverflowScrolling: 'touch' }}>
                   {SUGGESTIONS.map(s => (
                     <button key={s} type="button" onClick={() => { setField('name', s); setShowSuggestions(false); }}
                       style={{ padding: '7px 14px', borderRadius: 999, background: pillBg, fontSize: 13, fontWeight: 500, color: pillText, whiteSpace: 'nowrap', border: 'none', cursor: 'pointer' }}>
                       {s}
                     </button>
                   ))}
                 </motion.div>
               )}
             </AnimatePresence>
           </div>

           {/* Dosage & Freq */}
           <div className="grid grid-cols-2 gap-4">
             <div>
               <label style={{ fontSize: 13, fontWeight: 500, color: textSec, display: 'block', marginBottom: 8 }}>Dosage *</label>
               <input type="text" placeholder="e.g. 500mg"
                 value={form.dosage} onChange={e => setField('dosage', e.target.value)} onBlur={() => blur('dosage')}
                 style={{ width: '100%', height: 52, padding: '0 16px', borderRadius: 12, border: `1.5px solid ${inputBd}`, background: inputBg, color: textPri, fontSize: 15, outline: 'none', transition: 'border-color 0.15s', boxSizing: 'border-box' }}
                 onFocusCapture={e => e.currentTarget.style.borderColor = '#C0203E'} onBlurCapture={e => e.currentTarget.style.borderColor = inputBd}
               />
               {errDose && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 6, fontWeight: 500 }}>{errDose}</p>}
             </div>
             <div>
               <label style={{ fontSize: 13, fontWeight: 500, color: textSec, display: 'block', marginBottom: 8 }}>Frequency</label>
               <div className="relative">
                 <select value={form.frequency} onChange={e => setField('frequency', e.target.value as MedicineFrequency)}
                   style={{ width: '100%', height: 52, padding: '0 16px', borderRadius: 12, border: `1.5px solid ${inputBd}`, background: inputBg, color: textPri, fontSize: 15, outline: 'none', appearance: 'none', boxSizing: 'border-box' }}>
                   <option value="once" style={{ background: optBg, color: textPri }}>Once daily</option>
                   <option value="twice" style={{ background: optBg, color: textPri }}>Twice daily</option>
                   <option value="thrice" style={{ background: optBg, color: textPri }}>Thrice daily</option>
                   <option value="every_other" style={{ background: optBg, color: textPri }}>Every other day</option>
                   <option value="weekly" style={{ background: optBg, color: textPri }}>Weekly</option>
                   <option value="as_needed" style={{ background: optBg, color: textPri }}>As needed</option>
                 </select>
                 <ChevronDown size={18} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', color: textSec, pointerEvents: 'none' }} />
               </div>
             </div>
           </div>

           {/* Times */}
           {form.frequency !== 'as_needed' && (
             <div>
               <label style={{ fontSize: 13, fontWeight: 500, color: textSec, display: 'block', marginBottom: 8 }}>When to take it *</label>
               <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                 <AnimatePresence initial={false}>
                   {form.times.map((t, i) => (
                     <motion.div key={i} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                       <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                         <span style={{ color: textSec, fontSize: 13, fontWeight: 500 }}>Dose {i + 1}</span>
                         <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                           <input type="time" required value={t} 
                             onChange={e => { const nt=[...form.times]; nt[i]=e.target.value; setField('times', nt); }} 
                             onBlur={() => blur('times')}
                             style={{ background: isDarkMode ? 'rgba(255,255,255,0.06)' : '#f3f4f6', border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : '#e5e7eb'}`, borderRadius: 10, padding: '8px 12px', outline: 'none', fontSize: 15, fontWeight: 600, color: textPri, cursor: 'pointer', appearance: 'none', minWidth: 110, textAlign: 'center', fontFamily: 'inherit', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }} 
                           />
                         </div>
                       </div>
                       <p style={{ color: textMut, fontSize: 11, marginTop: 4, textAlign: 'right' }}>Reminder sent at this time</p>
                     </motion.div>
                   ))}
                 </AnimatePresence>
               </div>
               {errTime && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 6, fontWeight: 500 }}>{errTime}</p>}

               <div className="flex gap-2 overflow-x-auto mt-5 pb-1 no-scrollbar" style={{ WebkitOverflowScrolling: 'touch' }}>
                 {FOOD_OPTS.map(fo => {
                   const sel = form.food === fo;
                   return (
                     <button key={fo} type="button" onClick={() => setField('food', fo)}
                       style={{ padding: '7px 14px', borderRadius: 999, fontSize: 13, whiteSpace: 'nowrap', fontWeight: 500, transition: 'all 0.15s', cursor: 'pointer',
                         background: sel ? 'rgba(192,32,62,0.1)' : pillBg, color: sel ? '#C0203E' : pillText, border: `1.5px solid ${sel ? '#C0203E' : 'transparent'}` }}>
                       {fo}
                     </button>
                   );
                 })}
               </div>
             </div>
           )}

           {/* Stock */}
           <div>
             <label style={{ fontSize: 13, color: textPri, display: 'block', marginBottom: 8, fontWeight: 500 }}>
               Tablets in hand <span style={{ color: textMut, fontWeight: 400 }}>(optional)</span>
             </label>
             <input type="number" min="0" placeholder="e.g. 30"
               value={form.stock} onChange={e => setField('stock', e.target.value)} onBlur={() => blur('stock')}
               style={{ width: '100%', height: 52, padding: '0 16px', borderRadius: 12, border: `1.5px solid ${inputBd}`, background: inputBg, color: textPri, fontSize: 15, outline: 'none', transition: 'border-color 0.15s', boxSizing: 'border-box' }}
               onFocusCapture={e => e.currentTarget.style.borderColor = '#C0203E'} onBlurCapture={e => e.currentTarget.style.borderColor = inputBd}
             />
             {errStock ? <p style={{ color: '#ef4444', fontSize: 12, marginTop: 6, fontWeight: 500 }}>{errStock}</p> : 
               supplyDays && supplyDays > 0 ? <p style={{ color: textSec, fontSize: 12, marginTop: 6 }}>Estimated supply: {supplyDays} days</p> : null
             }

             <AnimatePresence>
               {form.stock && parseInt(form.stock) > 0 && (
                 <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
                   <div style={{ marginTop: 16 }}>
                     <p style={{ fontSize: 13, color: textSec, marginBottom: 8, fontWeight: 500 }}>Remind me when</p>
                     <div style={{ display: 'flex', gap: 8 }}>
                       {['3', '5', '7'].map(num => {
                         const sel = form.refillAlert === num;
                         return (
                           <button key={num} type="button" onClick={() => setField('refillAlert', num)}
                             style={{ padding: '7px 14px', borderRadius: 999, fontSize: 13, fontWeight: 500, transition: 'all 0.15s', cursor: 'pointer',
                               background: sel ? 'rgba(192,32,62,0.1)' : pillBg, color: sel ? '#C0203E' : pillText, border: `1.5px solid ${sel ? '#C0203E' : 'transparent'}` }}>
                             {num} tabs left
                           </button>
                         );
                       })}
                     </div>
                   </div>
                 </motion.div>
               )}
             </AnimatePresence>
           </div>

           {/* Condition & Doctor */}
           <div className="grid grid-cols-2 gap-4">
             <div>
               <label style={{ fontSize: 13, fontWeight: 500, color: textSec, display: 'block', marginBottom: 8 }}>Condition</label>
               <div className="relative">
                 <select value={form.condition} onChange={e => setField('condition', e.target.value)}
                   style={{ width: '100%', height: 52, padding: '0 16px', borderRadius: 12, border: `1.5px solid ${inputBd}`, background: inputBg, color: textPri, fontSize: 15, outline: 'none', appearance: 'none', borderLeftWidth: form.condition ? 4 : 1.5, borderLeftColor: form.condition ? '#C0203E' : inputBd, boxSizing: 'border-box' }}>
                   <option value="" style={{ background: optBg, color: textPri }}>Select condition</option>
                   {CONDITIONS.map(c => <option key={c} value={c} style={{ background: optBg, color: textPri }}>{c}</option>)}
                   <option value="Other" style={{ background: optBg, color: textPri }}>Other</option>
                 </select>
                 <ChevronDown size={18} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', color: textSec, pointerEvents: 'none' }} />
               </div>
             </div>
             <div>
               <label style={{ fontSize: 13, fontWeight: 500, color: textSec, display: 'block', marginBottom: 8 }}>Doctor</label>
               <input type="text" placeholder="Dr. name"
                 value={form.doctor} onChange={e => setField('doctor', e.target.value)}
                 style={{ width: '100%', height: 52, padding: '0 16px', borderRadius: 12, border: `1.5px solid ${inputBd}`, background: inputBg, color: textPri, fontSize: 15, outline: 'none', transition: 'border-color 0.15s', boxSizing: 'border-box' }}
                 onFocusCapture={e => e.currentTarget.style.borderColor = '#C0203E'} onBlurCapture={e => e.currentTarget.style.borderColor = inputBd}
               />
             </div>
           </div>
        </div>

        <div style={{ padding: '16px', background: bgModal, borderTop: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.05)' : '#f3f4f6'}` }}>
           <motion.button
             whileTap={isValid ? { scale: 0.98 } : {}}
             onClick={handleSave} disabled={!isValid || saving}
             style={{
                width: '100%', height: 52, borderRadius: 14, fontFamily: "inherit", fontWeight: 700, fontSize: 15,
                background: isValid ? '#C0203E' : (isDarkMode ? 'rgba(255,255,255,0.08)' : '#FECACA'), color: isValid ? 'white' : (isDarkMode ? 'rgba(255,255,255,0.3)' : 'white'), cursor: isValid ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', transition: 'all 0.2s', boxShadow: isValid ? '0 4px 16px rgba(192,32,62,0.3)' : 'none'
             }}
           >
             {saving ? 'Saving...' : '+ Add medicine'}
           </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
