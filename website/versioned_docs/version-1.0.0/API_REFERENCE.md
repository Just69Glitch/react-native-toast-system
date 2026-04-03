---
title: API Reference
slug: /api-reference
---

# API Reference

This API reference is split into focused contract pages for faster scanning.

Root-import only:

```ts
import { ToastProvider, ToastViewport, toast, useToast } from "react-native-toast-system";
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
