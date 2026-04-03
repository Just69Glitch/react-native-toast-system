---
title: First Toast
slug: /getting-started/first-toast
---

# First Toast

This is the shortest path to first success.

## Minimal Example

```tsx
import React from "react";
import { Button, View } from "react-native";
import { ToastProvider, ToastViewport, toast, useToast } from "react-native-toast-system";

function Screen() {
  const localToast = useToast();

  return (
    <View>
      <Button
        title="Global toast"
        onPress={() => toast.success({ title: "Saved", description: "Changes persisted." })}
      />
      <Button
        title="Hook toast"
        onPress={() => localToast.show({ title: "Welcome", description: "From useToast()." })}
      />
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

## API Choice Quick Guide

- Use `toast` for service/event-driven or non-component triggers.
- Use `useToast(hostId?)` for component-local and host-bound flows.

Both APIs route through the same provider-owned runtime.

## Expected Outcome

- Root-level toast appears and dismisses correctly.
- Global and hook APIs resolve to the same default host.

## Media Placeholders

- Image placeholder: "First toast success state"
- GIF placeholder: "Global toast and hook toast interactions"
- Video placeholder: "First toast end-to-end demo"

## Next

- [API Reference](./API_REFERENCE.md)
- [Advanced Guides](./ADVANCED_RECIPES.md)
- [Troubleshooting](./TROUBLESHOOTING.md)
