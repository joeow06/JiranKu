import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { colors } from '@/theme/tokens';

// Stroke icons traced from the wireframe SVGs (24×24 viewBox).
const ICONS = {
  home: <Path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" />,
  quests: <Path d="M5 21V4h12l-2 4 2 4H5" />,
  map: <Path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2zM9 4v14M15 6v14" />,
  rewards: (
    <>
      <Rect x="3" y="8" width="18" height="4" />
      <Path d="M5 12v9h14v-9M12 8v13M12 8c-2-4-6-4-5-1 1 1 5 1 5 1zm0 0c2-4 6-4 5-1-1 1-5 1-5 1z" />
    </>
  ),
  profile: (
    <>
      <Circle cx="12" cy="8" r="4" />
      <Path d="M4 21c1-4 4-6 8-6s7 2 8 6" />
    </>
  ),
  check: <Path d="M5 12l5 5 9-10" />,
  walk: (
    <>
      <Circle cx="13" cy="4" r="2" />
      <Path d="M9 21l2.5-6 2.5 2.5V21M7 12l3-4 4 1 2.5 3 2.5 1M10 8l-1 6" />
    </>
  ),
  teh: <Path d="M5 8h11v6a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5zM16 10h2a2 2 0 0 1 0 4h-2M8 3v2M11 3v2M14 3v2" />,
  highfive: <Path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V12M11 11V4a1.5 1.5 0 0 1 3 0v8M14 11.5V6a1.5 1.5 0 0 1 3 0v8a7 7 0 0 1-7 7h-.5A6.5 6.5 0 0 1 5 18l-2-4a1.5 1.5 0 0 1 2.6-1.5L8 15" />,
  badminton: <Path d="M14 3l7 7-4 1-4-4zM13 7l-8 8M3 21l2-6 4 4z" />,
  food: <Path d="M4 3v8a3 3 0 0 0 6 0V3M7 3v18M17 3c-2 2-3 5-3 8h3v10" />,
  run: (
    <>
      <Circle cx="14" cy="4" r="2" />
      <Path d="M6 20l3-5 3 2 1-5 3 3h3M9 9l3-2 3 1" />
    </>
  ),
  clock: (
    <>
      <Circle cx="12" cy="13" r="8" />
      <Path d="M12 9v4l2 2M9 2h6" />
    </>
  ),
  chest: (
    <>
      <Rect x="3" y="9" width="18" height="11" rx="2" />
      <Path d="M3 13h18M5 9a7 4 0 0 1 14 0" />
    </>
  ),
  pin: (
    <>
      <Path d="M12 21s-7-6.5-7-12a7 7 0 0 1 14 0c0 5.5-7 12-7 12z" />
      <Circle cx="12" cy="9" r="2.5" />
    </>
  ),
  back: <Path d="M15 5l-7 7 7 7" />,
  users: (
    <>
      <Circle cx="9" cy="8" r="3.5" />
      <Path d="M2.5 20c.8-3.5 3.3-5.5 6.5-5.5s5.7 2 6.5 5.5M16 4.5a3.5 3.5 0 0 1 0 7M18 14.5c1.9.6 3.1 2.4 3.5 5.5" />
    </>
  ),
  shield: <Path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6zM8.5 12l2.5 2.5 4.5-5" />,
  camera: (
    <>
      <Path d="M4 8h3l2-3h6l2 3h3v12H4z" />
      <Circle cx="12" cy="13.5" r="3.5" />
    </>
  ),
  trophy: <Path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H4a3 3 0 0 0 4 4M16 6h4a3 3 0 0 1-4 4M12 13v4M8 21h8M9 21v-4h6v4" />,
  lock: (
    <>
      <Rect x="5" y="11" width="14" height="10" rx="2" />
      <Path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </>
  ),
  chevron: <Path d="M9 5l7 7-7 7" />,
  leaf: <Path d="M5 19c0-8 5-14 15-15-.5 10-6.5 15-14 15M5 19c3-4 6-7 10-9" />,
  droplet: <Path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z" />,
  sprout: <Path d="M12 21v-9M12 12c0-4-3-6-7-6 0 4 3 6 7 6zM12 10c0-3.5 2.5-6 7-6 0 3.5-2.5 6-7 6M7 21h10" />,
  recycle: <Path d="M8 8l2.5-4.3a1.7 1.7 0 0 1 3 0L16 8M14 7h2.5V4.5M19.5 12l2 3.6a1.7 1.7 0 0 1-1.5 2.6H15M16.5 20.5L15 18.2l2.3-1.5M8 18.2H4a1.7 1.7 0 0 1-1.5-2.6L4.5 12M2.6 13.4L4.5 12l1.4 2.1" />,
} as const;

export type IconName = keyof typeof ICONS;

export function Icon({
  name,
  size = 22,
  color = colors.ink,
  strokeWidth = 1.8,
}: {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round">
      {ICONS[name]}
    </Svg>
  );
}

export function FlameIcon({ size = 16, color }: { size?: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d="M12 2c1.2 4.5 6 5.5 6 11a6 6 0 0 1-12 0c0-3.5 2.2-4.8 2.4-7 2.2 1.2 3.4 2.4 3.6-4z" />
    </Svg>
  );
}
