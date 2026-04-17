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

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 1024);
  useEffect(() => {
    const handler = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isDesktop;
}

export function Shell() {
  const { user, signOut, isDarkMode, toggleDarkMode } = useAppContext();
  const location   = useLocation();
  const navigate   = useNavigate();
  const isDesktop  = useIsDesktop();
  const [notifOpen, setNotifOpen]     = useState(false);
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

  const profile    = user?.profile;
  const initials   = profile?.full_name?.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase() ?? 'R';
  const allNav     = [...NAV, { to: '/profile', label: 'Profile' }];
  const currentLabel = allNav.find(n => location.pathname.startsWith(n.to))?.label ?? 'Home';
  const handleSignOut = async () => { await signOut(); navigate('/'); };

  // Theme tokens
  const sidebarBg = isDarkMode ? 'rgba(10,10,14,0.94)'   : 'rgba(255,255,255,0.85)';
  const sidebarBd = isDarkMode ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)';
  const headerBg  = isDarkMode ? 'rgba(12,12,16,0.90)'    : 'rgba(255,255,255,0.88)';
  const contentBg = isDarkMode ? '#0C0C10'                : '#F5F4F7';
  const textPri   = isDarkMode ? '#F3F4F6'                : '#111827';
  const textSec   = isDarkMode ? 'rgba(255,255,255,0.42)' : '#9CA3AF';
  const hoverBg   = isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
  const mobileNavBg = isDarkMode ? 'rgba(10,10,14,0.97)'  : 'rgba(255,255,255,0.97)';

  const avatarBox = (size: number, fontSize: number) => (
    <div style={{ width: size, height: size, borderRadius: '50%', background: 'linear-gradient(135deg, #C0203E, #8A101E)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 3px 12px rgba(192,32,62,0.4)' }}>
      <span style={{ color: 'white', fontWeight: 700, fontSize }}>{initials}</span>
    </div>
  );

  return (
    <div style={{ display: 'flex', height: '100dvh', overflow: 'hidden', background: contentBg }}>
      <GlassFilter />

      {/* ── DESKTOP SIDEBAR — only rendered on lg+ ── */}
      {isDesktop && (
        <aside style={{
          width: 240, display: 'flex', flexDirection: 'column', flexShrink: 0,
          background: sidebarBg,
          backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
          borderRight: `1px solid ${sidebarBd}`,
          boxShadow: isDarkMode ? '4px 0 28px rgba(0,0,0,0.45)' : '4px 0 24px rgba(0,0,0,0.05)',
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 20px', height: 60, borderBottom: `1px solid ${sidebarBd}` }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg, #C0203E, #8A101E)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(192,32,62,0.4)' }}>
              <span style={{ color: 'white', fontWeight: 800, fontSize: 15 }}>R</span>
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
                    background: active ? '#C0203E' : 'transparent',
                    color: active ? 'white' : textSec,
                    boxShadow: active ? '0 4px 16px rgba(192,32,62,0.35)' : 'none',
                  }}
                >
                  <Icon size={17} strokeWidth={active ? 2.2 : 1.8} />
                  <span style={{ fontSize: 14, fontWeight: active ? 600 : 400 }}>{label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Bottom: theme + profile + sign out */}
          <div style={{ padding: 10, borderTop: `1px solid ${sidebarBd}` }}>
            <button onClick={toggleDarkMode} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 14px', borderRadius: 12, border: 'none', cursor: 'pointer', background: 'transparent', color: textSec, fontSize: 13, marginBottom: 4, transition: 'all 0.18s', fontFamily: 'inherit' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = hoverBg; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
              {isDarkMode ? <Sun size={15} /> : <Moon size={15} />}
              <span>{isDarkMode ? 'Light mode' : 'Dark mode'}</span>
            </button>

            <button onClick={() => navigate('/profile')} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 12px', borderRadius: 14, border: 'none', cursor: 'pointer', background: location.pathname.startsWith('/profile') ? (isDarkMode ? 'rgba(192,32,62,0.15)' : 'rgba(192,32,62,0.07)') : 'transparent', transition: 'all 0.18s', fontFamily: 'inherit' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = hoverBg; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = location.pathname.startsWith('/profile') ? (isDarkMode ? 'rgba(192,32,62,0.15)' : 'rgba(192,32,62,0.07)') : 'transparent'; }}>
              {avatarBox(32, 12)}
              <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: textPri, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{profile?.full_name ?? 'User'}</p>
                <p style={{ fontSize: 10, color: textSec, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</p>
              </div>
            </button>

            <button onClick={handleSignOut} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 14px', borderRadius: 12, border: 'none', cursor: 'pointer', background: 'transparent', color: '#EF4444', fontSize: 13, marginTop: 4, transition: 'all 0.18s', fontFamily: 'inherit' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.08)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
              <LogOut size={14} /><span>Sign out</span>
            </button>
          </div>
        </aside>
      )}

      {/* ── CONTENT AREA ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Top Header */}
        <header style={{
          display: 'flex', alignItems: 'center', padding: '0 20px', height: 56, flexShrink: 0,
          background: headerBg, backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${sidebarBd}`,
          boxShadow: isDarkMode ? '0 2px 16px rgba(0,0,0,0.3)' : '0 2px 16px rgba(0,0,0,0.04)',
        }}>
          {/* Left: mobile shows logo wordmark, desktop shows page title */}
          {!isDesktop ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, #C0203E, #8A101E)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 3px 8px rgba(192,32,62,0.35)' }}>
                <span style={{ color: 'white', fontWeight: 800, fontSize: 13 }}>R</span>
              </div>
              <span style={{ fontWeight: 700, fontSize: 15, color: textPri, letterSpacing: '-0.02em' }}>Raksh</span>
            </div>
          ) : (
            <h1 style={{ fontSize: 15, fontWeight: 600, color: textPri, margin: 0 }}>{currentLabel}</h1>
          )}

          {/* Right: actions */}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, position: 'relative' }}>
            {/* Dark toggle (mobile only) */}
            {!isDesktop && (
              <button onClick={toggleDarkMode} style={{ width: 36, height: 36, borderRadius: '50%', background: hoverBg, border: `1px solid ${sidebarBd}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: textSec, transition: 'all 0.18s', flexShrink: 0 }}>
                {isDarkMode ? <Sun size={15} /> : <Moon size={15} />}
              </button>
            )}

            {/* Bell */}
            <button onClick={handleBellClick} style={{ width: 36, height: 36, borderRadius: '50%', background: hoverBg, border: `1px solid ${sidebarBd}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: textSec, position: 'relative', transition: 'all 0.18s', flexShrink: 0 }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(192,32,62,0.1)'; (e.currentTarget as HTMLElement).style.color = '#C0203E'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = hoverBg; (e.currentTarget as HTMLElement).style.color = textSec; }}>
              <Bell size={16} />
              {!notifGranted && <span style={{ position: 'absolute', top: 8, right: 8, width: 7, height: 7, borderRadius: '50%', background: '#C0203E', border: `2px solid ${isDarkMode ? '#0C0C10' : 'white'}` }} />}
            </button>

            {/* Notification panel */}
            <AnimatePresence>
              {notifOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -8 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -8 }} transition={{ duration: 0.15 }}
                  style={{ position: 'absolute', top: 46, right: 0, zIndex: 200, width: 280, background: isDarkMode ? 'rgba(20,20,28,0.97)' : 'rgba(255,255,255,0.98)', border: `1px solid ${sidebarBd}`, borderRadius: 16, boxShadow: '0 12px 48px rgba(0,0,0,0.2)', overflow: 'hidden', backdropFilter: 'blur(20px)' }}>
                  <div style={{ padding: '14px 16px', borderBottom: `1px solid ${sidebarBd}` }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: textPri }}>Notifications</p>
                    <p style={{ fontSize: 11, color: textSec, marginTop: 2 }}>Reminders {notifGranted ? '✅ active' : '❌ off'}</p>
                  </div>
                  <div style={{ padding: '12px 16px' }}>
                    <p style={{ fontSize: 12, color: textSec, lineHeight: 1.6 }}>
                      {notifGranted ? "You'll get reminders at your set medicine times." : 'Grant permission to get medicine reminders.'}
                    </p>
                    {!notifGranted && (
                      <button onClick={async () => { const ok = await requestNotificationPermission(); setNotifGranted(ok); if (ok) scheduleAllReminders(); }}
                        style={{ marginTop: 10, width: '100%', padding: 10, borderRadius: 10, background: '#C0203E', color: 'white', fontWeight: 600, fontSize: 13, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                        Enable reminders
                      </button>
                    )}
                    <button onClick={() => { navigate('/medicines'); setNotifOpen(false); }}
                      style={{ marginTop: 8, width: '100%', padding: 10, borderRadius: 10, background: hoverBg, color: textPri, fontWeight: 500, fontSize: 13, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                      View medicines
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Avatar → profile */}
            <button onClick={() => { navigate('/profile'); setNotifOpen(false); }}
              style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.75'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}>
              {isDesktop && <span style={{ fontSize: 13, color: textSec }}>{profile?.full_name}</span>}
              {avatarBox(34, 12)}
            </button>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, overflowY: 'auto', paddingBottom: isDesktop ? 0 : 64 }}>
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

        {/* ── MOBILE BOTTOM NAV — only rendered on non-desktop ── */}
        {!isDesktop && (
          <nav style={{
            position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
            display: 'flex', alignItems: 'stretch', height: 64,
            background: mobileNavBg,
            backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
            borderTop: `1px solid ${sidebarBd}`,
            boxShadow: isDarkMode ? '0 -4px 24px rgba(0,0,0,0.4)' : '0 -4px 24px rgba(0,0,0,0.06)',
          }}>
            {[...NAV, { to: '/profile', icon: User, label: 'Profile' }].map(({ to, icon: Icon, label }) => {
              const active = location.pathname.startsWith(to);
              return (
                <NavLink
                  key={to} to={to}
                  style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}
                >
                  <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                    padding: '6px 16px', borderRadius: 14, transition: 'all 0.18s',
                    background: active ? (isDarkMode ? 'rgba(192,32,62,0.18)' : 'rgba(192,32,62,0.09)') : 'transparent',
                  }}>
                    <Icon size={20} strokeWidth={active ? 2.3 : 1.7} style={{ color: active ? '#C0203E' : textSec }} />
                    <span style={{ fontSize: 10, fontWeight: active ? 700 : 400, color: active ? '#C0203E' : textSec }}>{label}</span>
                  </div>
                </NavLink>
              );
            })}
          </nav>
        )}
      </div>
    </div>
  );
}
