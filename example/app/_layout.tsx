import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Font from "expo-font";
import { Stack, usePathname } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ToastViewport } from "react-native-toast-system/components";
import { ToastProvider } from "react-native-toast-system/providers";

import { PreferencesBubble } from "@/components/preferences-bubble";
import {
  AppPreferencesProvider,
  useAppPreferences,
} from "@/hooks/use-app-preferences";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function RootLayout() {
  const [iconsReady, setIconsReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    const preloadIcons = async () => {
      try {
        await Font.loadAsync({
          ...Ionicons.font,
        });
      } catch (error) {
        console.warn("Failed to preload icon fonts:", error);
      } finally {
        if (mounted) {
          setIconsReady(true);
        }
      }
    };

    void preloadIcons();

    return () => {
      mounted = false;
    };
  }, []);

  if (!iconsReady) {
    return null;
  }

  return (
    <AppPreferencesProvider>
      <RootLayoutContent />
    </AppPreferencesProvider>
  );
}

function RootLayoutContent() {
  const colorScheme = useColorScheme();
  const pathname = usePathname();
  const isCaptureRoute = pathname === "/capture-demo";
  const preferences = useAppPreferences();
  const toastTheme = preferences?.themeMode ?? "auto";
  const toastDirection = preferences?.toastDirection ?? "auto";
  const defaultHostConfig = useMemo(
    () => ({ theme: toastTheme, direction: toastDirection }),
    [toastTheme, toastDirection],
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <ToastProvider defaultHostConfig={defaultHostConfig}>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(drawer)" />
              <Stack.Screen
                name="capture-demo"
                options={{ animation: "none" }}
              />
            </Stack>
            <StatusBar
              style={colorScheme === "dark" ? "light" : "dark"}
              hidden={isCaptureRoute}
            />
            <ToastViewport />
            {!isCaptureRoute ? <PreferencesBubble /> : null}
          </ToastProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
