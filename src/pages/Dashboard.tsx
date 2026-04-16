import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar, Activity, Sparkles, RefreshCw, HeartPulse, Pill, TrendingUp, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../context/AppContext';
import { useVitals } from '../hooks/useVitals';
import { useMedicines } from '../hooks/useMedicines';
import { generateHealthInsight } from '../lib/gemini';

function classifyBG(v: number): string {
  if (v < 70) return 'low';
  if (v <= 100) return 'normal';
  if (v <= 125) return 'elevated';
  return 'high';
}

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  normal:   { bg: '#F0FDF4', text: '#16A34A', label: 'Normal' },
  elevated: { bg: '#FFFBEB', text: '#D97706', label: 'Elevated' },
  high:     { bg: '#FEF2F2', text: '#DC2626', label: 'High' },
  low:      { bg: '#EFF6FF', text: '#2563EB', label: 'Low' },
};

function StatCard({ label, value, unit, icon: Icon, color }: { label: string; value: string; unit: string; icon: React.ElementType; color: string }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-black/[0.05] flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</span>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: color + '18' }}>
          <Icon size={15} style={{ color }} />
        </div>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-3xl font-light text-gray-900 tracking-tight">{value}</span>
        <span className="text-xs text-gray-400 font-medium">{unit}</span>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAppContext();

  const userId  = user?.id;
  const profile = user?.profile;
  const firstName = profile?.full_name?.split(' ')[0] ?? 'there';

  const { logs: sugarLogs, loading: sugarLoading } = useVitals(userId, 'blood_sugar_fasting', null, 7);
  const { logs: bpLogs } = useVitals(userId, 'blood_pressure', null, 1);
  const { logs: hrLogs } = useVitals(userId, 'heart_rate', null, 1);
  const { todayDoses, medicines } = useMedicines(userId, null);

  const latestSugar = sugarLogs[0];
  const latestBP    = bpLogs[0];
  const latestHR    = hrLogs[0];

  const sugarStatus = latestSugar ? classifyBG(latestSugar.value_1) : null;
  const statusStyle = sugarStatus ? STATUS_STYLES[sugarStatus] : null;

  const taken  = todayDoses.filter(d => d.status === 'taken').length;
  const total  = todayDoses.length;
  const pending = todayDoses.filter(d => d.status === 'pending');

  const [aiInsight, setAiInsight] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError,   setAiError]   = useState(false);

  const fetchInsight = useCallback(async () => {
    if (!latestSugar || !sugarStatus) return;
    setAiLoading(true);
    setAiError(false);
    try {
      const text = await generateHealthInsight({
        condition: profile?.conditions?.[0] ?? 'general health',
        vitalLabel: 'Fasting Blood Sugar',
        value: latestSugar.value_1,
        unit: 'mg/dL',
        status: sugarStatus,
      });
      setAiInsight(text);
    } catch {
      setAiError(true);
    } finally {
      setAiLoading(false);
    }
  }, [latestSugar, sugarStatus, profile]);

  useEffect(() => {
    if (latestSugar && !aiInsight && !aiLoading) fetchInsight();
  }, [latestSugar]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="p-5 lg:p-8 max-w-7xl mx-auto">

      <div className="mb-8">
        <p className="text-sm text-gray-400 font-medium">{greeting}</p>
        <h1 className="text-2xl lg:text-3xl font-semibold text-gray-900 mt-0.5">
          {firstName}, here's your health overview
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6">

        <div className="lg:col-span-2 space-y-5">

          <div className="bg-white rounded-3xl border border-black/[0.05] p-6 lg:p-7">
            <div className="flex items-start justify-between mb-5">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Fasting Blood Sugar</p>
                <div className="flex items-baseline gap-2 mt-2">
                  {sugarLoading ? (
                    <div className="h-10 w-28 bg-gray-100 rounded-xl animate-pulse" />
                  ) : latestSugar ? (
                    <>
                      <span className="text-5xl font-light text-gray-900 tracking-tight">{latestSugar.value_1}</span>
                      <span className="text-sm text-gray-400 font-medium">mg/dL</span>
                      {statusStyle && (
                        <span className="ml-2 text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: statusStyle.bg, color: statusStyle.text }}>
                          {statusStyle.label}
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-2xl text-gray-300 font-light">No readings yet</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => navigate('/vitals')}
                className="flex items-center gap-1.5 text-xs font-semibold text-[#C0203E] hover:underline"
              >
                View all <ChevronRight size={14} />
              </button>
            </div>

            <div className="border-t border-gray-50 pt-5">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={14} className="text-[#C0203E]" />
                <span className="text-xs font-bold text-[#C0203E] uppercase tracking-wider">Raksh AI Insight</span>
                {(aiInsight || aiLoading) && (
                  <button onClick={fetchInsight} className="ml-auto text-gray-300 hover:text-gray-500 transition-colors">
                    <RefreshCw size={12} />
                  </button>
                )}
              </div>
              <AnimatePresence mode="wait">
                {aiLoading ? (
                  <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-[#C0203E] border-t-transparent animate-spin" />
                    <span className="text-sm text-gray-400">Analyzing your readings…</span>
                  </motion.div>
                ) : aiInsight ? (
                  <motion.p key="insight" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-gray-600 leading-relaxed">
                    {aiInsight}
                  </motion.p>
                ) : aiError ? (
                  <motion.p key="error" className="text-sm text-gray-400 italic">AI insights unavailable right now.</motion.p>
                ) : (
                  <motion.p key="empty" className="text-sm text-gray-400">
                    {latestSugar ? 'Generating insight…' : 'Log your first vital reading to unlock AI-powered health insights.'}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard
              label="Blood Pressure"
              value={latestBP ? `${latestBP.value_1}/${latestBP.value_2}` : '--/--'}
              unit="mmHg"
              icon={HeartPulse}
              color="#C0203E"
            />
            <StatCard
              label="Heart Rate"
              value={latestHR ? String(latestHR.value_1) : '--'}
              unit="bpm"
              icon={Activity}
              color="#7C3AED"
            />
            <StatCard
              label="Medicines"
              value={`${taken}/${total}`}
              unit="taken today"
              icon={Pill}
              color="#0D9488"
            />
          </div>

          {sugarLogs.length > 1 && (
            <div className="bg-white rounded-3xl border border-black/[0.05] p-6">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Last 7 Readings</p>
              <div className="flex items-end gap-2 h-20">
                {sugarLogs.slice(0, 7).reverse().map((log, i) => {
                  const st = STATUS_STYLES[classifyBG(log.value_1)];
                  const max = Math.max(...sugarLogs.map(l => l.value_1));
                  const pct = Math.max(0.15, log.value_1 / max);
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-[9px] text-gray-400">{log.value_1}</span>
                      <div
                        className="w-full rounded-t-lg transition-all"
                        style={{ height: `${pct * 56}px`, background: st.text + '33', borderTop: `2px solid ${st.text}` }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-5">

          {pending.length > 0 && (
            <div className="bg-white rounded-3xl border border-black/[0.05] p-6">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Due Now</p>
              <div className="space-y-3">
                {pending.slice(0, 4).map((dose, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Pill size={14} className="text-amber-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{dose.medicine.name}</p>
                      <p className="text-xs text-gray-400">{dose.medicine.dosage} · {dose.slot}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => navigate('/medicines')}
                className="mt-4 w-full text-center text-xs font-semibold text-[#C0203E] hover:underline"
              >
                View all medicines →
              </button>
            </div>
          )}

          <div className="bg-white rounded-3xl border border-black/[0.05] p-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Quick Actions</p>
            <div className="space-y-2">
              <button
                onClick={() => navigate('/vitals')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-gray-50 hover:bg-[#C0203E]/5 hover:border-[#C0203E]/20 border border-transparent transition-all text-left"
              >
                <div className="w-8 h-8 bg-[#C0203E]/10 rounded-xl flex items-center justify-center">
                  <TrendingUp size={14} className="text-[#C0203E]" />
                </div>
                <span className="text-sm font-medium text-gray-700">Log a vital reading</span>
              </button>
              <button
                onClick={() => navigate('/medicines')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-gray-50 hover:bg-purple-50 border border-transparent hover:border-purple-100 transition-all text-left"
              >
                <div className="w-8 h-8 bg-purple-50 rounded-xl flex items-center justify-center">
                  <Pill size={14} className="text-purple-500" />
                </div>
                <span className="text-sm font-medium text-gray-700">Add a medicine</span>
              </button>
              <button
                onClick={() => navigate('/vault')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-gray-50 hover:bg-teal-50 border border-transparent hover:border-teal-100 transition-all text-left"
              >
                <div className="w-8 h-8 bg-teal-50 rounded-xl flex items-center justify-center">
                  <Calendar size={14} className="text-teal-500" />
                </div>
                <span className="text-sm font-medium text-gray-700">Upload a report</span>
              </button>
            </div>
          </div>

          {profile?.conditions && profile.conditions.length > 0 && (
            <div className="bg-white rounded-3xl border border-black/[0.05] p-6">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">My Conditions</p>
              <div className="flex flex-wrap gap-2">
                {profile.conditions.map(c => (
                  <span key={c} className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[#C0203E]/8 text-[#C0203E] border border-[#C0203E]/15">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
