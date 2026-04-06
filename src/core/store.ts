import { EXIT_FALLBACK_BUFFER_MS } from "../constants/toast-constants";
import {
  createToastDebugLogger,
  getToastDebugMeta,
  getToastRecordDebugMeta,
} from "./debug";
import { warnDedupeCollision, warnHostAutoCreated } from "./dx-warnings";
import type {
  CloseReason,
  ResolvedToastHostConfig,
  ToastClassicGestureConfig,
  ToastDeckGestureConfig,
  ToastInteractionMode,
  ToastGroupBehavior,
  ToastCallbackContext,
  ToastController,
  ToastHostConfig,
  ToastHostConfigChangeContext,
  ToastHostState,
  ToastId,
  ToastOptions,
  ToastPromiseOptions,
  ToastRecord,
  ToastStateSnapshot,
  ToastStoreBridge,
  ToastUpdateOptions,
  ToastVariant,
} from "../types/internal";
import {
  createToastId,
  isPromiseLike,
  mergeToastRecord,
  normalizeShowOptions,
  getChangedHostConfigKeys,
  resolveAnimationDuration,
  resolveHostConfig,
  resolveToastDuration,
  resolveToastVariant,
  toVariantOptions,
} from "../utils/toast-utils";

type Listener = () => void;
type TimerHandle = ReturnType<typeof setTimeout>;
type TimerState = {
  handle: TimerHandle;
  startedAt: number;
  remaining: number;
  paused: boolean;
  pauseCount: number;
};

type ToastLocation = {
  hostId: string;
  host: ToastHostState;
  index: number;
  toast: ToastRecord;
};

export class ToastStore implements ToastStoreBridge {
  private listeners = new Set<Listener>();

  private timers = new Map<string, TimerState>();

  private closeFallbackTimers = new Map<string, TimerHandle>();

  private closeStartFired = new Set<string>();

  private closeEndFired = new Set<string>();

  private closeReasonByKey = new Map<string, CloseReason>();

  private state: ToastStateSnapshot;

  private orderCounter = 0;

  readonly defaultHostId: string;

  private baseHostConfig: ResolvedToastHostConfig;

  private hostRegistrations = new Map<
    string,
    { config?: ToastHostConfig; interactionMode: ToastInteractionMode }
  >();

  constructor({
    defaultHostId,
    defaultHostConfig,
  }: {
    defaultHostId: string;
    defaultHostConfig?: ToastHostConfig;
  }) {
    this.defaultHostId = defaultHostId;
    this.baseHostConfig = resolveHostConfig(defaultHostConfig, "deck");
    this.state = {
      version: 0,
      hosts: {},
    };

    this.registerHost(this.defaultHostId, defaultHostConfig);
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  getSnapshot = (): ToastStateSnapshot => {
    return this.state;
  };

  registerHost(
    hostId: string,
    config?: ToastHostConfig,
    interactionMode: ToastInteractionMode = "deck",
  ): void {
    this.hostRegistrations.set(hostId, { config, interactionMode });

    const prevHost = this.state.hosts[hostId];

    const liveDefaultConfig =
      this.state.hosts[this.defaultHostId]?.config ?? this.baseHostConfig;

    const baseForHost =
      hostId === this.defaultHostId ? this.baseHostConfig : liveDefaultConfig;

    const nextConfig = this.mergeHostConfig(
      baseForHost,
      config,
      interactionMode,
    );

    if (hostId === this.defaultHostId) {
      this.baseHostConfig = nextConfig;
    }

    if (!prevHost) {
      const nextHost: ToastHostState = {
        id: hostId,
        config: nextConfig,
        toasts: [],
      };

      this.state = {
        version: this.state.version + 1,
        hosts: {
          ...this.state.hosts,
          [hostId]: nextHost,
        },
      };
      this.emit();
      this.enforceHostHardLimit(hostId);
      return;
    }

    const changedKeys = getChangedHostConfigKeys(prevHost.config, nextConfig);
    if (changedKeys.length === 0) {
      return;
    }

    this.state = {
      version: this.state.version + 1,
      hosts: {
        ...this.state.hosts,
        [hostId]: {
          ...prevHost,
          config: nextConfig,
        },
      },
    };
    this.emit();

    const dismissedCount = this.dismissHostToasts(hostId, "programmatic");
    const context: ToastHostConfigChangeContext = {
      hostId,
      previousConfig: { ...prevHost.config },
      nextConfig: { ...nextConfig },
      changedKeys,
      dismissedCount,
    };

    this.safeInvokeCallback(nextConfig.onConfigChange, context);
    this.debug(hostId, "host:config-change", {
      changedKeys,
      dismissedCount,
    });

    this.enforceHostHardLimit(hostId);

    if (hostId === this.defaultHostId) {
      this.reapplyDefaultHostToMountedHosts();
    }
  }

  unregisterHost(hostId: string): void {
    this.hostRegistrations.delete(hostId);

    const host = this.state.hosts[hostId];
    if (!host) {
      return;
    }

    for (const toast of host.toasts) {
      this.clearToastTimers(hostId, toast.id);
      this.clearCloseCycle(hostId, toast.id);
    }

    const nextHosts = { ...this.state.hosts };
    delete nextHosts[hostId];

    this.state = {
      version: this.state.version + 1,
      hosts: nextHosts,
    };

    this.emit();
  }

  createController = (hostId = this.defaultHostId): ToastController => {
    return {
      hostId,
      show: (options) => this.show(options, hostId),
      success: (options) =>
        this.show(toVariantOptions(options, "success"), hostId),
      error: (options) => this.show(toVariantOptions(options, "error"), hostId),
      warning: (options) =>
        this.show(toVariantOptions(options, "warning"), hostId),
      info: (options) => this.show(toVariantOptions(options, "info"), hostId),
      loading: (options) =>
        this.show(
          toVariantOptions(options, "loading", {
            persistent: true,
            duration: "persistent",
          }),
          hostId,
        ),
      promise: async <T>(
        promise: Promise<T>,
        options: ToastPromiseOptions<T>,
        commonOptions?: Partial<ToastOptions>,
      ): Promise<T> => {
        const resolvedHostId = options.hostId ?? hostId;
        const promiseDefaults: Partial<ToastOptions> = {
          hostId: resolvedHostId,
          groupId: options.groupId,
          groupBehavior: options.groupBehavior,
          priority: options.priority,
        };
        const mergedCommonOptions = {
          ...promiseDefaults,
          ...commonOptions,
        };
        const loadingOptions = this.withCommonOptions(
          options.loading,
          mergedCommonOptions,
        );
        const id = this.loading(
          { ...loadingOptions, hostId: resolvedHostId },
          resolvedHostId,
        );

        try {
          const value = await promise;
          if (options.success) {
            const successOptions =
              typeof options.success === "function"
                ? options.success(value)
                : options.success;
            const normalizedSuccess = this.withCommonOptions(
              successOptions,
              mergedCommonOptions,
            );
            this.update(
              id,
              {
                ...normalizedSuccess,
                variant: normalizedSuccess.variant ?? "success",
                persistent: false,
                duration:
                  normalizedSuccess.duration ??
                  mergedCommonOptions.duration ??
                  3000,
              },
              resolvedHostId,
            );
          } else {
            this.dismiss(id, "programmatic", resolvedHostId);
          }

          if (options.finally) {
            this.update(id, options.finally, resolvedHostId);
          }

          return value;
        } catch (error) {
          if (options.error) {
            const errorOptions =
              typeof options.error === "function"
                ? options.error(error)
                : options.error;
            const normalizedError = this.withCommonOptions(
              errorOptions,
              mergedCommonOptions,
            );
            this.update(
              id,
              {
                ...normalizedError,
                variant: normalizedError.variant ?? "error",
                persistent: false,
                duration:
                  normalizedError.duration ??
                  mergedCommonOptions.duration ??
                  4500,
              },
              resolvedHostId,
            );
          } else {
            this.dismiss(id, "programmatic", resolvedHostId);
          }

          if (options.finally) {
            this.update(id, options.finally, resolvedHostId);
          }

          throw error;
        }
      },
      update: (id, options) => this.update(id, options, hostId),
      dismiss: (id, reason) => this.dismiss(id, reason, hostId),
      dismissAll: (reason) => this.dismissAll(hostId, reason),
      dismissGroup: (groupId, reason) =>
        this.dismissGroup(groupId, hostId, reason),
      updateGroup: (groupId, options) =>
        this.updateGroup(groupId, options, hostId),
      isVisible: (id) => this.isVisible(id, hostId),
    };
  };

  show = (input: string | ToastOptions, hostIdOverride?: string): ToastId => {
    const options = normalizeShowOptions(input);
    const hostId = hostIdOverride ?? options.hostId ?? this.defaultHostId;
    const host = this.ensureHost(hostId);
    this.debug(hostId, "show:request", getToastDebugMeta(options));

    const dedupeTarget = this.findDedupeTarget(host, options);
    const dedupeMode = options.dedupeMode ?? host.config.dedupeMode;

    if (dedupeTarget) {
      warnDedupeCollision({
        hostId,
        dedupeMode,
        targetId: dedupeTarget.id,
        dedupeKey: options.dedupeKey,
        explicitId: options.id,
      });
      this.debug(hostId, "show:dedupe-hit", {
        targetId: dedupeTarget.id,
        mode: dedupeMode,
      });
      if (dedupeMode === "ignore") {
        return dedupeTarget.id;
      }

      if (dedupeMode === "replace") {
        const location = this.findToast(dedupeTarget.id, hostId);
        if (location) {
          this.forceRemove(location, "programmatic");
        }
      } else {
        this.update(dedupeTarget.id, options, hostId, {
          resetTimer: true,
          bump: dedupeMode === "bump",
          reopenIfClosing: true,
          reason: "programmatic",
        });
        return dedupeTarget.id;
      }
    }

    const groupResolution = this.resolveGroupTarget(host, options);
    if (groupResolution) {
      const { mode, target } = groupResolution;
      this.debug(hostId, "show:group-hit", {
        groupId: options.groupId,
        mode,
        targetId: target.id,
      });

      if (mode === "update-in-group") {
        this.update(target.id, options, hostId, {
          resetTimer: true,
          bump: false,
          reopenIfClosing: true,
          reason: "programmatic",
        });
        return target.id;
      }

      if (mode === "replace-in-group") {
        const location = this.findToast(target.id, hostId);
        if (location) {
          this.forceRemove(location, "programmatic");
        }
      }
    }

    const id = options.id ?? createToastId();
    const now = Date.now();
    const variant = resolveToastVariant(options.variant);

    const record: ToastRecord = {
      ...options,
      id,
      hostId,
      variant,
      persistent:
        options.persistent ??
        (variant === "loading" && options.duration === undefined
          ? true
          : undefined),
      createdAt: now,
      updatedAt: now,
      order: ++this.orderCounter,
      lifecycle: {
        mounted: false,
        visible: false,
        isClosing: false,
      },
      closeReason: undefined,
    };

    this.updateHost(hostId, (currentHost) => {
      return {
        ...currentHost,
        toasts: [...currentHost.toasts, record],
      };
    });

    this.scheduleAutoDismiss(hostId, record);
    this.enforceHostHardLimit(hostId, id);
    this.debug(hostId, "show:created", {
      ...getToastRecordDebugMeta(record),
      priority: record.priority ?? 0,
    });

    return id;
  };

  update = (
    id: ToastId,
    options: ToastUpdateOptions,
    hostIdHint?: string,
    behavior?: {
      resetTimer?: boolean;
      bump?: boolean;
      reopenIfClosing?: boolean;
      reason?: CloseReason;
    },
  ): boolean => {
    const location = this.findToast(id, hostIdHint);
    if (!location) {
      this.debug(hostIdHint ?? this.defaultHostId, "update:missing", { id });
      return false;
    }

    const nextReason = options.reason ?? behavior?.reason;
    const now = Date.now();

    const nextToast: ToastRecord = {
      ...mergeToastRecord(location.toast, options),
      variant: resolveToastVariant(options.variant ?? location.toast.variant),
      updatedAt: now,
      lifecycle: {
        ...location.toast.lifecycle,
      },
      closeReason: location.toast.closeReason,
    };

    const shouldReopenIfClosing = behavior?.reopenIfClosing ?? true;
    const wasClosing = nextToast.lifecycle.isClosing;

    if (wasClosing && shouldReopenIfClosing) {
      nextToast.lifecycle = {
        ...nextToast.lifecycle,
        isClosing: false,
        visible: true,
      };
      nextToast.closeReason = undefined;
      this.clearCloseFallback(location.hostId, location.toast.id);
      this.resetCloseCycle(location.hostId, location.toast.id);
    }

    if (behavior?.bump) {
      nextToast.order = ++this.orderCounter;
    }

    this.updateHost(location.hostId, (host) => {
      const updated = host.toasts.map((toast) => {
        if (toast.id !== id) {
          return toast;
        }
        return nextToast;
      });

      return {
        ...host,
        toasts: updated,
      };
    });

    const refreshedLocation = this.findToast(id, location.hostId);
    const shouldRescheduleTimer =
      behavior?.resetTimer ||
      options.duration !== undefined ||
      options.persistent !== undefined ||
      options.variant !== undefined ||
      (wasClosing && shouldReopenIfClosing);

    if (refreshedLocation && shouldRescheduleTimer) {
      this.scheduleAutoDismiss(location.hostId, refreshedLocation.toast);
    }

    this.safeInvokeCallback(
      nextToast.onUpdate,
      this.createCallbackContext(nextToast, nextReason),
    );
    this.debug(location.hostId, "update:applied", {
      id,
      reason: nextReason,
      reopen: wasClosing && shouldReopenIfClosing,
      bump: behavior?.bump ?? false,
      groupId: nextToast.groupId,
    });

    return true;
  };

  dismiss = (
    id: ToastId,
    reason: CloseReason = "dismiss",
    hostIdHint?: string,
  ): boolean => {
    this.debug(hostIdHint ?? this.defaultHostId, "dismiss:request", {
      id,
      reason,
    });
    return this.beginClose(id, reason, hostIdHint);
  };

  dismissAll = (hostId?: string, reason: CloseReason = "dismiss"): void => {
    this.debug(hostId ?? this.defaultHostId, "dismiss-all:request", {
      hostScope: hostId ?? "all",
      reason,
    });
    if (hostId) {
      this.dismissHostToasts(hostId, reason);
      return;
    }

    for (const key of Object.keys(this.state.hosts)) {
      this.dismissHostToasts(key, reason);
    }
  };

  dismissGroup = (
    groupId: string,
    hostId?: string,
    reason: CloseReason = "dismiss",
  ): number => {
    const locations = this.findToastsByGroup(groupId, hostId);
    let dismissed = 0;
    for (const location of locations) {
      if (location.toast.lifecycle.isClosing) {
        continue;
      }
      if (this.beginClose(location.toast.id, reason, location.hostId)) {
        dismissed += 1;
      }
    }
    this.debug(hostId ?? this.defaultHostId, "group:dismiss", {
      groupId,
      reason,
      count: dismissed,
      hostScope: hostId ?? "all",
    });
    return dismissed;
  };

  updateGroup = (
    groupId: string,
    options: ToastUpdateOptions,
    hostId?: string,
  ): number => {
    const locations = this.findToastsByGroup(groupId, hostId);
    let updated = 0;
    for (const location of locations) {
      if (
        this.update(location.toast.id, options, location.hostId, {
          resetTimer: true,
          reopenIfClosing: true,
          reason: options.reason ?? "programmatic",
        })
      ) {
        updated += 1;
      }
    }
    this.debug(hostId ?? this.defaultHostId, "group:update", {
      groupId,
      count: updated,
      hostScope: hostId ?? "all",
    });
    return updated;
  };

  isVisible = (id: ToastId, hostIdHint?: string): boolean => {
    const location = this.findToast(id, hostIdHint);
    if (!location) {
      return false;
    }
    return !location.toast.lifecycle.isClosing;
  };

  pauseTimer(id: ToastId, hostIdHint?: string): void {
    const location = this.findToast(id, hostIdHint);
    if (!location || location.toast.lifecycle.isClosing) {
      return;
    }

    const key = this.toastKey(location.hostId, id);
    const timerState = this.timers.get(key);
    if (!timerState) {
      return;
    }

    if (timerState.paused) {
      this.timers.set(key, {
        ...timerState,
        pauseCount: timerState.pauseCount + 1,
      });
      this.debug(location.hostId, "timer:pause-nested", {
        id,
        pauseCount: timerState.pauseCount + 1,
      });
      return;
    }

    clearTimeout(timerState.handle);
    const elapsed = Date.now() - timerState.startedAt;
    const remaining = Math.max(0, timerState.remaining - elapsed);

    this.timers.set(key, {
      ...timerState,
      remaining,
      paused: true,
      pauseCount: 1,
    });
    this.debug(location.hostId, "timer:paused", { id, remaining });
  }

  resumeTimer(id: ToastId, hostIdHint?: string): void {
    const location = this.findToast(id, hostIdHint);
    if (!location || location.toast.lifecycle.isClosing) {
      return;
    }

    const key = this.toastKey(location.hostId, id);
    const timerState = this.timers.get(key);
    if (!timerState || !timerState.paused) {
      return;
    }

    const nextPauseCount = Math.max(0, timerState.pauseCount - 1);
    if (nextPauseCount > 0) {
      this.timers.set(key, {
        ...timerState,
        pauseCount: nextPauseCount,
      });
      this.debug(location.hostId, "timer:resume-deferred", {
        id,
        pauseCount: nextPauseCount,
      });
      return;
    }

    const remaining = Math.max(0, timerState.remaining);
    if (remaining === 0) {
      this.timers.delete(key);
      this.debug(location.hostId, "timer:elapsed-while-paused", { id });
      this.beginClose(id, "timeout", location.hostId);
      return;
    }

    this.debug(location.hostId, "timer:resumed", { id, remaining });
    this.startTimer(location.hostId, id, remaining);
  }

  notifyMounted(id: ToastId, hostIdHint?: string): void {
    const location = this.findToast(id, hostIdHint);
    if (!location || location.toast.lifecycle.mounted) {
      return;
    }

    const nextToast: ToastRecord = {
      ...location.toast,
      lifecycle: {
        ...location.toast.lifecycle,
        mounted: true,
      },
    };

    this.updateHost(location.hostId, (host) => {
      return {
        ...host,
        toasts: host.toasts.map((toast) =>
          toast.id === id ? nextToast : toast,
        ),
      };
    });

    this.safeInvokeCallback(
      nextToast.onMount,
      this.createCallbackContext(nextToast),
    );
  }

  notifyOpen(id: ToastId, hostIdHint?: string): void {
    const location = this.findToast(id, hostIdHint);
    if (
      !location ||
      location.toast.lifecycle.visible ||
      location.toast.lifecycle.isClosing
    ) {
      return;
    }

    const nextToast: ToastRecord = {
      ...location.toast,
      lifecycle: {
        ...location.toast.lifecycle,
        visible: true,
      },
    };

    this.updateHost(location.hostId, (host) => {
      return {
        ...host,
        toasts: host.toasts.map((toast) =>
          toast.id === id ? nextToast : toast,
        ),
      };
    });

    this.safeInvokeCallback(
      nextToast.onOpen,
      this.createCallbackContext(nextToast),
    );
  }

  notifyPress(id: ToastId, hostIdHint?: string): void {
    const location = this.findToast(id, hostIdHint);
    if (!location) {
      return;
    }

    this.safeInvokeCallback(
      location.toast.onPress,
      this.createCallbackContext(location.toast, "press"),
    );

    const shouldDismiss = location.toast.dismissOnPress ?? false;
    if (shouldDismiss) {
      this.beginClose(id, "press", location.hostId);
    }
  }

  notifyActionPress(
    id: ToastId,
    actionIndex: number,
    hostIdHint?: string,
  ): void {
    const location = this.findToast(id, hostIdHint);
    if (!location) {
      return;
    }

    const action = location.toast.actions?.[actionIndex];
    if (!action) {
      return;
    }

    const context = {
      id,
      hostId: location.hostId,
      action,
      actionIndex,
      dismiss: (reason?: CloseReason) =>
        this.dismiss(id, reason ?? "action", location.hostId),
      update: (options: ToastUpdateOptions) =>
        this.update(id, options, location.hostId),
    };

    try {
      const maybePromise = action.onPress?.(context);
      if (isPromiseLike(maybePromise)) {
        void maybePromise.catch(() => {
          // no-op for safety
        });
      }
    } catch {
      // no-op for safety
    }

    this.safeInvokeCallback(location.toast.onActionPress, context);

    if (
      (action.dismissOnPress ?? true) &&
      this.resolveDismissible(location.toast, location.host.config)
    ) {
      this.beginClose(id, "action", location.hostId);
    }
  }

  completeClose(
    id: ToastId,
    hostIdHint?: string,
    reasonOverride?: CloseReason,
  ): boolean {
    const location = this.findToast(id, hostIdHint);
    if (!location) {
      this.debug(hostIdHint ?? this.defaultHostId, "close:complete-missing", {
        id,
        reason: reasonOverride,
      });
      return false;
    }

    this.clearToastTimers(location.hostId, id);

    const reason =
      this.closeReasonByKey.get(this.toastKey(location.hostId, id)) ??
      location.toast.closeReason ??
      reasonOverride ??
      "programmatic";
    const finalToast: ToastRecord = {
      ...location.toast,
      closeReason: reason,
      lifecycle: {
        ...location.toast.lifecycle,
        visible: false,
        isClosing: false,
      },
    };

    const closeKey = this.toastKey(location.hostId, id);
    if (!this.closeStartFired.has(closeKey)) {
      this.fireCloseStartOnce(finalToast, reason);
    }

    this.fireCloseEndOnce(finalToast, reason);

    this.updateHost(location.hostId, (host) => {
      return {
        ...host,
        toasts: host.toasts.filter((toast) => toast.id !== id),
      };
    });

    this.clearCloseCycle(location.hostId, id);
    this.debug(location.hostId, "close:completed", { id, reason });

    return true;
  }

  private withCommonOptions(
    value: string | ToastOptions,
    commonOptions?: Partial<ToastOptions>,
  ): ToastOptions {
    const normalized = normalizeShowOptions(value);
    return {
      ...commonOptions,
      ...normalized,
      actions: normalized.actions ?? commonOptions?.actions,
    };
  }

  private findDedupeTarget(
    host: ToastHostState,
    options: ToastOptions,
  ): ToastRecord | undefined {
    if (options.id) {
      return host.toasts.find((toast) => toast.id === options.id);
    }

    if (options.dedupeKey) {
      return host.toasts.find((toast) => toast.dedupeKey === options.dedupeKey);
    }

    return undefined;
  }

  private resolveGroupTarget(
    host: ToastHostState,
    options: ToastOptions,
  ): { mode: ToastGroupBehavior; target: ToastRecord } | null {
    if (!options.groupId) {
      return null;
    }

    const mode = options.groupBehavior ?? host.config.groupBehavior;
    if (mode === "stack-in-group") {
      return null;
    }

    let target: ToastRecord | undefined;
    for (const toast of host.toasts) {
      if (toast.groupId !== options.groupId || toast.lifecycle.isClosing) {
        continue;
      }
      if (!target || toast.order > target.order) {
        target = toast;
      }
    }

    if (!target) {
      return null;
    }

    return { mode, target };
  }

  private findToastsByGroup(groupId: string, hostId?: string): ToastLocation[] {
    if (!groupId) {
      return [];
    }

    const result: ToastLocation[] = [];
    const hostEntries = hostId
      ? hostId in this.state.hosts
        ? [[hostId, this.state.hosts[hostId]] as const]
        : []
      : Object.entries(this.state.hosts);

    for (const [currentHostId, host] of hostEntries) {
      if (!host) {
        continue;
      }
      host.toasts.forEach((toast, index) => {
        if (toast.groupId !== groupId) {
          return;
        }
        result.push({
          hostId: currentHostId,
          host,
          index,
          toast,
        });
      });
    }

    return result;
  }

  private beginClose(
    id: ToastId,
    reason: CloseReason,
    hostIdHint?: string,
    force = false,
  ): boolean {
    const location = this.findToast(id, hostIdHint);
    if (!location) {
      this.debug(hostIdHint ?? this.defaultHostId, "close:missing", {
        id,
        reason,
      });
      return false;
    }

    const { toast, host, hostId } = location;
    const closeKey = this.toastKey(hostId, id);

    if (toast.lifecycle.isClosing || this.closeStartFired.has(closeKey)) {
      this.debug(hostId, "close:already-closing", { id, reason });
      return true;
    }

    if (!force && !this.canDismissByReason(reason, toast, host.config)) {
      this.debug(hostId, "close:blocked", { id, reason });
      return false;
    }

    const closingToast: ToastRecord = {
      ...toast,
      closeReason: reason,
      lifecycle: {
        ...toast.lifecycle,
        visible: false,
        isClosing: true,
      },
    };

    this.updateHost(hostId, (currentHost) => {
      return {
        ...currentHost,
        toasts: currentHost.toasts.map((item) =>
          item.id === id ? closingToast : item,
        ),
      };
    });

    this.clearTimer(hostId, id);
    this.fireCloseStartOnce(closingToast, reason);
    this.debug(hostId, "close:started", { id, reason });

    const exitDuration = resolveAnimationDuration(closingToast, host.config);
    this.clearCloseFallback(hostId, id);
    const fallbackTimer = setTimeout(() => {
      this.completeClose(id, hostId, reason);
    }, exitDuration + EXIT_FALLBACK_BUFFER_MS);

    this.closeFallbackTimers.set(this.toastKey(hostId, id), fallbackTimer);

    return true;
  }

  private forceRemove(location: ToastLocation, reason: CloseReason): void {
    this.clearToastTimers(location.hostId, location.toast.id);

    const closingToast: ToastRecord = {
      ...location.toast,
      closeReason: reason,
      lifecycle: {
        ...location.toast.lifecycle,
        visible: false,
        isClosing: false,
      },
    };

    this.fireCloseStartOnce(closingToast, reason);

    const finalToast: ToastRecord = {
      ...closingToast,
      lifecycle: {
        ...closingToast.lifecycle,
        isClosing: false,
      },
    };
    this.fireCloseEndOnce(finalToast, reason);
    this.clearCloseCycle(location.hostId, location.toast.id);

    this.updateHost(location.hostId, (host) => {
      return {
        ...host,
        toasts: host.toasts.filter((toast) => toast.id !== location.toast.id),
      };
    });
  }

  private canDismissByReason(
    reason: CloseReason,
    toast: ToastRecord,
    config: ResolvedToastHostConfig,
  ): boolean {
    if (reason === "timeout" || reason === "programmatic") {
      return true;
    }

    return this.resolveDismissible(toast, config);
  }

  private scheduleAutoDismiss(hostId: string, toast: ToastRecord): void {
    this.clearTimer(hostId, toast.id);

    const host = this.state.hosts[hostId];
    if (!host) {
      return;
    }

    const resolvedDuration = resolveToastDuration(toast, host.config);
    if (resolvedDuration === "persistent") {
      this.debug(hostId, "timer:skip-persistent", { id: toast.id });
      return;
    }

    if (!Number.isFinite(resolvedDuration)) {
      this.debug(hostId, "timer:skip-invalid-duration", { id: toast.id });
      return;
    }

    const duration = Math.max(0, resolvedDuration);

    if (duration === 0) {
      this.startTimer(hostId, toast.id, 0);
      return;
    }

    this.startTimer(hostId, toast.id, duration);
  }

  private resolveDismissible(
    toast: ToastRecord,
    config: ResolvedToastHostConfig,
  ): boolean {
    if (toast.dismissible !== undefined) {
      return toast.dismissible;
    }
    return config.dismissible;
  }

  private createCallbackContext(
    toast: ToastRecord,
    reason?: CloseReason,
  ): ToastCallbackContext {
    return {
      id: toast.id,
      hostId: toast.hostId,
      reason,
      state: {
        ...toast.lifecycle,
      },
      toast: {
        ...toast,
      },
    };
  }

  private safeInvokeCallback<T>(
    callback: ((context: T) => void) | undefined,
    context: T,
  ): void {
    if (!callback) {
      return;
    }

    try {
      callback(context);
    } catch {
      // no-op to protect host app from callback failures
    }
  }

  private updateHost(
    hostId: string,
    updater: (host: ToastHostState) => ToastHostState,
  ): void {
    const current = this.state.hosts[hostId];
    if (!current) {
      return;
    }

    const next = updater(current);
    this.state = {
      version: this.state.version + 1,
      hosts: {
        ...this.state.hosts,
        [hostId]: next,
      },
    };

    this.emit();
  }

  private ensureHost(hostId: string): ToastHostState {
    const existing = this.state.hosts[hostId];
    if (existing) {
      return existing;
    }

    warnHostAutoCreated(hostId);

    const inheritedConfig =
      this.state.hosts[this.defaultHostId]?.config ?? this.baseHostConfig;

    const host: ToastHostState = {
      id: hostId,
      config: inheritedConfig,
      toasts: [],
    };

    this.state = {
      version: this.state.version + 1,
      hosts: {
        ...this.state.hosts,
        [hostId]: host,
      },
    };

    this.emit();
    return host;
  }
  private reapplyDefaultHostToMountedHosts(): void {
    const mountedHostIds = Object.keys(this.state.hosts).filter(
      (id) => id !== this.defaultHostId,
    );

    for (const hostId of mountedHostIds) {
      const registration = this.hostRegistrations.get(hostId);
      const fallbackInteractionMode =
        this.state.hosts[hostId]?.config.interactionMode ?? "deck";

      this.registerHost(
        hostId,
        registration?.config,
        registration?.interactionMode ?? fallbackInteractionMode,
      );
    }
  }

  private findToast(id: ToastId, hostIdHint?: string): ToastLocation | null {
    if (hostIdHint) {
      const host = this.state.hosts[hostIdHint];
      if (!host) {
        return null;
      }
      const index = host.toasts.findIndex((toast) => toast.id === id);
      if (index < 0) {
        return null;
      }
      const toast = host.toasts[index];
      if (!toast) {
        return null;
      }
      return { hostId: hostIdHint, host, index, toast };
    }

    for (const key of Object.keys(this.state.hosts)) {
      const host = this.state.hosts[key];
      if (!host) {
        continue;
      }
      const index = host.toasts.findIndex((toast) => toast.id === id);
      if (index >= 0) {
        const toast = host.toasts[index];
        if (!toast) {
          continue;
        }
        return {
          hostId: key,
          host,
          index,
          toast,
        };
      }
    }

    return null;
  }

  private mergeHostConfig(
    base: ResolvedToastHostConfig,
    overrides?: ToastHostConfig,
    interactionMode: ToastInteractionMode = "deck",
  ): ResolvedToastHostConfig {
    if (!overrides) {
      return resolveHostConfig(base, interactionMode);
    }

    const merged = {
      ...base,
      ...overrides,
      variantDurations: {
        ...base.variantDurations,
        ...overrides.variantDurations,
      },
    };

    if (interactionMode === "classic") {
      const baseClassicGesture =
        base.interactionMode === "classic" ? base.classicGesture : undefined;
      const overrideClassicGesture = (
        overrides as { classicGesture?: ToastClassicGestureConfig }
      ).classicGesture;

      const {
        deckCollapsedMaxVisible: _deckCollapsedMaxVisible,
        deckExpandedMaxVisible: _deckExpandedMaxVisible,
        deckGesture: _deckGesture,
        allowCollapsedFrontHorizontalDismiss:
          _allowCollapsedFrontHorizontalDismiss,
        disableSwipeDismissAll: _disableSwipeDismissAll,
        collapseHandleStyle: _collapseHandleStyle,
        dismissAllConfirmation: _dismissAllConfirmation,
        dismissAllConfirmationTitle: _dismissAllConfirmationTitle,
        dismissAllConfirmationMessage: _dismissAllConfirmationMessage,
        dismissAllConfirmLabel: _dismissAllConfirmLabel,
        dismissAllCancelLabel: _dismissAllCancelLabel,
        expandedMaxHeight: _expandedMaxHeight,
        expandedAutoCollapse: _expandedAutoCollapse,
        onStackExpand: _onStackExpand,
        onStackCollapse: _onStackCollapse,
        onStackStateChange: _onStackStateChange,
        onDismissAllAttempt: _onDismissAllAttempt,
        onDismissAllComplete: _onDismissAllComplete,
        ...classicMerged
      } = merged as typeof merged & {
        deckCollapsedMaxVisible?: unknown;
        deckExpandedMaxVisible?: unknown;
        allowCollapsedFrontHorizontalDismiss?: unknown;
        disableSwipeDismissAll?: unknown;
        collapseHandleStyle?: unknown;
        dismissAllConfirmation?: unknown;
        dismissAllConfirmationTitle?: unknown;
        dismissAllConfirmationMessage?: unknown;
        dismissAllConfirmLabel?: unknown;
        dismissAllCancelLabel?: unknown;
        expandedMaxHeight?: unknown;
        expandedAutoCollapse?: unknown;
        onStackExpand?: unknown;
        onStackCollapse?: unknown;
        onStackStateChange?: unknown;
        onDismissAllAttempt?: unknown;
        onDismissAllComplete?: unknown;
      };

      return resolveHostConfig(
        {
          ...classicMerged,
          classicGesture: {
            ...baseClassicGesture,
            ...overrideClassicGesture,
            itemDismiss: {
              ...baseClassicGesture?.itemDismiss,
              ...overrideClassicGesture?.itemDismiss,
            },
          },
        },
        "classic",
      );
    }

    const baseDeckGesture =
      base.interactionMode === "deck" ? base.deckGesture : undefined;
    const overrideDeckGesture = (
      overrides as { deckGesture?: ToastDeckGestureConfig }
    ).deckGesture;

    const {
      classicMaxVisible: _classicMaxVisible,
      classicOverflowMode: _classicOverflowMode,
      classicOverflowBuffer: _classicOverflowBuffer,
      classicGesture: _classicGesture,
      ...deckMerged
    } = merged as typeof merged & {
      classicMaxVisible?: unknown;
      classicOverflowMode?: unknown;
      classicOverflowBuffer?: unknown;
      classicGesture?: unknown;
    };

    return resolveHostConfig(
      {
        ...deckMerged,
        deckGesture: {
          ...baseDeckGesture,
          ...overrideDeckGesture,
          itemDismiss: {
            ...baseDeckGesture?.itemDismiss,
            ...overrideDeckGesture?.itemDismiss,
          },
          collapsedExpand: {
            ...baseDeckGesture?.collapsedExpand,
            ...overrideDeckGesture?.collapsedExpand,
          },
          collapsedDismissAll: {
            ...baseDeckGesture?.collapsedDismissAll,
            ...overrideDeckGesture?.collapsedDismissAll,
          },
          collapseHandle: {
            ...baseDeckGesture?.collapseHandle,
            ...overrideDeckGesture?.collapseHandle,
          },
        },
      },
      "deck",
    );
  }

  private dismissHostToasts(hostId: string, reason: CloseReason): number {
    const host = this.state.hosts[hostId];
    if (!host) {
      return 0;
    }

    let dismissedCount = 0;
    for (const toast of host.toasts) {
      if (toast.lifecycle.isClosing) {
        continue;
      }
      if (this.beginClose(toast.id, reason, hostId)) {
        dismissedCount += 1;
      }
    }

    return dismissedCount;
  }

  private enforceHostHardLimit(hostId: string, keepId?: ToastId): void {
    const host = this.state.hosts[hostId];
    if (!host || host.toasts.length <= host.config.maxStackSize) {
      return;
    }

    const overflowCount = host.toasts.length - host.config.maxStackSize;
    const removable = [...host.toasts]
      .filter((toast) => !toast.lifecycle.isClosing && toast.id !== keepId)
      .sort((a, b) => a.order - b.order)
      .slice(0, overflowCount);

    if (removable.length === 0) {
      return;
    }

    const toRemoveIds = new Set(removable.map((toast) => toast.id));

    for (const toast of removable) {
      this.clearToastTimers(hostId, toast.id);
      const reason: CloseReason = "programmatic";
      const closingToast: ToastRecord = {
        ...toast,
        closeReason: reason,
        lifecycle: {
          ...toast.lifecycle,
          visible: false,
          isClosing: true,
        },
      };
      this.fireCloseStartOnce(closingToast, reason);
      this.fireCloseEndOnce(
        {
          ...closingToast,
          lifecycle: {
            ...closingToast.lifecycle,
            isClosing: false,
          },
        },
        reason,
      );
      this.clearCloseCycle(hostId, toast.id);
    }

    this.updateHost(hostId, (currentHost) => {
      return {
        ...currentHost,
        toasts: currentHost.toasts.filter(
          (toast) => !toRemoveIds.has(toast.id),
        ),
      };
    });
  }

  private fireCloseStartOnce(toast: ToastRecord, reason: CloseReason): void {
    const key = this.toastKey(toast.hostId, toast.id);
    if (this.closeStartFired.has(key)) {
      return;
    }

    this.closeStartFired.add(key);
    this.closeReasonByKey.set(key, reason);
    this.debug(toast.hostId, "lifecycle:onClosingStart", {
      ...getToastRecordDebugMeta(toast),
      reason,
      stage: "onClosingStart",
    });
    this.safeInvokeCallback(
      toast.onClosingStart,
      this.createCallbackContext(toast, reason),
    );
    this.debug(toast.hostId, "lifecycle:onClose", {
      ...getToastRecordDebugMeta(toast),
      reason,
      stage: "onClose",
    });
    this.safeInvokeCallback(
      toast.onClose,
      this.createCallbackContext(toast, reason),
    );
  }

  private fireCloseEndOnce(toast: ToastRecord, reason: CloseReason): void {
    const key = this.toastKey(toast.hostId, toast.id);
    if (this.closeEndFired.has(key)) {
      return;
    }

    this.closeEndFired.add(key);
    this.closeReasonByKey.set(key, reason);
    this.debug(toast.hostId, "lifecycle:onClosingEnd", {
      ...getToastRecordDebugMeta(toast),
      reason,
      stage: "onClosingEnd",
    });
    this.safeInvokeCallback(
      toast.onClosingEnd,
      this.createCallbackContext(toast, reason),
    );
    this.debug(toast.hostId, "lifecycle:onDismiss", {
      ...getToastRecordDebugMeta(toast),
      reason,
      stage: "onDismiss",
    });
    this.safeInvokeCallback(
      toast.onDismiss,
      this.createCallbackContext(toast, reason),
    );
  }

  private resetCloseCycle(hostId: string, id: ToastId): void {
    const key = this.toastKey(hostId, id);
    this.closeStartFired.delete(key);
    this.closeEndFired.delete(key);
    this.closeReasonByKey.delete(key);
  }

  private clearCloseCycle(hostId: string, id: ToastId): void {
    this.resetCloseCycle(hostId, id);
  }

  private startTimer(hostId: string, id: ToastId, duration: number): void {
    const key = this.toastKey(hostId, id);
    const remaining = Math.max(0, duration);
    const startedAt = Date.now();

    const handle = setTimeout(() => {
      this.timers.delete(key);
      this.beginClose(id, "timeout", hostId);
    }, remaining);

    this.timers.set(key, {
      handle,
      startedAt,
      remaining,
      paused: false,
      pauseCount: 0,
    });
    this.debug(hostId, "timer:started", { id, duration: remaining });
  }

  private clearTimer(hostId: string, id: ToastId): void {
    const key = this.toastKey(hostId, id);
    const timer = this.timers.get(key);
    if (timer) {
      clearTimeout(timer.handle);
      this.timers.delete(key);
      this.debug(hostId, "timer:cleared", { id });
    }
  }

  private clearCloseFallback(hostId: string, id: ToastId): void {
    const key = this.toastKey(hostId, id);
    const timer = this.closeFallbackTimers.get(key);
    if (timer) {
      clearTimeout(timer);
      this.closeFallbackTimers.delete(key);
    }
  }

  private clearToastTimers(hostId: string, id: ToastId): void {
    this.clearTimer(hostId, id);
    this.clearCloseFallback(hostId, id);
  }

  private toastKey(hostId: string, id: ToastId): string {
    return `${hostId}::${id}`;
  }

  private isDebugEnabled(hostId?: string): boolean {
    if (hostId) {
      return (
        this.state.hosts[hostId]?.config.debug ?? this.baseHostConfig.debug
      );
    }

    return this.baseHostConfig.debug;
  }

  private debug(
    hostId: string,
    event: string,
    payload?: Record<string, unknown>,
  ): void {
    const logger = createToastDebugLogger(
      this.isDebugEnabled(hostId),
      hostId,
      "store",
    );
    logger(event, payload);
  }

  private emit(): void {
    for (const listener of this.listeners) {
      listener();
    }
  }

  private showVariant(
    variant: ToastVariant,
    options: string | ToastOptions,
    hostId?: string,
    defaults?: Partial<ToastOptions>,
  ): ToastId {
    return this.show(toVariantOptions(options, variant, defaults), hostId);
  }

  private loading(options: string | ToastOptions, hostId?: string): ToastId {
    return this.showVariant("loading", options, hostId, {
      persistent: true,
      duration: "persistent",
    });
  }
}
