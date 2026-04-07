---
title: Recipe - Global Error Handling with Toasts
slug: /recipes/global-error-handling-toasts
---


# Recipe - Global Error Handling with Toasts

## Problem statement

Unhandled API failures can spam users with repeated alerts or no visible feedback at all.

## Solution approach

Centralize transport errors in a shared `fetch` wrapper and emit deduped toasts from one place.

## Copy-paste code example

```tsx
// api.ts
import { toast } from "react-native-toast-system";

type RequestInitWithTimeout = RequestInit & { timeoutMs?: number };

export async function apiFetch(path: string, init: RequestInitWithTimeout = {}) {
  const controller = new AbortController();
  const timeoutMs = init.timeoutMs ?? 10000;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`https://example.com/api${path}`, {
      ...init,
      signal: controller.signal,
    });

    if (!response.ok) {
      const status = response.status;
      const message =
        status === 401
          ? "Session expired. Please sign in again."
          : "Request failed. Check your connection and retry.";

      toast.error({
        title: "Network error",
        description: message,
        dedupeKey: `http:${status}`,
        dedupeMode: "replace",
      });

      throw new Error(`HTTP ${status}`);
    }

    return response;
  } catch (error) {
    const isAbort = error instanceof Error && error.name === "AbortError";
    if (isAbort) {
      toast.error({
        title: "Request timeout",
        description: "The request took too long. Please retry.",
        dedupeKey: "http:timeout",
        dedupeMode: "replace",
      });
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
```

```tsx
// App.tsx
import { ToastProvider, ToastViewport } from "react-native-toast-system";

export default function App() {
  return (
    <ToastProvider>
      {/* Your app screens/navigation tree here */}
      <ToastViewport />
    </ToastProvider>
  );
}
```

## Expected behavior

- HTTP failures trigger a visible toast consistently.
- Repeated failures of the same class replace/update instead of stacking endlessly.
- Calling screens do not each need duplicated error-toast code.

## Common pitfall

- Pitfall: using one overly broad `dedupeKey` for all errors.
- Fix: include a meaningful key segment (status, route, or operation) to avoid hiding distinct failures.
