import { DEFAULT_HOST_CONFIG, TOAST_HOST_PRESETS } from "../constants/toast-constants";
import type {
  ResolvedToastClassicGestureConfig,
  ResolvedToastDeckGestureConfig,
  ResolvedToastGestureConfig,
  ResolvedClassicToastHostConfig,
  ResolvedDeckToastHostConfig,
  ResolvedToastCollapseHandleStyle,
  ToastExpandedAutoCollapsePolicy,
  ToastCollapseHandleStyle,
  ToastDismissAllAttemptContext,
  ToastDismissAllConfirmationKind,
  ResolvedToastHostConfig,
  ToastAnimationPreset,
  ToastClassicGestureConfig,
  ToastHostConfig,
  ToastId,
  ToastInteractionMode,
  ToastOptions,
  ToastPosition,
  ToastStackOverflowMode,
  ToastResolvedTheme,
  ToastRecord,
  ToastDeckGestureConfig,
  ToastTheme,
  ToastDirection,
  ToastVariant,
} from "../types/internal";

let toastCounter = 0;

const DEFAULT_GESTURE_RULE: ResolvedToastGestureConfig = {
  enabled: true,
  dismissThreshold: 48,
  cancelThreshold: 14,
  velocityThreshold: 900,
};

export function createToastId(): ToastId {
  toastCounter += 1;
  return `toast-${Date.now()}-${toastCounter}`;
}

export function normalizeShowOptions(options: string | ToastOptions): ToastOptions {
  if (typeof options === "string") {
    return { title: options };
  }
  return options;
}

function resolveGestureRule(
  value: Partial<ResolvedToastGestureConfig> | undefined,
  fallback?: ResolvedToastGestureConfig,
): ResolvedToastGestureConfig {
  const base = fallback ?? DEFAULT_GESTURE_RULE;
  const enabled = value?.enabled ?? base.enabled;
  const dismissThreshold = normalizeGestureNumber(
    value?.dismissThreshold,
    base.dismissThreshold,
    1,
  );
  const cancelThreshold = normalizeGestureNumber(
    value?.cancelThreshold,
    base.cancelThreshold,
    0,
  );
  const velocityThreshold = normalizeGestureNumber(
    value?.velocityThreshold,
    base.velocityThreshold,
    0,
  );

  return {
    enabled,
    dismissThreshold,
    cancelThreshold,
    velocityThreshold,
  };
}

function normalizeGestureNumber(
  value: number | undefined,
  fallback: number,
  min: number,
): number {
  if (!Number.isFinite(value)) {
    return fallback;
  }
  return Math.max(min, value as number);
}

function resolveClassicGestureConfig(
  input: ToastClassicGestureConfig | undefined,
): ResolvedToastClassicGestureConfig {
  const global = resolveGestureRule(input);
  return {
    ...global,
    itemDismiss: resolveGestureRule(input?.itemDismiss, global),
  };
}

function resolveDeckGestureConfig(
  input: ToastDeckGestureConfig | undefined,
): ResolvedToastDeckGestureConfig {
  const global = resolveGestureRule(input);
  return {
    ...global,
    itemDismiss: resolveGestureRule(input?.itemDismiss, global),
    collapsedExpand: resolveGestureRule(input?.collapsedExpand, global),
    collapsedDismissAll: resolveGestureRule(input?.collapsedDismissAll, global),
    collapseHandle: resolveGestureRule(input?.collapseHandle, global),
  };
}

export function resolveHostConfig(
  overrides?: ToastHostConfig | ResolvedToastHostConfig,
  interactionMode: ToastInteractionMode = "deck",
): ResolvedToastHostConfig {
  const preset = overrides?.preset ?? DEFAULT_HOST_CONFIG.preset;
  const presetConfig = TOAST_HOST_PRESETS[preset] ?? TOAST_HOST_PRESETS.default;

  const merged = {
    ...DEFAULT_HOST_CONFIG,
    ...presetConfig,
    ...overrides,
  } as ResolvedDeckToastHostConfig;

  const classicMaxVisible = Math.max(1, merged.classicMaxVisible);
  const classicOverflowBuffer = Math.max(1, merged.classicOverflowBuffer);
  const classicOverflowMode = resolveClassicOverflowMode(
    merged.classicOverflowMode,
  );
  const deckExpandedMaxVisible = Math.max(
    1,
    merged.deckExpandedMaxVisible ?? DEFAULT_HOST_CONFIG.deckExpandedMaxVisible,
  );
  const minimumStackSize =
    interactionMode === "deck"
      ? deckExpandedMaxVisible + 2
      : classicMaxVisible + classicOverflowBuffer + 2;
  const expandedMaxHeight = resolveExpandedMaxHeightConfigValue(merged.expandedMaxHeight);
  const classicGesture = resolveClassicGestureConfig(merged.classicGesture);
  const deckGesture = resolveDeckGestureConfig(merged.deckGesture);

  const resolvedCommon = {
    ...merged,
    preset,
    theme: resolveHostTheme(merged.theme),
    direction: resolveHostDirection(merged.direction),
    onConfigChange: merged.onConfigChange,
    interactionMode,
    variantDurations: {
      ...DEFAULT_HOST_CONFIG.variantDurations,
      ...presetConfig.variantDurations,
      ...overrides?.variantDurations,
    },
    classicMaxVisible,
    maxStackSize: Math.max(minimumStackSize, merged.maxStackSize),
    stackGap: Math.max(0, merged.stackGap),
    classicOverflowMode,
    classicOverflowBuffer,
    stackOverlap: clamp(merged.stackOverlap, 0, 36),
    deEmphasizeScaleStep: clamp(merged.deEmphasizeScaleStep, 0, 0.4),
    deEmphasizeOpacityStep: clamp(merged.deEmphasizeOpacityStep, 0, 0.5),
    keyboardOffset: Math.max(0, merged.keyboardOffset),
    animationDuration: Math.max(80, merged.animationDuration),
    zIndexStep: Math.max(1, merged.zIndexStep),
    priorityWeight: clamp(merged.priorityWeight, 0, 100_000),
    expandedMaxHeight,
    collapseHandleStyle: resolveCollapseHandleStyle(merged.collapseHandleStyle),
  };
  const expandedAutoCollapsePolicy = resolveExpandedAutoCollapsePolicy(merged.expandedAutoCollapse);

  if (interactionMode === "classic") {
    const {
      deckCollapsedMaxVisible: _deckCollapsedMaxVisible,
      deckExpandedMaxVisible: _deckExpandedMaxVisible,
      deckGesture: _deckGesture,
      allowCollapsedFrontHorizontalDismiss: _allowCollapsedFrontHorizontalDismiss,
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
      ...classicCommon
    } = resolvedCommon;

    const classicConfig: ResolvedClassicToastHostConfig = {
      ...classicCommon,
      interactionMode: "classic",
      classicGesture,
    };
    return classicConfig;
  }

  const deckConfig: ResolvedDeckToastHostConfig = {
    ...resolvedCommon,
    interactionMode: "deck",
    deckCollapsedMaxVisible: Math.max(
      1,
      merged.deckCollapsedMaxVisible ?? DEFAULT_HOST_CONFIG.deckCollapsedMaxVisible,
    ),
    deckExpandedMaxVisible,
    deckGesture,
    allowCollapsedFrontHorizontalDismiss: merged.allowCollapsedFrontHorizontalDismiss,
    disableSwipeDismissAll: merged.disableSwipeDismissAll,
    collapseHandleStyle: resolvedCommon.collapseHandleStyle,
    dismissAllConfirmation: merged.dismissAllConfirmation,
    dismissAllConfirmationTitle: merged.dismissAllConfirmationTitle,
    dismissAllConfirmationMessage: merged.dismissAllConfirmationMessage,
    dismissAllConfirmLabel: merged.dismissAllConfirmLabel,
    dismissAllCancelLabel: merged.dismissAllCancelLabel,
    expandedMaxHeight,
    expandedAutoCollapse: expandedAutoCollapsePolicy,
    onStackExpand: merged.onStackExpand,
    onStackCollapse: merged.onStackCollapse,
    onStackStateChange: merged.onStackStateChange,
    onDismissAllAttempt: merged.onDismissAllAttempt,
    onDismissAllComplete: merged.onDismissAllComplete,
  };

  return deckConfig;
}

function resolveHostTheme(theme: ToastTheme | undefined): ToastTheme {
  if (theme === "light" || theme === "dark") {
    return theme;
  }
  return "auto";
}

function resolveHostDirection(direction: ToastDirection | undefined): ToastDirection {
  if (direction === "ltr" || direction === "rtl") {
    return direction;
  }
  return "auto";
}

function resolveClassicOverflowMode(
  mode: ToastStackOverflowMode | "compress" | undefined,
): ToastStackOverflowMode {
  if (mode === "fade" || mode === "compact" || mode === "clip") {
    return mode;
  }
  if (mode === "compress") {
    return "compact" as const;
  }
  return "compact" as const;
}

function resolveExpandedMaxHeightConfigValue(value: number | undefined): number {
  if (!Number.isFinite(value)) {
    return 0.7;
  }

  const numeric = value as number;
  if (numeric > 0 && numeric <= 1) {
    return clamp(numeric, 0.2, 1);
  }

  if (numeric <= 0) {
    return 0.7;
  }

  return Math.max(120, numeric);
}

function resolveExpandedAutoCollapsePolicy(
  expandedAutoCollapse: ToastExpandedAutoCollapsePolicy | undefined,
): ToastExpandedAutoCollapsePolicy {
  const defaultDelayMs = 3000;
  const minDelayMs = 100;

  if (expandedAutoCollapse === false) {
    return false;
  }

  if (typeof expandedAutoCollapse === "number") {
    if (!Number.isFinite(expandedAutoCollapse)) {
      return defaultDelayMs;
    }
    return Math.max(minDelayMs, expandedAutoCollapse);
  }

  return defaultDelayMs;
}

function resolveCollapseHandleStyle(
  style: ToastCollapseHandleStyle | undefined,
): ResolvedToastCollapseHandleStyle {
  const backgroundColor =
    typeof style?.backgroundColor === "string" && style.backgroundColor.trim().length > 0
      ? style.backgroundColor.trim()
      : undefined;

  return {
    width: clamp(
      Number.isFinite(style?.width) ? (style?.width as number) : 48,
      16,
      160,
    ),
    height: clamp(
      Number.isFinite(style?.height) ? (style?.height as number) : 4,
      2,
      24,
    ),
    borderRadius: clamp(
      Number.isFinite(style?.borderRadius) ? (style?.borderRadius as number) : 999,
      0,
      999,
    ),
    backgroundColor,
    opacity: clamp(
      Number.isFinite(style?.opacity) ? (style?.opacity as number) : 0.9,
      0.1,
      1,
    ),
    marginTop: clamp(
      Number.isFinite(style?.marginTop) ? (style?.marginTop as number) : 6,
      0,
      24,
    ),
    marginBottom: clamp(
      Number.isFinite(style?.marginBottom) ? (style?.marginBottom as number) : 2,
      0,
      24,
    ),
  };
}

function normalizeComparableValue(value: unknown): unknown {
  if (typeof value === "function") {
    return "__fn__";
  }

  if (Array.isArray(value)) {
    return value.map(normalizeComparableValue);
  }

  if (value && typeof value === "object") {
    const source = value as Record<string, unknown>;
    const output: Record<string, unknown> = {};
    const keys = Object.keys(source).sort((a, b) => a.localeCompare(b));
    for (const key of keys) {
      const child = source[key];
      if (typeof child === "function") {
        continue;
      }
      output[key] = normalizeComparableValue(child);
    }
    return output;
  }

  return value;
}

function isConfigValueEqual(left: unknown, right: unknown): boolean {
  if (typeof left === "function" || typeof right === "function") {
    return true;
  }

  return (
    JSON.stringify(normalizeComparableValue(left)) ===
    JSON.stringify(normalizeComparableValue(right))
  );
}

export function getChangedHostConfigKeys(
  previousConfig: ResolvedToastHostConfig,
  nextConfig: ResolvedToastHostConfig,
): string[] {
  const previousRecord = previousConfig as unknown as Record<string, unknown>;
  const nextRecord = nextConfig as unknown as Record<string, unknown>;
  const keys = new Set([...Object.keys(previousRecord), ...Object.keys(nextRecord)]);
  const changed: string[] = [];

  for (const key of keys) {
    if (!isConfigValueEqual(previousRecord[key], nextRecord[key])) {
      changed.push(key);
    }
  }

  return changed.sort((a, b) => a.localeCompare(b));
}

export function resolveToastDuration(
  toast: Pick<ToastRecord, "duration" | "persistent" | "variant">,
  hostConfig: ResolvedToastHostConfig,
): number | "persistent" {
  if (toast.persistent) {
    return "persistent";
  }

  if (toast.duration !== undefined) {
    return toast.duration;
  }

  const variantDuration = hostConfig.variantDurations[toast.variant ?? "default"];
  if (variantDuration !== undefined) {
    return variantDuration;
  }

  return hostConfig.duration;
}

export function resolveToastVariant(variant?: ToastVariant): ToastVariant {
  return variant ?? "default";
}

export function resolveAnimationPreset(
  toast: Pick<ToastRecord, "animationPreset" | "animation">,
  hostConfig: ResolvedToastHostConfig,
): ToastAnimationPreset {
  return toast.animation?.preset ?? toast.animationPreset ?? hostConfig.animationPreset;
}

export function resolveAnimationDuration(
  toast: Pick<ToastRecord, "animationDuration" | "animation">,
  hostConfig: ResolvedToastHostConfig,
): number {
  const value =
    toast.animation?.duration ?? toast.animationDuration ?? hostConfig.animationDuration;
  return Math.max(80, value);
}

export function resolveToastPosition(
  toast: Pick<ToastRecord, "position">,
  hostConfig: ResolvedToastHostConfig,
): ToastPosition {
  return toast.position ?? hostConfig.position;
}

export function mergeToastRecord(base: ToastRecord, update: Partial<ToastOptions>): ToastRecord {
  return {
    ...base,
    ...update,
    id: base.id,
    hostId: base.hostId,
    order: base.order,
    createdAt: base.createdAt,
    lifecycle: base.lifecycle,
    closeReason: base.closeReason,
    actions: update.actions ?? base.actions,
  };
}

export function resolveDismissible(
  toast: Pick<ToastRecord, "dismissible">,
  hostConfig: ResolvedToastHostConfig,
): boolean {
  if (toast.dismissible !== undefined) {
    return toast.dismissible;
  }
  return hostConfig.dismissible;
}

export function resolveShowDismissButton(
  toast: Pick<ToastRecord, "showDismissButton">,
  hostConfig: ResolvedToastHostConfig,
): boolean {
  if (toast.showDismissButton !== undefined) {
    return toast.showDismissButton;
  }
  return hostConfig.showDismissButton;
}

export function resolveTemplate(
  toast: Pick<ToastRecord, "template">,
  hostConfig: ResolvedToastHostConfig,
) {
  return toast.template ?? hostConfig.defaultTemplate;
}

export function resolveGestureConfig(
  toast: Pick<ToastRecord, "gesture">,
  hostConfig: ResolvedToastHostConfig,
) {
  const itemDismissGesture =
    hostConfig.interactionMode === "deck"
      ? hostConfig.deckGesture.itemDismiss
      : hostConfig.classicGesture.itemDismiss;
  return resolveGestureRule({ ...itemDismissGesture, ...toast.gesture }, itemDismissGesture);
}

export function resolveDeckCollapsedExpandGestureConfig(
  hostConfig: Pick<ResolvedDeckToastHostConfig, "deckGesture">,
): ResolvedToastGestureConfig {
  return hostConfig.deckGesture.collapsedExpand;
}

export function resolveDeckCollapsedDismissAllGestureConfig(
  hostConfig: Pick<ResolvedDeckToastHostConfig, "deckGesture">,
): ResolvedToastGestureConfig {
  return hostConfig.deckGesture.collapsedDismissAll;
}

export function resolveDeckCollapseHandleGestureConfig(
  hostConfig: Pick<ResolvedDeckToastHostConfig, "deckGesture">,
): ResolvedToastGestureConfig {
  return hostConfig.deckGesture.collapseHandle;
}

export function resolveKeyboardAvoidance(
  toast: Pick<ToastRecord, "keyboardAvoidance">,
  hostConfig: ResolvedToastHostConfig,
): boolean {
  if (toast.keyboardAvoidance !== undefined) {
    return toast.keyboardAvoidance;
  }
  return hostConfig.keyboardAvoidance;
}

export function resolveKeyboardOffset(
  toast: Pick<ToastRecord, "keyboardOffset">,
  hostConfig: ResolvedToastHostConfig,
): number {
  const value = toast.keyboardOffset ?? hostConfig.keyboardOffset;
  return Math.max(0, value);
}

export function resolvePauseOnDrag(
  toast: Pick<ToastRecord, "pauseOnDrag">,
  hostConfig: ResolvedToastHostConfig,
): boolean {
  if (toast.pauseOnDrag !== undefined) {
    return toast.pauseOnDrag;
  }
  return hostConfig.pauseOnDrag;
}

export function resolvePauseOnPress(
  toast: Pick<ToastRecord, "pauseOnPress">,
  hostConfig: ResolvedToastHostConfig,
): boolean {
  if (toast.pauseOnPress !== undefined) {
    return toast.pauseOnPress;
  }
  return hostConfig.pauseOnPress;
}

export function resolveInteractionMode(
  hostConfig: Pick<ResolvedToastHostConfig, "interactionMode">,
): ToastInteractionMode {
  return hostConfig.interactionMode;
}

export function resolveToastResolvedTheme(
  hostTheme: ToastTheme,
  colorScheme: "light" | "dark" | "unspecified" | null | undefined,
): ToastResolvedTheme {
  if (hostTheme === "light" || hostTheme === "dark") {
    return hostTheme;
  }
  return colorScheme === "dark" ? "dark" : "light";
}

export function resolveToastDirection(direction: ToastDirection, nativeIsRTL = false): "ltr" | "rtl" {
  if (direction === "ltr" || direction === "rtl") {
    return direction;
  }
  return nativeIsRTL ? "rtl" : "ltr";
}

export type ResolvedDismissAllBehavior = {
  enabled: boolean;
  confirmation: ToastDismissAllConfirmationKind;
  confirm?: (context: ToastDismissAllAttemptContext) => Promise<boolean> | boolean;
};

export function resolveDismissAllBehavior(
  hostConfig: ResolvedToastHostConfig,
): ResolvedDismissAllBehavior {
  if (hostConfig.interactionMode !== "deck") {
    return { enabled: false, confirmation: "none" };
  }

  if (hostConfig.disableSwipeDismissAll) {
    return { enabled: false, confirmation: "none" };
  }

  const confirmation = hostConfig.dismissAllConfirmation;
  if (confirmation === "none") {
    return { enabled: true, confirmation: "none" };
  }

  if (typeof confirmation === "function") {
    return { enabled: true, confirmation: "custom", confirm: confirmation };
  }

  return { enabled: true, confirmation: "default" };
}

export function resolveExpandedMaxHeight(
  hostConfig: Pick<ResolvedDeckToastHostConfig, "expandedMaxHeight">,
  availableHeight: number,
): number {
  const safeAvailableHeight = Math.max(0, availableHeight);
  const configured = hostConfig.expandedMaxHeight;
  const configuredCap =
    configured > 0 && configured <= 1
      ? safeAvailableHeight * clamp(configured, 0.2, 1)
      : Math.max(120, configured);

  return Math.max(120, Math.min(configuredCap, safeAvailableHeight));
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function resolvePriorityValue(priority?: number): number {
  if (!Number.isFinite(priority)) {
    return 0;
  }
  return clamp(Math.round(priority as number), -1000, 1000);
}

export function isPromiseLike<T>(value: unknown): value is Promise<T> {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  return typeof (value as Promise<T>).then === "function";
}

export function toVariantOptions(
  input: string | ToastOptions,
  variant: ToastVariant,
  defaults?: Partial<ToastOptions>,
): ToastOptions {
  const base = normalizeShowOptions(input);
  return { ...defaults, ...base, variant };
}
