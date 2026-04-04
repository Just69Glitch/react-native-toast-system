import { toast } from "react-native-toast-system/utils";
import {
  DrawerActionButton,
  DrawerPlaygroundScreen,
  DrawerScenarioCard,
} from "@/features/drawer/components";
import { useDrawerPlaygroundHelpers } from "@/features/drawer/hooks";

export default function APIScreen() {
  const {
    secondaryToast,
    lastToastMeta,
    rememberToast,
    resolveControllerForHost,
  } = useDrawerPlaygroundHelpers();

  return (
    <DrawerPlaygroundScreen
      title="APIs"
      hint="Programmatic controller flows: create, update, dismiss, dismissAll, and visibility checks."
    >
      <DrawerScenarioCard title="Controller APIs + Programmatic Flows">
        <DrawerActionButton
          label="Create tracked toast"
          onPress={() => {
            rememberToast(
              toast.show({
                title: "Tracked toast",
                description: "Used for follow-up API actions.",
              }),
            );
          }}
        />
        <DrawerActionButton
          label="Secondary loading -> update"
          onPress={() => {
            const id = secondaryToast.loading({
              title: "Secondary loading",
              description: "Will update in place.",
              persistent: true,
            });
            rememberToast(id, "secondary-host");

            setTimeout(() => {
              secondaryToast.update(id, {
                title: "Secondary done",
                description: "Programmatic update completed.",
                variant: "success",
                persistent: false,
                duration: 1800,
              });
            }, 900);
          }}
        />
        <DrawerActionButton
          label="Update last toast id"
          tone="neutral"
          onPress={() => {
            if (!lastToastMeta) {
              toast.warning({
                title: "No last toast",
                description: "Trigger a toast first.",
              });
              return;
            }

            const controller = resolveControllerForHost(lastToastMeta.hostId);
            controller.update(lastToastMeta.id, {
              title: "Updated by id",
              description: `host=${lastToastMeta.hostId}`,
              variant: "info",
              duration: 1800,
            });
          }}
        />
        <DrawerActionButton
          label="Dismiss last toast id"
          tone="neutral"
          onPress={() => {
            if (!lastToastMeta) {
              toast.warning({
                title: "No last toast",
                description: "Trigger a toast first.",
              });
              return;
            }

            const controller = resolveControllerForHost(lastToastMeta.hostId);
            controller.dismiss(lastToastMeta.id, "programmatic");
          }}
        />
        <DrawerActionButton
          label="Dismiss all: secondary-host"
          tone="danger"
          onPress={() => {
            secondaryToast.dismissAll("dismiss");
          }}
        />
        <DrawerActionButton
          label="Visibility check: last id"
          tone="neutral"
          onPress={() => {
            if (!lastToastMeta) {
              toast.warning({
                title: "No last toast",
                description: "Trigger a toast first.",
              });
              return;
            }

            const controller = resolveControllerForHost(lastToastMeta.hostId);
            const isVisible = controller.isVisible(lastToastMeta.id);
            rememberToast(
              toast.show({
                title: "Visibility check",
                description: `${lastToastMeta.id} visible=${String(isVisible)}`,
                duration: 2000,
              }),
            );
          }}
        />
      </DrawerScenarioCard>
    </DrawerPlaygroundScreen>
  );
}
