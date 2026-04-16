import React, { useState } from 'react';
import { Search, Bell, Plus, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { useAppContext } from '../context/AppContext';
import { useMedicines } from '../hooks/useMedicines';
import { Toast, useToast } from '../components/Toast';
import type { DoseTimeSlot } from '../lib/types';

export default function Medicines() {
  const { user, familyMembers, activeMemberId, setActiveMemberId } = useAppContext();
  const toast = useToast();
  const { medicines, todayDoses, markDose } = useMedicines(user?.id, activeMemberId);

  const profile = user?.profile;
  const activeMember = familyMembers.find(m => m.id === activeMemberId);
  const activeLabel = activeMember?.name ?? profile?.full_name ?? 'there';
  const firstName = activeLabel.split(' ')[0];
  const initials = activeLabel.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  const takenCount = todayDoses.filter(d => d.status === 'taken').length;
  const totalCount = todayDoses.length;
  const dosesToTake = todayDoses.filter(d => d.status !== 'taken');
  const dosesTaken = todayDoses.filter(d => d.status === 'taken');

  // Hardcoded calendar wrapper for visual match
  const days = [
    { label: 'S', date: 18, active: false },
    { label: 'M', date: 19, active: false },
    { label: 'T', date: 20, active: true },
    { label: 'W', date: 21, active: false },
    { label: 'T', date: 22, active: false },
  ];

  const lowStock = medicines.filter(
    m => m.quantity_remaining !== null && m.quantity_remaining <= 7
  );

  async function handleTake(medicineId: string, slot: DoseTimeSlot) {
    const { error } = await markDose(medicineId, slot, true);
    if (error) toast.show(error, 'error');
    else toast.show('Marked as taken', 'success');
  }

  return (
    <div className="px-5 pt-8 pb-32 bg-[#FAFBFC] min-h-full">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveMemberId(null)}
            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-white shadow-sm transition-transform active:scale-95"
            style={{ background: 'var(--primary)' }}
          >
            {initials}
          </button>
          <span className="text-sm font-medium text-[var(--text-primary)]">
            Hi, {firstName} ✨
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button aria-label="Search" className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-black/5 transition-colors">
            <Search size={18} className="text-[var(--text-secondary)]" />
          </button>
          <button aria-label="Notifications" className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-black/5 transition-colors">
            <Bell size={18} className="text-[var(--text-secondary)]" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[28px] font-semibold text-[var(--text-primary)]">Medicines</h1>
        <button className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1">
          March <ChevronRight size={14} />
        </button>
      </div>

      {/* ── Calendar Strip ───────────────────────────────────────────── */}
      <div className="flex justify-between items-center gap-2 mb-8">
        {days.map((d, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <span className="text-[10px] font-medium text-[var(--text-muted)]">{d.label}</span>
            <div
              className="w-[42px] h-[42px] rounded-full flex items-center justify-center text-sm font-semibold shadow-sm border border-black/5"
              style={{
                background: d.active ? 'var(--primary)' : 'white',
                color: d.active ? 'white' : 'var(--text-primary)',
              }}
            >
              {d.date}
            </div>
          </div>
        ))}
      </div>

      {/* ── Today's Progress ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-[var(--text-primary)]">Today's Progress</h2>
        <span className="text-[11px] font-bold text-[var(--primary)] uppercase tracking-wider">
          {takenCount}/{totalCount} Taken
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-[var(--border)] overflow-hidden mb-8">
        <motion.div
          className="h-full bg-[var(--primary)]"
          initial={{ width: 0 }}
          animate={{ width: `${totalCount ? (takenCount / totalCount) * 100 : 0}%` }}
        />
      </div>

      {/* ── To Take ───────────────────────────────────────────────────── */}
      <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4">To take</h2>
      <div className="flex flex-col gap-3 mb-8">
        {dosesToTake.length === 0 ? (
          <div className="card p-5 text-center text-sm text-[var(--text-secondary)] shadow-sm border border-black/5">
            All caught up for today!
          </div>
        ) : (
          dosesToTake.map(dose => (
            <div key={`${dose.medicine.id}-${dose.slot}`} className="card p-4 flex items-center justify-between shadow-sm border border-black/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--primary-light)] flex items-center justify-center">
                  <span className="text-lg">💊</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">{dose.medicine.name}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5 capitalize">
                    {dose.medicine.dosage} · {dose.slot}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleTake(dose.medicine.id, dose.slot)}
                className="px-4 py-2 rounded-full text-xs font-semibold text-[var(--primary)] border border-[var(--primary)] bg-white active:scale-95 transition-transform uppercase tracking-wider"
              >
                Take
              </button>
            </div>
          ))
        )}
      </div>

      {/* ── Refill Reminders ──────────────────────────────────────────── */}
      {lowStock.length > 0 && (
        <>
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4">Refill Reminders</h2>
          <div className="flex flex-col gap-3 mb-8">
            {lowStock.map(med => (
              <div key={med.id} className="card p-4 flex items-center justify-between shadow-sm border border-black/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--danger-light)] flex items-center justify-center">
                    <span className="text-lg">💊</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">{med.name}</p>
                    <p className="text-xs text-[var(--danger)] font-medium mt-0.5">
                      {med.quantity_remaining} pills remaining
                    </p>
                  </div>
                </div>
                <button className="px-4 py-2 rounded-full text-xs font-semibold text-white bg-[var(--primary)] active:scale-95 transition-transform uppercase tracking-wider shadow-sm">
                  Add
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Upcoming Doctor Visit ──────────────────────────────────────── */}
      <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4">Upcoming Doctor Visit</h2>
      <div className="rounded-[20px] p-5 text-white flex items-center gap-4 shadow-md bg-[var(--primary)] mb-6">
        <div className="flex flex-col items-center justify-center bg-white/20 rounded-xl w-14 h-14 shrink-0">
          <span className="text-[10px] font-medium uppercase tracking-wider text-white/90">Oct</span>
          <span className="text-xl font-semibold leading-none mt-0.5">24</span>
        </div>
        <div className="flex-1">
          <h3 className="text-base font-semibold">Dr. Anil</h3>
          <p className="text-xs text-white/80 mt-0.5">Dentist</p>
          <div className="flex items-center gap-1 mt-2">
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20">10:00 AM</span>
          </div>
        </div>
        <ChevronRight size={20} className="text-white/70" />
      </div>

    </div>
  );
}
