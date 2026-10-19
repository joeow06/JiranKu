import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FlameIcon, Icon } from '@/components/Icon';
import { Button, Card, CategoryTag, Row, Tag, Txt } from '@/components/ui';
import { badges, quests } from '@/data/seed';
import { useAppStore } from '@/store/useAppStore';
import { colors, fonts, space } from '@/theme/tokens';

export default function CompleteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const session = useAppStore((s) => s.sessions.find((x) => x.id === id));
  const photoUri = useAppStore((s) => (s.lastPhoto?.sessionId === id ? s.lastPhoto.uri : null));
  const quest = quests.find((q) => q.id === session?.questId);
  const result = session?.result;

  if (!session || !quest || !result) return <Redirect href="/" />;

  const badge = result.badgeUnlocked ? badges.find((b) => b.id === result.badgeUnlocked) : null;
  const capped = result.requested - result.awarded;

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Row gap={6}>
            <Tag label="QUEST COMPLETE · VERIFIED" bg={colors.teal} fg={colors.ink} />
            {quest.category === 'green' && <CategoryTag category="green" />}
          </Row>
          <Txt variant="small" color={colors.inkMutedOnDark}>
            {quest.title}
          </Txt>
          <Txt variant="display" color={colors.highlight} style={{ fontSize: 56, lineHeight: 62 }}>
            +{result.awarded} JP
          </Txt>
          {capped > 0 && (
            <Txt variant="small" color={colors.inkMutedOnDark}>
              Daily cap reached · {capped} JP not counted today
            </Txt>
          )}
          {!!quest.treesPlanted && (
            <Row gap={6}>
              <Icon name="sprout" color={colors.teal} size={20} strokeWidth={2} />
              <Txt variant="bodyBold" color="#FFFFFF">
                +{quest.treesPlanted} trees planted
              </Txt>
            </Row>
          )}
          {result.chestBonus > 0 && (
            <Row gap={6}>
              <Icon name="chest" color={colors.coin} size={20} strokeWidth={2} />
              <Txt variant="bodyBold" color="#FFFFFF">
                Daily chest opened · +{result.chestBonus} JP
              </Txt>
            </Row>
          )}
        </View>

        <Row gap={10}>
          <Card style={styles.statCard}>
            <FlameIcon size={26} color={colors.primary} />
            <Txt variant="h2">{result.streakAfter}-day streak</Txt>
            <Txt variant="small" color={colors.textMuted}>
              Keep it going tomorrow
            </Txt>
          </Card>
          <Card style={[styles.statCard, badge ? { backgroundColor: colors.highlight, borderColor: colors.highlight } : null]}>
            <Icon name="trophy" size={26} color={colors.primaryPressed} />
            {badge ? (
              <>
                <Txt variant="h2">{badge.name}</Txt>
                <Txt variant="small" color={colors.primaryPressed} style={{ fontFamily: fonts.bold }}>
                  Badge unlocked!
                </Txt>
              </>
            ) : (
              <>
                <Txt variant="h2">{quest.type === 'daily' ? 'Daily' : 'Weekly'} done</Txt>
                <Txt variant="small" color={colors.textMuted}>
                  No new badge this time
                </Txt>
              </>
            )}
          </Card>
        </Row>

        <View style={{ gap: 8 }}>
          <Row>
            <Txt variant="h3" style={{ flex: 1 }}>
              Squad snap
            </Txt>
            <Txt variant="small" color={colors.textMuted}>
              Group only · on this device
            </Txt>
          </Row>
          {result.photo && photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.photo} resizeMode="cover" accessibilityLabel="Your squad snap" />
          ) : (
            <View style={[styles.photo, styles.noPhoto]}>
              <Icon name="users" size={32} color={colors.textMuted} />
              <Txt variant="small" color={colors.textMuted} style={{ textAlign: 'center' }}>
                {/* MOCK: "confirmed by your group" — no other device actually confirms. */}
                {result.photo ? 'Photos aren’t kept after you close the app' : 'No photo · confirmed by your group'}
              </Txt>
            </View>
          )}
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <Button label="Done" kind="dark" onPress={() => router.dismissTo('/')} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: space.screen, gap: 16 },
  hero: { padding: 20, borderRadius: 24, backgroundColor: colors.ink, gap: 8 },
  statCard: { flex: 1, gap: 6 },
  photo: { height: 220, borderRadius: 22, backgroundColor: colors.mutedBg },
  noPhoto: { alignItems: 'center', justifyContent: 'center', gap: 8, padding: 20 },
  footer: { paddingHorizontal: space.screen, paddingTop: 10, paddingBottom: 6, backgroundColor: colors.bg },
});
