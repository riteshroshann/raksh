import React from 'react';
import { Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';

interface ShellProps {
  overdueDoseCount?: number;
}

export function Shell({ overdueDoseCount = 0 }: ShellProps) {
  return (
    <div className="app-shell">
      <div className="app-content">
        <main className="flex-1 overflow-y-auto no-scrollbar pb-[60px]">
          <Outlet />
        </main>
        <BottomNav overdueDoseCount={overdueDoseCount} />
      </div>
    </div>
  );
}
