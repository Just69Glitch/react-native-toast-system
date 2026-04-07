---
title: API Options
slug: /api-reference/options
---


# API Options

> **Platform support (current):** iOS and Android only. Web is not officially supported yet and may be added in future releases.

Contract details for configuration and option objects used by hosts/controllers.

## `ToastHostConfig` Contract

`ToastHostConfig` is used by `ToastProvider.defaultHostConfig` and `ToastHost.config`.

`interactionMode` is selected at host root props (`ToastHost` / `ToastViewport`), not inside `config`.

## `ToastHostProps` Contract

| Name | Type | Required | Default | Description | Allowed options/values |
| --- | --- | --- | --- | --- | --- |
| `hostId` | `string` | no | provider default host id | Host identity. | any string |
| `interactionMode` | `ToastInteractionMode` | no | `"deck"` | Host interaction model. Controls whether classic-only or deck-only config fields are valid. | `classic`, `deck` |
| `config` | `ToastHostConfig` | no | `{}` | Host config object for the selected interaction mode. | object |
| `className` | `string` | no | `none` | Host container class name fallback. | any string |
| `style` | `StyleProp<ViewStyle>` | no | `none` | Host container style fallback. | any React Native view style |
| `controllerRef` | `Ref<ToastController \| null>` | no | `none` | Imperative controller ref for boundary usage. | ref |
| `useRNScreensOverlay` | `boolean` | no | `none` | Enables RN Screens FullWindowOverlay at host level. | `true`, `false` |
| `rnScreensOverlayViewStyle` | `StyleProp<ViewStyle>` | no | `none` | Style for overlay container at host level. | any React Native view style |

### Common Fields

| Name | Type | Required | Default | Description | Allowed options/values |
| --- | --- | --- | --- | --- | --- |
| `preset` | `ToastHostPreset` | no | `"default"` | Applies preset before explicit overrides. | `default`, `minimal`, `status`, `banner-heavy` |
| `debug` | `boolean` | no | `false` | Enables host-scoped debug logs. | `true`, `false` |
| `theme` | `ToastTheme` | no | `"auto"` | Template theme mode. | `auto`, `light`, `dark` |
| `direction` | `ToastDirection` | no | `"auto"` | Toast template direction override independent of app layout direction. | `auto`, `ltr`, `rtl` |
| `onConfigChange` | `(context: ToastHostConfigChangeContext) => void` | no | `none` | Fires after effective host config changes; existing host toasts are dismissed programmatically before callback. | callback |
| `duration` | `number \| "persistent"` | no | `4000` | Default host toast duration fallback. | positive number or `persistent` |
| `variantDurations` | `Partial<Record<ToastVariant, number \| "persistent">>` | no | `{ loading: "persistent" }` | Per-variant duration overrides. | variant keyed map |
| `position` | `ToastPosition` | no | `"top"` | Host stack position. | `top`, `bottom` |
| `maxStackSize` | `number` | no | `48` | Hard cap before oldest non-closing entries are trimmed. | integer `>=1` |
| `stackGap` | `number` | no | `8` | Stack spacing. | number `>=0` |
| `stackOverlap` | `number` | no | `10` | Depth overlap offset. | clamped numeric range |
| `deEmphasize` | `boolean` | no | `true` | Enables depth de-emphasis transforms. | `true`, `false` |
| `deEmphasizeScaleStep` | `number` | no | `0.03` | Scale step per stack depth. | clamped numeric range |
| `deEmphasizeOpacityStep` | `number` | no | `0.005` | Opacity step per stack depth. | clamped numeric range |
| `dedupeMode` | `ToastDedupeMode` | no | `"reset"` | Host-level dedupe strategy fallback. | `reset`, `replace`, `ignore`, `bump` |
| `groupBehavior` | `ToastGroupBehavior` | no | `"stack-in-group"` | Host-level group behavior fallback. | `replace-in-group`, `update-in-group`, `stack-in-group` |
| `priorityMode` | `ToastPriorityMode` | no | `"soft"` | Host-level priority sort mode. | `soft`, `strict` |
| `priorityWeight` | `number` | no | `6000` | Weighted priority multiplier for `soft` mode ordering. | clamped numeric range |
| `dismissible` | `boolean` | no | `true` | User-dismiss permission fallback. | `true`, `false` |
| `showDismissButton` | `boolean` | no | `false` | Dismiss button visibility fallback. | `true`, `false` |
| `animationPreset` | `ToastAnimationPreset` | no | `"subtle"` | Host animation preset fallback. | `subtle`, `spring`, `snappy` |
| `animationDuration` | `number` | no | `260` | Host animation duration fallback. | clamped numeric range |
| `keyboardAvoidance` | `boolean` | no | `true` | Keyboard overlap avoidance fallback. | `true`, `false` |
| `keyboardOffset` | `number` | no | `0` | Keyboard avoidance offset fallback. | number `>=0` |
| `pauseOnDrag` | `boolean` | no | `true` | Pauses timer on drag interaction. | `true`, `false` |
| `pauseOnPress` | `boolean` | no | `true` | Pauses timer on press interaction. | `true`, `false` |
| `zIndexBase` | `number` | no | `10000` | Host z-index base. | number |
| `zIndexStep` | `number` | no | `10` | Step per stacked layer. | integer `>=1` |
| `layering` | `"newer-on-top" \| "older-on-top"` | no | `"newer-on-top"` | Layering strategy. | `newer-on-top`, `older-on-top` |
| `defaultTemplate` | `ToastTemplate` | no | `"compact"` | Host template fallback when toast template omitted. Built-in templates only in base APIs. | `compact`, `banner` |
| `useRNScreensOverlay` | `boolean` | no | `false` | Enables RN Screens FullWindowOverlay path when available. | `true`, `false` |
| `rnScreensOverlayViewStyle` | `StyleProp<ViewStyle>` | no | `none` | Style for overlay container. | any React Native view style |
| `className` | `string` | no | `none` | Host container class name. | any string |
| `style` | `StyleProp<ViewStyle>` | no | `none` | Host container style. | any React Native view style |

### Classic-Only Fields

These fields apply when host `interactionMode` is `classic`.

| Name | Type | Required | Default | Description | Allowed options/values |
| --- | --- | --- | --- | --- | --- |
| `classicMaxVisible` | `number` | no | `2` | Classic-mode non-closing visible window target. | integer `>=1` |
| `classicOverflowMode` | `ToastStackOverflowMode` | no | `"compact"` | Classic-mode overflow rendering mode. | `fade`, `compact`, `clip` |
| `classicOverflowBuffer` | `number` | no | `2` | Classic-mode additional render buffer beyond `classicMaxVisible`. | integer `>=1` |
| `classicGesture` | `ToastClassicGestureConfig` | no | global `{ enabled: true, dismissThreshold: 48, cancelThreshold: 14, velocityThreshold: 900 }` + `itemDismiss` inheriting global values | Classic-mode gesture policy for item dismiss interactions. Nested keys override global values per gesture. | object |

### Deck-Only Fields

These fields apply when host `interactionMode` is `deck`.

| Name | Type | Required | Default | Description | Allowed options/values |
| --- | --- | --- | --- | --- | --- |
| `deckCollapsedMaxVisible` | `number` | no | `4` | Collapsed deck visible window size. | integer `>=1` |
| `deckExpandedMaxVisible` | `number` | no | `32` | Expanded deck visible window size cap. | integer `>=1` |
| `deckGesture` | `ToastDeckGestureConfig` | no | global `{ enabled: true, dismissThreshold: 48, cancelThreshold: 14, velocityThreshold: 900 }` + per-gesture keys inheriting global values | Deck-mode gesture policy. Supports `itemDismiss`, `collapsedExpand`, `collapsedDismissAll`, and `collapseHandle`. | object |
| `allowCollapsedFrontHorizontalDismiss` | `boolean` | no | `true` | Enables horizontal dismiss for front collapsed card. | `true`, `false` |
| `disableSwipeDismissAll` | `boolean` | no | `false` | Disables collapsed opposite-direction swipe dismiss-all gesture. | `true`, `false` |
| `collapseHandleStyle` | `ToastCollapseHandleStyle` | no | `{ width: 48, height: 4, borderRadius: 999, opacity: 0.9, marginTop: 6, marginBottom: 2 }` + theme-aware default background | Visual style for expanded-mode collapse handle. Drag the handle in collapse direction to collapse (distance or velocity threshold). | partial object |
| `dismissAllConfirmation` | `ToastDismissAllConfirmation` | no | `"default"` | Dismiss-all confirmation strategy. | `none`, `default`, custom callback |
| `dismissAllConfirmationTitle` | `string` | no | `"Dismiss all notifications?"` | Built-in confirmation title. | any string |
| `dismissAllConfirmationMessage` | `string` | no | `"This will close all visible toasts in this host."` | Built-in confirmation message. | any string |
| `dismissAllConfirmLabel` | `string` | no | `"Dismiss all"` | Built-in confirm action label. | any string |
| `dismissAllCancelLabel` | `string` | no | `"Cancel"` | Built-in cancel action label. | any string |
| `expandedMaxHeight` | `number` | no | `0.7` | Expanded stack height cap. Values in `(0,1]` are treated as a screen-height ratio; values `>1` are treated as pixels. | number |
| `expandedAutoCollapse` | `ToastExpandedAutoCollapsePolicy` | no | `5000` | Auto-collapse delay in ms or disabled with `false`. | number or `false` |
| `onStackExpand` | `(context: ToastStackStateContext) => void` | no | `none` | Fires when deck expands. | callback |
| `onStackCollapse` | `(context: ToastStackStateContext) => void` | no | `none` | Fires when deck collapses. | callback |
| `onStackStateChange` | `(context: ToastStackStateContext) => void` | no | `none` | Fires on expanded state or visible count changes. | callback |
| `onDismissAllAttempt` | `(context: ToastDismissAllAttemptContext) => void` | no | `none` | Fires when dismiss-all attempt starts. | callback |
| `onDismissAllComplete` | `(context: ToastDismissAllCompleteContext) => void` | no | `none` | Fires when dismiss-all attempt resolves. | callback |

Classic mode contract note:

- if host `interactionMode` is `classic`, deck-only fields are invalid at type level.
- if host `interactionMode` is `deck`, classic-only fields are invalid at type level.
- `collapseHandleStyle` applies only while a deck stack is expanded; no handle is shown when collapsed.

## `ToastOptions` Contract

### Identity and Flow Fields

| Name | Type | Required | Default | Description | Allowed options/values |
| --- | --- | --- | --- | --- | --- |
| `id` | `ToastId` | no | generated id | Explicit toast id for update/dedupe targeting. | any string id |
| `hostId` | `string` | no | controller host or provider default host | Target host id for this toast. | any host id string |
| `dedupeKey` | `string` | no | `none` | Dedupe identity key. | any string |
| `dedupeMode` | `ToastDedupeMode` | no | host `dedupeMode` (`reset`) | Dedupe strategy for collisions. | `reset`, `replace`, `ignore`, `bump` |
| `groupId` | `string` | no | `none` | Group flow id. | any string |
| `groupBehavior` | `ToastGroupBehavior` | no | host `groupBehavior` (`stack-in-group`) | Group conflict strategy. | `replace-in-group`, `update-in-group`, `stack-in-group` |
| `priority` | `number` | no | effective `0` | Priority score used by stack ordering. | numeric (runtime clamped) |

### Content Fields

| Name | Type | Required | Default | Description | Allowed options/values |
| --- | --- | --- | --- | --- | --- |
| `title` | `string` | no | `none` | Primary toast text. | any string |
| `description` | `string` | no | `none` | Secondary body text. | any string |
| `icon` | `ReactNode` | no | `none` | Custom icon node override. | any React node |
| `actions` | `ToastAction[]` | no | `none` | Action buttons for toast. | array of `ToastAction` |
| `template` | `ToastTemplate` | no | host `defaultTemplate` (`compact`) | Built-in template selector in base APIs. | `compact`, `banner` |
| `render` | `(context: { toast; resolvedTheme; dismiss; update; onPress; onPressIn; onPressOut; onActionPress }) => ReactNode` | no | `none` | Full custom render override. | callback returning React node |

### Variant and Dismiss Behavior

| Name | Type | Required | Default | Description | Allowed options/values |
| --- | --- | --- | --- | --- | --- |
| `variant` | `ToastVariant` | no | `default` | Visual/semantic variant. | `default`, `success`, `error`, `warning`, `info`, `loading` |
| `duration` | `number \| "persistent"` | no | host/variant resolution (`4000`, loading persistent) | Auto-dismiss duration. | positive number or `persistent` |
| `persistent` | `boolean` | no | implementation-defined (`loading` can force true) | Explicit persistence override. | `true`, `false` |
| `dismissible` | `boolean` | no | host `dismissible` (`true`) | Enables user-driven dismiss reasons. | `true`, `false` |
| `dismissOnPress` | `boolean` | no | `false` | Body press dismiss behavior. | `true`, `false` |
| `showDismissButton` | `boolean` | no | host `showDismissButton` (`false`) | Template dismiss button visibility. | `true`, `false` |

### Layout and Interaction

| Name | Type | Required | Default | Description | Allowed options/values |
| --- | --- | --- | --- | --- | --- |
| `position` | `ToastPosition` | no | host `position` (`top`) | Top/bottom placement for toast. | `top`, `bottom` |
| `direction` | `ToastDirection` | no | host `direction` (`auto`) | Per-toast direction override. Final resolution order is toast `direction` -> host `direction` -> native/device direction. | `auto`, `ltr`, `rtl` |
| `keyboardAvoidance` | `boolean` | no | host `keyboardAvoidance` (`true`) | Keyboard overlap avoidance toggle. | `true`, `false` |
| `keyboardOffset` | `number` | no | host `keyboardOffset` (`0`) | Extra keyboard avoidance offset. | number `>=0` |
| `pauseOnDrag` | `boolean` | no | host `pauseOnDrag` (`true`) | Pause timer while dragging. | `true`, `false` |
| `pauseOnPress` | `boolean` | no | host `pauseOnPress` (`true`) | Pause timer while pressed. | `true`, `false` |

### Animation and Gesture

| Name | Type | Required | Default | Description | Allowed options/values |
| --- | --- | --- | --- | --- | --- |
| `animationPreset` | `ToastAnimationPreset` | no | host `animationPreset` (`subtle`) | Motion preset override. | `subtle`, `spring`, `snappy` |
| `animationDuration` | `number` | no | host `animationDuration` (`260`) | Motion duration override. | numeric (runtime clamped) |
| `animation` | `ToastAnimationConfig` | no | `none` | Combined animation override object. | `{ preset?: ToastAnimationPreset; duration?: number }` |
| `gesture` | `ToastGestureConfig` | no | host item-dismiss gesture config for current mode | Per-toast item-dismiss gesture override. Applies to toast swipe dismiss behavior only (not deck container gestures). | object |

### Layering and Styling

| Name | Type | Required | Default | Description | Allowed options/values |
| --- | --- | --- | --- | --- | --- |
| `zIndex` | `number` | no | `none` | Explicit z-index override for toast item. | any number |
| `className` | `string` | no | `none` | Root class name override. | any string |
| `style` | `StyleProp<ViewStyle>` | no | `none` | Root style override. | any React Native view style |
| `contentClassName` | `string` | no | `none` | Template content class name override. | any string |
| `contentStyle` | `StyleProp<ViewStyle>` | no | `none` | Template content style override. | any React Native view style |
| `titleClassName` | `string` | no | `none` | Title class name override. | any string |
| `titleStyle` | `StyleProp<TextStyle>` | no | `none` | Title style override. | any React Native text style |
| `descriptionClassName` | `string` | no | `none` | Description class name override. | any string |
| `descriptionStyle` | `StyleProp<TextStyle>` | no | `none` | Description style override. | any React Native text style |
| `accessibilityLabel` | `string` | no | `none` | Accessible label override for rendered toast. | any string |

### Callback Fields

| Name | Type | Required | Default | Description | Allowed options/values |
| --- | --- | --- | --- | --- | --- |
| `onMount` | `(context: callback-context-object) => void` | no | `none` | Called when toast first mounts. | callback |
| `onOpen` | `(context: callback-context-object) => void` | no | `none` | Called when toast enters visible state. | callback |
| `onUpdate` | `(context: callback-context-object) => void` | no | `none` | Called after successful update. | callback |
| `onClose` | `(context: callback-context-object) => void` | no | `none` | Called at close-start phase. | callback |
| `onDismiss` | `(context: callback-context-object) => void` | no | `none` | Called at close-end phase. | callback |
| `onPress` | `(context: callback-context-object) => void` | no | `none` | Called when toast body is pressed. | callback |
| `onActionPress` | `(context: action-context-object) => void` | no | `none` | Called when toast action is pressed. | callback |
| `onClosingStart` | `(context: callback-context-object) => void` | no | `none` | Called once when closing starts. | callback |
| `onClosingEnd` | `(context: callback-context-object) => void` | no | `none` | Called once when closing completes. | callback |

## `ToastUpdateOptions` Contract

Signature:

```ts
interface ToastUpdateOptions extends Partial<Omit<ToastOptions, "id" | "hostId">> {
  reason?: CloseReason;
}
```

| Name | Type | Required | Default | Description | Allowed options/values |
| --- | --- | --- | --- | --- | --- |
| `...toastFields` | `Partial<Omit<ToastOptions, "id" \| "hostId">>` | no | `none` | Any mutable toast field except `id` and `hostId`. | see `ToastOptions` tables |
| `reason` | `CloseReason` | no | `none` | Optional update reason metadata used by runtime callbacks and debug flows. | `timeout`, `swipe`, `press`, `action`, `dismiss`, `programmatic` |

## `ToastPromiseOptions<T>` Contract

Signature:

```ts
interface ToastPromiseOptions<T> {
  loading: string | ToastOptions;
  success?: string | ToastOptions | ((value: T) => string | ToastOptions);
  error?: string | ToastOptions | ((error: unknown) => string | ToastOptions);
  finally?: ToastUpdateOptions;
  hostId?: string;
  groupId?: string;
  groupBehavior?: ToastGroupBehavior;
  priority?: number;
}
```

| Name | Type | Required | Default | Description | Allowed options/values |
| --- | --- | --- | --- | --- | --- |
| `loading` | `string \| ToastOptions` | yes | `none` | Loading-state toast payload. | string or `ToastOptions` |
| `success` | `string \| ToastOptions \| ((value: T) => string \| ToastOptions)` | no | `none` | Success branch payload or builder. | string, options object, callback |
| `error` | `string \| ToastOptions \| ((error: unknown) => string \| ToastOptions)` | no | `none` | Error branch payload or builder. | string, options object, callback |
| `finally` | `ToastUpdateOptions` | no | `none` | Final update applied after success/error branch handling. | `ToastUpdateOptions` |
| `hostId` | `string` | no | controller host/global default host | Host override for promise flow. | host id string |
| `groupId` | `string` | no | `none` | Group id applied to promise lifecycle toasts. | any string |
| `groupBehavior` | `ToastGroupBehavior` | no | host `groupBehavior` | Group behavior override for promise flow. | `replace-in-group`, `update-in-group`, `stack-in-group` |
| `priority` | `number` | no | effective `0` | Priority override for promise flow toasts. | numeric (runtime clamped) |
