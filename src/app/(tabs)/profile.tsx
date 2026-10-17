import { Link, useRouter } from 'expo-router';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { FlameIcon, Icon } from '@/components/Icon';
import { Avatar, Button, Row, Screen, Txt } from '@/components/ui';
import { GREEN_BADGE_ID, badges, neighbourhoods } from '@/data/seed';
import { useBalance, useLevel, useTreesPlanted } from '@/store/selectors';
import { useAppStore } from '@/store/useAppStore';
import { dayKey } from '@/lib/dates';
import { colors, MIN_TOUCH, radius } from '@/theme/tokens';

const WEEK = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function ProfileScreen() {
  const router = useRouter();
  const user = useAppStore((s) => s.user);
  const resetDemo = useAppStore((s) => s.resetDemo);
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
});
