import { toast } from "react-native-toast-system/utils";
import {
  DrawerActionButton,
  DrawerPlaygroundScreen,
  DrawerScenarioCard,
} from "@/features/drawer/components";

export default function TemplatesScreen() {
  return (
    <DrawerPlaygroundScreen
      title="Templates"
      hint="Template and positioning permutations used in parity coverage."
    >
      <DrawerScenarioCard title="Template + Positioning">
        <DrawerActionButton
          label="Banner template (top)"
          tone="neutral"
          onPress={() => {
            toast.show({
              title: "Banner template",
              description: "Uses banner layout on top.",
              template: "banner",
              position: "top",
            });
          }}
        />
        <DrawerActionButton
          label="Compact template (bottom)"
          tone="neutral"
          onPress={() => {
            toast.show({
              title: "Compact bottom",
              description: "Verifies bottom positioning.",
              template: "compact",
              position: "bottom",
            });
          }}
        />
        <DrawerActionButton
          label="Banner template (bottom)"
          tone="neutral"
          onPress={() => {
            toast.show({
              title: "Banner bottom",
              description: "Banner + bottom stacking check.",
              template: "banner",
              position: "bottom",
            });
          }}
        />
      </DrawerScenarioCard>
    </DrawerPlaygroundScreen>
  );
}
