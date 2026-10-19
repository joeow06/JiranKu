import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { DAILY_TILE_IDS, GREEN_BADGE_ID, ME, makeSeed, quests, rewards } from '@/data/seed';
import type { CheckIn, PointsEntry, Redemption, Session, User } from '@/data/types';
import { addDays, dayKey, isToday } from '@/lib/dates';
import { CHEST_BONUS, balance, capAward } from '@/lib/points';

let counter = 0;
const uid = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${(counter++).toString(36)}`;

interface PersistedState {
  user: User;
  sessions: Session[];
  checkIns: CheckIn[];
  ledger: PointsEntry[];
  redemptions: Redemption[];
  seededAt: number;
}

interface AppState extends PersistedState {
  /** Verify photo URI — cache only, never persisted (decision #7). */
  lastPhoto: { sessionId: string; uri: string } | null;

  completeOnboarding: (input: { interests: string[]; ageBand: string; neighbourhoodId: string }) => void;
  mockVerify: () => void;
  joinQuest: (questId: string) => string;
  checkIn: (sessionId: string) => void;
  completeSession: (sessionId: string, photoUri: string | null) => void;
  redeem: (rewardId: string) => boolean;
  resetDemo: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...makeSeed(),
      lastPhoto: null,

      // MOCK: identity check (KYC) — no ID is scanned; the user is simply marked verified.
      mockVerify: () => set((s) => ({ user: { ...s.user, verification: 'mock_verified' } })),

      completeOnboarding: ({ interests, ageBand, neighbourhoodId }) =>
        set((s) => ({ user: { ...s.user, interests, ageBand, neighbourhoodId, onboarded: true } })),

      joinQuest: (questId) => {
        const open = get().sessions.find((x) => x.questId === questId && x.status !== 'completed');
        if (open) return open.id;
        const quest = quests.find((q) => q.id === questId)!;
        const session: Session = {
          id: uid('s'),
          questId,
          participantIds: [ME, ...quest.mockParticipants.map((p) => p.id)],
          status: 'joined',
          joinedAt: Date.now(),
          verifySimulated: true, // MOCK: other participants are auto-readied on this device in Verify
        };
        set((s) => ({ sessions: [...s.sessions, session] }));
        return session.id;
      },

      // MOCK: GPS check-in — no location is read; check-in always succeeds.
      checkIn: (sessionId) => {
        const now = Date.now();
        const checkIn: CheckIn = { id: uid('c'), sessionId, userId: ME, at: now, method: 'mock_gps', status: 'verified_mock' };
        set((s) => ({
          checkIns: [...s.checkIns, checkIn],
          sessions: s.sessions.map((x) => (x.id === sessionId ? { ...x, status: 'checked_in', startedAt: now } : x)),
        }));
      },

      completeSession: (sessionId, photoUri) => {
        const s = get();
        const session = s.sessions.find((x) => x.id === sessionId);
        if (!session || session.status === 'completed') return;
        const quest = quests.find((q) => q.id === session.questId)!;
        const now = Date.now();
        const ledger = [...s.ledger];

        const awarded = capAward(ledger, quest.points);
        if (awarded > 0) {
          ledger.push({ id: uid('p'), userId: ME, amount: awarded, reason: 'quest', label: quest.title, refId: sessionId, at: now });
        }

        // Daily chest: all three daily tiles completed today → bonus (once).
        let chestBonus = 0;
        if (quest.type === 'daily') {
          const doneToday = new Set(
            s.sessions.filter((x) => x.status === 'completed' && x.completedAt && isToday(x.completedAt)).map((x) => x.questId),
          );
          doneToday.add(quest.id);
          const chestOpened = ledger.some((e) => e.reason === 'chest' && isToday(e.at));
          if (DAILY_TILE_IDS.every((id) => doneToday.has(id)) && !chestOpened) {
            chestBonus = capAward(ledger, CHEST_BONUS);
            if (chestBonus > 0) {
              ledger.push({ id: uid('p'), userId: ME, amount: chestBonus, reason: 'chest', label: 'Daily chest', at: now });
            }
          }
        }

        // Streak: +1 once per calendar day; a missed day restarts it.
        const today = dayKey(now);
        const { streak } = s.user;
        let count = streak.count;
        if (streak.lastActiveDay !== today) count = streak.lastActiveDay === addDays(today, -1) ? count + 1 : 1;

        // Green quests unlock Green Jiran; other quests may have their own badge.
        const badgeId = quest.category === 'green' ? GREEN_BADGE_ID : quest.badgeId;
        const newBadge = badgeId && !s.user.badges.includes(badgeId) ? badgeId : null;

        set({
          ledger,
          lastPhoto: photoUri ? { sessionId, uri: photoUri } : null,
          user: {
            ...s.user,
            streak: { count, best: Math.max(streak.best, count), lastActiveDay: today },
            badges: newBadge ? [...s.user.badges, newBadge] : s.user.badges,
          },
          sessions: s.sessions.map((x) =>
            x.id === sessionId
              ? {
                  ...x,
                  status: 'completed',
                  completedAt: now,
                  result: {
                    awarded,
                    requested: quest.points,
                    chestBonus,
                    streakAfter: count,
                    badgeUnlocked: newBadge,
                    photo: !!photoUri,
                  },
                }
              : x,
          ),
        });
      },

      // MOCK: issue a local voucher record; partner redemption is not integrated.
      redeem: (rewardId) => {
        const s = get();
        const reward = rewards.find((r) => r.id === rewardId);
        if (!reward || reward.locked) return false;
        if (s.redemptions.some((r) => r.rewardId === rewardId)) return false;
        if (balance(s.ledger) < reward.cost) return false;
        const now = Date.now();
        set({
          ledger: [...s.ledger, { id: uid('p'), userId: ME, amount: -reward.cost, reason: 'redeem', label: reward.title, refId: rewardId, at: now }],
          redemptions: [
            ...s.redemptions,
            {
              id: uid('r'),
              rewardId,
              at: now,
              expiresAt: now + 30 * 24 * 60 * 60 * 1000,
              voucherCode: uid('v').toUpperCase(),
            },
          ],
        });
        return true;
      },

      resetDemo: () => set({ ...makeSeed(), lastPhoto: null }),
    }),
    {
      // v3: start account creation unverified, including for devices with an older demo session.
      name: 'jiranku-v3',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s): PersistedState => ({
        user: s.user,
        sessions: s.sessions,
        checkIns: s.checkIns,
        ledger: s.ledger,
        redemptions: s.redemptions,
        seededAt: s.seededAt,
      }),
    },
  ),
);
