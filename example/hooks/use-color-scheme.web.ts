import { useEffect, useState } from "react";
import { useColorScheme as useRNColorScheme } from "react-native";
import { useAppPreferences } from "./use-app-preferences";

export function useColorScheme() {
  const preferences = useAppPreferences();
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  const colorScheme =
    preferences?.effectiveColorScheme ?? useRNColorScheme() ?? "light";

  if (hasHydrated) {
    return colorScheme;
  }

  return "light";
}
