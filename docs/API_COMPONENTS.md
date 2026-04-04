---
title: API Components
slug: /api-reference/components
---


# API Components

> **Platform support (current):** iOS and Android only. Web is not officially supported yet and may be added in future releases.

Contract details for component value exports. Import from package root only:

```ts
import {
  ToastProvider,
  ToastHost,
  ToastViewport,
  ToastNativeSurfaceBoundary,
  ToastVariantIcon,
  ToastDismissIconButton,
} from "react-native-toast-system";
```

## Value Exports

### `ToastProvider`

Signature:

```ts
function ToastProvider(props: ToastProviderProps): JSX.Element;
```

#### `ToastProviderProps`

| Name | Type | Required | Default | Description | Allowed options/values |
| --- | --- | --- | --- | --- | --- |
| `children` | `ReactNode` | no | `none` | Provider subtree content. | any React node |
| `defaultHostId` | `string` | no | `"default"` | Default host id used by `toast` and `useToast()` when host is omitted. | any non-empty string |
| `defaultHostConfig` | `ToastHostConfig` | no | `none` | Initial host behavior overrides merged into runtime host defaults. | valid `ToastHostConfig` object |
| `templates` | `ToastTemplateRegistry` | no | `none` | Template renderer map merged with built-ins. | record of template name to renderer |
| `debug` | `boolean` | no | `none` | Provider-level debug fallback for default host if `defaultHostConfig.debug` is omitted. | `true`, `false` |
| `useRNScreensOverlay` | `boolean` | no | `none` | Provider-level overlay fallback for default host if `defaultHostConfig.useRNScreensOverlay` is omitted. | `true`, `false` |
| `rnScreensOverlayViewStyle` | `StyleProp<ViewStyle>` | no | `none` | Provider-level overlay view style fallback for default host. | any React Native view style |

### `ToastHost` and `ToastViewport`

Signatures:

```ts
function ToastHost(props: ToastHostProps): JSX.Element | null;
const ToastViewport: typeof ToastHost;
```

`ToastViewport` is an alias of `ToastHost`.

#### `ToastHostProps` / `ToastViewportProps`

| Name | Type | Required | Default | Description | Allowed options/values |
| --- | --- | --- | --- | --- | --- |
| `hostId` | `string` | no | provider `defaultHostId` | Host namespace key. | any non-empty string |
| `config` | `ToastHostConfig` | no | `none` | Host-scoped config overrides merged at registration time. | valid `ToastHostConfig` object |
| `className` | `string` | no | `none` | Class name applied to host container. | any string |
| `style` | `StyleProp<ViewStyle>` | no | `none` | Style applied to host container. | any React Native view style |
| `controllerRef` | `Ref<ToastController \| null>` | no | `none` | Receives mounted host controller instance. Cleared on unmount. | React ref |
| `useRNScreensOverlay` | `boolean` | no | `none` | Host-level overlay override when `config.useRNScreensOverlay` is omitted. | `true`, `false` |
| `rnScreensOverlayViewStyle` | `StyleProp<ViewStyle>` | no | `none` | Host-level overlay style override when `config.rnScreensOverlayViewStyle` is omitted. | any React Native view style |

### `ToastNativeSurfaceBoundary`

Signature:

```ts
function ToastNativeSurfaceBoundary(props: ToastNativeSurfaceBoundaryProps): JSX.Element;
```

#### `ToastNativeSurfaceBoundaryProps`

| Name | Type | Required | Default | Description | Allowed options/values |
| --- | --- | --- | --- | --- | --- |
| `children` | `ReactNode` | no | `none` | Boundary subtree content. | any React node |
| `className` | `string` | no | `none` | Class name forwarded to `GestureHandlerRootView`. | any string |
| `style` | `StyleProp<ViewStyle>` (`ViewProps`) | no | `[ { flex: 1 }, style ]` merge | Style forwarded to boundary root view. | any React Native view style |
| `unstable_forceActive` | `boolean` | no | `true` | Forwarded unstable gesture-handler activation hint. | `true`, `false` |
| `...rest` | `ViewProps` | no | `none` | Remaining React Native `ViewProps` forwarded to boundary root view. | valid `ViewProps` fields |

### `ToastVariantIcon`

Signature:

```ts
function ToastVariantIcon(props: {
  variant?: ToastVariant;
  color: string;
  size?: number;
  className?: string;
}): JSX.Element | null;
```

#### Variant Icons Props Contract

| Name | Type | Required | Default | Description | Allowed options/values |
| --- | --- | --- | --- | --- | --- |
| `variant` | `ToastVariant` | no | `"default"` | Variant icon to render. `loading` renders spinner. | `default`, `success`, `error`, `warning`, `info`, `loading` |
| `color` | `string` | yes | `none` | Icon/stroke fill color. | any CSS-like color string accepted by RN/SVG |
| `size` | `number` | no | `16` | Icon frame size in device-independent pixels. | positive number |
| `className` | `string` | no | `none` | Optional class name for icon frame. | any string |

### `ToastDismissIconButton`

Signature:

```ts
function ToastDismissIconButton(props: {
  accessibilityLabel: string;
  accessibilityHint?: string;
  onPress: () => void;
  onPressIn?: () => void;
  onPressOut?: () => void;
  iconColor: string;
  iconSize?: number;
  className?: string;
  style?: StyleProp<ViewStyle>;
}): JSX.Element;
```

#### Dismiss Icon Props Contract

| Name | Type | Required | Default | Description | Allowed options/values |
| --- | --- | --- | --- | --- | --- |
| `accessibilityLabel` | `string` | yes | `none` | Accessible label for dismiss button. | any non-empty string |
| `accessibilityHint` | `string` | no | `none` | Accessible hint text. | any string |
| `onPress` | `() => void` | yes | `none` | Dismiss trigger callback. | function |
| `onPressIn` | `() => void` | no | `none` | Press-in callback (often for timer pause wiring). | function |
| `onPressOut` | `() => void` | no | `none` | Press-out callback (often for timer resume wiring). | function |
| `iconColor` | `string` | yes | `none` | Close icon color. | any CSS-like color string accepted by RN/SVG |
| `iconSize` | `number` | no | `18` | Close icon size. | positive number |
| `className` | `string` | no | `none` | Optional button class name. | any string |
| `style` | `StyleProp<ViewStyle>` | no | `none` | Optional button style. | any React Native view style |
