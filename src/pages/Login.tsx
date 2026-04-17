import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Github, Moon, Sun, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'motion/react';

type Step = 'options' | 'otp' | 'forgot' | 'forgot-sent';

const BRAND_TAGS = ['TRACK', 'LOG', 'PROTECT'];

export default function Login() {
  const navigate = useNavigate();
  const [step, setStep]     = useState<Step>('options');
  const [email, setEmail]   = useState('');
  const [otp, setOtp]       = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState<string | null>(null);
  const [dark, setDark] = useState(() => {
    try { return localStorage.getItem('raksh-dark-mode') === 'true'; } catch { return false; }
  });

  function toggleDark() {
    const next = !dark;
    setDark(next);
    try {
      localStorage.setItem('raksh-dark-mode', String(next));
      document.documentElement.classList.toggle('dark', next);
    } catch {}
  }

  // Theme tokens
  const pageBg   = dark ? '#080808' : '#F7F8FA';
  const leftBg   = dark ? '#111111' : '#FFF0F3';
  const rightBg  = dark ? '#0C0C0C' : '#FFFFFF';
  const cardBd   = dark ? '#1f1f1f' : 'rgba(0,0,0,0.07)';
  const textPri  = dark ? '#FFFFFF' : '#111827';
  const textSec  = dark ? 'rgba(255,255,255,0.38)' : '#9CA3AF';
  const textFade = dark ? 'rgba(255,255,255,0.28)' : '#6B7280';
  const inputBg  = dark ? '#141414' : '#F9FAFB';
  const inputBd  = dark ? '#252525' : '#E5E7EB';
  const oauthBg  = dark ? '#161616' : '#FFFFFF';
  const oauthBd  = dark ? '#282828' : '#E5E7EB';

  async function handleGoogle() {
    setLoading(true); setError(null);
    const { error: err } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/home` } });
    if (err) setError(err.message);
    setLoading(false);
  }

  async function handleGitHub() {
    setLoading(true); setError(null);
    const { error: err } = await supabase.auth.signInWithOAuth({ provider: 'github', options: { redirectTo: `${window.location.origin}/home` } });
    if (err) setError(err.message);
    setLoading(false);
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true); setError(null);
    const { error: err } = await supabase.auth.signInWithOtp({ email: email.trim(), options: { shouldCreateUser: true } });
    if (err) { setError(err.message); } else { setStep('otp'); }
    setLoading(false);
  }

  async function handleOtpVerify() {
    const token = otp.join('');
    if (token.length < 6) return;
    setLoading(true); setError(null);
    const { data, error: err } = await supabase.auth.verifyOtp({ email, token, type: 'email' });
    if (err) { setError(err.message); setOtp(['','','','','','']); }
    else if (data.session) {
      const { data: profile } = await supabase.from('profiles').select('id').eq('id', data.session.user.id).single();
      navigate(profile ? '/home' : '/onboarding', { replace: true });
    }
    setLoading(false);
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true); setError(null);
    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/login`,
    });
    if (err) { setError(err.message); }
    else { setStep('forgot-sent'); }
    setLoading(false);
  }

  function handleOtpChange(i: number, value: string) {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp]; next[i] = value.slice(-1); setOtp(next);
    if (value && i < 5) document.getElementById(`otp-${i + 1}`)?.focus();
    if (i === 5 && value && [...next].join('').length === 6) handleOtpVerify();
  }

  function handleOtpKeyDown(i: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !otp[i] && i > 0) document.getElementById(`otp-${i - 1}`)?.focus();
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: pageBg, fontFamily: "'DM Sans', sans-serif", transition: 'background 0.25s' }}
    >
      {/* Theme toggle */}
      <button
        onClick={toggleDark}
        style={{ position: 'fixed', top: 16, right: 16, width: 36, height: 36, borderRadius: '50%', background: dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: dark ? '#F1F1F1' : '#6B7280', zIndex: 10, transition: 'all 0.2s' }}
        title={dark ? 'Light mode' : 'Dark mode'}
      >
        {dark ? <Sun size={16} /> : <Moon size={16} />}
      </button>

      {/* Back button */}
      <button
        onClick={() => navigate('/')}
        style={{ position: 'fixed', top: 16, left: 16, width: 36, height: 36, borderRadius: '50%', background: dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: dark ? '#F1F1F1' : '#6B7280', zIndex: 10, transition: 'all 0.2s' }}
        title="Back to home"
      >
        <ArrowLeft size={16} />
      </button>

      <div className="w-full grid gap-3 md:grid-cols-2" style={{ maxWidth: 780 }}>

        {/* ── LEFT BRAND PANEL ── */}
        <motion.div
          initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35 }}
          className="hidden md:flex flex-col justify-between p-10 rounded-2xl relative overflow-hidden"
          style={{ background: leftBg, border: `1px solid ${cardBd}`, minHeight: 560, transition: 'background 0.25s, border-color 0.25s' }}
        >
          {/* Watermark */}
          <div aria-hidden style={{ position: 'absolute', bottom: -12, left: -6, fontSize: 130, fontWeight: 900, lineHeight: 1, color: dark ? 'rgba(255,255,255,0.035)' : 'rgba(192,32,62,0.06)', userSelect: 'none', letterSpacing: '-0.04em', pointerEvents: 'none' }}>
            raksh
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 52 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: '#C0203E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: 'white', fontWeight: 700, fontSize: 13 }}>R</span>
              </div>
              <span style={{ color: textPri, fontWeight: 700, fontSize: 13, letterSpacing: '0.1em' }}>RAKSH</span>
            </div>

            <h2 style={{ color: textPri, fontSize: 33, fontWeight: 800, lineHeight: 1.14, letterSpacing: '-0.025em', margin: 0 }}>
              Every reading,
            </h2>
            <h2 style={{ color: dark ? 'rgba(255,255,255,0.38)' : '#C0203E', fontSize: 33, fontWeight: 800, lineHeight: 1.14, letterSpacing: '-0.025em', fontStyle: 'italic', margin: 0 }}>
              every record.
            </h2>
          </div>

          <div>
            <p style={{ color: dark ? 'rgba(255,255,255,0.3)' : '#6B7280', fontSize: 13, lineHeight: 1.75, marginBottom: 28, fontStyle: 'italic' }}>
              "The best health decisions come from good records — built one reading at a time."
            </p>
            <div style={{ display: 'flex', gap: 24 }}>
              {BRAND_TAGS.map(tag => (
                <span key={tag} style={{ fontSize: 10, color: dark ? 'rgba(255,255,255,0.25)' : 'rgba(192,32,62,0.5)', fontWeight: 700, letterSpacing: '0.18em' }}>{tag}</span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── RIGHT AUTH PANEL ── */}
        <motion.div
          initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35 }}
          className="flex flex-col justify-center p-8 md:p-10 rounded-2xl"
          style={{ background: rightBg, border: `1px solid ${cardBd}`, minHeight: 560, boxShadow: dark ? 'none' : '0 4px 24px rgba(0,0,0,0.06)', transition: 'background 0.25s' }}
        >
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.22em', color: textFade, marginBottom: 10 }}>WELCOME BACK</p>
          <h1 style={{ fontSize: 38, fontWeight: 900, color: textPri, letterSpacing: '-0.035em', marginBottom: 28, lineHeight: 1 }}>Sign in.</h1>

          <AnimatePresence>
            {error && (
              <motion.p initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ marginBottom: 18, padding: '12px 16px', borderRadius: 10, background: 'rgba(192,32,62,0.08)', border: '1px solid rgba(192,32,62,0.25)', color: '#C0203E', fontSize: 13 }}>
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {step === 'options' && (
              <motion.div key="options" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.18 }}>
                {/* Google */}
                <button onClick={handleGoogle} disabled={loading} id="login-google"
                  className="w-full flex items-center gap-3 py-3.5 px-4 rounded-xl mb-3 text-sm font-medium transition-all disabled:opacity-50"
                  style={{ background: oauthBg, border: `1px solid ${oauthBd}`, color: textPri, cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = dark ? '#1E1E1E' : '#F9FAFB'}
                  onMouseLeave={e => e.currentTarget.style.background = oauthBg}
                >
                  <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                    <path d="M17.64 9.2045c0-.6381-.0573-1.2518-.1636-1.8409H9v3.4814h4.8436c-.2086 1.125-.8427 2.0782-1.7959 2.7164v2.2581h2.9087c1.7018-1.5668 2.6836-3.874 2.6836-6.615z" fill="#4285F4"/>
                    <path d="M9 18c2.43 0 4.4673-.8059 5.9564-2.1805l-2.9087-2.2581c-.8059.54-1.8368.8591-3.0477.8591-2.3441 0-4.3282-1.5832-5.036-3.71H.957v2.3318C2.4382 15.9832 5.4818 18 9 18z" fill="#34A853"/>
                    <path d="M3.964 10.71C3.7841 10.17 3.6818 9.5932 3.6818 9s.1023-1.17.2822-1.71V4.9582H.957C.3477 6.1732 0 7.5477 0 9s.3477 2.8268.957 4.0418L3.964 10.71z" fill="#FBBC05"/>
                    <path d="M9 3.5795c1.3214 0 2.5077.4541 3.4405 1.346l2.5813-2.5814C13.4627.8918 11.4259 0 9 0 5.4818 0 2.4382 2.0168.957 4.9582L3.964 7.29C4.6718 5.1632 6.6559 3.5795 9 3.5795z" fill="#EA4335"/>
                  </svg>
                  Continue with Google
                </button>

                {/* GitHub */}
                <button onClick={handleGitHub} disabled={loading} id="login-github"
                  className="w-full flex items-center gap-3 py-3.5 px-4 rounded-xl mb-5 text-sm font-medium transition-all disabled:opacity-50"
                  style={{ background: oauthBg, border: `1px solid ${oauthBd}`, color: textPri, cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = dark ? '#1E1E1E' : '#F9FAFB'}
                  onMouseLeave={e => e.currentTarget.style.background = oauthBg}
                >
                  <Github size={16} style={{ color: dark ? 'rgba(255,255,255,0.5)' : '#374151' }} />
                  Continue with GitHub
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                  <div style={{ flex: 1, height: 1, background: dark ? '#1E1E1E' : '#F3F4F6' }} />
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', color: textSec }}>OR EMAIL</span>
                  <div style={{ flex: 1, height: 1, background: dark ? '#1E1E1E' : '#F3F4F6' }} />
                </div>

                <form onSubmit={handleMagicLink} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', color: textFade, marginBottom: 7 }}>EMAIL</label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={13} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: textSec, pointerEvents: 'none' }} />
                      <input
                        id="login-email" type="email" autoComplete="email"
                        value={email} onChange={e => setEmail(e.target.value)}
                        placeholder="you@example.com" required
                        style={{ width: '100%', padding: '12px 14px 12px 36px', background: inputBg, border: `1px solid ${inputBd}`, borderRadius: 10, color: textPri, fontSize: 14, outline: 'none', transition: 'border-color 150ms', boxSizing: 'border-box' }}
                        onFocus={e => { e.currentTarget.style.borderColor = '#C0203E'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(192,32,62,0.12)'; }}
                        onBlur={e => { e.currentTarget.style.borderColor = inputBd; e.currentTarget.style.boxShadow = 'none'; }}
                      />
                    </div>
                  </div>
                  <button
                    type="submit" id="send-magic-link" disabled={loading || !email.trim()}
                    style={{ width: '100%', padding: '14px', borderRadius: 10, background: '#C0203E', color: 'white', fontWeight: 700, fontSize: 14, letterSpacing: '0.05em', border: 'none', cursor: 'pointer', opacity: loading || !email.trim() ? 0.5 : 1, boxShadow: '0 4px 16px rgba(192,32,62,0.3)', fontFamily: 'inherit' }}
                  >
                    {loading ? 'SENDING…' : 'SIGN IN'}
                  </button>
                  {/* Forgot password */}
                  <button
                    type="button"
                    onClick={() => { setError(null); setStep('forgot'); }}
                    style={{ background: 'none', border: 'none', color: textSec, fontSize: 12, cursor: 'pointer', textAlign: 'center', marginTop: 2, fontFamily: 'inherit' }}
                  >
                    Forgot password?
                  </button>
                </form>

                <p style={{ fontSize: 12, textAlign: 'center', color: textSec, marginTop: 18 }}>
                  New here?&nbsp;
                  <span style={{ color: '#C0203E', fontWeight: 600, cursor: 'pointer' }}>Sign up free</span>
                </p>
              </motion.div>
            )}

            {step === 'otp' && (
              <motion.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.22 }} style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(192,32,62,0.1)', border: '1px solid rgba(192,32,62,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                  <Mail size={18} style={{ color: '#C0203E' }} />
                </div>
                <p style={{ fontSize: 14, color: textSec, marginBottom: 4 }}>6-digit code sent to</p>
                <p style={{ fontSize: 15, fontWeight: 700, color: textPri, marginBottom: 32 }}>{email}</p>

                <div style={{ display: 'flex', gap: 10, marginBottom: 28, justifyContent: 'center' }}>
                  {otp.map((digit, i) => (
                    <input key={i} id={`otp-${i}`} type="text" inputMode="numeric" maxLength={1} value={digit}
                      onChange={e => handleOtpChange(i, e.target.value)}
                      onKeyDown={e => handleOtpKeyDown(i, e)}
                      style={{ width: 44, height: 52, textAlign: 'center', fontSize: 20, fontWeight: 700, background: digit ? 'rgba(192,32,62,0.1)' : inputBg, border: `1.5px solid ${digit ? '#C0203E' : inputBd}`, borderRadius: 10, color: textPri, outline: 'none' }}
                    />
                  ))}
                </div>

                <button onClick={handleOtpVerify} id="verify-otp" disabled={loading || otp.join('').length < 6}
                  style={{ width: '100%', padding: '14px', borderRadius: 10, background: '#C0203E', color: 'white', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer', opacity: loading || otp.join('').length < 6 ? 0.45 : 1, boxShadow: '0 4px 16px rgba(192,32,62,0.3)', fontFamily: 'inherit' }}
                >
                  {loading ? 'VERIFYING…' : 'VERIFY & SIGN IN'}
                </button>

                <button onClick={() => { setStep('options'); setOtp(['','','','','']); setError(null); }}
                  style={{ marginTop: 16, fontSize: 13, color: textSec, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  ← Use a different email
                </button>
              </motion.div>
            )}

            {/* ── FORGOT PASSWORD ── */}
            {step === 'forgot' && (
              <motion.div key="forgot" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.22 }} style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(192,32,62,0.1)', border: '1px solid rgba(192,32,62,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                  <Mail size={18} style={{ color: '#C0203E' }} />
                </div>
                <p style={{ fontSize: 22, fontWeight: 800, color: textPri, marginBottom: 6, letterSpacing: '-0.02em' }}>Reset password</p>
                <p style={{ fontSize: 13, color: textSec, marginBottom: 28, lineHeight: 1.6 }}>Enter your email and we'll send a reset link straight away.</p>

                <form onSubmit={handleForgotPassword} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ position: 'relative' }}>
                    <Mail size={13} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: textSec, pointerEvents: 'none' }} />
                    <input
                      type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com" required
                      style={{ width: '100%', padding: '12px 14px 12px 36px', background: inputBg, border: `1px solid ${inputBd}`, borderRadius: 10, color: textPri, fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                      onFocus={e => { e.currentTarget.style.borderColor = '#C0203E'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(192,32,62,0.12)'; }}
                      onBlur={e => { e.currentTarget.style.borderColor = inputBd; e.currentTarget.style.boxShadow = 'none'; }}
                    />
                  </div>
                  <button type="submit" disabled={loading || !email.trim()}
                    style={{ width: '100%', padding: '14px', borderRadius: 10, background: '#C0203E', color: 'white', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer', opacity: loading || !email.trim() ? 0.5 : 1, boxShadow: '0 4px 16px rgba(192,32,62,0.3)', fontFamily: 'inherit' }}
                  >
                    {loading ? 'SENDING…' : 'SEND RESET LINK'}
                  </button>
                </form>

                <button onClick={() => { setStep('options'); setError(null); }}
                  style={{ marginTop: 16, fontSize: 13, color: textSec, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  ← Back to sign in
                </button>
              </motion.div>
            )}

            {/* ── FORGOT SENT CONFIRMATION ── */}
            {step === 'forgot-sent' && (
              <motion.div key="forgot-sent" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', paddingTop: 32 }}>
                <div style={{ width: 56, height: 56, borderRadius: 18, background: 'rgba(21,128,61,0.12)', border: '1px solid rgba(21,128,61,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                  <span style={{ fontSize: 24 }}>✉️</span>
                </div>
                <p style={{ fontSize: 18, fontWeight: 800, color: textPri, marginBottom: 8, letterSpacing: '-0.02em' }}>Check your inbox</p>
                <p style={{ fontSize: 13, color: textSec, lineHeight: 1.7, marginBottom: 32 }}>We sent a reset link to <strong style={{ color: textPri }}>{email}</strong>. It may take a minute to arrive.</p>
                <button onClick={() => { setStep('options'); setError(null); }}
                  style={{ fontSize: 13, color: '#C0203E', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  ← Back to sign in
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
