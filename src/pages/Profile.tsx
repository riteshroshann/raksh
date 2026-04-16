import React, { useState } from 'react';
import { User, Shield, Bell, Moon, LogOut, ChevronRight, Plus, Edit2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import type { Condition } from '../lib/types';

const CONDITION_STYLES: Record<string, { bg: string; text: string }> = {
  Diabetes:     { bg: '#FEF2F2', text: '#C0203E' },
  Thyroid:      { bg: '#F5F3FF', text: '#7C3AED' },
  Heart:        { bg: '#FFF7ED', text: '#EA580C' },
  Kidney:       { bg: '#F0FDFA', text: '#0D9488' },
  Hypertension: { bg: '#EFF6FF', text: '#1D4ED8' },
};

export default function Profile() {
  const { user, familyMembers, isDarkMode, toggleDarkMode, signOut } = useAppContext();
  const navigate = useNavigate();
  const profile = user?.profile;

  const initials = profile?.full_name?.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase() ?? 'R';

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="p-5 lg:p-8 max-w-7xl mx-auto">

      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-semibold text-gray-900">Profile</h1>
        <p className="text-sm text-gray-400 mt-0.5">Your account and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <div className="space-y-5">

          <div className="bg-white rounded-3xl border border-black/[0.05] p-6 text-center">
            <div className="w-20 h-20 rounded-full bg-[#C0203E] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#C0203E]/25">
              <span className="text-white text-2xl font-semibold">{initials}</span>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">{profile?.full_name ?? 'User'}</h2>
            <p className="text-sm text-gray-400 mt-0.5">{user?.email}</p>

            {profile?.conditions && profile.conditions.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center mt-4">
                {profile.conditions.map((c: Condition) => {
                  const s = CONDITION_STYLES[c] ?? { bg: '#F3F4F6', text: '#6B7280' };
                  return (
                    <span key={c} className="text-xs font-semibold px-3 py-1.5 rounded-full" style={{ background: s.bg, color: s.text }}>
                      {c}
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          {familyMembers.length > 0 && (
            <div className="bg-white rounded-3xl border border-black/[0.05] p-6">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Family Members</p>
              <div className="space-y-3">
                {familyMembers.map(member => {
                  const mi = member.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();
                  return (
                    <div key={member.id} className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm font-semibold"
                        style={{ background: member.color ?? '#C0203E' }}
                      >
                        {mi}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{member.name}</p>
                        <p className="text-xs text-gray-400">{member.relation}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-5">

          <div className="bg-white rounded-3xl border border-black/[0.05] overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-50">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Preferences</p>
            </div>

            <div className="divide-y divide-gray-50">
              <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center">
                    <Moon size={16} className="text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Dark mode</p>
                    <p className="text-xs text-gray-400">Switch to dark theme</p>
                  </div>
                </div>
                <button
                  onClick={toggleDarkMode}
                  className={`relative w-11 h-6 rounded-full transition-colors ${isDarkMode ? 'bg-[#C0203E]' : 'bg-gray-200'}`}
                >
                  <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${isDarkMode ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-[#C0203E]/10 rounded-xl flex items-center justify-center">
                    <Bell size={16} className="text-[#C0203E]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Notifications</p>
                    <p className="text-xs text-gray-400">Medicine reminders and alerts</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-gray-300" />
              </div>

              <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-teal-50 rounded-xl flex items-center justify-center">
                    <Shield size={16} className="text-teal-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Privacy & Security</p>
                    <p className="text-xs text-gray-400">Manage data and permissions</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-gray-300" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-black/[0.05] overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-50">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Account</p>
            </div>
            <div className="divide-y divide-gray-50">
              <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center">
                    <User size={16} className="text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Email</p>
                    <p className="text-xs text-gray-400">{user?.email}</p>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4">
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2.5 text-sm font-medium text-red-500 hover:text-red-600 transition-colors"
                >
                  <LogOut size={16} />
                  Sign out of Raksh
                </button>
              </div>
            </div>
          </div>

          <div className="bg-[#FEF2F2] rounded-3xl border border-red-100 p-6">
            <p className="text-xs font-semibold text-[#C0203E] uppercase tracking-wider mb-1">Danger Zone</p>
            <p className="text-sm text-gray-500 mb-4">Permanently delete your account and all associated health data.</p>
            <button className="text-sm font-semibold text-red-500 hover:text-red-600 transition-colors">
              Delete account →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
