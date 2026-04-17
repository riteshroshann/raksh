import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, HeartPulse, Pill, FileText } from 'lucide-react';
import { motion } from 'motion/react';

const MARQUEE = [
  'Blood Sugar', '✦', 'Blood Pressure', '✦', 'Heart Rate', '✦',
  'Medicines', '✦', 'Lab Reports', '✦', 'Family Care', '✦',
  'Diabetes', '✦', 'Thyroid', '✦', 'SpO2', '✦', 'Hypertension', '✦',
];

const FEATURES = [
  {
    icon: HeartPulse,
    label: 'Vitals Tracking',
    desc: 'Log fasting sugar, blood pressure, heart rate — every reading in one place, charted over time.',
  },
  {
    icon: Pill,
    label: 'Medicine Schedule',
    desc: 'Morning, afternoon, evening, night. Mark doses taken. Never miss a refill again.',
  },
  {
    icon: FileText,
    label: 'Health Records',
    desc: 'Upload reports, prescriptions, and lab results — organised by condition and family member.',
  },
];

export default function Landing() {
  const [email, setEmail]         = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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
    <div style={{ background: '#070707', minHeight: '100vh', color: 'white', fontFamily: "'DM Sans', sans-serif", overflowX: 'hidden' }}>

      {/* ── NAV ── */}
      <nav style={{ position: 'fixed', top: 0, insetInline: 0, zIndex: 50, height: 56, display: 'flex', alignItems: 'center', padding: '0 24px', background: 'rgba(7,7,7,0.85)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 26, height: 26, borderRadius: 7, background: '#C0203E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'white', fontWeight: 700, fontSize: 12 }}>R</span>
          </div>
          <span style={{ fontWeight: 700, fontSize: 14, color: 'white', letterSpacing: '0.02em' }}>raksh</span>
        </div>
        <Link
          to="/login"
          style={{ marginLeft: 'auto', padding: '8px 20px', borderRadius: 999, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: 700, textDecoration: 'none', letterSpacing: '0.1em' }}
        >
          SIGN IN
        </Link>
      </nav>

      {/* ── GRID BACKGROUND ── */}
      <div aria-hidden style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', backgroundSize: '60px 60px', backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.022) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.022) 1px, transparent 1px)', maskImage: 'radial-gradient(ellipse at 50% 40%, black 20%, transparent 80%)', WebkitMaskImage: 'radial-gradient(ellipse at 50% 40%, black 20%, transparent 80%)' }} />

      {/* ── AURORA GLOW ── */}
      <div aria-hidden style={{ position: 'fixed', top: '34%', left: '50%', transform: 'translate(-50%,-50%)', width: '55vw', height: '38vw', background: 'radial-gradient(circle, rgba(192,32,62,0.13) 0%, rgba(192,32,62,0.05) 55%, transparent 75%)', borderRadius: '50%', pointerEvents: 'none', zIndex: 0, animation: 'aurora-breathe 9s ease-in-out infinite alternate' }} />

      {/* ── HERO ── */}
      <section style={{ position: 'relative', zIndex: 1, padding: '140px 24px 80px', maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>

        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 999, background: 'rgba(192,32,62,0.12)', border: '1px solid rgba(192,32,62,0.28)', marginBottom: 32 }}
        >
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#C0203E', boxShadow: '0 0 6px rgba(192,32,62,0.6)' }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.65)', letterSpacing: '0.05em' }}>Now in early access</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18, duration: 0.5 }}
          style={{ fontSize: 'clamp(46px, 8vw, 82px)', fontWeight: 900, lineHeight: 1.04, letterSpacing: '-0.04em', marginBottom: 24 }}
        >
          Your family's health.
          <br />
          <span style={{ color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>Finally organised.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}
          style={{ fontSize: 17, color: 'rgba(255,255,255,0.42)', lineHeight: 1.72, maxWidth: 500, margin: '0 auto 44px' }}
        >
          Track vitals, manage medicines, and store health records for your whole family — from one calm, private app.
        </motion.p>

        {/* ── WAITLIST FORM (Formspree) ── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 }}>
          {submitted ? (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '14px 28px', borderRadius: 12, background: 'rgba(21,128,61,0.12)', border: '1px solid rgba(21,128,61,0.3)', color: '#4ADE80', fontWeight: 600, fontSize: 15 }}>
              ✓ &ensp;You're on the waitlist!
            </div>
          ) : (
            <form onSubmit={handleWaitlist} style={{ display: 'flex', gap: 10, maxWidth: 440, margin: '0 auto', flexWrap: 'wrap', justifyContent: 'center' }}>
              <input
                type="email" name="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com" required
                style={{ flex: '1 1 200px', padding: '14px 18px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: 14, outline: 'none' }}
                onFocus={e => { e.currentTarget.style.borderColor = 'rgba(192,32,62,0.6)'; e.currentTarget.style.background = 'rgba(192,32,62,0.06)'; }}
                onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
              />
              <button
                type="submit" disabled={submitting}
                style={{ flex: '0 0 auto', padding: '14px 22px', borderRadius: 10, background: '#C0203E', color: 'white', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer', letterSpacing: '0.03em', opacity: submitting ? 0.6 : 1, transition: 'all 150ms ease', boxShadow: '0 6px 24px rgba(192,32,62,0.35)' }}
              >
                {submitting ? '…' : 'Get early access'}
              </button>
            </form>
          )}
        </motion.div>
      </section>

      {/* ── MARQUEE BAND ── */}
      <div style={{ position: 'relative', zIndex: 1, overflow: 'hidden', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '14px 0', marginBottom: 80, transform: 'rotate(-1.5deg) scaleX(1.1)', background: 'rgba(255,255,255,0.014)' }}>
        <div style={{ display: 'flex', width: 'max-content', animation: 'scroll-marquee 32s linear infinite' }}>
          {fullMarquee.map((item, i) => (
            <span
              key={i}
              style={{ padding: '0 18px', fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: item === '✦' ? '#C0203E' : 'rgba(255,255,255,0.28)', whiteSpace: 'nowrap' }}
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ── FEATURES ── */}
      <section style={{ position: 'relative', zIndex: 1, maxWidth: 900, margin: '0 auto', padding: '0 24px 100px' }}>
        <motion.h2
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          style={{ textAlign: 'center', fontSize: 'clamp(30px, 5vw, 48px)', fontWeight: 800, letterSpacing: '-0.035em', marginBottom: 48, lineHeight: 1.1 }}
        >
          Everything your family needs.
        </motion.h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {FEATURES.map(({ icon: Icon, label, desc }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              viewport={{ once: true }}
              style={{ padding: '28px 26px', borderRadius: 16, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(8px)' }}
            >
              <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(192,32,62,0.15)', border: '1px solid rgba(192,32,62,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                <Icon size={18} style={{ color: '#C0203E' }} />
              </div>
              <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 10, color: 'white' }}>{label}</p>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.38)', lineHeight: 1.68 }}>{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA SECTION ── */}
      <section style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '80px 24px 120px', borderTop: '1px solid rgba(255,255,255,0.04)', overflow: 'hidden' }}>
        {/* Giant background watermark */}
        <div aria-hidden style={{ position: 'absolute', bottom: -30, left: '50%', transform: 'translateX(-50%)', fontSize: '26vw', fontWeight: 900, letterSpacing: '-0.05em', color: 'transparent', WebkitTextStroke: '1px rgba(255,255,255,0.04)', userSelect: 'none', pointerEvents: 'none', lineHeight: 0.75, whiteSpace: 'nowrap' }}>
          raksh
        </div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          style={{ fontSize: 'clamp(40px, 7vw, 72px)', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: 36, lineHeight: 1.05 }}
        >
          Ready to begin?
        </motion.h2>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
          <Link
            to="/login"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '15px 30px', borderRadius: 999, background: '#C0203E', color: 'white', fontWeight: 700, fontSize: 15, textDecoration: 'none', boxShadow: '0 8px 32px rgba(192,32,62,0.38)', letterSpacing: '0.02em' }}
          >
            Start for free <ArrowRight size={16} />
          </Link>
          <Link
            to="/login"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '15px 30px', borderRadius: 999, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', fontWeight: 700, fontSize: 15, textDecoration: 'none' }}
          >
            Sign in
          </Link>
        </div>
        <p style={{ marginTop: 20, fontSize: 12, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.05em' }}>
          No credit card · Private by design · Built in India
        </p>
      </section>

      {/* ── FOOTER BAR ── */}
      <div style={{ position: 'relative', zIndex: 2, borderTop: '1px solid rgba(255,255,255,0.04)', padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, maxWidth: 900, margin: '0 auto' }}>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.18)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          © 2026 Raksh Health. All rights reserved.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 999, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.22)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Crafted with</span>
          <span style={{ fontSize: 14, display: 'inline-block', animation: 'raksh-heartbeat 2s cubic-bezier(0.25,1,0.5,1) infinite', color: '#C0203E' }}>❤</span>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.22)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>in India</span>
        </div>
      </div>
    </div>
  );
}
