import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Plus, Calendar, Activity } from 'lucide-react';
import { motion } from 'motion/react';
import { useAppContext } from '../context/AppContext';
import { useVitals } from '../hooks/useVitals';
import { useMedicines } from '../hooks/useMedicines';
import type { Condition } from '../lib/types';
import { ConditionChip } from '../components/ConditionChip';
import { StatusBadge } from '../components/StatusBadge';
import { supabase } from '../lib/supabase';
import {
  classifyBP, classifyFastingSugar, formatDate, relativeDay,
  VITAL_META,
} from '../lib/utils';

const CONDITION_FILTER_OPTIONS: (Condition | 'All')[] = [
  'All', 'Diabetes', 'Thyroid', 'Heart', 'Kidney', 'Hypertension',
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, familyMembers, activeMemberId, setActiveMemberId } = useAppContext();
  const [conditionFilter, setConditionFilter] = useState<Condition | 'All'>('Diabetes');

  const userId = user?.id;
  const profile = user?.profile;

  // Latest fasting sugar
  const { logs: sugarLogs, loading: sugarLoading } = useVitals(userId, 'blood_sugar_fasting', activeMemberId, 1);
  // Today medicines (for overdue count)
  const { todayDoses, loading: medLoading } = useMedicines(userId, activeMemberId);

  const latestSugar = sugarLogs[0];
  const sugarStatus = latestSugar ? classifyFastingSugar(latestSugar.value_1) : null;

  const overdueDoses = todayDoses.filter(d => d.status === 'missed').length;

  const activeMember = familyMembers.find(m => m.id === activeMemberId);
  const activeLabel = activeMember?.name ?? profile?.full_name ?? 'there';
  const firstName = activeLabel.split(' ')[0];
  const initials = activeLabel.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="px-5 pt-8 pb-6 bg-[#FAFBFC] min-h-full">

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
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
          <button
            aria-label="Search"
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-black/5 transition-colors"
          >
            <Search size={18} className="text-[var(--text-secondary)]" />
          </button>
          <button
            aria-label="Notifications"
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-black/5 transition-colors relative"
          >
            <Bell size={18} className="text-[var(--text-secondary)]" />
            {overdueDoses > 0 && (
              <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-[var(--primary)] border-2 border-[#FAFBFC]" />
            )}
          </button>
        </div>
      </div>

      {/* ── Greeting ─────────────────────────────────────────────────── */}
      <h1 className="text-[32px] leading-[1.2] font-normal text-[var(--text-primary)] mb-8" style={{ fontFamily: 'var(--font-display)' }}>
        <span className="text-[var(--text-secondary)]">Rise and shine,</span><br />
        {firstName}! How do<br />
        you feel today?
      </h1>

      {/* ── Condition filter chips ───────────────────────────────────── */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-[var(--text-primary)] mb-3">Your condition</p>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {CONDITION_FILTER_OPTIONS.map(c => {
            const isActive = conditionFilter === c;
            if (c === 'All') return null; // Design focuses on specific condition chips
            return (
              <button
                key={c}
                onClick={() => setConditionFilter(c)}
                className="px-4 py-2 rounded-full text-[13px] font-medium border whitespace-nowrap transition-all"
                style={{
                  background: isActive ? 'white' : 'transparent',
                  borderColor: isActive ? 'var(--border-medium)' : 'transparent',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.04)' : 'none',
                }}
              >
                {c}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Main Vital Card (Diabetic Control) ───────────────────────── */}
      <div className="card p-6 mb-6 shadow-sm border border-black/5">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-baseline gap-1">
            <span className="text-[44px] leading-none font-semibold text-[var(--text-primary)] tracking-tight">
              {latestSugar ? latestSugar.value_1 : '--'}
            </span>
            <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">mg/dL</span>
          </div>
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--danger-light)]">
            <Activity size={20} className="text-[var(--primary)]" />
          </div>
        </div>
        
        <h3 className="text-base font-semibold text-[var(--text-primary)] mb-2">Diabetic Control</h3>
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
          {latestSugar && sugarStatus === 'normal' 
            ? "Your fasting sugar is within the target range. Keep maintaining your diet and exercise routine."
            : latestSugar && sugarStatus !== 'normal'
            ? "Your fasting sugar is outside the ideal range. Please review your recent meals and medication."
            : "No recent fasting sugar readings found. Log your vitals to see insights here."}
        </p>
      </div>

      {/* ── Action Buttons ────────────────────────────────────────────── */}
      <div className="flex gap-3 mb-8">
        <button className="flex-1 card py-4 px-3 flex flex-col items-center justify-center gap-3 border border-black/5 active:scale-95 transition-transform text-center">
          <div className="text-[var(--primary)] pt-1">
            <Plus size={24} />
          </div>
          <span className="text-xs font-semibold text-[var(--text-primary)]">Add your<br />symptoms</span>
        </button>
        <button className="flex-1 card py-4 px-3 flex flex-col items-center justify-center gap-3 border border-black/5 active:scale-95 transition-transform text-center">
          <div className="text-[var(--text-secondary)] pt-1">
            <Calendar size={24} />
          </div>
          <span className="text-xs font-semibold text-[var(--text-primary)]">Make an<br />Appointment</span>
        </button>
      </div>

    </div>
  );
}
