import { Redirect } from 'expo-router';

import { useAppStore } from '@/store/useAppStore';

export default function Index() {
  const onboarded = useAppStore((s) => s.user.onboarded);
  return <Redirect href={onboarded ? '/(tabs)' : '/onboarding'} />;
}
