import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { DemoTag, ProgressBar, Row, Screen, Segmented, Tag, Txt } from '@/components/ui';
import { quests } from '@/data/seed';
import { untilMidnight } from '@/lib/dates';
import { questState } from '@/store/selectors';
import { useAppStore } from '@/store/useAppStore';
import { colors, fonts, radius } from '@/theme/tokens';

const TABS = ['Daily', 'Weekly', 'Monthly'] as const;
type Tab = (typeof TABS)[number];

const asTab = (v?: string): Tab | undefined => TABS.find((t) => t === v);

// Monthly neighbourhood quests are display-only in the MVP.
const MONTHLY = [
  { title: 'Walk 500 km together', sp: 400, progress: 312, target: 500, meta: '312 / 500 km logged by Putra Heights', joined: '186 contributing', tag: 'Progress bar' },
  { title: '20 meetups this month', sp: 400, progress: 11, target: 20, meta: '11 / 20 meetups held', joined: '64 contributing', tag: 'Set by JMB' },
];

export default function QuestsScreen() {
  const params = useLocalSearchParams<{ tab?: string }>();
  const [tab, setTab] = useState<Tab>(asTab(params.tab) ?? 'Daily');
  const [lastParam, setLastParam] = useState(params.tab);
  const sessions = useAppStore((s) => s.sessions);
  const router = useRouter();

  // Deep link from Home's Raid card (?tab=Monthly) switches the tab.
  if (params.tab !== lastParam) {
    setLastParam(params.tab);
    const next = asTab(params.tab);
    if (next) setTab(next);
  }

  const blurb = { Daily: '2+ people · up to 30 min', Weekly: '4+ people · 1 hour or more', Monthly: 'Whole neighbourhood' }[tab];
  const refresh = { Daily: `New in ${untilMidnight()}`, Weekly: 'New Monday', Monthly: 'Ends 31 Oct' }[tab];
  const list = quests.filter((q) => q.type === tab.toLowerCase());

  return (
    <Screen>
      <Txt variant="h1">Quests</Txt>
      <Segmented options={TABS} value={tab} onChange={setTab} />
      <Row>
        <Txt variant="small" color={colors.textMuted} style={{ flex: 1 }}>
          {blurb}
        </Txt>
        <Txt variant="smallBold" color={colors.primaryPressed}>
          {refresh}
        </Txt>
      </Row>

      {tab === 'Monthly'
        ? MONTHLY.map((m) => (
            <View key={m.title} style={styles.card}>
              <Row>
                <Txt variant="h3" style={{ flex: 1 }}>
                  {m.title}
                </Txt>
                <Txt variant="smallBold" color={colors.primaryPressed} style={{ fontFamily: fonts.extrabold }}>
                  +{m.sp} SP
                </Txt>
              </Row>
              <Txt variant="small" color={colors.textMuted}>
                {m.meta}
              </Txt>
              <ProgressBar value={m.progress / m.target} fill={colors.tealStrong} />
              <Row>
                <Txt variant="smallBold" style={{ flex: 1, fontSize: 12 }}>
                  {m.joined}
                </Txt>
                <DemoTag />
                <Tag label={m.tag.toUpperCase()} />
              </Row>
            </View>
          ))
        : list.map((q) => {
            const state = questState(sessions, q.id);
            return (
              <Pressable
                key={q.id}
                onPress={() => router.push({ pathname: '/quest/[id]', params: { id: q.id } })}
                accessibilityRole="button"
                style={({ pressed }) => [styles.card, { opacity: pressed ? 0.9 : 1 }]}>
                <Row>
                  <View style={styles.icon}>
                    <Icon name={q.icon} color={colors.primary} />
                  </View>
                  <Txt variant="h3" style={{ flex: 1 }}>
                    {q.title}
                  </Txt>
                  <Txt variant="smallBold" color={colors.primaryPressed} style={{ fontFamily: fonts.extrabold }}>
                    +{q.points} SP
                  </Txt>
                </Row>
                <Txt variant="small" color={colors.textMuted}>
                  {q.when} · {q.venue.name} · {q.durationMin} min
                </Txt>
                <Row>
                  <Txt variant="smallBold" style={{ flex: 1, fontSize: 12 }}>
                    {state === 'done'
                      ? 'Done ✓'
                      : state === 'active'
                        ? 'In progress'
                        : `${q.mockParticipants.length} / ${q.groupMin} joined`}
                  </Txt>
                  <Tag label="PUBLIC PLACE" />
                </Row>
              </Pressable>
            );
          })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 14,
    gap: 8,
    borderRadius: radius.card,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  icon: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.highlight, alignItems: 'center', justifyContent: 'center' },
});
