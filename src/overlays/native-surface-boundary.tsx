import { GestureHandlerRootView } from "react-native-gesture-handler";
import type { ToastNativeSurfaceBoundaryProps } from "../types";

export function ToastNativeSurfaceBoundary({
  children,
  className,
  style,
  unstable_forceActive = true,
  ...rest
}: ToastNativeSurfaceBoundaryProps) {
  const maybeUnstableProps = { unstable_forceActive } as Record<string, unknown>;

  return (
    <GestureHandlerRootView
      {...(rest as object)}
      {...(maybeUnstableProps as object)}
      className={className}
      style={[{ flex: 1 }, style]}
    >
      {children}
    </GestureHandlerRootView>
  );
}
