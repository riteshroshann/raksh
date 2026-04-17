// Raksh — Medicine Notification Service
// iOS Safari has NO Notification API at all — every access must be guarded.

export interface ScheduledDose {
  medicineName: string;
  dosage: string;
  slot: string;
  time: string; // "HH:MM" 24h
}

// ── Safe check — works on iOS/Android/Safari/Chrome
function notifApi(): typeof Notification | null {
  try {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return window.Notification as typeof Notification;
    }
  } catch { /* some iOS WebViews throw even on 'in' checks */ }
  return null;
}

// ── Active timers map
const timers = new Map<string, ReturnType<typeof setTimeout>>();

// ── Request permission
export async function requestNotificationPermission(): Promise<boolean> {
  const N = notifApi();
  if (!N) return false; // iOS Safari — silently skip
  try {
    if (N.permission === 'granted') return true;
    if (N.permission === 'denied')  return false;
    const result = await N.requestPermission();
    return result === 'granted';
  } catch {
    return false;
  }
}

export function notificationsSupported(): boolean {
  return notifApi() !== null;
}

export function notificationsGranted(): boolean {
  try {
    const N = notifApi();
    return N?.permission === 'granted';
  } catch {
    return false;
  }
}

// ── Show notification via Service Worker (works backgrounded)
async function fireNotification(title: string, body: string, tag: string) {
  if (!notificationsGranted()) return;
  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready;
      await reg.showNotification(title, {
        body,
        tag,
        icon: '/raksh-icon.png',
        badge: '/raksh-icon.png',
        requireInteraction: true,
        data: { url: '/medicines' },
      });
      return;
    }
  } catch { /* fallthrough to inline */ }

  // Fallback only if supported
  try {
    const N = notifApi();
    if (N) new N(title, { body, tag });
  } catch { /* silently skip on iOS */ }
}

// ── Schedule one dose — reschedules itself daily
function scheduleOne(dose: ScheduledDose) {
  const key = `${dose.medicineName}-${dose.slot}`;
  if (timers.has(key)) clearTimeout(timers.get(key)!);

  const parts = (dose.time ?? '08:00').split(':').map(Number);
  const h = parts[0] ?? 8;
  const m = parts[1] ?? 0;
  const now    = new Date();
  const target = new Date();
  target.setHours(h, m, 0, 0);
  if (target.getTime() <= now.getTime()) {
    target.setDate(target.getDate() + 1);
  }
  const delay = target.getTime() - now.getTime();

  const id = setTimeout(async () => {
    await fireNotification(
      '💊 Medicine Reminder — Raksh',
      `Time to take ${dose.medicineName} (${dose.dosage}) — ${dose.slot}`,
      key
    );
    scheduleOne(dose);
  }, delay);

  timers.set(key, id);
}

// ── Schedule all reminders from localStorage
export function scheduleAllReminders() {
  if (!notificationsGranted()) return;
  const stored = loadReminderStore();
  for (const med of Object.values(stored)) {
    for (const d of med) scheduleOne(d);
  }
}

// ── Cancel all
export function cancelAllReminders() {
  timers.forEach(t => clearTimeout(t));
  timers.clear();
}

// ── Persist reminder schedule
interface ReminderStore {
  [medicineName: string]: ScheduledDose[];
}

function loadReminderStore(): ReminderStore {
  try { return JSON.parse(localStorage.getItem('raksh-reminders') ?? '{}'); } catch { return {}; }
}

export function saveRemindersForMedicine(medicineName: string, doses: ScheduledDose[]) {
  const store = loadReminderStore();
  store[medicineName] = doses;
  try { localStorage.setItem('raksh-reminders', JSON.stringify(store)); } catch {}
}

export function deleteRemindersForMedicine(medicineName: string) {
  const store = loadReminderStore();
  Object.keys(store[medicineName] ?? {}).forEach(slot => {
    const key = `${medicineName}-${slot}`;
    const t = timers.get(key);
    if (t) { clearTimeout(t); timers.delete(key); }
  });
  delete store[medicineName];
  try { localStorage.setItem('raksh-reminders', JSON.stringify(store)); } catch {}
}

// Default times per slot
export const SLOT_DEFAULT_TIMES: Record<string, string> = {
  morning  : '08:00',
  afternoon: '13:00',
  evening  : '18:00',
  night    : '21:30',
};
