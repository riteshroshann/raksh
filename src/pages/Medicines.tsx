import React, { useState } from 'react';
import { Search, Bell, ChevronRight, AlertCircle, Calendar, Clock, CheckCircle2, Pill as PillIcon } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { useAppContext } from '../context/AppContext';
import { useMedicines } from '../hooks/useMedicines';
import type { DoseTimeSlot } from '../lib/types';

const DAYS = [
  { day: 'Sun', date: 17 },
  { day: 'Mon', date: 18 },
  { day: 'Tue', date: 19 },
  { day: 'Wed', date: 20 },
  { day: 'Thu', date: 21 },
  { day: 'Fri', date: 22 },
  { day: 'Sat', date: 23 },
];

export default function Medicines() {
  const shouldReduce = useReducedMotion();
  const { user, familyMembers, activeMemberId, setActiveMemberId } = useAppContext();
  const [selectedDate, setSelectedDate] = useState('20');

  const { medicines, todayDoses, markDose } = useMedicines(user?.id, activeMemberId);

  const profile = user?.profile;
  const activeMember = familyMembers.find(m => m.id === activeMemberId);
  const displayName = activeMember?.name ?? profile?.full_name ?? 'there';
  const firstName = displayName.split(' ')[0];
  const initials = displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  const takenCount = todayDoses.filter(d => d.status === 'taken').length;
  const totalCount = todayDoses.length;
  const progress = totalCount > 0 ? (takenCount / totalCount) * 100 : 0;

  const lowStock = medicines.filter(m => m.quantity_remaining !== null && m.quantity_remaining <= 5);

  return (
    <div className="flex flex-col min-h-full bg-white">

      {/* ── Header ────────────────────────────────────────────────── */}
      <header className="px-6 pt-10 pb-4 flex items-center justify-between bg-white sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveMemberId(null)}
            className="w-10 h-10 rounded-full border border-black/[0.05] shadow-sm hover:scale-105 active:scale-95 transition-all"
            style={{ background: '#C0203E' }}
          >
            <span className="flex items-center justify-center h-full text-white text-sm font-semibold">{initials}</span>
          </button>
          <span className="text-lg font-light text-black">Hi, {firstName} ✨</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-10 h-10 flex items-center justify-center rounded-full bg-black/[0.03] border border-black/[0.03]">
            <Search size={18} className="text-black/50" />
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-full bg-black/[0.03] border border-black/[0.03]">
            <Bell size={18} className="text-black/50" />
          </button>
        </div>
      </header>

      <main className="flex-1 px-6 pb-4">

        {/* Title + today label */}
        <div className="flex items-center justify-between mt-4 mb-6">
          <h1 className="text-2xl font-medium text-black tracking-tight">Medicines</h1>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/[0.03] border border-black/[0.03]">
            <Calendar size={13} className="text-black/40" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-black/40">Today</span>
          </div>
        </div>

        {/* ── Calendar strip ─────────────────────────────────────── */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-caption">October 2025</span>
            <div className="flex gap-2">
              <ChevronRight size={15} className="text-black/20 rotate-180 cursor-pointer" />
              <ChevronRight size={15} className="text-black/20 cursor-pointer" />
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {DAYS.map((d, idx) => {
              const isActive = selectedDate === String(d.date);
              return (
                <motion.button
                  key={d.date}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  whileHover={shouldReduce ? {} : { y: -3 }}
                  whileTap={shouldReduce ? {} : { scale: 0.95 }}
                  onClick={() => setSelectedDate(String(d.date))}
                  className="flex flex-col items-center gap-1.5 min-w-[50px] py-3 rounded-3xl border transition-all"
                  style={isActive
                    ? { background: '#C0203E', borderColor: 'transparent', color: 'white', boxShadow: '0 8px 20px rgba(192,32,62,0.25)' }
                    : { background: 'rgba(0,0,0,0.04)', borderColor: 'rgba(0,0,0,0.04)', color: 'rgba(0,0,0,0.4)' }
                  }
                >
                  <span className="text-[9px] font-bold uppercase tracking-wider">{d.day}</span>
                  <span className="text-lg font-medium">{d.date}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* ── Progress ───────────────────────────────────────────── */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-black">Today's Progress</span>
            <span className="text-sm font-bold" style={{ color: '#C0203E' }}>{takenCount}/{totalCount} Taken</span>
          </div>
          <div className="h-4 rounded-full overflow-hidden bg-black/5 border border-black/5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(to right, #C0203E, rgba(192,32,62,0.6))', boxShadow: '0 0 15px rgba(192,32,62,0.3)' }}
            />
          </div>
          <p className="text-[10px] font-bold mt-1.5 uppercase tracking-wider text-black/20">
            {progress === 100 ? 'All medicines taken! Great job.' : `${totalCount - takenCount} more to go today`}
          </p>
        </div>

        {/* ── To take ─────────────────────────────────────────────── */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-5 px-1">
            <span className="text-xl font-medium text-black">To take</span>
          </div>
          <div className="flex flex-col gap-4">
            {todayDoses.length === 0 ? (
              <div className="glass-card p-6 text-center border border-black/5">
                <p className="text-sm text-black/40">No medicines scheduled. Add your first medicine →</p>
              </div>
            ) : (
              todayDoses.map(dose => {
                const taken = dose.status === 'taken';
                return (
                  <motion.div
                    key={`${dose.medicine.id}-${dose.slot}`}
                    whileHover={shouldReduce ? {} : { x: 4, backgroundColor: taken ? 'rgba(0,0,0,0.01)' : 'rgba(0,0,0,0.02)' }}
                    whileTap={shouldReduce ? {} : { scale: 0.985 }}
                    onClick={() => markDose(dose.medicine.id, dose.slot as DoseTimeSlot, !taken)}
                    className="glass-card p-5 flex items-center gap-5 cursor-pointer transition-all border"
                    style={{
                      borderColor: 'rgba(0,0,0,0.05)',
                      opacity: taken ? 0.5 : 1,
                    }}
                  >
                    <div
                      className="w-14 h-14 rounded-[1.5rem] flex items-center justify-center border shadow-sm"
                      style={taken
                        ? { background: 'rgba(0,0,0,0.05)', borderColor: 'rgba(0,0,0,0.05)' }
                        : { background: 'rgba(192,32,62,0.1)', borderColor: 'rgba(192,32,62,0.2)' }
                      }
                    >
                      <PillIcon size={24} style={{ color: taken ? 'rgba(0,0,0,0.1)' : '#C0203E' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h4 className={`text-base font-medium ${taken ? 'line-through text-black/30' : 'text-black'}`}>
                            {dose.medicine.name}
                          </h4>
                          <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-[#C0203E]/20 text-[#C0203E]">
                            {dose.slot}
                          </span>
                        </div>
                        {taken && (
                          <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center border border-green-500/30">
                            <CheckCircle2 size={11} className="text-green-500" />
                          </div>
                        )}
                      </div>
                      <p className={`text-xs mt-0.5 font-light ${taken ? 'text-black/20' : 'text-black/40'}`}>
                        {dose.medicine.dosage} · {dose.medicine.frequency}
                      </p>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

        {/* ── Refill Reminders ─────────────────────────────────────── */}
        {lowStock.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-5 px-1">
              <AlertCircle size={18} className="text-[#C0203E]" />
              <span className="text-xl font-medium text-black">Refill Reminders</span>
            </div>
            <div className="flex flex-col gap-4">
              {lowStock.map(med => (
                <div
                  key={med.id}
                  className="glass-card p-5 flex items-center gap-5 border"
                  style={{ background: 'rgba(192,32,62,0.04)', borderColor: 'rgba(192,32,62,0.15)' }}
                >
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center border bg-black/5 border-black/10">
                    <PillIcon size={22} className="text-[#C0203E]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-base font-medium text-black">{med.name}</h4>
                    <p className="text-xs font-bold" style={{ color: '#C0203E' }}>
                      {med.quantity_remaining} pills remaining
                    </p>
                  </div>
                  <button
                    className="px-5 py-2.5 text-white text-xs font-bold rounded-2xl active:scale-95 transition-all"
                    style={{ background: '#C0203E', boxShadow: '0 4px 12px rgba(192,32,62,0.3)' }}
                  >
                    Refill
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Upcoming Doctor Visit ───────────────────────────────── */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-5 px-1">
            <Calendar size={18} className="text-[#C0203E]" />
            <span className="text-xl font-medium text-black">Upcoming Doctor Visit</span>
          </div>
          <motion.div
            whileHover={shouldReduce ? {} : { scale: 1.01, boxShadow: '0 20px 40px rgba(192,32,62,0.2)' }}
            whileTap={shouldReduce ? {} : { scale: 0.99 }}
            className="glass-card p-6 flex items-center gap-5 cursor-pointer shadow-xl"
            style={{ background: 'linear-gradient(135deg, #C0203E 0%, rgba(192,32,62,0.85) 100%)', border: 'none' }}
          >
            <div className="flex flex-col items-center justify-center w-14 h-14 rounded-[1.2rem] border border-white/20" style={{ background: 'rgba(255,255,255,0.12)' }}>
              <span className="text-[9px] font-bold text-white/60 uppercase">Oct</span>
              <span className="text-xl font-bold text-white">24</span>
            </div>
            <div className="flex-1">
              <h4 className="text-base font-medium text-white">Dr. Aris (Dentist)</h4>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Clock size={11} className="text-white/50" />
                <span className="text-xs text-white/50 font-bold">10:00 AM</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-0.5">
              <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Pre-visit</span>
              <ChevronRight size={18} className="text-white/40" />
            </div>
          </motion.div>
        </div>

      </main>
    </div>
  );
}
