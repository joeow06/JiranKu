// Seed data — the single source for quests, raids, events, badges and rewards.
// MOCK: all people, places, numbers and progress below are seeded sample data (no backend).

import { addDays, dayKey } from '@/lib/dates';
import { colors } from '@/theme/tokens';

import type {
  Badge,
  EventQuest,
  Neighbourhood,
  NeighbourhoodQuest,
  PointsEntry,
  Quest,
  QuestCategory,
  Reward,
  Session,
  User,
} from './types';

export const ME = 'u-aisyah';

// MOCK: other participants are seeded people, not real accounts.
const weiJie = { id: 'u-weijie', name: 'Wei Jie', verified: true };
const kumar = { id: 'u-kumar', name: 'Kumar', verified: true };
const meiLing = { id: 'u-meiling', name: 'Mei Ling', verified: true };
const farah = { id: 'u-farah', name: 'Farah', verified: true };

/** Tag colour + icon per quest category. */
export const questCategories: Record<QuestCategory, { label: string; color: string; tint: string; icon: 'leaf' | null }> = {
  social: { label: 'SOCIAL', color: colors.ink, tint: colors.mutedBg, icon: null },
  green: { label: 'GREEN', color: colors.tealStrong, tint: colors.tealTint, icon: 'leaf' }, // teal #1E7C83
};

// Shared verify copy. MOCK: GPS check-in is simulated in code (see store checkIn).
const verifyAt = (place: string) => `Check-in at ${place}, then a 3-2-1 group photo.`;

export const quests: Quest[] = [
  {
    id: 'q-highfive',
    type: 'daily',
    category: 'social',
    title: 'High-five a neighbour',
    tileLabel: 'High-five',
    icon: 'highfive',
    points: 20,
    venue: { name: 'Taman Tasik Putra Heights', spot: 'Playground entrance' },
    when: 'Today, any time',
    durationMin: 5,
    groupMin: 2,
    groupMax: 2,
    mockParticipants: [kumar],
    verifyMethod: verifyAt('the park'),
  },
  {
    id: 'q-litter',
    type: 'daily',
    category: 'green',
    title: 'Litter pick-up walk (15 min)',
    tileLabel: 'Litter walk',
    icon: 'leaf',
    points: 20,
    venue: { name: 'Tasik Putra Heights', spot: 'Jogging track, main entrance' },
    when: 'Today, 6:30 PM',
    durationMin: 15,
    groupMin: 2,
    groupMax: 4,
    mockParticipants: [meiLing, weiJie],
    sharedInterest: 'Hiking',
    verifyMethod: verifyAt('the lake entrance'),
  },
  {
    id: 'q-garden',
    type: 'daily',
    category: 'green',
    title: 'Water the community garden',
    tileLabel: 'Garden',
    icon: 'droplet',
    points: 20,
    venue: { name: 'Putra Heights community garden', spot: 'Main gate' },
    when: 'Today, 7:00 PM',
    durationMin: 20,
    groupMin: 2,
    groupMax: 4,
    mockParticipants: [kumar],
    sharedInterest: 'Gardening',
    verifyMethod: verifyAt('the garden gate'),
  },
  {
    id: 'q-badminton',
    type: 'weekly',
    category: 'social',
    title: 'Badminton session',
    tileLabel: 'Badminton',
    icon: 'badminton',
    points: 120,
    venue: { name: 'Dewan Putra Heights', spot: 'Court 2' },
    when: 'Sat, 8:00 PM',
    durationMin: 60,
    groupMin: 4,
    groupMax: 6,
    mockParticipants: [weiJie, kumar, meiLing],
    sharedInterest: 'Badminton',
    verifyMethod: verifyAt('the court'),
    badgeId: 'b-smash',
  },
  {
    id: 'q-saplings',
    type: 'weekly',
    category: 'green',
    title: 'Plant saplings at Tasik Putra Heights',
    tileLabel: 'Saplings',
    icon: 'sprout',
    points: 120,
    venue: { name: 'Tasik Putra Heights', spot: 'East lawn' },
    when: 'Sat, 8:00 AM',
    durationMin: 90,
    groupMin: 4,
    groupMax: 8,
    mockParticipants: [farah, weiJie, meiLing],
    sharedInterest: 'Gardening',
    verifyMethod: verifyAt('the east lawn'),
    treesPlanted: 5,
  },
  {
    id: 'q-recycle',
    type: 'weekly',
    category: 'green',
    title: 'Recycling sort-and-drop run',
    tileLabel: 'Recycling',
    icon: 'recycle',
    points: 120,
    venue: { name: 'Putra Heights recycling centre', spot: 'Drop-off bays' },
    when: 'Sun, 10:00 AM',
    durationMin: 60,
    groupMin: 4,
    groupMax: 6,
    mockParticipants: [kumar, farah, meiLing],
    verifyMethod: verifyAt('the drop-off bays'),
  },
];

export const DAILY_TILE_IDS = ['q-highfive', 'q-litter', 'q-garden'];

// MOCK: neighbourhood-wide progress is seeded, not aggregated from real users.
export const neighbourhoodQuests: NeighbourhoodQuest[] = [
  {
    id: 'm-trees',
    category: 'green',
    title: 'Plant 100 trees together',
    points: 400,
    progress: 62,
    target: 100,
    unit: 'trees',
    contributing: 48,
    tag: 'Progress bar',
  },
  {
    id: 'm-meetups',
    category: 'social',
    title: '20 meetups this month',
    points: 400,
    progress: 11,
    target: 20,
    unit: 'meetups',
    contributing: 64,
    tag: 'Set by JMB',
  },
];

export const events: EventQuest[] = [
  {
    id: 'e-gotong',
    category: 'green',
    title: 'Gotong-royong clean-up + tree planting day',
    points: 800,
    when: 'Sat, 31 Oct · 8:00 AM',
    venue: 'Putra Heights field',
    going: '42 / 60 going',
    tag: 'JMB event',
  },
];

export const neighbourhoods: Neighbourhood[] = [
  { id: 'n-putra-heights', name: 'Putra Heights', area: 'Subang Jaya', raidId: 'm-trees', raidRank: '#3 in Subang' },
];

// Trees you'd planted before the seeded history starts; completed tree quests add to it.
export const SEED_TREES_PLANTED = 4;

// MOCK: map hotspots are fixed illustrative data, not live activity.
export const hotspots = [
  { name: 'Tasik Putra Heights', live: '3 quests live', questId: 'q-litter' },
  { name: 'Putra Heights community garden', live: '1 quest live', questId: 'q-garden' },
];

export const GREEN_BADGE_ID = 'b-green';

export const badges: Badge[] = [
  { id: 'b-hello', name: 'First Hello', description: 'Completed your first quest' },
  { id: 'b-early', name: 'Early Bird', description: 'Quest before 8 AM' },
  { id: 'b-raid', name: 'Raid Helper', description: 'Contributed to a Neighbourhood Raid' },
  { id: GREEN_BADGE_ID, name: 'Green Jiran', description: 'Completed a Green quest' },
  { id: 'b-smash', name: 'Smash Jiran', description: 'Played badminton with neighbours' },
];

// MOCK: rewards are not connected to any partner; redeeming only deducts JP locally.
export const rewards: Reward[] = [
  { id: 'r-teh', title: 'Teh tarik + roti canai', partnerId: 'mamak', category: 'Makan', cost: 300 },
  { id: 'r-store', title: 'RM5 store voucher', partnerId: 'convenience', category: 'Groceries', cost: 500 },
  { id: 'r-refill', title: 'RM10 zero-waste refill voucher', partnerId: 'zeroWaste', category: 'Green', cost: 400 },
  { id: 'r-gym', title: 'Gym day pass', partnerId: 'gym', category: 'Fitness', cost: 1500 },
  { id: 'r-tng', title: 'eWallet reload reward', partnerId: 'ewallet', category: 'eWallet', cost: 2000, locked: true },
];

/** Fresh starting state, with timestamps relative to `now` so "today" numbers line up. */
export function makeSeed(now: number = Date.now()) {
  const today = dayKey(now);
  const user: User = {
    id: ME,
    name: 'Aisyah',
    neighbourhoodId: null,
    interests: [],
    ageBand: null,
    verification: 'none',
    streak: { count: 5, best: 11, lastActiveDay: addDays(today, -1) },
    badges: ['b-hello', 'b-early', 'b-raid'],
    onboarded: false,
  };

  // High-five is already done today (wireframe shows it as "Done").
  const seededSession: Session = {
    id: 's-seed-highfive',
    questId: 'q-highfive',
    participantIds: [ME, kumar.id],
    status: 'completed',
    joinedAt: now - 3 * 3600_000,
    startedAt: now - 3 * 3600_000,
    completedAt: now - 3 * 3600_000 + 5 * 60_000,
    verifySimulated: true,
  };

  // Balance 1,240 JP; 140 of it earned today → "Today: 140 / 300".
  const ledger: PointsEntry[] = [
    { id: 'p-seed-1', userId: ME, amount: 1100, reason: 'seed', label: 'Earlier quests', at: now - 3 * 86400_000 },
    { id: 'p-seed-2', userId: ME, amount: 120, reason: 'seed', label: 'Weekly quest', at: now - 4 * 3600_000 },
    { id: 'p-seed-3', userId: ME, amount: 20, reason: 'quest', label: 'High-five a neighbour', refId: seededSession.id, at: seededSession.completedAt! },
  ];

  return { user, sessions: [seededSession], checkIns: [], ledger, redemptions: [], seededAt: now };
}
