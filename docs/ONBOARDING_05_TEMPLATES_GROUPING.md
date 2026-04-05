---
title: Onboarding Layer 5 - Templates and Grouping
slug: /getting-started/layers/templates-and-grouping
---


# Templates and Grouping

## When to use this

Use this when one user flow should update in place and share a consistent toast template.

## Minimal working code

```tsx
import React from "react";
import { Button, View } from "react-native";
import { ToastProvider, ToastViewport, toast } from "react-native-toast-system";

function SyncButton() {
  const runFlow = () => {
    const groupId = "sync:main";

    toast.show({
      title: "Sync started",
      template: "banner",
      groupId,
      groupBehavior: "update-in-group",
      persistent: true,
    });

    setTimeout(() => {
      toast.show({
        title: "Sync complete",
        template: "banner",
        groupId,
        groupBehavior: "update-in-group",
        variant: "success",
        duration: 1800,
      });
    }, 1200);
  };

  return (
    <View>
      <Button title="Run sync" onPress={runFlow} />
    </View>
  );
}

export function App() {
  return (
    <ToastProvider>
      <SyncButton />
      <ToastViewport />
    </ToastProvider>
  );
}
```

## Common mistake and fix

- Mistake: using different `groupId` values across steps, which creates stacked duplicates.
- Fix: keep a single `groupId` and set `groupBehavior: "update-in-group"` for each step.
