// Local-time day keys ('YYYY-MM-DD') for streaks, daily cap and daily quests.

export function dayKey(ts: number = Date.now()): string {
  const d = new Date(ts);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

export function addDays(key: string, delta: number): string {
  const [y, m, d] = key.split('-').map(Number);
  return dayKey(new Date(y, m - 1, d + delta).getTime());
}

export function isToday(ts: number): boolean {
  return dayKey(ts) === dayKey();
}

/** Time left until local midnight, e.g. "4h 12m". */
export function untilMidnight(now: number = Date.now()): string {
  const d = new Date(now);
  const midnight = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1).getTime();
  const mins = Math.max(0, Math.floor((midnight - now) / 60000));
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

export function formatElapsed(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const mm = String(m).padStart(2, '0');
  const ss = String(s).padStart(2, '0');
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

export function greeting(now: number = Date.now()): string {
  const h = new Date(now).getHours();
  if (h < 12) return 'Pagi';
  if (h < 19) return 'Petang';
  return 'Malam';
}
