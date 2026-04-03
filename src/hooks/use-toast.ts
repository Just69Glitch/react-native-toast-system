import { useMemo } from "react";
import type { ToastController } from "../types";
import { useToastContext } from "../context";

export function useToast(hostId?: string): ToastController {
  const context = useToastContext();

  return useMemo(() => {
    return context.store.createController(hostId ?? context.defaultHostId);
  }, [context.defaultHostId, context.store, hostId]);
}
