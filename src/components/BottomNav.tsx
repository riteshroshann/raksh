import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, TrendingUp, Pill, Lock, User } from 'lucide-react';
import { motion } from 'motion/react';

interface NavItem {
  to: string;
  icon: React.ElementType;
  label: string;
  badgeKey?: string;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/home',      icon: Home,       label: 'Home' },
  { to: '/vitals',    icon: TrendingUp, label: 'Vitals' },
  { to: '/medicines', icon: Pill,       label: 'Medicines' },
  { to: '/vault',     icon: Lock,       label: 'Vault' },
  { to: '/profile',   icon: User,       label: 'Profile' },
];

interface BottomNavProps {
  
  overdueDoseCount?: number;
}

export function BottomNav({ overdueDoseCount = 0 }: BottomNavProps) {
  const location = useLocation();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-[var(--border)]"
      style={{
        height: 60,
        maxWidth: 390,
        margin: '0 auto',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
      aria-label="Primary navigation"
    >
      <div className="flex items-center justify-around h-full px-2">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname.startsWith(to);
          const isOverdue = to === '/medicines' && overdueDoseCount > 0;

          return (
            <NavLink
              key={to}
              to={to}
              className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full relative"
              aria-label={label}
            >
              <div className="relative">
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.2 : 1.8}
                  style={{ color: isActive ? 'var(--primary)' : 'var(--text-muted)' }}
                />
                {isOverdue && (
                  <span className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-[var(--primary)] border-2 border-white" />
                )}
              </div>
              <span
                className="text-[10px] font-medium leading-none"
                style={{ color: isActive ? 'var(--primary)' : 'var(--text-muted)' }}
              >
                {label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute top-0 inset-x-3 h-0.5 rounded-full bg-[var(--primary)]"
                  transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                />
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
