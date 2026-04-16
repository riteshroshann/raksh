import React, { useState } from 'react';
import { Search, Bell, Plus, ChevronRight, Clock, AlertCircle, TrendingUp, Activity, Calendar } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { useAppContext } from '../context/AppContext';
import { useVitals } from '../hooks/useVitals';
import { classifyBP, classifyFastingSugar, relativeDay } from '../lib/utils';
import type { VitalType } from '../lib/types';

type VitalTab = 'Diabetes' | 'Thyroid' | 'Kidney' | 'Heart';

const VITAL_TABS: { id: VitalTab; type: VitalType; color: string }[] = [
  { id: 'Diabetes', type: 'blood_sugar_fasting', color: '#C0203E' },
  { id: 'Thyroid',  type: 'weight',              color: '#7C3AED' },
  { id: 'Kidney',   type: 'weight',              color: '#0D9488' },
  { id: 'Heart',    type: 'blood_pressure',       color: '#EA580C' },
];

const DAILY_LOG_COLORS: Record<string, string> = {
  Diabetes: '#C0203E',
  Thyroid:  '#7C3AED',
  Kidney:   '#0D9488',
  Heart:    '#EA580C',
};

export default function Vitals() {
  const shouldReduce = useReducedMotion();
  const { user, familyMembers, activeMemberId, setActiveMemberId } = useAppContext();
  const [activeTab, setActiveTab] = useState<VitalTab>('Diabetes');
  const [showLogSheet, setShowLogSheet] = useState(false);

  const tab = VITAL_TABS.find(t => t.id === activeTab)!;
  const { logs, loading } = useVitals(user?.id, tab.type, activeMemberId, 30);

  const profile = user?.profile;
  const activeMember = familyMembers.find(m => m.id === activeMemberId);
  const displayName = activeMember?.name ?? profile?.full_name ?? 'there';
  const firstName = displayName.split(' ')[0];
  const initials = displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  const dailyLogSamples = [
    { label: 'Blood Sugar', value: '98', unit: 'mg/dL', delta: '↓ 3 mg/dL', up: false },
    { label: 'Blood Pressure', value: '120/80', unit: 'mmHg', delta: '↑ 2 mmHg', up: true },
    { label: 'Weight', value: '62.5', unit: 'kg', delta: '↓ 0.5 kg', up: false },
    { label: 'Heart Rate', value: '72', unit: 'bpm', delta: '↑ 1 bpm', up: true },
  ];

  const accentColor = DAILY_LOG_COLORS[activeTab];

  return (
    <div className="flex flex-col min-h-full bg-white">

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

        <div className="flex items-center justify-between mt-4 mb-6">
          <h1 className="text-2xl font-medium text-black tracking-tight">Vitals</h1>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between ml-1 mb-4">
            <span className="text-caption">Active Conditions</span>
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {VITAL_TABS.map(({ id, color }) => {
              const isActive = activeTab === id;
              return (
                <motion.button
                  key={id}
                  whileHover={shouldReduce ? {} : { y: -2 }}
                  whileTap={shouldReduce ? {} : { scale: 0.95 }}
                  onClick={() => setActiveTab(id)}
                  className="px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap border relative overflow-hidden"
                  style={isActive
                    ? { background: '#C0203E', color: 'white', borderColor: 'transparent', boxShadow: '0 8px 20px rgba(192,32,62,0.25)' }
                    : { background: 'rgba(0,0,0,0.04)', color: 'rgba(0,0,0,0.4)', borderColor: 'rgba(0,0,0,0.05)' }
                  }
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: isActive ? 'white' : color }} />
                    {id}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-5 px-1">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className="text-black/20" />
              <span className="text-xl font-medium text-black">Daily Logs</span>
            </div>
            <button className="text-sm font-bold flex items-center gap-1" style={{ color: '#C0203E' }}>
              View all <ChevronRight size={13} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {dailyLogSamples.map(log => (
              <motion.div
                key={log.label}
                whileHover={shouldReduce ? {} : { y: -2, boxShadow: '0 20px 40px rgba(0,0,0,0.06)' }}
                whileTap={shouldReduce ? {} : { scale: 0.985 }}
                className="glass-card p-4 flex flex-col gap-1 cursor-pointer border border-black/[0.05] hover:border-[#C0203E]/20 transition-colors"
              >
                <span className="text-caption">{log.label}</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-light text-black">{log.value}</span>
                  <span className="text-[10px] font-bold text-black/30">{log.unit}</span>
                </div>
                <div className="flex items-center gap-1 mt-3">
                  <span className={`text-[10px] font-bold ${log.up ? 'text-[#C0203E]' : 'text-green-500'}`}>
                    {log.delta} since yesterday
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.button
            whileHover={shouldReduce ? {} : { backgroundColor: 'rgba(0,0,0,0.02)' }}
            whileTap={shouldReduce ? {} : { scale: 0.98 }}
            onClick={() => setShowLogSheet(true)}
            className="w-full mt-4 py-5 border-2 border-dashed rounded-[2rem] flex items-center justify-center gap-3 transition-all"
            style={{ borderColor: 'rgba(0,0,0,0.08)', color: 'rgba(0,0,0,0.25)' }}
          >
            <Plus size={22} />
            <span className="text-base font-medium">Add new log</span>
          </motion.button>
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-2 mb-5 px-1">
            <Activity size={18} className="text-black/20" />
            <span className="text-xl font-medium text-black">Report Trends</span>
          </div>
          <div className="flex flex-col gap-3">
            {[
              { label: activeTab === 'Diabetes' ? 'HbA1c Trend — last 6 months' : 'Monthly Health Summary', sub: 'March 2026' },
              { label: activeTab === 'Diabetes' ? 'Fasting Sugar — last 12 readings' : 'Blood Report Analysis', sub: 'Feb 28, 2026' },
            ].map(trend => (
              <motion.div
                key={trend.label}
                whileHover={shouldReduce ? {} : { x: 4, backgroundColor: 'rgba(0,0,0,0.02)' }}
                whileTap={shouldReduce ? {} : { scale: 0.99 }}
                className="glass-card !rounded-3xl p-5 flex items-center justify-between cursor-pointer border border-black/[0.05] group"
              >
                <div className="flex flex-col gap-1">
                  <span className="text-base font-medium text-black">{trend.label}</span>
                  <span className="text-xs font-bold text-black/30">{trend.sub}</span>
                </div>
                <ChevronRight size={18} className="text-black/15 group-hover:text-[#C0203E] transition-colors" />
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center gap-2 mb-5 px-1">
            <Calendar size={18} className="text-[#C0203E]" />
            <span className="text-xl font-medium text-black">Upcoming Doctor Visit</span>
          </div>
          <motion.div
            whileHover={shouldReduce ? {} : { scale: 1.01, boxShadow: '0 20px 40px rgba(192,32,62,0.2)' }}
            whileTap={shouldReduce ? {} : { scale: 0.99 }}
            className="glass-card p-6 flex items-center gap-5 cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #C0203E 0%, rgba(192,32,62,0.85) 100%)', border: 'none' }}
          >
            <div className="flex flex-col items-center justify-center w-14 h-14 rounded-[1.2rem] border border-white/20" style={{ background: 'rgba(255,255,255,0.12)' }}>
              <span className="text-[9px] font-bold text-white/60 uppercase">Oct</span>
              <span className="text-xl font-bold text-white">24</span>
            </div>
            <div className="flex-1">
              <h4 className="text-base font-medium text-white">Dr. Aris (Dentist)</h4>
              <div className="flex items-center gap-2 mt-0.5">
                <Clock size={11} className="text-white/50" />
                <span className="text-xs text-white/50 font-bold">10:00 AM</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Pre-visit</span>
              <ChevronRight size={18} className="text-white/40" />
            </div>
          </motion.div>
        </div>

      </main>
    </div>
  );
}
