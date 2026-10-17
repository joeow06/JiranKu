import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { getPartner } from '@/data/rewardPartners';
import { questCategories } from '@/data/seed';
import type { QuestCategory } from '@/data/types';
import { colors, fonts, MIN_TOUCH, radius, space } from '@/theme/tokens';

import { Icon } from './Icon';

// ---------- Text ----------

type Variant = 'display' | 'h1' | 'h2' | 'h3' | 'body' | 'bodyBold' | 'small' | 'smallBold' | 'caps';

const variants: Record<Variant, TextStyle> = {
  display: { fontFamily: fonts.heading, fontSize: 40, lineHeight: 46 },
  h1: { fontFamily: fonts.heading, fontSize: 26, lineHeight: 32 },
  h2: { fontFamily: fonts.heading, fontSize: 20, lineHeight: 26 },
  h3: { fontFamily: fonts.extrabold, fontSize: 16, lineHeight: 21 },
  body: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 21 },
  bodyBold: { fontFamily: fonts.bold, fontSize: 15, lineHeight: 21 },
  small: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 18 },
  smallBold: { fontFamily: fonts.bold, fontSize: 13, lineHeight: 18 },
  caps: { fontFamily: fonts.extrabold, fontSize: 11, lineHeight: 14, letterSpacing: 0.9 },
};

export function Txt({
  variant = 'body',
  color = colors.ink,
  style,
  ...rest
}: TextProps & { variant?: Variant; color?: string }) {
  return <Text {...rest} style={[variants[variant], { color }, style]} />;
}

// ---------- Layout ----------

export function Screen({
  children,
  scroll = true,
  edges = ['top'],
  contentStyle,
  bg = colors.bg,
}: {
  children: ReactNode;
  scroll?: boolean;
  edges?: Edge[];
  contentStyle?: StyleProp<ViewStyle>;
  bg?: string;
}) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }} edges={edges}>
      {scroll ? (
        <ScrollView contentContainerStyle={[styles.screenContent, contentStyle]} showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.screenContent, { flex: 1 }, contentStyle]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

/** Title row with a back button for stack screens. */
export function Header({ title, right }: { title: string; right?: ReactNode }) {
  const router = useRouter();
  return (
    <View style={styles.header}>
      <Pressable
        onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
        accessibilityRole="button"
        accessibilityLabel="Back"
        hitSlop={8}
        style={styles.backBtn}>
        <Icon name="back" size={22} color={colors.ink} strokeWidth={2.2} />
      </Pressable>
      <Txt variant="h3" style={{ flex: 1 }} numberOfLines={1}>
        {title}
      </Txt>
      {right}
    </View>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Row({ children, gap = 8, style }: { children: ReactNode; gap?: number; style?: StyleProp<ViewStyle> }) {
  return <View style={[{ flexDirection: 'row', alignItems: 'center', gap }, style]}>{children}</View>;
}

// ---------- Controls ----------

type ButtonKind = 'primary' | 'dark' | 'secondary' | 'ghost' | 'teal';

const buttonColors: Record<ButtonKind, { bg: string; fg: string; border?: string; shadow?: string }> = {
  primary: { bg: colors.primary, fg: '#FFFFFF', shadow: colors.primaryPressed },
  dark: { bg: colors.ink, fg: '#FFFFFF' },
  teal: { bg: colors.tealStrong, fg: '#FFFFFF' },
  secondary: { bg: colors.surface, fg: colors.ink, border: colors.border },
  ghost: { bg: 'transparent', fg: colors.primaryPressed },
};

export function Button({
  label,
  onPress,
  kind = 'primary',
  disabled,
  loading,
  style,
  icon,
}: {
  label: string;
  onPress?: () => void;
  kind?: ButtonKind;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  icon?: ReactNode;
}) {
  const c = buttonColors[kind];
  const off = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={off}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!off }}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: off && kind !== 'ghost' ? colors.mutedBg : c.bg,
          borderWidth: c.border ? 1 : 0,
          borderColor: c.border,
          opacity: pressed ? 0.85 : 1,
        },
        c.shadow && !off && !pressed ? { borderBottomWidth: 4, borderBottomColor: c.shadow } : null,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={c.fg} />
      ) : (
        <Row gap={8}>
          {icon}
          <Txt variant="bodyBold" color={off ? colors.textMuted : c.fg} style={{ fontSize: 16 }}>
            {label}
          </Txt>
        </Row>
      )}
    </Pressable>
  );
}

export function Chip({
  label,
  selected,
  onPress,
  style,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      style={[
        styles.chip,
        selected
          ? { backgroundColor: colors.ink, borderColor: colors.ink }
          : { backgroundColor: colors.surface, borderColor: colors.border },
        style,
      ]}>
      <Txt variant="smallBold" color={selected ? '#FFFFFF' : colors.ink} style={{ fontSize: 14 }}>
        {label}
      </Txt>
    </Pressable>
  );
}

/** Segmented control (Daily/Weekly…, age range, leaderboard toggle). */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <View style={styles.segmented}>
      {options.map((o) => {
        const on = o === value;
        return (
          <Pressable
            key={o}
            onPress={() => onChange(o)}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            style={[styles.segment, on && styles.segmentOn]}>
            <Txt variant="smallBold" color={on ? colors.ink : colors.textMuted} numberOfLines={1}>
              {o}
            </Txt>
          </Pressable>
        );
      })}
    </View>
  );
}

export function ProgressBar({
  value,
  height = 8,
  fill = colors.ink,
  track = colors.mutedBg,
}: {
  value: number;
  height?: number;
  fill?: string;
  track?: string;
}) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <View
      style={{ height, borderRadius: height / 2, backgroundColor: track, overflow: 'hidden' }}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(pct) }}>
      <View style={{ width: `${pct}%`, height: '100%', borderRadius: height / 2, backgroundColor: fill }} />
    </View>
  );
}

/** Quest category tag, e.g. GREEN with a leaf (teal). */
export function CategoryTag({ category }: { category: QuestCategory }) {
  const c = questCategories[category];
  return (
    <View style={[styles.tag, { backgroundColor: c.tint, flexDirection: 'row', alignItems: 'center', gap: 4 }]}>
      {c.icon && <Icon name={c.icon} size={12} color={c.color} strokeWidth={2.4} />}
      <Txt variant="caps" color={c.color}>
        {c.label}
      </Txt>
    </View>
  );
}

/** Reward partner shown as a coloured initial (no real brand logos). */
export function PartnerAvatar({ partnerId, size = 48 }: { partnerId: string; size?: number }) {
  const p = getPartner(partnerId);
  return (
    <View
      style={{ width: size, height: size, borderRadius: 14, backgroundColor: p.color, alignItems: 'center', justifyContent: 'center' }}
      accessibilityLabel={p.name}>
      <Txt variant="h2" color={p.textColor} style={{ fontSize: size * 0.42, lineHeight: size * 0.52 }}>
        {p.initial}
      </Txt>
    </View>
  );
}

export function Tag({ label, bg = colors.tealTint, fg = colors.tealStrong }: { label: string; bg?: string; fg?: string }) {
  return (
    <View style={[styles.tag, { backgroundColor: bg }]}>
      <Txt variant="caps" color={fg}>
        {label}
      </Txt>
    </View>
  );
}

export function Avatar({
  name,
  size = 40,
  ring,
  dashed,
}: {
  name: string;
  size?: number;
  ring?: string;
  dashed?: boolean;
}) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: colors.avatar,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: ring ? 3 : 0,
        borderColor: ring,
        borderStyle: dashed ? 'dashed' : 'solid',
      }}>
      <Txt variant="bodyBold" style={{ fontSize: size * 0.38, lineHeight: size * 0.5 }}>
        {name.charAt(0)}
      </Txt>
    </View>
  );
}

export function SpChip({ value, dark }: { value: string; dark?: boolean }) {
  return (
    <View style={[styles.spChip, dark ? { backgroundColor: colors.ink } : { backgroundColor: colors.highlight }]}>
      <View style={styles.coin} />
      <Txt variant="smallBold" color={dark ? '#FFFFFF' : colors.primaryPressed} style={{ fontFamily: fonts.extrabold, fontSize: 14 }}>
        {value}
      </Txt>
    </View>
  );
}

export const styles = StyleSheet.create({
  screenContent: { padding: space.screen, gap: 16, paddingBottom: 32 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: MIN_TOUCH },
  backBtn: { width: MIN_TOUCH, height: MIN_TOUCH, marginLeft: -10, alignItems: 'center', justifyContent: 'center' },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 10,
  },
  button: {
    minHeight: 54,
    borderRadius: radius.button,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  chip: {
    minHeight: MIN_TOUCH,
    paddingHorizontal: 16,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmented: { flexDirection: 'row', backgroundColor: colors.mutedBg, borderRadius: 12, padding: 3, gap: 3 },
  segment: { flex: 1, minHeight: MIN_TOUCH - 4, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  segmentOn: {
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  tag: { alignSelf: 'flex-start', paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8 },
  spChip: { flexDirection: 'row', alignItems: 'center', gap: 5, height: 36, paddingHorizontal: 10, borderRadius: radius.chip },
  coin: { width: 16, height: 16, borderRadius: 8, backgroundColor: colors.coin, borderWidth: 2, borderColor: '#FFFFFF' },
});
