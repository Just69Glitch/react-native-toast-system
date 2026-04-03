import { Drawer } from "expo-router/drawer";
import { Fragment, useMemo } from "react";
import { ToastViewport } from "react-native-toast-system";
import { useAppPreferences } from "@/hooks/use-app-preferences";

const screenEntries = [
  { name: "feed", title: "Playground" },
  { name: "variants", title: "Variants" },
  { name: "templates", title: "Templates" },
  { name: "api", title: "APIs" },
  { name: "hosts", title: "Hosts" },
  { name: "grouping", title: "Grouping" },
  { name: "priority", title: "Priority" },
  { name: "stress", title: "Stress" },
  { name: "diagnostics", title: "Diagnostics" },
] as const;

export default function DrawerLayout() {
  const preferences = useAppPreferences();
  const toastTheme = preferences?.themeMode ?? "auto";
  const toastDirection = preferences?.toastDirection ?? "auto";

  const secondaryHostConfig = useMemo(
    () => ({
      preset: "status" as const,
      position: "top" as const,
      theme: toastTheme,
      direction: toastDirection,
    }),
    [toastTheme, toastDirection],
  );

  const nestedHostConfig = useMemo(
    () => ({
      preset: "minimal" as const,
      position: "bottom" as const,
      theme: toastTheme,
      direction: toastDirection,
    }),
    [toastTheme, toastDirection],
  );

  const nestedRtlHostConfig = useMemo(
    () => ({
      preset: "minimal" as const,
      position: "bottom" as const,
      theme: toastTheme,
      direction: "rtl" as const,
    }),
    [toastTheme, toastDirection],
  );

  const classicHostConfig = useMemo(
    () => ({
      preset: "default" as const,
      position: "bottom" as const,
      theme: toastTheme,
      direction: toastDirection,
    }),
    [toastTheme, toastDirection],
  );

  return (
    <Fragment>
      <Drawer
        initialRouteName="feed"
        screenOptions={{
          headerTitleAlign: "center",
        }}
      >
        {screenEntries.map((entry) => (
          <Drawer.Screen
            key={entry.name}
            name={entry.name}
            options={{ title: entry.title }}
          />
        ))}
      </Drawer>

      <ToastViewport hostId="secondary-host" config={secondaryHostConfig} />
      <ToastViewport hostId="secondary-host/nested" config={nestedHostConfig} />
      <ToastViewport
        hostId="secondary-host/nested/rtl"
        config={nestedRtlHostConfig}
      />
      <ToastViewport
        hostId="classic-host"
        interactionMode="classic"
        config={classicHostConfig}
      />
    </Fragment>
  );
}
