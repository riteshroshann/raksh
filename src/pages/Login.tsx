import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, ArrowRight, Github } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'motion/react';

type Step = 'options' | 'magic-link' | 'otp';

export default function Login() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('options');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGoogle() {
    setLoading(true);
    setError(null);
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/home` },
    });
    if (err) setError(err.message);
    setLoading(false);
  }

  async function handleGitHub() {
    setLoading(true);
    setError(null);
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: `${window.location.origin}/home` },
    });
    if (err) setError(err.message);
    setLoading(false);
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    const { error: err } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: true },
    });
    if (err) {
      setError(err.message);
    } else {
      setStep('otp');
    }
    setLoading(false);
  }

  async function handleOtpVerify() {
    const token = otp.join('');
    if (token.length < 6) return;
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    });
    if (err) {
      setError(err.message);
      setOtp(['', '', '', '', '', '']);
    } else if (data.session) {
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', data.session.user.id)
        .single();
      navigate(profile ? '/home' : '/onboarding', { replace: true });
    }
    setLoading(false);
  }

  function handleOtpChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
    
    if (index === 5 && value) {
      const full = [...next].join('');
      if (full.length === 6) handleOtpVerify();
    }
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  }

  return (
    <div className="app-shell min-h-screen">
      <div className="app-content bg-white px-5 pt-8 pb-12 flex flex-col">

        <div className="flex items-center mb-10">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <ArrowLeft size={15} /> Back to home
          </Link>
          <span
            className="ml-auto text-lg"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--primary)' }}
          >
            raksh
          </span>
        </div>

        <h1
          className="text-3xl text-[var(--text-primary)] mb-2"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Welcome to raksh
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mb-10">
          Sign in to manage your family's health records
        </p>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-6 px-4 py-3 rounded-xl bg-[var(--danger-light)] border border-red-200 text-sm text-[var(--danger)]"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {step === 'options' && (
            <motion.div
              key="options"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-3"
            >
              
              <button
                onClick={handleGoogle}
                disabled={loading}
                id="login-google"
                className="flex items-center gap-3 w-full px-4 py-3.5 rounded-xl border border-[var(--border-medium)] bg-white hover:bg-[var(--bg-secondary)] transition-colors text-sm font-medium text-[var(--text-primary)] disabled:opacity-50"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M17.64 9.2045c0-.6381-.0573-1.2518-.1636-1.8409H9v3.4814h4.8436c-.2086 1.125-.8427 2.0782-1.7959 2.7164v2.2581h2.9087c1.7018-1.5668 2.6836-3.874 2.6836-6.615z" fill="#4285F4"/>
                  <path d="M9 18c2.43 0 4.4673-.8059 5.9564-2.1805l-2.9087-2.2581c-.8059.54-1.8368.8591-3.0477.8591-2.3441 0-4.3282-1.5832-5.036-3.71H.957v2.3318C2.4382 15.9832 5.4818 18 9 18z" fill="#34A853"/>
                  <path d="M3.964 10.71C3.7841 10.17 3.6818 9.5932 3.6818 9s.1023-1.17.2822-1.71V4.9582H.957C.3477 6.1732 0 7.5477 0 9s.3477 2.8268.957 4.0418L3.964 10.71z" fill="#FBBC05"/>
                  <path d="M9 3.5795c1.3214 0 2.5077.4541 3.4405 1.346l2.5813-2.5814C13.4627.8918 11.4259 0 9 0 5.4818 0 2.4382 2.0168.957 4.9582L3.964 7.29C4.6718 5.1632 6.6559 3.5795 9 3.5795z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>

              <button
                onClick={handleGitHub}
                disabled={loading}
                id="login-github"
                className="flex items-center gap-3 w-full px-4 py-3.5 rounded-xl border border-[var(--border-medium)] bg-white hover:bg-[var(--bg-secondary)] transition-colors text-sm font-medium text-[var(--text-primary)] disabled:opacity-50"
              >
                <Github size={18} />
                Continue with GitHub
              </button>

              <div className="flex items-center gap-4 my-2">
                <div className="flex-1 h-px bg-[var(--border)]" />
                <span className="text-xs text-[var(--text-muted)]">or</span>
                <div className="flex-1 h-px bg-[var(--border)]" />
              </div>

              <form onSubmit={handleMagicLink} className="flex flex-col gap-3">
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-[var(--text-secondary)]">Email address</span>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input
                      id="login-email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--border-medium)] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-30 transition-shadow placeholder:text-[var(--text-muted)]"
                    />
                  </div>
                </label>
                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  id="send-magic-link"
                  className="btn-pill btn-primary w-full px-6 gap-2 disabled:opacity-50"
                >
                  {loading ? 'Sending…' : 'Send magic link'}
                  {!loading && <ArrowRight size={15} className="inline ml-1" />}
                </button>
              </form>

              <p className="text-[11px] text-center text-[var(--text-muted)] mt-2 leading-relaxed">
                By continuing, you agree to our{' '}
                <span className="text-[var(--text-secondary)] underline cursor-pointer">Terms</span>
                {' '}and{' '}
                <span className="text-[var(--text-secondary)] underline cursor-pointer">Privacy Policy</span>
              </p>
            </motion.div>
          )}

          {step === 'otp' && (
            <motion.div
              key="otp"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col items-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-[var(--primary-light)] flex items-center justify-center mb-6">
                <Mail size={22} style={{ color: 'var(--primary)' }} />
              </div>
              <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2 text-center">
                Check your email
              </h2>
              <p className="text-sm text-[var(--text-secondary)] text-center mb-8">
                We sent a 6-digit code to <strong className="text-[var(--text-primary)]">{email}</strong>
              </p>

              <div className="flex gap-3 mb-8">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(i, e)}
                    className="w-11 h-14 text-center text-xl font-semibold rounded-xl border-2 text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                    style={{
                      borderColor: digit ? 'var(--primary)' : 'var(--border-medium)',
                    }}
                  />
                ))}
              </div>

              <button
                onClick={handleOtpVerify}
                disabled={loading || otp.join('').length < 6}
                id="verify-otp"
                className="btn-pill btn-primary w-full px-6 disabled:opacity-50"
              >
                {loading ? 'Verifying…' : 'Verify & Sign In'}
              </button>

              <button
                onClick={() => { setStep('options'); setOtp(['', '', '', '', '', '']); setError(null); }}
                className="mt-4 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                ← Use a different email
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
