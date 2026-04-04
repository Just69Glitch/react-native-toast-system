# react-native-toast-system

<!-- markdownlint-disable MD033 -->
<table border="0" cellpadding="0" cellspacing="0" width="100%">
  <tr>
    <td valign="top" align="left" width="60%">
      <p>
        <strong>TypeScript-first toasts for real-world React Native apps.</strong>
      </p>
      <ul>
        <li>🎯 Simple APIs: <code>toast</code> + <code>useToast</code></li>
        <li>🧩 Host-aware rendering for screens, modals, and sheets</li>
        <li>⚡ Built for gestures, keyboard-heavy layouts, and navigation transitions</li>
        <li>🛠️ Production features: templates, dedupe, grouping, and priority flows</li>
      </ul>
      <p>
        <a href="https://just69glitch.github.io/react-native-toast-system/">📚 Docs</a>
        ·
        <a href="./docs/GETTING_STARTED.md">🚀 Getting Started</a>
        ·
        <a href="./docs/API_REFERENCE.md">🧠 API</a>
      </p>
    </td>
    <td valign="top" align="center" width="40%">
      <p><strong>📱 Live Expo Demo</strong></p>
      <p>
        <!-- expo-demo:start -->
        <img
          src="https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=exp%3A%2F%2Fu.expo.dev%2F3809a530-4f74-45b2-bb25-7a8a6e8672f4%2Fgroup%2F45d81021-eb82-407e-9973-f3478cd40f85"
          alt="Expo Demo QR"
          width="160"
        />
      </p>
      <p>
        <code>exp://u.expo.dev/3809a530-4f74-45b2-bb25-7a8a6e8672f4/group/45d81021-eb82-407e-9973-f3478cd40f85</code>
        <!-- expo-demo:end -->
      </p>
    </td>
  </tr>
</table>
<!-- markdownlint-enable MD033 -->

> **Platform support (current):** iOS and Android only. Web is not officially supported yet and may be added in future releases.

## ✨ Why This Library

- Host-aware architecture for real app surfaces, not just a single root stack
- Typed API with global (`toast`) and hook (`useToast`) controllers
- Built-in templates + custom template support
- Deck/classic interaction modes with configurable behavior
- Integration-focused docs and Expo playground for manual validation

## 🔗 Quick Links

- Docs site: <https://just69glitch.github.io/react-native-toast-system/>
- Getting Started: [docs/GETTING_STARTED.md](./docs/GETTING_STARTED.md)
- API Reference: [docs/API_REFERENCE.md](./docs/API_REFERENCE.md)
- Architecture: [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)
- Troubleshooting: [docs/TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md)
- Expo example notes: [example/README.md](./example/README.md)

## 🧭 Ops Playbooks

- Docs deployment (GitHub Pages): [docs/maintainers/DEPLOY_GITHUB_PAGES.md](./docs/maintainers/DEPLOY_GITHUB_PAGES.md)
- Expo demo publishing + QR workflow: [docs/maintainers/EXPO_DEMO_PUBLISHING.md](./docs/maintainers/EXPO_DEMO_PUBLISHING.md)

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
