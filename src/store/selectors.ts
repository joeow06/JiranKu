import { DAILY_TILE_IDS, SEED_TREES_PLANTED, neighbourhoodQuests, quests } from '@/data/seed';
import type { Session } from '@/data/types';
import { isToday } from '@/lib/dates';
import { balance, earnedToday, levelInfo, lifetimeXp } from '@/lib/points';

import { useAppStore } from './useAppStore';

export const useBalance = () => useAppStore((s) => balance(s.ledger));
export const useEarnedToday = () => useAppStore((s) => earnedToday(s.ledger));
export const useXp = () => useAppStore((s) => lifetimeXp(s.ledger));
export const useLevel = () => levelInfo(useXp());

export type QuestState = 'open' | 'active' | 'done';

export function questState(sessions: Session[], questId: string): QuestState {
  const quest = quests.find((q) => q.id === questId);
  const mine = sessions.filter((s) => s.questId === questId);
  if (mine.some((s) => s.status !== 'completed')) return 'active';
  const done = mine.some(
    (s) => s.status === 'completed' && (quest?.type !== 'daily' || (s.completedAt != null && isToday(s.completedAt))),
  );
  return done ? 'done' : 'open';
}

export const useQuestState = (questId: string) => useAppStore((s) => questState(s.sessions, questId));

export const useChestProgress = () =>
  useAppStore((s) => DAILY_TILE_IDS.filter((id) => questState(s.sessions, id) === 'done').length);

export const useOpenSession = (questId: string) =>
  useAppStore((s) => s.sessions.find((x) => x.questId === questId && x.status !== 'completed'));

const treesFromQuests = (sessions: Session[]) =>
  sessions
    .filter((s) => s.status === 'completed')
    .reduce((sum, s) => sum + (quests.find((q) => q.id === s.questId)?.treesPlanted ?? 0), 0);

/** Trees you've planted (seeded history + completed tree-planting quests). */
export const useTreesPlanted = () => useAppStore((s) => SEED_TREES_PLANTED + treesFromQuests(s.sessions));

/** A neighbourhood quest with your newly planted trees added to the tree raid. */
export function useNeighbourhoodQuest(id: string) {
  const extraTrees = useAppStore((s) => treesFromQuests(s.sessions));
  const q = neighbourhoodQuests.find((m) => m.id === id)!;
  return q.unit === 'trees' ? { ...q, progress: Math.min(q.target, q.progress + extraTrees) } : q;
}
