import { type Condition, type VitalStatus, type VitalType } from './types';

export const CONDITION_COLORS: Record<Condition, string> = {
  Diabetes: '#B91C1C',
  Thyroid: '#7C3AED',
  Heart: '#EA580C',
  Kidney: '#0D9488',
  Hypertension: '#1D4ED8',
};

export const CONDITION_BG: Record<Condition, string> = {
  Diabetes: '#FEF2F2',
  Thyroid: '#F5F3FF',
  Heart: '#FFF7ED',
  Kidney: '#F0FDFA',
  Hypertension: '#EFF6FF',
};

export function classifyBP(sys: number, dia: number): VitalStatus {
  if (sys >= 180 || dia >= 120) return 'crisis';
  if (sys >= 140 || dia >= 90) return 'high';
  if (sys >= 130 || dia >= 80) return 'elevated';
  if (sys < 90 || dia < 60) return 'low';
  return 'normal';
}

export function classifyFastingSugar(value: number): VitalStatus {
  if (value >= 200) return 'crisis';
  if (value >= 126) return 'high';
  if (value >= 100) return 'elevated';
  if (value < 70) return 'low';
  return 'normal';
}

export function classifyPostMealSugar(value: number): VitalStatus {
  if (value >= 300) return 'crisis';
  if (value >= 200) return 'high';
  if (value >= 140) return 'elevated';
  if (value < 70) return 'low';
  return 'normal';
}

export function classifySpO2(value: number): VitalStatus {
  if (value < 90) return 'crisis';
  if (value < 94) return 'low';
  if (value < 95) return 'elevated';
  return 'normal';
}

export function classifyHeartRate(bpm: number): VitalStatus {
  if (bpm > 150 || bpm < 40) return 'crisis';
  if (bpm > 100) return 'high';
  if (bpm < 60) return 'low';
  return 'normal';
}

export const VITAL_META: Record<VitalType, { label: string; unit: string; emoji: string }> = {
  blood_pressure:        { label: 'Blood Pressure', unit: 'mmHg', emoji: '🫀' },
  blood_sugar_fasting:   { label: 'Sugar (Fasting)', unit: 'mg/dL', emoji: '🩸' },
  blood_sugar_postmeal:  { label: 'Sugar (Post-meal)', unit: 'mg/dL', emoji: '🍽️' },
  blood_sugar_random:    { label: 'Sugar (Random)', unit: 'mg/dL', emoji: '🩸' },
  heart_rate:            { label: 'Heart Rate', unit: 'bpm', emoji: '💓' },
  weight:                { label: 'Weight', unit: 'kg', emoji: '⚖️' },
  temperature:           { label: 'Temperature', unit: '°F', emoji: '🌡️' },
  spo2:                  { label: 'SpO2', unit: '%', emoji: '💨' },
};

export const STATUS_LABELS: Record<VitalStatus, string> = {
  normal: 'NORMAL',
  elevated: 'ELEVATED',
  high: 'HIGH',
  low: 'LOW',
  crisis: 'HIGH',
};

export const STATUS_CLASSES: Record<VitalStatus, string> = {
  normal:   'badge badge-normal',
  elevated: 'badge badge-elevated',
  high:     'badge badge-high',
  low:      'badge badge-low',
  crisis:   'badge badge-high pulse-danger',
};

export function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function relativeDay(isoString: string): string {
  const d = new Date(isoString);
  const today = new Date();
  const diff = today.getDate() - d.getDate();
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return formatDate(isoString);
}

export const SLOT_LABELS = {
  morning:   'Morning',
  afternoon: 'Afternoon',
  evening:   'Evening',
  night:     'Night',
} as const;

export const SLOT_TIMES = {
  morning:   '8:00 AM',
  afternoon: '1:00 PM',
  evening:   '6:00 PM',
  night:     '10:00 PM',
} as const;
