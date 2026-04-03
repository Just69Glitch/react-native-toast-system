import { Pressable, StyleSheet, Text, type ViewStyle } from "react-native";
import { useThemeColor } from "@/hooks/use-theme-color";

export function DemoButton({
  label,
  onPress,
  tone = "primary",
  style,
}: {
  label: string;
  onPress: () => void;
  tone?: "primary" | "neutral" | "danger";
  style?: ViewStyle;
}) {
  const primaryBackground = useThemeColor(
    { light: "#0f172a", dark: "#0ea5e9" },
    "tint",
  );
  const neutralBackground = useThemeColor(
    { light: "#334155", dark: "#475569" },
    "icon",
  );
  const dangerBackground = useThemeColor(
    { light: "#b91c1c", dark: "#dc2626" },
    "tint",
  );
  const buttonTextColor = useThemeColor(
    { light: "#ffffff", dark: "#f8fafc" },
    "background",
  );

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: primaryBackground },
        tone === "neutral" && { backgroundColor: neutralBackground },
        tone === "danger" && { backgroundColor: dangerBackground },
        pressed && styles.buttonPressed,
        style,
      ]}
    >
      <Text style={[styles.buttonText, { color: buttonTextColor }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 42,
    paddingHorizontal: 12,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonText: {
    fontWeight: "600",
    fontSize: 13,
  },
});
