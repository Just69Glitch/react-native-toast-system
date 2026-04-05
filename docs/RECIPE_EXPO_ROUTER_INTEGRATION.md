---
title: Recipe - Expo Router Toast Integration
slug: /recipes/expo-router-toast-integration
---


# Recipe - Expo Router Toast Integration

## Problem statement

You are using Expo Router and want toasts to persist across route transitions, including modal routes.

## Solution approach

Mount `ToastProvider` + root `ToastViewport` in `app/_layout.tsx`, then add a modal-scoped host in modal screens when local layering matters.

## Copy-paste code example

```tsx
// app/_layout.tsx
import { Stack } from "expo-router";
import { ToastProvider, ToastViewport } from "react-native-toast-system";

export default function RootLayout() {
  return (
    <ToastProvider>
      <Stack>
        <Stack.Screen name="index" />
        <Stack.Screen name="payment-modal" options={{ presentation: "modal" }} />
      </Stack>
      <ToastViewport />
    </ToastProvider>
  );
}
```

```tsx
// app/payment-modal.tsx
import { Button, View } from "react-native";
import { ToastHost, ToastNativeSurfaceBoundary, useToast } from "react-native-toast-system";

export default function PaymentModalScreen() {
  const modalToast = useToast("modal");

  return (
    <ToastNativeSurfaceBoundary>
      <View>
        <Button title="Submit payment" onPress={() => modalToast.error("Payment failed")} />
      </View>
      <ToastHost hostId="modal" />
    </ToastNativeSurfaceBoundary>
  );
}
```

## Expected behavior

- Root routes use the app-level `ToastViewport`.
- Modal actions render in `hostId="modal"` when targeted with `useToast("modal")`.
- Navigation changes do not unmount the global toast runtime.

## Common pitfall

- Pitfall: mounting `ToastProvider` inside a route component.
- Fix: keep provider in `app/_layout.tsx` so toasts survive route switches.
