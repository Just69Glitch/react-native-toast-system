import { DEFAULT_HOST_ID } from "../constants/toast-constants";
import { warnBridgeMissing } from "./dx-warnings";
import type {
  CloseReason,
  ToastController,
  ToastId,
  ToastOptions,
  ToastPromiseOptions,
  ToastStoreBridge,
  ToastUpdateOptions,
} from "../types/internal";

let activeBridge: ToastStoreBridge | null = null;
let hasEverBoundBridge = false;

function getBridge(): ToastStoreBridge | null {
  return activeBridge;
}

function warnForMissingBridge(method: string, hostId?: string): void {
  warnBridgeMissing(method, hasEverBoundBridge ? "missing-provider" : "before-mount", hostId);
}

function showWithoutBridge(method: string, hostId?: string): ToastId {
  warnForMissingBridge(method, hostId);
  return `toast-missing-provider-${Date.now()}`;
}

export function bindToastBridge(bridge: ToastStoreBridge | null): void {
  activeBridge = bridge;
  if (bridge) {
    hasEverBoundBridge = true;
  }
}

export function unbindToastBridge(bridge: ToastStoreBridge): void {
  if (activeBridge === bridge) {
    activeBridge = null;
  }
}

export const toast: Omit<ToastController, "hostId"> & { host: (hostId: string) => ToastController } = {
  show(options: string | ToastOptions): ToastId {
    const bridge = getBridge();
    if (!bridge) {
      return showWithoutBridge("show");
    }
    return bridge.show(options);
  },
  success(options: string | ToastOptions): ToastId {
    const bridge = getBridge();
    if (!bridge) {
      return showWithoutBridge("success");
    }
    return bridge.createController().success(options);
  },
  error(options: string | ToastOptions): ToastId {
    const bridge = getBridge();
    if (!bridge) {
      return showWithoutBridge("error");
    }
    return bridge.createController().error(options);
  },
  warning(options: string | ToastOptions): ToastId {
    const bridge = getBridge();
    if (!bridge) {
      return showWithoutBridge("warning");
    }
    return bridge.createController().warning(options);
  },
  info(options: string | ToastOptions): ToastId {
    const bridge = getBridge();
    if (!bridge) {
      return showWithoutBridge("info");
    }
    return bridge.createController().info(options);
  },
  loading(options: string | ToastOptions): ToastId {
    const bridge = getBridge();
    if (!bridge) {
      return showWithoutBridge("loading");
    }
    return bridge.createController().loading(options);
  },
  promise<T>(
    promise: Promise<T>,
    options: ToastPromiseOptions<T>,
    commonOptions?: Partial<ToastOptions>
  ): Promise<T> {
    const bridge = getBridge();
    if (!bridge) {
      warnForMissingBridge("promise");
      return promise;
    }
    return bridge.createController().promise(promise, options, commonOptions);
  },
  update(id: ToastId, options: ToastUpdateOptions): boolean {
    const bridge = getBridge();
    if (!bridge) {
      warnForMissingBridge("update");
      return false;
    }
    return bridge.update(id, options);
  },
  dismiss(id: ToastId, reason: CloseReason = "dismiss"): boolean {
    const bridge = getBridge();
    if (!bridge) {
      warnForMissingBridge("dismiss");
      return false;
    }
    return bridge.dismiss(id, reason);
  },
  dismissAll(reason: CloseReason = "dismiss"): void {
    const bridge = getBridge();
    if (!bridge) {
      warnForMissingBridge("dismissAll");
      return;
    }
    bridge.dismissAll(undefined, reason);
  },
  dismissGroup(groupId: string, reason: CloseReason = "dismiss"): number {
    const bridge = getBridge();
    if (!bridge) {
      warnForMissingBridge("dismissGroup");
      return 0;
    }
    return bridge.dismissGroup(groupId, undefined, reason);
  },
  updateGroup(groupId: string, options: ToastUpdateOptions): number {
    const bridge = getBridge();
    if (!bridge) {
      warnForMissingBridge("updateGroup");
      return 0;
    }
    return bridge.updateGroup(groupId, options, undefined);
  },
  isVisible(id: ToastId): boolean {
    const bridge = getBridge();
    if (!bridge) {
      warnForMissingBridge("isVisible");
      return false;
    }
    return bridge.isVisible(id, undefined);
  },
  host(hostId: string): ToastController {
    const bridge = getBridge();
    if (!bridge) {
      return {
        hostId,
        show: () => showWithoutBridge("host.show", hostId),
        success: () => showWithoutBridge("host.success", hostId),
        error: () => showWithoutBridge("host.error", hostId),
        warning: () => showWithoutBridge("host.warning", hostId),
        info: () => showWithoutBridge("host.info", hostId),
        loading: () => showWithoutBridge("host.loading", hostId),
        promise: async <T>(promiseValue: Promise<T>) => {
          warnForMissingBridge("host.promise", hostId);
          return promiseValue;
        },
        update: () => {
          warnForMissingBridge("host.update", hostId);
          return false;
        },
        dismiss: () => {
          warnForMissingBridge("host.dismiss", hostId);
          return false;
        },
        dismissAll: () => {
          warnForMissingBridge("host.dismissAll", hostId);
          return undefined;
        },
        dismissGroup: () => {
          warnForMissingBridge("host.dismissGroup", hostId);
          return 0;
        },
        updateGroup: () => {
          warnForMissingBridge("host.updateGroup", hostId);
          return 0;
        },
        isVisible: () => {
          warnForMissingBridge("host.isVisible", hostId);
          return false;
        },
      };
    }

    return bridge.createController(hostId ?? DEFAULT_HOST_ID);
  },
};


