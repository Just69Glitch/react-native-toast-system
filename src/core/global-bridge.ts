import { DEFAULT_HOST_ID } from "../constants/toast-constants";
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

function getBridge(): ToastStoreBridge | null {
  return activeBridge;
}

function showWithoutBridge(): ToastId {
  return `toast-missing-provider-${Date.now()}`;
}

export function bindToastBridge(bridge: ToastStoreBridge | null): void {
  activeBridge = bridge;
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
      return showWithoutBridge();
    }
    return bridge.show(options);
  },
  success(options: string | ToastOptions): ToastId {
    const bridge = getBridge();
    if (!bridge) {
      return showWithoutBridge();
    }
    return bridge.createController().success(options);
  },
  error(options: string | ToastOptions): ToastId {
    const bridge = getBridge();
    if (!bridge) {
      return showWithoutBridge();
    }
    return bridge.createController().error(options);
  },
  warning(options: string | ToastOptions): ToastId {
    const bridge = getBridge();
    if (!bridge) {
      return showWithoutBridge();
    }
    return bridge.createController().warning(options);
  },
  info(options: string | ToastOptions): ToastId {
    const bridge = getBridge();
    if (!bridge) {
      return showWithoutBridge();
    }
    return bridge.createController().info(options);
  },
  loading(options: string | ToastOptions): ToastId {
    const bridge = getBridge();
    if (!bridge) {
      return showWithoutBridge();
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
      return promise;
    }
    return bridge.createController().promise(promise, options, commonOptions);
  },
  update(id: ToastId, options: ToastUpdateOptions): boolean {
    const bridge = getBridge();
    if (!bridge) {
      return false;
    }
    return bridge.update(id, options);
  },
  dismiss(id: ToastId, reason: CloseReason = "dismiss"): boolean {
    const bridge = getBridge();
    if (!bridge) {
      return false;
    }
    return bridge.dismiss(id, reason);
  },
  dismissAll(reason: CloseReason = "dismiss"): void {
    const bridge = getBridge();
    if (!bridge) {
      return;
    }
    bridge.dismissAll(undefined, reason);
  },
  dismissGroup(groupId: string, reason: CloseReason = "dismiss"): number {
    const bridge = getBridge();
    if (!bridge) {
      return 0;
    }
    return bridge.dismissGroup(groupId, undefined, reason);
  },
  updateGroup(groupId: string, options: ToastUpdateOptions): number {
    const bridge = getBridge();
    if (!bridge) {
      return 0;
    }
    return bridge.updateGroup(groupId, options, undefined);
  },
  isVisible(id: ToastId): boolean {
    const bridge = getBridge();
    if (!bridge) {
      return false;
    }
    return bridge.isVisible(id, undefined);
  },
  host(hostId: string): ToastController {
    const bridge = getBridge();
    if (!bridge) {
      return {
        hostId,
        show: () => showWithoutBridge(),
        success: () => showWithoutBridge(),
        error: () => showWithoutBridge(),
        warning: () => showWithoutBridge(),
        info: () => showWithoutBridge(),
        loading: () => showWithoutBridge(),
        promise: async <T>(promiseValue: Promise<T>) => promiseValue,
        update: () => false,
        dismiss: () => false,
        dismissAll: () => undefined,
        dismissGroup: () => 0,
        updateGroup: () => 0,
        isVisible: () => false,
      };
    }

    return bridge.createController(hostId ?? DEFAULT_HOST_ID);
  },
};


