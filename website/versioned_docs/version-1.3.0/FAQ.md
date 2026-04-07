---
title: FAQ
slug: /faq
---


# FAQ

> **Platform support (current):** iOS and Android only. Web is not officially supported yet and may be added in future releases.

## Which React Native versions are supported?

The package is intended for modern React Native stacks. Check peer dependency ranges in `package.json` and align your app versions accordingly.

## Which peer dependencies are required?

Core peer dependencies are required by runtime behavior and visuals:

- `react`
- `react-native`
- `react-native-gesture-handler`
- `react-native-reanimated`
- `react-native-safe-area-context`
- `react-native-svg`
- `react-native-worklets`

`react-native-screens` is optional and mainly needed when using RN Screens overlay paths.

## Is Expo supported?

Yes. The repository includes a standalone Expo demo workspace under `example/` for integration validation, and Expo-based consumer apps are supported when peer dependencies and native configuration requirements are met.

## How do I run the in-repo demo?

From repository root:

```bash
pnpm run example:install
pnpm run example:start
pnpm run example:validate
```

Optional launch targets:

```bash
pnpm run example:android
pnpm run example:ios
pnpm run example:web
```

Common caveats:

- if startup asks for a new port, free the current port or rerun with another one
- CI/offline environments can require offline mode handling
- full RTL verification still requires app restart after RTL enablement

## Should I use `toast` or `useToast()`?

Use `toast` when triggering notifications from non-component logic (services, event hubs, centralized actions). Use `useToast(hostId?)` when the trigger is component-scoped or tied to a feature surface.

Both route through the same provider-owned runtime.

## What happens if `toast` is called before provider mount?

Global calls remain safe no-ops until a provider is mounted.

- show-like methods return fallback IDs
- mutating methods return fallback values (`false`, `0`, `void`)

This avoids crashes during startup/unmount windows but produces no visible toast output without an active provider/host.

## Can I deep-import internal files?

No. Use package root imports only:

```ts
import { toast, ToastProvider, ToastViewport, useToast } from "react-native-toast-system";
```

Internal paths are not a supported API contract.

## How do I target modal or sheet-specific toasts?

Mount dedicated hosts (`ToastHost hostId="modal-host"`, `ToastHost hostId="sheet-host"`) and route calls with `toast.host("modal-host")` / `useToast("sheet-host")`.

For native surfaces, add `ToastNativeSurfaceBoundary` where gesture/root boundary behavior needs stabilization.

## How do grouping, dedupe, and priority differ?

- dedupe: controls identity collisions (`id`, `dedupeKey`, `dedupeMode`)
- grouping: controls flow evolution (`groupId`, `groupBehavior`)
- priority: controls ordering significance (`priority`, host `priorityMode`)

These systems are complementary and can be combined.

## How do I style and theme toasts?

Use host config (`theme`, class/style fields, presets) and toast-level options (`className`, `style`, title/description style props, templates). Register custom templates through `createToastSystem({ templates })`, then select with `defaultTemplate` or toast-level `template`. Base `ToastProvider`/`ToastHost` contracts stay built-in-template only.

## How does RTL support work?

By default, toasts follow native/device direction (`direction: "auto"`). You can override per host with `ToastHostConfig.direction` (`"ltr"` or `"rtl"`), or per toast with `ToastOptions.direction` when only specific notifications should render differently. Manual verification guidance is documented in `example/README.md`.

## What is a good adoption order for this package?

Recommended adoption order:

1. Mount `ToastProvider` + one root `ToastViewport`.
2. Replace simple success/error/info calls with `toast` or `useToast()`.
3. Add host-targeted flows (modal/sheet/nested surfaces).
4. Add promise lifecycle and template customization.
5. Run automated checks plus manual protocols before rollout.

## What is currently automated vs manual in validation?

Automated:

- `pnpm run typecheck`
- `pnpm run build`
- `pnpm run test`
- `pnpm run example:validate`

Manual protocol-driven:

- modal/sheet rendering parity
- keyboard overlap behavior
- navigation persistence checks
- RTL restart validation
- high-interaction gesture checks
