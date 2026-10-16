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

Onboarding → Home → **Walk 15m** tile → Join → Check in → Finish & verify → Ready + photo → Complete (+20 SP, streak +1, badge) → Rewards → Redeem.

Profile → **Reset demo** restores the seed data (1,240 SP, 5-day streak) and shows onboarding again. Use it before each demo run.

All mocks are labelled in the UI: Mock KYC, Mock GPS check-in, simulated group participants, demo rewards.

## Checks

```bash
npx tsc --noEmit
npx expo lint
```
