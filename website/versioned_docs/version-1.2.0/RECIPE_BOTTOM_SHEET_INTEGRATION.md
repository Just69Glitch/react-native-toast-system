---
title: Recipe - Bottom Sheet Toast Integration
slug: /recipes/bottom-sheet-toast-integration
---


# Recipe - Bottom Sheet Toast Integration

## Problem statement

When using bottom-sheet UI patterns, feedback triggered inside sheet actions should appear in the same sheet surface, not only at app root.

## Solution approach

Create a sheet-specific host (`hostId="sheet"`) inside sheet content and use `useToast("sheet")` for sheet actions.

## Copy-paste code example

```tsx
import React, { useMemo, useRef } from "react";
import { Button, View } from "react-native";
import { ToastHost, ToastProvider, ToastViewport, toast, useToast } from "react-native-toast-system";

// Replace these placeholders with your bottom-sheet library components.
function BottomSheetProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function BottomSheetContainer({
  sheetRef,
  snapPoints,
  children,
}: {
  sheetRef: React.MutableRefObject<{ present: () => void } | null>;
  snapPoints: string[];
  children: React.ReactNode;
}) {
  return <View>{children}</View>;
}

function BottomSheetContent({ children }: { children: React.ReactNode }) {
  return <View>{children}</View>;
}

function CouponSheet() {
  const sheetToast = useToast("sheet");

  return (
    <BottomSheetContent>
      <Button title="Apply coupon" onPress={() => sheetToast.warning("Coupon is expired")} />
      <ToastHost hostId="sheet" />
    </BottomSheetContent>
  );
}

function Screen() {
  const sheetRef = useRef<{ present: () => void } | null>(null);
  const snapPoints = useMemo(() => ["45%"], []);

  return (
    <View>
      <Button title="Root success toast" onPress={() => toast.success("Profile updated")} />
      <Button title="Open coupon sheet" onPress={() => sheetRef.current?.present()} />
      <BottomSheetContainer sheetRef={sheetRef} snapPoints={snapPoints}>
        <CouponSheet />
      </BottomSheetContainer>
    </View>
  );
}

export default function App() {
  return (
    <BottomSheetProvider>
      <ToastProvider>
        <Screen />
        <ToastViewport />
      </ToastProvider>
    </BottomSheetProvider>
  );
}
```

## Expected behavior

- Root actions render toasts in the app-level viewport.
- Sheet actions render toasts in `hostId="sheet"` inside the bottom sheet.
- Toast placement remains aligned with the active surface.

## Common pitfall

- Pitfall: mounting the sheet host outside bottom sheet content.
- Fix: mount `ToastHost hostId="sheet"` inside the sheet component tree.
