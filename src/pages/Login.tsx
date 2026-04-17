import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Github } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'motion/react';

type Step = 'options' | 'otp';

const BRAND_TAGS = ['TRACK', 'LOG', 'PROTECT'];

export default function Login() {
  const navigate = useNavigate();
  const [step, setStep]     = useState<Step>('options');
  const [email, setEmail]   = useState('');
  const [otp, setOtp]       = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState<string | null>(null);

  async function handleGoogle() {
    setLoading(true); setError(null);
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/home` },
    });
    if (err) setError(err.message);
    setLoading(false);
  }

  async function handleGitHub() {
    setLoading(true); setError(null);
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
    setLoading(true); setError(null);
    const { error: err } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: true },
    });
    if (err) { setError(err.message); } else { setStep('otp'); }
    setLoading(false);
  }

  async function handleOtpVerify() {
    const token = otp.join('');
    if (token.length < 6) return;
    setLoading(true); setError(null);
    const { data, error: err } = await supabase.auth.verifyOtp({ email, token, type: 'email' });
    if (err) {
      setError(err.message);
      setOtp(['', '', '', '', '', '']);
    } else if (data.session) {
      const { data: profile } = await supabase.from('profiles').select('id').eq('id', data.session.user.id).single();
      navigate(profile ? '/home' : '/onboarding', { replace: true });
    }
    setLoading(false);
  }

  function handleOtpChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp]; next[index] = value.slice(-1); setOtp(next);
    if (value && index < 5) document.getElementById(`otp-${index + 1}`)?.focus();
    if (index === 5 && value && [...next].join('').length === 6) handleOtpVerify();
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !otp[index] && index > 0)
      document.getElementById(`otp-${index - 1}`)?.focus();
  }

  const inputBase: React.CSSProperties = {
    width: '100%',
    padding: '12px 14px 12px 38px',
    background: '#141414',
    border: '1px solid #252525',
    borderRadius: 10,
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    outline: 'none',
    transition: 'border-color 150ms ease, box-shadow 150ms ease',
  };

  const oauthBtn: React.CSSProperties = {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '13px 16px',
    background: '#161616',
    border: '1px solid #282828',
    borderRadius: 10,
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'border-color 150ms ease, background 150ms ease',
    marginBottom: 12,
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: '#080808', fontFamily: "'DM Sans', sans-serif" }}
    >
      <div
        className="w-full grid gap-3"
        style={{ maxWidth: 780, gridTemplateColumns: '1fr' }}
      >
        {/* Two-panel grid on md+ */}
        <div className="grid md:grid-cols-2 gap-3">

          {/* ── LEFT BRAND PANEL ── */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="hidden md:flex flex-col justify-between p-10 rounded-2xl relative overflow-hidden"
            style={{ background: '#111111', border: '1px solid #1f1f1f', minHeight: 560 }}
          >
            {/* Watermark */}
            <div
              aria-hidden
              style={{
                position: 'absolute', bottom: -12, left: -6,
                fontSize: 130, fontWeight: 900, lineHeight: 1,
                color: 'rgba(255,255,255,0.035)', userSelect: 'none',
                letterSpacing: '-0.04em', pointerEvents: 'none',
              }}
            >
              raksh
            </div>

            {/* Top: logo + tagline */}
            <div>
              <div className="flex items-center gap-2.5" style={{ marginBottom: 52 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: '#C0203E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: 'white', fontWeight: 700, fontSize: 13 }}>R</span>
                </div>
                <span style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 700, fontSize: 13, letterSpacing: '0.1em' }}>RAKSH</span>
              </div>

              <motion.h2
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                style={{ color: 'white', fontSize: 33, fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.025em', margin: 0 }}
              >
                Every reading,
              </motion.h2>
              <motion.h2
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
                style={{ color: 'rgba(255,255,255,0.38)', fontSize: 33, fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.025em', fontStyle: 'italic', margin: 0 }}
              >
                every record.
              </motion.h2>
            </div>

            {/* Bottom: quote + tags */}
            <div>
              <p style={{ color: 'rgba(255,255,255,0.28)', fontSize: 13, lineHeight: 1.75, marginBottom: 28, fontStyle: 'italic' }}>
                "The best health decisions come from good records — built one reading at a time."
              </p>
              <div style={{ display: 'flex', gap: 24 }}>
                {BRAND_TAGS.map(tag => (
                  <span key={tag} style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', fontWeight: 700, letterSpacing: '0.18em' }}>{tag}</span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* ── RIGHT AUTH PANEL ── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="flex flex-col justify-center p-8 md:p-10 rounded-2xl"
            style={{ background: '#0C0C0C', border: '1px solid #1f1f1f', minHeight: 560 }}
          >
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.22em', color: 'rgba(255,255,255,0.28)', marginBottom: 10 }}>
              WELCOME BACK
            </p>
            <h1 style={{ fontSize: 40, fontWeight: 900, color: 'white', letterSpacing: '-0.035em', marginBottom: 28, lineHeight: 1 }}>
              Sign in.
            </h1>

            {/* Error toast */}
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{ marginBottom: 20, padding: '12px 16px', borderRadius: 10, background: 'rgba(192,32,62,0.12)', border: '1px solid rgba(192,32,62,0.35)', color: '#E8657A', fontSize: 13 }}
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {/* ── OPTIONS STEP ── */}
              {step === 'options' && (
                <motion.div
                  key="options"
                  initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.2 }}
                >
                  <button
                    onClick={handleGoogle} disabled={loading} id="login-google"
                    style={oauthBtn}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#383838'; e.currentTarget.style.background = '#1E1E1E'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#282828'; e.currentTarget.style.background = '#161616'; }}
                  >
                    <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                      <path d="M17.64 9.2045c0-.6381-.0573-1.2518-.1636-1.8409H9v3.4814h4.8436c-.2086 1.125-.8427 2.0782-1.7959 2.7164v2.2581h2.9087c1.7018-1.5668 2.6836-3.874 2.6836-6.615z" fill="#4285F4"/>
                      <path d="M9 18c2.43 0 4.4673-.8059 5.9564-2.1805l-2.9087-2.2581c-.8059.54-1.8368.8591-3.0477.8591-2.3441 0-4.3282-1.5832-5.036-3.71H.957v2.3318C2.4382 15.9832 5.4818 18 9 18z" fill="#34A853"/>
                      <path d="M3.964 10.71C3.7841 10.17 3.6818 9.5932 3.6818 9s.1023-1.17.2822-1.71V4.9582H.957C.3477 6.1732 0 7.5477 0 9s.3477 2.8268.957 4.0418L3.964 10.71z" fill="#FBBC05"/>
                      <path d="M9 3.5795c1.3214 0 2.5077.4541 3.4405 1.346l2.5813-2.5814C13.4627.8918 11.4259 0 9 0 5.4818 0 2.4382 2.0168.957 4.9582L3.964 7.29C4.6718 5.1632 6.6559 3.5795 9 3.5795z" fill="#EA4335"/>
                    </svg>
                    Continue with Google
                  </button>

                  <button
                    onClick={handleGitHub} disabled={loading} id="login-github"
                    style={oauthBtn}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#383838'; e.currentTarget.style.background = '#1E1E1E'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#282828'; e.currentTarget.style.background = '#161616'; }}
                  >
                    <Github size={16} style={{ color: 'rgba(255,255,255,0.5)' }} />
                    Continue with GitHub
                  </button>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '4px 0 18px' }}>
                    <div style={{ flex: 1, height: 1, background: '#1E1E1E' }} />
                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.18)' }}>OR EMAIL</span>
                    <div style={{ flex: 1, height: 1, background: '#1E1E1E' }} />
                  </div>

                  <form onSubmit={handleMagicLink} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.28)', marginBottom: 8 }}>EMAIL</label>
                      <div style={{ position: 'relative' }}>
                        <Mail size={13} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.22)', pointerEvents: 'none' }} />
                        <input
                          id="login-email" type="email" autoComplete="email"
                          value={email} onChange={e => setEmail(e.target.value)}
                          placeholder="you@example.com" required
                          style={inputBase}
                          onFocus={e => { e.currentTarget.style.borderColor = '#C0203E'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(192,32,62,0.15)'; }}
                          onBlur={e => { e.currentTarget.style.borderColor = '#252525'; e.currentTarget.style.boxShadow = 'none'; }}
                        />
                      </div>
                    </div>

                    <button
                      type="submit" id="send-magic-link"
                      disabled={loading || !email.trim()}
                      style={{ width: '100%', padding: '14px', borderRadius: 10, background: 'white', color: '#080808', fontWeight: 800, fontSize: 14, letterSpacing: '0.06em', border: 'none', cursor: 'pointer', opacity: loading || !email.trim() ? 0.45 : 1, transition: 'all 150ms ease' }}
                    >
                      {loading ? 'SENDING…' : 'SIGN IN'}
                    </button>
                  </form>

                  <p style={{ fontSize: 12, textAlign: 'center', color: 'rgba(255,255,255,0.18)', marginTop: 18 }}>
                    No account?{' '}
                    <span style={{ color: 'rgba(255,255,255,0.45)', fontWeight: 600, cursor: 'pointer' }}>
                      Sign up free
                    </span>
                  </p>
                </motion.div>
              )}

              {/* ── OTP STEP ── */}
              {step === 'otp' && (
                <motion.div
                  key="otp"
                  initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.25 }}
                  style={{ display: 'flex', flexDirection: 'column' }}
                >
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(192,32,62,0.15)', border: '1px solid rgba(192,32,62,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                    <Mail size={18} style={{ color: '#C0203E' }} />
                  </div>

                  <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', marginBottom: 4 }}>6-digit code sent to</p>
                  <p style={{ fontSize: 15, fontWeight: 700, color: 'white', marginBottom: 32 }}>{email}</p>

                  <div style={{ display: 'flex', gap: 10, marginBottom: 28, justifyContent: 'center' }}>
                    {otp.map((digit, i) => (
                      <input
                        key={i} id={`otp-${i}`} type="text" inputMode="numeric" maxLength={1}
                        value={digit}
                        onChange={e => handleOtpChange(i, e.target.value)}
                        onKeyDown={e => handleOtpKeyDown(i, e)}
                        style={{
                          width: 44, height: 52, textAlign: 'center',
                          fontSize: 20, fontWeight: 700,
                          background: digit ? 'rgba(192,32,62,0.12)' : '#141414',
                          border: `1.5px solid ${digit ? '#C0203E' : '#2A2A2A'}`,
                          borderRadius: 10, color: 'white', outline: 'none',
                          transition: 'border-color 150ms, background 150ms',
                        }}
                      />
                    ))}
                  </div>

                  <button
                    onClick={handleOtpVerify} id="verify-otp"
                    disabled={loading || otp.join('').length < 6}
                    style={{ width: '100%', padding: '14px', borderRadius: 10, background: 'white', color: '#080808', fontWeight: 800, fontSize: 14, letterSpacing: '0.06em', border: 'none', cursor: 'pointer', opacity: loading || otp.join('').length < 6 ? 0.45 : 1 }}
                  >
                    {loading ? 'VERIFYING…' : 'VERIFY & SIGN IN'}
                  </button>

                  <button
                    onClick={() => { setStep('options'); setOtp(['','','','','','']); setError(null); }}
                    style={{ marginTop: 16, fontSize: 13, color: 'rgba(255,255,255,0.3)', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 150ms ease' }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}
                  >
                    ← Use a different email
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
