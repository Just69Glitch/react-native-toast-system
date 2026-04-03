import type { ToastOptions, ToastRecord } from "../types/internal";

export type ToastDebugPayload = Record<string, unknown>;
export type ToastDebugLogger = (event: string, payload?: ToastDebugPayload) => void;

export function createToastDebugLogger(
  enabled: boolean,
  hostId: string,
  scope: "store" | "host" = "store",
): ToastDebugLogger {
  return (event, payload) => {
    if (!enabled) {
      return;
    }

    const prefix = `[toast][host:${hostId}][${scope}] ${event}`;
    if (!payload) {
      console.info(prefix);
      return;
    }

    try {
      console.info(prefix, payload);
    } catch {
      console.info(prefix);
    }
  };
}

export function getToastDebugMeta(
  value: Pick<ToastOptions, "id" | "variant" | "groupId" | "dedupeKey">,
): ToastDebugPayload {
  return {
    id: value.id,
    variant: value.variant,
    groupId: value.groupId,
    dedupeKey: value.dedupeKey,
  };
}

export function getToastRecordDebugMeta(
  value: Pick<ToastRecord, "id" | "variant" | "groupId" | "dedupeKey" | "hostId">,
): ToastDebugPayload {
  return {
    id: value.id,
    hostId: value.hostId,
    variant: value.variant,
    groupId: value.groupId,
    dedupeKey: value.dedupeKey,
  };
}


