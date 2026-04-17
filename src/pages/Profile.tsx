import React, { useState, useEffect } from 'react';
import { User, Shield, Bell, Moon, LogOut, ChevronRight, Sun } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import type { Condition } from '../lib/types';

const CONDITION_STYLES: Record<string, { bg: string; text: string }> = {
  Diabetes:     { bg: '#FFF0F2', text: '#C0203E' },
  Thyroid:      { bg: '#FFF0F2', text: '#C0203E' },
  Heart:        { bg: '#FFF0F2', text: '#C0203E' },
  Kidney:       { bg: '#FFF0F2', text: '#C0203E' },
  Hypertension: { bg: '#FFF0F2', text: '#C0203E' },
};

function Toast({ msg, onClose }: { msg: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 2500);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div
      style={{
        position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)',
        background: '#111', color: 'white', borderRadius: 12, padding: '12px 20px',
        fontSize: 14, fontWeight: 500, zIndex: 200, boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        whiteSpace: 'nowrap',
      }}
    >
      {msg}
    </div>
  );
}

export default function Profile() {
  const { user, familyMembers, signOut } = useAppContext();
  const navigate = useNavigate();
  const profile  = user?.profile;
  const initials = profile?.full_name?.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase() ?? 'R';

  // ── Dark mode (local implementation) ──
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('raksh-dark') === 'true';
  });
  const [toast, setToast] = useState<string | null>(null);

  function toggleDark() {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem('raksh-dark', String(next));
    if (next) {
      document.documentElement.style.filter = 'invert(0.94) hue-rotate(180deg)';
      document.documentElement.style.background = '#111';
    } else {
      document.documentElement.style.filter = '';
      document.documentElement.style.background = '';
    }
    setToast(next ? '🌙 Dark mode on' : '☀️ Light mode on');
  }

  // Restore dark mode on mount
  useEffect(() => {
    if (darkMode) {
      document.documentElement.style.filter = 'invert(0.94) hue-rotate(180deg)';
      document.documentElement.style.background = '#111';
    }
  }, []);

  const handleSignOut = async () => {
    // Clean up dark mode before leaving
    document.documentElement.style.filter = '';
    document.documentElement.style.background = '';
    await signOut();
    navigate('/');
  };

  const settingRow = (
    icon: React.ReactNode,
    label: string,
    sub: string,
    right: React.ReactNode,
    onClick?: () => void
  ) => (
    <button
      onClick={onClick}
      className="flex items-center justify-between px-5 py-4 w-full hover:bg-gray-50/70 transition-colors text-left"
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="flex items-center gap-3">
        {icon}
        <div>
          <p style={{ fontSize: 14, fontWeight: 500, color: '#111827' }}>{label}</p>
          <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 1 }}>{sub}</p>
        </div>
      </div>
      {right}
    </button>
  );

  return (
    <div className="p-5 lg:p-8 max-w-3xl mx-auto pb-24 lg:pb-12">
      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}

      <div className="mb-6">
        <h1 style={{ fontSize: 22, fontWeight: 500, color: '#111827' }}>Profile</h1>
        <p style={{ fontSize: 14, color: '#6B7280', marginTop: 2 }}>Your account and preferences</p>
      </div>

      {/* ── Avatar card ── */}
      <div className="bg-white rounded-2xl border p-6 text-center mb-4" style={{ borderColor: 'rgba(0,0,0,0.07)' }}>
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: '#C0203E', boxShadow: '0 8px 24px rgba(192,32,62,0.28)' }}
        >
          <span className="text-white text-2xl font-semibold">{initials}</span>
        </div>
        <h2 style={{ fontSize: 18, fontWeight: 600, color: '#111827' }}>{profile?.full_name ?? 'User'}</h2>
        <p style={{ fontSize: 13, color: '#9CA3AF', marginTop: 3 }}>{user?.email}</p>

        {profile?.conditions && profile.conditions.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center mt-4">
            {profile.conditions.map((c: Condition) => {
              const s = CONDITION_STYLES[c] ?? { bg: '#FFF0F2', text: '#C0203E' };
              return (
                <span key={c} style={{ fontSize: 12, fontWeight: 500, padding: '4px 12px', borderRadius: 6, background: s.bg, color: s.text }}>
                  {c}
                </span>
              );
            })}
          </div>
        )}

        {familyMembers.length > 0 && (
          <div className="mt-5 pt-5 border-t text-left" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
            <p style={{ fontSize: 12, fontWeight: 500, color: '#9CA3AF', marginBottom: 12 }}>Family members</p>
            <div className="space-y-3">
              {familyMembers.map(member => {
                const mi = member.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();
                return (
                  <div key={member.id} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-semibold" style={{ background: '#C0203E' }}>
                      {mi}
                    </div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 500, color: '#111827' }}>{member.name}</p>
                      <p style={{ fontSize: 12, color: '#9CA3AF' }}>{member.relation}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Preferences ── */}
      <div className="bg-white rounded-2xl border overflow-hidden mb-4" style={{ borderColor: 'rgba(0,0,0,0.07)' }}>
        <div className="px-5 py-4 border-b" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
          <p style={{ fontSize: 12, fontWeight: 500, color: '#6B7280' }}>Preferences</p>
        </div>
        <div className="divide-y" style={{ borderColor: 'rgba(0,0,0,0.04)' }}>
          {settingRow(
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: darkMode ? 'rgba(192,32,62,0.1)' : '#F3F4F6' }}>
              {darkMode ? <Moon size={16} style={{ color: '#C0203E' }} /> : <Sun size={16} style={{ color: '#6B7280' }} />}
            </div>,
            'Dark mode',
            darkMode ? 'Currently on' : 'Currently off',
            <button
              onClick={toggleDark}
              className="relative flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-200"
              style={{ background: darkMode ? '#C0203E' : '#E5E7EB' }}
            >
              <div
                className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200"
                style={{ transform: darkMode ? 'translateX(20px)' : 'translateX(0)' }}
              />
            </button>,
            toggleDark
          )}
          {settingRow(
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(192,32,62,0.08)' }}>
              <Bell size={16} style={{ color: '#C0203E' }} />
            </div>,
            'Notifications',
            'Medicine reminders and alerts',
            <ChevronRight size={16} style={{ color: '#D1D5DB' }} />,
            () => setToast('🔔 Notifications coming soon')
          )}
          {settingRow(
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(192,32,62,0.08)' }}>
              <Shield size={16} style={{ color: '#C0203E' }} />
            </div>,
            'Privacy & Security',
            'Your data never leaves your account',
            <ChevronRight size={16} style={{ color: '#D1D5DB' }} />,
            () => setToast('🔒 All data is end-to-end protected')
          )}
        </div>
      </div>

      {/* ── Account ── */}
      <div className="bg-white rounded-2xl border overflow-hidden mb-4" style={{ borderColor: 'rgba(0,0,0,0.07)' }}>
        <div className="px-5 py-4 border-b" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
          <p style={{ fontSize: 12, fontWeight: 500, color: '#6B7280' }}>Account</p>
        </div>
        <div className="divide-y" style={{ borderColor: 'rgba(0,0,0,0.04)' }}>
          {settingRow(
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#F3F4F6' }}>
              <User size={16} style={{ color: '#6B7280' }} />
            </div>,
            'Email',
            user?.email ?? '',
            null
          )}
          <div className="px-5 py-4">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-80"
              style={{ color: '#C0203E' }}
            >
              <LogOut size={15} />
              Sign out of Raksh
            </button>
          </div>
        </div>
      </div>

      {/* ── Danger zone ── */}
      <div className="rounded-2xl border p-5" style={{ background: '#FFF8F8', borderColor: 'rgba(192,32,62,0.15)' }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', color: '#C0203E', marginBottom: 6 }}>DANGER ZONE</p>
        <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 14 }}>
          Permanently delete your account and all associated health data.
        </p>
        <button
          onClick={() => setToast('⚠️ Contact support to delete your account')}
          style={{ fontSize: 13, fontWeight: 600, color: '#C0203E', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
        >
          Delete account →
        </button>
      </div>
    </div>
  );
}
