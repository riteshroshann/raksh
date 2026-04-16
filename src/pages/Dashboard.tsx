import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Plus, Calendar, TrendingUp, Activity, Info, ChevronRight, Sparkles, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { useAppContext } from '../context/AppContext';
import { useVitals } from '../hooks/useVitals';
import { useMedicines } from '../hooks/useMedicines';
import type { Condition } from '../lib/types';
import { classifyFastingSugar, relativeDay } from '../lib/utils';
import { generateHealthInsight } from '../lib/gemini';

type HomeView = 'today' | 'months';

export default function Dashboard() {
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();
  const { user, familyMembers, activeMemberId, setActiveMemberId } = useAppContext();
  const [homeView, setHomeView] = useState<HomeView>('today');

  const userId = user?.id;
  const profile = user?.profile;
  const activeMember = familyMembers.find(m => m.id === activeMemberId);
  const displayName = activeMember?.name ?? profile?.full_name ?? 'there';
  const firstName = displayName.split(' ')[0];
  const initials = displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  const { logs: sugarLogs, loading: sugarLoading } = useVitals(userId, 'blood_sugar_fasting', activeMemberId, 1);
  const { todayDoses } = useMedicines(userId, activeMemberId);
  const overdue = todayDoses.filter(d => d.status === 'missed').length;

  const latestSugar = sugarLogs[0];
  const sugarStatus = latestSugar ? classifyFastingSugar(latestSugar.value_1) : null;

  // ── AI insight state ──────────────────────────────────────────────────────
  const [aiInsight, setAiInsight] = useState<string>('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(false);

  const fetchInsight = useCallback(async () => {
    if (!latestSugar || !sugarStatus) return;
    setAiLoading(true);
    setAiError(false);
    try {
      const insight = await generateHealthInsight({
        condition: profile?.conditions?.[0] ?? 'general health',
        vitalLabel: 'Fasting Blood Sugar',
        value: latestSugar.value_1,
        unit: 'mg/dL',
        status: sugarStatus,
      });
      setAiInsight(insight);
    } catch {
      setAiError(true);
      setAiInsight('');
    } finally {
      setAiLoading(false);
    }
  }, [latestSugar, sugarStatus, profile]);

  useEffect(() => {
    if (latestSugar && !aiInsight && !aiLoading) fetchInsight();
  }, [latestSugar]);

  return (
    <div className="flex flex-col min-h-full bg-white">

      {/* ── Header ──────────────────────────────────────────────── */}
      <header className="px-6 pt-10 pb-4 flex items-center justify-between bg-white sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveMemberId(null)}
            className="w-10 h-10 rounded-full border border-black/[0.05] shadow-sm hover:scale-105 active:scale-95 transition-all"
            style={{ background: '#C0203E' }}
          >
            <span className="flex items-center justify-center h-full text-white text-sm font-semibold">{initials}</span>
          </button>
          <div>
            <span className="text-lg font-light text-black">Hi, {firstName}</span>
            <span className="text-lg ml-1">✨</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-10 h-10 flex items-center justify-center rounded-full bg-black/[0.03] border border-black/[0.03] hover:bg-black/[0.06] transition-colors">
            <Search size={18} className="text-black/50" />
          </button>
          <div className="relative">
            <button className="w-10 h-10 flex items-center justify-center rounded-full bg-black/[0.03] border border-black/[0.03] hover:bg-black/[0.06] transition-colors">
              <Bell size={18} className="text-black/50" />
              {overdue > 0 && (
                <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#C0203E] border-2 border-white" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ── Main content ─────────────────────────────────────────── */}
      <main className="flex-1 px-6 pb-4">

        {/* Greeting */}
        <div className="mt-4 mb-6 maroon-glow relative">
          <span className="text-caption">Daily report</span>
          <h1 className="text-display text-4xl leading-tight mt-2">
            Rise and shine,<br />
            {firstName}! How do<br />
            you feel today?
          </h1>
        </div>

        {/* Condition + toggle row */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-1.5">
            <span className="text-base font-medium text-black">Your condition</span>
            <Info size={14} className="text-black/20" />
          </div>
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-black/[0.03] border border-black/[0.03]">
            {(['today', 'months'] as HomeView[]).map(v => (
              <button
                key={v}
                onClick={() => setHomeView(v)}
                className="px-3 py-1 rounded-xl text-xs font-bold transition-all capitalize"
                style={{
                  background: homeView === v ? 'white' : 'transparent',
                  color: homeView === v ? '#111827' : 'rgba(0,0,0,0.3)',
                  boxShadow: homeView === v ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* ── Main stats card ─────────────────────────────────────── */}
        <motion.div
          key={homeView}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          whileHover={shouldReduceMotion ? {} : { y: -2, boxShadow: '0 20px 40px rgba(0,0,0,0.07)' }}
          whileTap={shouldReduceMotion ? {} : { scale: 0.985 }}
          className="glass-card p-7 flex flex-col gap-5 cursor-pointer mb-5 border border-black/[0.05]"
          onClick={() => navigate('/vitals')}
        >
          <div className="flex items-baseline gap-2">
            {sugarLoading ? (
              <div className="skeleton h-16 w-32 rounded-2xl" />
            ) : (
              <>
                <span className="text-7xl font-light tracking-[-0.04em] leading-none text-black">
                  {latestSugar ? latestSugar.value_1 : '--'}
                </span>
                <span className="text-xs font-bold uppercase tracking-widest text-black/30">mg/dL</span>
              </>
            )}
          </div>

          <div className="h-px w-full bg-black/5" />

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-base font-medium text-black">Diabetes Control</span>
              <div className="w-9 h-9 bg-[#C0203E]/10 rounded-[1rem] flex items-center justify-center border border-[#C0203E]/20">
                <Activity size={16} className="text-[#C0203E]" />
              </div>
            </div>

            {/* ── AI insight area ─────────────────────────────────── */}
            <AnimatePresence mode="wait">
              {aiLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 mt-1"
                >
                  <div className="w-4 h-4 rounded-full border-2 border-[#C0203E] border-t-transparent animate-spin shrink-0" />
                  <span className="text-xs text-black/30 font-light">Raksh AI is thinking…</span>
                </motion.div>
              ) : aiInsight ? (
                <motion.div
                  key="insight"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-1"
                >
                  <div className="flex items-start gap-2">
                    <Sparkles size={13} className="text-[#C0203E] shrink-0 mt-0.5" />
                    <p className="text-sm text-black/50 leading-relaxed font-light">{aiInsight}</p>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); fetchInsight(); }}
                    className="flex items-center gap-1 mt-2 text-[10px] font-bold uppercase tracking-widest text-black/20 hover:text-[#C0203E] transition-colors"
                  >
                    <RefreshCw size={10} />
                    Refresh insight
                  </button>
                </motion.div>
              ) : aiError ? (
                <motion.p key="error" className="text-sm text-black/30 font-light mt-1 italic">
                  AI insights unavailable right now.
                </motion.p>
              ) : (
                <motion.p key="fallback" className="text-sm text-black/40 font-light leading-relaxed mt-1">
                  {latestSugar
                    ? 'Log your symptoms or medicines to unlock daily AI insights.'
                    : 'Log your first fasting sugar reading to see your Diabetes Control status.'}
                </motion.p>
              )}
            </AnimatePresence>

            {latestSugar && (
              <span className="text-[10px] font-bold text-black/20 uppercase tracking-wider mt-1">
                Last logged {relativeDay(latestSugar.logged_at)}
              </span>
            )}
          </div>
        </motion.div>

        {/* AI badge */}
        {(aiInsight || aiLoading) && (
          <div className="flex items-center gap-1.5 mb-5 px-1">
            <Sparkles size={11} className="text-[#C0203E]" />
            <span className="text-[10px] font-bold text-[#C0203E] uppercase tracking-widest">Powered by Raksh AI</span>
          </div>
        )}

        {/* ── Action cards ────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-4">
          <motion.button
            whileHover={shouldReduceMotion ? {} : { y: -2, boxShadow: '0 20px 40px rgba(0,0,0,0.06)' }}
            whileTap={shouldReduceMotion ? {} : { scale: 0.985 }}
            className="glass-card p-6 flex flex-col justify-between text-left border border-black/[0.05]"
            style={{ aspectRatio: '1' }}
            onClick={() => navigate('/vitals')}
          >
            <span className="text-base font-medium leading-snug text-black">Add your<br />symptoms</span>
            <div className="flex justify-end">
              <div className="w-11 h-11 bg-[#C0203E]/10 text-[#C0203E] rounded-2xl flex items-center justify-center border border-[#C0203E]/20 active:scale-90 transition-transform">
                <Plus size={22} />
              </div>
            </div>
          </motion.button>

          <motion.button
            whileHover={shouldReduceMotion ? {} : { y: -2, boxShadow: '0 20px 40px rgba(0,0,0,0.06)' }}
            whileTap={shouldReduceMotion ? {} : { scale: 0.985 }}
            className="glass-card p-6 flex flex-col justify-between text-left border border-black/[0.05]"
            style={{ aspectRatio: '1' }}
          >
            <span className="text-base font-medium leading-snug text-black">Make an<br />appointment</span>
            <div className="flex justify-end">
              <div className="w-11 h-11 bg-black/5 text-black/50 rounded-2xl flex items-center justify-center border border-black/10 active:scale-90 transition-transform">
                <Calendar size={20} />
              </div>
            </div>
          </motion.button>
        </div>

      </main>
    </div>
  );
}
