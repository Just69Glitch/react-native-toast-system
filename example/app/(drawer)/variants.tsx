import { toast } from "react-native-toast-system";
import {
  DrawerActionButton,
  DrawerPlaygroundScreen,
  DrawerScenarioCard,
} from "@/features/drawer/components";

export default function VariantsScreen() {
  return (
    <DrawerPlaygroundScreen
      title="Variants"
      hint="Variant-specific rendering and severity styling checks."
    >
      <DrawerScenarioCard title="Variant Coverage">
        <DrawerActionButton
          label="Success toast"
          onPress={() => {
            toast.success({
              title: "Success variant",
              description: "Basic success path.",
            });
          }}
        />
        <DrawerActionButton
          label="Error toast"
          tone="danger"
          onPress={() => {
            toast.error({
              title: "Error variant",
              description: "Basic error path.",
            });
          }}
        />
        <DrawerActionButton
          label="Warning toast"
          tone="neutral"
          onPress={() => {
            toast.warning({
              title: "Warning variant",
              description: "Warning visual style check.",
            });
          }}
        />
        <DrawerActionButton
          label="Loading toast"
          tone="neutral"
          onPress={() => {
            const id = toast.loading({
              title: "Loading variant",
              description: "Will auto-complete to success.",
              persistent: true,
            });

            setTimeout(() => {
              toast.update(id, {
                title: "Loading complete",
                description: "Updated in place.",
                variant: "success",
                persistent: false,
                duration: 1800,
              });
            }, 800);
          }}
        />
      </DrawerScenarioCard>
    </DrawerPlaygroundScreen>
  );
}
