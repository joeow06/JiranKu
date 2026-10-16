import type { PointsEntry } from '@/data/types';

import { isToday } from './dates';

// Placeholder values — point economics are TBD in the spec (§5.1, §15.7).
export const DAILY_CAP = 300;
export const CHEST_BONUS = 50;

const LEVELS: { min: number; name: string }[] = [
  { min: 0, name: 'Jiran Baru' },
  { min: 100, name: 'Jiran Baru' },
  { min: 250, name: 'Jiran Mesra' },
  { min: 450, name: 'Jiran Mesra' },
  { min: 650, name: 'Jiran Mesra' },
  { min: 850, name: 'Jiran Muda' },
  { min: 1000, name: 'Jiran Muda' },
  { min: 2000, name: 'Jiran Hebat' },
  { min: 3000, name: 'Jiran Hebat' },
  { min: 4500, name: 'Ketua Jiran' },
];

export function balance(ledger: PointsEntry[]): number {
  return ledger.reduce((sum, e) => sum + e.amount, 0);
}

/** SP earned today (counts against the daily cap). Spending doesn't free up cap. */
export function earnedToday(ledger: PointsEntry[]): number {
  return ledger.filter((e) => e.amount > 0 && isToday(e.at)).reduce((s, e) => s + e.amount, 0);
}

/** XP = lifetime SP earned, so redeeming never lowers your level. */
export function lifetimeXp(ledger: PointsEntry[]): number {
  return ledger.filter((e) => e.amount > 0).reduce((s, e) => s + e.amount, 0);
}

export function capAward(ledger: PointsEntry[], amount: number): number {
  return Math.max(0, Math.min(amount, DAILY_CAP - earnedToday(ledger)));
}

export function levelInfo(xp: number) {
  let idx = 0;
  for (let i = 0; i < LEVELS.length; i++) if (xp >= LEVELS[i].min) idx = i;
  const cur = LEVELS[idx];
  const next = LEVELS[idx + 1];
  return {
    level: idx + 1,
    name: cur.name,
    toNext: next ? next.min - xp : 0,
    progress: next ? (xp - cur.min) / (next.min - cur.min) : 1,
  };
}
