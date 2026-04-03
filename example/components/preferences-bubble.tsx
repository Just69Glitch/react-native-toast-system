import Ionicons from "@expo/vector-icons/Ionicons";
import { type ReactNode, useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { ToastDirection } from "react-native-toast-system";
import { useAppPreferences, type ThemeMode } from "@/hooks/use-app-preferences";
import { useThemeColor } from "@/hooks/use-theme-color";

function PreferenceOption({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const activeBackground = useThemeColor(
    { light: "#0f172a", dark: "#0ea5e9" },
    "tint",
  );
  const inactiveBackground = useThemeColor(
    { light: "#e2e8f0", dark: "#334155" },
    "icon",
  );
  const activeText = useThemeColor(
    { light: "#ffffff", dark: "#f8fafc" },
    "background",
  );
  const inactiveText = useThemeColor(
    { light: "#1e293b", dark: "#dbeafe" },
    "text",
  );

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.optionButton,
        { backgroundColor: active ? activeBackground : inactiveBackground },
      ]}
    >
      <Text
        style={[
          styles.optionText,
          { color: active ? activeText : inactiveText },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function PreferenceGroup({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const headingColor = useThemeColor(
    { light: "#334155", dark: "#cbd5e1" },
    "icon",
  );

  return (
    <View style={styles.group}>
      <Text style={[styles.groupTitle, { color: headingColor }]}>{title}</Text>
      <View style={styles.groupOptions}>{children}</View>
    </View>
  );
}

export function PreferencesBubble() {
  const preferences = useAppPreferences();
  const [open, setOpen] = useState(false);
  const insets = useSafeAreaInsets();

  if (!preferences) return null;

  const { themeMode, toastDirection, setThemeMode, setToastDirection } =
    preferences;

  const modalCardBackground = useThemeColor(
    { light: "#ffffff", dark: "#0f172a" },
    "background",
  );
  const modalCardBorder = useThemeColor(
    { light: "#cbd5e1", dark: "#334155" },
    "icon",
  );
  const modalTitleColor = useThemeColor({}, "text");
  const modalHintColor = useThemeColor(
    { light: "#475569", dark: "#94a3b8" },
    "icon",
  );
  const fabBackground = useThemeColor(
    { light: "#0f172a", dark: "#0ea5e9" },
    "tint",
  );
  const fabText = useThemeColor(
    { light: "#ffffff", dark: "#f8fafc" },
    "background",
  );

  const fabStyle = useMemo<ViewStyle>(
    () => ({
      bottom: Math.max(insets.bottom + 14, 22),
      right: 16,
      backgroundColor: fabBackground,
    }),
    [fabBackground, insets.bottom],
  );

  const modalBackdropStyle = useMemo<ViewStyle>(
    () => ({
      paddingBottom: Math.max(insets.bottom, 12),
    }),
    [insets.bottom],
  );

  const setTheme = (mode: ThemeMode) => {
    setThemeMode(mode);
  };

  const setDirection = (mode: ToastDirection) => {
    setToastDirection(mode);
  };

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open app preferences"
        onPress={() => setOpen(true)}
        style={[styles.fab, fabStyle]}
      >
        <Ionicons name="options" size={20} color={fabText} />
      </Pressable>

      <Modal
        transparent
        animationType="fade"
        visible={open}
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          style={[styles.backdrop, modalBackdropStyle]}
          onPress={() => setOpen(false)}
        >
          <Pressable
            onPress={(event) => event.stopPropagation()}
            style={[
              styles.modalCard,
              {
                backgroundColor: modalCardBackground,
                borderColor: modalCardBorder,
              },
            ]}
          >
            <Text style={[styles.modalTitle, { color: modalTitleColor }]}>
              App Preferences
            </Text>
            <Text style={[styles.modalHint, { color: modalHintColor }]}>
              Theme applies app-wide. Direction applies to toasts only.
            </Text>

            <PreferenceGroup title="Theme">
              <PreferenceOption
                label="Auto"
                active={themeMode === "auto"}
                onPress={() => setTheme("auto")}
              />
              <PreferenceOption
                label="Light"
                active={themeMode === "light"}
                onPress={() => setTheme("light")}
              />
              <PreferenceOption
                label="Dark"
                active={themeMode === "dark"}
                onPress={() => setTheme("dark")}
              />
            </PreferenceGroup>

            <PreferenceGroup title="Toast Direction">
              <PreferenceOption
                label="Auto"
                active={toastDirection === "auto"}
                onPress={() => setDirection("auto")}
              />
              <PreferenceOption
                label="LTR"
                active={toastDirection === "ltr"}
                onPress={() => setDirection("ltr")}
              />
              <PreferenceOption
                label="RTL"
                active={toastDirection === "rtl"}
                onPress={() => setDirection("rtl")}
              />
            </PreferenceGroup>

            <Pressable
              onPress={() => setOpen(false)}
              style={[styles.closeButton, { borderColor: modalCardBorder }]}
            >
              <Text
                style={[styles.closeButtonText, { color: modalTitleColor }]}
              >
                Done
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    minHeight: 44,
    minWidth: 72,
    paddingHorizontal: 14,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
    elevation: 8,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(2, 6, 23, 0.42)",
    justifyContent: "flex-end",
    paddingHorizontal: 14,
    paddingTop: 24,
  },
  modalCard: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    gap: 12,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  modalHint: {
    fontSize: 13,
    lineHeight: 18,
  },
  group: {
    gap: 8,
  },
  groupTitle: {
    fontSize: 13,
    fontWeight: "700",
  },
  groupOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  optionButton: {
    minHeight: 38,
    paddingHorizontal: 12,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  optionText: {
    fontSize: 12,
    fontWeight: "600",
  },
  closeButton: {
    minHeight: 40,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
  },
  closeButtonText: {
    fontSize: 13,
    fontWeight: "700",
  },
});
