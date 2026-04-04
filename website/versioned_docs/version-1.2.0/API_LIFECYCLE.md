---
title: API Lifecycle and Enums
slug: /api-reference/lifecycle
---


# API Lifecycle and Enums

> **Platform support (current):** iOS and Android only. Web is not officially supported yet and may be added in future releases.

Lifecycle callbacks, close reasons, unions/enums, and public type-export index.

## Callback Context Contracts

### Callback Context Object

| Field | Type | Description |
| --- | --- | --- |
| `id` | `ToastId` | Toast id. |
| `hostId` | `string` | Host id owning toast. |
| `reason` | `CloseReason \| undefined` | Reason when relevant to callback phase. |
| `state` | `{ mounted: boolean; visible: boolean; isClosing: boolean }` | Lifecycle flags snapshot. |
| `toast` | `object` | Toast snapshot payload at callback time. |

### Action Context Object

| Field | Type | Description |
| --- | --- | --- |
| `id` | `ToastId` | Toast id. |
| `hostId` | `string` | Host id owning toast. |
| `action` | `ToastAction` | Action metadata. |
| `actionIndex` | `number` | Index in action list. |
| `dismiss` | `(reason?: CloseReason) => boolean` | Programmatic dismiss helper for current toast. |
| `update` | `(options: ToastUpdateOptions) => boolean` | Programmatic update helper for current toast. |

## Close Reasons and Lifecycle Timing

### Close Reasons

| Value | Meaning |
| --- | --- |
| `timeout` | Auto-dismiss timer elapsed. |
| `swipe` | Gesture-based dismissal. |
| `press` | Body press dismissal (`dismissOnPress: true`). |
| `action` | Dismiss triggered by toast action. |
| `dismiss` | Explicit dismiss path (`dismiss`, dismiss button, dismiss-all defaults). |
| `programmatic` | Internal/imperative close path (config change, force removal, etc.). |

### Callback Timing Order

Show/update phases:

1. `onMount`
2. `onOpen`
3. `onUpdate` (whenever update succeeds)

Close phase (single-fire guarded):

1. `onClosingStart`
2. `onClose`
3. `onClosingEnd`
4. `onDismiss`

Interaction callbacks:

- `onPress` on body press
- `onActionPress` on action press

## Union and Enum Allowed Values

| Type | Allowed values |
| --- | --- |
| `ToastVariant` | `default`, `success`, `error`, `warning`, `info`, `loading` |
| `ToastTemplate` | `compact`, `banner` |
| `ToastPosition` | `top`, `bottom` |
| `ToastAnimationPreset` | `subtle`, `spring`, `snappy` |
| `ToastDedupeMode` | `reset`, `replace`, `ignore`, `bump` |
| `ToastGroupBehavior` | `replace-in-group`, `update-in-group`, `stack-in-group` |
| `ToastPriorityMode` | `soft`, `strict` |
| `ToastHostPreset` | `default`, `minimal`, `status`, `banner-heavy` |
| `ToastInteractionMode` | `classic`, `deck` |
| `ToastTheme` | `auto`, `light`, `dark` |
| `ToastDirection` | `auto`, `ltr`, `rtl` |
| `ToastResolvedTheme` | `light`, `dark` |
| `ToastStackOverflowMode` | `fade`, `compact`, `clip` |
| `ToastDismissAllConfirmationKind` | `none`, `default`, `custom` |
| `ToastDismissAllConfirmation` | `none`, `default`, `(context) => boolean \| Promise<boolean>` |
| `ToastExpandedAutoCollapsePolicy` | `number`, `false` |
| `CloseReason` | `timeout`, `swipe`, `press`, `action`, `dismiss`, `programmatic` |

## Type Exports

Public root type exports include:

- `CloseReason`
- `ToastAction`
- `ToastAnimationConfig`
- `ToastAnimationPreset`
- `ToastController`
- `ToastDedupeMode`
- `ToastExpandedAutoCollapsePolicy`
- `ToastCollapseHandleStyle`
- `ToastClassicGestureConfig`
- `ToastDeckGestureConfig`
- `ToastGestureConfig`
- `ToastGroupBehavior`
- `ToastHostConfig`
- `ToastHostConfigChangeContext`
- `ToastInteractionMode`
- `ToastHostProps`
- `ToastHostPreset`
- `ToastResolvedTheme`
- `ToastTheme`
- `ToastDirection`
- `ToastId`
- `ToastOptions`
- `ToastPriorityMode`
- `ToastDismissAllConfirmation`
- `ToastDismissAllConfirmationKind`
- `ToastDismissAllAttemptContext`
- `ToastDismissAllCompleteContext`
- `ToastStackStateContext`
- `ToastPromiseOptions`
- `ToastPosition`
- `ToastProviderProps`
- `ToastStackOverflowMode`
- `ToastTemplate`
- `ToastTemplateProps`
- `ToastTemplateRenderer`
- `ToastTemplateRegistry`
- `ToastUpdateOptions`
- `ToastVariant`
- `ToastViewportProps`
- `ToastNativeSurfaceBoundaryProps`
- `ToastTemplateMap`
- `ToastTemplateNameFromMap`
- `TypedToastOptions`
- `TypedToastUpdateOptions`
- `TypedToastPromiseOptions`
- `TypedToastController`
- `TypedToastGlobal`

Use `src/index.ts` as source-of-truth export index for contract verification.
