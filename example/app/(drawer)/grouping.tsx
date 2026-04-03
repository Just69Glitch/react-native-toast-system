import { toast } from "react-native-toast-system";
import {
  DrawerActionButton,
  DrawerPlaygroundScreen,
  DrawerScenarioCard,
} from "@/features/drawer/components";
import { useDrawerPlaygroundHelpers } from "@/features/drawer/hooks";

export default function GroupingScreen() {
  const { rememberToast } = useDrawerPlaygroundHelpers();

  return (
    <DrawerPlaygroundScreen
      title="Grouping"
      hint="Group and dedupe behavior checks for real-world flow control."
    >
      <DrawerScenarioCard title="Grouping + Dedupe">
        <DrawerActionButton
          label="Grouped update flow"
          onPress={() => {
            const groupId = "playground-group-flow";
            const id = toast.show({
              title: "Grouped flow started",
              description: "groupBehavior=update-in-group",
              groupId,
              groupBehavior: "update-in-group",
              persistent: true,
            });
            rememberToast(id);

            setTimeout(() => {
              rememberToast(
                toast.show({
                  title: "Grouped flow complete",
                  description: "Updated in group",
                  groupId,
                  groupBehavior: "update-in-group",
                  variant: "success",
                  duration: 2200,
                }),
              );
            }, 850);
          }}
        />
        <DrawerActionButton
          label="Dedupe ignore"
          tone="neutral"
          onPress={() => {
            const firstId = toast.show({
              title: "Dedupe ignore #1",
              description: "Second emit should be ignored.",
              dedupeKey: "playground-dedupe-ignore",
              dedupeMode: "ignore",
            });
            rememberToast(firstId);

            toast.show({
              title: "Dedupe ignore #2",
              description: "Should be ignored by dedupe.",
              dedupeKey: "playground-dedupe-ignore",
              dedupeMode: "ignore",
            });
          }}
        />
        <DrawerActionButton
          label="Dedupe replace"
          tone="neutral"
          onPress={() => {
            toast.show({
              title: "Dedupe replace #1",
              dedupeKey: "playground-dedupe-replace",
              dedupeMode: "replace",
              variant: "info",
            });

            const replacedId = toast.show({
              title: "Dedupe replace #2",
              description: "Second emit replaces first.",
              dedupeKey: "playground-dedupe-replace",
              dedupeMode: "replace",
              variant: "warning",
            });
            rememberToast(replacedId);
          }}
        />
      </DrawerScenarioCard>
    </DrawerPlaygroundScreen>
  );
}
