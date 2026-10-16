// Minimal entities from prototype.md §12.2

export type ID = string;

export type QuestType = 'daily' | 'weekly' | 'monthly';

export interface User {
  id: ID;
  name: string;
  neighbourhoodId: ID | null;
  interests: string[];
  ageBand: string | null;
  verification: 'none' | 'mock_verified';
  streak: { count: number; best: number; lastActiveDay: string | null }; // 'YYYY-MM-DD'
  badges: ID[];
  onboarded: boolean;
}

export interface Neighbourhood {
  id: ID;
  name: string;
  area: string;
  raid: { title: string; progress: number; target: number; unit: string; rewardSp: number; rank: string };
}

export interface MockPerson {
  id: ID;
  name: string;
  verified: boolean;
}

export interface Quest {
  id: ID;
  type: QuestType;
  title: string;
  tileLabel: string; // short label for Home tiles
  icon: 'walk' | 'highfive' | 'teh' | 'badminton' | 'food' | 'run';
  points: number;
  // Public venues only — no coordinates are stored or shown.
  venue: { name: string; spot: string };
  when: string;
  durationMin: number;
  groupMin: number;
  groupMax: number;
  mockParticipants: MockPerson[];
  sharedInterest?: string;
  verifyMethod: string;
  badgeId?: ID;
}

export type SessionStatus = 'joined' | 'checked_in' | 'completed';

export interface SessionResult {
  awarded: number; // SP actually credited after daily cap
  requested: number;
  chestBonus: number;
  streakAfter: number;
  badgeUnlocked: ID | null;
  photo: boolean;
}

export interface Session {
  id: ID;
  questId: ID;
  participantIds: ID[];
  status: SessionStatus;
  joinedAt: number;
  startedAt?: number; // set at check-in
  completedAt?: number;
  verifySimulated: boolean;
  result?: SessionResult;
}

export interface CheckIn {
  id: ID;
  sessionId: ID;
  userId: ID;
  at: number;
  method: 'mock_gps';
  status: 'verified_mock';
}

export type PointsReason = 'seed' | 'quest' | 'chest' | 'redeem';

export interface PointsEntry {
  id: ID;
  userId: ID;
  amount: number; // + earned, − spent
  reason: PointsReason;
  label: string;
  refId?: ID;
  at: number;
}

export interface Reward {
  id: ID;
  title: string;
  partner: string;
  category: 'Makan' | 'Groceries' | 'Fitness' | 'eWallet';
  cost: number;
  locked?: boolean;
}

export interface Redemption {
  id: ID;
  rewardId: ID;
  at: number;
}

export interface Badge {
  id: ID;
  name: string;
  description: string;
}
