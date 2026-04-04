import { useRouter } from "expo-router";
import { useState } from "react";
import { TextInput, View } from "react-native";
import { toast } from "react-native-toast-system/utils";
import { ThemedText } from "@/components/themed-text";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAppPreferences } from "@/hooks/use-app-preferences";
import { useThemeColor } from "@/hooks/use-theme-color";
import {
  DrawerActionButton,
  DrawerPlaygroundScreen,
  DrawerScenarioCard,
} from "@/features/drawer/components";
import { useDrawerPlaygroundHelpers } from "@/features/drawer/hooks";
import { drawerStyles } from "@/features/drawer/shared/drawer-styles";

export default function DiagnosticsScreen() {
  const router = useRouter();
  const theme = useColorScheme() ?? "light";
  const { rememberToast, runSuccessPromise, runFailurePromise } =
    useDrawerPlaygroundHelpers();
  const preferences = useAppPreferences();
  const toastDirection = preferences?.toastDirection ?? "auto";
  const [inputValue, setInputValue] = useState("");
  const metaTextColor = useThemeColor({ light: "#334155", dark: "#cbd5e1" }, "icon");
  const inputBackground = useThemeColor({ light: "#ffffff", dark: "#0f172a" }, "background");
  const inputBorder = useThemeColor({ light: "#94a3b8", dark: "#475569" }, "icon");
  const inputText = useThemeColor({ light: "#111827", dark: "#f8fafc" }, "text");
  const inputPlaceholder = useThemeColor(
    { light: "#64748b", dark: "#94a3b8" },
    "icon",
  );

  return (
    <DrawerPlaygroundScreen
      title="Diagnostics"
      hint="Gesture, keyboard, route persistence, theme/RTL, and promise lifecycle probes."
    >
      <DrawerScenarioCard title="Gesture + Keyboard">
        <DrawerActionButton
          label="Gesture-heavy toast"
          onPress={() => {
            rememberToast(
              toast.show({
                title: "Swipe / drag me",
                description: "Use drag + swipe to validate gesture behavior.",
                pauseOnDrag: true,
                dismissible: true,
                gesture: {
                  enabled: true,
                  dismissThreshold: 42,
                  cancelThreshold: 10,
                  velocityThreshold: 800,
                },
              }),
            );
          }}
        />
        <TextInput
          style={[
            drawerStyles.input,
            {
              backgroundColor: inputBackground,
              borderColor: inputBorder,
              color: inputText,
            },
          ]}
          value={inputValue}
          onChangeText={setInputValue}
          placeholder="Type and trigger a keyboard-avoid toast"
          placeholderTextColor={inputPlaceholder}
        />
        <DrawerActionButton
          label="Show keyboard-aware bottom toast"
          tone="neutral"
          onPress={() => {
            rememberToast(
              toast.show({
                title: "Keyboard overlap check",
                description: inputValue || "No input provided",
                position: "bottom",
                keyboardAvoidance: true,
                keyboardOffset: 8,
              }),
            );
          }}
        />
      </DrawerScenarioCard>

      <DrawerScenarioCard title="Navigation Persistence + Theme + RTL + Promise">
        <ThemedText style={[drawerStyles.metaText, { color: metaTextColor }]}>
          Current route: diagnostics
        </ThemedText>
        <View style={drawerStyles.inlineRow}>
          <DrawerActionButton
            label="Go feed"
            tone="neutral"
            onPress={() => {
              router.replace("/feed" as never);
            }}
          />
          <DrawerActionButton
            label="Go diagnostics"
            tone="neutral"
            onPress={() => {
              router.replace("/diagnostics");
            }}
          />
        </View>
        <DrawerActionButton
          label="Persistent toast before route switch"
          onPress={() => {
            rememberToast(
              toast.show({
                title: "Persistence probe",
                description:
                  "Switch route to verify toast survives route transitions.",
                duration: "persistent",
              }),
            );
            router.replace("/feed" as never);
          }}
        />
        <DrawerActionButton
          label={`Theme check (${theme})`}
          tone="neutral"
          onPress={() => {
            rememberToast(
              toast.show({
                title: "Theme probe",
                description: `Provider theme is currently '${theme}'.`,
              }),
            );
          }}
        />
        <DrawerActionButton
          label={`RTL probe (toast direction: ${toastDirection})`}
          tone="neutral"
          onPress={() => {
            rememberToast(
              toast.host("secondary-host/nested").show({
                title: "RTL check",
                description:
                  "Use manual protocol for full RTL restart validation.",
                variant: "info",
              }),
              "secondary-host/nested",
            );
          }}
        />
        <DrawerActionButton
          label="Arabic toast (default host)"
          tone="neutral"
          onPress={() => {
            rememberToast(
              toast.show({
                title: "تنبيه عربي",
                description:
                  "هذا مثال مباشر للتحقق من اتجاه المحتوى ومحاذاة النص داخل الإشعار.",
                variant: "success",
              }),
            );
          }}
        />
        <DrawerActionButton
          label="Arabic toast (nested host)"
          tone="neutral"
          onPress={() => {
            rememberToast(
              toast.host("secondary-host/nested").show({
                title: "اختبار المضيف المتداخل",
                description:
                  "يجب أن يظهر هذا الإشعار العربي مع اتجاه RTL حسب إعداداتك.",
                variant: "info",
              }),
              "secondary-host/nested",
            );
          }}
        />
        <DrawerActionButton
          label="Mixed Arabic + English"
          tone="neutral"
          onPress={() => {
            rememberToast(
              toast.show({
                title: "Order #123 تم تحديثه",
                description: "Tap to review from the activity timeline.",
                variant: "warning",
              }),
            );
          }}
        />
        <DrawerActionButton label="Promise success" onPress={runSuccessPromise} />
        <DrawerActionButton
          label="Promise error"
          tone="danger"
          onPress={runFailurePromise}
        />
      </DrawerScenarioCard>
    </DrawerPlaygroundScreen>
  );
}
