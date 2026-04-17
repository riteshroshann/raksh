import React, { useEffect, useState } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Home, HeartPulse, Pill, LogOut, Bell, Moon, Sun, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../context/AppContext';
import { GlassFilter } from './GlassEffect';
import { requestNotificationPermission, notificationsGranted, scheduleAllReminders } from '../lib/notifications';

const NAV = [
  { to: '/home',      icon: Home,       label: 'Home' },
  { to: '/vitals',    icon: HeartPulse, label: 'Vitals' },
  { to: '/medicines', icon: Pill,        label: 'Medicines' },
];

export function Shell() {
  const { user, signOut, isDarkMode, toggleDarkMode } = useAppContext();
  const location  = useLocation();
  const navigate  = useNavigate();
  const [notifOpen, setNotifOpen]   = useState(false);
  const [notifGranted, setNotifGranted] = useState(notificationsGranted());

  useEffect(() => {
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});
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
  const initials = profile?.full_name?.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase() ?? 'R';
  const currentLabel = [...NAV, { to: '/profile', label: 'Profile' }].find(n => location.pathname.startsWith(n.to))?.label ?? 'Dashboard';

  const handleSignOut = async () => { await signOut(); navigate('/'); };

  // Theme-aware colors
  const sidebarBg   = isDarkMode ? 'rgba(10,10,14,0.92)'   : 'rgba(255,255,255,0.82)';
  const sidebarBd   = isDarkMode ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)';
  const headerBg    = isDarkMode ? 'rgba(12,12,16,0.88)'    : 'rgba(255,255,255,0.85)';
  const contentBg   = isDarkMode ? '#0C0C10'                : '#F5F4F7';
  const textPri     = isDarkMode ? '#F3F4F6'                : '#111827';
  const textSec     = isDarkMode ? 'rgba(255,255,255,0.45)' : '#9CA3AF';
  const activeBg    = '#C0203E';
  const hoverBg     = isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
  const mobileNavBg = isDarkMode ? 'rgba(10,10,14,0.95)'    : 'rgba(255,255,255,0.95)';

  return (
    <div style={{ display: 'flex', height: '100dvh', overflow: 'hidden', background: contentBg }}>
      <GlassFilter />

      {/* ── DESKTOP SIDEBAR ── */}
      <aside
        className="hidden lg:flex flex-col flex-shrink-0"
        style={{
          width: 240,
          background: sidebarBg,
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderRight: `1px solid ${sidebarBd}`,
          boxShadow: isDarkMode ? '4px 0 24px rgba(0,0,0,0.4)' : '4px 0 24px rgba(0,0,0,0.04)',
        }}
      >
        {/* Logo */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '0 20px', height: 60,
          borderBottom: `1px solid ${sidebarBd}`,
        }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg, #C0203E, #8A101E)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(192,32,62,0.4)' }}>
            <span style={{ color: 'white', fontWeight: 800, fontSize: 14, fontFamily: 'DM Sans, sans-serif' }}>R</span>
          </div>
          <div>
            <p style={{ fontWeight: 700, fontSize: 15, color: textPri, lineHeight: 1, letterSpacing: '-0.02em' }}>Raksh</p>
            <p style={{ fontSize: 10, color: textSec, marginTop: 2, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Health</p>
          </div>
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
          {NAV.map(({ to, icon: Icon, label }) => {
            const active = location.pathname.startsWith(to);
            return (
              <NavLink
                key={to} to={to}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 14px', borderRadius: 12, marginBottom: 2,
                  textDecoration: 'none', transition: 'all 0.18s ease',
                  background: active ? activeBg : 'transparent',
                  color: active ? 'white' : textSec,
                  boxShadow: active ? '0 4px 16px rgba(192,32,62,0.35)' : 'none',
                }}
                onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = hoverBg; (e.currentTarget as HTMLElement).style.color = textPri; }}
                onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = textSec; } }}
              >
                <Icon size={17} strokeWidth={active ? 2.2 : 1.8} />
                <span style={{ fontSize: 14, fontWeight: active ? 600 : 400 }}>{label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom user area */}
        <div style={{ padding: '10px', borderTop: `1px solid ${sidebarBd}` }}>
          {/* Dark mode toggle */}
          <button
            onClick={toggleDarkMode}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, width: '100%',
              padding: '9px 14px', borderRadius: 12, border: 'none', cursor: 'pointer',
              background: 'transparent', color: textSec, fontSize: 13, marginBottom: 4,
              transition: 'all 0.18s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = hoverBg; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
          >
            {isDarkMode ? <Sun size={15} /> : <Moon size={15} />}
            <span>{isDarkMode ? 'Light mode' : 'Dark mode'}</span>
          </button>

          {/* Profile */}
          <button
            onClick={() => navigate('/profile')}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, width: '100%',
              padding: '10px 12px', borderRadius: 14, border: 'none', cursor: 'pointer',
              background: location.pathname.startsWith('/profile') ? (isDarkMode ? 'rgba(192,32,62,0.15)' : 'rgba(192,32,62,0.07)') : 'transparent',
              transition: 'all 0.18s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = hoverBg; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = location.pathname.startsWith('/profile') ? (isDarkMode ? 'rgba(192,32,62,0.15)' : 'rgba(192,32,62,0.07)') : 'transparent'; }}
          >
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #C0203E, #8A101E)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 8px rgba(192,32,62,0.35)' }}>
              <span style={{ color: 'white', fontWeight: 700, fontSize: 12 }}>{initials}</span>
            </div>
            <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: textPri, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{profile?.full_name ?? 'User'}</p>
              <p style={{ fontSize: 10, color: textSec, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</p>
            </div>
          </button>

          <button
            onClick={handleSignOut}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, width: '100%',
              padding: '9px 14px', borderRadius: 12, border: 'none', cursor: 'pointer',
              background: 'transparent', color: '#EF4444', fontSize: 13, marginTop: 4,
              transition: 'all 0.18s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.08)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
          >
            <LogOut size={14} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* ── CONTENT AREA ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Top Header */}
        <header style={{
          display: 'flex', alignItems: 'center', padding: '0 20px', height: 56, flexShrink: 0,
          background: headerBg, backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${sidebarBd}`,
          boxShadow: isDarkMode ? '0 2px 16px rgba(0,0,0,0.3)' : '0 2px 16px rgba(0,0,0,0.04)',
        }}>
          {/* Mobile: logo */}
          <div className="lg:hidden" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, #C0203E, #8A101E)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 3px 8px rgba(192,32,62,0.35)' }}>
              <span style={{ color: 'white', fontWeight: 800, fontSize: 13 }}>R</span>
            </div>
            <span style={{ fontWeight: 700, fontSize: 15, color: textPri, letterSpacing: '-0.02em' }}>Raksh</span>
          </div>
          {/* Desktop: page label */}
          <h1 className="hidden lg:block" style={{ fontSize: 15, fontWeight: 600, color: textPri }}>{currentLabel}</h1>

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, position: 'relative' }}>
            {/* Dark toggle — mobile */}
            <button
              onClick={toggleDarkMode}
              className="lg:hidden"
              style={{ width: 36, height: 36, borderRadius: '50%', background: hoverBg, border: `1px solid ${sidebarBd}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: textSec, transition: 'all 0.18s' }}
            >
              {isDarkMode ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            {/* Bell */}
            <button
              onClick={handleBellClick}
              style={{ width: 36, height: 36, borderRadius: '50%', background: hoverBg, border: `1px solid ${sidebarBd}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: textSec, position: 'relative', transition: 'all 0.18s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(192,32,62,0.1)'; (e.currentTarget as HTMLElement).style.color = '#C0203E'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = hoverBg; (e.currentTarget as HTMLElement).style.color = textSec; }}
            >
              <Bell size={16} />
              {!notifGranted && <span style={{ position: 'absolute', top: 7, right: 7, width: 7, height: 7, borderRadius: '50%', background: '#C0203E', border: `2px solid ${isDarkMode ? '#0C0C10' : 'white'}` }} />}
            </button>

            {/* Notification panel */}
            <AnimatePresence>
              {notifOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -8 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -8 }} transition={{ duration: 0.15 }}
                  style={{ position: 'absolute', top: 46, right: 0, zIndex: 100, width: 280, background: isDarkMode ? 'rgba(20,20,28,0.96)' : 'rgba(255,255,255,0.98)', border: `1px solid ${sidebarBd}`, borderRadius: 16, boxShadow: '0 12px 48px rgba(0,0,0,0.18)', overflow: 'hidden', backdropFilter: 'blur(20px)' }}
                >
                  <div style={{ padding: '14px 16px', borderBottom: `1px solid ${sidebarBd}` }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: textPri }}>Notifications</p>
                    <p style={{ fontSize: 11, color: textSec, marginTop: 2 }}>Reminders are {notifGranted ? '✅ active' : '❌ off'}</p>
                  </div>
                  <div style={{ padding: '12px 16px' }}>
                    <p style={{ fontSize: 12, color: textSec, lineHeight: 1.6 }}>
                      {notifGranted ? "You'll get reminders at your set medicine times." : 'Grant permission to receive medicine reminders.'}
                    </p>
                    {!notifGranted && (
                      <button onClick={async () => { const ok = await requestNotificationPermission(); setNotifGranted(ok); if (ok) scheduleAllReminders(); }}
                        style={{ marginTop: 10, width: '100%', padding: '10px', borderRadius: 10, background: '#C0203E', color: 'white', fontWeight: 600, fontSize: 13, border: 'none', cursor: 'pointer' }}>
                        Enable reminders
                      </button>
                    )}
                    <button onClick={() => { navigate('/medicines'); setNotifOpen(false); }}
                      style={{ marginTop: 8, width: '100%', padding: '10px', borderRadius: 10, background: hoverBg, color: textPri, fontWeight: 500, fontSize: 13, border: 'none', cursor: 'pointer' }}>
                      View medicines
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Avatar → profile */}
            <button
              onClick={() => { navigate('/profile'); setNotifOpen(false); }}
              style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', transition: 'opacity 0.18s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.75'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
            >
              <span className="hidden lg:block" style={{ fontSize: 13, color: textSec }}>{profile?.full_name}</span>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #C0203E, #8A101E)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 3px 10px rgba(192,32,62,0.35)' }}>
                <span style={{ color: 'white', fontWeight: 700, fontSize: 12 }}>{initials}</span>
              </div>
            </button>
          </div>
        </header>

        {/* Main page content */}
        <main style={{ flex: 1, overflowY: 'auto', paddingBottom: 72 }} className="lg:pb-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              style={{ minHeight: '100%' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>

        {/* ── MOBILE BOTTOM NAV ── */}
        <nav
          className="lg:hidden"
          style={{
            position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
            display: 'flex', alignItems: 'stretch', height: 64,
            background: mobileNavBg,
            backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
            borderTop: `1px solid ${sidebarBd}`,
            boxShadow: isDarkMode ? '0 -4px 24px rgba(0,0,0,0.4)' : '0 -4px 24px rgba(0,0,0,0.06)',
          }}
        >
          {NAV.map(({ to, icon: Icon, label }) => {
            const active = location.pathname.startsWith(to);
            return (
              <NavLink
                key={to} to={to}
                style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}
              >
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                  padding: '6px 20px', borderRadius: 14, transition: 'all 0.18s',
                  background: active ? (isDarkMode ? 'rgba(192,32,62,0.18)' : 'rgba(192,32,62,0.1)') : 'transparent',
                }}>
                  <Icon size={20} strokeWidth={active ? 2.3 : 1.7} style={{ color: active ? '#C0203E' : textSec }} />
                  <span style={{ fontSize: 10, fontWeight: active ? 700 : 400, color: active ? '#C0203E' : textSec }}>{label}</span>
                </div>
              </NavLink>
            );
          })}
          {/* Profile tab */}
          <NavLink
            to="/profile"
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}
          >
            {({ isActive }) => (
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                padding: '6px 20px', borderRadius: 14, transition: 'all 0.18s',
                background: isActive ? (isDarkMode ? 'rgba(192,32,62,0.18)' : 'rgba(192,32,62,0.1)') : 'transparent',
              }}>
                <User size={20} strokeWidth={isActive ? 2.3 : 1.7} style={{ color: isActive ? '#C0203E' : textSec }} />
                <span style={{ fontSize: 10, fontWeight: isActive ? 700 : 400, color: isActive ? '#C0203E' : textSec }}>Profile</span>
              </div>
            )}
          </NavLink>
        </nav>
      </div>
    </div>
  );
}
