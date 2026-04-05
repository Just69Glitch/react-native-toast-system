---
title: Onboarding Layer 4 - Advanced Routing
slug: /getting-started/layers/advanced-routing
---


# Advanced Routing

## When to use this

Use this when multiple feature areas need independent toast channels.

## Minimal working code

```tsx
import React from "react";
import { Button, View } from "react-native";
import { ToastHost, ToastProvider, ToastViewport, toast } from "react-native-toast-system";

function FeatureActions() {
  return (
    <View>
      <Button
        title="Feature toast"
        onPress={() => toast.host("feature/nested").show({ title: "Feature scoped toast" })}
      />
    </View>
  );
}

export function App() {
  return (
    <ToastProvider>
      <FeatureActions />
      <ToastViewport hostId="root" />
      <ToastHost hostId="feature" />
      <ToastHost hostId="feature/nested" />
    </ToastProvider>
  );
}
```

## Common mistake and fix

- Mistake: routing with `toast.host("feature/nested")` but not mounting a matching host.
- Fix: mount `ToastHost` with the exact same `hostId` string as the route target.
