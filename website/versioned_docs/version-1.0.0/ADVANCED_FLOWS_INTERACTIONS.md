---
title: Advanced Guides - Flows and Interactions
slug: /advanced-guides/flows-and-interactions
---

# Advanced Guides: Flows and Interactions

Focused recipes for gestures, async lifecycle flows, grouping controls, boundary refs, and typed template facades.

All examples use package-root imports only.

## 6. Gesture-Heavy Interaction Tuning

Use when: swipe/drag behavior must be stable in complex touch environments.

Deck interaction note:

- collapsed stack still expands via deck swipe gesture
- expanded stack now collapses from the dedicated collapse handle (not from in-content pull)
- collapse handle drag uses `deckGesture.collapseHandle` thresholds (inherits `deckGesture` globals by default)

```tsx
import { toast } from "react-native-toast-system";

function showGestureProbe() {
  toast.show({
    title: "Swipe / drag me",
    pauseOnDrag: true,
    dismissible: true,
    gesture: {
      enabled: true,
      dismissThreshold: 42,
      cancelThreshold: 10,
      velocityThreshold: 800,
    },
  });
}
```

```tsx
import { ToastHost } from "react-native-toast-system";

<ToastHost
  hostId="default"
  interactionMode="deck"
  config={{
    deckGesture: {
      collapseHandle: {
        dismissThreshold: 42,
        velocityThreshold: 800,
      },
    },
    collapseHandleStyle: {
      width: 40,
      backgroundColor: "#94A3B8",
      opacity: 0.95,
    },
  }}
/>;
```

Expected outcome:

- drag pauses timer and swipe thresholds behave consistently

Failure signals:

- accidental dismissals or impossible dismiss gestures

## 7. Promise Lifecycle Flow

Use when: async work should map to loading/success/error user feedback.

```tsx
import { toast } from "react-native-toast-system";

async function saveProfile() {
  await toast.promise(api.save(), {
    loading: { title: "Saving" },
    success: (value) => ({ title: "Saved", description: String(value) }),
    error: (error) => ({ title: "Save failed", description: String(error) }),
  });
}
```

Expected outcome:

- loading toast transitions to success/error in the same interaction flow

Failure signals:

- loading toast remains stale due to uncaught promise or missing handler path

## 8. Grouped Flow Patterns

Use when: one logical flow should evolve in place instead of stacking duplicates.

```tsx
import { toast } from "react-native-toast-system";

async function syncFlow() {
  const groupId = "sync:main";

  toast.show({
    title: "Sync started",
    groupId,
    groupBehavior: "update-in-group",
    persistent: true,
  });

  await api.sync();

  toast.show({
    title: "Sync complete",
    groupId,
    groupBehavior: "update-in-group",
    variant: "success",
    duration: 1800,
  });
}
```

Expected outcome:

- flow transitions update the same logical group instead of creating noisy stacks

Failure signals:

- repeated progress toasts accumulate without collapsing/update behavior

## 9. Group-Scoped Control Helpers

Use when: an entire flow channel must be updated or dismissed at once.

```tsx
import { toast } from "react-native-toast-system";

toast.updateGroup("sync:main", { description: "Still syncing..." });
toast.dismissGroup("sync:main", "dismiss");
```

Expected outcome:

- all matching group toasts update/dismiss together

Failure signals:

- stale group members stay visible due to inconsistent group IDs

## 10. Controller Ref for Boundary Surfaces

Use when: hooks are awkward inside isolated modal/sheet composition boundaries.

```tsx
import { useRef } from "react";
import { ToastHost, type ToastController } from "react-native-toast-system";

const controllerRef = useRef<ToastController | null>(null);

<ToastHost hostId="sheet" controllerRef={controllerRef} />;

controllerRef.current?.show({ title: "Boundary-triggered toast" });
```

Expected outcome:

- imperative flows can target boundary-local host safely

Failure signals:

- ref remains null because host is not mounted yet

## 11. Typed Template Facade

Use when: teams need strict template-name safety for design-system toasts.

```tsx
import { Button } from "react-native";
import { createToastSystem } from "react-native-toast-system";

const { ToastProvider, ToastViewport, toast } = createToastSystem({
  templates: {
    appDefault: ({ context }) => <MyTemplate context={context} />,
  },
});

function App() {
  return (
    <ToastProvider>
      <Button title="Typed template toast" onPress={() => toast.show({ template: "appDefault" })} />
      <ToastViewport />
    </ToastProvider>
  );
}
```

Expected outcome:

- only registered template names compile in `toast.show(...)`

Failure signals:

- type errors when using unregistered template names

## Validation Pairing

For integration-heavy recipes, run:

- `pnpm run typecheck`
- `pnpm run test`
- `pnpm run example:validate`
- `pnpm run example:start` and execute the manual checks listed in `example/README.md`
