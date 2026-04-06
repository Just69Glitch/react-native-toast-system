import { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import {
  ToastNativeSurfaceBoundary,
  ToastViewport,
} from "react-native-toast-system/components";
import { toast } from "react-native-toast-system/utils";
import {
  DrawerActionButton,
  DrawerPlaygroundScreen,
  DrawerScenarioCard,
} from "@/features/drawer/components";
import { useDrawerPlaygroundHelpers } from "@/features/drawer/hooks";
import { drawerStyles } from "@/features/drawer/shared/drawer-styles";
import { useAppPreferences } from "@/hooks/use-app-preferences";

export default function HostsScreen() {
  const { secondaryToast, classicToast } = useDrawerPlaygroundHelpers();
  const preferences = useAppPreferences();
  const toastTheme = preferences?.themeMode ?? "auto";
  const toastDirection = preferences?.toastDirection ?? "auto";
  const [modalVisible, setModalVisible] = useState(false);
  const [sheetVisible, setSheetVisible] = useState(false);
  return (
    <DrawerPlaygroundScreen
      title="Hosts"
      hint="Host targeting and host-specific isolation checks, including modal and container overlays."
    >
      <DrawerScenarioCard title="Host Targeting + Isolation Modes">
        <DrawerActionButton
          label="Host: secondary-host"
          onPress={() => {
            secondaryToast.show({
              title: "Secondary host",
              description: "Targeted via useToast(hostId).",
            });
          }}
        />
        <DrawerActionButton
          label="Host: secondary-host/nested"
          tone="neutral"
          onPress={() => {
            toast.host("secondary-host/nested").show({
              title: "Nested host",
              description: "Routed to nested viewport.",
              variant: "info",
            });
          }}
        />
        <DrawerActionButton
          label="Host: classic-host"
          tone="neutral"
          onPress={() => {
            classicToast.show({
              title: "Classic host",
              description: "Verifies classic interaction mode host.",
              template: "compact",
            });
          }}
        />
      </DrawerScenarioCard>

      <DrawerScenarioCard title="Modal + Sheet Containers">
        <DrawerActionButton
          label={modalVisible ? "Hide modal" : "Open modal"}
          onPress={() => {
            setModalVisible((current) => !current);
          }}
        />
        <DrawerActionButton
          label={sheetVisible ? "Hide sheet" : "Open sheet"}
          tone="neutral"
          onPress={() => {
            setSheetVisible((current) => !current);
          }}
        />
      </DrawerScenarioCard>

      <Modal
        animationType="fade"
        transparent
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
        }}
      >
        <ToastNativeSurfaceBoundary>
          <View style={hostsStyles.modalBackdrop}>
            <View style={hostsStyles.modalCard}>
              <View style={hostsStyles.surfaceHeaderRow}>
                <Text style={hostsStyles.surfaceTitle}>Checkout Modal</Text>
                <View style={hostsStyles.surfaceBadge}>
                  <Text style={hostsStyles.surfaceBadgeText}>Modal Host</Text>
                </View>
              </View>
              <View style={hostsStyles.surfaceDivider} />
              <View style={hostsStyles.skeletonLineLong} />
              <View style={hostsStyles.skeletonLineMedium} />
              <View style={hostsStyles.skeletonLineShort} />
              <View style={hostsStyles.surfaceRow}>
                <View style={hostsStyles.skeletonPill} />
                <View style={hostsStyles.skeletonPill} />
                <View style={hostsStyles.skeletonPillNarrow} />
              </View>
              <View style={hostsStyles.surfaceDivider} />
              <Text style={[drawerStyles.sectionHint, { color: "#94a3b8" }]}>
                Trigger modal-scoped toasts from inside this layer.
              </Text>
              <DrawerActionButton
                label="Trigger modal host toast"
                onPress={() => {
                  toast.host("modal-host").show({
                    title: "Modal scoped",
                    description: "Dispatched while modal is open.",
                    variant: "success",
                  });
                }}
              />
              <DrawerActionButton
                label="Close modal"
                tone="neutral"
                onPress={() => {
                  setModalVisible(false);
                }}
              />
              <ToastViewport
                hostId="modal-host"
                config={{
                  preset: "status",
                  position: "top",
                  theme: toastTheme,
                  direction: toastDirection,
                }}
              />
            </View>
          </View>
        </ToastNativeSurfaceBoundary>
      </Modal>

      <Modal
        animationType="fade"
        transparent
        visible={sheetVisible}
        onRequestClose={() => {
          setSheetVisible(false);
        }}
      >
        <ToastNativeSurfaceBoundary>
          <View style={hostsStyles.sheetContainer}>
            <Pressable
              style={hostsStyles.sheetBackdrop}
              onPress={() => {
                setSheetVisible(false);
              }}
            />
            <View style={hostsStyles.sheetCard}>
              <View style={hostsStyles.surfaceHandle} />
              <View style={hostsStyles.surfaceHeaderRow}>
                <Text style={hostsStyles.surfaceTitle}>
                  Bottom Sheet Scenario
                </Text>
                <View style={hostsStyles.surfaceBadge}>
                  <Text style={hostsStyles.surfaceBadgeText}>Sheet Host</Text>
                </View>
              </View>
              <View style={hostsStyles.surfaceDivider} />
              <View style={hostsStyles.skeletonLineLong} />
              <View style={hostsStyles.skeletonLineMedium} />
              <View style={hostsStyles.skeletonLineShort} />
              <View style={hostsStyles.surfaceRow}>
                <View style={hostsStyles.skeletonPill} />
                <View style={hostsStyles.skeletonPill} />
                <View style={hostsStyles.skeletonPillNarrow} />
              </View>
              <View style={hostsStyles.surfaceDivider} />
              <Text style={[drawerStyles.sectionHint, { color: "#94a3b8" }]}>
                Represents a bottom-sheet-like container with its own host.
              </Text>
              <DrawerActionButton
                label="Trigger sheet host toast"
                onPress={() => {
                  toast.host("sheet-host").show({
                    title: "Sheet scoped",
                    description: "Attached to sheet host viewport.",
                    variant: "warning",
                  });
                }}
              />
              <DrawerActionButton
                label="Close sheet"
                tone="neutral"
                onPress={() => {
                  setSheetVisible(false);
                }}
              />
              <ToastViewport
                hostId="sheet-host"
                config={{
                  preset: "minimal",
                  position: "top",
                  theme: toastTheme,
                  direction: toastDirection,
                }}
              />
            </View>
          </View>
        </ToastNativeSurfaceBoundary>
      </Modal>
    </DrawerPlaygroundScreen>
  );
}

const hostsStyles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(2,6,23,0.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalCard: {
    width: "100%",
    maxWidth: 360,
    minHeight: 300,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#475569",
    backgroundColor: "#111827",
    padding: 14,
    gap: 10,
  },
  sheetContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    alignItems: "stretch",
  },
  sheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(2,6,23,0.55)",
  },
  sheetCard: {
    minHeight: 360,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderWidth: 1,
    borderColor: "#475569",
    backgroundColor: "#0f172a",
    padding: 14,
    gap: 10,
  },
  surfaceHandle: {
    alignSelf: "center",
    width: 54,
    height: 4,
    borderRadius: 999,
    backgroundColor: "#64748b",
    opacity: 0.9,
    marginBottom: 2,
  },
  surfaceHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  surfaceBadge: {
    backgroundColor: "#172554",
    borderColor: "#1d4ed8",
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  surfaceBadgeText: {
    color: "#bfdbfe",
    fontSize: 11,
    fontWeight: "700",
  },
  surfaceTitle: {
    color: "#e2e8f0",
    fontSize: 14,
    fontWeight: "700",
  },
  surfaceDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#334155",
    opacity: 0.9,
  },
  skeletonLineLong: {
    height: 10,
    width: "88%",
    borderRadius: 8,
    backgroundColor: "#334155",
  },
  skeletonLineMedium: {
    height: 10,
    width: "68%",
    borderRadius: 8,
    backgroundColor: "#3b4a61",
  },
  skeletonLineShort: {
    height: 9,
    width: "52%",
    borderRadius: 8,
    backgroundColor: "#2f3d53",
  },
  surfaceRow: {
    flexDirection: "row",
    gap: 8,
  },
  skeletonPill: {
    height: 26,
    flex: 1,
    borderRadius: 999,
    backgroundColor: "#263247",
  },
  skeletonPillNarrow: {
    height: 26,
    width: 56,
    borderRadius: 999,
    backgroundColor: "#334155",
  },
  skeletonButtonGhost: {
    height: 34,
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#475569",
    backgroundColor: "rgba(51,65,85,0.15)",
  },
  skeletonButtonPrimary: {
    height: 34,
    flex: 1,
    borderRadius: 10,
    backgroundColor: "#1d4ed8",
    opacity: 0.85,
  },
});
