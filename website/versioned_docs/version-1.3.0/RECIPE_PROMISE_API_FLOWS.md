---
title: Recipe - Promise-Based API Toast Flows
slug: /recipes/promise-based-api-toast-flows
---


# Recipe - Promise-Based API Toast Flows

## Problem statement

You need one toast flow for async requests: loading first, then success or error, without stacking noisy duplicates.

## Solution approach

Wrap the API promise in `toast.promise(...)` and use a stable group for repeated taps in the same flow.

## Copy-paste code example

```tsx
import { Button } from "react-native";
import { toast } from "react-native-toast-system";

async function saveOrder() {
  return fetch("https://example.com/api/orders", { method: "POST" }).then((res) => {
    if (!res.ok) throw new Error("Request failed");
    return res.json();
  });
}

async function onSubmitOrder() {
  await toast.promise(
    saveOrder(),
    {
      loading: { title: "Saving order..." },
      success: () => ({ title: "Order saved", variant: "success", duration: 1600 }),
      error: (error) => ({ title: "Save failed", description: String(error) }),
    },
    {
      groupId: "order:save",
      groupBehavior: "update-in-group",
    },
  );
}

export function SaveOrderButton() {
  return <Button title="Submit order" onPress={onSubmitOrder} />;
}
```

## Expected behavior

- A loading toast appears immediately.
- The same flow updates to success or error.
- Repeated taps update the same logical flow group instead of stacking duplicates.

## Common pitfall

- Pitfall: swallowing errors before `toast.promise(...)` sees them.
- Fix: throw/reject in failed paths so the error toast branch can render.
