# react-native-toast-system

Host-aware toasts for React Native apps with screens, modals, and bottom sheets.

- Route toasts to the right UI surface with global and host-scoped APIs.
- Ship faster with Expo-ready setup that stays stable through gestures, keyboard shifts, and nested navigation.
- Handle real app feedback flows with built-in dedupe/grouping and promise-based toasts.

> Platform support (current): iOS and Android only. Web is not officially supported yet.

## When should I use this?

### Use this if

- You need to trigger toasts from both app-wide actions and local surfaces.
- Your app uses modals, bottom sheets, or nested navigation stacks.
- You want a typed toast API without building host routing yourself.

### Do not use this if

- You only need a single root-level banner with no surface-specific behavior.
- Your app is web-only today.
- You want a full notification center instead of lightweight toast feedback.

## 10-second quick example

```tsx
import { toast, useToast } from "react-native-toast-system";

// Global usage
toast.success("Saved successfully");

// Host usage (for example inside a modal)
const modalToast = useToast("modal");
modalToast.error("Something went wrong");
```

## Why this exists

Most toast libraries assume one root host. Real apps do not.

- Modals often need their own surface so feedback is visible where the user is acting.
- Bottom sheets can clip, overlap, or hide global toasts.
- Nested navigation can make root-only toast placement feel disconnected from the active UI.

## 45-second demo flow

One scenario, six behaviors: root toast, modal toast, bottom-sheet toast, dedupe, promise lifecycle, and keyboard-safe bottom placement.

Caption: Root success, modal error, sheet warning, deduped retries, promise loading-to-success, and keyboard-aware bottom toast in one continuous flow.

- Full script + recording plan: [docs/DEMO_HOST_AWARE_FLOW.md](./docs/DEMO_HOST_AWARE_FLOW.md)

## Live Expo Demo

Scan the QR to open the in-repo example update.

<!-- expo-demo:start -->
<img src="https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=exp%3A%2F%2Fu.expo.dev%2F3809a530-4f74-45b2-bb25-7a8a6e8672f4%2Fgroup%2F45d81021-eb82-407e-9973-f3478cd40f85" alt="Expo Demo QR" width="220" />

`exp://u.expo.dev/3809a530-4f74-45b2-bb25-7a8a6e8672f4/group/45d81021-eb82-407e-9973-f3478cd40f85`
<!-- expo-demo:end -->

## Quick Links

- Docs site: <https://just69glitch.github.io/react-native-toast-system/>
- Demo script: [docs/DEMO_HOST_AWARE_FLOW.md](./docs/DEMO_HOST_AWARE_FLOW.md)
- Decision guide: [docs/COMPARISON_POSITIONING.md](./docs/COMPARISON_POSITIONING.md)
- Getting Started: [docs/GETTING_STARTED.md](./docs/GETTING_STARTED.md)
- API Reference: [docs/API_REFERENCE.md](./docs/API_REFERENCE.md)
- Architecture: [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)
- Troubleshooting: [docs/TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md)
- Expo example notes: [example/README.md](./example/README.md)
  
## 📦 Installation

```bash
pnpm add react-native-toast-system
```

Peer dependencies (install if your app does not already have them):

```bash
pnpm add react-native-gesture-handler react-native-reanimated react-native-safe-area-context react-native-svg react-native-worklets
pnpm add react-native-screens
```

`react-native-screens` is optional and mainly needed for RN Screens overlay scenarios.

## ✅ Runtime Setup Checklist

1. Enable Reanimated Babel plugin.
2. Wrap app root with `GestureHandlerRootView`.
3. Wrap app root with `SafeAreaProvider`.
4. Mount `ToastProvider` above all toast callers.
5. Mount at least one host (`ToastViewport` or `ToastHost`).
6. For native surfaces (for example React Native `Modal`), wrap with `ToastNativeSurfaceBoundary` when gesture activation needs a dedicated root.

## ⚡ Quick Start

Quick start examples target native apps (iOS/Android).

```tsx
import React from "react";
import { Button, View } from "react-native";
import { ToastProvider, ToastViewport, toast, useToast } from "react-native-toast-system";

function DemoScreen() {
  const localToast = useToast();

  return (
    <View>
      <Button
        title="Global toast"
        onPress={() => toast.success({ title: "Saved", description: "Changes persisted." })}
      />
      <Button
        title="Hook toast"
        onPress={() => localToast.show({ title: "Welcome", description: "Hello from useToast()." })}
      />
    </View>
  );
}

export function App() {
  return (
    <ToastProvider>
      <DemoScreen />
      <ToastViewport />
    </ToastProvider>
  );
}
```

## 🧩 API Surface At A Glance

- `ToastProvider`: owns store/runtime and binds global API
- `ToastViewport` / `ToastHost`: renders host stacks
- `toast`: global controller facade
- `useToast(hostId?)`: host-scoped controller hook
- `createToastSystem(...)`: typed system helper for templates

## Import Paths

Root import remains fully supported:

```ts
import { ToastProvider, ToastViewport, toast, useToast } from "react-native-toast-system";
```

Optional subpath imports are also available:

```ts
import { ToastProvider } from "react-native-toast-system/providers";
import { ToastHost, ToastViewport } from "react-native-toast-system/components";
import { useToast } from "react-native-toast-system/hooks";
import { toast } from "react-native-toast-system/utils";
```

## 🧪 Expo Playground (In-Repo)

From repository root:

```bash
pnpm run example:install
pnpm run example:start
pnpm run example:validate
```

Optional targets:

```bash
pnpm run example:android
pnpm run example:ios
pnpm run example:web
```

## 🛠️ Development Commands

```bash
pnpm install
pnpm run lint
pnpm run test
pnpm run build
pnpm run pack:dry-run
```

Docs commands:

```bash
pnpm run docs:install
pnpm run docs:start
pnpm run docs:build
pnpm run docs:serve
pnpm run docs:version -- --help
```

Release readiness checks:

```bash
pnpm run validate:release
```

## 🧱 Compatibility

- Node: `>=18`
- React Native: see `peerDependencies` in [package.json](./package.json)
- Expo: validated via the in-repo `example/` app

## 🔍 Validation Philosophy

This project separates automated and manual confidence:

- Automated: lint, typecheck, tests, build, pack dry-run, example validation, docs validation
- Manual: modal/sheet parity, gesture interactions, keyboard overlap, navigation persistence, and full RTL behavior validation after app restart

## 🏛️ Governance

- Contributing: [CONTRIBUTING.md](./.github/CONTRIBUTING.md)
- Code of Conduct: [CODE_OF_CONDUCT.md](./.github/CODE_OF_CONDUCT.md)
- Security Policy: [SECURITY.md](./.github/SECURITY.md)
- Support Policy: [SUPPORT.md](./.github/SUPPORT.md)
- Versioning Policy: [VERSIONING.md](./docs/maintainers/VERSIONING.md)
- Release Process: [RELEASING.md](./docs/maintainers/RELEASING.md)
- Changelog: [CHANGELOG.md](./CHANGELOG.md)

## 📄 License

MIT
