import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Medicine, MedicineLog, DoseTimeSlot, DoseStatus, TodayDose } from '../lib/types';

interface UseMedicinesResult {
  medicines: Medicine[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  addMedicine: (med: Omit<Medicine, 'id'>) => Promise<{ error: string | null }>;
  updateMedicine: (id: string, patch: Partial<Medicine>) => Promise<{ error: string | null }>;
  deleteMedicine: (id: string) => Promise<{ error: string | null }>;
  todayDoses: TodayDose[];
  markDose: (medicineId: string, slot: DoseTimeSlot, wasTaken: boolean) => Promise<{ error: string | null }>;
}

function todayIso(): string {
  return new Date().toISOString().split('T')[0];
}

function slotForTime(time: string): DoseTimeSlot {
  const map: Record<string, DoseTimeSlot> = {
    morning: 'morning',
    afternoon: 'afternoon',
    evening: 'evening',
    night: 'night',
  };
  return map[time.toLowerCase()] ?? 'morning';
}

export function useMedicines(
  userId: string | undefined,
  familyMemberId?: string | null,
): UseMedicinesResult {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [todayLogs, setTodayLogs] = useState<MedicineLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  const refetch = useCallback(() => setVersion(v => v + 1), []);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }

    let mounted = true;
    setLoading(true);

    const today = todayIso();

    const medQuery = supabase
      .from('medicines')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('name');

    if (familyMemberId) {
      medQuery.eq('family_member_id', familyMemberId);
    } else {
      medQuery.is('family_member_id', null);
    }

    const logsQuery = supabase
      .from('medicine_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('taken_at', `${today}T00:00:00`)
      .lte('taken_at', `${today}T23:59:59`);

    Promise.all([medQuery, logsQuery]).then(([medRes, logRes]) => {
      if (!mounted) return;
      if (medRes.error) setError(medRes.error.message);
      else {
        setMedicines((medRes.data ?? []) as Medicine[]);
        setTodayLogs((logRes.data ?? []) as MedicineLog[]);
      }
      setLoading(false);
    });

    return () => { mounted = false; };
  }, [userId, familyMemberId, version]);

  // Build today's dose schedule
  const todayDoses: TodayDose[] = medicines.flatMap(med =>
    (med.times ?? []).map(time => {
      const slot = slotForTime(time);
      const log = todayLogs.find(l => l.medicine_id === med.id);
      const status: DoseStatus = log
        ? log.was_taken ? 'taken' : 'skipped'
        : 'pending';
      return {
        medicine: med,
        slot,
        status,
        log_id: log?.id ?? null,
      };
    })
  );

  const addMedicine = useCallback(async (med: Omit<Medicine, 'id'>) => {
    const { error: err } = await supabase.from('medicines').insert(med);
    if (!err) refetch();
    return { error: err?.message ?? null };
  }, [refetch]);

  const updateMedicine = useCallback(async (id: string, patch: Partial<Medicine>) => {
    const { error: err } = await supabase.from('medicines').update(patch).eq('id', id);
    if (!err) refetch();
    return { error: err?.message ?? null };
  }, [refetch]);

  const deleteMedicine = useCallback(async (id: string) => {
    const { error: err } = await supabase.from('medicines').update({ is_active: false }).eq('id', id);
    if (!err) refetch();
    return { error: err?.message ?? null };
  }, [refetch]);

  const markDose = useCallback(async (medicineId: string, _slot: DoseTimeSlot, wasTaken: boolean) => {
    const existing = todayLogs.find(l => l.medicine_id === medicineId);

    if (existing) {
      const { error: err } = await supabase
        .from('medicine_logs')
        .update({ was_taken: wasTaken })
        .eq('id', existing.id);
      if (!err) refetch();
      return { error: err?.message ?? null };
    }

    const log: Omit<MedicineLog, 'id'> = {
      medicine_id: medicineId,
      user_id: userId!,
      taken_at: new Date().toISOString(),
      was_taken: wasTaken,
    };
    const { error: err } = await supabase.from('medicine_logs').insert(log);
    if (!err) refetch();
    return { error: err?.message ?? null };
  }, [todayLogs, userId, refetch]);

  return {
    medicines,
    loading,
    error,
    refetch,
    addMedicine,
    updateMedicine,
    deleteMedicine,
    todayDoses,
    markDose,
  };
}
