import { Link, useRouter } from 'expo-router';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';

import { FlameIcon, Icon } from '@/components/Icon';
import { Avatar, Button, PartnerAvatar, Row, Screen, Txt } from '@/components/ui';
import { getPartner } from '@/data/rewardPartners';
import { GREEN_BADGE_ID, badges, neighbourhoods, rewards } from '@/data/seed';
import { useBalance, useLevel, useTreesPlanted } from '@/store/selectors';
import { useAppStore } from '@/store/useAppStore';
import { dayKey } from '@/lib/dates';
import { colors, MIN_TOUCH, radius } from '@/theme/tokens';

const WEEK = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function ProfileScreen() {
  const router = useRouter();
  const user = useAppStore((s) => s.user);
  const resetDemo = useAppStore((s) => s.resetDemo);
  const redemptions = useAppStore((s) => s.redemptions);
  const balance = useBalance();
  const trees = useTreesPlanted();
  const level = useLevel();
  const hood = neighbourhoods.find((n) => n.id === user.neighbourhoodId) ?? neighbourhoods[0];
  const owned = badges.filter((b) => user.badges.includes(b.id));
  // Week dots (Mon-first): the streak's days filled, ending today or yesterday.
  const todayIdx = (new Date().getDay() + 6) % 7;
  const lastIdx = user.streak.lastActiveDay === dayKey() ? todayIdx : todayIdx - 1;

  const confirmReset = () =>
    // MOCK: restores the seeded starting data for repeat run-throughs.
    Alert.alert('Start over?', 'Resets your progress (1,240 SP, 5-day streak) and shows the welcome screen again.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Start over',
        style: 'destructive',
        onPress: () => {
          resetDemo();
          router.replace('/onboarding');
        },
      },
    ]);

  return (
    <Screen>
      <Row gap={14}>
        <Avatar name={user.name} size={64} ring={colors.primary} />
        <View style={{ flex: 1, gap: 2 }}>
          <Txt variant="h1">{user.name}</Txt>
          <Txt variant="small" color={colors.textMuted}>
            {hood.name}, {hood.area}
            {user.verification === 'mock_verified' ? ' · ✓ Verified' : ''}
          </Txt>
          <Txt variant="smallBold" color={colors.primaryPressed}>
            Lv {level.level} · {level.name}
          </Txt>
        </View>
      </Row>

      <Row gap={10}>
        <View style={[styles.topCard, { backgroundColor: colors.ink }]}>
          <Txt variant="small" color={colors.inkMutedOnDark}>
            SahabatPoints
          </Txt>
          <Txt variant="h1" color="#FFFFFF">
            {balance.toLocaleString()}
          </Txt>
          <Link href="/rewards" asChild>
            <Pressable style={{ minHeight: 32, justifyContent: 'center' }}>
              <Txt variant="smallBold" color={colors.highlight}>
                Redeem →
              </Txt>
            </Pressable>
          </Link>
        </View>
        <View style={[styles.topCard, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }]}>
          <Txt variant="small" color={colors.textMuted}>
            Streak
          </Txt>
          <Row gap={6}>
            <FlameIcon size={22} color={colors.primary} />
            <Txt variant="h1">{user.streak.count} days</Txt>
          </Row>
          <Txt variant="small" color={colors.textMuted}>
            Best: {user.streak.best}
          </Txt>
        </View>
      </Row>

      <Row style={{ justifyContent: 'space-between' }}>
        {WEEK.map((d, i) => {
          const filled = i <= lastIdx && lastIdx - i < user.streak.count;
          return (
            <View key={i} style={{ alignItems: 'center', gap: 4 }}>
              <View
                style={[
                  styles.dot,
                  { backgroundColor: filled ? colors.primary : colors.mutedBg },
                  i === todayIdx && { borderWidth: 2, borderColor: colors.primary, backgroundColor: filled ? colors.primary : colors.highlight },
                ]}
              />
              <Txt variant="small" color={colors.textMuted} style={{ fontSize: 11 }}>
                {d}
              </Txt>
            </View>
          );
        })}
      </Row>

      <View style={{ gap: 8 }}>
        <Row>
          <Txt variant="h2" style={{ flex: 1 }}>
            Stats
          </Txt>
        </Row>
        {/* MOCK: quests/jiran/hours are seeded numbers; trees planted is tracked. */}
        <Row gap={10}>
          <Stat value="34" label="quests done" />
          <Stat value="19" label="jiran met" />
        </Row>
        <Row gap={10}>
          <Stat value="22h" label="together" />
          <Stat value={String(trees)} label="trees planted" />
        </Row>
      </View>

      <View style={{ gap: 8 }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <Txt variant="h2">Your Vouchers</Txt>
          <Txt variant="small" color={colors.textMuted}>{redemptions.filter((r) => (r.expiresAt ?? r.at + 30 * 86400000) > Date.now()).length} active</Txt>
        </Row>
        {redemptions
          .filter((r) => (r.expiresAt ?? r.at + 30 * 86400000) > Date.now())
          .slice()
          .sort((a, b) => b.at - a.at)
          .map((redemption) => {
            const reward = rewards.find((r) => r.id === redemption.rewardId);
            if (!reward) return null;
            const partner = getPartner(reward.partnerId);
            const expiresAt = redemption.expiresAt ?? redemption.at + 30 * 86400000;
            const code = redemption.voucherCode ?? redemption.id;
            return (
              <View key={redemption.id} style={styles.voucherCard}>
                <View style={{ flex: 1, gap: 3 }}>
                  <Row gap={10}>
                    <PartnerAvatar partnerId={reward.partnerId} />
                    <View style={{ flex: 1 }}>
                      <Txt variant="bodyBold">{partner.name}</Txt>
                      <Txt variant="small" color={colors.textMuted}>{reward.title}</Txt>
                    </View>
                  </Row>
                  <Txt variant="smallBold" color={colors.primaryPressed}>
                    Expires {new Date(expiresAt).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </Txt>
                </View>
                <VoucherQr value={code} />
              </View>
            );
          })}
        {redemptions.every((r) => (r.expiresAt ?? r.at + 30 * 86400000) <= Date.now()) && (
          <View style={styles.emptyVoucher}>
            <Txt variant="small" color={colors.textMuted}>Redeemed rewards will appear here with their QR code and expiry date.</Txt>
            <Link href="/rewards" asChild>
              <Pressable style={{ minHeight: 36, justifyContent: 'center' }}>
                <Txt variant="smallBold" color={colors.primaryPressed}>Browse rewards →</Txt>
              </Pressable>
            </Link>
          </View>
        )}
      </View>

      <View style={{ gap: 8 }}>
        <Txt variant="h2">Badges · {owned.length}</Txt>
        <Row gap={10} style={{ flexWrap: 'wrap' }}>
          {owned.map((b) => (
            <View key={b.id} style={styles.badge}>
              <Icon name={b.id === GREEN_BADGE_ID ? 'leaf' : 'trophy'} color={b.id === GREEN_BADGE_ID ? colors.tealStrong : colors.primaryPressed} />
              <Txt variant="smallBold" style={{ fontSize: 12, textAlign: 'center' }} numberOfLines={2}>
                {b.name}
              </Txt>
            </View>
          ))}
        </Row>
      </View>

      <View style={styles.list}>
        <Link href="/leaderboard" asChild>
          <Pressable style={styles.listRow}>
            <Txt variant="bodyBold" style={{ flex: 1 }}>
              Leaderboards
            </Txt>
            <Icon name="chevron" color={colors.textMuted} />
          </Pressable>
        </Link>
        <View style={[styles.listRow, styles.listBorder]}>
          <Txt variant="bodyBold" style={{ flex: 1 }}>
            Privacy & location
          </Txt>
          <Txt variant="small" color={colors.textMuted}>
            Neighbourhood only
          </Txt>
        </View>
        <View style={[styles.listRow, styles.listBorder]}>
          <Txt variant="bodyBold" style={{ flex: 1 }}>
            Safety & reports
          </Txt>
          {/* MOCK: reporting flow not built yet. */}
          <Icon name="chevron" color={colors.textMuted} />
        </View>
      </View>

      <Button label="Start over" kind="secondary" onPress={confirmReset} />
    </Screen>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <Txt variant="h2">{value}</Txt>
      <Txt variant="small" color={colors.textMuted} style={{ fontSize: 12 }}>
        {label}
      </Txt>
    </View>
  );
}

/** A locally generated QR-style voucher mark; partner scanning is not connected in this prototype. */
function VoucherQr({ value }: { value: string }) {
  const size = 21;
  let seed = 2166136261;
  for (const char of value) seed = Math.imul(seed ^ char.charCodeAt(0), 16777619) >>> 0;
  const cells: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));
  const reserved = Array.from({ length: size }, () => Array(size).fill(false));
  const finder = (left: number, top: number) => {
    for (let y = -1; y <= 7; y++) for (let x = -1; x <= 7; x++) {
      const xx = left + x, yy = top + y;
      if (xx < 0 || yy < 0 || xx >= size || yy >= size) continue;
      reserved[yy][xx] = true;
      cells[yy][xx] = x >= 0 && x <= 6 && y >= 0 && y <= 6 && (x === 0 || x === 6 || y === 0 || y === 6 || (x >= 2 && x <= 4 && y >= 2 && y <= 4));
    }
  };
  finder(0, 0); finder(14, 0); finder(0, 14);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    if (reserved[y][x]) continue;
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    cells[y][x] = (seed >>> 29) > 3;
  }
  return (
    <View style={styles.qrWrap} accessibilityLabel={`Voucher QR code ${value}`}>
      <Svg width={96} height={96} viewBox="0 0 21 21">
        <Rect width="21" height="21" fill="#FFFFFF" />
        {cells.flatMap((row, y) => row.map((on, x) => on ? <Rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={colors.ink} /> : null))}
      </Svg>
      <Txt variant="smallBold" style={{ fontSize: 9, letterSpacing: 0.5 }}>{value}</Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  topCard: { flex: 1, padding: 14, borderRadius: radius.card, gap: 2 },
  dot: { width: 30, height: 30, borderRadius: 15 },
  stat: {
    flex: 1,
    padding: 12,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  badge: {
    width: 96,
    padding: 10,
    gap: 6,
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: colors.highlight,
  },
  list: { borderRadius: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  listRow: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: MIN_TOUCH + 8, paddingHorizontal: 14 },
  listBorder: { borderTopWidth: 1, borderTopColor: colors.mutedBg },
  voucherCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  emptyVoucher: { padding: 14, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, gap: 4 },
  qrWrap: { padding: 6, borderRadius: 10, backgroundColor: '#FFFFFF', alignItems: 'center', gap: 2, borderWidth: 1, borderColor: colors.border },
});
