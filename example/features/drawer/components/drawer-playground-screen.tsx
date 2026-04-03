import type { ReactNode } from "react";
import { ScrollView } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";
import { drawerStyles } from "@/features/drawer/shared/drawer-styles";
import { drawerTheme } from "@/features/drawer/shared/drawer-theme";

export function DrawerPlaygroundScreen({
  title,
  hint,
  children,
}: {
  title: string;
  hint: string;
  children: ReactNode;
}) {
  const titleColor = useThemeColor({}, "text");
  const hintColor = useThemeColor(drawerTheme.colors.hint, "icon");

  return (
    <ThemedView style={drawerStyles.playgroundRoot}>
      <ScrollView contentContainerStyle={drawerStyles.screenContent}>
        <ThemedText style={[drawerStyles.sectionTitle, { color: titleColor }]}>
          {title}
        </ThemedText>
        <ThemedText style={[drawerStyles.sectionHint, { color: hintColor }]}>
          {hint}
        </ThemedText>
        {children}
      </ScrollView>
    </ThemedView>
  );
}
