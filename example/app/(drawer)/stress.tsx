import { toast } from "react-native-toast-system/utils";
import {
  DrawerActionButton,
  DrawerPlaygroundScreen,
  DrawerScenarioCard,
} from "@/features/drawer/components";
import { useDrawerPlaygroundHelpers } from "@/features/drawer/hooks";

export default function StressScreen() {
  const { rememberToast } = useDrawerPlaygroundHelpers();

  return (
    <DrawerPlaygroundScreen
      title="Stress"
      hint="Burst and stacking scenarios for overflow and ordering checks."
    >
      <DrawerScenarioCard title="Stacking + Stress">
        <DrawerActionButton
          label="Show stacked burst (6)"
          onPress={() => {
            for (let index = 1; index <= 6; index += 1) {
              const id = toast.show({
                title: `Stacked toast ${index}`,
                description: "Used to verify ordering and overflow behavior.",
              });
              if (index === 6) {
                rememberToast(id);
              }
            }
          }}
        />
        <DrawerActionButton
          label="Stress burst (24)"
          tone="danger"
          onPress={() => {
            for (let index = 1; index <= 24; index += 1) {
              const priority = index % 3 === 0 ? 1 : 0;
              const id = toast.show({
                title: `Burst #${index} priority #${priority}`,
                dedupeKey: `burst-${index} priority #${priority}`,
                priority,
              });
              if (index === 24) {
                rememberToast(id);
              }
            }
          }}
        />
      </DrawerScenarioCard>
    </DrawerPlaygroundScreen>
  );
}
