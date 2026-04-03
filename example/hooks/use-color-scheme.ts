import { useColorScheme as useRNColorScheme } from "react-native";
import { useAppPreferences } from "./use-app-preferences";

export function useColorScheme() {
  const systemColorScheme = useRNColorScheme() ?? "light";
  const preferences = useAppPreferences();

  return preferences?.effectiveColorScheme ?? systemColorScheme;
}
