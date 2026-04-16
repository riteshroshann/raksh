import React, { useState } from 'react';
import { Search, Bell, Lock, Upload, Scan, FileText, ChevronRight, AlertTriangle, Microscope, Pill, Stethoscope, Folder, MoreVertical } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { useAppContext } from '../context/AppContext';

const CONDITIONS = [
  { id: 'All', color: '#1A1C1E' },
  { id: 'Diabetes', color: '#C0203E' },
  { id: 'Thyroid', color: '#9C27B0' },
  { id: 'Kidney', color: '#2196F3' },
  { id: 'Heart', color: '#F44336' },
];

const VAULT_CATEGORIES = [
  { id: 'tests', label: 'Tests', icon: Microscope, count: 12, lastDate: 'Oct 12' },
  { id: 'medicines', label: 'Medicines', icon: Pill, count: 8, lastDate: 'Oct 10' },
  { id: 'scans', label: 'Scans', icon: Folder, count: 3, lastDate: 'Sep 15' },
  { id: 'visits', label: 'Doctor Visits', icon: Stethoscope, count: 5, lastDate: 'Oct 01' },
];

const RECENT_RECORDS = [
  { id: 1, name: 'HbA1c Report', date: 'Oct 12, 2025', condition: 'Diabetes', flag: 'High', trend: 'up' },
  { id: 2, name: 'TSH Level', date: 'Oct 05, 2025', condition: 'Thyroid', flag: 'Normal', trend: 'down' },
  { id: 3, name: 'Lipid Profile', date: 'Sep 28, 2025', condition: 'Heart', flag: 'High', trend: 'stable' },
];

export default function Vault() {
  const shouldReduce = useReducedMotion();
  const { user, familyMembers, activeMemberId, setActiveMemberId } = useAppContext();
  const [selectedCondition, setSelectedCondition] = useState('All');
  const [showVaultAuth, setShowVaultAuth] = useState(false);
  const [isVaultUnlocked, setIsVaultUnlocked] = useState(false);
  const [vaultPin, setVaultPin] = useState('');
  const [pinError, setPinError] = useState(false);

  const profile = user?.profile;
  const activeMember = familyMembers.find(m => m.id === activeMemberId);
  const displayName = activeMember?.name ?? profile?.full_name ?? 'there';
  const firstName = displayName.split(' ')[0];
  const initials = displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  const filteredRecords = RECENT_RECORDS.filter(r => selectedCondition === 'All' || r.condition === selectedCondition);

  function handlePinInput(digit: string) {
    if (vaultPin.length < 4) {
      const newPin = vaultPin + digit;
      setVaultPin(newPin);
      if (newPin.length === 4) {
        if (newPin === '1234') {
          setIsVaultUnlocked(true);
          setShowVaultAuth(false);
          setVaultPin('');
        } else {
          setPinError(true);
          setTimeout(() => { setVaultPin(''); setPinError(false); }, 1000);
        }
      }
    }
  }

  return (
    <div className="flex flex-col min-h-full bg-white">

      {/* ── Header ────────────────────────────────────────────────── */}
      <header className="px-6 pt-10 pb-4 flex items-center justify-between bg-white sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveMemberId(null)}
            className="w-10 h-10 rounded-full border border-black/[0.05] shadow-sm hover:scale-105 active:scale-95 transition-all"
            style={{ background: '#C0203E' }}
          >
            <span className="flex items-center justify-center h-full text-white text-sm font-semibold">{initials}</span>
          </button>
          <span className="text-lg font-light text-black">Hi, {firstName} ✨</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-10 h-10 flex items-center justify-center rounded-full bg-black/[0.03] border border-black/[0.03]">
            <Search size={18} className="text-black/50" />
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-full bg-black/[0.03] border border-black/[0.03]">
            <Bell size={18} className="text-black/50" />
          </button>
        </div>
      </header>

      <main className="flex-1 px-6 pb-4 relative">

        {/* Title */}
        <div className="flex items-center justify-between mt-4 mb-6">
          <h1 className="text-2xl font-medium text-black tracking-tight">MedVault</h1>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/[0.03] border border-black/[0.03]">
            <Lock size={12} className="text-black/40" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-black/40">Secure</span>
          </div>
        </div>

        {/* ── Upload bar ──────────────────────────────────────────── */}
        <div className="flex gap-3 mb-6">
          <button className="flex-1 h-16 rounded-[2rem] border bg-black/[0.03] border-black/[0.05] flex items-center justify-center gap-3 transition-all hover:bg-black/[0.05] active:scale-[0.98] group">
            <div className="w-9 h-9 bg-[#C0203E]/10 rounded-full flex items-center justify-center border border-[#C0203E]/20 group-hover:scale-110 transition-transform">
              <Scan size={16} className="text-[#C0203E]" />
            </div>
            <span className="text-base font-medium text-black">Scan</span>
          </button>
          <button className="flex-1 h-16 rounded-[2rem] border bg-black/[0.03] border-black/[0.05] flex items-center justify-center gap-3 transition-all hover:bg-black/[0.05] active:scale-[0.98] group">
            <div className="w-9 h-9 bg-black/5 rounded-full flex items-center justify-center border border-black/10 group-hover:scale-110 transition-transform">
              <Upload size={16} className="text-black/50" />
            </div>
            <span className="text-base font-medium text-black">Upload</span>
          </button>
        </div>

        {/* ── Category grid ────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {VAULT_CATEGORIES.map(cat => (
            <motion.div
              key={cat.id}
              whileHover={shouldReduce ? {} : { y: -3 }}
              whileTap={shouldReduce ? {} : { scale: 0.985 }}
              className="glass-card p-5 flex flex-col justify-between h-[140px] cursor-pointer relative overflow-hidden border border-black/[0.05] group hover:border-[#C0203E]/20 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-2xl bg-black/5 border border-black/10 flex items-center justify-center">
                  <cat.icon size={22} className="text-[#C0203E]" />
                </div>
                <div className="px-2 py-1 rounded-full bg-black/5 border border-black/10">
                  <span className="text-[9px] font-bold text-black/40">{cat.count} Records</span>
                </div>
              </div>
              <div>
                <h4 className="text-base font-medium text-black">{cat.label}</h4>
                <p className="text-[10px] font-bold uppercase tracking-wider text-black/20 mt-0.5">Last: {cat.lastDate}</p>
              </div>
              {/* Ghost icon */}
              <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                <cat.icon size={80} className="text-[#C0203E]" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── Hidden Vault ─────────────────────────────────────────── */}
        <div className="mb-6">
          <motion.div
            whileHover={shouldReduce ? {} : { scale: 1.01, boxShadow: '0 20px 40px rgba(192,32,62,0.1)' }}
            whileTap={shouldReduce ? {} : { scale: 0.99 }}
            onClick={() => isVaultUnlocked ? setIsVaultUnlocked(true) : setShowVaultAuth(true)}
            className="glass-card p-6 flex items-center gap-5 cursor-pointer relative overflow-hidden border border-black/[0.05] group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#C0203E]/5 to-transparent pointer-events-none" />
            <div className="w-14 h-14 rounded-[1.5rem] flex items-center justify-center border border-[#C0203E]/20 bg-[#C0203E]/10 group-hover:bg-[#C0203E]/20 transition-colors z-10">
              <Lock size={26} className="text-[#C0203E]" />
            </div>
            <div className="flex-1 z-10">
              <h4 className="text-lg font-medium text-black">Hidden Vault</h4>
              <p className="text-xs text-black/30 font-light">Secure sensitive records</p>
            </div>
            <div className="flex items-center gap-2 z-10">
              <span className="text-[10px] font-bold text-[#C0203E]/40 uppercase tracking-widest">Locked</span>
              <ChevronRight size={18} className="text-[#C0203E]/40" />
            </div>
          </motion.div>
        </div>

        {/* ── Condition filter ─────────────────────────────────────── */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4 px-1">
            <span className="text-caption">Filter by condition</span>
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {CONDITIONS.map(c => {
              const isActive = selectedCondition === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedCondition(c.id)}
                  className="px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap border transition-all"
                  style={isActive
                    ? { background: '#C0203E', color: 'white', borderColor: 'transparent', boxShadow: '0 8px 20px rgba(192,32,62,0.25)' }
                    : { background: 'rgba(0,0,0,0.04)', color: 'rgba(0,0,0,0.4)', borderColor: 'rgba(0,0,0,0.05)' }
                  }
                >
                  <div className="flex items-center gap-2">
                    {c.id !== 'All' && (
                      <div className="w-2 h-2 rounded-full" style={{ background: isActive ? 'white' : c.color }} />
                    )}
                    {c.id}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Recent Records ───────────────────────────────────────── */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-5 px-1">
            <span className="text-xl font-medium text-black">Recent Records</span>
            <button className="text-sm font-bold" style={{ color: '#C0203E' }}>View all</button>
          </div>
          <div className="flex flex-col gap-3">
            <AnimatePresence>
              {filteredRecords.length > 0 ? filteredRecords.map((record, i) => {
                const cond = CONDITIONS.find(c => c.id === record.condition);
                return (
                  <motion.div
                    key={record.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={shouldReduce ? {} : { x: 4, backgroundColor: 'rgba(0,0,0,0.02)' }}
                    className="glass-card p-4 flex items-center gap-4 cursor-pointer border border-black/[0.05] group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-black/5 border border-black/10 flex items-center justify-center">
                      <FileText size={20} className="text-black/30" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-base font-medium text-black">{record.name}</h4>
                        <div className="flex items-center gap-2">
                          {record.flag === 'High' && (
                            <div className="flex items-center gap-1 bg-[#C0203E]/20 px-2 py-0.5 rounded-full border border-[#C0203E]/30">
                              <AlertTriangle size={10} className="text-[#C0203E]" />
                              <span className="text-[9px] font-bold text-[#C0203E] uppercase">High</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-bold text-black/30">{record.date}</span>
                        <div className="w-1 h-1 rounded-full bg-black/10" />
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full" style={{ background: cond?.color }} />
                          <span className="text-xs font-bold" style={{ color: cond?.color }}>{record.condition}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              }) : (
                <div className="glass-card p-10 border-2 border-dashed border-black/5 flex flex-col items-center text-center gap-4 bg-transparent shadow-none">
                  <div className="w-16 h-16 bg-[#C0203E]/10 rounded-full flex items-center justify-center border border-[#C0203E]/20">
                    <Microscope size={28} className="text-[#C0203E]" />
                  </div>
                  <h4 className="text-base font-medium text-black">No records found</h4>
                  <p className="text-sm font-light text-black/40">Add your first record to see it here.</p>
                  <button className="mt-2 px-8 py-4 text-white rounded-full font-bold active:scale-95 transition-all" style={{ background: '#C0203E', boxShadow: '0 8px 20px rgba(192,32,62,0.3)' }}>
                    Add Record
                  </button>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* ── Hidden Vault PIN overlay ──────────────────────────────── */}
      <AnimatePresence>
        {showVaultAuth && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white p-8"
          >
            <div className="flex flex-col items-center gap-6 w-full max-w-[280px]">
              <div className="w-20 h-20 rounded-[2rem] bg-[#C0203E]/10 border border-[#C0203E]/20 flex items-center justify-center shadow-xl relative">
                <div className="absolute inset-0 bg-[#C0203E]/20 blur-2xl rounded-full" />
                <Lock size={36} className="text-[#C0203E] relative z-10" />
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-medium text-black">Hidden Vault</h2>
                <p className="text-xs font-bold uppercase tracking-wider text-black/30 mt-1">Enter your 4-digit PIN</p>
              </div>
              {/* PIN dots */}
              <div className="flex gap-4">
                {[0,1,2,3].map(i => (
                  <motion.div
                    key={i}
                    animate={pinError ? { x: [0,-10,10,-10,10,0] } : { x: 0 }}
                    transition={pinError ? { duration: 0.4 } : {}}
                    className="w-4 h-4 rounded-full border-2 transition-all"
                    style={{
                      background: vaultPin.length > i ? '#C0203E' : 'transparent',
                      borderColor: vaultPin.length > i ? '#C0203E' : 'rgba(0,0,0,0.15)',
                      boxShadow: vaultPin.length > i ? '0 0 10px rgba(192,32,62,0.5)' : 'none',
                    }}
                  />
                ))}
              </div>
              {/* Number pad */}
              <div className="grid grid-cols-3 gap-5 w-full">
                {[1,2,3,4,5,6,7,8,9].map(n => (
                  <motion.button
                    key={n}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handlePinInput(n.toString())}
                    className="w-16 h-16 rounded-full border bg-black/5 border-black/5 text-black text-xl font-medium hover:bg-black/10 transition-colors mx-auto"
                  >
                    {n}
                  </motion.button>
                ))}
                <div />
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => handlePinInput('0')} className="w-16 h-16 rounded-full border bg-black/5 border-black/5 text-black text-xl font-medium hover:bg-black/10 transition-colors mx-auto">0</motion.button>
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => { setVaultPin(''); setShowVaultAuth(false); }} className="w-16 h-16 rounded-full text-sm font-bold mx-auto" style={{ color: '#C0203E' }}>Cancel</motion.button>
              </div>
              <p className="text-[10px] text-black/20 font-bold uppercase tracking-widest mt-2">Demo PIN: 1234</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
