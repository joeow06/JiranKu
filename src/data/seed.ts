// Demo seed data from the wireframes. All names, places and numbers are placeholders.

import { addDays, dayKey } from '@/lib/dates';

import type { Badge, Neighbourhood, PointsEntry, Quest, Reward, Session, User } from './types';

export const ME = 'u-aisyah';

const weiJie = { id: 'u-weijie', name: 'Wei Jie', verified: true };
const kumar = { id: 'u-kumar', name: 'Kumar', verified: true };
const meiLing = { id: 'u-meiling', name: 'Mei Ling', verified: true };
const farah = { id: 'u-farah', name: 'Farah', verified: true };

export const neighbourhoods: Neighbourhood[] = [
  {
    id: 'n-putra-heights',
    name: 'Putra Heights',
    area: 'Subang Jaya',
    raid: { title: 'Walk 500 km together', progress: 312, target: 500, unit: 'km', rewardSp: 400, rank: '#3 in Subang' },
  },
];

export const quests: Quest[] = [
  {
    id: 'q-highfive',
    type: 'daily',
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
    verifyMethod: 'Check-in at the park (GPS mocked in demo), then a 3-2-1 group photo.',
  },
  {
    id: 'q-walk',
    type: 'daily',
    title: 'Take a 15-min walk with a neighbour',
    tileLabel: 'Walk 15m',
    icon: 'walk',
    points: 20,
    venue: { name: 'Tasik Putra Heights', spot: 'Jogging track, main entrance' },
    when: 'Today, 6:30 PM',
    durationMin: 15,
    groupMin: 2,
    groupMax: 4,
    mockParticipants: [meiLing, weiJie],
    sharedInterest: 'Running',
    verifyMethod: 'Check-in at the lake entrance (GPS mocked in demo), then a 3-2-1 group photo.',
    badgeId: 'b-langkah',
  },
  {
    id: 'q-tehtarik',
    type: 'daily',
    title: 'Quick teh tarik chat',
    tileLabel: 'Teh tarik',
    icon: 'teh',
    points: 20,
    venue: { name: 'Mamak near Putra Heights LRT', spot: 'Outdoor tables' },
    when: 'Today, 9:00 PM',
    durationMin: 20,
    groupMin: 2,
    groupMax: 4,
    mockParticipants: [kumar],
    sharedInterest: 'Makan',
    verifyMethod: 'Check-in at the restaurant (GPS mocked in demo), then a 3-2-1 group photo.',
    badgeId: 'b-teh',
  },
  {
    id: 'q-badminton',
    type: 'weekly',
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
    verifyMethod: 'Check-in at the court (GPS mocked in demo), then a 3-2-1 group photo.',
    badgeId: 'b-smash',
  },
  {
    id: 'q-makan',
    type: 'weekly',
    title: 'Makan malam together',
    tileLabel: 'Makan',
    icon: 'food',
    points: 120,
    venue: { name: 'Putra Heights food court', spot: 'Centre tables' },
    when: 'Fri, 7:30 PM',
    durationMin: 90,
    groupMin: 4,
    groupMax: 6,
    mockParticipants: [farah, kumar, meiLing],
    sharedInterest: 'Makan',
    verifyMethod: 'Check-in at the food court (GPS mocked in demo), then a 3-2-1 group photo.',
  },
  {
    id: 'q-run',
    type: 'weekly',
    title: 'One-hour group run',
    tileLabel: 'Group run',
    icon: 'run',
    points: 120,
    venue: { name: 'Tasik Putra Heights loop', spot: 'Main entrance' },
    when: 'Sun, 7:00 AM',
    durationMin: 60,
    groupMin: 4,
    groupMax: 8,
    mockParticipants: [weiJie, farah, meiLing],
    sharedInterest: 'Running',
    verifyMethod: 'Check-in at the lake (GPS mocked in demo), then a 3-2-1 group photo.',
  },
];

export const DAILY_TILE_IDS = ['q-highfive', 'q-walk', 'q-tehtarik'];

export const badges: Badge[] = [
  { id: 'b-hello', name: 'First Hello', description: 'Completed your first quest' },
  { id: 'b-early', name: 'Early Bird', description: 'Quest before 8 AM' },
  { id: 'b-raid', name: 'Raid Helper', description: 'Contributed to a Neighbourhood Raid' },
  { id: 'b-langkah', name: 'Langkah Jiran', description: 'Walked with a neighbour' },
  { id: 'b-teh', name: 'Teh Tarik Crew', description: 'Shared a teh tarik' },
  { id: 'b-smash', name: 'Smash Jiran', description: 'Played badminton with neighbours' },
];

export const rewards: Reward[] = [
  { id: 'r-teh', title: 'Teh tarik + roti canai', partner: '[Mamak partner] · Putra Heights', category: 'Makan', cost: 300 },
  { id: 'r-store', title: 'RM5 store voucher', partner: '[Convenience store]', category: 'Groceries', cost: 500 },
  { id: 'r-gym', title: 'Gym day pass', partner: '[Gym partner]', category: 'Fitness', cost: 1500 },
  { id: 'r-tng', title: "Touch 'n Go eWallet reward", partner: 'Partnership TBC', category: 'eWallet', cost: 2000, locked: true },
];

/** Fresh demo state, with timestamps relative to `now` so "today" numbers line up. */
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

  // Balance 1,240 SP; 140 of it earned today → "Today: 140 / 300".
  const ledger: PointsEntry[] = [
    { id: 'p-seed-1', userId: ME, amount: 1100, reason: 'seed', label: 'Earlier activity (demo seed)', at: now - 3 * 86400_000 },
    { id: 'p-seed-2', userId: ME, amount: 120, reason: 'seed', label: 'Weekly quest (demo seed)', at: now - 4 * 3600_000 },
    { id: 'p-seed-3', userId: ME, amount: 20, reason: 'quest', label: 'High-five a neighbour', refId: seededSession.id, at: seededSession.completedAt! },
  ];

  return { user, sessions: [seededSession], checkIns: [], ledger, redemptions: [], seededAt: now };
}
