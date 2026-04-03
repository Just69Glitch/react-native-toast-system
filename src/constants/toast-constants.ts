import type {
  ResolvedToastHostConfig,
  ToastAnimationPreset,
  ToastHostConfig,
  ToastHostPreset,
} from "../types/internal";

export const DEFAULT_HOST_ID = "default";

export const DEFAULT_HOST_CONFIG: ResolvedToastHostConfig = {
  preset: "default",
  debug: false,
  theme: "auto",
  direction: "auto",
  duration: 4000,
  variantDurations: { loading: "persistent" },
  position: "top",
  classicMaxVisible: 2,
  maxStackSize: 48,
  stackGap: 8,
  classicOverflowMode: "compact",
  classicOverflowBuffer: 2,
  stackOverlap: 10,
  deEmphasize: true,
  deEmphasizeScaleStep: 0.03,
  deEmphasizeOpacityStep: 0.005,
  dedupeMode: "reset",
  groupBehavior: "stack-in-group",
  priorityMode: "soft",
  priorityWeight: 6000,
  dismissible: true,
  showDismissButton: false,
  deckGesture: {
    enabled: true,
    dismissThreshold: 48,
    cancelThreshold: 14,
    velocityThreshold: 900,
    itemDismiss: {
      enabled: true,
      dismissThreshold: 48,
      cancelThreshold: 14,
      velocityThreshold: 900,
    },
    collapsedExpand: {
      enabled: true,
      dismissThreshold: 48,
      cancelThreshold: 14,
      velocityThreshold: 900,
    },
    collapsedDismissAll: {
      enabled: true,
      dismissThreshold: 48,
      cancelThreshold: 14,
      velocityThreshold: 900,
    },
    collapseHandle: {
      enabled: true,
      dismissThreshold: 48,
      cancelThreshold: 14,
      velocityThreshold: 900,
    },
  },
  animationPreset: "subtle",
  animationDuration: 260,
  keyboardAvoidance: true,
  keyboardOffset: 0,
  pauseOnDrag: true,
  pauseOnPress: true,
  interactionMode: "deck",
  deckCollapsedMaxVisible: 4,
  deckExpandedMaxVisible: 32,
  allowCollapsedFrontHorizontalDismiss: true,
  disableSwipeDismissAll: false,
  collapseHandleStyle: {
    width: 48,
    height: 4,
    borderRadius: 999,
    opacity: 0.9,
    marginTop: 6,
    marginBottom: 2,
  },
  dismissAllConfirmation: "default",
  dismissAllConfirmationTitle: "Dismiss all notifications?",
  dismissAllConfirmationMessage:
    "This will close all visible toasts in this host.",
  dismissAllConfirmLabel: "Dismiss all",
  dismissAllCancelLabel: "Cancel",
  expandedMaxHeight: 0.7,
  expandedAutoCollapse: 5000,
  zIndexBase: 10_000,
  zIndexStep: 10,
  layering: "newer-on-top",
  defaultTemplate: "compact",
  useRNScreensOverlay: false,
};

export const TOAST_HOST_PRESETS: Record<
  ToastHostPreset,
  Partial<ToastHostConfig>
> = {
  default: {},
  minimal: {
    classicMaxVisible: 2,
    classicOverflowMode: "clip",
    deEmphasize: false,
    showDismissButton: false,
    animationPreset: "subtle",
    stackGap: 6,
  },
  status: {
    animationPreset: "spring",
    groupBehavior: "update-in-group",
    dedupeMode: "reset",
    classicMaxVisible: 3,
    pauseOnPress: true,
    showDismissButton: true,
  },
  "banner-heavy": {
    defaultTemplate: "banner",
    position: "top",
    classicMaxVisible: 5,
    classicOverflowMode: "fade",
    stackOverlap: 8,
    animationPreset: "snappy",
    showDismissButton: true,
  },
};

export interface ToastPresetMotion {
  enterOffset: number;
  exitOffset: number;
  enterScale: number;
  exitScale: number;
  enterDuration: number;
  exitDuration: number;
  springDamping: number;
  springStiffness: number;
  stackDurationMultiplier: number;
  restoreDamping: number;
  restoreStiffness: number;
  dragActiveScale: number;
}

export const TOAST_PRESET_MOTION: Record<
  ToastAnimationPreset,
  ToastPresetMotion
> = {
  subtle: {
    enterOffset: 10,
    exitOffset: 18,
    enterScale: 0.992,
    exitScale: 0.985,
    enterDuration: 210,
    exitDuration: 170,
    springDamping: 22,
    springStiffness: 290,
    stackDurationMultiplier: 0.92,
    restoreDamping: 24,
    restoreStiffness: 320,
    dragActiveScale: 0.998,
  },
  spring: {
    enterOffset: 20,
    exitOffset: 30,
    enterScale: 0.97,
    exitScale: 0.94,
    enterDuration: 270,
    exitDuration: 210,
    springDamping: 14,
    springStiffness: 220,
    stackDurationMultiplier: 1.06,
    restoreDamping: 15,
    restoreStiffness: 210,
    dragActiveScale: 0.992,
  },
  snappy: {
    enterOffset: 9,
    exitOffset: 16,
    enterScale: 0.996,
    exitScale: 0.988,
    enterDuration: 150,
    exitDuration: 120,
    springDamping: 24,
    springStiffness: 480,
    stackDurationMultiplier: 0.62,
    restoreDamping: 28,
    restoreStiffness: 520,
    dragActiveScale: 0.996,
  },
};

export const EXIT_FALLBACK_BUFFER_MS = 500;
