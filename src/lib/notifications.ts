// Raksh — Medicine Notification Service
// Goals:
//  1. Request browser push permission (tab-open → works in background via SW)
//  2. Schedule per-slot reminders with custom times
//  3. Use serviceWorker.showNotification() so it fires even when tab is backgrounded

export interface ScheduledDose {
  medicineName: string;
  dosage: string;
  slot: string;
  time: string; // "HH:MM" 24h
}

// ── Active timers map (key = `name-slot`)
const timers = new Map<string, ReturnType<typeof setTimeout>>();

// ── Request permission + register SW
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

export function notificationsSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function notificationsGranted(): boolean {
  return typeof window !== 'undefined' && Notification.permission === 'granted';
}

// ── Show via SW (shows even in background tab)
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
  } catch { /* fall through */ }
  // Fallback
  new Notification(title, { body, tag });
}

// ── Schedule one dose — reschedules itself daily
function scheduleOne(dose: ScheduledDose) {
  const key = `${dose.medicineName}-${dose.slot}`;
  if (timers.has(key)) clearTimeout(timers.get(key)!);

  const [h, m] = dose.time.split(':').map(Number);
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
    scheduleOne(dose); // reschedule for tomorrow
  }, delay);

  timers.set(key, id);
}

// ── Schedule all doses from localStorage
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

// ── Persist reminder schedule per medicine
interface ReminderStore {
  [medicineName: string]: ScheduledDose[];
}

function loadReminderStore(): ReminderStore {
  try { return JSON.parse(localStorage.getItem('raksh-reminders') ?? '{}'); } catch { return {}; }
}

export function saveRemindersForMedicine(medicineName: string, doses: ScheduledDose[]) {
  const store = loadReminderStore();
  store[medicineName] = doses;
  localStorage.setItem('raksh-reminders', JSON.stringify(store));
}

export function deleteRemindersForMedicine(medicineName: string) {
  const store = loadReminderStore();
  // Cancel active timers
  Object.keys(store[medicineName] ?? {}).forEach(slot => {
    const key = `${medicineName}-${slot}`;
    const t = timers.get(key);
    if (t) { clearTimeout(t); timers.delete(key); }
  });
  delete store[medicineName];
  localStorage.setItem('raksh-reminders', JSON.stringify(store));
}

// Default times per slot
export const SLOT_DEFAULT_TIMES: Record<string, string> = {
  morning  : '08:00',
  afternoon: '13:00',
  evening  : '18:00',
  night    : '21:30',
};
