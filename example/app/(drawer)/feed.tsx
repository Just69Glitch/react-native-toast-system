import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { toast } from "react-native-toast-system";
import { ThemedText } from "@/components/themed-text";
import { useThemeColor } from "@/hooks/use-theme-color";
import {
  DrawerActionButton,
  DrawerPlaygroundScreen,
  DrawerScenarioCard,
} from "@/features/drawer/components";

export default function FeedScreen() {
  const router = useRouter();
  const heroBackground = useThemeColor(
    { light: "#eef6ff", dark: "#0f1d2f" },
    "background",
  );
  const heroBorder = useThemeColor(
    { light: "#bfdbfe", dark: "#1d4ed8" },
    "icon",
  );
  const heroTitle = useThemeColor(
    { light: "#0f172a", dark: "#e2e8f0" },
    "text",
  );
  const heroHint = useThemeColor({ light: "#1e3a8a", dark: "#93c5fd" }, "icon");

  return (
    <DrawerPlaygroundScreen
      title="Toast Playground"
      hint="A landing-style control center for every demo scenario and runtime probe."
    >
      <View
        style={[
          styles.heroCard,
          {
            backgroundColor: heroBackground,
            borderColor: heroBorder,
          },
        ]}
      >
        <ThemedText style={[styles.heroTitle, { color: heroTitle }]}>
          Explore React Native Toast System
        </ThemedText>
        <ThemedText style={[styles.heroHint, { color: heroHint }]}>
          Validate behavior, interaction models, host isolation, and runtime
          edge cases from one place.
        </ThemedText>
        <View style={styles.heroActions}>
          <DrawerActionButton
            label="Run welcome toast"
            onPress={() => {
              toast.show({
                title: "Playground ready",
                description: "All core wiring is active.",
                variant: "success",
              });
            }}
          />
          <DrawerActionButton
            label="useToast: success"
            tone="neutral"
            onPress={() => {
              toast.success({
                title: "Saved",
                description: "Local controller fired a success toast.",
              });
            }}
          />
          <DrawerActionButton
            label="toast: info"
            tone="neutral"
            onPress={() => {
              toast.info({
                title: "Heads up",
                description: "Global API fired an informational toast.",
              });
            }}
          />
          <DrawerActionButton
            label="Open diagnostics"
            tone="neutral"
            onPress={() => {
              router.push("/diagnostics");
            }}
          />
        </View>
      </View>

      <DrawerScenarioCard title="Scenario Routes">
        <View style={styles.grid}>
          <DrawerActionButton
            label="Basics"
            tone="neutral"
            style={styles.gridButton}
            onPress={() => router.push("/minimal")}
          />
          <DrawerActionButton
            label="Variants"
            tone="neutral"
            style={styles.gridButton}
            onPress={() => router.push("/variants")}
          />
          <DrawerActionButton
            label="Templates"
            tone="neutral"
            style={styles.gridButton}
            onPress={() => router.push("/templates")}
          />
          <DrawerActionButton
            label="APIs"
            tone="neutral"
            style={styles.gridButton}
            onPress={() => router.push("/api")}
          />
          <DrawerActionButton
            label="Hosts"
            tone="neutral"
            style={styles.gridButton}
            onPress={() => router.push("/hosts")}
          />
          <DrawerActionButton
            label="Grouping"
            tone="neutral"
            style={styles.gridButton}
            onPress={() => router.push("/grouping")}
          />
          <DrawerActionButton
            label="Priority"
            tone="neutral"
            style={styles.gridButton}
            onPress={() => router.push("/priority")}
          />
          <DrawerActionButton
            label="Stress"
            tone="neutral"
            style={styles.gridButton}
            onPress={() => router.push("/stress")}
          />
        </View>
      </DrawerScenarioCard>

      <DrawerScenarioCard title="Live Quick Checks">
        <DrawerActionButton
          label="RTL quick check"
          tone="neutral"
          onPress={() => {
            toast.host("secondary-host/nested/rtl").show({
              title: "Direction check",
              description:
                "Use this toast to validate direction and alignment behavior.",
              variant: "info",
            });
          }}
        />
        <DrawerActionButton
          label="Secondary host smoke"
          onPress={() => {
            toast.host("secondary-host").show({
              title: "Secondary host smoke",
              description: "Mounted from drawer layout and routed correctly.",
              variant: "success",
            });
          }}
        />
        <DrawerActionButton
          label="Nested host smoke"
          tone="neutral"
          onPress={() => {
            toast.host("secondary-host/nested").show({
              title: "Nested host smoke",
              description: "Nested route host is mounted and visible.",
              variant: "info",
            });
          }}
        />
        <DrawerActionButton
          label="Classic host smoke"
          tone="neutral"
          onPress={() => {
            toast.host("classic-host").show({
              title: "Classic host smoke",
              description: "Classic interaction mode is mounted and visible.",
              template: "compact",
            });
          }}
        />
        <DrawerActionButton
          label="Persistent toast + open APIs"
          tone="neutral"
          onPress={() => {
            toast.show({
              title: "Cross-route persistence",
              description: "This should survive route changes while visible.",
              duration: "persistent",
            });
            router.push("/api");
          }}
        />
      </DrawerScenarioCard>
    </DrawerPlaygroundScreen>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 14,
    padding: 14,
    gap: 10,
  },
  heroTitle: {
    fontSize: 21,
    lineHeight: 28,
    fontWeight: "800",
  },
  heroHint: {
    fontSize: 14,
    lineHeight: 20,
  },
  heroActions: {
    gap: 8,
    marginTop: 4,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  gridButton: {
    minWidth: 130,
    flexGrow: 1,
  },
});
