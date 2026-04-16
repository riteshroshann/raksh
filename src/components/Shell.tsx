import React from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Home, HeartPulse, Pill, Shield, User, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../context/AppContext';

const NAV = [
  { to: '/home',      icon: Home,       label: 'Home' },
  { to: '/vitals',    icon: HeartPulse, label: 'Vitals' },
  { to: '/medicines', icon: Pill,        label: 'Medicines' },
  { to: '/vault',     icon: Shield,      label: 'Vault' },
  { to: '/profile',   icon: User,        label: 'Profile' },
];

export function Shell() {
  const { user, signOut } = useAppContext();
  const location = useLocation();
  const navigate = useNavigate();

  const profile  = user?.profile;
  const initials = profile?.full_name?.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase() ?? 'R';
  const currentLabel = NAV.find(n => location.pathname.startsWith(n.to))?.label ?? 'Dashboard';

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="flex h-dvh overflow-hidden bg-[#F7F7F8]">

      <aside className="hidden lg:flex w-64 flex-col bg-white border-r border-black/[0.05] flex-shrink-0">
        <div className="flex items-center gap-3 px-6 h-16 border-b border-black/[0.04]">
          <div className="w-8 h-8 rounded-xl bg-[#C0203E] flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-sm">R</span>
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm leading-none">Raksh</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Health Manager</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
          {NAV.map(({ to, icon: Icon, label }) => {
            const active = location.pathname.startsWith(to);
            return (
              <NavLink
                key={to}
                to={to}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-[#C0203E] text-white shadow-sm shadow-[#C0203E]/30'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                }`}
              >
                <Icon size={17} strokeWidth={active ? 2.2 : 1.8} />
                {label}
              </NavLink>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-black/[0.04]">
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-[#C0203E] flex items-center justify-center flex-shrink-0 shadow-sm">
              <span className="text-white text-xs font-semibold">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{profile?.full_name ?? 'User'}</p>
              <p className="text-[11px] text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="mt-1 flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] text-red-500 hover:bg-red-50 transition-colors w-full"
          >
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center px-5 lg:px-8 h-14 lg:h-16 bg-white border-b border-black/[0.05] flex-shrink-0">
          <div className="flex items-center gap-2.5 lg:hidden">
            <div className="w-7 h-7 rounded-lg bg-[#C0203E] flex items-center justify-center">
              <span className="text-white font-bold text-xs">R</span>
            </div>
            <span className="font-semibold text-gray-900 text-sm">Raksh</span>
          </div>
          <h1 className="hidden lg:block text-base font-semibold text-gray-900">{currentLabel}</h1>
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden lg:block text-sm text-gray-500">{profile?.full_name}</span>
            <div className="w-8 h-8 rounded-full bg-[#C0203E] flex items-center justify-center shadow-sm">
              <span className="text-white text-xs font-semibold">{initials}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto pb-16 lg:pb-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="min-h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>

        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-black/[0.05] flex z-50">
          {NAV.map(({ to, icon: Icon, label }) => {
            const active = location.pathname.startsWith(to);
            return (
              <NavLink
                key={to}
                to={to}
                className="flex-1 flex flex-col items-center py-2.5 gap-0.5"
              >
                <Icon
                  size={20}
                  strokeWidth={active ? 2.2 : 1.8}
                  style={{ color: active ? '#C0203E' : '#9CA3AF' }}
                />
                <span
                  className="text-[9px] font-bold uppercase tracking-wider"
                  style={{ color: active ? '#C0203E' : '#9CA3AF' }}
                >
                  {label}
                </span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
