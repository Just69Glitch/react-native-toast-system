---
title: Recipe - React Navigation Modals and Toast Hosts
slug: /recipes/react-navigation-modals-toast-hosts
---


# Recipe - React Navigation Modals and Toast Hosts

## Problem statement

In React Navigation modal flows, root-level toasts can appear behind modal content or feel detached from the active action.

## Solution approach

Use one root host for app-wide events and a modal host inside modal screen content for modal-local feedback.

## Copy-paste code example

```tsx
import React from "react";
import { Button, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  ToastHost,
  ToastNativeSurfaceBoundary,
  ToastProvider,
  ToastViewport,
  toast,
  useToast,
} from "react-native-toast-system";

const Stack = createNativeStackNavigator();

function HomeScreen({ navigation }: { navigation: any }) {
  return (
    <View>
      <Button title="Save profile" onPress={() => toast.success("Saved successfully")} />
      <Button title="Open payment modal" onPress={() => navigation.navigate("PaymentModal")} />
    </View>
  );
}

function PaymentModalScreen() {
  const modalToast = useToast("modal");

  return (
    <ToastNativeSurfaceBoundary>
      <View>
        <Button title="Charge card" onPress={() => modalToast.error("Card declined")} />
      </View>
      <ToastHost hostId="modal" />
    </ToastNativeSurfaceBoundary>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen
            name="PaymentModal"
            component={PaymentModalScreen}
            options={{ presentation: "modal" }}
          />
        </Stack.Navigator>
      </NavigationContainer>
      <ToastViewport />
    </ToastProvider>
  );
}
```

## Expected behavior

- `toast.success(...)` from home renders in the root viewport.
- Modal actions render in the modal host.
- Root toasts and modal toasts do not overwrite each other by host.

## Common pitfall

- Pitfall: using `useToast()` (default host) inside modal screen while expecting modal-local layering.
- Fix: call `useToast("modal")` and mount `ToastHost hostId="modal"` inside modal content.
