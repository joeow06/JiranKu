// Design tokens from docs/wireframe WIREFRAMES.md

export const colors = {
  ink: '#453C67',
  inkSoft: '#564C80',
  inkMutedOnDark: '#CBC6EA',
  primary: '#6D67E4',
  primaryPressed: '#4A44B8',
  teal: '#46C2CB',
  tealStrong: '#1E7C83',
  tealTint: '#DDF3F5',
  highlight: '#F2F7A1',
  coin: '#D6DC4E',
  bg: '#F5F4FC',
  surface: '#FFFFFF',
  border: '#DCD9EE',
  mutedBg: '#E9E7F5',
  textMuted: '#6B6589',
  avatar: '#CFCBE8',
  danger: '#C2414B',
  heat: ['#40AAFF', '#7CE578', '#FFC531', '#FF6A2B', '#FF2D55'],
} as const;

export const radius = {
  card: 20,
  cardLg: 22,
  button: 16,
  chip: 18,
  pill: 999,
} as const;

export const space = {
  screen: 20,
  gap: 12,
} as const;

export const MIN_TOUCH = 44;

// Google font face names as registered by useFonts() in the root layout.
export const fonts = {
  heading: 'BricolageGrotesque_800ExtraBold',
  headingSemi: 'BricolageGrotesque_600SemiBold',
  regular: 'Figtree_400Regular',
  medium: 'Figtree_500Medium',
  semibold: 'Figtree_600SemiBold',
  bold: 'Figtree_700Bold',
  extrabold: 'Figtree_800ExtraBold',
} as const;
