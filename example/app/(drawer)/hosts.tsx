import { useState } from "react";
import { Modal, StyleSheet, Text, View } from "react-native";
import {
  ToastNativeSurfaceBoundary,
  ToastViewport,
  toast,
} from "react-native-toast-system";
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
        <DrawerActionButton
          label="Toast in modal host"
          onPress={() => {
            setModalVisible(true);
            toast.host("modal-host").show({
              title: "Modal host toast",
              description: "Validates modal-local overlay handling.",
            });
          }}
        />
        <DrawerActionButton
          label="Toast in sheet host"
          onPress={() => {
            setSheetVisible(true);
            toast.host("sheet-host").show({
              title: "Sheet host toast",
              description: "Validates in-container toast rendering.",
            });
          }}
        />
      </DrawerScenarioCard>

      <Modal
        animationType="slide"
        transparent
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
        }}
      >
        <ToastNativeSurfaceBoundary>
          <View style={drawerStyles.modalBackdrop}>
            <View style={drawerStyles.modalCard}>
              <Text style={drawerStyles.modalTitle}>Modal Scenario</Text>
              <Text style={drawerStyles.sectionHint}>
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
                  position: "bottom",
                  theme: toastTheme,
                  direction: toastDirection,
                }}
              />
            </View>
          </View>
        </ToastNativeSurfaceBoundary>
      </Modal>

      {sheetVisible ? (
        <View
          pointerEvents="box-none"
          style={[StyleSheet.absoluteFill, drawerStyles.sheetOverlay]}
        >
          <View style={drawerStyles.sheetCard}>
            <Text style={drawerStyles.modalTitle}>
              Sheet Container Scenario
            </Text>
            <Text style={drawerStyles.sectionHint}>
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
                position: "bottom",
                theme: toastTheme,
                direction: toastDirection,
              }}
            />
          </View>
        </View>
      ) : null}
    </DrawerPlaygroundScreen>
  );
}
