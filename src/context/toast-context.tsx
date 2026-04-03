import { createContext, useContext, useSyncExternalStore } from "react";
import type { ToastStateSnapshot, ToastTemplateRegistry } from "../types/internal";
import { ToastStore } from "../core/store";

export type ToastContextValue = {
  store: ToastStore;
  defaultHostId: string;
  templates: ToastTemplateRegistry;
};

export const ToastContext = createContext<ToastContextValue | null>(null);

export function useToastStoreSnapshot(): ToastStateSnapshot {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("Toast hooks must be used inside ToastProvider");
  }

  return useSyncExternalStore(context.store.subscribe.bind(context.store), context.store.getSnapshot);
}

export function useToastContext(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("Toast hooks must be used inside ToastProvider");
  }
  return context;
}

