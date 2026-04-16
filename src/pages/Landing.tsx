import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, TrendingUp, Pill, FileText, Bell, Users, ChevronRight, Check, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

function PhoneMockup() {
  const [activeTab, setActiveTab] = useState(0);
  const screens = [
    {
      bg: 'bg-white',
      content: (
        <div className="p-6 pt-10 flex flex-col h-full">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#C0203E] flex items-center justify-center text-white text-xs font-bold">E</div>
              <span className="text-sm font-light text-black">Hi, Eva ✨</span>
            </div>
            <div className="flex gap-2">
              <div className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center">
                <div className="w-3 h-3 border border-black/30 rounded-sm" />
              </div>
            </div>
          </div>
          <div className="text-[10px] uppercase tracking-widest text-black/30 font-bold mb-1">Daily report</div>
          <h2 className="text-2xl font-light leading-tight tracking-tight mb-6">
            Rise and shine,<br/>Eva! How do<br/>you feel today?
          </h2>
          <div className="bg-white rounded-[2rem] border border-black/5 p-5 shadow-sm mb-4">
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-5xl font-light tracking-tighter">98</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-black/30">mg/dL</span>
            </div>
            <div className="h-px w-full bg-black/5 mb-3" />
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Diabetes Control</span>
              <div className="w-7 h-7 bg-[#C0203E]/10 rounded-xl flex items-center justify-center">
                <TrendingUp size={12} className="text-[#C0203E]" />
              </div>
            </div>
            <p className="text-[11px] text-black/40 mt-1 leading-relaxed">Your fasting sugar is within target range.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-[1.5rem] border border-black/5 p-4 shadow-sm">
              <span className="text-sm font-medium leading-tight block mb-3">Add your<br/>symptoms</span>
              <div className="flex justify-end">
                <div className="w-9 h-9 bg-[#C0203E]/10 rounded-xl flex items-center justify-center border border-[#C0203E]/20">
                  <span className="text-[#C0203E] text-lg font-light">+</span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-[1.5rem] border border-black/5 p-4 shadow-sm">
              <span className="text-sm font-medium leading-tight block mb-3">Make an<br/>appointment</span>
              <div className="flex justify-end">
                <div className="w-9 h-9 bg-black/5 rounded-xl flex items-center justify-center border border-black/10">
                  <span className="text-black/40 text-lg font-light">+</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      bg: 'bg-white',
      content: (
        <div className="p-6 pt-10 flex flex-col h-full">
          <h2 className="text-xl font-medium mb-5">Medicines</h2>
          <div className="flex gap-2 mb-5 overflow-x-auto no-scrollbar">
            {['Sun 17','Mon 18','Tue 19','Wed 20','Thu 21'].map((d, i) => (
              <div key={d} className={`flex flex-col items-center min-w-[46px] py-3 rounded-2xl text-center ${i === 2 ? 'bg-[#C0203E] text-white' : 'bg-black/5 text-black/40'}`}>
                <span className="text-[8px] font-bold uppercase">{d.split(' ')[0]}</span>
                <span className="text-base font-medium">{d.split(' ')[1]}</span>
              </div>
            ))}
          </div>
          <div className="mb-3">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium">Today's Progress</span>
              <span className="font-bold text-[#C0203E]">1/4 Taken</span>
            </div>
            <div className="h-3 rounded-full bg-black/5 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-[#C0203E] to-[#C0203E]/60 w-1/4" />
            </div>
          </div>
          <div className="text-base font-medium mb-3 mt-4">To take</div>
          <div className="flex flex-col gap-3">
            {[
              { name: 'Metformin', dose: '500mg · after meals', time: '09:00 am', taken: false },
              { name: 'Thyronorm', dose: '50mcg · empty stomach', time: '07:00 am', taken: true },
            ].map(med => (
              <div key={med.name} className={`flex items-center gap-3 p-3 rounded-2xl border ${med.taken ? 'opacity-40 border-black/5' : 'border-black/5'} bg-white shadow-sm`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${med.taken ? 'bg-black/5' : 'bg-[#C0203E]/10'}`}>
                  <Pill size={16} className={med.taken ? 'text-black/20' : 'text-[#C0203E]'} />
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${med.taken ? 'line-through text-black/30' : ''}`}>{med.name}</p>
                  <p className="text-[10px] text-black/30">{med.dose}</p>
                </div>
                <span className="text-[10px] text-black/30">{med.time}</span>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      bg: 'bg-white',
      content: (
        <div className="p-6 pt-10 flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-medium">MedVault</h2>
            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-black/5 border border-black/5">
              <Shield size={11} className="text-black/40" />
              <span className="text-[9px] font-bold uppercase tracking-wider text-black/40">Secure</span>
            </div>
          </div>
          <div className="flex gap-3 mb-5">
            <button className="flex-1 h-12 rounded-2xl bg-black/5 border border-black/5 flex items-center justify-center gap-2">
              <div className="w-7 h-7 bg-[#C0203E]/10 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 border-2 border-[#C0203E] rounded-sm" />
              </div>
              <span className="text-sm font-medium">Scan</span>
            </button>
            <button className="flex-1 h-12 rounded-2xl bg-black/5 border border-black/5 flex items-center justify-center gap-2">
              <div className="w-7 h-7 bg-black/5 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 border-b-2 border-l-2 border-r-2 border-black/30 rounded-b-sm" />
              </div>
              <span className="text-sm font-medium">Upload</span>
            </button>
          </div>
          <div className="flex flex-col gap-3">
            {[
              { name: 'HbA1c Report', date: 'Oct 12, 2025', tag: 'Diabetes', high: true },
              { name: 'TSH Level', date: 'Oct 05, 2025', tag: 'Thyroid', high: false },
              { name: 'Lipid Profile', date: 'Sep 28, 2025', tag: 'Heart', high: true },
            ].map(r => (
              <div key={r.name} className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-black/5 shadow-sm">
                <div className="w-9 h-9 bg-black/5 rounded-xl flex items-center justify-center">
                  <FileText size={14} className="text-black/30" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{r.name}</p>
                  <p className="text-[10px] text-black/30">{r.date}</p>
                </div>
                {r.high && (
                  <span className="text-[9px] font-bold text-[#C0203E] bg-[#C0203E]/10 px-2 py-0.5 rounded-full border border-[#C0203E]/20 uppercase">HIGH</span>
                )}
              </div>
            ))}
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="relative flex items-center justify-center">
      
      <div className="absolute inset-0 bg-[#C0203E]/5 rounded-full blur-3xl scale-110 pointer-events-none" />

      <div
        className="relative w-[300px] h-[590px] rounded-[3rem] overflow-hidden shadow-[0_40px_120px_rgba(0,0,0,0.18),0_0_0_1px_rgba(0,0,0,0.06)]"
        style={{ background: 'white' }}
      >
        
        <div className="absolute top-0 left-0 right-0 h-8 bg-white z-10 flex items-center justify-center">
          <div className="w-20 h-4 bg-black/[0.06] rounded-full" />
        </div>

        <div className="absolute inset-0 overflow-hidden" style={{ paddingTop: 32 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="h-full overflow-hidden"
            >
              {screens[activeTab].content}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[85%] bg-white border border-black/5 rounded-full px-4 py-2.5 flex items-center justify-around shadow-lg z-10">
          {[
            { label: 'Home',  icon: '⌂' },
            { label: 'Vitals', icon: '♡' },
            { label: 'Meds',  icon: '💊' },
            { label: 'Vault', icon: '🛡️' },
          ].map((t, i) => (
            <button
              key={t.label}
              onClick={() => { if (i < 3) setActiveTab(i === 0 ? 0 : i === 1 ? 0 : 1); else setActiveTab(2); }}
              className="flex flex-col items-center gap-0.5"
            >
              <span className="text-xs">{t.icon}</span>
              <span className={`text-[7px] font-bold uppercase tracking-wide ${activeTab === i ? 'text-[#C0203E]' : 'text-black/30'}`}>{t.label}</span>
              {activeTab === Math.floor(i / 1.5) && <div className="w-0.5 h-0.5 bg-[#C0203E] rounded-full" />}
            </button>
          ))}
        </div>
      </div>

      <div className="absolute -bottom-8 flex gap-2">
        {screens.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveTab(i)}
            className="transition-all"
          >
            <div
              className="rounded-full transition-all"
              style={{
                width: activeTab === i ? 20 : 6,
                height: 6,
                background: activeTab === i ? '#C0203E' : '#D1D5DB',
              }}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

const FEATURES = [
  {
    emoji: '🩸',
    title: 'Vitals Tracking',
    desc: 'Log blood sugar, BP, weight and heart rate. See 7-day trends with Indian reference ranges built-in.',
  },
  {
    emoji: '💊',
    title: 'Medicine Tracker',
    desc: 'Never miss a dose. Get low-stock alerts before you run out. Schedule reminders for each slot.',
  },
  {
    emoji: '🛡️',
    title: 'MedVault',
    desc: 'Scan and store lab reports. Filter by condition. Share a pre-visit summary with your doctor in one tap.',
  },
  {
    emoji: '👨‍👩‍👦',
    title: 'Family Profiles',
    desc: 'Manage health records for your entire family — parents, spouse, kids — under one account.',
  },
  {
    emoji: '🔒',
    title: 'Hidden Vault',
    desc: 'PIN-protected private vault for sensitive records. Your data stays on your device.',
  },
  {
    emoji: '🇮🇳',
    title: 'Built for India',
    desc: 'Indian lab formats, Indian doctors, Indian conditions. Not a global app retrofitted for India.',
  },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Create your profile', desc: 'Tell us about your health conditions. Takes 60 seconds.' },
  { step: '02', title: 'Add your medicines', desc: 'Set up your medication schedule with dose timings and stock counts.' },
  { step: '03', title: 'Log daily vitals', desc: 'Track blood sugar, BP and weight. Raksh classifies every reading instantly.' },
  { step: '04', title: 'Share with your doctor', desc: 'Generate a pre-visit summary from your entire history in one tap.' },
];

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white font-sans">

      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-black/[0.04]">
        <div className="max-w-6xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between">

          <Link to="/" className="flex items-center gap-2 no-underline">
            <span className="text-xl" role="img" aria-label="raksh">🌿</span>
            <span className="text-xl font-light tracking-tight text-black" style={{ fontFamily: 'var(--font-display)' }}>
              raksh
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="landing-nav-link">Features</a>
            <a href="#how-it-works" className="landing-nav-link">How it works</a>
            <a href="#security" className="landing-nav-link">Security</a>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-black/60 hover:text-black transition-colors">
              Sign in
            </Link>
            <Link
              to="/login"
              className="btn-pill btn-primary px-5 text-sm py-0"
              style={{ minHeight: 38, fontSize: 14 }}
              id="nav-cta"
            >
              Get started free
            </Link>
          </div>

          <button
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl bg-black/5"
            onClick={() => setMobileMenuOpen(v => !v)}
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="md:hidden border-t border-black/[0.04] bg-white px-5 pb-5 pt-3 flex flex-col gap-4"
            >
              <a href="#features" className="text-sm font-medium text-black/60" onClick={() => setMobileMenuOpen(false)}>Features</a>
              <a href="#how-it-works" className="text-sm font-medium text-black/60" onClick={() => setMobileMenuOpen(false)}>How it works</a>
              <Link to="/login" className="btn-pill btn-primary w-full text-center text-sm mt-2" onClick={() => setMobileMenuOpen(false)}>
                Get started free
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <section className="max-w-6xl mx-auto px-5 md:px-8 pt-16 md:pt-24 pb-20 md:pb-32">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

          <div className="flex-1 text-center lg:text-left">
            
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-black/[0.06] bg-black/[0.02] text-sm text-black/50 font-medium mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C0203E]" />
              Built for chronic disease management
            </div>

            <h1 className="text-[clamp(2.4rem,5vw,4rem)] leading-[1.08] tracking-[-0.03em] font-light text-black mb-6">
              Your family's health,<br />
              <span className="text-[#C0203E]">finally organised.</span>
            </h1>

            <p className="text-[17px] text-black/50 leading-relaxed mb-8 max-w-[460px] mx-auto lg:mx-0">
              Raksh helps Indian families managing diabetes, thyroid, BP and other chronic conditions — track vitals, manage medicines, store lab reports, and prepare for doctor visits.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Link
                to="/login"
                className="btn-pill btn-primary px-8"
                id="hero-cta-primary"
              >
                Start for free
                <ArrowRight size={16} className="ml-2" />
              </Link>
              <a
                href="#how-it-works"
                className="btn-pill btn-ghost px-8"
                id="hero-cta-secondary"
              >
                See how it works
              </a>
            </div>

            <div className="flex items-center gap-6 mt-8 justify-center lg:justify-start">
              <div className="flex flex-col">
                <span className="text-xl font-semibold text-black">100%</span>
                <span className="text-xs text-black/40 font-medium">Private & local</span>
              </div>
              <div className="w-px h-8 bg-black/10" />
              <div className="flex flex-col">
                <span className="text-xl font-semibold text-black">Free</span>
                <span className="text-xs text-black/40 font-medium">No credit card</span>
              </div>
              <div className="w-px h-8 bg-black/10" />
              <div className="flex flex-col">
                <span className="text-xl font-semibold text-black">🇮🇳</span>
                <span className="text-xs text-black/40 font-medium">Made for India</span>
              </div>
            </div>
          </div>

          <div className="flex-shrink-0 flex items-center justify-center w-full lg:w-auto pb-12 lg:pb-0">
            <PhoneMockup />
          </div>
        </div>
      </section>

      <section id="features" className="bg-[#FAFAFA] py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-5 md:px-8">
          <div className="text-center mb-14">
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#C0203E] mb-3">Built with purpose</p>
            <h2 className="text-[clamp(1.8rem,3.5vw,2.8rem)] font-light tracking-tight text-black mb-4">
              Everything chronic patients actually need
            </h2>
            <p className="text-base text-black/50 max-w-md mx-auto">
              Not a generic health tracker. Built specifically for people managing long-term conditions in India.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07, duration: 0.4 }}
                className="feature-card"
              >
                <div className="w-12 h-12 rounded-2xl bg-white border border-black/[0.06] flex items-center justify-center text-2xl mb-4 shadow-sm">
                  {f.emoji}
                </div>
                <h3 className="text-base font-semibold text-black mb-2">{f.title}</h3>
                <p className="text-sm text-black/50 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-5 md:px-8">
          <div className="text-center mb-14">
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#C0203E] mb-3">Getting started</p>
            <h2 className="text-[clamp(1.8rem,3.5vw,2.8rem)] font-light tracking-tight text-black mb-4">
              Up and running in 5 minutes
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="relative"
              >
                <div className="mb-4">
                  <span className="text-[11px] font-bold text-[#C0203E] uppercase tracking-widest">{step.step}</span>
                </div>
                <h3 className="text-base font-semibold text-black mb-2">{step.title}</h3>
                <p className="text-sm text-black/50 leading-relaxed">{step.desc}</p>
                
                {i < 3 && (
                  <div className="hidden lg:block absolute top-4 left-[calc(100%+12px)] w-[calc(100%-24px)] h-[1px] bg-black/[0.06]" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="security" className="bg-[#FAFAFA] py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-5 md:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-left">
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#C0203E] mb-3">Privacy first</p>
              <h2 className="text-[clamp(1.8rem,3.5vw,2.8rem)] font-light tracking-tight text-black mb-5">
                Your health data belongs<br />to you. Always.
              </h2>
              <div className="flex flex-col gap-4 max-w-md mx-auto lg:mx-0">
                {[
                  'Never sold to third parties',
                  'Hidden vault with PIN protection for sensitive records',
                  'Share only what you choose — pre-visit summaries are doctor-ready exports',
                  'Built in India, compliant with Indian data practices',
                ].map(point => (
                  <div key={point} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#C0203E]/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={11} className="text-[#C0203E]" />
                    </div>
                    <p className="text-sm text-black/60">{point}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-1 flex justify-center lg:justify-end">
              <div className="w-full max-w-sm p-8 rounded-[2.5rem] border border-black/[0.06] bg-white shadow-sm">
                <div className="w-16 h-16 rounded-3xl bg-[#C0203E]/10 flex items-center justify-center mb-5 border border-[#C0203E]/20">
                  <Shield size={28} className="text-[#C0203E]" />
                </div>
                <h3 className="text-xl font-medium text-black mb-2">Hidden Vault</h3>
                <p className="text-sm text-black/50 leading-relaxed mb-6">
                  Sensitive records — private consultation notes, genetic screening — stored behind your personal PIN. Invisible to anyone without access.
                </p>
                <div className="flex gap-3">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-4 h-4 rounded-full bg-[#C0203E]/20 border-2 border-[#C0203E]/30" />
                  ))}
                </div>
                <p className="text-[10px] text-black/30 font-bold uppercase tracking-widest mt-2">Enter PIN to unlock</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-32">
        <div className="max-w-3xl mx-auto px-5 md:px-8 text-center">
          <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#C0203E] mb-4">Start today</p>
          <h2 className="text-[clamp(2rem,4vw,3.2rem)] font-light tracking-tight text-black mb-5">
            Take control of your<br />family's health records
          </h2>
          <p className="text-base text-black/50 mb-8 max-w-md mx-auto">
            Join thousands of Indian families who use Raksh to stay on top of chronic conditions without the chaos.
          </p>
          <Link
            to="/login"
            className="btn-pill btn-primary inline-flex px-10 text-base"
            id="footer-cta"
          >
            Get started — it's free
            <ArrowRight size={18} className="ml-2" />
          </Link>
          <p className="text-xs text-black/30 mt-4">No credit card. No jargon. Just your health.</p>
        </div>
      </section>

      <footer className="border-t border-black/[0.05] py-10">
        <div className="max-w-6xl mx-auto px-5 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span>🌿</span>
            <span className="font-light text-black" style={{ fontFamily: 'var(--font-display)' }}>raksh</span>
          </div>
          <p className="text-xs text-black/30">Built with care in Delhi · © 2025 Raksh</p>
          <div className="flex items-center gap-5">
            <span className="text-xs text-black/30 hover:text-black cursor-pointer transition-colors">Privacy</span>
            <span className="text-xs text-black/30 hover:text-black cursor-pointer transition-colors">Terms</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
