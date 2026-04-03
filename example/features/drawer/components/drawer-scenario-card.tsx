import type { ReactNode } from "react";
import { ScenarioCard } from "@/components/scenario-card";

export function DrawerScenarioCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return <ScenarioCard title={title}>{children}</ScenarioCard>;
}
