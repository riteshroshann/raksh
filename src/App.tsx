import React, { Component, type ReactNode } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';
import { Shell } from './components/Shell';

import Landing    from './pages/Landing';
import Login      from './pages/Login';
import Onboarding from './pages/Onboarding';
import Dashboard  from './pages/Dashboard';
import Vitals     from './pages/Vitals';
import Medicines  from './pages/Medicines';
import Vault      from './pages/Vault';
import Profile    from './pages/Profile';

interface EBProps { children: ReactNode }
interface EBState { error: Error | null }
class ErrorBoundary extends Component<EBProps, EBState> {
  state: EBState = { error: null };
  static getDerivedStateFromError(err: Error): EBState { return { error: err }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: '2rem', fontFamily: 'monospace', maxWidth: 600, margin: '4rem auto' }}>
          <h2 style={{ color: '#C0203E', marginBottom: 12 }}>Something went wrong</h2>
          <pre style={{ background: '#FEF2F2', padding: '1rem', borderRadius: 8, overflow: 'auto', fontSize: 13, color: '#7F1D1D' }}>
            {this.state.error.message}
            {'\n\n'}
            {this.state.error.stack}
          </pre>
          <button
            onClick={() => window.location.href = '/'}
            style={{ marginTop: 16, padding: '8px 16px', background: '#C0203E', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer' }}
          >
            Go home
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function RequireAuth() {
  const { user, authLoading } = useAppContext();

  if (authLoading) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAFAFA' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid #C0203E', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
          <p style={{ fontSize: 14, color: '#9CA3AF', fontFamily: 'sans-serif' }}>Loading…</p>
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
          <Route path="/home"      element={<ErrorBoundary><Dashboard /></ErrorBoundary>} />
          <Route path="/vitals"    element={<ErrorBoundary><Vitals /></ErrorBoundary>} />
          <Route path="/medicines" element={<ErrorBoundary><Medicines /></ErrorBoundary>} />
          <Route path="/vault"     element={<ErrorBoundary><Vault /></ErrorBoundary>} />
          <Route path="/profile"   element={<ErrorBoundary><Profile /></ErrorBoundary>} />
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
        <ErrorBoundary>
          <AppRoutes />
        </ErrorBoundary>
      </AppProvider>
    </BrowserRouter>
  );
}
