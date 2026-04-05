---
title: Onboarding Layer 3 - Add Bottom Sheet Support
slug: /getting-started/layers/bottom-sheet-support
---


# Add Bottom Sheet Support

## When to use this

Use this when actions happen inside a bottom sheet and toasts should render in the same sheet surface.

## Minimal working code

```tsx
import React from "react";
import { Button, View } from "react-native";
import { ToastHost, ToastProvider, ToastViewport, useToast } from "react-native-toast-system";

function MainScreen() {
  return <View />;
}

function SheetContent() {
  const sheetToast = useToast("sheet");

  return (
    <View>
      <Button title="Validate field" onPress={() => sheetToast.warning("Please complete required fields")} />
      <ToastHost hostId="sheet" />
    </View>
  );
}

export function App() {
  return (
    <ToastProvider>
      <MainScreen />
      <ToastViewport />
      <SheetContent />
    </ToastProvider>
  );
}
```

## Common mistake and fix

- Mistake: sending sheet flows to default host, which makes feedback feel disconnected from sheet interactions.
- Fix: mount `ToastHost hostId="sheet"` in sheet content and call `useToast("sheet")`.
