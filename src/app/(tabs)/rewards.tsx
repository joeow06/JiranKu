import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Chip, PartnerAvatar, ProgressBar, Row, Screen, Txt } from '@/components/ui';
import { getPartner } from '@/data/rewardPartners';
import { rewards } from '@/data/seed';
import type { Reward } from '@/data/types';
import { DAILY_CAP } from '@/lib/points';
import { useBalance, useEarnedToday } from '@/store/selectors';
import { useAppStore } from '@/store/useAppStore';
import { colors, fonts, MIN_TOUCH, radius } from '@/theme/tokens';

const FILTERS = ['All', 'Makan', 'Groceries', 'Green', 'Fitness', 'eWallet'] as const;

export default function RewardsScreen() {
  const balance = useBalance();
  const today = useEarnedToday();
  const redemptions = useAppStore((s) => s.redemptions);
  const redeem = useAppStore((s) => s.redeem);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All');

  const list = rewards.filter((r) => filter === 'All' || r.category === filter);

  const confirmRedeem = (r: Reward) =>
    // MOCK: redeeming only deducts SP in the app; no voucher is issued by the partner.
    Alert.alert(`Redeem ${r.title}?`, `${r.cost.toLocaleString()} SP will be deducted from your balance.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Redeem', onPress: () => redeem(r.id) },
    ]);

  return (
    <Screen>
      <Row>
        <Txt variant="h1" style={{ flex: 1 }}>
          Rewards
        </Txt>
      </Row>

      <View style={styles.balanceCard}>
        <Txt variant="small" color={colors.inkMutedOnDark}>
          Your balance
        </Txt>
        <Row style={{ alignItems: 'baseline' }} gap={6}>
          <Txt variant="display" color="#FFFFFF">
            {balance.toLocaleString()}
          </Txt>
          <Txt variant="bodyBold" color={colors.highlight}>
            SP
          </Txt>
        </Row>
        <View style={{ gap: 6 }}>
          <Row style={{ justifyContent: 'space-between' }}>
            <Txt variant="small" color={colors.inkMutedOnDark} style={{ fontSize: 12 }}>
              Today: {Math.min(today, DAILY_CAP)} / {DAILY_CAP} SP daily cap
            </Txt>
          </Row>
          <ProgressBar value={today / DAILY_CAP} fill={colors.highlight} track={colors.inkSoft} />
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {FILTERS.map((f) => (
          <Chip key={f} label={f} selected={filter === f} onPress={() => setFilter(f)} />
        ))}
      </ScrollView>

      <View style={{ gap: 10 }}>
        {list.map((r) => {
          const got = redemptions.some((x) => x.rewardId === r.id);
          return <RewardRow key={r.id} reward={r} redeemed={got} balance={balance} onRedeem={() => confirmRedeem(r)} />;
        })}
      </View>
    </Screen>
  );
}

function RewardRow({
  reward,
  redeemed,
  balance,
  onRedeem,
}: {
  reward: Reward;
  redeemed: boolean;
  balance: number;
  onRedeem: () => void;
}) {
  const can = !reward.locked && !redeemed && balance >= reward.cost;
  let label = 'Redeem';
  let style: object = { backgroundColor: colors.primary };
  let fg = '#FFFFFF';
  if (redeemed) {
    label = 'Redeemed';
    style = { backgroundColor: colors.tealTint };
    fg = colors.tealStrong;
  } else if (reward.locked) {
    label = 'Soon';
    style = { backgroundColor: colors.mutedBg };
    fg = colors.textMuted;
  } else if (!can) {
    label = `${(reward.cost - balance).toLocaleString()} more`;
    style = { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border };
    fg = colors.textMuted;
  }

  return (
    <View style={styles.row}>
      <PartnerAvatar partnerId={reward.partnerId} />
      <View style={{ flex: 1, gap: 2 }}>
        <Txt variant="bodyBold" style={{ fontSize: 14 }}>
          {reward.title}
        </Txt>
        <Txt variant="small" color={colors.textMuted} style={{ fontSize: 12 }} numberOfLines={1}>
          {getPartner(reward.partnerId).name}
        </Txt>
        <Txt variant="smallBold" color={colors.primaryPressed} style={{ fontFamily: fonts.extrabold, fontSize: 12 }}>
          {reward.cost.toLocaleString()} SP
        </Txt>
      </View>
      <Pressable
        onPress={can ? onRedeem : undefined}
        disabled={!can}
        accessibilityRole="button"
        accessibilityState={{ disabled: !can }}
        accessibilityLabel={`${label}: ${reward.title}`}
        style={({ pressed }) => [styles.redeemBtn, style, { opacity: pressed ? 0.85 : 1 }]}>
        <Txt variant="smallBold" color={fg}>
          {label}
        </Txt>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  balanceCard: { padding: 18, borderRadius: radius.cardLg, backgroundColor: colors.ink, gap: 6 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  redeemBtn: { minHeight: MIN_TOUCH, paddingHorizontal: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
