import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon } from '@/components/Icon';
import { Avatar, Button, Card, CategoryTag, Header, Row, Tag, Txt } from '@/components/ui';
import { quests } from '@/data/seed';
import { useOpenSession, useQuestState } from '@/store/selectors';
import { useAppStore } from '@/store/useAppStore';
import { colors, fonts, space } from '@/theme/tokens';

export default function QuestDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const quest = quests.find((q) => q.id === id);
  const state = useQuestState(id);
  const open = useOpenSession(id);
  const joinQuest = useAppStore((s) => s.joinQuest);

  if (!quest) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={{ padding: space.screen }}>
          <Header title="Quest not found" />
        </View>
      </SafeAreaView>
    );
  }

  const going = quest.mockParticipants.length;
  const onJoin = () => {
    const sessionId = open?.id ?? joinQuest(quest.id);
    router.push({ pathname: '/session/[id]', params: { id: sessionId } });
  };

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={{ paddingHorizontal: space.screen }}>
        <Header title="Quest detail" />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Cover (illustrative block — no real photos of places/people) */}
        <View style={styles.cover}>
          <View style={styles.coverIcon}>
            <Icon name={quest.icon} size={40} color="#FFFFFF" strokeWidth={2} />
          </View>
          <Txt variant="smallBold" color={colors.inkMutedOnDark}>
            {quest.venue.name}
          </Txt>
        </View>

        <Row gap={6} style={{ flexWrap: 'wrap' }}>
          <Tag label={quest.type.toUpperCase()} bg={colors.mutedBg} fg={colors.ink} />
          {quest.category === 'green' && <CategoryTag category="green" />}
          <Tag label="PUBLIC PLACE" bg={colors.mutedBg} fg={colors.ink} />
          <Tag label={`+${quest.points} SP`} bg={colors.highlight} fg={colors.primaryPressed} />
        </Row>
        <Txt variant="h1">{quest.title}</Txt>

        <Card style={{ gap: 0, paddingVertical: 4 }}>
          <InfoRow label="When" value={quest.when} />
          <InfoRow label="Duration" value={formatDuration(quest.durationMin)} />
          <InfoRow label="Where" value={`${quest.venue.name} · ${quest.venue.spot}`} />
          <InfoRow label="Group" value={`${quest.groupMin}–${quest.groupMax} people`} last />
        </Card>

        <View style={{ gap: 10 }}>
          <Row>
            <Txt variant="h3" style={{ flex: 1 }}>
              Going · {going} of {quest.groupMin} needed
            </Txt>
          </Row>
          <Row gap={14} style={{ flexWrap: 'wrap' }}>
            {quest.mockParticipants.map((p) => (
              <View key={p.id} style={styles.person}>
                <Avatar name={p.name} size={48} />
                <Txt variant="small" style={{ fontSize: 12 }} numberOfLines={1}>
                  {p.name} {p.verified ? '✓' : ''}
                </Txt>
              </View>
            ))}
            <View style={styles.person}>
              <Avatar name="+" size={48} ring={colors.primary} dashed />
              <Txt variant="smallBold" color={colors.primary} style={{ fontSize: 12 }}>
                You?
              </Txt>
            </View>
          </Row>
          <Txt variant="small" color={colors.textMuted}>
            ✓ = verified neighbour.{quest.sharedInterest ? ` Shared interest: ${quest.sharedInterest}.` : ''}
          </Txt>
        </View>

        <Card style={{ backgroundColor: colors.tealTint, borderColor: colors.tealTint }}>
          <Row>
            <Icon name="shield" color={colors.tealStrong} />
            <Txt variant="h3" color={colors.tealStrong}>
              How it’s verified
            </Txt>
          </Row>
          <Txt variant="small">{quest.verifyMethod}</Txt>
        </Card>
      </ScrollView>

      <View style={styles.footer}>
        {state === 'done' ? (
          <Button label={quest.type === 'daily' ? 'Done today ✓' : 'Completed ✓'} disabled />
        ) : (
          <Button label={state === 'active' ? 'Continue session' : 'Join quest'} onPress={onJoin} />
        )}
      </View>
    </SafeAreaView>
  );
}

function InfoRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <Row style={[styles.infoRow, !last && { borderBottomWidth: 1, borderBottomColor: colors.mutedBg }]}>
      <Txt variant="small" color={colors.textMuted} style={{ width: 76 }}>
        {label}
      </Txt>
      <Txt variant="bodyBold" style={{ flex: 1, fontSize: 14, fontFamily: fonts.semibold }}>
        {value}
      </Txt>
    </Row>
  );
}

function formatDuration(min: number) {
  if (min < 60) return `${min} min`;
  const h = min / 60;
  return `${Number.isInteger(h) ? h : h.toFixed(1)} hour${h === 1 ? '' : 's'}`;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: space.screen, paddingTop: 4, gap: 16 },
  cover: {
    height: 150,
    borderRadius: 22,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  coverIcon: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  person: { alignItems: 'center', gap: 4, width: 64 },
  infoRow: { minHeight: 46, paddingVertical: 10 },
  footer: { paddingHorizontal: space.screen, paddingTop: 10, paddingBottom: 6, backgroundColor: colors.bg },
});
