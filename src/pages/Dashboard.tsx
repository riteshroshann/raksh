import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, TrendingUp, TrendingDown, Minus, HeartPulse, Pill, Activity, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { useAppContext } from '../context/AppContext';
import { useVitals } from '../hooks/useVitals';
import { useMedicines } from '../hooks/useMedicines';

const STATUS: Record<string, { label: string; color: string; bg: string; darkBg: string }> = {
  normal:   { label: 'Normal',       color: '#15803D', bg: '#DCFCE7', darkBg: 'rgba(21,128,61,0.2)' },
  elevated: { label: 'Elevated',     color: '#D97706', bg: '#FEF3C7', darkBg: 'rgba(217,119,6,0.2)' },
  high:     { label: 'Above range',  color: '#C0203E', bg: '#FFF0F2', darkBg: 'rgba(192,32,62,0.2)' },
  low:      { label: 'Below range',  color: '#92400E', bg: '#FFF7ED', darkBg: 'rgba(146,64,14,0.2)' },
};

function classifyBG(v: number) {
  if (v < 70)   return 'low';
  if (v <= 100) return 'normal';
  if (v <= 125) return 'elevated';
  return 'high';
}

function trendDir(logs: { value_1: number }[]) {
  if (logs.length < 2) return 'flat';
  const diff = logs[0].value_1 - logs[1].value_1;
  if (diff > 2)  return 'up';
  if (diff < -2) return 'down';
  return 'flat';
}

const GhostSparkline = ({ isDark }: { isDark: boolean }) => (
  <div style={{ position: 'relative', width: '100%', height: 110, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 16, overflow: 'hidden' }}>
    <svg viewBox="0 0 100 80" width="100%" height="80" preserveAspectRatio="none"
      style={{ position: 'absolute', inset: '0 0 0 0', filter: 'blur(0.8px)', opacity: isDark ? 0.25 : 0.3 }}>
      <defs>
        <linearGradient id="ghostGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#B91C1C" stopOpacity="0" />
          <stop offset="30%"  stopColor="#B91C1C" stopOpacity="0.7" />
          <stop offset="70%"  stopColor="#B91C1C" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#B91C1C" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M 0 50 C 15 42, 25 58, 40 50 C 55 42, 65 58, 80 50 C 90 46, 95 48, 100 50"
        fill="none" stroke="url(#ghostGrad)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
    </svg>
    <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '0 16px' }}>
      <p style={{ fontSize: 13, fontWeight: 600, color: isDark ? '#E5E7EB' : '#111827', marginBottom: 4 }}>Start tracking blood sugar</p>
      <p style={{ fontSize: 11, color: isDark ? 'rgba(255,255,255,0.45)' : '#9CA3AF', lineHeight: 1.5, marginBottom: 12 }}>
        Log your first reading to see your trend
      </p>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 16px', borderRadius: 999, background: '#C0203E', color: 'white', fontSize: 12, fontWeight: 600, boxShadow: '0 4px 12px rgba(192,32,62,0.4)' }}>
        + Log First Reading
      </div>
    </div>
  </div>
);

const RealSparkline = ({ points, isDark }: { points: number[]; isDark: boolean }) => {
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
    <div style={{ width: '100%', height: 60, paddingBottom: 8, opacity: 0.7 }}>
      <svg viewBox={`0 0 100 ${h}`} width="100%" height="100%" preserveAspectRatio="none">
        <path d={pathData} fill="none" stroke={isDark ? '#E8657A' : '#B91C1C'} strokeWidth="2" vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  );
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, isDarkMode: isDark } = useAppContext();

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
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const dateStr  = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

  const points       = sugarLogs.slice(0, 10).reverse().map(l => l.value_1);
  const isState0     = sugarLogs.length === 0;
  const isState1     = sugarLogs.length > 0 && sugarLogs.length < 7;

  let showMonthlyProgress = false;
  let monthlyProgressText = '';
  if (sugarLogs.length >= 7) {
    const dates = sugarLogs.map(l => new Date(l.logged_at).getTime());
    const spread = (Math.max(...dates) - Math.min(...dates)) / 86400000;
    if (spread >= 14) {
      showMonthlyProgress = true;
      const avg = Math.round(sugarLogs.reduce((a, l) => a + l.value_1, 0) / sugarLogs.length);
      monthlyProgressText = `Average fasting sugar · 30 days: ${avg} mg/dL`;
    }
  } else if (bpLogs.length >= 14) {
    showMonthlyProgress = true;
    monthlyProgressText = `${bpLogs.length} BP readings logged this month`;
  }

  // Theme-aware card styles
  const cardStyle = {
    background: isDark ? 'rgba(22,22,30,0.72)' : 'rgba(255,255,255,0.85)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'}`,
    boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 2px 16px rgba(0,0,0,0.05)',
    borderRadius: 20,
  };
  const textPri  = isDark ? '#F3F4F6'                : '#111827';
  const textSec  = isDark ? 'rgba(255,255,255,0.45)' : '#6B7280';
  const textMut  = isDark ? 'rgba(255,255,255,0.3)'  : '#9CA3AF';

  return (
    <div style={{ minHeight: '100%', background: isDark ? '#0C0C10' : '#F5F4F7' }}>

      {/* ── HEADER ── */}
      <div style={{ padding: '32px 20px 0', maxWidth: 680, margin: '0 auto' }} className="lg:px-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <h1 style={{ fontSize: 'clamp(22px, 4vw, 30px)', fontWeight: 700, color: textPri, letterSpacing: '-0.025em', lineHeight: 1.2, marginBottom: 4 }}>
            {greeting}, {firstName}.
          </h1>
          <p style={{ fontSize: 13, color: textSec }}>{dateStr}</p>
        </motion.div>
      </div>

      {/* ── CARDS ── */}
      <div style={{ padding: '24px 20px 100px', maxWidth: 680, margin: '0 auto' }} className="lg:px-8 lg:pb-16">

        {/* Fasting Sugar Hero */}
        <motion.div
          onClick={() => { if (isState0) navigate('/vitals'); }}
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
          style={{ ...cardStyle, padding: 20, marginBottom: 14, cursor: isState0 ? 'pointer' : 'default' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <p style={{ fontSize: 12, fontWeight: 500, color: textSec, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Fasting blood sugar</p>
            {!isState0 && (
              <button onClick={e => { e.stopPropagation(); navigate('/vitals'); }}
                style={{ fontSize: 12, fontWeight: 600, color: '#C0203E', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
                View all
              </button>
            )}
          </div>
          {sugarLoading ? (
            <div style={{ height: 60, marginTop: 12, borderRadius: 12, background: isDark ? 'rgba(255,255,255,0.05)' : '#F3F4F6', animation: 'skeleton-shimmer 1.5s ease-in-out infinite' }} />
          ) : isState0 ? (
            <GhostSparkline isDark={isDark} />
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, marginTop: 12 }}>
                <span style={{ fontSize: 56, fontWeight: 200, color: textPri, letterSpacing: '-0.04em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
                  {latestSugar.value_1}
                </span>
                <div style={{ marginBottom: 6 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: textMut, textTransform: 'uppercase', letterSpacing: '0.08em' }}>mg/dL</p>
                  <p style={{ fontSize: 10, color: textMut }}>
                    {new Date(latestSugar.logged_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </p>
                </div>
                {statusInfo && (
                  <span style={{ marginBottom: 6, fontSize: 12, fontWeight: 600, borderRadius: 8, padding: '4px 12px', background: isDark ? statusInfo.darkBg : statusInfo.bg, color: statusInfo.color }}>
                    {statusInfo.label}
                  </span>
                )}
                <div style={{ marginLeft: 'auto', marginBottom: 6 }}>
                  {trend === 'up'   && <TrendingUp  size={18} style={{ color: '#C0203E' }} />}
                  {trend === 'down' && <TrendingDown size={18} style={{ color: '#15803D' }} />}
                  {trend === 'flat' && <Minus        size={18} style={{ color: textMut }} />}
                </div>
              </div>
              {points.length > 1 && <RealSparkline points={points} isDark={isDark} />}
              {isState1 && <p style={{ textAlign: 'center', marginTop: 8, fontSize: 11, color: textMut }}>Log more readings to see your trend</p>}
            </>
          )}
        </motion.div>

        {/* Monthly Progress */}
        {showMonthlyProgress && !sugarLoading && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            style={{ ...cardStyle, padding: '16px 20px', marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: textPri, marginBottom: 3 }}>Monthly Progress</p>
              <p style={{ fontSize: 12, color: textSec }}>{monthlyProgressText}</p>
            </div>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: isDark ? 'rgba(192,32,62,0.15)' : '#FFF0F2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <TrendingUp size={18} style={{ color: '#B91C1C' }} />
            </div>
          </motion.div>
        )}

        {/* BP & HR grid */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}
        >
          {/* BP */}
          <div onClick={() => navigate('/vitals')} style={{ ...cardStyle, padding: 16, cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
            {!latestBP && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: isDark ? 'rgba(192,32,62,0.5)' : '#FECACA', borderRadius: '20px 0 0 20px' }} />}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <HeartPulse size={13} style={{ color: '#C0203E' }} />
              <p style={{ fontSize: 11, fontWeight: 500, color: textSec }}>Blood pressure</p>
            </div>
            {latestBP ? (
              <div>
                <p style={{ fontSize: 26, fontWeight: 300, color: textPri, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{latestBP.value_1}/{latestBP.value_2}</p>
                <p style={{ fontSize: 10, color: textMut, marginTop: 4 }}>mmHg</p>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: 13, fontWeight: 500, color: textMut }}>Not logged yet</p>
                <p style={{ fontSize: 11, color: textMut, marginTop: 3 }}>Tap to add</p>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#B91C1C', marginTop: 8 }}>+ Log</p>
              </div>
            )}
          </div>

          {/* HR */}
          <div onClick={() => navigate('/vitals')} style={{ ...cardStyle, padding: 16, cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
            {!latestHR && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: isDark ? 'rgba(192,32,62,0.5)' : '#FECACA', borderRadius: '20px 0 0 20px' }} />}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <Activity size={13} style={{ color: '#C0203E' }} />
              <p style={{ fontSize: 11, fontWeight: 500, color: textSec }}>Heart rate</p>
            </div>
            {latestHR ? (
              <div>
                <p style={{ fontSize: 26, fontWeight: 300, color: textPri, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{latestHR.value_1}</p>
                <p style={{ fontSize: 10, color: textMut, marginTop: 4 }}>bpm</p>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: 13, fontWeight: 500, color: textMut }}>Not logged yet</p>
                <p style={{ fontSize: 11, color: textMut, marginTop: 3 }}>Tap to add</p>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#B91C1C', marginTop: 8 }}>+ Log</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Today's Medicines */}
        {todayDoses.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }} style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <p style={{ fontSize: 12, fontWeight: 500, color: textSec, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Today's medicines</p>
              <button onClick={() => navigate('/medicines')} style={{ fontSize: 12, fontWeight: 600, color: '#C0203E', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>View all</button>
            </div>
            <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }} className="no-scrollbar">
              {todayDoses.map((dose, i) => (
                <div key={i} style={{ ...cardStyle, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 14 }}>
                  <Pill size={13} style={{ color: '#C0203E' }} />
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 500, color: textPri, whiteSpace: 'nowrap' }}>{dose.medicine.name}</p>
                    <p style={{ fontSize: 10, color: textMut, textTransform: 'capitalize' }}>{dose.slot}</p>
                  </div>
                  {dose.status === 'taken' && (
                    <div style={{ width: 18, height: 18, borderRadius: '50%', background: isDark ? 'rgba(21,128,61,0.3)' : '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: 10, color: '#15803D' }}>✓</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Pending doses */}
        {pending.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.34 }}
            style={{ ...cardStyle, padding: 20, marginBottom: 14 }}>
            <p style={{ fontSize: 12, fontWeight: 500, color: textSec, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>Due now</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {pending.map((dose, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 12, background: isDark ? 'rgba(192,32,62,0.15)' : '#FFF0F2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Pill size={14} style={{ color: '#C0203E' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 500, color: textPri, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{dose.medicine.name}</p>
                    <p style={{ fontSize: 12, color: textMut, textTransform: 'capitalize' }}>{dose.medicine.dosage} · {dose.slot}</p>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => navigate('/medicines')} style={{ marginTop: 16, width: '100%', textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#C0203E', background: 'none', border: 'none', cursor: 'pointer' }}>
              Manage all medicines
            </button>
          </motion.div>
        )}

        {/* Zero data state */}
        {!sugarLoading && !latestSugar && !latestBP && !latestHR && todayDoses.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.36 }}
            style={{ textAlign: 'center', padding: '48px 24px' }}>
            <div style={{ width: 56, height: 56, borderRadius: 18, background: isDark ? 'rgba(192,32,62,0.15)' : '#FFF0F2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Sparkles size={22} style={{ color: '#C0203E' }} />
            </div>
            <p style={{ fontSize: 17, fontWeight: 700, color: textPri, marginBottom: 8 }}>Ready to get started?</p>
            <p style={{ fontSize: 14, color: textSec, lineHeight: 1.6, marginBottom: 24, maxWidth: 240, margin: '0 auto 24px' }}>
              Your dashboard builds insights as you log health data.
            </p>
            <button onClick={() => navigate('/medicines')}
              style={{ padding: '12px 28px', borderRadius: 999, background: '#C0203E', color: 'white', fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer', boxShadow: '0 6px 20px rgba(192,32,62,0.35)' }}>
              + Add first medicine
            </button>
          </motion.div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => navigate('/vitals')} title="Log a reading"
        style={{
          position: 'fixed', bottom: 88, right: 20, width: 52, height: 52,
          borderRadius: '50%', background: 'linear-gradient(135deg, #C0203E, #8A101E)',
          color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: 'none', cursor: 'pointer', zIndex: 40,
          boxShadow: '0 8px 24px rgba(192,32,62,0.45)',
          transition: 'transform 0.18s ease',
        }}
        className="lg:bottom-8 lg:right-8"
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.08)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
      >
        <Plus size={22} />
      </button>
    </div>
  );
}
