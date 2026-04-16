import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';
import { Shell } from './components/Shell';

import Landing   from './pages/Landing';
import Login     from './pages/Login';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Vitals    from './pages/Vitals';
import Medicines from './pages/Medicines';
import Vault     from './pages/Vault';
import Profile   from './pages/Profile';

function RequireAuth() {
  const { user, authLoading } = useAppContext();

  if (authLoading) {
    return (
      <div className="app-shell min-h-dvh">
        <div className="app-content flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-[var(--primary)] border-t-transparent animate-spin" />
            <p className="text-sm text-[var(--text-muted)]">Loading…</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (!user.profile) return <Navigate to="/onboarding" replace />;

  return <Outlet />;
}

function RedirectIfAuth() {
  const { user, authLoading } = useAppContext();
  if (authLoading) return null;
  if (user?.profile) return <Navigate to="/home" replace />;
  return <Outlet />;
}

function AppRoutes() {
  return (
    <Routes>
      
      <Route element={<RedirectIfAuth />}>
        <Route path="/"           element={<Landing />} />
        <Route path="/login"      element={<Login />} />
        <Route path="/onboarding" element={<Onboarding />} />
      </Route>

      <Route element={<RequireAuth />}>
        <Route element={<Shell />}>
          <Route path="/home"      element={<Dashboard />} />
          <Route path="/vitals"    element={<Vitals />} />
          <Route path="/medicines" element={<Medicines />} />
          <Route path="/vault"     element={<Vault />} />
          <Route path="/profile"   element={<Profile />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </BrowserRouter>
  );
}
