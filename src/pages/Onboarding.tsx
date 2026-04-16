import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAppContext } from '../context/AppContext';
import type { Condition, OnboardingState } from '../lib/types';
import { ConditionChip } from '../components/ConditionChip';

const ALL_CONDITIONS: Condition[] = ['Diabetes', 'Thyroid', 'Heart', 'Kidney', 'Hypertension'];
const RELATIONS = ['Spouse', 'Parent', 'Child', 'Sibling', 'Other'] as const;

const INITIAL: OnboardingState = {
  step: 1,
  full_name: '',
  dob: '',
  sex: '',
  conditions: [],
  has_family: false,
  family_member: {},
};

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAppContext();
  const [state, setState] = useState<OnboardingState>(INITIAL);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function patch(update: Partial<OnboardingState>) {
    setState(prev => ({ ...prev, ...update }));
  }

  function toggleCondition(c: Condition) {
    patch({
      conditions: state.conditions.includes(c)
        ? state.conditions.filter(x => x !== c)
        : [...state.conditions, c],
    });
  }

  async function finish() {
    if (!user) return;
    setLoading(true);
    setError(null);

    const profile = {
      id: user.id,
      full_name: state.full_name.trim(),
      dob: state.dob,
      sex: state.sex,
      conditions: state.conditions,
      photo_url: null,
    };

    const { error: profileErr } = await supabase
      .from('profiles')
      .upsert(profile, { onConflict: 'id' });

    if (profileErr) { setError(profileErr.message); setLoading(false); return; }

    if (state.has_family && state.family_member.name) {
      const fm = {
        owner_id: user.id,
        name: state.family_member.name,
        relation: state.family_member.relation ?? 'Other',
        dob: state.family_member.dob ?? '',
        sex: state.family_member.sex ?? 'male',
        color: '#0D9488',
        conditions: [],
      };
      await supabase.from('family_members').insert(fm);
    }

    await refreshProfile();
    navigate('/home', { replace: true });
    setLoading(false);
  }

  const step1Valid = state.full_name.trim().length > 1 && state.dob && state.sex;
  const step2Valid = true; 
  const step3Valid = !state.has_family || Boolean(state.family_member.name);

  return (
    <div className="app-shell min-h-screen">
      <div className="app-content bg-white px-5 pt-10 pb-12 flex flex-col">

        <div className="flex gap-2 mb-10">
          {[1, 2, 3].map(n => (
            <div
              key={n}
              className="h-1.5 rounded-full transition-all duration-300"
              style={{
                flex: n === state.step ? 2 : 1,
                background: n <= state.step ? 'var(--teal)' : 'var(--border-medium)',
              }}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          
          {state.step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col gap-6"
            >
              <div>
                <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-1"
                  style={{ fontFamily: 'var(--font-display)' }}>
                  Let's set up your profile
                </h2>
                <p className="text-sm text-[var(--text-secondary)]">Help us personalise your experience</p>
              </div>

              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-[var(--text-secondary)]">Full name</span>
                <input
                  id="ob-name"
                  type="text"
                  value={state.full_name}
                  onChange={e => patch({ full_name: e.target.value })}
                  placeholder="e.g. Priya Sharma"
                  className="w-full px-4 py-3 rounded-xl border border-[var(--border-medium)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--teal)] focus:ring-opacity-30"
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-[var(--text-secondary)]">Date of birth</span>
                <input
                  id="ob-dob"
                  type="date"
                  value={state.dob}
                  onChange={e => patch({ dob: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--border-medium)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--teal)] focus:ring-opacity-30"
                />
              </label>

              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-[var(--text-secondary)]">Biological sex</span>
                <div className="flex gap-3">
                  {(['male', 'female'] as const).map(s => (
                    <button
                      key={s}
                      id={`ob-sex-${s}`}
                      onClick={() => patch({ sex: s })}
                      className="flex-1 py-3 rounded-xl border-2 text-sm font-medium transition-all capitalize"
                      style={{
                        borderColor: state.sex === s ? 'var(--teal)' : 'var(--border-medium)',
                        background: state.sex === s ? 'var(--teal-light)' : 'white',
                        color: state.sex === s ? 'var(--teal)' : 'var(--text-secondary)',
                      }}
                    >
                      {state.sex === s && <Check size={13} className="inline mr-1" />}
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <button
                disabled={!step1Valid}
                onClick={() => patch({ step: 2 })}
                id="ob-next-1"
                className="btn-pill btn-primary w-full mt-4 disabled:opacity-40"
              >
                Next <ArrowRight size={15} className="inline ml-1" />
              </button>
            </motion.div>
          )}

          {state.step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col gap-6"
            >
              <div>
                <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-1"
                  style={{ fontFamily: 'var(--font-display)' }}>
                  Any health conditions?
                </h2>
                <p className="text-sm text-[var(--text-secondary)]">Select all that apply. You can update this later.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {ALL_CONDITIONS.map(c => (
                  <button
                    key={c}
                    id={`ob-cond-${c.toLowerCase()}`}
                    onClick={() => toggleCondition(c)}
                    className="text-left"
                  >
                    <ConditionChip
                      condition={c}
                      selected={state.conditions.includes(c)}
                    />
                  </button>
                ))}
                <button
                  id="ob-cond-none"
                  onClick={() => patch({ conditions: [] })}
                  className="px-3 py-1.5 text-sm rounded-full border-2 font-medium transition-all"
                  style={{
                    borderColor: state.conditions.length === 0 ? 'var(--teal)' : 'var(--border-medium)',
                    background: state.conditions.length === 0 ? 'var(--teal-light)' : 'white',
                    color: state.conditions.length === 0 ? 'var(--teal)' : 'var(--text-secondary)',
                  }}
                >
                  None of these
                </button>
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => patch({ step: 1 })}
                  className="btn-pill btn-ghost flex-1 px-4"
                >
                  Back
                </button>
                <button
                  disabled={!step2Valid}
                  onClick={() => patch({ step: 3 })}
                  id="ob-next-2"
                  className="btn-pill btn-primary flex-[2] px-6 disabled:opacity-40"
                >
                  Next <ArrowRight size={15} className="inline ml-1" />
                </button>
              </div>
            </motion.div>
          )}

          {state.step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col gap-6"
            >
              <div>
                <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-1"
                  style={{ fontFamily: 'var(--font-display)' }}>
                  Managing for others?
                </h2>
                <p className="text-sm text-[var(--text-secondary)]">Add a family member you care for</p>
              </div>

              <div className="flex gap-3">
                {([true, false] as const).map(val => (
                  <button
                    key={String(val)}
                    id={`ob-family-${val ? 'yes' : 'no'}`}
                    onClick={() => patch({ has_family: val })}
                    className="flex-1 py-3 rounded-xl border-2 text-sm font-medium transition-all"
                    style={{
                      borderColor: state.has_family === val ? 'var(--teal)' : 'var(--border-medium)',
                      background: state.has_family === val ? 'var(--teal-light)' : 'white',
                      color: state.has_family === val ? 'var(--teal)' : 'var(--text-secondary)',
                    }}
                  >
                    {val ? 'Yes, add member' : 'No, just me'}
                  </button>
                ))}
              </div>

              <AnimatePresence>
                {state.has_family && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden flex flex-col gap-4"
                  >
                    <label className="flex flex-col gap-1.5">
                      <span className="text-xs font-medium text-[var(--text-secondary)]">Their name</span>
                      <input
                        id="ob-fm-name"
                        type="text"
                        value={state.family_member.name ?? ''}
                        onChange={e => patch({ family_member: { ...state.family_member, name: e.target.value } })}
                        placeholder="e.g. Rajesh Sharma"
                        className="w-full px-4 py-3 rounded-xl border border-[var(--border-medium)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--teal)] focus:ring-opacity-30"
                      />
                    </label>

                    <label className="flex flex-col gap-1.5">
                      <span className="text-xs font-medium text-[var(--text-secondary)]">Relation</span>
                      <select
                        id="ob-fm-relation"
                        value={state.family_member.relation ?? ''}
                        onChange={e => patch({ family_member: { ...state.family_member, relation: e.target.value as typeof RELATIONS[number] } })}
                        className="w-full px-4 py-3 rounded-xl border border-[var(--border-medium)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--teal)] focus:ring-opacity-30 bg-white"
                      >
                        <option value="">Select relation</option>
                        {RELATIONS.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </label>

                    <label className="flex flex-col gap-1.5">
                      <span className="text-xs font-medium text-[var(--text-secondary)]">Date of birth</span>
                      <input
                        id="ob-fm-dob"
                        type="date"
                        value={state.family_member.dob ?? ''}
                        onChange={e => patch({ family_member: { ...state.family_member, dob: e.target.value } })}
                        className="w-full px-4 py-3 rounded-xl border border-[var(--border-medium)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--teal)] focus:ring-opacity-30"
                      />
                    </label>

                    <div className="flex flex-col gap-1.5">
                      <span className="text-xs font-medium text-[var(--text-secondary)]">Biological sex</span>
                      <div className="flex gap-3">
                        {(['male', 'female'] as const).map(s => (
                          <button
                            key={s}
                            id={`ob-fm-sex-${s}`}
                            onClick={() => patch({ family_member: { ...state.family_member, sex: s } })}
                            className="flex-1 py-2.5 rounded-xl border-2 text-sm font-medium transition-all capitalize"
                            style={{
                              borderColor: state.family_member.sex === s ? 'var(--teal)' : 'var(--border-medium)',
                              background: state.family_member.sex === s ? 'var(--teal-light)' : 'white',
                              color: state.family_member.sex === s ? 'var(--teal)' : 'var(--text-secondary)',
                            }}
                          >
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {error && (
                <p className="text-sm text-[var(--danger)]">{error}</p>
              )}

              <div className="flex gap-3 mt-2">
                <button
                  onClick={() => patch({ step: 2 })}
                  className="btn-pill btn-ghost flex-1 px-4"
                >
                  Back
                </button>
                <button
                  disabled={!step3Valid || loading}
                  onClick={finish}
                  id="ob-finish"
                  className="btn-pill btn-primary flex-[2] px-6 disabled:opacity-40"
                >
                  {loading ? 'Setting up…' : 'Finish Setup →'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
