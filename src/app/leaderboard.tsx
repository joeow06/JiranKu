import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Avatar, Header, Row, Screen, Segmented, Txt } from '@/components/ui';
import { rewardPartners } from '@/data/rewardPartners';
import { colors, fonts } from '@/theme/tokens';

const TABS = ['Neighbours', 'Neighbourhoods'] as const;
type Tab = (typeof TABS)[number];

// MOCK: static leaderboard data from the wireframe (no live ranking).
const DATA: Record<Tab, { top: [string, string][]; rows: [string, string, string, boolean?][] }> = {
  Neighbours: {
    top: [
      ['Mei Ling', '2,480 JP'],
      ['Wei Jie', '2,210 JP'],
      ['Kumar', '1,960 JP'],
    ],
    rows: [
      ['4', 'Farah', '1,720 JP'],
      ['5', 'Daniel', '1,590 JP'],
      ['12', 'You (Aisyah)', '1,240 JP', true],
      ['13', 'Siva', '1,180 JP'],
    ],
  },
  Neighbourhoods: {
    top: [
      ['USJ 1', '9.1k JP'],
      ['Kota Kemuning', '8.4k JP'],
      ['Putra Heights', '8.0k JP'],
    ],
    rows: [
      ['3', 'Putra Heights · yours', '8.0k JP', true],
      ['4', 'Subang Bestari', '7.2k JP'],
      ['5', 'Bandar Kinrara', '6.9k JP'],
      ['6', 'Bukit Jelutong', '6.1k JP'],
    ],
  },
};

export default function LeaderboardScreen() {
  const [tab, setTab] = useState<Tab>('Neighbourhoods');
  const d = DATA[tab];
  // podium order: 2nd, 1st, 3rd
  const podium = [
    { p: d.top[1], rank: 2, h: 90 },
    { p: d.top[0], rank: 1, h: 120 },
    { p: d.top[2], rank: 3, h: 70 },
  ];

  return (
    <Screen edges={['top', 'bottom']}>
      <Header title="Leaderboards" />
      <Row style={{ justifyContent: 'space-between' }}>
        <Txt variant="h1">October</Txt>
      </Row>
      <Segmented options={TABS} value={tab} onChange={setTab} />

      <Row gap={10} style={{ alignItems: 'flex-end' }}>
        {podium.map(({ p, rank, h }) => (
          <View key={rank} style={{ flex: 1, alignItems: 'center', gap: 6 }}>
            <Avatar name={p[0]} size={rank === 1 ? 56 : 46} ring={rank === 1 ? colors.highlight : undefined} />
            <Txt variant="smallBold" numberOfLines={1}>
              {p[0]}
            </Txt>
            <View style={[styles.step, { height: h, backgroundColor: rank === 1 ? colors.primary : colors.ink }]}>
              <Txt variant="h1" color="#FFFFFF">
                {rank}
              </Txt>
              <Txt variant="smallBold" color={colors.highlight} style={{ fontSize: 12 }}>
                {p[1]}
              </Txt>
            </View>
          </View>
        ))}
      </Row>

      <View style={styles.list}>
        {d.rows.map(([rank, name, score, me], i) => (
          <Row key={rank} gap={12} style={[styles.row, i > 0 && styles.rowBorder, me && { backgroundColor: colors.highlight }]}>
            <Txt variant="bodyBold" color={colors.textMuted} style={{ width: 28 }}>
              {rank}
            </Txt>
            <Txt variant="bodyBold" style={{ flex: 1, fontSize: 14 }}>
              {name}
            </Txt>
            <Txt variant="smallBold" style={{ fontFamily: fonts.extrabold }}>
              {score}
            </Txt>
          </Row>
        ))}
      </View>

      <Txt variant="small" color={colors.textMuted} style={{ textAlign: 'center' }}>
        {/* MOCK: sponsorship is not confirmed. */}
        Top neighbourhood each quarter wins a group lunch from {rewardPartners.sponsor.name}
      </Txt>
    </Screen>
  );
}

const styles = StyleSheet.create({
  step: { width: '100%', borderTopLeftRadius: 14, borderTopRightRadius: 14, alignItems: 'center', justifyContent: 'center' },
  list: { borderRadius: 18, overflow: 'hidden', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: colors.border },
  row: { minHeight: 48, paddingHorizontal: 14, paddingVertical: 12 },
  rowBorder: { borderTopWidth: 1, borderTopColor: colors.mutedBg },
});
