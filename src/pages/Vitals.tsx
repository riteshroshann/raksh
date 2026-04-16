import React, { useState } from 'react';
import { Search, Bell, Plus, ChevronRight, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../context/AppContext';
import { useVitals } from '../hooks/useVitals';
import { BottomSheet } from '../components/BottomSheet';
import { StatusBadge } from '../components/StatusBadge';
import { Toast, useToast } from '../components/Toast';
import type { VitalLog, VitalType, VitalStatus } from '../lib/types';
import {
  classifyBP, classifyFastingSugar, relativeDay, VITAL_META,
} from '../lib/utils';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer, Dot,
} from 'recharts';

type SubTab = 'glucose' | 'thyroid' | 'kidney' | 'heart';

const SUBTABS: { key: SubTab; label: string; type: VitalType }[] = [
  { key: 'glucose', label: 'Glucose', type: 'blood_sugar_fasting' },
  { key: 'thyroid', label: 'Thyroid', type: 'weight' }, // Using weight as placeholder
  { key: 'kidney',  label: 'Kidney',  type: 'weight' }, // Using weight as placeholder
  { key: 'heart',   label: 'Heart',   type: 'blood_pressure' },
];

export default function Vitals() {
  const { user, familyMembers, activeMemberId, setActiveMemberId } = useAppContext();
  const [activeTab, setActiveTab] = useState<SubTab>('glucose');
  const [showLogSheet, setShowLogSheet] = useState(false);
  const toast = useToast();

  const currentSub = SUBTABS.find(s => s.key === activeTab)!;
  const { logs, loading } = useVitals(user?.id, currentSub.type, activeMemberId, 30);

  const profile = user?.profile;
  const activeMember = familyMembers.find(m => m.id === activeMemberId);
  const activeLabel = activeMember?.name ?? profile?.full_name ?? 'there';
  const firstName = activeLabel.split(' ')[0];
  const initials = activeLabel.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  // Chart data
  const chartData = [...logs].slice(0, 7).reverse().map(l => {
    const date = new Date(l.logged_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    let status: VitalStatus = 'normal';
    let value = l.value_1;
    if (currentSub.type === 'blood_pressure') {
      status = classifyBP(l.value_1, l.value_2!);
    } else if (currentSub.type === 'blood_sugar_fasting') {
      status = classifyFastingSugar(l.value_1);
    }
    return { date, value, status };
  });

  return (
    <div className="px-5 pt-8 pb-32 bg-[#FAFBFC] min-h-full relative">
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
          <button aria-label="Notifications" className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-black/5 transition-colors relative">
            <Bell size={18} className="text-[var(--text-secondary)]" />
          </button>
        </div>
      </div>

      <h1 className="text-[28px] font-semibold text-[var(--text-primary)] mb-6">Vitals</h1>

      {/* ── Filter Pills ─────────────────────────────────────────────── */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 mb-8">
        {SUBTABS.map(({ key, label }) => {
          const isActive = activeTab === key;
          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className="px-5 py-2.5 rounded-full text-[13px] border transition-all whitespace-nowrap"
              style={{
                background: isActive ? 'var(--primary)' : 'white',
                borderColor: isActive ? 'var(--primary)' : 'var(--border-medium)',
                color: isActive ? 'white' : 'var(--text-secondary)',
                fontWeight: isActive ? 600 : 500,
                boxShadow: isActive ? '0 4px 12px rgba(185, 28, 28, 0.2)' : 'none',
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* ── Daily Logs ────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-[var(--text-primary)]">Daily Logs</h2>
        <button className="text-[11px] font-semibold text-[var(--primary)] uppercase tracking-wider">View all →</button>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-8">
        {loading ? (
          <>
            <div className="card p-4 h-24 skeleton" />
            <div className="card p-4 h-24 skeleton" />
          </>
        ) : logs.length === 0 ? (
          <div className="col-span-2 card p-6 flex flex-col items-center justify-center text-center gap-2">
            <p className="text-sm text-[var(--text-secondary)]">No logs found</p>
          </div>
        ) : (
          logs.slice(0, 4).map((log, i) => (
            <div key={log.id} className="card p-4 shadow-sm border border-black/5 flex flex-col justify-center">
              <p className="text-[22px] font-semibold text-[var(--text-primary)] leading-none text-center">
                {currentSub.type === 'blood_pressure' ? `${log.value_1}/${log.value_2}` : log.value_1}
                <span className="text-[10px] font-medium text-[var(--text-muted)] ml-1">{log.unit}</span>
              </p>
              <div className="flex items-center justify-center gap-1 mt-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)]" />
                <span className="text-[10px] font-medium text-[var(--text-secondary)]">
                  {relativeDay(log.logged_at)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── Report Trends ──────────────────────────────────────────────── */}
      <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4">Report Trends</h2>
      
      <div className="flex flex-col gap-3 mb-8">
        <button className="card p-4 shadow-sm border border-black/5 flex items-center justify-between active:scale-95 transition-transform">
          <div className="text-left">
            <p className="text-sm font-semibold text-[var(--text-primary)] mb-0.5">HbA1c Trend</p>
            <p className="text-[11px] text-[var(--text-muted)]">last 6 months</p>
          </div>
          <ChevronRight size={16} className="text-[var(--text-muted)]" />
        </button>
        <button className="card p-4 shadow-sm border border-black/5 flex items-center justify-between active:scale-95 transition-transform">
          <div className="text-left">
            <p className="text-sm font-semibold text-[var(--text-primary)] mb-0.5">Fasting Sugar</p>
            <p className="text-[11px] text-[var(--text-muted)]">last 10 readings</p>
          </div>
          <ChevronRight size={16} className="text-[var(--text-muted)]" />
        </button>
      </div>

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

      {/* ── FAB ─────────────────────────────────────────────────────── */}
      <div className="fixed bottom-24 left-0 right-0 flex justify-center z-20 pointer-events-none">
        <button
          onClick={() => setShowLogSheet(true)}
          className="pointer-events-auto h-14 px-6 rounded-full shadow-lg flex items-center gap-2 transition-transform active:scale-95 border-4 border-white"
          style={{ background: 'var(--primary)' }}
        >
          <Plus size={20} className="text-white" />
          <span className="text-sm font-semibold text-white">Add new log</span>
        </button>
      </div>

      <Toast {...toast} onClose={toast.hide} />
    </div>
  );
}
