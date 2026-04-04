---
title: API Reference
slug: /api-reference
---


# API Reference

> **Platform support (current):** iOS and Android only. Web is not officially supported yet and may be added in future releases.

This API reference is split into focused contract pages for faster scanning.

Root import (recommended default):

```ts
import { ToastProvider, ToastViewport, toast, useToast } from "react-native-toast-system";
```

Optional subpath imports:

```ts
import { ToastProvider } from "react-native-toast-system/providers";
import { ToastHost, ToastViewport } from "react-native-toast-system/components";
import { useToast } from "react-native-toast-system/hooks";
import { toast } from "react-native-toast-system/utils";
```

## Contract Conventions

- `Required`: whether the caller must supply the field.
- `Default`: runtime default when omitted.
- `none`: no implicit value is injected at the API boundary.
- `implementation-defined`: behavior exists but is resolved by runtime logic and context.

## API Sections

- [API Components](./API_COMPONENTS.md)
- [API Controllers](./API_CONTROLLERS.md)
- [API Options](./API_OPTIONS.md)
- [API Lifecycle and Enums](./API_LIFECYCLE.md)

Use `src/index.ts` as source-of-truth export index for contract verification.
