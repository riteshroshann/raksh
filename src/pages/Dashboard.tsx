import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, TrendingUp, TrendingDown, Minus, HeartPulse, Pill, Activity } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useVitals } from '../hooks/useVitals';
import { useMedicines } from '../hooks/useMedicines';

const STATUS: Record<string, { label: string; color: string; bg: string }> = {
  normal:   { label: 'Normal',       color: '#15803D', bg: '#DCFCE7' },
  elevated: { label: 'Elevated',     color: '#D97706', bg: '#FEF3C7' },
  high:     { label: 'Above range',  color: '#DC2626', bg: '#FEE2E2' },
  low:      { label: 'Below range',  color: '#2563EB', bg: '#DBEAFE' },
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
  const { logs: bpLogs }  = useVitals(userId, 'blood_pressure', null, 1);
  const { logs: hrLogs }  = useVitals(userId, 'heart_rate', null, 1);
  const { todayDoses }    = useMedicines(userId, null);

  const latestSugar  = sugarLogs[0];
  const latestBP     = bpLogs[0];
  const latestHR     = hrLogs[0];
  const sugarStatus  = latestSugar ? classifyBG(latestSugar.value_1) : null;
  const statusInfo   = sugarStatus ? STATUS[sugarStatus] : null;
  const trend        = trendDir(sugarLogs);
  const pending      = todayDoses.filter(d => d.status === 'pending').slice(0, 3);

  const hour      = new Date().getHours();
  const greeting  = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const dateStr   = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="p-5 lg:p-8 max-w-3xl mx-auto pb-24 lg:pb-12">

      <div className="mb-7">
        <p style={{ fontSize: 14, fontWeight: 500, color: '#6B7280' }}>{greeting}</p>
        <h1 style={{ fontSize: 22, fontWeight: 500, color: '#111827', marginTop: 4 }}>{firstName}</h1>
        <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>{dateStr}</p>
      </div>

      <div className="bg-white rounded-2xl border p-5 mb-4" style={{ borderColor: 'rgba(0,0,0,0.07)' }}>
        <div className="flex items-center justify-between mb-1">
          <p style={{ fontSize: 12, fontWeight: 500, color: '#6B7280' }}>Fasting blood sugar</p>
          <button
            onClick={() => navigate('/vitals')}
            style={{ fontSize: 12, fontWeight: 500, color: '#2563EB', background: 'none', border: 'none', padding: 0 }}
          >
            View all
          </button>
        </div>

        {sugarLoading ? (
          <div className="skeleton" style={{ height: 56, marginTop: 12, borderRadius: 12 }} />
        ) : latestSugar ? (
          <div className="flex items-end gap-3 mt-3">
            <span style={{ fontSize: 48, fontWeight: 300, color: '#111827', letterSpacing: '-0.02em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
              {latestSugar.value_1}
            </span>
            <div style={{ marginBottom: 4 }}>
              <p style={{ fontSize: 12, color: '#9CA3AF' }}>mg/dL</p>
              <p style={{ fontSize: 11, color: '#9CA3AF' }}>
                {new Date(latestSugar.logged_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </p>
            </div>
            {statusInfo && (
              <span style={{ marginBottom: 4, fontSize: 12, fontWeight: 500, borderRadius: 6, padding: '3px 10px', background: statusInfo.bg, color: statusInfo.color }}>
                {statusInfo.label}
              </span>
            )}
            <div style={{ marginLeft: 'auto', marginBottom: 4 }}>
              {trend === 'up'   && <TrendingUp  size={18} style={{ color: '#DC2626' }} />}
              {trend === 'down' && <TrendingDown size={18} style={{ color: '#15803D' }} />}
              {trend === 'flat' && <Minus        size={18} style={{ color: '#9CA3AF' }} />}
            </div>
          </div>
        ) : (
          <p style={{ marginTop: 12, fontSize: 18, fontWeight: 300, color: '#D1D5DB' }}>No readings yet</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-2xl border p-4" style={{ borderColor: 'rgba(0,0,0,0.07)' }}>
          <div className="flex items-center gap-1.5 mb-2">
            <HeartPulse size={13} style={{ color: '#C0203E' }} />
            <p style={{ fontSize: 12, fontWeight: 500, color: '#6B7280' }}>Blood pressure</p>
          </div>
          <p style={{ fontSize: 24, fontWeight: 300, color: '#111827', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
            {latestBP ? `${latestBP.value_1}/${latestBP.value_2}` : '--/--'}
          </p>
          <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>mmHg</p>
        </div>

        <div className="bg-white rounded-2xl border p-4" style={{ borderColor: 'rgba(0,0,0,0.07)' }}>
          <div className="flex items-center gap-1.5 mb-2">
            <Activity size={13} style={{ color: '#7C3AED' }} />
            <p style={{ fontSize: 12, fontWeight: 500, color: '#6B7280' }}>Heart rate</p>
          </div>
          <p style={{ fontSize: 24, fontWeight: 300, color: '#111827', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
            {latestHR ? latestHR.value_1 : '--'}
          </p>
          <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>bpm</p>
        </div>
      </div>

      {todayDoses.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2.5">
            <p style={{ fontSize: 12, fontWeight: 500, color: '#6B7280' }}>Today's medicines</p>
            <button
              onClick={() => navigate('/medicines')}
              style={{ fontSize: 12, fontWeight: 500, color: '#2563EB', background: 'none', border: 'none', padding: 0 }}
            >
              View all
            </button>
          </div>
          <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
            {todayDoses.map((dose, i) => (
              <div
                key={i}
                className="flex-shrink-0 flex items-center gap-2 rounded-xl px-3 py-2 bg-white border"
                style={{ borderColor: 'rgba(0,0,0,0.07)' }}
              >
                <Pill size={12} style={{ color: '#7C3AED' }} />
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
        </div>
      )}

      {pending.length > 0 && (
        <div className="bg-white rounded-2xl border p-5 mb-4" style={{ borderColor: 'rgba(0,0,0,0.07)' }}>
          <p style={{ fontSize: 12, fontWeight: 500, color: '#6B7280', marginBottom: 12 }}>Due now</p>
          <div className="space-y-3">
            {pending.map((dose, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#FEF3C7' }}>
                  <Pill size={13} style={{ color: '#D97706' }} />
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
            style={{ fontSize: 14, fontWeight: 500, color: '#2563EB', background: 'none', border: 'none', padding: 0 }}
          >
            Manage all medicines
          </button>
        </div>
      )}

      <button
        onClick={() => navigate('/vitals')}
        title="Log a reading"
        className="fixed bottom-20 right-5 lg:bottom-8 lg:right-8 w-14 h-14 rounded-full text-white flex items-center justify-center transition-transform hover:scale-105 active:scale-95 z-40"
        style={{ background: '#C0203E', boxShadow: '0 4px 20px rgba(192,32,62,0.35)' }}
      >
        <Plus size={22} />
      </button>
    </div>
  );
}
