import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useThemeColor } from "@/hooks/use-theme-color";

export function ScenarioCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const cardBackground = useThemeColor({}, "background");
  const cardBorderColor = useThemeColor({ light: "#cbd5e1", dark: "#334155" }, "icon");
  const cardTitleColor = useThemeColor({}, "text");

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: cardBackground, borderColor: cardBorderColor },
      ]}
    >
      <Text style={[styles.cardTitle, { color: cardTitleColor }]}>{title}</Text>
      <View style={styles.cardBody}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 12,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  cardBody: {
    gap: 8,
  },
});
