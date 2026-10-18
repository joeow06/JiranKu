import { CameraView, useCameraPermissions } from 'expo-camera';
import { File } from 'expo-file-system';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Image, Linking, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon } from '@/components/Icon';
import { Button, Card, Header, Row, Txt } from '@/components/ui';
import { useAppStore } from '@/store/useAppStore';
import { colors, fonts, space } from '@/theme/tokens';

type Step = 'intro' | 'ic' | 'face' | 'checking';
type Shot = 'ic' | 'face';

/** IC and selfie are sensitive: delete them from the cache as soon as we're done. */
const discard = (uri: string | null) => {
  if (!uri) return;
  try {
    new File(uri).delete();
  } catch {
    // already gone
  }
};

// MOCK: no OCR or face matching runs; each check simply passes after a short delay (ms).
const CHECK_DELAYS = [900, 1900];
const CHECKS = ['IC details readable', 'Face matches IC photo'];

export default function KycScreen() {
  const router = useRouter();
  const mockVerify = useAppStore((s) => s.mockVerify);
  const [permission, requestPermission] = useCameraPermissions();

  const [step, setStep] = useState<Step>('intro');
  const [icUri, setIcUri] = useState<string | null>(null);
  const [faceUri, setFaceUri] = useState<string | null>(null);
  const [passed, setPassed] = useState(0);

  // Delete any captured photos if the user leaves early.
  const shots = useRef<{ ic: string | null; face: string | null }>({ ic: null, face: null });
  useEffect(
    () => () => {
      discard(shots.current.ic);
      discard(shots.current.face);
    },
    [],
  );

  const setShot = (kind: Shot, uri: string | null) => {
    discard(shots.current[kind]);
    shots.current[kind] = uri;
    (kind === 'ic' ? setIcUri : setFaceUri)(uri);
  };

  // Checking → tick each check → verified → photos deleted → back to onboarding.
  useEffect(() => {
    if (step !== 'checking') return;
    const timers = CHECK_DELAYS.map((ms, i) => setTimeout(() => setPassed(i + 1), ms));
    const done = setTimeout(() => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      mockVerify();
      setShot('ic', null);
      setShot('face', null);
      router.back();
    }, CHECK_DELAYS[CHECK_DELAYS.length - 1] + 700);
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(done);
    };
  }, [step, mockVerify, router]);

  // ---------- Intro + camera permission ----------
  if (step === 'intro') {
    const blocked = permission && !permission.granted && !permission.canAskAgain;
    return (
      <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
        <View style={{ paddingHorizontal: space.screen }}>
          <Header title="Verify identity" />
        </View>
        <ScrollView contentContainerStyle={styles.content}>
          <Txt variant="h1">Two quick steps</Txt>
          <StepRow n={1} title="Photo of your MyKad" sub="Front side, inside the frame" />
          <StepRow n={2} title="Face scan" sub="A selfie to match you to your IC" />
          <Card>
            <Row>
              <Icon name="camera" color={colors.primary} />
              <Txt variant="h3">Before we use your camera</Txt>
            </Row>
            <Bullet text="We take one photo of your IC and one selfie." />
            <Bullet text="Both photos are deleted from your phone right after the check." />
            <Bullet text="Neighbours only see a Verified badge — never your IC details." />
          </Card>
          {blocked && (
            <Card style={{ borderColor: colors.danger }}>
              <Txt variant="small">Camera access is turned off for JiranKu. Turn it on in Settings to verify.</Txt>
            </Card>
          )}
        </ScrollView>
        <View style={styles.footer}>
          {blocked ? (
            <Button label="Open Settings" onPress={() => Linking.openSettings()} />
          ) : (
            <Button
              label="Allow camera & start"
              onPress={async () => {
                const granted = permission?.granted || (await requestPermission()).granted;
                if (granted) setStep('ic');
              }}
            />
          )}
        </View>
      </SafeAreaView>
    );
  }

  // ---------- Checking ----------
  if (step === 'checking') {
    return (
      <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
        <View style={[styles.content, { flex: 1, justifyContent: 'center' }]}>
          <View style={styles.checkIcon}>
            <Icon name="shield" size={40} color={colors.tealStrong} />
          </View>
          <Txt variant="h1" style={{ textAlign: 'center' }}>
            {passed === CHECKS.length ? 'You’re verified' : 'Checking…'}
          </Txt>
          <Card>
            {CHECKS.map((label, i) => (
              <Row key={label} gap={10} style={{ minHeight: 32 }}>
                {passed > i ? (
                  <Icon name="check" size={20} color={colors.tealStrong} strokeWidth={2.6} />
                ) : (
                  <ActivityIndicator size="small" color={colors.primary} style={{ width: 20 }} />
                )}
                <Txt variant="bodyBold" color={passed > i ? colors.ink : colors.textMuted}>
                  {label}
                </Txt>
              </Row>
            ))}
          </Card>
          <Txt variant="small" color={colors.textMuted} style={{ textAlign: 'center' }}>
            Your photos are deleted once this finishes.
          </Txt>
        </View>
      </SafeAreaView>
    );
  }

  // ---------- Step 1: IC · Step 2: Face ----------
  const kind: Shot = step;
  const uri = kind === 'ic' ? icUri : faceUri;
  return (
    <CaptureStep
      key={kind}
      kind={kind}
      uri={uri}
      onCapture={(u) => setShot(kind, u)}
      onRetake={() => setShot(kind, null)}
      onUse={() => {
        setPassed(0);
        setStep(kind === 'ic' ? 'face' : 'checking');
      }}
      onBack={() => (kind === 'face' ? setStep('ic') : setStep('intro'))}
    />
  );
}

const COPY = {
  ic: {
    n: 1,
    title: 'Photo of your MyKad',
    hint: 'Place the front of your IC inside the frame. Make sure it’s well lit and all text is readable.',
    review: 'Is all the text clear and readable?',
    button: 'Take IC photo',
  },
  face: {
    n: 2,
    title: 'Face scan',
    hint: 'Fit your face inside the oval and look straight at the camera. Remove glasses or caps.',
    review: 'Is your whole face clear and in the oval?',
    button: 'Scan my face',
  },
} as const;

function CaptureStep({
  kind,
  uri,
  onCapture,
  onRetake,
  onUse,
  onBack,
}: {
  kind: Shot;
  uri: string | null;
  onCapture: (uri: string) => void;
  onRetake: () => void;
  onUse: () => void;
  onBack: () => void;
}) {
  const c = COPY[kind];
  const cameraRef = useRef<CameraView>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [busy, setBusy] = useState(false);

  const capture = async () => {
    const camera = cameraRef.current;
    if (!camera || busy) return;
    setBusy(true);
    try {
      const pic = await camera.takePictureAsync({ quality: 0.7 });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      onCapture(pic.uri);
    } catch {
      Alert.alert('Photo failed', 'The camera could not take a photo. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={{ paddingHorizontal: space.screen }}>
        <Header title="Verify identity" />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Row>
          <Progress n={c.n} />
          <Txt variant="smallBold" color={colors.textMuted}>
            Step {c.n} of 2
          </Txt>
        </Row>
        <Txt variant="h1">{c.title}</Txt>

        <View style={[styles.cameraBox, kind === 'face' && { height: 380 }]}>
          {uri ? (
            <Image source={{ uri }} style={StyleSheet.absoluteFill} resizeMode="cover" accessibilityLabel={c.title} />
          ) : (
            <>
              <CameraView
                ref={cameraRef}
                style={StyleSheet.absoluteFill}
                facing={kind === 'ic' ? 'back' : 'front'}
                mirror={kind === 'face'}
                onCameraReady={() => setCameraReady(true)}
                onMountError={() => setCameraReady(false)}
              />
              <View style={styles.guideWrap} pointerEvents="none">
                {kind === 'ic' ? <View style={styles.icFrame} /> : <View style={styles.faceOval} />}
              </View>
            </>
          )}
        </View>

        <Txt variant="small" color={colors.textMuted}>
          {uri ? c.review : c.hint}
        </Txt>
      </ScrollView>
      <View style={styles.footer}>
        {uri ? (
          <>
            <Button label={kind === 'ic' ? 'Use this photo' : 'Use this scan'} onPress={onUse} />
            <Button label="Retake" kind="secondary" onPress={onRetake} />
          </>
        ) : (
          <>
            <Button
              label={c.button}
              icon={<Icon name="camera" color="#FFFFFF" size={20} />}
              onPress={capture}
              loading={busy}
              disabled={!cameraReady}
            />
            <Button label={kind === 'ic' ? 'Back' : 'Back to IC photo'} kind="ghost" onPress={onBack} />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

function Progress({ n }: { n: number }) {
  return (
    <Row gap={4} style={{ flex: 1 }}>
      {[1, 2].map((i) => (
        <View key={i} style={[styles.progressSeg, { backgroundColor: i <= n ? colors.primary : colors.mutedBg }]} />
      ))}
    </Row>
  );
}

function StepRow({ n, title, sub }: { n: number; title: string; sub: string }) {
  return (
    <Row gap={12}>
      <View style={styles.stepNum}>
        <Txt variant="smallBold" color="#FFFFFF" style={{ fontFamily: fonts.extrabold }}>
          {n}
        </Txt>
      </View>
      <View style={{ flex: 1 }}>
        <Txt variant="bodyBold">{title}</Txt>
        <Txt variant="small" color={colors.textMuted}>
          {sub}
        </Txt>
      </View>
    </Row>
  );
}

function Bullet({ text }: { text: string }) {
  return (
    <Row gap={8} style={{ alignItems: 'flex-start' }}>
      <Txt variant="small" color={colors.primary}>
        •
      </Txt>
      <Txt variant="small" style={{ flex: 1 }}>
        {text}
      </Txt>
    </Row>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: space.screen, paddingTop: 8, gap: 14 },
  footer: { paddingHorizontal: space.screen, paddingTop: 10, paddingBottom: 6, gap: 6, backgroundColor: colors.bg },
  cameraBox: { height: 260, borderRadius: 22, overflow: 'hidden', backgroundColor: colors.ink },
  guideWrap: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' },
  // MyKad is ID-1 size: 85.6 × 54 mm.
  icFrame: { width: '86%', aspectRatio: 85.6 / 54, borderRadius: 14, borderWidth: 3, borderColor: '#FFFFFF' },
  faceOval: { width: 210, height: 280, borderRadius: 140, borderWidth: 3, borderColor: '#FFFFFF' },
  progressSeg: { flex: 1, height: 6, borderRadius: 3 },
  stepNum: { width: 26, height: 26, borderRadius: 13, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  checkIcon: {
    alignSelf: 'center',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.tealTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
