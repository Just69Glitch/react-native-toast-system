---
title: Quick Start (Fastest Setup)
slug: /quick-start-fast
---


# Quick Start (Fastest Setup)

## 1. Install

```bash
pnpm add react-native-toast-system
pnpm add react-native-gesture-handler react-native-reanimated react-native-safe-area-context react-native-svg react-native-worklets
```

Optional (only needed for some RN Screens overlay scenarios):

```bash
pnpm add react-native-screens
```

## 2. Provider

```tsx
import { ToastProvider } from "react-native-toast-system";
import { AppScreen } from "./AppScreen";

export function App() {
  return (
    <ToastProvider>
      <AppScreen />
    </ToastProvider>
  );
}
```

## 3. Single Host

```tsx
import { ToastProvider, ToastViewport } from "react-native-toast-system";
import { AppScreen } from "./AppScreen";

export function App() {
  return (
    <ToastProvider>
      <AppScreen />
      <ToastViewport />
    </ToastProvider>
  );
}
```

## 4. One Toast Call

```tsx
import React from "react";
import { Button, View } from "react-native";
import { toast } from "react-native-toast-system";

export function AppScreen() {
  return (
    <View>
      <Button title="Save" onPress={() => toast.success("Saved successfully")} />
    </View>
  );
}
```
