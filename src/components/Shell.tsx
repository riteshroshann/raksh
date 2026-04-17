import React, { useEffect, useState } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Home, HeartPulse, Pill, LogOut, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../context/AppContext';
import { requestNotificationPermission, notificationsGranted, scheduleAllReminders } from '../lib/notifications';

// Profile is intentionally excluded from the bottom nav — accessible via the top-right avatar
const NAV = [
  { to: '/home',      icon: Home,       label: 'Home' },
  { to: '/vitals',    icon: HeartPulse, label: 'Vitals' },
  { to: '/medicines', icon: Pill,        label: 'Medicines' },
];

export function Shell() {
  const { user, signOut } = useAppContext();
  const location = useLocation();
  const navigate  = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifGranted, setNotifGranted] = useState(notificationsGranted());

  // Register SW + reschedule reminders on mount
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
    if (notificationsGranted()) scheduleAllReminders();
  }, []);

  async function handleBellClick() {
    if (!notifGranted) {
      const granted = await requestNotificationPermission();
      setNotifGranted(granted);
      if (granted) { scheduleAllReminders(); setNotifOpen(true); }
    } else {
      setNotifOpen(v => !v);
    }
  }

  const profile  = user?.profile;
  const initials = profile?.full_name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() ?? 'R';
  const currentLabel = [...NAV, { to: '/profile', label: 'Profile' }].find(n => location.pathname.startsWith(n.to))?.label ?? 'Dashboard';

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="flex h-dvh overflow-hidden" style={{ background: '#F7F8FA' }}>

      {/* ── DESKTOP SIDEBAR ── */}
      <aside className="hidden lg:flex w-64 flex-col bg-white border-r flex-shrink-0" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
        <div className="flex items-center gap-3 px-6 h-16 border-b" style={{ borderColor: 'rgba(0,0,0,0.04)' }}>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#C0203E' }}>
            <span className="text-white font-bold text-sm">R</span>
          </div>
          <div>
            <p className="font-semibold text-gray-900" style={{ fontSize: 14, lineHeight: 1 }}>Raksh</p>
            <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>Health Manager</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
          {NAV.map(({ to, icon: Icon, label }) => {
            const active = location.pathname.startsWith(to);
            return (
              <NavLink
                key={to}
                to={to}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${
                  active ? 'text-white' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                }`}
                style={active ? { background: '#C0203E', boxShadow: '0 2px 8px rgba(192,32,62,0.25)' } : {}}
              >
                <Icon size={17} strokeWidth={active ? 2.2 : 1.8} />
                <span style={{ fontSize: 14, fontWeight: active ? 500 : 400 }}>{label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Desktop bottom user card — clickable → profile */}
        <div className="px-3 py-4 border-t" style={{ borderColor: 'rgba(0,0,0,0.04)' }}>
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center gap-3 px-3 py-3 rounded-xl w-full hover:bg-gray-50 transition-colors text-left"
            style={location.pathname.startsWith('/profile') ? { background: 'rgba(192,32,62,0.06)' } : {}}
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#C0203E' }}>
              <span className="text-white font-semibold" style={{ fontSize: 12 }}>{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-900 truncate" style={{ fontSize: 14, fontWeight: 500 }}>{profile?.full_name ?? 'User'}</p>
              <p className="text-gray-400 truncate" style={{ fontSize: 11 }}>{user?.email}</p>
            </div>
          </button>
          <button
            onClick={handleSignOut}
            className="mt-1 flex items-center gap-2.5 px-3 py-2 rounded-xl text-red-500 hover:bg-red-50 transition-colors w-full"
            style={{ fontSize: 13 }}
          >
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      </aside>

      {/* ── CONTENT ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Top header — avatar navigates to profile */}
        <header className="flex items-center px-5 lg:px-8 bg-white border-b flex-shrink-0" style={{ height: 56, borderColor: 'rgba(0,0,0,0.05)' }}>
          <div className="flex items-center gap-2.5 lg:hidden">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#C0203E' }}>
              <span className="text-white font-bold text-xs">R</span>
            </div>
            <span className="font-semibold text-gray-900" style={{ fontSize: 14 }}>Raksh</span>
          </div>
          <h1 className="hidden lg:block text-gray-900" style={{ fontSize: 16, fontWeight: 500 }}>{currentLabel}</h1>

          {/* ── Bell notification button ── */}
          <div style={{ position: 'relative', marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={handleBellClick}
              title={notifGranted ? 'Notifications' : 'Enable notifications'}
              style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.06)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', color: '#6B7280', transition: 'all 0.18s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(192,32,62,0.08)'; e.currentTarget.style.color = '#C0203E'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.04)'; e.currentTarget.style.color = '#6B7280'; }}
            >
              <Bell size={16} />
              {!notifGranted && (
                <span style={{ position: 'absolute', top: 6, right: 6, width: 7, height: 7, borderRadius: '50%', background: '#C0203E', border: '1.5px solid white' }} />
              )}
            </button>

            {/* Notification panel */}
            <AnimatePresence>
              {notifOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -8 }}
                  transition={{ duration: 0.15 }}
                  style={{ position: 'absolute', top: 46, right: 0, zIndex: 100, width: 280, background: 'white', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 14, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', overflow: 'hidden' }}
                >
                  <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>Notifications</p>
                    <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>Medicine reminders are {notifGranted ? '✅ active' : '❌ disabled'}</p>
                  </div>
                  <div style={{ padding: '12px 16px' }}>
                    <p style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.6 }}>
                      {notifGranted
                        ? "You'll get reminders based on the times set in each medicine."
                        : 'Grant permission to receive medicine reminders.'}
                    </p>
                    {!notifGranted && (
                      <button
                        onClick={async () => { const ok = await requestNotificationPermission(); setNotifGranted(ok); if (ok) scheduleAllReminders(); }}
                        style={{ marginTop: 10, width: '100%', padding: '10px', borderRadius: 8, background: '#C0203E', color: 'white', fontWeight: 600, fontSize: 13, border: 'none', cursor: 'pointer' }}
                      >
                        Enable reminders
                      </button>
                    )}
                    <button
                      onClick={() => { navigate('/medicines'); setNotifOpen(false); }}
                      style={{ marginTop: 8, width: '100%', padding: '10px', borderRadius: 8, background: 'rgba(0,0,0,0.04)', color: '#374151', fontWeight: 500, fontSize: 13, border: 'none', cursor: 'pointer' }}
                    >
                      View medicines
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Clickable avatar — navigates to /profile */}
            <button
              onClick={() => { navigate('/profile'); setNotifOpen(false); }}
              className="flex items-center gap-2 transition-opacity hover:opacity-80"
              title="Profile & Settings"
            >
            <span className="hidden lg:block" style={{ fontSize: 14, color: '#6B7280' }}>{profile?.full_name}</span>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center ring-2 ring-transparent hover:ring-[#C0203E]/30 transition-all"
              style={{ background: '#C0203E' }}
            >
              <span className="text-white font-semibold" style={{ fontSize: 12 }}>{initials}</span>
            </div>
          </button>
          </div>{/* end bell+avatar wrapper */}
        </header>


        {/* Page content */}
        <main className="flex-1 overflow-y-auto pb-16 lg:pb-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="min-h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>

        {/* ── MOBILE BOTTOM NAV (3 tabs, no Profile) ── */}
        <nav
          className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-50 flex items-stretch"
          style={{ borderColor: 'rgba(0,0,0,0.05)', height: 64 }}
        >
          {NAV.map(({ to, icon: Icon, label }) => {
            const active = location.pathname.startsWith(to);
            return (
              <NavLink
                key={to}
                to={to}
                className="flex-1 flex flex-col items-center justify-center"
              >
                <div
                  className="flex flex-col items-center justify-center gap-0.5 px-5 py-1.5 rounded-full transition-all"
                  style={active ? { background: 'rgba(192,32,62,0.10)' } : {}}
                >
                  <Icon
                    size={20}
                    strokeWidth={active ? 2.3 : 1.7}
                    style={{ color: active ? '#C0203E' : '#9CA3AF' }}
                  />
                  <span style={{ fontSize: 10, fontWeight: active ? 600 : 400, color: active ? '#C0203E' : '#9CA3AF' }}>
                    {label}
                  </span>
                </div>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
