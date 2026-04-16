// ─── Database entity types (mirrors Supabase schema exactly) ───────────────

export interface Profile {
  id: string;
  full_name: string;
  dob: string;                  // ISO date string
  sex: 'male' | 'female';
  photo_url: string | null;
  conditions: Condition[];
  created_at: string;
}

export interface FamilyMember {
  id: string;
  owner_id: string;
  name: string;
  relation: 'Spouse' | 'Parent' | 'Child' | 'Sibling' | 'Other';
  dob: string;
  sex: 'male' | 'female';
  color: string;
  conditions: Condition[];
}

export type VitalType =
  | 'blood_pressure'
  | 'blood_sugar_fasting'
  | 'blood_sugar_postmeal'
  | 'blood_sugar_random'
  | 'heart_rate'
  | 'weight'
  | 'temperature'
  | 'spo2';

export interface VitalLog {
  id: string;
  user_id: string;
  family_member_id: string | null;
  vital_type: VitalType;
  value_1: number;          // primary value (systolic for BP, reading for others)
  value_2: number | null;   // secondary value (diastolic for BP)
  unit: string;
  logged_at: string;        // ISO timestamp
  notes: string | null;
}

export type MedicineFrequency = 'once' | 'twice' | 'thrice' | 'as_needed' | 'weekly';

export interface Medicine {
  id: string;
  user_id: string;
  family_member_id: string | null;
  name: string;
  dosage: string;
  frequency: MedicineFrequency;
  times: string[];             // e.g. ['morning', 'night']
  food_instruction: 'before' | 'after' | 'with' | 'empty_stomach' | null;
  condition_tag: Condition | null;
  quantity_total: number | null;
  quantity_remaining: number | null;
  start_date: string;
  refill_threshold: number | null;
  doctor: string | null;
  notes: string | null;
  is_active: boolean;
}

export interface MedicineLog {
  id: string;
  medicine_id: string;
  user_id: string;
  taken_at: string;
  was_taken: boolean;
}

export interface WaitlistEntry {
  id: string;
  email: string;
  created_at: string;
}

// ─── Domain types ──────────────────────────────────────────────────────────

export type Condition =
  | 'Diabetes'
  | 'Thyroid'
  | 'Heart'
  | 'Kidney'
  | 'Hypertension';

export type VitalStatus = 'normal' | 'elevated' | 'high' | 'low' | 'crisis';

export type DoseTimeSlot = 'morning' | 'afternoon' | 'evening' | 'night';

export type DoseStatus = 'pending' | 'taken' | 'skipped' | 'missed';

// ─── UI types ──────────────────────────────────────────────────────────────

export interface TodayDose {
  medicine: Medicine;
  slot: DoseTimeSlot;
  status: DoseStatus;
  log_id: string | null;
}

export interface VitalReading {
  log: VitalLog;
  status: VitalStatus;
  display: string;            // formatted value string
}

export interface OnboardingState {
  step: 1 | 2 | 3;
  full_name: string;
  dob: string;
  sex: 'male' | 'female' | '';
  conditions: Condition[];
  has_family: boolean;
  family_member: Partial<FamilyMember>;
}

export interface AppUser {
  id: string;
  email: string;
  profile: Profile | null;
}
