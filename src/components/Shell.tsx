import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Home, HeartPulse, Pill, Shield, User } from 'lucide-react';
import { motion, AnimatePresence, LayoutGroup } from 'motion/react';

const NAV_ITEMS = [
  { to: '/home',      icon: Home,      label: 'Home' },
  { to: '/vitals',    icon: HeartPulse, label: 'Vitals' },
  { to: '/medicines', icon: Pill,       label: 'Meds' },
  { to: '/vault',     icon: Shield,     label: 'Vault' },
  { to: '/profile',   icon: User,       label: 'Profile' },
];

function FloatingNav() {
  const location = useLocation();
  return (
    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-[88%] z-30">
      <LayoutGroup>
        <nav className="pill-nav-glass px-4 py-3 flex items-center justify-around relative">
          {NAV_ITEMS.slice(0, 4).map(({ to, icon: Icon, label }) => {
            const isActive = location.pathname.startsWith(to);
            return (
              <NavLink
                key={to}
                to={to}
                className="flex flex-col items-center gap-0.5 relative px-2"
                aria-label={label}
              >
                <motion.div
                  animate={isActive ? { scale: 1.1 } : { scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                >
                  <Icon
                    size={20}
                    strokeWidth={isActive ? 2.2 : 1.8}
                    style={{ color: isActive ? '#C0203E' : 'rgba(0,0,0,0.3)' }}
                  />
                </motion.div>
                <span
                  className="text-[8px] font-bold uppercase tracking-widest"
                  style={{ color: isActive ? '#C0203E' : 'rgba(0,0,0,0.3)' }}
                >
                  {label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="nav-dot"
                    className="absolute -bottom-0.5 w-1 h-1 rounded-full"
                    style={{ background: '#C0203E', boxShadow: '0 0 8px rgba(192,32,62,0.8)' }}
                    transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                  />
                )}
              </NavLink>
            );
          })}
        </nav>
      </LayoutGroup>
    </div>
  );
}

export function Shell() {
  return (
    
    <div className="desktop-stage">

      <div
        className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full pointer-events-none hidden md:block"
        style={{ background: 'rgba(192,32,62,0.04)', filter: 'blur(100px)' }}
      />
      <div
        className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full pointer-events-none hidden md:block"
        style={{ background: 'rgba(192,32,62,0.04)', filter: 'blur(100px)' }}
      />

      <div className="phone-shell relative">

        <main
          className="flex-1 overflow-y-auto no-scrollbar bg-[#FAFAFA]"
          style={{ paddingBottom: 90 }}
        >
          <AnimatePresence mode="wait">
            <Outlet />
          </AnimatePresence>
        </main>

        <FloatingNav />
      </div>
    </div>
  );
}
