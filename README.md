# JiranKu

Neighbours meet through small real-world quests. MVP demo app — Expo SDK 57 + Expo Router + TypeScript.

## Run in Expo Go

```bash
npm install
npx expo start            # scan the QR code with Expo Go (phone + computer on the same Wi-Fi)
npx expo start --tunnel   # if the network blocks LAN connections
npx expo start -c         # clear the bundler cache
```

## Build the Android APK (EAS, preview profile)

```bash
npx eas-cli@latest login
npx eas-cli@latest build:configure      # first time only: links the project to your Expo account
npx eas-cli@latest build -p android --profile preview
```

Open the build link on the phone, download the `.apk` and install it (allow "install unknown apps").

## Demo loop

Onboarding → Home → **Litter walk** tile → Join → Check in → Finish & verify → Ready + photo → Complete (+20 SP, streak +1, Green Jiran badge) → Rewards → Redeem.

Profile → **Start over** restores the seed data (1,240 SP, 5-day streak) and shows onboarding again. Use it before each demo run.

Mocked parts (KYC, GPS check-in, auto-ready participants in Verify, rewards/partners, seeded stats) are not labelled in the UI. Find them in code with `grep -rn "MOCK:" src`.

Reward partner and sponsor names live in `src/data/rewardPartners.ts`; quests, raids, events and badges in `src/data/seed.ts`.

## Checks

```bash
npx tsc --noEmit
npx expo lint
```
