# Expo Calendar

A local calendar and reminder app built with Expo Router, React Native, AsyncStorage, and Expo Notifications.

## Features

- Year, month, and day calendar views
- Local schedule storage with AsyncStorage
- Local notification reminders
- Weather summary on the day view
- Event details, deletion, and countdown display

## Getting Started

```bash
pnpm install
pnpm start
```

Run on a specific target:

```bash
pnpm android
pnpm ios
pnpm web
```

## Environment

Create a local `.env` file with:

```bash
EXPO_PUBLIC_AMAP_KEY=your_amap_key
EXPO_PUBLIC_WEATHER_KEY=your_qweather_key
EXPO_PUBLIC_WEATHER_API_HOST=devapi.qweather.com
```

## Quality Checks

```bash
pnpm typecheck
```

## Notes

Notifications require device permissions. Local reminders are scheduled with `expo-notifications`, and deleting an event cancels its scheduled reminder when available.
