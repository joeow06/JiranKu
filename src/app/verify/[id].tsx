import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, Image, Linking, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon } from '@/components/Icon';
import { Avatar, Button, Card, DemoTag, Header, Row, Txt } from '@/components/ui';
import { quests } from '@/data/seed';
import { useAppStore } from '@/store/useAppStore';
import { colors, fonts, space } from '@/theme/tokens';

type Phase = 'consent' | 'lobby' | 'countdown' | 'review';

// One-device demo: other participants turn Ready on their own, staggered (ms).
const SIM_READY_DELAYS = [1200, 2000, 2600, 3000];

export default function VerifyScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const session = useAppStore((s) => s.sessions.find((x) => x.id === id));
  const completeSession = useAppStore((s) => s.completeSession);
  const quest = quests.find((q) => q.id === session?.questId);

  const [permission, requestPermission] = useCameraPermissions();
  const [step, setPhase] = useState<Phase>('consent');
  const [ready, setReady] = useState<Record<string, boolean>>({});
  const [meReady, setMeReady] = useState(false);
  const [count, setCount] = useState(3);
  const [cameraReady, setCameraReady] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);

  // Simulated participants become ready a moment after the lobby opens.
  useEffect(() => {
    if (step !== 'lobby' || !quest) return;
    const timers = quest.mockParticipants.map((p, i) =>
      setTimeout(() => setReady((r) => ({ ...r, [p.id]: true })), SIM_READY_DELAYS[i] ?? 3000),
    );
    return () => timers.forEach(clearTimeout);
  }, [step, quest]);

  const allOthersReady = !!quest && quest.mockParticipants.every((p) => ready[p.id]);
  // Everyone ready → synced countdown starts (count is reset to 3 whenever "I'm ready" is tapped).
  const phase: Phase = step === 'lobby' && meReady && allOthersReady ? 'countdown' : step;

  // 3-2-1 → snap.
  useEffect(() => {
    if (phase !== 'countdown') return;
    if (count > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      const t = setTimeout(() => setCount((c) => c - 1), 1000);
      return () => clearTimeout(t);
    }
    let cancelled = false;
    const fail = () => {
      Alert.alert('Photo failed', 'The camera could not take a photo. Try again, or continue without a photo.');
      setMeReady(false);
      setCount(3);
      setPhase('lobby');
    };
    // Camera still starting (e.g. after Retake): wait for onCameraReady, give up after 4s.
    if (!cameraReady || !cameraRef.current) {
      const t = setTimeout(fail, 4000);
      return () => clearTimeout(t);
    }
    const camera = cameraRef.current;
    (async () => {
      try {
        const pic = await camera.takePictureAsync({ quality: 0.6 });
        if (cancelled) return;
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        setPhotoUri(pic.uri);
        setPhase('review');
      } catch {
        if (!cancelled) fail();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [phase, count, cameraReady]);

  if (!session || !quest) return <Redirect href="/" />;
  if (session.status === 'completed') return <Redirect href={{ pathname: '/complete/[id]', params: { id: session.id } }} />;

  const finish = (uri: string | null) => {
    completeSession(session.id, uri);
    router.replace({ pathname: '/complete/[id]', params: { id: session.id } });
  };

  const readyCount = quest.mockParticipants.filter((p) => ready[p.id]).length + (meReady ? 1 : 0);
  const total = quest.mockParticipants.length + 1;

  // ---------- Consent + permission ----------
  if (phase === 'consent') {
    const blocked = permission && !permission.granted && !permission.canAskAgain;
    return (
      <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
        <View style={{ paddingHorizontal: space.screen }}>
          <Header title="Group verify" />
        </View>
        <ScrollView contentContainerStyle={styles.content}>
          <Txt variant="h1">Squad snap</Txt>
          <Txt variant="body" color={colors.textMuted}>
            Everyone taps Ready. When the whole group is in, all phones count down together and snap at the same moment.
          </Txt>
          <Card>
            <Row>
              <Icon name="camera" color={colors.primary} />
              <Txt variant="h3">Before we use your camera</Txt>
            </Row>
            <Bullet text="We take one front-camera photo after a 3-2-1 countdown." />
            <Bullet text="The photo proves the group met. It is shown to this group only." />
            <Bullet text="In this demo the photo stays on your phone and is never uploaded." />
            <Bullet text="Only take photos of people who agree to be in them." />
          </Card>
          {blocked && (
            <Card style={{ borderColor: colors.danger }}>
              <Txt variant="small">
                Camera access is turned off for JiranKu. You can turn it on in Settings, or ask the group to confirm you instead.
              </Txt>
            </Card>
          )}
        </ScrollView>
        <View style={styles.footer}>
          {blocked ? (
            <Button label="Open Settings" onPress={() => Linking.openSettings()} />
          ) : (
            <Button
              label="Allow camera & continue"
              onPress={async () => {
                const granted = permission?.granted || (await requestPermission()).granted;
                if (granted) setPhase('lobby');
              }}
            />
          )}
          <Button label="Can't use the camera? Continue without photo" kind="ghost" onPress={() => finish(null)} />
        </View>
      </SafeAreaView>
    );
  }

  // ---------- Review ----------
  if (phase === 'review' && photoUri) {
    return (
      <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
        <View style={{ paddingHorizontal: space.screen }}>
          <Header title="Group verify" />
        </View>
        <View style={[styles.content, { flex: 1 }]}>
          <Txt variant="h1">Nice snap!</Txt>
          <Image source={{ uri: photoUri }} style={styles.photo} resizeMode="cover" accessibilityLabel="Your squad snap" />
          <Row gap={6}>
            <DemoTag label="Simulated" />
            <Txt variant="small" color={colors.textMuted} style={{ flex: 1 }}>
              Other phones’ photos are simulated in this demo.
            </Txt>
          </Row>
        </View>
        <View style={styles.footer}>
          <Button label="Submit & complete quest" onPress={() => finish(photoUri)} />
          <Button
            label="Retake"
            kind="secondary"
            onPress={() => {
              setPhotoUri(null);
              setCameraReady(false); // camera remounts; wait for onCameraReady again
              setCount(3);
              setPhase('countdown');
            }}
          />
        </View>
      </SafeAreaView>
    );
  }

  // ---------- Lobby + countdown (camera live) ----------
  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={{ paddingHorizontal: space.screen }}>
        <Header title="Group verify" />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.simBanner}>
          <DemoTag label="Simulated" />
          <Txt variant="small" style={{ flex: 1, fontSize: 12 }}>
            One-device demo: other neighbours are marked ready automatically.
          </Txt>
        </View>

        <View style={styles.cameraBox}>
          <CameraView
            ref={cameraRef}
            style={StyleSheet.absoluteFill}
            facing="front"
            mirror
            onCameraReady={() => setCameraReady(true)}
            onMountError={() => setCameraReady(false)}
          />
          {phase === 'countdown' && (
            <View style={styles.countOverlay}>
              <Txt variant="display" color="#FFFFFF" style={{ fontSize: 120, lineHeight: 130 }}>
                {count > 0 ? count : '📸'}
              </Txt>
            </View>
          )}
        </View>

        <Row>
          <Txt variant="h3" style={{ flex: 1 }}>
            {readyCount} / {total} ready
          </Txt>
        </Row>
        <View style={{ gap: 10 }}>
          {quest.mockParticipants.map((p) => (
            <PersonRow key={p.id} name={p.name} ready={!!ready[p.id]} simulated />
          ))}
          <PersonRow name="You" ready={meReady} />
        </View>
      </ScrollView>
      <View style={styles.footer}>
        {phase === 'countdown' ? (
          <Button label="Hold still…" disabled />
        ) : meReady ? (
          <Button label={`Waiting for ${total - readyCount} more…`} disabled />
        ) : (
          <>
            <Button
              label="I'm ready"
              onPress={() => {
                setCount(3);
                setMeReady(true);
              }}
              disabled={!cameraReady}
            />
            <Button label="Continue without photo" kind="ghost" onPress={() => finish(null)} />
          </>
        )}
        <Txt variant="small" color={colors.textMuted} style={{ textAlign: 'center', fontSize: 12 }}>
          Photo visible to this group only · stays on this device in the demo
        </Txt>
      </View>
    </SafeAreaView>
  );
}

function PersonRow({ name, ready, simulated }: { name: string; ready: boolean; simulated?: boolean }) {
  return (
    <Row gap={10}>
      <Avatar name={name === 'You' ? 'Aisyah' : name} size={40} ring={ready ? colors.tealStrong : colors.primary} dashed={!ready} />
      <Txt variant="bodyBold" style={{ flex: 1 }}>
        {name}
      </Txt>
      {simulated && <DemoTag label="Simulated" />}
      <Txt
        variant="smallBold"
        color={ready ? colors.tealStrong : colors.textMuted}
        style={{ fontFamily: fonts.extrabold, width: 70, textAlign: 'right' }}>
        {ready ? 'Ready ✓' : 'Waiting'}
      </Txt>
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
  simBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 14,
    backgroundColor: colors.highlight,
  },
  cameraBox: {
    height: 300,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: colors.ink,
  },
  countOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(69,60,103,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photo: { flex: 1, borderRadius: 22, backgroundColor: colors.mutedBg },
});
