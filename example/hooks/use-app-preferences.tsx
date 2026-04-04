import {
  createContext,
  type PropsWithChildren,
  useContext,
  useMemo,
  useState,
} from "react";
import type { ToastDirection } from "react-native-toast-system/types";
import { useColorScheme as useRNColorScheme } from "react-native";

export type ThemeMode = "auto" | "light" | "dark";

type AppPreferencesValue = {
  themeMode: ThemeMode;
  toastDirection: ToastDirection;
  effectiveColorScheme: "light" | "dark";
  setThemeMode: (mode: ThemeMode) => void;
  setToastDirection: (mode: ToastDirection) => void;
};

const AppPreferencesContext = createContext<AppPreferencesValue | null>(null);

export function AppPreferencesProvider({ children }: PropsWithChildren) {
  const systemColorScheme = useRNColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>("auto");
  const [toastDirection, setToastDirectionState] =
    useState<ToastDirection>("auto");

  const effectiveColorScheme =
    themeMode === "auto" ? (systemColorScheme ?? "light") : themeMode;

  const value = useMemo<AppPreferencesValue>(
    () => ({
      themeMode,
      toastDirection,
      effectiveColorScheme,
      setThemeMode,
      setToastDirection: setToastDirectionState,
    }),
    [effectiveColorScheme, themeMode, toastDirection],
  );

  return (
    <AppPreferencesContext.Provider value={value}>
      {children}
    </AppPreferencesContext.Provider>
  );
}

export function useAppPreferences() {
  return useContext(AppPreferencesContext);
}
