import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, HeartPulse, Pill, FileText, Moon, Sun } from 'lucide-react';
import { motion } from 'motion/react';

const MARQUEE = [
  'Blood Sugar', '✦', 'Blood Pressure', '✦', 'Heart Rate', '✦',
  'Medicines', '✦', 'Lab Reports', '✦', 'Family Care', '✦',
  'Diabetes', '✦', 'Thyroid', '✦', 'SpO2', '✦', 'Hypertension', '✦',
];

const FEATURES = [
  { icon: HeartPulse, label: 'Vitals Tracking', desc: 'Log fasting sugar, blood pressure, heart rate — every reading in one place, charted over time.' },
  { icon: Pill,       label: 'Medicine Schedule', desc: 'Set custom reminder times for each dose — morning, afternoon, evening, or night. Never miss one.' },
  { icon: FileText,   label: 'Health Records', desc: 'Upload reports, prescriptions, and lab results — organised by condition and family member.' },
];

export default function Landing() {
  const [email, setEmail]         = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [dark, setDark] = useState(() => {
    try { return localStorage.getItem('raksh-dark-mode') === 'true'; } catch { return false; }
  });

  useEffect(() => {
    try {
      localStorage.setItem('raksh-dark-mode', String(dark));
      document.documentElement.classList.toggle('dark', dark);
    } catch {}
  }, [dark]);

  const bg     = dark ? '#0C0C0C' : '#FFFFFF';
  const text   = dark ? '#F1F1F1' : '#111827';
  const muted  = dark ? 'rgba(255,255,255,0.42)' : '#6B7280';
  const border = dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
  const cardBg = dark ? 'rgba(255,255,255,0.03)' : '#FAFAFA';
  const navBg  = dark ? 'rgba(12,12,12,0.9)' : 'rgba(255,255,255,0.9)';
  const inputBg = dark ? 'rgba(255,255,255,0.04)' : '#F9FAFB';
  const inputBd = dark ? 'rgba(255,255,255,0.1)' : '#E5E7EB';

  async function handleWaitlist(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    try {
      await fetch('https://formspree.io/f/mrerpaoz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email }),
      });
    } catch { /* silently handle */ }
    setSubmitted(true);
    setSubmitting(false);
  }

  const fullMarquee = [...MARQUEE, ...MARQUEE];

  return (
    <div style={{ background: bg, minHeight: '100vh', color: text, fontFamily: "'DM Sans', sans-serif", overflowX: 'hidden', transition: 'background 0.25s, color 0.25s' }}>

      {/* ── NAV ── */}
      <nav style={{ position: 'fixed', top: 0, insetInline: 0, zIndex: 50, height: 58, display: 'flex', alignItems: 'center', padding: '0 24px', background: navBg, backdropFilter: 'blur(20px)', borderBottom: `1px solid ${border}`, transition: 'background 0.25s' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: '#C0203E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'white', fontWeight: 700, fontSize: 13 }}>R</span>
          </div>
          <span style={{ fontWeight: 700, fontSize: 15, color: text }}>raksh</span>
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Dark mode toggle */}
          <button
            onClick={() => setDark(d => !d)}
            style={{ width: 36, height: 36, borderRadius: '50%', background: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: muted, transition: 'all 0.2s' }}
            title={dark ? 'Light mode' : 'Dark mode'}
          >
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <Link
            to="/login"
            style={{ padding: '8px 20px', borderRadius: 999, background: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)', border: `1px solid ${border}`, color: text, fontSize: 13, fontWeight: 600, textDecoration: 'none', letterSpacing: '0.04em' }}
          >
            Sign in
          </Link>
        </div>
      </nav>

      {/* Subtle grid */}
      {dark && <div aria-hidden style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', backgroundSize: '60px 60px', backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.022) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.022) 1px, transparent 1px)', maskImage: 'radial-gradient(ellipse at 50% 40%, black 20%, transparent 80%)' }} />}

      {/* Aurora (dark only) */}
      {dark && <div aria-hidden style={{ position: 'fixed', top: '34%', left: '50%', transform: 'translate(-50%,-50%)', width: '55vw', height: '38vw', background: 'radial-gradient(circle, rgba(192,32,62,0.1) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none', zIndex: 0, animation: 'aurora-breathe 9s ease-in-out infinite alternate' }} />}

      {/* Light mode subtle gradient */}
      {!dark && <div aria-hidden style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '50vh', background: 'linear-gradient(170deg, #FFF0F3 0%, #FFF5F7 25%, #FFFFFF 55%)', pointerEvents: 'none', zIndex: 0 }} />}

      {/* ── HERO ── */}
      <section style={{ position: 'relative', zIndex: 1, padding: '140px 24px 80px', maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>

        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 999, background: 'rgba(192,32,62,0.1)', border: '1px solid rgba(192,32,62,0.22)', marginBottom: 32 }}
        >
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#C0203E', boxShadow: '0 0 6px rgba(192,32,62,0.5)' }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: dark ? 'rgba(255,255,255,0.65)' : '#C0203E', letterSpacing: '0.05em' }}>Now in early access</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
          style={{ fontSize: 'clamp(46px, 8vw, 78px)', fontWeight: 900, lineHeight: 1.06, letterSpacing: '-0.04em', marginBottom: 24, color: text }}
        >
          Your family's health.
          <br />
          <span style={{ color: dark ? 'rgba(255,255,255,0.3)' : '#C0203E', fontStyle: 'italic' }}>Finally organised.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.26 }}
          style={{ fontSize: 17, color: muted, lineHeight: 1.7, maxWidth: 500, margin: '0 auto 44px' }}
        >
          Track vitals, manage medicines, and store health records for your whole family — from one calm, private app.
        </motion.p>

        {/* ── PRIMARY CTA BUTTONS ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }}
          style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 40 }}
        >
          <Link
            to="/login"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '15px 32px', borderRadius: 999, background: '#C0203E', color: 'white', fontWeight: 700, fontSize: 16, textDecoration: 'none', boxShadow: '0 6px 24px rgba(192,32,62,0.35)', letterSpacing: '0.01em', transition: 'all 0.2s' }}
          >
            Start tracking for free <ArrowRight size={17} />
          </Link>
          <Link
            to="/login"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '15px 28px', borderRadius: 999, background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', border: `1px solid ${border}`, color: text, fontWeight: 600, fontSize: 15, textDecoration: 'none' }}
          >
            Sign in to your account
          </Link>
        </motion.div>

        {/* ── WAITLIST FORM (Formspree) ── */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <p style={{ fontSize: 13, color: muted, marginBottom: 12 }}>Or join the early access waitlist:</p>
          {submitted ? (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '12px 24px', borderRadius: 12, background: 'rgba(21,128,61,0.1)', border: '1px solid rgba(21,128,61,0.25)', color: '#16A34A', fontWeight: 600, fontSize: 14 }}>
              ✓ &ensp;You're on the waitlist!
            </div>
          ) : (
            <form onSubmit={handleWaitlist} style={{ display: 'flex', gap: 10, maxWidth: 420, margin: '0 auto', flexWrap: 'wrap', justifyContent: 'center' }}>
              <input
                type="email" name="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com" required
                className="placeholder-[#9CA3AF] dark:placeholder-[#6B7280]"
                style={{ flex: '1 1 190px', padding: '12px 16px', borderRadius: 10, background: inputBg, border: `1px solid ${inputBd}`, color: text, fontSize: 14, outline: 'none' }}
                onFocus={e => { e.currentTarget.style.borderColor = '#C0203E'; }}
                onBlur={e => { e.currentTarget.style.borderColor = inputBd; }}
              />
              <button
                type="submit" disabled={submitting}
                style={{ padding: '12px 20px', borderRadius: 10, background: dark ? 'rgba(255,255,255,0.1)' : '#111827', color: dark ? 'white' : 'white', fontWeight: 600, fontSize: 14, border: 'none', cursor: 'pointer', opacity: submitting ? 0.6 : 1 }}
              >
                {submitting ? '…' : 'Notify me'}
              </button>
            </form>
          )}
        </motion.div>
      </section>

      {/* ── MARQUEE BAND ── */}
      <div style={{ position: 'relative', zIndex: 1, overflow: 'hidden', borderTop: `1px solid ${border}`, borderBottom: `1px solid ${border}`, padding: '14px 0', marginBottom: 80, transform: 'rotate(-1.2deg) scaleX(1.08)', background: dark ? 'rgba(255,255,255,0.015)' : 'rgba(0,0,0,0.015)' }}>
        <div style={{ display: 'flex', width: 'max-content', animation: 'scroll-marquee 32s linear infinite' }}>
          {fullMarquee.map((item, i) => (
            <span key={i} style={{ padding: '0 18px', fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: item === '✦' ? '#C0203E' : muted, whiteSpace: 'nowrap' }}>
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ── FEATURES ── */}
      <section style={{ position: 'relative', zIndex: 1, maxWidth: 900, margin: '0 auto', padding: '0 24px 100px' }}>
        <motion.h2
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          style={{ textAlign: 'center', fontSize: 'clamp(28px, 5vw, 46px)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 48, lineHeight: 1.1, color: text }}
        >
          Everything your family needs.
        </motion.h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {FEATURES.map(({ icon: Icon, label, desc }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }}
              style={{ padding: '28px 24px', borderRadius: 20, background: cardBg, border: `1px solid ${border}`, backdropFilter: dark ? 'blur(8px)' : 'none', transition: 'background 0.25s' }}
            >
              <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(192,32,62,0.1)', border: '1px solid rgba(192,32,62,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                <Icon size={18} style={{ color: '#C0203E' }} />
              </div>
              <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 10, color: text }}>{label}</p>
              <p style={{ fontSize: 14, color: muted, lineHeight: 1.68 }}>{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA SECTION ── */}
      <section style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '80px 24px 110px', borderTop: `1px solid ${border}`, overflow: 'hidden' }}>
        <div aria-hidden style={{ position: 'absolute', bottom: -30, left: '50%', transform: 'translateX(-50%)', fontSize: '26vw', fontWeight: 900, letterSpacing: '-0.05em', color: 'transparent', WebkitTextStroke: `1px ${dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}`, userSelect: 'none', pointerEvents: 'none', lineHeight: 0.75, whiteSpace: 'nowrap' }}>
          raksh
        </div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          style={{ fontSize: 'clamp(38px, 7vw, 72px)', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: 36, lineHeight: 1.05, color: text }}
        >
          Ready to begin?
        </motion.h2>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
          <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '16px 32px', borderRadius: 999, background: '#C0203E', color: 'white', fontWeight: 700, fontSize: 16, textDecoration: 'none', boxShadow: '0 8px 32px rgba(192,32,62,0.38)' }}>
            Start for free <ArrowRight size={16} />
          </Link>
        </div>
        <p style={{ marginTop: 20, fontSize: 12, color: muted, letterSpacing: '0.05em' }}>No credit card · Private by design · Built in India</p>
      </section>

      {/* ── FOOTER ── */}
      <div style={{ position: 'relative', zIndex: 2, borderTop: `1px solid ${border}`, padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, maxWidth: 900, margin: '0 auto' }}>
        <p style={{ fontSize: 11, color: muted, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>© 2026 Raksh Health. All rights reserved.</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 999, background: dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', border: `1px solid ${border}` }}>
          <span style={{ fontSize: 11, color: muted, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Crafted with</span>
          <span style={{ fontSize: 14, display: 'inline-block', animation: 'raksh-heartbeat 2s cubic-bezier(0.25,1,0.5,1) infinite', color: '#C0203E' }}>❤</span>
          <span style={{ fontSize: 11, color: muted, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>in India</span>
        </div>
      </div>
    </div>
  );
}
