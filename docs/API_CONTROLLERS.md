---
title: API Controllers
slug: /api-reference/controllers
---

# API Controllers

Contract details for hooks and controller-style function exports. Import from package root only:

```ts
import { useToast, toast, createToastSystem, createToastTemplates } from "react-native-toast-system";
```

## Hooks and Functions

### `useToast(hostId?)`

Signature:

```ts
function useToast(hostId?: string): ToastController;
```

| Parameter | Type | Required | Default | Description | Allowed options/values |
| --- | --- | --- | --- | --- | --- |
| `hostId` | `string` | no | provider `defaultHostId` | Returns controller bound to selected host. | any host id string |

| Return value | Type | Description |
| --- | --- | --- |
| `controller` | `ToastController` | Host-scoped controller implementing show/update/dismiss/group methods. |

### `toast` Global Controller

Signature:

```ts
const toast: Omit<ToastController, "hostId"> & {
  host: (hostId: string) => ToastController;
};
```

#### Global Method Contract

| Method | Parameters | Required params | Return | Default values | Allowed options/values |
| --- | --- | --- | --- | --- | --- |
| `show` | `(options)` | `options` | `ToastId` | none | `string` or `ToastOptions` |
| `success` | `(options)` | `options` | `ToastId` | none | `string` or `ToastOptions` |
| `error` | `(options)` | `options` | `ToastId` | none | `string` or `ToastOptions` |
| `warning` | `(options)` | `options` | `ToastId` | none | `string` or `ToastOptions` |
| `info` | `(options)` | `options` | `ToastId` | none | `string` or `ToastOptions` |
| `loading` | `(options)` | `options` | `ToastId` | forces persistent loading defaults | `string` or `ToastOptions` |
| `promise` | `(promise, options, commonOptions?)` | `promise`, `options` | `Promise<T>` | `commonOptions` none | `ToastPromiseOptions<T>` + optional partial `ToastOptions` |
| `update` | `(id, options)` | `id`, `options` | `boolean` | none | `ToastId`, `ToastUpdateOptions` |
| `dismiss` | `(id, reason?)` | `id` | `boolean` | `reason="dismiss"` | `ToastId`, `CloseReason` |
| `dismissAll` | `(reason?)` | none | `void` | `reason="dismiss"` | `CloseReason` |
| `dismissGroup` | `(groupId, reason?)` | `groupId` | `number` | `reason="dismiss"` | `string`, `CloseReason` |
| `updateGroup` | `(groupId, options)` | `groupId`, `options` | `number` | none | `string`, `ToastUpdateOptions` |
| `isVisible` | `(id)` | `id` | `boolean` | none | `ToastId` |
| `host` | `(hostId)` | `hostId` | `ToastController` | none | any host id string |

No-provider behavior for global `toast`:

- show-like methods return fallback ids.
- mutating methods are safe no-ops (`false`, `0`, `void`).

### `createToastTemplates`

Signature:

```ts
function createToastTemplates<const TTemplates extends ToastTemplateMap>(
  templates: TTemplates,
): Record<ToastTemplateNameFromMap<TTemplates>, ToastTemplateRenderer>;
```

| Name | Type | Required | Default | Description | Allowed options/values |
| --- | --- | --- | --- | --- | --- |
| `templates` | `TTemplates extends ToastTemplateMap` | yes | `none` | Typed template map input. | `Record<string, ToastTemplateRenderer>` |

| Return value | Type | Description |
| --- | --- | --- |
| `registry` | `Record<ToastTemplateNameFromMap<TTemplates>, ToastTemplateRenderer>` | Built-in + supplied template registry with typed names. |

### `createToastSystem`

Signature:

```ts
function createToastSystem<const TTemplates extends ToastTemplateMap = {}>(config?: {
  templates?: TTemplates;
}): {
  ToastProvider: (props: Omit<ToastProviderProps, "templates">) => JSX.Element;
  ToastHost: typeof ToastHost;
  ToastViewport: typeof ToastHost;
  useToast: (hostId?: string) => TypedToastController<ToastTemplateNameFromMap<TTemplates>>;
  toast: TypedToastGlobal<ToastTemplateNameFromMap<TTemplates>>;
  templates: Record<ToastTemplateNameFromMap<TTemplates>, ToastTemplateRenderer>;
};
```

#### Input Contract

| Name | Type | Required | Default | Description | Allowed options/values |
| --- | --- | --- | --- | --- | --- |
| `config` | `{ templates?: TTemplates }` | no | `none` | Optional typed system config. | object |
| `config.templates` | `TTemplates` | no | `none` | Custom template map for typed facade. | `ToastTemplateMap` |

#### Return Object Contract

| Name | Type | Description |
| --- | --- | --- |
| `ToastProvider` | `(props: Omit<ToastProviderProps, "templates">) => JSX.Element` | Provider pre-bound to resolved template registry. |
| `ToastHost` | `typeof ToastHost` | Public host renderer component. |
| `ToastViewport` | `typeof ToastHost` | Alias of `ToastHost`. |
| `useToast` | `(hostId?: string) => TypedToastController<TemplateName>` | Typed host-scoped hook controller. |
| `toast` | `TypedToastGlobal<TemplateName>` | Typed global controller facade. |
| `templates` | `Record<TemplateName, ToastTemplateRenderer>` | Resolved typed template registry. |
