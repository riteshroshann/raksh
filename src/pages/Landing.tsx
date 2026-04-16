import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, FileText, TrendingUp, Pill } from 'lucide-react';

const FEATURES = [
  {
    emoji: '🩸',
    icon: FileText,
    title: 'Lab Reports',
    desc: 'Upload once. Find anything instantly.',
  },
  {
    emoji: '📈',
    icon: TrendingUp,
    title: 'Vitals Tracking',
    desc: 'BP, sugar, weight — trended over time.',
  },
  {
    emoji: '💊',
    icon: Pill,
    title: 'Medicine Tracker',
    desc: 'Never miss a dose or a refill.',
  },
];

export default function Landing() {
  return (
    <div className="app-shell min-h-screen">
      <div className="app-content bg-white">

        {/* ── Nav ─────────────────────────────────────────────────────── */}
        <nav className="flex items-center justify-between px-5 pt-8 pb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl" role="img" aria-label="raksh">🌿</span>
            <span
              className="text-xl tracking-tight"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--primary)' }}
            >
              raksh
            </span>
          </div>
          <Link
            to="/login"
            className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            Sign in
          </Link>
        </nav>

        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section className="px-5 pt-10 pb-12">
          <h1
            className="text-[2.625rem] leading-[1.1] tracking-tight text-[var(--text-primary)] mb-4"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Your family's health.{' '}
            <em className="not-italic" style={{ color: 'var(--primary)' }}>
              Finally organised.
            </em>
          </h1>

          <p className="text-base text-[var(--text-secondary)] leading-relaxed mb-8" style={{ maxWidth: 300 }}>
            Upload reports, track vitals, manage medicines — all in one place built for Indian families.
          </p>

          <Link
            to="/login"
            className="btn-pill btn-primary w-full text-center px-6"
            id="hero-cta"
          >
            Get Started — It's Free
            <ArrowRight size={16} className="ml-2 inline" />
          </Link>

          <p className="text-xs text-[var(--text-muted)] text-center mt-3">
            No credit card. No jargon. Just your health records.
          </p>
        </section>

        {/* ── Feature cards ────────────────────────────────────────────── */}
        <section className="px-5 pb-10">
          <div className="flex flex-col gap-3">
            {FEATURES.map(({ emoji, title, desc }) => (
              <div
                key={title}
                className="card flex items-center gap-4 px-5 py-4"
              >
                <span className="text-2xl w-10 text-center shrink-0" role="img" aria-hidden>
                  {emoji}
                </span>
                <div>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">{title}</p>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Trust section ────────────────────────────────────────────── */}
        <section className="mx-5 mb-10 rounded-2xl bg-[var(--bg-secondary)] px-5 py-6 border border-[var(--border)]">
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-3">
            Built for India
          </p>
          <p className="text-sm text-[var(--text-primary)] font-medium leading-relaxed mb-4">
            Indian reference ranges. Indian labs. Indian families.
          </p>
          <div className="flex items-center gap-2 pt-3 border-t border-[var(--border)]">
            <span className="text-base">🔒</span>
            <p className="text-xs text-[var(--text-secondary)]">
              Your data. Your device. Never sold.
            </p>
          </div>
        </section>

        {/* ── Footer CTA ───────────────────────────────────────────────── */}
        <section className="px-5 pb-16">
          <Link
            to="/login"
            className="btn-pill btn-primary w-full text-center px-6"
            id="footer-cta"
          >
            Start Organising Your Health →
          </Link>
          <p className="text-xs text-[var(--text-muted)] text-center mt-8">
            raksh · Built with care in Delhi
          </p>
        </section>

      </div>
    </div>
  );
}
