import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { Button, Card, Chip, DemoTag, Row, Screen, Segmented, Txt } from '@/components/ui';
import { neighbourhoods } from '@/data/seed';
import { useAppStore } from '@/store/useAppStore';
import { colors, fonts, MIN_TOUCH } from '@/theme/tokens';

const INTERESTS = [
  'Badminton',
  'Running',
  'Makan',
  'Cycling',
  'Pottery',
  'Futsal',
  'Gardening',
  'Board games',
  'Pets',
  'Photography',
  'Hiking',
  'Cooking',
] as const;
const AGES = ['18–24', '25–34', '35–44', '45–59', '60+'] as const;

export default function Onboarding() {
  const router = useRouter();
  const user = useAppStore((s) => s.user);
  const mockVerify = useAppStore((s) => s.mockVerify);
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);

  const [verifying, setVerifying] = useState(false);
  const [picked, setPicked] = useState<string[]>(['Badminton', 'Running', 'Makan']);
  const [age, setAge] = useState<(typeof AGES)[number]>('25–34');
  const [hood, setHood] = useState<string | null>(null);

  const verified = user.verification === 'mock_verified';

  useEffect(() => {
    if (!verifying) return;
    const t = setTimeout(() => {
      mockVerify();
      setVerifying(false);
    }, 1200);
    return () => clearTimeout(t);
  }, [verifying, mockVerify]);

  const toggle = (i: string) => setPicked((p) => (p.includes(i) ? p.filter((x) => x !== i) : [...p, i]));
  const canContinue = verified && picked.length >= 3 && !!hood;

  const missing = !verified ? 'Verify to continue' : picked.length < 3 ? 'Pick 3 or more interests' : !hood ? 'Choose your neighbourhood' : null;

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={{ gap: 6 }}>
        <Image
          source={require('@/assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
          accessibilityRole="image"
          accessibilityLabel="JiranKu"
        />
        <Txt variant="h2">Your neighbourhood in your pocket.</Txt>
        <Txt variant="body" color={colors.textMuted}>
          Others connect you to management. JiranKu connects you to people — one small quest at a time.
        </Txt>
      </View>

      {/* 1. Mock KYC */}
      <Card>
        <Row>
          <StepNum n={1} />
          <Txt variant="h3" style={{ flex: 1 }}>
            Verify it’s really you
          </Txt>
          <DemoTag label="Demo · Mock KYC" />
        </Row>
        <Txt variant="small" color={colors.textMuted}>
          Every neighbour you meet is verified, so meeting up feels safe. Neighbours only see a Verified badge — never your IC
          details. No ID is scanned in this demo.
        </Txt>
        {verified ? (
          <Row style={styles.verifiedBadge}>
            <Icon name="shield" color={colors.tealStrong} />
            <Txt variant="bodyBold" color={colors.tealStrong}>
              Verified (Mock KYC)
            </Txt>
          </Row>
        ) : (
          <Button
            label={verifying ? 'Verifying (mock)…' : 'Verify identity'}
            kind="dark"
            loading={verifying}
            onPress={() => setVerifying(true)}
          />
        )}
      </Card>

      {/* 2. Interests + age */}
      <Card>
        <Row>
          <StepNum n={2} />
          <Txt variant="h3" style={{ flex: 1 }}>
            What do you enjoy?
          </Txt>
          <Txt variant="smallBold" color={picked.length >= 3 ? colors.tealStrong : colors.textMuted}>
            {picked.length} picked
          </Txt>
        </Row>
        <Txt variant="small" color={colors.textMuted}>
          Pick 3 or more. We’ll match you with quests and neighbours who like the same things.
        </Txt>
        <View style={styles.chips}>
          {INTERESTS.map((i) => (
            <Chip key={i} label={i} selected={picked.includes(i)} onPress={() => toggle(i)} />
          ))}
        </View>
        <Txt variant="smallBold" style={{ marginTop: 6 }}>
          Age range
        </Txt>
        <Segmented options={AGES} value={age} onChange={setAge} />
        <Txt variant="small" color={colors.textMuted} style={{ fontSize: 12 }}>
          Only used for matching. Never shown on your profile.
        </Txt>
      </Card>

      {/* 3. Neighbourhood */}
      <Card>
        <Row>
          <StepNum n={3} />
          <Txt variant="h3" style={{ flex: 1 }}>
            Where’s home?
          </Txt>
        </Row>
        <Txt variant="small" color={colors.textMuted}>
          Approximate area only · no pin on your home.
        </Txt>
        {neighbourhoods.map((n) => {
          const on = hood === n.id;
          return (
            <Pressable
              key={n.id}
              onPress={() => setHood(n.id)}
              accessibilityRole="radio"
              accessibilityState={{ checked: on }}
              style={[styles.hoodRow, on && { borderColor: colors.primary, backgroundColor: '#F0EFFD' }]}>
              <View style={[styles.radio, on && { borderColor: colors.primary }]}>{on && <View style={styles.radioDot} />}</View>
              <View style={{ flex: 1 }}>
                <Txt variant="bodyBold">
                  {n.name}, {n.area}
                </Txt>
                <Txt variant="small" color={colors.textMuted} style={{ fontSize: 12 }}>
                  Taman · 1.2k neighbours on JiranKu (demo)
                </Txt>
              </View>
            </Pressable>
          );
        })}
        <View style={[styles.hoodRow, { opacity: 0.55 }]}>
          <View style={styles.radio} />
          <View style={{ flex: 1 }}>
            <Txt variant="bodyBold">Putra Heights condos</Txt>
            <Txt variant="small" color={colors.textMuted} style={{ fontSize: 12 }}>
              Condo · managed by JMB · not in demo
            </Txt>
          </View>
        </View>
      </Card>

      <View style={{ gap: 6 }}>
        <Button
          label={hood ? `Join ${neighbourhoods.find((n) => n.id === hood)?.name}` : 'Continue'}
          disabled={!canContinue}
          onPress={() => {
            completeOnboarding({ interests: picked, ageBand: age, neighbourhoodId: hood! });
            router.replace('/');
          }}
        />
        {missing && (
          <Txt variant="small" color={colors.textMuted} style={{ textAlign: 'center' }}>
            {missing}
          </Txt>
        )}
      </View>
    </Screen>
  );
}

function StepNum({ n }: { n: number }) {
  return (
    <View style={styles.stepNum}>
      <Txt variant="smallBold" color="#FFFFFF" style={{ fontFamily: fonts.extrabold }}>
        {n}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  logo: { width: 150, height: 113, marginBottom: 6 },
  stepNum: { width: 26, height: 26, borderRadius: 13, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  verifiedBadge: { padding: 12, borderRadius: 14, backgroundColor: colors.tealTint },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  hoodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: MIN_TOUCH + 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
});
