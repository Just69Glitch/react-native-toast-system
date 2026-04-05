---
title: Onboarding Layer 1 - Basic Usage
slug: /getting-started/layers/basic-usage
---


# Basic Usage

## When to use this

Use this when you only need app-level toasts and one host.

## Minimal working code

```tsx
import React from "react";
import { Button, View } from "react-native";
import { ToastProvider, ToastViewport, toast } from "react-native-toast-system";

function Screen() {
  return (
    <View>
      <Button title="Show toast" onPress={() => toast.success("Saved successfully")} />
    </View>
  );
}

export function App() {
  return (
    <ToastProvider>
      <Screen />
      <ToastViewport />
    </ToastProvider>
  );
}
```

## Common mistake and fix

- Mistake: calling `toast.*` before `ToastProvider` is mounted.
- Fix: mount `ToastProvider` at app root and keep one `ToastViewport` mounted.
