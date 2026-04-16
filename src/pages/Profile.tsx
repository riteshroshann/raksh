import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, User, Settings, LogOut, Sun, Moon, ChevronRight } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { useAppContext } from '../context/AppContext';
import type { Condition } from '../lib/types';

const CONDITION_COLOR: Record<string, string> = {
  Diabetes:     '#C0203E',
  Thyroid:      '#7C3AED',
  Heart:        '#EA580C',
  Kidney:       '#0D9488',
  Hypertension: '#1D4ED8',
};

function Toggle({ value, onChange }: { value: boolean; onChange: () => void }) {
  return (
    <button
      role="switch"
      aria-checked={value}
      onClick={onChange}
      className="w-11 h-6 rounded-full relative transition-colors duration-300 shrink-0"
      style={{ background: value ? '#C0203E' : 'rgba(0,0,0,0.1)' }}
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
  const shouldReduce = useReducedMotion();
  const { user, familyMembers, isDarkMode, toggleDarkMode, signOut } = useAppContext();
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const profile = user?.profile;
  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  async function handleSignOut() {
    await signOut();
    navigate('/', { replace: true });
  }

  return (
    <div className="flex flex-col min-h-full bg-white">

      {/* ── Header ────────────────────────────────────────────────── */}
      <header className="px-6 pt-10 pb-4 flex items-center justify-between bg-white sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="w-10 h-10 rounded-full border border-black/[0.05] shadow-sm hover:scale-105 active:scale-95 transition-all overflow-hidden"
            style={{ background: '#C0203E' }}
          >
            <span className="flex items-center justify-center h-full text-white text-sm font-semibold">{initials}</span>
          </button>
          <div>
            <span className="text-lg font-light text-black">Hi, {profile?.full_name?.split(' ')[0] ?? 'there'}</span>
            <span className="text-lg ml-1">✨</span>
          </div>
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

        {/* ── Avatar + name hero ─────────────────────────────────── */}
        <div className="mt-4 mb-8 flex flex-col items-center text-center">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-medium text-white border-4 border-white shadow-xl mb-4"
            style={{ background: 'linear-gradient(135deg, #C0203E 0%, rgba(192,32,62,0.75) 100%)' }}
          >
            {initials}
          </div>
          <h1 className="text-xl font-medium text-black">{profile?.full_name ?? 'Loading…'}</h1>
          <p className="text-sm text-black/40 mt-0.5">{user?.email}</p>
          <span className="mt-2 inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold" style={{ background: '#FEF9C3', color: '#92400E' }}>
            ✦ Premium Member
          </span>
        </div>

        {/* ── Conditions ────────────────────────────────────────────── */}
        {profile?.conditions && profile.conditions.length > 0 && (
          <div className="glass-card p-5 mb-4 border border-black/[0.05]">
            <p className="text-caption mb-3">Conditions</p>
            <div className="flex flex-wrap gap-2">
              {profile.conditions.map(c => {
                const color = CONDITION_COLOR[c] ?? '#6B7280';
                return (
                  <span
                    key={c}
                    className="px-4 py-1.5 rounded-full text-xs font-bold border"
                    style={{
                      background: `${color}15`,
                      borderColor: `${color}30`,
                      color,
                    }}
                  >
                    {c}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Family members ────────────────────────────────────────── */}
        {familyMembers.length > 0 && (
          <div className="glass-card p-5 mb-4 border border-black/[0.05]">
            <p className="text-caption mb-4">Family Members</p>
            <div className="flex flex-col gap-3">
              {familyMembers.map(m => (
                <div key={m.id} className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-white shrink-0"
                    style={{ background: m.color ?? '#C0203E' }}
                  >
                    {m.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-black">{m.name}</p>
                    <p className="text-xs text-black/30 capitalize">{m.relation}</p>
                  </div>
                  <ChevronRight size={15} className="text-black/20" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Settings ──────────────────────────────────────────────── */}
        <div className="glass-card p-5 mb-4 border border-black/[0.05]">
          <p className="text-caption mb-3">Settings</p>
          <div className="flex flex-col">
            {/* Dark mode */}
            <div className="flex items-center justify-between py-3 border-b border-black/5">
              <div className="flex items-center gap-3">
                {isDarkMode
                  ? <Moon size={16} className="text-black/40" />
                  : <Sun size={16} className="text-black/40" />
                }
                <span className="text-sm font-medium text-black">Dark Mode</span>
              </div>
              <Toggle value={isDarkMode} onChange={toggleDarkMode} />
            </div>
            {/* Notifications */}
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <Bell size={16} className="text-black/40" />
                <span className="text-sm font-medium text-black">Notifications</span>
              </div>
              <Toggle value={notifEnabled} onChange={() => setNotifEnabled(v => !v)} />
            </div>
          </div>
        </div>

        {/* ── Sign out ──────────────────────────────────────────────── */}
        <motion.button
          whileHover={shouldReduce ? {} : { backgroundColor: 'rgba(192,32,62,0.05)' }}
          whileTap={shouldReduce ? {} : { scale: 0.98 }}
          onClick={handleSignOut}
          id="sign-out"
          className="w-full py-4 rounded-[2rem] border-2 transition-colors flex items-center justify-center gap-2"
          style={{ borderColor: 'rgba(192,32,62,0.2)', color: '#C0203E' }}
        >
          <LogOut size={16} />
          <span className="text-sm font-semibold">Sign Out</span>
        </motion.button>

      </main>
    </div>
  );
}
