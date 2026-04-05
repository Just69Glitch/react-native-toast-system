type ToastDevGlobals = {
  __DEV__?: boolean;
};

type MissingBridgeReason = "missing-provider" | "before-mount";

const warnedKeys = new Set<string>();

function isDevRuntime(): boolean {
  return (globalThis as ToastDevGlobals).__DEV__ !== false;
}

function warnOnce(key: string, message: string): void {
  if (!isDevRuntime() || warnedKeys.has(key)) {
    return;
  }

  warnedKeys.add(key);
  try {
    console.warn(`[react-native-toast-system][dx:${key}] ${message}`);
  } catch {
    // no-op
  }
}

export function warnBridgeMissing(
  method: string,
  reason: MissingBridgeReason,
  hostId?: string,
): void {
  const hostHint = hostId ? ` (hostId="${hostId}")` : "";
  if (reason === "before-mount") {
    warnOnce(
      `${reason}:${method}:${hostId ?? "default"}`,
      `toast.${method}() was called before <ToastProvider> mounted${hostHint}. Mount <ToastProvider> near app root and ensure calls run after initial render.`,
    );
    return;
  }

  warnOnce(
    `${reason}:${method}:${hostId ?? "default"}`,
    `toast.${method}() was called without an active ToastProvider${hostHint}. Ensure <ToastProvider> is mounted and not conditionally unmounted.`,
  );
}

export function warnHostAutoCreated(hostId: string): void {
  warnOnce(
    `host-auto-created:${hostId}`,
    `Toast host "${hostId}" was auto-created in store state without an explicit mounted host. Add <ToastHost hostId="${hostId}" /> (or <ToastViewport hostId="${hostId}" />) where you want it rendered.`,
  );
}

export function warnDedupeCollision(params: {
  hostId: string;
  dedupeMode: string;
  targetId: string;
  dedupeKey?: string;
  explicitId?: string;
}): void {
  const keyPart = params.dedupeKey
    ? `dedupeKey="${params.dedupeKey}"`
    : params.explicitId
      ? `id="${params.explicitId}"`
      : "identity";

  warnOnce(
    `dedupe-collision:${params.hostId}:${params.dedupeMode}:${keyPart}`,
    `Duplicate toast detected on host "${params.hostId}" using ${keyPart}; applying dedupeMode="${params.dedupeMode}" against target "${params.targetId}".`,
  );
}
