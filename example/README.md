# Expo Demo App

This app is the interactive demo workspace for `react-native-toast-system`.

## Purpose

Use this app to validate:

- host routing (`default`, `secondary-host`, nested host, classic host)
- interaction behavior (gesture, keyboard, stacking, persistence)
- feature scenarios (variants, templates, APIs, grouping, priority, stress)

## Run

From the repository root:

```bash
pnpm run example:install
pnpm run example:start
pnpm run example:validate
```

Or from `example/` directly:

```bash
pnpm install
pnpm start
```

Optional targets:

```bash
pnpm run example:android
pnpm run example:ios
pnpm run example:web
```

## Notes

- This workspace is for demo and validation only.
- Library consumers should still install and configure the package in their own app.
- If Metro caches stale changes, restart with `--clear`.

## Publishing This Demo

When you need a publicly shareable Expo Go QR for this demo, follow:

- [docs/maintainers/EXPO_DEMO_PUBLISHING.md](../docs/maintainers/EXPO_DEMO_PUBLISHING.md)
