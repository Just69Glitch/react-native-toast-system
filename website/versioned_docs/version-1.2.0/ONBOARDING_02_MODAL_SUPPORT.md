---
title: Onboarding Layer 2 - Add Modal Support
slug: /getting-started/layers/modal-support
---


# Add Modal Support

## When to use this

Use this when users trigger actions inside a React Native `Modal` and feedback must stay in that modal layer.

## Minimal working code

```tsx
import React from "react";
import { Button, Modal, View } from "react-native";
import {
  ToastHost,
  ToastNativeSurfaceBoundary,
  ToastProvider,
  ToastViewport,
  useToast,
} from "react-native-toast-system";

function MainScreen() {
  return <View />;
}

function ModalContent() {
  const modalToast = useToast("modal");

  return (
    <ToastNativeSurfaceBoundary>
      <View>
        <Button title="Fail action" onPress={() => modalToast.error("Something went wrong")} />
      </View>
      <ToastHost hostId="modal" />
    </ToastNativeSurfaceBoundary>
  );
}

export function App() {
  return (
    <ToastProvider>
      <MainScreen />
      <ToastViewport />
      <Modal visible>
        <ModalContent />
      </Modal>
    </ToastProvider>
  );
}
```

## Common mistake and fix

- Mistake: using only root `ToastViewport`, so modal-triggered feedback appears behind or outside modal context.
- Fix: mount `ToastHost hostId="modal"` inside modal content and target it with `useToast("modal")`.
