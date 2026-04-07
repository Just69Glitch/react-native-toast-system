import { Drawer } from "expo-router/drawer";
import { Fragment, useMemo } from "react";
import { ToastViewport } from "react-native-toast-system/components";
import type { ToastHostProps } from "react-native-toast-system/types";

type DeckViewportConfig = NonNullable<
  Extract<ToastHostProps, { interactionMode?: "deck" | undefined }>["config"]
>;
type ClassicViewportConfig = NonNullable<
  Extract<ToastHostProps, { interactionMode: "classic" }>["config"]
>;

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
  const secondaryHostConfig: DeckViewportConfig = useMemo(
    () => ({
      preset: "status" as const,
      position: "top" as const,
    }),
    [],
  );

  const nestedHostConfig: DeckViewportConfig = useMemo(
    () => ({
      preset: "minimal" as const,
      position: "bottom" as const,
    }),
    [],
  );

  const nestedRtlHostConfig: DeckViewportConfig = useMemo(
    () => ({
      preset: "minimal" as const,
      position: "bottom" as const,
      direction: "rtl" as const,
    }),
    [],
  );

  const classicHostConfig: ClassicViewportConfig = useMemo(
    () => ({
      preset: "default" as const,
      position: "bottom" as const,
    }),
    [],
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
