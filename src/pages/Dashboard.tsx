import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, TrendingUp, TrendingDown, Minus, HeartPulse, Pill, Activity, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { useAppContext } from '../context/AppContext';
import { useVitals } from '../hooks/useVitals';
import { useMedicines } from '../hooks/useMedicines';

const STATUS: Record<string, { label: string; color: string; bg: string }> = {
  normal:   { label: 'Normal',       color: '#15803D', bg: '#DCFCE7' },
  elevated: { label: 'Elevated',     color: '#D97706', bg: '#FEF3C7' },
  high:     { label: 'Above range',  color: '#C0203E', bg: '#FFF0F2' },
  low:      { label: 'Below range',  color: '#92400E', bg: '#FFF7ED' },
};

function classifyBG(v: number): string {
  if (v < 70)   return 'low';
  if (v <= 100) return 'normal';
  if (v <= 125) return 'elevated';
  return 'high';
}

function trendDir(logs: { value_1: number }[]): 'up' | 'down' | 'flat' {
  if (logs.length < 2) return 'flat';
  const diff = logs[0].value_1 - logs[1].value_1;
  if (diff > 2)  return 'up';
  if (diff < -2) return 'down';
  return 'flat';
}

const GhostSparkline = () => (
  <div className="relative w-full h-[120px] rounded-xl flex items-center justify-center mb-1 overflow-hidden" style={{ marginTop: 16 }}>
    <svg viewBox="0 0 100 80" width="100%" height="80px" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 pointer-events-none" style={{ filter: 'blur(0.8px)', opacity: 0.35 }}>
      <defs>
        <linearGradient id="ghostGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#B91C1C" stopOpacity="0" />
          <stop offset="30%" stopColor="#B91C1C" stopOpacity="0.6" />
          <stop offset="70%" stopColor="#B91C1C" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#B91C1C" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M 0 50 C 15 45, 25 55, 40 50 C 55 45, 65 55, 80 50 C 90 47, 95 48, 100 50"
        fill="none"
        stroke="url(#ghostGradient)"
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
    <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 w-full">
      <span className="text-xl mb-1">📈</span>
      <p style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>Start tracking Fasting blood sugar</p>
      <p style={{ fontSize: 11, color: '#6B7280', marginTop: 2, marginBottom: 12, maxWidth: 220, lineHeight: 1.4 }}>
        Log your first reading to see your trend over time.
      </p>
      <button 
        style={{ padding: '6px 16px', borderRadius: 999, background: '#B91C1C', color: 'white', fontSize: 12, fontWeight: 600, pointerEvents: 'none' }}
      >
        + Log First Reading
      </button>
    </div>
  </div>
);

const RealSparkline = ({ points }: { points: number[] }) => {
  if (points.length < 2) return null;
  const max = Math.max(...points, 130);
  const min = Math.min(...points, 70);
  const range = max - min || 1;
  const h = 50;
  
  const pathData = points.map((p, i) => {
    const x = (i / (points.length - 1)) * 100;
    const y = h - ((p - min) / range) * (h - 10) - 5;
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  return (
    <div className="w-full h-[60px] pb-2 relative opacity-70">
      <svg viewBox={`0 0 100 ${h}`} width="100%" height="100%" preserveAspectRatio="none" className="overflow-visible pointer-events-none">
        <path d={pathData} fill="none" stroke="#B91C1C" strokeWidth="2" vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  );
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAppContext();

  const userId    = user?.id;
  const profile   = user?.profile;
  const firstName = profile?.full_name?.split(' ')[0] ?? 'there';

  const { logs: sugarLogs, loading: sugarLoading } = useVitals(userId, 'blood_sugar_fasting', null, 30);
  const { logs: bpLogs  } = useVitals(userId, 'blood_pressure', null, 30);
  const { logs: hrLogs  } = useVitals(userId, 'heart_rate', null, 1);
  const { todayDoses }    = useMedicines(userId, null);

  const latestSugar = sugarLogs[0];
  const latestBP    = bpLogs[0];
  const latestHR    = hrLogs[0];

  const sugarStatus = latestSugar ? classifyBG(latestSugar.value_1) : null;
  const statusInfo  = sugarStatus ? STATUS[sugarStatus] : null;
  const trend       = trendDir(sugarLogs);
  const pending     = todayDoses.filter(d => d.status === 'pending').slice(0, 3);

  const hour     = new Date().getHours();
  const greeting = hour < 12 ? 'Rise and shine' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const dateStr  = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

  // Progressive Reveal logic for Sugar Card
  const points = sugarLogs.slice(0, 10).reverse().map(l => l.value_1);
  const isState0Sugar = sugarLogs.length === 0;
  const isState1Sugar = sugarLogs.length > 0 && sugarLogs.length < 7;
  
  // Monthly Progress logic
  let showMonthlyProgress = false;
  let monthlyProgressText = '';
  if (sugarLogs.length >= 7) {
    const dates = sugarLogs.map(l => new Date(l.logged_at).getTime());
    const minDay = Math.min(...dates);
    const maxDay = Math.max(...dates);
    const spreadDays = (maxDay - minDay) / (1000 * 3600 * 24);
    if (spreadDays >= 14) {
      showMonthlyProgress = true;
      const avg = Math.round(sugarLogs.reduce((acc, l) => acc + l.value_1, 0) / sugarLogs.length);
      monthlyProgressText = `Average fasting sugar · Last 30 days: ${avg} mg/dL`;
    }
  } else if (bpLogs.length >= 14) {
    // If not sugar, maybe BP has enough logs?
    showMonthlyProgress = true;
    monthlyProgressText = `${bpLogs.length} blood pressure readings logged this month`;
  }

  return (
    <div style={{ minHeight: '100%' }}>

      {/* ── MINIMALISTIC HEADER ── */}
      <div className="lg:px-8" style={{ paddingTop: 32, paddingBottom: 24, paddingLeft: 20, paddingRight: 20 }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <h1 style={{ fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: 700, color: '#111827', lineHeight: 1.15, letterSpacing: '-0.02em', marginBottom: 4 }}>
            {greeting}, {firstName}.
          </h1>
          <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 0 }}>
            {dateStr}
          </p>
        </div>
      </div>

      {/* ── PAGE CONTENT ── */}
      <div className="px-5 lg:px-8 pb-24 lg:pb-12" style={{ maxWidth: 660, margin: '0 auto', paddingTop: 20 }}>

        {/* ── Hero vital card (Fasting Blood Sugar) ── */}
        <motion.div
          onClick={() => { if(isState0Sugar) navigate('/vitals'); }}
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
          className={`bg-white rounded-2xl p-5 mb-4 ${isState0Sugar ? 'cursor-pointer hover:border-red-200 transition-colors' : ''}`}
          style={{ border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
        >
          <div className="flex items-center justify-between mb-1">
            <p style={{ fontSize: 12, fontWeight: 500, color: '#6B7280' }}>Fasting blood sugar</p>
            {!isState0Sugar && (
              <button
                onClick={(e) => { e.stopPropagation(); navigate('/vitals'); }}
                style={{ fontSize: 12, fontWeight: 600, color: '#C0203E', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
              >
                View all
              </button>
            )}
          </div>

          {sugarLoading ? (
            <div className="skeleton" style={{ height: 60, marginTop: 12, borderRadius: 12 }} />
          ) : isState0Sugar ? (
             <GhostSparkline />
          ) : (
             <>
                <div className="flex items-end gap-3 mt-3">
                  <span style={{ fontSize: 52, fontWeight: 300, color: '#111827', letterSpacing: '-0.03em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
                    {latestSugar.value_1}
                  </span>
                  <div style={{ marginBottom: 5 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.07em' }}>mg/dL</p>
                    <p style={{ fontSize: 11, color: '#9CA3AF' }}>
                      {new Date(latestSugar.logged_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                  {statusInfo && (
                    <span style={{ marginBottom: 5, fontSize: 12, fontWeight: 500, borderRadius: 6, padding: '3px 10px', background: statusInfo.bg, color: statusInfo.color }}>
                      {statusInfo.label}
                    </span>
                  )}
                  <div style={{ marginLeft: 'auto', marginBottom: 5 }}>
                    {trend === 'up'   && <TrendingUp  size={18} style={{ color: '#C0203E' }} />}
                    {trend === 'down' && <TrendingDown size={18} style={{ color: '#15803D' }} />}
                    {trend === 'flat' && <Minus        size={18} style={{ color: '#9CA3AF' }} />}
                  </div>
                </div>
                
                {points.length > 1 && <RealSparkline points={points} />}
                {isState1Sugar && (
                   <p className="text-center mt-3" style={{ fontSize: 12, color: '#9CA3AF' }}>Log more readings to see your trend</p>
                )}
             </>
          )}
        </motion.div>

        {/* ── Monthly Progress Card (Rule 4) ── */}
        {showMonthlyProgress && !sugarLoading && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }} animate={{ opacity: 1, height: 'auto', y: 0 }}
            className="bg-white rounded-2xl p-4 mb-4 flex items-center justify-between"
            style={{ border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
          >
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 2 }}>Monthly Progress</p>
              <p style={{ fontSize: 13, color: '#6B7280' }}>
                 {monthlyProgressText}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0">
               <TrendingUp size={18} style={{ color: '#B91C1C' }} />
            </div>
          </motion.div>
        )}

        {/* ── Quick stats (BP & Heart Rate) Rule 1 & 3 ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}
          className="grid grid-cols-2 gap-3 mb-5"
        >
          {/* BP Card */}
          <div 
             onClick={() => navigate('/vitals')}
             className="bg-white rounded-2xl p-4 cursor-pointer transition-colors group relative overflow-hidden" 
             style={{ border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}
          >
            {/* Rule 3 Subtle hovered crimson left border */}
            {!latestBP && <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-red-200 transition-all group-hover:bg-red-300" />}
            
            <div className="flex items-center gap-1.5 mb-2 ml-1">
              <HeartPulse size={13} style={{ color: '#C0203E' }} />
              <p style={{ fontSize: 12, fontWeight: 500, color: '#6B7280' }}>Blood pressure</p>
            </div>
            {latestBP ? (
              <div className="ml-1 mt-1">
                 <p style={{ fontSize: 24, fontWeight: 300, color: '#111827', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
                   {latestBP.value_1}/{latestBP.value_2}
                 </p>
                 <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>mmHg</p>
              </div>
            ) : (
              <div className="ml-1 mt-3">
                 <p style={{ fontSize: 14, fontWeight: 500, color: '#9CA3AF', lineHeight: 1.2 }}>Not logged yet</p>
                 <p style={{ fontSize: 12, color: '#B3B3B3', marginTop: 3 }}>Tap to log your first reading</p>
                 <p style={{ fontSize: 12, fontWeight: 600, color: '#B91C1C', marginTop: 8 }}>+ Log Reading</p>
              </div>
            )}
          </div>

          {/* Heart Rate Card */}
          <div 
             onClick={() => navigate('/vitals')}
             className="bg-white rounded-2xl p-4 cursor-pointer transition-colors group relative overflow-hidden" 
             style={{ border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}
          >
            {/* Rule 3 Subtle hovered crimson left border */}
            {!latestHR && <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-red-200 transition-all group-hover:bg-red-300" />}
            
            <div className="flex items-center gap-1.5 mb-2 ml-1">
              <Activity size={13} style={{ color: '#C0203E' }} />
              <p style={{ fontSize: 12, fontWeight: 500, color: '#6B7280' }}>Heart rate</p>
            </div>
            {latestHR ? (
               <div className="ml-1 mt-1">
                 <p style={{ fontSize: 24, fontWeight: 300, color: '#111827', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
                   {latestHR.value_1}
                 </p>
                 <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>bpm</p>
               </div>
            ) : (
               <div className="ml-1 mt-3">
                 <p style={{ fontSize: 14, fontWeight: 500, color: '#9CA3AF', lineHeight: 1.2 }}>Not logged yet</p>
                 <p style={{ fontSize: 12, color: '#B3B3B3', marginTop: 3 }}>Tap to log your first reading</p>
                 <p style={{ fontSize: 12, fontWeight: 600, color: '#B91C1C', marginTop: 8 }}>+ Log Reading</p>
               </div>
            )}
          </div>
        </motion.div>

        {/* ── Today's medicines strip ── */}
        {todayDoses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.34 }}
            className="mb-5"
          >
            <div className="flex items-center justify-between mb-2.5">
              <p style={{ fontSize: 12, fontWeight: 500, color: '#6B7280' }}>Today's medicines</p>
              <button
                onClick={() => navigate('/medicines')}
                style={{ fontSize: 12, fontWeight: 600, color: '#C0203E', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
              >
                View all
              </button>
            </div>
            <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
              {todayDoses.map((dose, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 flex items-center gap-2 rounded-xl px-3 py-2 bg-white"
                  style={{ border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
                >
                  <Pill size={12} style={{ color: '#C0203E' }} />
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 500, color: '#111827', whiteSpace: 'nowrap' }}>{dose.medicine.name}</p>
                    <p style={{ fontSize: 10, color: '#9CA3AF', whiteSpace: 'nowrap', textTransform: 'capitalize' }}>{dose.slot.replace(/_/g, ' ')}</p>
                  </div>
                  {dose.status === 'taken' && (
                    <div className="w-4 h-4 rounded-full flex items-center justify-center ml-1" style={{ background: '#DCFCE7' }}>
                      <span style={{ fontSize: 9, color: '#15803D' }}>✓</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Due now ── */}
        {pending.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 }}
            className="bg-white rounded-2xl p-5 mb-4"
            style={{ border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}
          >
            <p style={{ fontSize: 12, fontWeight: 500, color: '#6B7280', mb: 12 }}>Due now</p>
            <div className="space-y-3">
              {pending.map((dose, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#FFF0F2' }}>
                    <Pill size={13} style={{ color: '#C0203E' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p style={{ fontSize: 14, fontWeight: 500, color: '#111827' }} className="truncate">{dose.medicine.name}</p>
                    <p style={{ fontSize: 12, color: '#9CA3AF', textTransform: 'capitalize' }}>{dose.medicine.dosage} · {dose.slot.replace(/_/g, ' ')}</p>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => navigate('/medicines')}
              className="mt-4 w-full text-center transition-colors pb-1"
              style={{ fontSize: 14, fontWeight: 500, color: '#C0203E', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
            >
              Manage all medicines
            </button>
          </motion.div>
        )}

        {/* ── Let's set things up (Absolute Zero Data Overall) ── */}
        {!sugarLoading && !latestSugar && !latestBP && !latestHR && todayDoses.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="text-center py-12 px-6 mt-8"
          >
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: '#FFF0F2' }}>
              <Sparkles size={22} style={{ color: '#C0203E' }} />
            </div>
            <p style={{ fontSize: 16, fontWeight: 600, color: '#111827', marginBottom: 8 }}>Ready to get started?</p>
            <p style={{ fontSize: 14, color: '#9CA3AF', lineHeight: 1.6, marginBottom: 24, maxWidth: 240, marginInline: 'auto' }}>
              Your dashboard uses your logs to build personalized insights.
            </p>
            <div className="flex flex-col gap-3 justify-center items-center">
              <button
                onClick={() => navigate('/medicines')}
                className="w-full max-w-[200px] px-5 py-3 rounded-xl text-sm font-semibold text-white transition-all"
                style={{ background: '#B91C1C', boxShadow: '0 4px 14px rgba(185,28,28,0.25)' }}
              >
                + Add medicine
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* ── Maroon FAB ── */}
      <button
        onClick={() => navigate('/vitals')}
        title="Log a reading"
        className="fixed bottom-20 right-5 lg:bottom-8 lg:right-8 w-14 h-14 rounded-full text-white flex items-center justify-center transition-transform hover:scale-105 active:scale-95 z-40"
        style={{ background: '#C0203E', boxShadow: '0 6px 20px rgba(192,32,62,0.4)' }}
      >
        <Plus size={22} />
      </button>
    </div>
  );
}
