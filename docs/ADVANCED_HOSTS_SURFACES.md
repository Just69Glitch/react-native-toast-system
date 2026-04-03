---
title: Advanced Guides - Hosts and Surfaces
slug: /advanced-guides/hosts-and-surfaces
---

# Advanced Guides: Hosts and Surfaces

Focused recipes for host targeting, nested routing, modal/sheet surfaces, navigation persistence, and keyboard overlap handling.

All examples use package-root imports only.

## 1. Host Targeting

Use when: you need specific toast surfaces (root vs sheet vs modal).

```tsx
import { Button } from "react-native";
import { ToastHost, ToastProvider, ToastViewport, toast } from "react-native-toast-system";

export function App() {
  return (
    <ToastProvider>
      <Button
        title="Toast in sheet host"
        onPress={() => toast.host("sheet").show({ title: "Sheet-scoped toast" })}
      />
      <ToastViewport />
      <ToastHost hostId="sheet" />
    </ToastProvider>
  );
}
```

Expected outcome:

- default toasts render in default viewport
- `toast.host("sheet")` renders only in the `sheet` host

Failure signals:

- targeted toasts do not appear because matching host is not mounted

## 2. Nested Host Routing

Use when: a feature has an internal container with its own toast channel.

```tsx
import { Button } from "react-native";
import { ToastHost, ToastProvider, ToastViewport, toast } from "react-native-toast-system";

export function Root() {
  return (
    <ToastProvider>
      <Feature />
      <ToastViewport hostId="root" />
      <ToastHost hostId="feature" />
      <ToastHost hostId="feature/nested" />
    </ToastProvider>
  );
}

function Feature() {
  return (
    <Button
      title="Nested host toast"
      onPress={() => toast.host("feature/nested").show({ title: "Nested host" })}
    />
  );
}
```

Expected outcome:

- nested host calls render in the nested stack without polluting root stack

Failure signals:

- toasts always appear in root host due to missing explicit host routing

## 3. Modal and Sheet Surface Alignment

Use when: native surface boundaries can hide or detach overlays.

```tsx
import { Button } from "react-native";
import { ToastHost, ToastNativeSurfaceBoundary, toast } from "react-native-toast-system";

export function SheetContent() {
  return (
    <ToastNativeSurfaceBoundary>
      <Button
        title="Sheet toast"
        onPress={() => toast.host("sheet").show({ title: "In-sheet toast" })}
      />
      <ToastHost hostId="sheet" />
    </ToastNativeSurfaceBoundary>
  );
}
```

Expected outcome:

- toast appears in the same modal/sheet visual layer as the interaction source

Failure signals:

- toast appears behind modal/sheet or not visible

## 4. Navigation Persistence

Use when: route transitions should not clear in-flight toasts.

```tsx
import { ToastProvider, ToastViewport, toast } from "react-native-toast-system";

export function NavigationRoot() {
  return (
    <ToastProvider>
      <NavigationContainer />
      <ToastViewport />
    </ToastProvider>
  );
}

function triggerBeforeNavigation() {
  toast.show({
    title: "Persistence probe",
    duration: "persistent",
  });
}
```

Expected outcome:

- toast remains visible while route content changes

Failure signals:

- toast disappears immediately on route transition because host/provider is mounted too low

## 5. Keyboard-Aware Bottom Toasts

Use when: bottom-positioned toasts can overlap active keyboards.

```tsx
import { Button } from "react-native";
import { ToastProvider, ToastViewport, toast } from "react-native-toast-system";

export function App() {
  return (
    <ToastProvider defaultHostConfig={{ keyboardAvoidance: true, keyboardOffset: 8 }}>
      <Button
        title="Show keyboard-aware toast"
        onPress={() =>
          toast.show({
            title: "Keyboard overlap check",
            position: "bottom",
            keyboardAvoidance: true,
          })
        }
      />
      <ToastViewport />
    </ToastProvider>
  );
}
```

Expected outcome:

- bottom toast offsets above keyboard and remains readable/actionable

Failure signals:

- toast sits under keyboard or jitters during keyboard transitions
