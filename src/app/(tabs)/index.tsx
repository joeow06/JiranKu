import { Link, useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { FlameIcon, Icon } from '@/components/Icon';
import { Avatar, ProgressBar, Row, Screen, SpChip, Txt } from '@/components/ui';
import { DAILY_TILE_IDS, neighbourhoods, quests } from '@/data/seed';
import type { Quest } from '@/data/types';
import { greeting, untilMidnight } from '@/lib/dates';
import { CHEST_BONUS } from '@/lib/points';
import {
  questState,
  useBalance,
  useChestProgress,
  useLevel,
  useNeighbourhoodQuest,
  type QuestState,
} from '@/store/selectors';
import { useAppStore } from '@/store/useAppStore';
import { colors, fonts, radius } from '@/theme/tokens';

export default function HomeScreen() {
  const user = useAppStore((s) => s.user);
  const sessions = useAppStore((s) => s.sessions);
  const balance = useBalance();
  const level = useLevel();
  const chest = useChestProgress();
  const hood = neighbourhoods.find((n) => n.id === user.neighbourhoodId) ?? neighbourhoods[0];
  const raid = useNeighbourhoodQuest(hood.raidId);
  const daily = DAILY_TILE_IDS.map((id) => quests.find((q) => q.id === id)!);
  const states = daily.map((q) => questState(sessions, q.id));
  const featured = states.findIndex((s) => s !== 'done');

  return (
    <Screen>
      {/* Header: avatar + level, greeting, streak, SP */}
      <Row gap={10}>
        <Link href="/profile" asChild>
          <Pressable accessibilityLabel={`Profile, level ${level.level}`} style={styles.avatarWrap}>
            <Avatar name={user.name} size={48} ring={colors.primary} />
            <View style={styles.levelBadge}>
              <Txt variant="caps" color="#FFFFFF" style={{ fontSize: 11 }}>
                {level.level}
              </Txt>
            </View>
          </Pressable>
        </Link>
        <View style={{ flex: 1 }}>
          <Txt variant="h2" style={{ fontSize: 22 }} numberOfLines={1}>
            {greeting()}, {user.name}
          </Txt>
          <Txt variant="small" color={colors.textMuted}>
            {hood.name}
          </Txt>
        </View>
        <Link href="/profile" asChild>
          <Pressable accessibilityLabel={`${user.streak.count} day streak`} style={styles.streakChip}>
            <FlameIcon color={colors.primary} />
            <Txt variant="smallBold" style={{ fontFamily: fonts.extrabold, fontSize: 14 }}>
              {user.streak.count}
            </Txt>
          </Pressable>
        </Link>
        <Link href="/rewards" asChild>
          <Pressable accessibilityLabel={`${balance} SahabatPoints`} style={{ minHeight: 44, justifyContent: 'center' }}>
            <SpChip value={balance.toLocaleString()} dark />
          </Pressable>
        </Link>
      </Row>

      {/* Level / XP */}
      <View style={{ gap: 6 }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <Txt variant="smallBold" style={{ fontSize: 12 }}>
            Lv {level.level} · {level.name}
          </Txt>
          <Txt variant="smallBold" color={colors.textMuted} style={{ fontSize: 12 }}>
            {level.toNext > 0 ? `${level.toNext.toLocaleString()} SP to Lv ${level.level + 1}` : 'Max level'}
          </Txt>
        </Row>
        <ProgressBar value={level.progress} />
      </View>

      {/* Daily quests */}
      <View style={{ gap: 10 }}>
        <Row>
          <Txt variant="h2" style={{ flex: 1 }}>
            Daily quests
          </Txt>
          <View style={styles.timerChip}>
            <Icon name="clock" size={12} strokeWidth={2.4} />
            <Txt variant="smallBold" style={{ fontSize: 12 }}>
              {untilMidnight()}
            </Txt>
          </View>
        </Row>
        <Row gap={10}>
          {daily.map((q, i) => (
            <QuestTile key={q.id} quest={q} state={states[i]} featured={i === featured} />
          ))}
        </Row>
        <Row gap={10} style={{ marginTop: 4 }}>
          <View style={styles.chestTrack}>
            {[0, 1, 2].map((i) => (
              <View key={i} style={[styles.chestSeg, { backgroundColor: i < chest ? colors.tealStrong : colors.mutedBg }]} />
            ))}
          </View>
          <Row gap={4}>
            <Icon name="chest" color={colors.coin} strokeWidth={2} />
            <Txt variant="smallBold" color={colors.textMuted} style={{ fontFamily: fonts.extrabold, fontSize: 12 }}>
              {chest >= 3 ? 'Chest opened' : `${chest}/3 · +${CHEST_BONUS}`}
            </Txt>
          </Row>
        </Row>
      </View>

      {/* Neighbourhood Raid (monthly) */}
      <Link href="/quests?tab=Monthly" asChild>
        <Pressable style={styles.raid} accessibilityLabel="Neighbourhood raid">
          <Row>
            <Txt variant="caps" color={colors.highlight}>
              NEIGHBOURHOOD RAID
            </Txt>
            <View style={{ flex: 1 }} />
            <Txt variant="smallBold" color={colors.inkMutedOnDark} style={{ fontSize: 12 }}>
              {hood.raidRank}
            </Txt>
          </Row>
          <Row gap={6}>
            {raid.category === 'green' && <Icon name="leaf" size={18} color={colors.teal} strokeWidth={2} />}
            <Txt variant="h3" color="#FFFFFF" style={{ flex: 1 }} numberOfLines={1}>
              {raid.title}
            </Txt>
          </Row>
          <Row style={{ alignItems: 'baseline' }}>
            <Txt variant="h1" color="#FFFFFF" style={{ fontSize: 30, lineHeight: 36 }}>
              {raid.progress}
            </Txt>
            <Txt variant="small" color={colors.inkMutedOnDark} style={{ fontSize: 14 }}>
              / {raid.target} {raid.unit === 'trees' ? 'trees planted' : raid.unit}
            </Txt>
            <View style={{ flex: 1 }} />
            <View style={styles.raidReward}>
              <Txt variant="smallBold" color="#FFFFFF" style={{ fontFamily: fonts.extrabold, fontSize: 12 }}>
                +{raid.points}
              </Txt>
            </View>
          </Row>
          <ProgressBar value={raid.progress / raid.target} height={14} fill={colors.highlight} track={colors.inkSoft} />
        </Pressable>
      </Link>

      {/* Jiran free now → Map. MOCK: fixed count, not live availability. */}
      <Link href="/map" asChild>
        <Pressable style={styles.freeNow}>
          <View style={styles.liveDot} />
          <Txt variant="bodyBold" style={{ flex: 1, fontSize: 14 }}>
            8 jiran free right now
          </Txt>
          <Txt variant="smallBold" color={colors.tealStrong} style={{ fontFamily: fonts.extrabold }}>
            Map →
          </Txt>
        </Pressable>
      </Link>

      {/* Feed item. MOCK: static seeded activity. */}
      <View style={styles.feed}>
        <View style={styles.feedThumb} />
        <View style={{ flex: 1, gap: 4 }}>
          <Txt variant="small" style={{ lineHeight: 18 }}>
            <Txt variant="smallBold">Wei Jie +3</Txt> cleared <Txt variant="smallBold">Badminton</Txt>
          </Txt>
        </View>
        <View style={styles.tahniah}>
          <Txt variant="smallBold" color={colors.primaryPressed} style={{ fontFamily: fonts.extrabold, fontSize: 12 }}>
            Tahniah 12
          </Txt>
        </View>
      </View>
    </Screen>
  );
}

function QuestTile({ quest, state, featured }: { quest: Quest; state: QuestState; featured: boolean }) {
  const router = useRouter();
  const done = state === 'done';
  const look = done ? 'done' : featured ? 'featured' : 'plain';
  const bg = { done: colors.tealStrong, featured: colors.primary, plain: colors.surface }[look];
  const fg = look === 'plain' ? colors.ink : '#FFFFFF';
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/quest/[id]', params: { id: quest.id } })}
      accessibilityRole="button"
      accessibilityLabel={`${quest.tileLabel}${quest.category === 'green' ? ', green quest' : ''}, ${done ? 'done' : `${quest.points} SP`}`}
      style={({ pressed }) => [
        styles.tile,
        { backgroundColor: bg, opacity: pressed ? 0.9 : 1 },
        look === 'plain' && { borderWidth: 1, borderColor: colors.border },
        look === 'featured' && { borderBottomWidth: 6, borderBottomColor: colors.primaryPressed },
        look === 'plain' && { borderBottomWidth: 6, borderBottomColor: colors.border },
      ]}>
      {quest.category === 'green' && (
        <View style={styles.greenBadge}>
          <Icon name="leaf" size={14} color="#FFFFFF" strokeWidth={2.4} />
        </View>
      )}
      <View
        style={[
          styles.tileIcon,
          { backgroundColor: look === 'plain' ? colors.highlight : 'rgba(255,255,255,0.18)' },
        ]}>
        <Icon
          name={done ? 'check' : quest.icon}
          size={28}
          color={look === 'plain' ? colors.primary : '#FFFFFF'}
          strokeWidth={done ? 2.6 : 2}
        />
      </View>
      <Txt variant="h3" color={fg} style={{ fontSize: 14 }} numberOfLines={1}>
        {quest.tileLabel}
      </Txt>
      {done ? (
        <Txt variant="smallBold" color={fg} style={{ fontSize: 11, opacity: 0.85 }}>
          Done
        </Txt>
      ) : state === 'active' ? (
        <View style={[styles.tilePill, { backgroundColor: look === 'plain' ? colors.highlight : '#FFFFFF' }]}>
          <Txt variant="caps" color={colors.primaryPressed}>
            In progress
          </Txt>
        </View>
      ) : (
        <View style={[styles.tilePill, { backgroundColor: look === 'plain' ? colors.highlight : '#FFFFFF' }]}>
          <Txt variant="smallBold" color={colors.primaryPressed} style={{ fontFamily: fonts.extrabold, fontSize: 11 }}>
            +{quest.points}
          </Txt>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  avatarWrap: { width: 48, height: 48 },
  levelBadge: {
    position: 'absolute',
    right: -6,
    bottom: -6,
    height: 20,
    paddingHorizontal: 6,
    borderRadius: 10,
    backgroundColor: colors.ink,
    justifyContent: 'center',
  },
  streakChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 36,
    paddingHorizontal: 10,
    borderRadius: radius.chip,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  timerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 26,
    paddingHorizontal: 10,
    borderRadius: 13,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tile: {
    flex: 1,
    minHeight: 132,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 4,
  },
  tileIcon: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  greenBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.tealStrong,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tilePill: { height: 20, paddingHorizontal: 8, borderRadius: 10, justifyContent: 'center' },
  chestTrack: { flex: 1, flexDirection: 'row', gap: 4 },
  chestSeg: { flex: 1, height: 12, borderRadius: 6 },
  raid: { padding: 16, borderRadius: radius.cardLg, backgroundColor: colors.ink, gap: 10 },
  raidReward: { height: 22, paddingHorizontal: 8, borderRadius: 11, backgroundColor: colors.primary, justifyContent: 'center' },
  freeNow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 52,
    paddingHorizontal: 14,
    borderRadius: 26,
    backgroundColor: colors.tealTint,
  },
  liveDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.tealStrong,
    borderWidth: 3,
    borderColor: 'rgba(30,124,131,0.25)',
  },
  feed: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  feedThumb: { width: 52, height: 52, borderRadius: 12, backgroundColor: colors.mutedBg },
  tahniah: { height: 32, paddingHorizontal: 10, borderRadius: 10, backgroundColor: colors.highlight, justifyContent: 'center' },
});
