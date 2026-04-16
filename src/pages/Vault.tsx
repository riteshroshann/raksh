import React, { useState } from 'react';
import { Search, Bell, Upload, ScanLine, Lock, FileText, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useAppContext } from '../context/AppContext';
import { Toast, useToast } from '../components/Toast';

export default function Vault() {
  const { user, familyMembers, activeMemberId, setActiveMemberId } = useAppContext();
  const toast = useToast();

  const profile = user?.profile;
  const activeMember = familyMembers.find(m => m.id === activeMemberId);
  const activeLabel = activeMember?.name ?? profile?.full_name ?? 'there';
  const firstName = activeLabel.split(' ')[0];
  const initials = activeLabel.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  const [activeTab, setActiveTab] = useState('All');
  const tabs = ['All', 'Medicines', 'Thyroid'];

  return (
    <div className="px-5 pt-8 pb-32 bg-[#FAFBFC] min-h-full">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveMemberId(null)}
            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-white shadow-sm transition-transform active:scale-95"
            style={{ background: 'var(--primary)' }}
          >
            {initials}
          </button>
          <span className="text-sm font-medium text-[var(--text-primary)]">
            Hi, {firstName} ✨
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button aria-label="Search" className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-black/5 transition-colors">
            <Search size={18} className="text-[var(--text-secondary)]" />
          </button>
          <button aria-label="Notifications" className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-black/5 transition-colors">
            <Bell size={18} className="text-[var(--text-secondary)]" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-[28px] font-semibold text-[var(--text-primary)]">MedVault</h1>
      </div>

      {/* ── Actions ─────────────────────────────────────────────────── */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => toast.show('Coming soon', 'info')}
          className="flex-1 card py-4 px-3 flex flex-col items-center justify-center gap-3 shadow-sm border border-black/5 active:scale-95 transition-transform"
        >
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[var(--primary-light)]">
            <ScanLine size={24} className="text-[var(--primary)]" />
          </div>
          <span className="text-sm font-semibold text-[var(--text-primary)]">Scan</span>
        </button>
        <button
          onClick={() => toast.show('Coming soon', 'info')}
          className="flex-1 card py-4 px-3 flex flex-col items-center justify-center gap-3 shadow-sm border border-black/5 active:scale-95 transition-transform"
        >
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#F3F4F6]">
            <Upload size={24} className="text-[var(--text-secondary)]" />
          </div>
          <span className="text-sm font-semibold text-[var(--text-primary)]">Upload</span>
        </button>
      </div>

      {/* ── Hidden Vault ────────────────────────────────────────────── */}
      <button
        onClick={() => toast.show('Coming soon', 'info')}
        className="w-full card p-5 flex items-center justify-between mb-8 active:scale-95 transition-transform"
        style={{ background: 'var(--primary-light)' }}
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
            <Lock size={18} className="text-[var(--primary)]" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-semibold text-[var(--primary)]">Hidden Vault</h3>
            <p className="text-xs text-[var(--primary)] opacity-80 mt-0.5">Secure sensitive records</p>
          </div>
        </div>
        <ChevronRight size={20} className="text-[var(--primary)]" />
      </button>

      {/* ── Tabs ────────────────────────────────────────────────────── */}
      <div className="flex gap-2 mb-6">
        {tabs.map(t => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className="px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all"
            style={{
              background: activeTab === t ? 'var(--primary)' : 'white',
              color: activeTab === t ? 'white' : 'var(--text-secondary)',
              border: `1px solid ${activeTab === t ? 'var(--primary)' : 'var(--border-medium)'}`,
              boxShadow: activeTab === t ? '0 4px 12px rgba(185, 28, 28, 0.2)' : 'none',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── Recent Records ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-[var(--text-primary)]">Recent Records</h2>
        <button className="text-[11px] font-semibold text-[var(--primary)] uppercase tracking-wider">View all →</button>
      </div>

      <div className="flex flex-col gap-3 mb-8">
        {[
          { name: 'HbA1c Report', date: 'Oct 12, 2023', tag: 'Diabetes', color: 'bg-red-50 text-red-600 border-red-200' },
          { name: 'TSH Level', date: 'Sep 28, 2023', tag: 'Thyroid', color: 'bg-purple-50 text-purple-600 border-purple-200' },
          { name: 'Lipid Profile', date: 'Aug 14, 2023', tag: 'Heart', color: 'bg-orange-50 text-orange-600 border-orange-200' },
        ].map((file, i) => (
          <div key={i} className="card p-4 flex items-center justify-between shadow-sm border border-black/5 active:scale-95 transition-transform cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#F3F4F6] flex items-center justify-center shrink-0">
                <FileText size={18} className="text-[var(--text-secondary)]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">{file.name}</p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">{file.date}</p>
              </div>
            </div>
            <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${file.color}`}>
              • {file.tag}
            </span>
          </div>
        ))}
      </div>

      <Toast {...toast} onClose={toast.hide} />
    </div>
  );
}
