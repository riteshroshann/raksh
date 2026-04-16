import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { VitalLog, VitalType } from '../lib/types';

interface UseVitalsResult {
  logs: VitalLog[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  addLog: (log: Omit<VitalLog, 'id'>) => Promise<{ error: string | null }>;
  deleteLog: (id: string) => Promise<{ error: string | null }>;
  updateLog: (id: string, patch: Partial<VitalLog>) => Promise<{ error: string | null }>;
}

export function useVitals(
  userId: string | undefined,
  vitalType: VitalType,
  familyMemberId?: string | null,
  limit = 30,
): UseVitalsResult {
  const [logs, setLogs] = useState<VitalLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  const refetch = useCallback(() => setVersion(v => v + 1), []);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    let mounted = true;
    setLoading(true);
    setError(null);

    const query = supabase
      .from('vitals_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('vital_type', vitalType)
      .order('logged_at', { ascending: false })
      .limit(limit);

    if (familyMemberId) {
      query.eq('family_member_id', familyMemberId);
    } else {
      query.is('family_member_id', null);
    }

    query.then(({ data, error: err }) => {
      if (!mounted) return;
      if (err) {
        setError(err.message);
      } else {
        setLogs((data ?? []) as VitalLog[]);
      }
      setLoading(false);
    });

    return () => { mounted = false; };
  }, [userId, vitalType, familyMemberId, limit, version]);

  const addLog = useCallback(async (log: Omit<VitalLog, 'id'>) => {
    const { error: err } = await supabase.from('vitals_logs').insert(log);
    if (!err) refetch();
    return { error: err?.message ?? null };
  }, [refetch]);

  const deleteLog = useCallback(async (id: string) => {
    const { error: err } = await supabase.from('vitals_logs').delete().eq('id', id);
    if (!err) refetch();
    return { error: err?.message ?? null };
  }, [refetch]);

  const updateLog = useCallback(async (id: string, patch: Partial<VitalLog>) => {
    const { error: err } = await supabase.from('vitals_logs').update(patch).eq('id', id);
    if (!err) refetch();
    return { error: err?.message ?? null };
  }, [refetch]);

  return { logs, loading, error, refetch, addLog, deleteLog, updateLog };
}
