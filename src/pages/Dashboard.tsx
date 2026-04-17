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

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAppContext();

  const userId    = user?.id;
  const profile   = user?.profile;
  const firstName = profile?.full_name?.split(' ')[0] ?? 'there';

  const { logs: sugarLogs, loading: sugarLoading } = useVitals(userId, 'blood_sugar_fasting', null, 7);
  const { logs: bpLogs  } = useVitals(userId, 'blood_pressure', null, 1);
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

  return (
    <div style={{ minHeight: '100%' }}>

      {/* ── WARM HERO GRADIENT HEADER ── */}
      <div
        style={{
          background: 'linear-gradient(170deg, #FFF0F3 0%, #FFF5F7 28%, #F7F8FA 58%)',
          paddingTop: 28, paddingBottom: 32,
          paddingLeft: 20, paddingRight: 20,
        }}
        className="lg:px-8"
      >
        <div style={{ maxWidth: 640, margin: '0 auto' }}>

          {/* Small label */}
          <motion.p
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', color: 'rgba(192,32,62,0.6)', textTransform: 'uppercase', marginBottom: 6 }}
          >
            Daily report
          </motion.p>

          {/* Warm greeting */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
            style={{ fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: 700, color: '#111827', lineHeight: 1.15, letterSpacing: '-0.02em', marginBottom: 6 }}
          >
            {greeting}, {firstName}!{' '}
            <motion.span
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ delay: 0.8, duration: 0.6, repeat: Infinity, repeatDelay: 4 }}
              style={{ display: 'inline-block' }}
            >
              ✨
            </motion.span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
            style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 0 }}
          >
            {dateStr}
          </motion.p>
        </div>
      </div>

      {/* ── PAGE CONTENT ── */}
      <div className="px-5 lg:px-8 pb-24 lg:pb-12" style={{ maxWidth: 660, margin: '0 auto', paddingTop: 20 }}>

        {/* ── Hero vital card ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
          className="bg-white rounded-2xl p-5 mb-4"
          style={{ border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
        >
          <div className="flex items-center justify-between mb-1">
            <p style={{ fontSize: 12, fontWeight: 500, color: '#6B7280' }}>Fasting blood sugar</p>
            <button
              onClick={() => navigate('/vitals')}
              style={{ fontSize: 12, fontWeight: 600, color: '#C0203E', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
            >
              View all
            </button>
          </div>

          {sugarLoading ? (
            <div className="skeleton" style={{ height: 60, marginTop: 12, borderRadius: 12 }} />
          ) : latestSugar ? (
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
          ) : (
            <div style={{ marginTop: 12 }}>
              <p style={{ fontSize: 18, fontWeight: 300, color: '#D1D5DB' }}>No readings yet</p>
              <button
                onClick={() => navigate('/vitals')}
                style={{ marginTop: 10, fontSize: 13, fontWeight: 600, color: '#C0203E', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
              >
                Log your first reading →
              </button>
            </div>
          )}
        </motion.div>

        {/* ── Quick stats ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}
          className="grid grid-cols-2 gap-3 mb-5"
        >
          <div className="bg-white rounded-2xl p-4" style={{ border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
            <div className="flex items-center gap-1.5 mb-2">
              <HeartPulse size={13} style={{ color: '#C0203E' }} />
              <p style={{ fontSize: 12, fontWeight: 500, color: '#6B7280' }}>Blood pressure</p>
            </div>
            <p style={{ fontSize: 24, fontWeight: 300, color: '#111827', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
              {latestBP ? `${latestBP.value_1}/${latestBP.value_2}` : '--/--'}
            </p>
            <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>mmHg</p>
          </div>

          <div className="bg-white rounded-2xl p-4" style={{ border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
            <div className="flex items-center gap-1.5 mb-2">
              <Activity size={13} style={{ color: '#C0203E' }} />
              <p style={{ fontSize: 12, fontWeight: 500, color: '#6B7280' }}>Heart rate</p>
            </div>
            <p style={{ fontSize: 24, fontWeight: 300, color: '#111827', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
              {latestHR ? latestHR.value_1 : '--'}
            </p>
            <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>bpm</p>
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
                    <p style={{ fontSize: 10, color: '#9CA3AF', whiteSpace: 'nowrap', textTransform: 'capitalize' }}>{dose.slot}</p>
                  </div>
                  {dose.status === 'taken' && (
                    <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: '#DCFCE7' }}>
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
            <p style={{ fontSize: 12, fontWeight: 500, color: '#6B7280', marginBottom: 12 }}>Due now</p>
            <div className="space-y-3">
              {pending.map((dose, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#FFF0F2' }}>
                    <Pill size={13} style={{ color: '#C0203E' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p style={{ fontSize: 14, fontWeight: 500, color: '#111827' }} className="truncate">{dose.medicine.name}</p>
                    <p style={{ fontSize: 12, color: '#9CA3AF', textTransform: 'capitalize' }}>{dose.medicine.dosage} · {dose.slot}</p>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => navigate('/medicines')}
              className="mt-4 w-full text-center transition-colors"
              style={{ fontSize: 14, fontWeight: 500, color: '#C0203E', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
            >
              Manage all medicines
            </button>
          </motion.div>
        )}

        {/* ── Empty state (no data at all) ── */}
        {!sugarLoading && !latestSugar && todayDoses.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="text-center py-12 px-6"
          >
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: '#FFF0F2' }}>
              <Sparkles size={22} style={{ color: '#C0203E' }} />
            </div>
            <p style={{ fontSize: 16, fontWeight: 500, color: '#111827', marginBottom: 8 }}>Let's set things up</p>
            <p style={{ fontSize: 14, color: '#9CA3AF', lineHeight: 1.6, marginBottom: 24 }}>
              Start by logging a reading or adding your medicines.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => navigate('/vitals')}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
                style={{ background: '#C0203E', boxShadow: '0 4px 14px rgba(192,32,62,0.3)' }}
              >
                Log a reading
              </button>
              <button
                onClick={() => navigate('/medicines')}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{ background: '#FFF0F2', color: '#C0203E', border: '1px solid rgba(192,32,62,0.15)' }}
              >
                Add medicine
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
