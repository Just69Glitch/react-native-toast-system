import type { ViewStyle } from "react-native";
import type {
  ResolvedToastHostConfig,
  ToastPosition,
  ToastRecord,
  ToastStackOverflowMode,
} from "../types/internal";
import { resolvePriorityValue } from "../utils/toast-utils";

export type StableStackLayoutItem = { toast: ToastRecord; stackIndex: number; zIndex: number };

type ClosingLayerCacheRef = { current: Map<string, { stackIndex: number; zIndex: number }> };

export function sortToastsByPriorityAndOrder(
  toasts: ToastRecord[],
  hostConfig: ResolvedToastHostConfig,
): ToastRecord[] {
  return [...toasts].sort((a, b) => {
    const priorityA = resolvePriorityValue(a.priority);
    const priorityB = resolvePriorityValue(b.priority);

    if (hostConfig.priorityMode === "strict") {
      const strictPriorityDelta = priorityB - priorityA;
      if (strictPriorityDelta !== 0) {
        return strictPriorityDelta;
      }
      return b.order - a.order;
    }

    const weightedScoreA = a.order + priorityA * hostConfig.priorityWeight;
    const weightedScoreB = b.order + priorityB * hostConfig.priorityWeight;
    if (weightedScoreA !== weightedScoreB) {
      return weightedScoreB - weightedScoreA;
    }

    if (priorityA !== priorityB) {
      return priorityB - priorityA;
    }

    return b.order - a.order;
  });
}

export function splitToastsByPosition(
  toasts: ToastRecord[],
  resolvePosition: (toast: ToastRecord) => ToastPosition,
) {
  const top: ToastRecord[] = [];
  const bottom: ToastRecord[] = [];

  for (const toast of toasts) {
    const position = resolvePosition(toast);
    if (position === "bottom") {
      bottom.push(toast);
    } else {
      top.push(toast);
    }
  }

  return { top, bottom };
}

export function resolveStackContainerStyle(
  position: ToastPosition,
  keyboardHeight: number,
  keyboardOffset: number,
  safeAreaInset: number,
): ViewStyle {
  if (position === "bottom") {
    return {
      position: "absolute",
      bottom: safeAreaInset + keyboardHeight + keyboardOffset,
      left: 0,
      right: 0,
      paddingHorizontal: 12,
      alignItems: "stretch",
      pointerEvents: "box-none",
    };
  }

  return {
    position: "absolute",
    top: safeAreaInset,
    left: 0,
    right: 0,
    paddingHorizontal: 12,
    alignItems: "stretch",
    pointerEvents: "box-none",
  };
}

export function getRenderedToasts(
  toasts: ToastRecord[],
  maxVisible: number,
  overflowMode: ToastStackOverflowMode,
  overflowBuffer: number,
): ToastRecord[] {
  const softLimit = overflowMode === "clip" ? maxVisible : maxVisible + Math.max(1, overflowBuffer);

  return toasts.filter((toast, index) => index < softLimit || toast.lifecycle.isClosing);
}

export function resolveStackOpacity(
  index: number,
  maxVisible: number,
  step: number,
  deEmphasize: boolean,
  overflowMode: ToastStackOverflowMode,
): number {
  if (!deEmphasize) {
    return 1;
  }

  const baseOpacity = Math.max(0.04, 1 - index * step);
  if (index < maxVisible) {
    return baseOpacity;
  }

  if (overflowMode === "clip") {
    return 0;
  }

  if (overflowMode === "compact") {
    return Math.max(0.08, baseOpacity * 0.62);
  }

  return Math.max(0.02, baseOpacity * 0.45);
}

export function resolveStackScale(
  index: number,
  maxVisible: number,
  step: number,
  deEmphasize: boolean,
  overflowMode: ToastStackOverflowMode,
): number {
  if (!deEmphasize) {
    return 1;
  }

  if (overflowMode === "compact" && index >= maxVisible) {
    const overflowDepth = index - maxVisible + 1;
    return Math.max(0.68, 1 - index * step - overflowDepth * 0.035);
  }

  return Math.max(0.76, 1 - index * step);
}

export function resolveStackTranslate(
  index: number,
  maxVisible: number,
  overflowMode: ToastStackOverflowMode,
  stackOverlap: number,
  position: ToastPosition,
): number {
  if (overflowMode === "clip" || index === 0) {
    return 0;
  }

  const sign = position === "bottom" ? 1 : -1;
  const normalDepth = Math.max(0, index - 1);
  const overflowDepth = Math.max(0, index - maxVisible + 1);
  const normalOffset = normalDepth * (stackOverlap * (overflowMode === "compact" ? 0.24 : 0.14));
  const overflowOffset =
    overflowDepth * (stackOverlap * (overflowMode === "compact" ? 0.52 : 0.25));

  return sign * (normalOffset + overflowOffset);
}

export function isExpandDirection(position: ToastPosition, translationY: number): boolean {
  "worklet";
  return position === "top" ? translationY > 0 : translationY < 0;
}

export function isDismissAllDirection(position: ToastPosition, translationY: number): boolean {
  "worklet";
  return position === "top" ? translationY < 0 : translationY > 0;
}

export function isCollapseDirection(position: ToastPosition, translationY: number): boolean {
  "worklet";
  return position === "top" ? translationY < 0 : translationY > 0;
}

export function resolveCollapsedDeckTranslate(
  index: number,
  stackOverlap: number,
  position: ToastPosition,
): number {
  if (index === 0 || stackOverlap <= 0) {
    return 0;
  }

  const sign = position === "bottom" ? -1 : 1;
  const step = stackOverlap;
  return sign * index * step;
}

function resolveCollapsedDeckMinimumPeek(stackOverlap: number): number {
  // Keep a small guaranteed reveal while still letting stackOverlap shape
  // the collapsed depth feel.
  return Math.max(6, Math.min(10, Math.round(stackOverlap * 0.8)));
}

export function resolveCollapsedDeckMeasuredTranslates(
  stacked: StableStackLayoutItem[],
  stackOverlap: number,
  position: ToastPosition,
  measuredHeightsById: Record<string, number>,
): Record<string, number> {
  if (stacked.length === 0) {
    return {};
  }

  const sign = position === "bottom" ? -1 : 1;
  const minimumPeekPx = resolveCollapsedDeckMinimumPeek(stackOverlap);
  const resolved: Record<string, number> = { [stacked[0].toast.id]: 0 };

  const frontHeight = measuredHeightsById[stacked[0].toast.id];
  let previousHeight = Number.isFinite(frontHeight) && frontHeight > 0 ? frontHeight : null;
  let previousMagnitude = 0;

  for (let index = 1; index < stacked.length; index += 1) {
    const item = stacked[index];
    const baseMagnitude = Math.abs(
      resolveCollapsedDeckTranslate(item.stackIndex, stackOverlap, position),
    );
    const currentMeasuredHeight = measuredHeightsById[item.toast.id];
    const currentHeight =
      Number.isFinite(currentMeasuredHeight) && currentMeasuredHeight > 0
        ? currentMeasuredHeight
        : null;

    let magnitude = baseMagnitude;

    if (previousHeight !== null && currentHeight !== null) {
      const minimumSpacing = Math.max(0, previousHeight - currentHeight + minimumPeekPx);
      magnitude = Math.max(baseMagnitude, previousMagnitude + minimumSpacing);
    }

    resolved[item.toast.id] = sign * magnitude;
    previousMagnitude = magnitude;
    previousHeight = currentHeight;
  }

  return resolved;
}

export function resolveCollapsedDeckScale(
  index: number,
  deEmphasize: boolean,
  scaleStep: number,
): number {
  if (index === 0 || !deEmphasize || scaleStep <= 0) {
    return 1;
  }

  return Math.max(0.82, 1 - index * scaleStep);
}

export function resolveCollapsedDeckOpacity(
  index: number,
  deEmphasize: boolean,
  opacityStep: number,
): number {
  if (index === 0 || !deEmphasize || opacityStep <= 0) {
    return 1;
  }

  return Math.max(0.25, 1 - index * opacityStep);
}

export function getDeckCollapsedRenderedToasts(
  stacked: StableStackLayoutItem[],
  deckCollapsedMaxVisible: number,
): StableStackLayoutItem[] {
  const limited: StableStackLayoutItem[] = [];
  let nonClosingCount = 0;

  for (const item of stacked) {
    if (item.toast.lifecycle.isClosing) {
      limited.push(item);
      continue;
    }

    if (nonClosingCount < deckCollapsedMaxVisible) {
      limited.push(item);
      nonClosingCount += 1;
    }
  }

  return limited;
}

export function getStableStackLayout(
  toasts: ToastRecord[],
  hostConfig: ResolvedToastHostConfig,
  closingLayerCacheRef: ClosingLayerCacheRef,
): StableStackLayoutItem[] {
  const renderedIds = new Set(toasts.map((toast) => toast.id));
  for (const key of closingLayerCacheRef.current.keys()) {
    if (!renderedIds.has(key)) {
      closingLayerCacheRef.current.delete(key);
    }
  }

  const reservedClosingZIndex = new Set<number>();
  for (const toast of toasts) {
    if (!toast.lifecycle.isClosing) continue;
    const cached = closingLayerCacheRef.current.get(toast.id);
    if (cached) {
      reservedClosingZIndex.add(cached.zIndex);
    }
  }

  const assignedZIndex = new Set<number>(reservedClosingZIndex);

  return toasts.map((toast, index) => {
    const computedZIndex = resolveToastZIndex(index, toasts.length, hostConfig, toast.zIndex);
    const cachedClosingLayer = closingLayerCacheRef.current.get(toast.id);

    let stableStackIndex = index;
    let stableZIndex = computedZIndex;

    if (toast.lifecycle.isClosing) {
      // Keep closing toasts on a frozen layer so neighboring reorders don't cause
      // overlap flicker during exit animations.
      if (cachedClosingLayer) {
        stableStackIndex = cachedClosingLayer.stackIndex;
        stableZIndex = cachedClosingLayer.zIndex;
      } else {
        closingLayerCacheRef.current.set(toast.id, {
          stackIndex: stableStackIndex,
          zIndex: stableZIndex,
        });
      }

      assignedZIndex.add(stableZIndex);
    } else {
      if (cachedClosingLayer) {
        closingLayerCacheRef.current.delete(toast.id);
      }

      while (assignedZIndex.has(stableZIndex)) {
        stableZIndex +=
          hostConfig.layering === "older-on-top" ? hostConfig.zIndexStep : -hostConfig.zIndexStep;
      }

      assignedZIndex.add(stableZIndex);
    }

    return { toast, stackIndex: stableStackIndex, zIndex: stableZIndex };
  });
}

function resolveToastZIndex(
  index: number,
  total: number,
  hostConfig: Pick<ResolvedToastHostConfig, "zIndexBase" | "zIndexStep" | "layering">,
  override?: number,
): number {
  if (typeof override === "number") {
    return override;
  }

  if (hostConfig.layering === "older-on-top") {
    return hostConfig.zIndexBase + index * hostConfig.zIndexStep;
  }

  return hostConfig.zIndexBase + (total - index) * hostConfig.zIndexStep;
}


