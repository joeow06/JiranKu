import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, Ellipse, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

import { Button, DemoTag, Row, Screen, Txt } from '@/components/ui';
import { colors } from '@/theme/tokens';

// Snapchat-style heat: soft blobs over an abstract neighbourhood sketch.
// No people, no homes, no real coordinates — positions are illustrative only.
const BLOBS = [
  { id: 'lake', x: 120, y: 150, r: 95, heat: 4 },
  { id: 'food', x: 270, y: 260, r: 70, heat: 3 },
  { id: 'dewan', x: 250, y: 90, r: 55, heat: 2 },
  { id: 'park', x: 90, y: 300, r: 60, heat: 1 },
  { id: 'lrt', x: 320, y: 340, r: 45, heat: 0 },
];

const HOTSPOTS = [
  { name: 'Tasik Putra Heights', live: '3 quests live', questId: 'q-walk' },
  { name: 'Putra Heights food court', live: '1 quest live', questId: 'q-makan' },
];

export default function MapScreen() {
  const router = useRouter();
  return (
    <Screen>
      <Row>
        <Txt variant="h1" style={{ flex: 1 }}>
          Activity map
        </Txt>
        <DemoTag label="Demo data" />
      </Row>

      <View style={styles.mapBox}>
        <Svg width="100%" height="100%" viewBox="0 0 360 400" preserveAspectRatio="xMidYMid slice">
          <Defs>
            {BLOBS.map((b) => (
              <RadialGradient key={b.id} id={`g-${b.id}`} cx="50%" cy="50%" r="50%">
                <Stop offset="0" stopColor={colors.heat[b.heat]} stopOpacity={0.85} />
                <Stop offset="0.55" stopColor={colors.heat[b.heat]} stopOpacity={0.35} />
                <Stop offset="1" stopColor={colors.heat[b.heat]} stopOpacity={0} />
              </RadialGradient>
            ))}
          </Defs>
          <Rect width="360" height="400" fill="#EEF0F6" />
          {/* abstract roads and lake */}
          <Path d="M0 210 C 90 200, 200 230, 360 200" stroke="#FFFFFF" strokeWidth={14} fill="none" />
          <Path d="M200 0 C 190 120, 230 260, 210 400" stroke="#FFFFFF" strokeWidth={12} fill="none" />
          <Path d="M0 60 L 360 110 M 40 400 L 120 0 M 300 0 L 340 400" stroke="#FFFFFF" strokeWidth={6} fill="none" />
          <Ellipse cx="115" cy="140" rx="60" ry="38" fill="#CDE7F0" />
          {BLOBS.map((b) => (
            <Ellipse key={b.id} cx={b.x} cy={b.y} rx={b.r} ry={b.r * 0.85} fill={`url(#g-${b.id})`} />
          ))}
        </Svg>
        <View style={styles.mapLabel}>
          <Txt variant="caps" color={colors.ink}>
            PUTRA HEIGHTS · LIVE*
          </Txt>
        </View>
      </View>

      <Row gap={6}>
        {colors.heat.map((c) => (
          <View key={c} style={{ flex: 1, height: 8, borderRadius: 4, backgroundColor: c }} />
        ))}
      </Row>
      <Row style={{ justifyContent: 'space-between', marginTop: -10 }}>
        <Txt variant="small" color={colors.textMuted} style={{ fontSize: 12 }}>
          Quiet
        </Txt>
        <Txt variant="small" color={colors.textMuted} style={{ fontSize: 12 }}>
          Busy
        </Txt>
      </Row>

      <Txt variant="h2">Hot right now</Txt>
      {HOTSPOTS.map((h) => (
        <View key={h.name} style={styles.hot}>
          <View style={{ flex: 1 }}>
            <Txt variant="bodyBold">{h.name}</Txt>
            <Txt variant="small" color={colors.textMuted}>
              {h.live}
            </Txt>
          </View>
          <Button
            label="Join"
            style={{ minHeight: 44, paddingHorizontal: 20 }}
            onPress={() => router.push({ pathname: '/quest/[id]', params: { id: h.questId } })}
          />
        </View>
      ))}

      <Txt variant="small" color={colors.textMuted} style={{ textAlign: 'center' }}>
        Heat is blurred — no people, no homes shown. *Static demo data, not live.
      </Txt>
    </Screen>
  );
}

const styles = StyleSheet.create({
  mapBox: { height: 340, borderRadius: 22, overflow: 'hidden', backgroundColor: '#EEF0F6' },
  mapLabel: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  hot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border,
  },
});
