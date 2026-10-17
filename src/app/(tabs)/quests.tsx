import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { CategoryTag, ProgressBar, Row, Screen, Segmented, Tag, Txt } from '@/components/ui';
import { events, neighbourhoodQuests, quests } from '@/data/seed';
import type { EventQuest } from '@/data/types';
import { untilMidnight } from '@/lib/dates';
import { questState, useNeighbourhoodQuest } from '@/store/selectors';
import { useAppStore } from '@/store/useAppStore';
import { colors, fonts, radius } from '@/theme/tokens';

const TABS = ['Daily', 'Weekly', 'Monthly'] as const;
type Tab = (typeof TABS)[number];

const asTab = (v?: string): Tab | undefined => TABS.find((t) => t === v);

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

      {tab === 'Monthly' ? (
        <>
          {neighbourhoodQuests.map((m) => (
            <MonthlyCard key={m.id} id={m.id} />
          ))}
          <Txt variant="h2" style={{ marginTop: 4 }}>
            Upcoming events
          </Txt>
          {events.map((e) => (
            <EventCard key={e.id} event={e} />
          ))}
        </>
      ) : (
        list.map((q) => {
          const state = questState(sessions, q.id);
          return (
            <Pressable
              key={q.id}
              onPress={() => router.push({ pathname: '/quest/[id]', params: { id: q.id } })}
              accessibilityRole="button"
              style={({ pressed }) => [styles.card, { opacity: pressed ? 0.9 : 1 }]}>
              <Row>
                <View style={[styles.icon, q.category === 'green' && { backgroundColor: colors.tealTint }]}>
                  <Icon name={q.icon} color={q.category === 'green' ? colors.tealStrong : colors.primary} />
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
                {q.category === 'green' && <CategoryTag category="green" />}
                <Tag label="PUBLIC PLACE" bg={colors.mutedBg} fg={colors.ink} />
              </Row>
            </Pressable>
          );
        })
      )}
    </Screen>
  );
}

function MonthlyCard({ id }: { id: string }) {
  const m = useNeighbourhoodQuest(id);
  return (
    <View style={styles.card}>
      <Row>
        <Txt variant="h3" style={{ flex: 1 }}>
          {m.title}
        </Txt>
        <Txt variant="smallBold" color={colors.primaryPressed} style={{ fontFamily: fonts.extrabold }}>
          +{m.points} SP
        </Txt>
      </Row>
      <Txt variant="small" color={colors.textMuted}>
        {m.progress} / {m.target} {m.unit === 'trees' ? 'trees planted' : `${m.unit} held`} by Putra Heights
      </Txt>
      <ProgressBar value={m.progress / m.target} fill={colors.tealStrong} />
      <Row>
        <Txt variant="smallBold" style={{ flex: 1, fontSize: 12 }}>
          {m.contributing} contributing
        </Txt>
        {m.category === 'green' && <CategoryTag category="green" />}
        <Tag label={m.tag.toUpperCase()} bg={colors.mutedBg} fg={colors.ink} />
      </Row>
    </View>
  );
}

function EventCard({ event }: { event: EventQuest }) {
  return (
    <View style={styles.card}>
      <Row>
        <Txt variant="h3" style={{ flex: 1 }}>
          {event.title}
        </Txt>
        <Txt variant="smallBold" color={colors.primaryPressed} style={{ fontFamily: fonts.extrabold }}>
          +{event.points} SP
        </Txt>
      </Row>
      <Txt variant="small" color={colors.textMuted}>
        {event.when} · {event.venue}
      </Txt>
      <Row>
        <Txt variant="smallBold" style={{ flex: 1, fontSize: 12 }}>
          {event.going}
        </Txt>
        {event.category === 'green' && <CategoryTag category="green" />}
        <Tag label={event.tag.toUpperCase()} bg={colors.mutedBg} fg={colors.ink} />
      </Row>
    </View>
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
