import { DemoButton } from "@/components/button";
import type { ViewStyle } from "react-native";

export function DrawerActionButton({
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
  return <DemoButton label={label} onPress={onPress} tone={tone} style={style} />;
}
