import { toast } from "react-native-toast-system";
import {
  DrawerActionButton,
  DrawerPlaygroundScreen,
  DrawerScenarioCard,
} from "@/features/drawer/components";
import { useDrawerPlaygroundHelpers } from "@/features/drawer/hooks";

export default function PriorityScreen() {
  const { rememberToast } = useDrawerPlaygroundHelpers();

  return (
    <DrawerPlaygroundScreen
      title="Priority"
      hint="Priority ordering checks with mixed values in a burst."
    >
      <DrawerScenarioCard title="Priority Burst">
        <DrawerActionButton
          label="Priority burst (mixed)"
          tone="danger"
          onPress={() => {
            const priorities = [
              { label: "low", value: -2, variant: "info" as const },
              { label: "normal", value: 0, variant: "default" as const },
              { label: "high", value: 3, variant: "success" as const },
            ];

            priorities.forEach((entry, index) => {
              const id = toast.show({
                title: `Priority ${entry.label}`,
                description: `priority=${entry.value}`,
                priority: entry.value,
                variant: entry.variant,
                dedupeKey: `priority-${index}-${Date.now()}`,
              });
              if (index === priorities.length - 1) {
                rememberToast(id);
              }
            });
          }}
        />
      </DrawerScenarioCard>
    </DrawerPlaygroundScreen>
  );
}
