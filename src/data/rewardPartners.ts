// All reward partner and sponsor names live here so they're easy to swap.
// No real brand logos are used: each partner is shown as a coloured initial avatar.
// MOCK: none of these brands is an actual partner. Rewards and sponsorships are not integrated.

export interface RewardPartner {
  name: string;
  initial: string;
  color: string; // avatar background
  textColor: string; // avatar initial
}

export const rewardPartners = {
  mamak: { name: 'Pelita Nasi Kandar', initial: 'P', color: '#C62828', textColor: '#FFFFFF' },
  convenience: { name: 'KK Mart', initial: 'K', color: '#E53935', textColor: '#FFFFFF' },
  gym: { name: 'Celebrity Fitness', initial: 'C', color: '#212121', textColor: '#FFFFFF' },
  ewallet: { name: "Touch 'n Go eWallet", initial: 'T', color: '#1565C0', textColor: '#FFFFFF' },
  zeroWaste: { name: 'The Hive Bulk Foods', initial: 'H', color: '#558B2F', textColor: '#FFFFFF' },
  // Neighbourhood-leaderboard sponsor shown on the Leaderboard screen.
  sponsor: { name: 'Sime Darby Property', initial: 'S', color: '#00703C', textColor: '#FFFFFF' },
} satisfies Record<string, RewardPartner>;

export type RewardPartnerId = keyof typeof rewardPartners;

export function getPartner(id: string): RewardPartner {
  return rewardPartners[id as RewardPartnerId] ?? { name: id, initial: id.charAt(0).toUpperCase(), color: '#6D67E4', textColor: '#FFFFFF' };
}
