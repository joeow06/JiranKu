import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';

import { Icon } from '@/components/Icon';
import { Avatar, Button, Card, Header, Row, Tag, Txt } from '@/components/ui';
import { quests } from '@/data/seed';
import type { Quest, Session } from '@/data/types';
import { formatElapsed } from '@/lib/dates';
import { useAppStore } from '@/store/useAppStore';
import { colors, space } from '@/theme/tokens';

export default function SessionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const session = useAppStore((s) => s.sessions.find((x) => x.id === id));
  const quest = quests.find((q) => q.id === session?.questId);

  if (!session || !quest) return <Redirect href="/" />;
  if (session.status === 'completed') return <Redirect href={{ pathname: '/complete/[id]', params: { id: session.id } }} />;
  return session.status === 'joined' ? <Lobby session={session} quest={quest} /> : <Active session={session} quest={quest} />;
}

// ---------- Before check-in: meet point + mocked check-in ----------

function Lobby({ session, quest }: { session: Session; quest: Quest }) {
  const checkIn = useAppStore((s) => s.checkIn);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (!checking) return;
    // MOCK: pretend to read GPS for ~1s, then check in (no location is used).
    const t = setTimeout(() => checkIn(session.id), 900);
    return () => clearTimeout(t);
  }, [checking, checkIn, session.id]);

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={{ paddingHorizontal: space.screen }}>
        <Header title="Quest session" />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={{ gap: 4 }}>
          <Txt variant="h1">{quest.title}</Txt>
          <Txt variant="small" color={colors.textMuted}>
            {session.participantIds.length} going · {quest.when}
          </Txt>
        </View>

        <Card style={{ backgroundColor: colors.ink, borderColor: colors.ink }}>
          <Row>
            <Tag label="YOU'RE IN" bg={colors.highlight} fg={colors.ink} />
          </Row>
          <Row gap={10} style={{ alignItems: 'flex-start' }}>
            <Icon name="pin" color={colors.teal} size={24} />
            <View style={{ flex: 1, gap: 2 }}>
              <Txt variant="small" color={colors.inkMutedOnDark}>
                Meet at
              </Txt>
              <Txt variant="h3" color="#FFFFFF">
                {quest.venue.name}, {quest.venue.spot.toLowerCase()}
              </Txt>
              <Txt variant="small" color={colors.inkMutedOnDark}>
                Public venue · approximate area only
              </Txt>
            </View>
          </Row>
        </Card>

        <View style={{ gap: 10 }}>
          <Row>
            <Txt variant="h3" style={{ flex: 1 }}>
              Who’s coming
            </Txt>
          </Row>
          {quest.mockParticipants.map((p) => (
            <Row key={p.id} gap={10}>
              <Avatar name={p.name} size={40} />
              <Txt variant="bodyBold" style={{ flex: 1 }}>
                {p.name} {p.verified ? '✓' : ''}
              </Txt>
              <Txt variant="small" color={colors.textMuted}>
                On the way
              </Txt>
            </Row>
          ))}
          <Row gap={10}>
            <Avatar name="Aisyah" size={40} ring={colors.primary} />
            <Txt variant="bodyBold" style={{ flex: 1 }}>
              You
            </Txt>
            <Txt variant="small" color={colors.textMuted}>
              Not checked in
            </Txt>
          </Row>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label={checking ? 'Checking location…' : 'Check in at venue'}
          loading={checking}
          onPress={() => setChecking(true)}
          icon={<Icon name="pin" color="#FFFFFF" size={20} strokeWidth={2.2} />}
        />
        <Txt variant="small" color={colors.textMuted} style={{ fontSize: 12, textAlign: 'center' }}>
          Check in when you arrive at the venue
        </Txt>
      </View>
    </SafeAreaView>
  );
}

// ---------- After check-in: Strava-like active view ----------

function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}

function Active({ session, quest }: { session: Session; quest: Quest }) {
  const router = useRouter();
  const now = useNow();
  const elapsed = now - (session.startedAt ?? now);
  const goal = quest.durationMin * 60_000;
  const progress = Math.min(1, elapsed / goal);
  const minsLeft = Math.max(0, Math.ceil((goal - elapsed) / 60_000));
  const checkedInAt = new Date(session.startedAt ?? now).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.ink }]} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={[styles.content, { alignItems: 'stretch' }]}>
        <Row>
          <Tag label="IN PROGRESS" bg={colors.teal} fg={colors.ink} />
        </Row>
        <Txt variant="h1" color="#FFFFFF">
          {quest.title}
        </Txt>

        <View style={{ alignItems: 'center', paddingVertical: 8 }}>
          <Ring progress={progress} />
          <View style={styles.ringCenter}>
            <Txt variant="display" color="#FFFFFF" style={{ fontSize: 44, lineHeight: 50 }}>
              {formatElapsed(elapsed)}
            </Txt>
            <Txt variant="small" color={colors.inkMutedOnDark}>
              elapsed · goal {formatElapsed(goal)}
            </Txt>
          </View>
        </View>
        <Txt variant="bodyBold" color={colors.highlight} style={{ textAlign: 'center' }}>
          {progress >= 1 ? 'Goal reached — time to verify!' : `${minsLeft} min to go`}
        </Txt>

        <Row gap={10}>
          <Stat label="Checked in" value={`${session.participantIds.length} / ${session.participantIds.length}`} />
          {/* MOCK: participants and geofence status are not measured. */}
          <Stat label="Geofence" value="Inside" />
        </Row>

        <View style={styles.checkList}>
          {quest.mockParticipants.map((p) => (
            <Row key={p.id} gap={10}>
              <Avatar name={p.name} size={34} ring={colors.teal} />
              <Txt variant="bodyBold" color="#FFFFFF" style={{ flex: 1 }}>
                {p.name}
              </Txt>
              <Txt variant="small" color={colors.inkMutedOnDark}>
                Checked in
              </Txt>
            </Row>
          ))}
          <Row gap={10}>
            <Avatar name="Aisyah" size={34} ring={colors.highlight} />
            <Txt variant="bodyBold" color="#FFFFFF" style={{ flex: 1 }}>
              You
            </Txt>
            <Txt variant="small" color={colors.inkMutedOnDark}>
              Checked in {checkedInAt}
            </Txt>
          </Row>
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.ink }]}>
        <Button
          label="Finish & verify"
          onPress={() => router.replace({ pathname: '/verify/[id]', params: { id: session.id } })}
        />
        {progress < 1 && (
          <Txt variant="small" color={colors.inkMutedOnDark} style={{ textAlign: 'center', fontSize: 12 }}>
            You can finish before the goal time
          </Txt>
        )}
      </View>
    </SafeAreaView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Txt variant="small" color={colors.inkMutedOnDark} style={{ fontSize: 12 }}>
        {label}
      </Txt>
      <Txt variant="h2" color="#FFFFFF">
        {value}
      </Txt>
    </View>
  );
}

const RING = 220;
const STROKE = 14;

function Ring({ progress }: { progress: number }) {
  const r = (RING - STROKE) / 2;
  const c = 2 * Math.PI * r;
  return (
    <Svg width={RING} height={RING} style={{ transform: [{ rotate: '-90deg' }] }}>
      <Circle cx={RING / 2} cy={RING / 2} r={r} stroke={colors.inkSoft} strokeWidth={STROKE} fill="none" />
      <Circle
        cx={RING / 2}
        cy={RING / 2}
        r={r}
        stroke={colors.teal}
        strokeWidth={STROKE}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={`${c} ${c}`}
        strokeDashoffset={c * (1 - progress)}
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: space.screen, paddingTop: 8, gap: 16 },
  footer: { paddingHorizontal: space.screen, paddingTop: 10, paddingBottom: 6, gap: 8, backgroundColor: colors.bg },
  ringCenter: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, alignItems: 'center', justifyContent: 'center' },
  stat: { flex: 1, padding: 14, borderRadius: 18, backgroundColor: colors.inkSoft, gap: 2 },
  checkList: { gap: 12, padding: 14, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.06)' },
});

