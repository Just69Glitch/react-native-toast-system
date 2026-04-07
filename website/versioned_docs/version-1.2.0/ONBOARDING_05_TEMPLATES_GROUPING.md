---
title: Onboarding Layer 5 - Templates and Grouping
slug: /getting-started/layers/templates-and-grouping
---


# Templates and Grouping

## When to use this

Use this when you need:

- reusable custom toast visuals (beyond built-in `compact`/`banner`)
- one-time template registration (not per host)
- grouped flows that update in place (for example loading -> success)

## Mental model

1. Create template renderers.
2. Register templates once at provider/system level.
3. Set host default template with `defaultTemplate`.
4. Override `template` per toast only when needed.

`ToastHost` does not accept a `templates` prop. Templates are resolved from `ToastProvider` (or `createToastSystem`).

## Step 1 - Create typed templates

```tsx
import React from "react";
import { Text, View } from "react-native";
import {
  createToastTemplates,
  type ToastTemplateProps,
} from "react-native-toast-system";

function BlurredToastTemplate({ toast }: ToastTemplateProps) {
  return (
    <View style={{ borderRadius: 14, padding: 12, backgroundColor: "rgba(20,20,20,0.75)" }}>
      <Text style={{ color: "#fff", fontWeight: "700" }}>{toast.title}</Text>
      {toast.description ? <Text style={{ color: "#d4d4d8" }}>{toast.description}</Text> : null}
    </View>
  );
}

export const APP_TOAST_TEMPLATES = createToastTemplates({
  blurred: BlurredToastTemplate,
});
```

## Step 2 - Register templates once

Use `createToastSystem`:

```tsx
import { createToastSystem } from "react-native-toast-system";
import { APP_TOAST_TEMPLATES } from "./toast-templates";

export const {
  ToastProvider,
  ToastViewport,
  ToastHost,
  toast,
  useToast,
} = createToastSystem({
  templates: APP_TOAST_TEMPLATES,
});
```

## Step 3 - Set host default template

```tsx
<ToastProvider
  defaultHostConfig={{
    defaultTemplate: "blurred",
  }}
>
  <App />
  <ToastViewport />
  <ToastHost hostId="modal" config={{ defaultTemplate: "banner" }} />
</ToastProvider>
```

## Step 4 - Override template per toast

```tsx
toast.show({
  title: "Payment failed",
  description: "Please retry.",
  template: "banner", // override host default only for this toast
  variant: "error",
});
```

## Minimal working code

```tsx
import React from "react";
import { Button, Text, View } from "react-native";
import { createToastSystem, createToastTemplates } from "react-native-toast-system";

const templates = createToastTemplates({
  blurred: ({ toast }) => (
    <View style={{ borderRadius: 12, padding: 12, backgroundColor: "rgba(18,18,23,0.82)" }}>
      <Text style={{ color: "#fff", fontWeight: "700" }}>
        {toast.title ?? "Notification"}
      </Text>
      {toast.description ? <Text style={{ color: "#d4d4d8" }}>{toast.description}</Text> : null}
    </View>
  ),
});

const { ToastProvider, ToastViewport, toast } = createToastSystem({
  templates,
});

function SyncButton() {
  const runFlow = () => {
    const groupId = "sync:main";

    toast.show({
      title: "Sync started",
      template: "blurred",
      groupId,
      groupBehavior: "update-in-group",
      persistent: true,
    });

    setTimeout(() => {
      toast.show({
        title: "Sync complete",
        template: "blurred",
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
    <ToastProvider
      defaultHostConfig={{
        defaultTemplate: "blurred",
      }}
    >
      <SyncButton />
      <ToastViewport />
    </ToastProvider>
  );
}
```

## Common mistake and fix

- Mistake: importing templates but not registering them through `createToastSystem`.
- Fix: register once via `createToastSystem({ templates })`.
- Mistake: trying to pass `templates` to `ToastHost`.
- Fix: keep host-level control to `config.defaultTemplate`; template registry belongs to provider/system.
- Mistake: using different `groupId` values across lifecycle steps, causing stacked duplicates.
- Fix: keep a single `groupId` and use `groupBehavior: "update-in-group"` for each step.

## Type-safety tips

- For strict template-name checks, preserve literal keys (`createToastTemplates` helps).
- If you widen to `Record<string, ...>`, TypeScript treats template names as generic `string`.
