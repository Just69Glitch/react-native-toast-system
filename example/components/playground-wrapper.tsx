import type { ReactNode } from "react";
import { ScrollView, StyleSheet } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";

export function PlaygroundWrapper({
  title,
  hint,
  children,
}: {
  title: string;
  hint: string;
  children: ReactNode;
}) {
  const titleColor = useThemeColor({}, "text");
  const hintColor = useThemeColor({ light: "#4b5563", dark: "#9BA1A6" }, "icon");

  return (
    <ThemedView style={demoStyles.playgroundRoot}>
      <ScrollView contentContainerStyle={[demoStyles.screenContent]}>
        <ThemedText style={[demoStyles.sectionTitle, { color: titleColor }]}>
          {title}
        </ThemedText>
        <ThemedText style={[demoStyles.sectionHint, { color: hintColor }]}>
          {hint}
        </ThemedText>
        {children}
      </ScrollView>
    </ThemedView>
  );
}

const demoStyles = StyleSheet.create({
  screenContent: {
    padding: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  sectionHint: {
    fontSize: 13,
    lineHeight: 18,
  },
  playgroundRoot: {
    flex: 1,
  },
});
