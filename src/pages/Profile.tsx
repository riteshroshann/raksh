import React, { useState } from 'react';
import { Pencil, LogOut, Sun, Moon, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAppContext } from '../context/AppContext';
import { ConditionChip } from '../components/ConditionChip';
import type { Condition } from '../lib/types';

function Toggle({ value, onChange }: { value: boolean; onChange: () => void }) {
  return (
    <button
      role="switch"
      aria-checked={value}
      onClick={onChange}
      className="w-11 h-6 rounded-full relative transition-colors duration-200 shrink-0"
      style={{ background: value ? 'var(--teal)' : 'var(--border-medium)' }}
    >
      <motion.div
        animate={{ x: value ? 20 : 2 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
      />
    </button>
  );
}

export default function Profile() {
  const navigate = useNavigate();
  const { user, familyMembers, isDarkMode, toggleDarkMode, signOut } = useAppContext();
  const profile = user?.profile;

  const [notifEnabled, setNotifEnabled] = useState(true);

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  async function handleSignOut() {
    await signOut();
    navigate('/', { replace: true });
  }

  return (
    <div className="px-5 pt-8 pb-32 bg-[#FAFBFC] min-h-full">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-[28px] font-semibold text-[var(--text-primary)]">Profile</h1>
      </div>

      {/* ── Avatar + name ─────────────────────────────────────────── */}
      <div className="flex items-center gap-4 mb-8">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-semibold text-white shrink-0"
          style={{ background: 'var(--primary)' }}
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-lg font-semibold text-[var(--text-primary)] truncate">
            {profile?.full_name ?? 'Loading…'}
          </p>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">{user?.email}</p>
          {/* Premium badge — design only */}
          <span
            className="mt-2 inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-semibold"
            style={{ background: '#FEF9C3', color: '#92400E' }}
          >
            ✦ Premium Member
          </span>
        </div>
        <button aria-label="Edit profile" className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[var(--bg-secondary)] transition-colors">
          <Pencil size={16} className="text-[var(--text-secondary)]" />
        </button>
      </div>

      {/* ── Conditions ─────────────────────────────────────────────── */}
      {profile?.conditions && profile.conditions.length > 0 && (
        <section className="card p-4 mb-4">
          <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest mb-3">
            Conditions
          </p>
          <div className="flex flex-wrap gap-2">
            {profile.conditions.map(c => (
              <ConditionChip key={c} condition={c as Condition} selected size="sm" />
            ))}
          </div>
        </section>
      )}

      {/* ── Family members ──────────────────────────────────────────── */}
      {familyMembers.length > 0 && (
        <section className="card p-4 mb-4">
          <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest mb-3">
            Family Members
          </p>
          <div className="flex flex-col gap-3">
            {familyMembers.map(m => (
              <div key={m.id} className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold text-white shrink-0"
                  style={{ background: m.color }}
                >
                  {m.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">{m.name}</p>
                  <p className="text-xs text-[var(--text-muted)]">{m.relation}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Settings ────────────────────────────────────────────────── */}
      <section className="card p-4 mb-4">
        <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest mb-3">
          Settings
        </p>

        <div className="flex flex-col gap-1">
          {/* Dark mode */}
          <div className="flex items-center justify-between py-3 border-b border-[var(--border)]">
            <div className="flex items-center gap-3">
              {isDarkMode
                ? <Moon size={16} className="text-[var(--text-secondary)]" />
                : <Sun size={16} className="text-[var(--text-secondary)]" />
              }
              <span className="text-sm font-medium text-[var(--text-primary)]">Dark Mode</span>
            </div>
            <Toggle value={isDarkMode} onChange={toggleDarkMode} />
          </div>

          {/* Notifications */}
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <Bell size={16} className="text-[var(--text-secondary)]" />
              <span className="text-sm font-medium text-[var(--text-primary)]">Notifications</span>
            </div>
            <Toggle value={notifEnabled} onChange={() => setNotifEnabled(v => !v)} />
          </div>
        </div>
      </section>

      {/* ── Sign out ─────────────────────────────────────────────────── */}
      <button
        onClick={handleSignOut}
        id="sign-out"
        className="w-full py-3.5 rounded-2xl border-2 border-red-100 text-sm font-semibold transition-colors hover:bg-red-50"
        style={{ color: 'var(--danger)' }}
      >
        Sign Out
      </button>
    </div>
  );
}
