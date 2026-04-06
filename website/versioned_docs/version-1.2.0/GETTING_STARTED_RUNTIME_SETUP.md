---
title: Runtime Setup
slug: /getting-started/runtime-setup
---


# Runtime Setup

> **Platform support (current):** iOS and Android only. Web is not officially supported yet and may be added in future releases.

Before validating toast behavior, confirm app runtime prerequisites.

## Required Prerequisites

1. Reanimated Babel plugin is configured.
2. App root uses `GestureHandlerRootView`.
3. App root uses `SafeAreaProvider`.
4. `ToastProvider` wraps any subtree calling `useToast()`.
5. At least one root host (`ToastViewport` or `ToastHost`) is mounted.

For native surfaces (for example `Modal`), wrap that surface with `ToastNativeSurfaceBoundary` when gesture activation needs an isolated boundary root.

## Recommended App Root Structure

```tsx
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ToastProvider, ToastViewport } from "react-native-toast-system";

export function AppRoot() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ToastProvider>
          <AppNavigation />
          <ToastViewport />
        </ToastProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
```

## Placement Rules

- Keep one app-level root host for global flows.
- Add extra hosts only for explicit isolated surfaces (`modal-host`, `sheet-host`).
- Mount each host inside the visual surface where it should render.

## Visual Check

Host-aware routing across layered surfaces should behave like this:

<img src={require("./assets/modal-host.gif").default} alt="Modal host toast preview" width="160" />
<img src={require("./assets/sheet-host.gif").default} alt="Sheet host toast preview" width="160" />

## Next

- [First Toast](./GETTING_STARTED_FIRST_TOAST.md)
- [Architecture Guide](./ARCHITECTURE.md)
