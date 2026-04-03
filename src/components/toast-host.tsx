import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Ref,
  type RefObject,
} from "react";
import {
  Alert,
  Dimensions,
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  useColorScheme,
  useWindowDimensions,
  type KeyboardEvent,
  type LayoutChangeEvent,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useToastContext, useToastStoreSnapshot } from "../context";
import { createToastDebugLogger } from "../core/debug";
import { ToastFullWindowOverlay } from "../overlays/full-window-overlay";
import { ToastItem } from "./toast-item";
import {
  getDeckCollapsedRenderedToasts,
  getRenderedToasts,
  getStableStackLayout,
  isCollapseDirection,
  isDismissAllDirection,
  isExpandDirection,
  resolveCollapsedDeckOpacity,
  resolveCollapsedDeckScale,
  resolveCollapsedDeckMeasuredTranslates,
  resolveCollapsedDeckTranslate,
  resolveStackContainerStyle,
  resolveStackOpacity,
  resolveStackScale,
  resolveStackTranslate,
  sortToastsByPriorityAndOrder,
  splitToastsByPosition,
} from "../core/stack-helpers";
import type {
  ResolvedClassicToastHostConfig,
  ResolvedDeckToastHostConfig,
  ResolvedToastHostConfig,
  ToastDismissAllAttemptContext,
  ToastDismissAllCompleteContext,
  ToastHostProps,
  ToastPosition,
  ToastStackStateContext,
  ToastRecord,
  ToastTemplateRegistry,
} from "../types/internal";
import {
  resolveDeckCollapseHandleGestureConfig,
  resolveDeckCollapsedDismissAllGestureConfig,
  resolveDeckCollapsedExpandGestureConfig,
  resolveDismissAllBehavior,
  resolveExpandedMaxHeight,
  resolveInteractionMode,
  resolveKeyboardAvoidance,
  resolveKeyboardOffset,
  resolveToastPosition,
  resolveToastResolvedTheme,
} from "../utils/toast-utils";

function assignRef<T>(ref: Ref<T | null> | undefined, value: T | null): void {
  if (!ref) {
    return;
  }

  if (typeof ref === "function") {
    ref(value);
    return;
  }

  (ref as RefObject<T | null>).current = value;
}

function useKeyboardHeight(): number {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const onChangeFrame = (event: KeyboardEvent) => {
      const screenHeight = Dimensions.get("window").height;
      const keyboardHeight = Math.max(
        0,
        screenHeight - event.endCoordinates.screenY,
      );
      setHeight(keyboardHeight);
    };

    const onShow = (event: KeyboardEvent) => {
      setHeight(event.endCoordinates.height);
    };

    const onHide = () => {
      setHeight(0);
    };

    const subscriptions =
      Platform.OS === "ios"
        ? [
            Keyboard.addListener("keyboardWillChangeFrame", onChangeFrame),
            Keyboard.addListener("keyboardWillHide", onHide),
          ]
        : [
            Keyboard.addListener("keyboardDidShow", onShow),
            Keyboard.addListener("keyboardDidHide", onHide),
          ];

    return () => {
      subscriptions.forEach((subscription) => subscription.remove());
    };
  }, []);

  return height;
}

function resolveDeckLayerAnchorStyle(position: ToastPosition) {
  return position === "bottom"
    ? { position: "absolute" as const, left: 0, right: 0, bottom: 0 }
    : { position: "absolute" as const, left: 0, right: 0, top: 0 };
}

const styles = StyleSheet.create({
  collapseHandleTouchTarget: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 28,
    paddingHorizontal: 12,
  },
  collapseHandle: {
    alignSelf: "center",
  },
});

function ClassicToastStack({
  position,
  toasts,
  keyboardHeight,
  keyboardOffset,
  safeAreaInset,
  hostId,
  hostConfig,
  templates,
  store,
}: {
  position: ToastPosition;
  toasts: ToastRecord[];
  keyboardHeight: number;
  keyboardOffset: number;
  safeAreaInset: number;
  hostId: string;
  hostConfig: ResolvedClassicToastHostConfig;
  templates: ToastTemplateRegistry;
  store: ReturnType<typeof useToastContext>["store"];
}) {
  const closingLayerMapRef = useRef<
    Map<string, { stackIndex: number; zIndex: number }>
  >(new Map());

  if (toasts.length === 0) {
    return null;
  }

  const renderedToasts = getRenderedToasts(
    toasts,
    hostConfig.classicMaxVisible,
    hostConfig.classicOverflowMode,
    hostConfig.classicOverflowBuffer,
  );
  const stacked = getStableStackLayout(
    renderedToasts,
    hostConfig,
    closingLayerMapRef,
  );

  const containerStyle = resolveStackContainerStyle(
    position,
    keyboardHeight,
    keyboardOffset,
    safeAreaInset,
  );

  return (
    <View pointerEvents="box-none" style={containerStyle}>
      <View
        pointerEvents="box-none"
        style={{
          gap: hostConfig.stackGap,
          flexDirection: position === "bottom" ? "column-reverse" : "column",
          overflow:
            hostConfig.classicOverflowMode === "clip" ? "hidden" : "visible",
        }}
      >
        {stacked.map(
          ({ toast, stackIndex: stableStackIndex, zIndex: stableZIndex }) => {
            const stackOpacity = resolveStackOpacity(
              stableStackIndex,
              hostConfig.classicMaxVisible,
              hostConfig.deEmphasizeOpacityStep,
              hostConfig.deEmphasize,
              hostConfig.classicOverflowMode,
            );

            const stackScale = resolveStackScale(
              stableStackIndex,
              hostConfig.classicMaxVisible,
              hostConfig.deEmphasizeScaleStep,
              hostConfig.deEmphasize,
              hostConfig.classicOverflowMode,
            );

            const stackTranslate = resolveStackTranslate(
              stableStackIndex,
              hostConfig.classicMaxVisible,
              hostConfig.classicOverflowMode,
              hostConfig.stackOverlap,
              position,
            );

            return (
              <ToastItem
                key={toast.id}
                toast={toast}
                hostConfig={hostConfig}
                hostId={hostId}
                position={position}
                stackOpacity={stackOpacity}
                stackScale={stackScale}
                stackTranslate={stackTranslate}
                zIndex={stableZIndex}
                templates={templates}
                store={store}
                interactionMode="classic"
              />
            );
          },
        )}
      </View>
    </View>
  );
}

function DeckToastStack({
  position,
  toasts,
  keyboardHeight,
  keyboardOffset,
  safeAreaInset,
  hostId,
  hostConfig,
  templates,
  store,
  screenHeight,
  safeAreaTop,
  safeAreaBottom,
}: {
  position: ToastPosition;
  toasts: ToastRecord[];
  keyboardHeight: number;
  keyboardOffset: number;
  safeAreaInset: number;
  hostId: string;
  hostConfig: ResolvedDeckToastHostConfig;
  templates: ToastTemplateRegistry;
  store: ReturnType<typeof useToastContext>["store"];
  screenHeight: number;
  safeAreaTop: number;
  safeAreaBottom: number;
}) {
  const colorScheme = useColorScheme();
  const resolvedTheme = useMemo(
    () => resolveToastResolvedTheme(hostConfig.theme, colorScheme),
    [colorScheme, hostConfig.theme],
  );
  const defaultCollapseHandleColor =
    resolvedTheme === "dark" ? "rgba(226,232,240,0.58)" : "rgba(15,23,42,0.22)";
  const collapseHandleShadowColor =
    resolvedTheme === "dark" ? "#000000" : "#0F172A";
  const collapseHandleShadowOpacity = resolvedTheme === "dark" ? 0.52 : 0.18;

  const [expanded, setExpanded] = useState(false);
  const collapsedCardHeightsRef = useRef<Record<string, number>>({});
  const [measureVersion, setMeasureVersion] = useState(0);
  const closingLayerMapRef = useRef<
    Map<string, { stackIndex: number; zIndex: number }>
  >(new Map());
  const pausedByHostRef = useRef<Set<string>>(new Set());
  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dismissAllPendingRef = useRef(false);
  const expandedScrollRef = useRef<ScrollView | null>(null);
  const previousExpandedRef = useRef(false);
  const previousVisibleCountRef = useRef(0);

  const expandedProgress = useSharedValue(0);
  const collapsedDragY = useSharedValue(0);
  const collapseHandleDragY = useSharedValue(0);

  const expandedRenderedToasts = getRenderedToasts(
    toasts,
    hostConfig.deckExpandedMaxVisible,
    "clip",
    1,
  );
  const stacked = getStableStackLayout(toasts, hostConfig, closingLayerMapRef);
  const expandedRenderedToastIds = useMemo(
    () => new Set(expandedRenderedToasts.map((toast) => toast.id)),
    [expandedRenderedToasts],
  );
  const expandedWindowStacked = useMemo(
    () => stacked.filter(({ toast }) => expandedRenderedToastIds.has(toast.id)),
    [expandedRenderedToastIds, stacked],
  );
  const collapsedStacked = useMemo(
    () =>
      getDeckCollapsedRenderedToasts(
        stacked,
        hostConfig.deckCollapsedMaxVisible,
      ),
    [hostConfig.deckCollapsedMaxVisible, stacked],
  );
  const collapsedStackTranslates = useMemo(
    () =>
      resolveCollapsedDeckMeasuredTranslates(
        collapsedStacked,
        hostConfig.stackOverlap,
        position,
        collapsedCardHeightsRef.current,
      ),
    [collapsedStacked, hostConfig.stackOverlap, measureVersion, position],
  );
  const visibleCount = useMemo(
    () =>
      expandedRenderedToasts.filter((toast) => !toast.lifecycle.isClosing)
        .length,
    [expandedRenderedToasts],
  );
  const debug = useMemo(
    () => createToastDebugLogger(hostConfig.debug, hostId, "host"),
    [hostConfig.debug, hostId],
  );

  const interactionMode = resolveInteractionMode(hostConfig);
  const dismissAllBehavior = useMemo(
    () => resolveDismissAllBehavior(hostConfig),
    [hostConfig],
  );
  const frontToastId = collapsedStacked[0]?.toast.id;
  const expandedStacked = useMemo(
    () =>
      position === "bottom"
        ? [...expandedWindowStacked].reverse()
        : expandedWindowStacked,
    [expandedWindowStacked, position],
  );
  const containerStyle = resolveStackContainerStyle(
    position,
    keyboardHeight,
    keyboardOffset,
    safeAreaInset,
  );
  const availableExpandedHeight = Math.max(
    0,
    screenHeight -
      safeAreaTop -
      safeAreaBottom -
      Math.max(0, keyboardHeight) -
      keyboardOffset -
      16,
  );
  const expandedMaxHeight = resolveExpandedMaxHeight(
    hostConfig,
    availableExpandedHeight,
  );
  const autoCollapseDelayMs = hostConfig.expandedAutoCollapse;

  const deckLayerAnchorStyle = useMemo(
    () => resolveDeckLayerAnchorStyle(position),
    [position],
  );

  const onCollapsedItemLayout = useCallback(
    (toastId: string, event: LayoutChangeEvent) => {
      const nextHeight = Math.round(event.nativeEvent.layout.height);
      if (!Number.isFinite(nextHeight) || nextHeight <= 0) {
        return;
      }

      const previousHeight = collapsedCardHeightsRef.current[toastId];
      if (
        typeof previousHeight === "number" &&
        Math.abs(previousHeight - nextHeight) < 2
      ) {
        return;
      }

      collapsedCardHeightsRef.current[toastId] = nextHeight;
      setMeasureVersion((version) => version + 1);
    },
    [],
  );

  const createStackContext = useCallback(
    (isExpanded: boolean): ToastStackStateContext => ({
      hostId,
      position,
      visibleCount,
      expanded: isExpanded,
    }),
    [hostId, position, visibleCount],
  );

  const clearInactivityTimer = useCallback(() => {
    if (!inactivityTimerRef.current) {
      return;
    }
    clearTimeout(inactivityTimerRef.current);
    inactivityTimerRef.current = null;
  }, []);

  const collapseStack = useCallback(() => {
    setExpanded(false);
  }, []);

  const queueAutoCollapse = useCallback(() => {
    clearInactivityTimer();
    if (!expanded || autoCollapseDelayMs === false) {
      return;
    }

    inactivityTimerRef.current = setTimeout(() => {
      setExpanded(false);
    }, autoCollapseDelayMs);
  }, [autoCollapseDelayMs, clearInactivityTimer, expanded]);

  const registerInteraction = useCallback(() => {
    if (!expanded) {
      return;
    }
    queueAutoCollapse();
  }, [expanded, queueAutoCollapse]);

  const pauseExpandedTimers = useCallback(() => {
    // Deck-expanded mode intentionally pauses every visible timer so list browsing
    // cannot race auto-dismiss while the user is interacting.
    for (const toast of toasts) {
      if (toast.lifecycle.isClosing || pausedByHostRef.current.has(toast.id)) {
        continue;
      }
      pausedByHostRef.current.add(toast.id);
      store.pauseTimer(toast.id, hostId);
    }
  }, [hostId, store, toasts]);

  const resumeExpandedTimers = useCallback(() => {
    for (const toastId of pausedByHostRef.current) {
      store.resumeTimer(toastId, hostId);
    }
    pausedByHostRef.current.clear();
  }, [hostId, store]);

  const runBuiltInDismissAllConfirm = useCallback(() => {
    return new Promise<boolean>((resolve) => {
      Alert.alert(
        hostConfig.dismissAllConfirmationTitle,
        hostConfig.dismissAllConfirmationMessage,
        [
          {
            text: hostConfig.dismissAllCancelLabel,
            style: "cancel",
            onPress: () => resolve(false),
          },
          {
            text: hostConfig.dismissAllConfirmLabel,
            style: "destructive",
            onPress: () => resolve(true),
          },
        ],
        { cancelable: true, onDismiss: () => resolve(false) },
      );
    });
  }, [
    hostConfig.dismissAllCancelLabel,
    hostConfig.dismissAllConfirmLabel,
    hostConfig.dismissAllConfirmationMessage,
    hostConfig.dismissAllConfirmationTitle,
  ]);

  const resolveDismissAllDecision = useCallback(
    async (context: ToastDismissAllAttemptContext) => {
      if (!dismissAllBehavior.enabled) {
        return false;
      }

      if (dismissAllBehavior.confirmation === "none") {
        return true;
      }

      if (dismissAllBehavior.confirmation === "default") {
        return runBuiltInDismissAllConfirm();
      }

      if (!dismissAllBehavior.confirm) {
        return false;
      }

      // Custom confirmation callback is fully app-controlled.
      try {
        const result = dismissAllBehavior.confirm(context);
        return typeof (result as Promise<boolean>)?.then === "function"
          ? await (result as Promise<boolean>)
          : Boolean(result);
      } catch {
        return false;
      }
    },
    [dismissAllBehavior, runBuiltInDismissAllConfirm],
  );

  const attemptDismissAll = useCallback(async () => {
    if (!dismissAllBehavior.enabled || dismissAllPendingRef.current) {
      debug("deck:dismiss-all:skipped", {
        reason: dismissAllBehavior.enabled ? "already-pending" : "disabled",
      });
      return;
    }

    dismissAllPendingRef.current = true;
    debug("deck:dismiss-all:attempt", {
      confirmation: dismissAllBehavior.confirmation,
      visibleCount,
    });
    const attemptContext: ToastDismissAllAttemptContext = {
      ...createStackContext(false),
      confirmation: dismissAllBehavior.confirmation,
    };
    hostConfig.onDismissAllAttempt?.(attemptContext);

    const confirmed = await resolveDismissAllDecision(attemptContext);
    const dismissibleToasts = toasts.filter(
      (toast) => !toast.lifecycle.isClosing,
    );

    if (confirmed && dismissibleToasts.length > 0) {
      store.dismissAll(hostId, "dismiss");
    }

    const completionContext: ToastDismissAllCompleteContext = {
      ...createStackContext(false),
      confirmation: dismissAllBehavior.confirmation,
      confirmed,
      dismissed: confirmed && dismissibleToasts.length > 0,
    };
    hostConfig.onDismissAllComplete?.(completionContext);
    debug("deck:dismiss-all:complete", {
      confirmation: dismissAllBehavior.confirmation,
      confirmed,
      dismissed: confirmed && dismissibleToasts.length > 0,
    });
    dismissAllPendingRef.current = false;
  }, [
    createStackContext,
    debug,
    dismissAllBehavior,
    hostConfig,
    hostId,
    resolveDismissAllDecision,
    store,
    toasts,
    visibleCount,
  ]);

  useEffect(() => {
    if (expanded && visibleCount === 0) {
      setExpanded(false);
    }
  }, [expanded, visibleCount]);

  useEffect(() => {
    const visibleCollapsedIds = new Set(
      collapsedStacked.map((item) => item.toast.id),
    );
    const current = collapsedCardHeightsRef.current;
    let changed = false;
    for (const id of Object.keys(current)) {
      if (!visibleCollapsedIds.has(id)) {
        delete current[id];
        changed = true;
      }
    }

    if (changed) {
      setMeasureVersion((version) => version + 1);
    }
  }, [collapsedStacked]);

  useEffect(() => {
    if (expanded) {
      pauseExpandedTimers();
      queueAutoCollapse();
      return;
    }

    clearInactivityTimer();
    resumeExpandedTimers();
  }, [
    clearInactivityTimer,
    expanded,
    pauseExpandedTimers,
    queueAutoCollapse,
    resumeExpandedTimers,
  ]);

  useEffect(() => {
    if (!expanded || position !== "bottom") {
      return;
    }

    const raf = requestAnimationFrame(() => {
      expandedScrollRef.current?.scrollToEnd({ animated: false });
    });

    return () => {
      cancelAnimationFrame(raf);
    };
  }, [expanded, expandedWindowStacked.length, position]);

  useEffect(() => {
    return () => {
      clearInactivityTimer();
      resumeExpandedTimers();
    };
  }, [clearInactivityTimer, resumeExpandedTimers]);

  useEffect(() => {
    expandedProgress.value = withTiming(expanded ? 1 : 0, {
      duration:
        hostConfig.animationPreset === "snappy"
          ? 140
          : hostConfig.animationPreset === "spring"
            ? 220
            : 180,
      easing:
        hostConfig.animationPreset === "spring"
          ? Easing.out(Easing.cubic)
          : hostConfig.animationPreset === "snappy"
            ? Easing.out(Easing.exp)
            : Easing.out(Easing.quad),
    });
  }, [expanded, expandedProgress, hostConfig.animationPreset]);

  useEffect(() => {
    const wasExpanded = previousExpandedRef.current;
    const wasVisibleCount = previousVisibleCountRef.current;
    const expansionChanged = wasExpanded !== expanded;
    const visibleChanged = wasVisibleCount !== visibleCount;

    if (expansionChanged) {
      const stackContext = createStackContext(expanded);
      if (expanded) {
        debug("deck:expanded", { visibleCount: stackContext.visibleCount });
        hostConfig.onStackExpand?.(stackContext);
      } else {
        debug("deck:collapsed", { visibleCount: stackContext.visibleCount });
        hostConfig.onStackCollapse?.(stackContext);
      }
    }

    if (expansionChanged || visibleChanged) {
      hostConfig.onStackStateChange?.(createStackContext(expanded));
    }

    previousExpandedRef.current = expanded;
    previousVisibleCountRef.current = visibleCount;
  }, [createStackContext, debug, expanded, hostConfig, visibleCount]);

  const collapsedStackAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: 1 - expandedProgress.value,
      transform: [
        { translateY: collapsedDragY.value * (1 - expandedProgress.value) },
      ],
    };
  }, []);

  const expandedStackAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: expandedProgress.value,
      transform: [{ translateY: collapseHandleDragY.value * 0.22 }],
    };
  }, []);

  const expandGestureConfig = resolveDeckCollapsedExpandGestureConfig(hostConfig);
  const dismissAllGestureConfig = resolveDeckCollapsedDismissAllGestureConfig(hostConfig);
  const collapseHandleGestureConfig =
    resolveDeckCollapseHandleGestureConfig(hostConfig);

  const collapsedPanGesture = useMemo(() => {
    return Gesture.Pan()
      .enabled(
        interactionMode === "deck" &&
          !expanded &&
          collapsedStacked.length > 0 &&
          hostConfig.deckGesture.enabled &&
          (expandGestureConfig.enabled ||
            (dismissAllBehavior.enabled && dismissAllGestureConfig.enabled)),
      )
      .activeOffsetY([-10, 10])
      .failOffsetX([-30, 30])
      .onUpdate((event) => {
        const translationY = event.translationY;
        const aligned = isExpandDirection(position, translationY);
        collapsedDragY.value = aligned
          ? translationY * 0.42
          : translationY * 0.25;
      })
      .onEnd((event) => {
        const translationY = event.translationY;
        const velocityY = event.velocityY;
        const absTranslation = Math.abs(translationY);
        const absVelocity = Math.abs(velocityY);
        const expandGesture =
          expandGestureConfig.enabled &&
          isExpandDirection(position, translationY) &&
          (absTranslation >= expandGestureConfig.dismissThreshold ||
            absVelocity >= expandGestureConfig.velocityThreshold);
        const dismissAllGesture =
          dismissAllBehavior.enabled &&
          dismissAllGestureConfig.enabled &&
          isDismissAllDirection(position, translationY) &&
          (absTranslation >= dismissAllGestureConfig.dismissThreshold ||
            absVelocity >= dismissAllGestureConfig.velocityThreshold);
        const shouldCancel =
          absTranslation <=
            Math.max(
              expandGestureConfig.cancelThreshold,
              dismissAllGestureConfig.cancelThreshold,
            ) &&
          absVelocity <
            Math.max(
              expandGestureConfig.velocityThreshold,
              dismissAllGestureConfig.velocityThreshold,
            ) *
              0.45;

        if (shouldCancel) {
          collapsedDragY.value = withTiming(0, {
            duration: 95,
            easing: Easing.out(Easing.quad),
          });
          return;
        }

        if (expandGesture) {
          collapsedDragY.value = withTiming(0, {
            duration: 120,
            easing: Easing.out(Easing.quad),
          });
          scheduleOnRN(setExpanded, true);
          return;
        }

        if (dismissAllGesture) {
          collapsedDragY.value = withTiming(0, {
            duration: 120,
            easing: Easing.out(Easing.quad),
          });
          scheduleOnRN(attemptDismissAll);
          return;
        }

        collapsedDragY.value = withSpring(0, {
          damping: hostConfig.animationPreset === "spring" ? 15 : 22,
          stiffness: hostConfig.animationPreset === "spring" ? 210 : 320,
        });
      })
      .onFinalize(() => {
        cancelAnimation(collapsedDragY);
        if (Math.abs(collapsedDragY.value) > 0.5) {
          collapsedDragY.value = withSpring(0, {
            damping: hostConfig.animationPreset === "spring" ? 15 : 24,
            stiffness: hostConfig.animationPreset === "spring" ? 220 : 340,
          });
        }
      });
  }, [
    attemptDismissAll,
    collapsedDragY,
    dismissAllBehavior.enabled,
    dismissAllGestureConfig.cancelThreshold,
    dismissAllGestureConfig.dismissThreshold,
    dismissAllGestureConfig.enabled,
    dismissAllGestureConfig.velocityThreshold,
    expanded,
    expandGestureConfig.cancelThreshold,
    expandGestureConfig.dismissThreshold,
    expandGestureConfig.enabled,
    expandGestureConfig.velocityThreshold,
    hostConfig.animationPreset,
    hostConfig.deckGesture.enabled,
    interactionMode,
    position,
    collapsedStacked.length,
  ]);

  const collapseHandlePanGesture = useMemo(() => {
    return Gesture.Pan()
      .enabled(
        interactionMode === "deck" &&
        expanded &&
        expandedWindowStacked.length > 0 &&
        hostConfig.deckGesture.enabled &&
        collapseHandleGestureConfig.enabled,
      )
      .activeOffsetY([-8, 8])
      .failOffsetX([-24, 24])
      .onBegin(() => {
        scheduleOnRN(registerInteraction);
      })
      .onUpdate((event) => {
        const translationY = event.translationY;
        if (!isCollapseDirection(position, translationY)) {
          collapseHandleDragY.value = translationY * 0.2;
          return;
        }

        collapseHandleDragY.value = translationY * 0.4;
      })
      .onEnd((event) => {
        const translationY = event.translationY;
        const velocityY = event.velocityY;
        const absTranslation = Math.abs(translationY);
        const absVelocity = Math.abs(velocityY);
        const shouldCancel =
          absTranslation <= collapseHandleGestureConfig.cancelThreshold &&
          absVelocity < collapseHandleGestureConfig.velocityThreshold * 0.45;
        const shouldCollapse =
          collapseHandleGestureConfig.enabled &&
          isCollapseDirection(position, translationY) &&
          (absTranslation >= collapseHandleGestureConfig.dismissThreshold ||
            absVelocity >= collapseHandleGestureConfig.velocityThreshold);

        if (shouldCancel) {
          collapseHandleDragY.value = withTiming(0, {
            duration: 95,
            easing: Easing.out(Easing.quad),
          });
          return;
        }

        if (shouldCollapse) {
          collapseHandleDragY.value = withTiming(0, {
            duration: 110,
            easing: Easing.out(Easing.quad),
          });
          scheduleOnRN(collapseStack);
          return;
        }

        collapseHandleDragY.value = withSpring(0, {
          damping: hostConfig.animationPreset === "spring" ? 14 : 20,
          stiffness: hostConfig.animationPreset === "spring" ? 210 : 300,
        });
      })
      .onFinalize(() => {
        if (Math.abs(collapseHandleDragY.value) > 0.5) {
          collapseHandleDragY.value = withSpring(0, {
            damping: hostConfig.animationPreset === "spring" ? 14 : 22,
            stiffness: hostConfig.animationPreset === "spring" ? 220 : 320,
          });
        }
      });
  }, [
    collapseStack,
    collapseHandleDragY,
    collapseHandleGestureConfig.cancelThreshold,
    collapseHandleGestureConfig.dismissThreshold,
    collapseHandleGestureConfig.enabled,
    collapseHandleGestureConfig.velocityThreshold,
    expanded,
    hostConfig.animationPreset,
    hostConfig.deckGesture.enabled,
    interactionMode,
    position,
    registerInteraction,
    expandedWindowStacked.length,
  ]);

  if (toasts.length === 0) {
    return null;
  }

  return (
    <View
      pointerEvents="box-none"
      style={[containerStyle, { position: "absolute" }]}
    >
      <GestureDetector gesture={collapsedPanGesture}>
        <Animated.View
          pointerEvents={expanded ? "none" : "box-none"}
          style={[
            deckLayerAnchorStyle,
            { zIndex: expanded ? 0 : 2 },
            collapsedStackAnimatedStyle,
          ]}
        >
          <View
            pointerEvents="box-none"
            style={{ gap: 0, position: "relative", overflow: "visible" }}
          >
            {[...collapsedStacked.slice(1)]
              .reverse()
              .map(({ toast, stackIndex, zIndex }) => {
                const stackOpacity = resolveCollapsedDeckOpacity(
                  stackIndex,
                  hostConfig.deEmphasize,
                  hostConfig.deEmphasizeOpacityStep,
                );

                const stackScale = resolveCollapsedDeckScale(
                  stackIndex,
                  hostConfig.deEmphasize,
                  hostConfig.deEmphasizeScaleStep,
                );

                const stackTranslate = resolveCollapsedDeckTranslate(
                  stackIndex,
                  hostConfig.stackOverlap,
                  position,
                );
                const measuredTranslate =
                  collapsedStackTranslates[toast.id] ?? stackTranslate;

                return (
                  <View
                    key={toast.id}
                    pointerEvents="none"
                    onLayout={(event) => onCollapsedItemLayout(toast.id, event)}
                    style={{
                      position: "absolute",
                      left: 0,
                      right: 0,
                      ...(position === "bottom" ? { bottom: 0 } : { top: 0 }),
                    }}
                  >
                    <ToastItem
                      toast={toast}
                      hostConfig={hostConfig}
                      hostId={hostId}
                      position={position}
                      stackOpacity={stackOpacity}
                      stackScale={stackScale}
                      stackTranslate={measuredTranslate}
                      zIndex={zIndex}
                      templates={templates}
                      store={store}
                      interactionMode="deck"
                      deckState="collapsed"
                      canHorizontalDismiss={false}
                    />
                  </View>
                );
              })}

            {collapsedStacked[0] ? (
              <View
                onLayout={(event) =>
                  onCollapsedItemLayout(collapsedStacked[0].toast.id, event)
                }
              >
                <ToastItem
                  key={collapsedStacked[0].toast.id}
                  toast={collapsedStacked[0].toast}
                  hostConfig={hostConfig}
                  hostId={hostId}
                  position={position}
                  stackOpacity={1}
                  stackScale={1}
                  stackTranslate={0}
                  zIndex={collapsedStacked[0].zIndex}
                  templates={templates}
                  store={store}
                  interactionMode="deck"
                  deckState="collapsed"
                  canHorizontalDismiss={
                    hostConfig.allowCollapsedFrontHorizontalDismiss &&
                    collapsedStacked[0].toast.id === frontToastId
                  }
                />
              </View>
            ) : null}
          </View>
        </Animated.View>
      </GestureDetector>

      <Animated.View
        pointerEvents={expanded ? "auto" : "none"}
        style={[
          deckLayerAnchorStyle,
          {
            zIndex: expanded ? 2 : 0,
            maxHeight: expandedMaxHeight,
            overflow: "hidden",
          },
          expandedStackAnimatedStyle,
        ]}
        onTouchStart={registerInteraction}
      >
        <ScrollView
          ref={expandedScrollRef}
          bounces={position === "top"}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onScrollBeginDrag={registerInteraction}
          onMomentumScrollBegin={registerInteraction}
          contentContainerStyle={{
            gap: expanded ? hostConfig.stackGap : 0,
            paddingVertical: 2,
          }}
        >
          {expandedStacked.map(({ toast, zIndex }) => {
            return (
              <ToastItem
                key={toast.id}
                toast={toast}
                hostConfig={hostConfig}
                hostId={hostId}
                position={position}
                stackOpacity={1}
                stackScale={1}
                stackTranslate={0}
                zIndex={zIndex}
                templates={templates}
                store={store}
                interactionMode="deck"
                deckState="expanded"
                canHorizontalDismiss
                onInteraction={registerInteraction}
              />
            );
          })}
        </ScrollView>

        <GestureDetector gesture={collapseHandlePanGesture}>
          <View
            accessible
            accessibilityRole="button"
            accessibilityLabel="Collapse notifications"
            accessibilityHint="Drag upward to collapse expanded notifications"
            onTouchStart={registerInteraction}
            style={styles.collapseHandleTouchTarget}
          >
            <View
              style={[
                styles.collapseHandle,
                {
                  width: hostConfig.collapseHandleStyle.width,
                  height: hostConfig.collapseHandleStyle.height,
                  borderRadius: hostConfig.collapseHandleStyle.borderRadius,
                  backgroundColor:
                    hostConfig.collapseHandleStyle.backgroundColor ??
                    defaultCollapseHandleColor,
                  opacity: hostConfig.collapseHandleStyle.opacity,
                  marginTop: hostConfig.collapseHandleStyle.marginTop,
                  marginBottom: hostConfig.collapseHandleStyle.marginBottom,
                  shadowColor: collapseHandleShadowColor,
                  shadowOpacity: collapseHandleShadowOpacity,
                  shadowRadius: 3,
                  shadowOffset: { width: 0, height: 1 },
                  elevation: 2,
                },
              ]}
            />
          </View>
        </GestureDetector>
      </Animated.View>
    </View>
  );
}

function ToastStack(props: {
  position: ToastPosition;
  toasts: ToastRecord[];
  keyboardHeight: number;
  keyboardOffset: number;
  safeAreaInset: number;
  hostId: string;
  hostConfig: ResolvedToastHostConfig;
  templates: ToastTemplateRegistry;
  store: ReturnType<typeof useToastContext>["store"];
  screenHeight: number;
  safeAreaTop: number;
  safeAreaBottom: number;
}) {
  if (props.hostConfig.interactionMode === "classic") {
    return (
      <ClassicToastStack
        position={props.position}
        toasts={props.toasts}
        keyboardHeight={props.keyboardHeight}
        keyboardOffset={props.keyboardOffset}
        safeAreaInset={props.safeAreaInset}
        hostId={props.hostId}
        hostConfig={props.hostConfig}
        templates={props.templates}
        store={props.store}
      />
    );
  }

  return (
    <DeckToastStack
      position={props.position}
      toasts={props.toasts}
      keyboardHeight={props.keyboardHeight}
      keyboardOffset={props.keyboardOffset}
      safeAreaInset={props.safeAreaInset}
      hostId={props.hostId}
      hostConfig={props.hostConfig}
      templates={props.templates}
      store={props.store}
      screenHeight={props.screenHeight}
      safeAreaTop={props.safeAreaTop}
      safeAreaBottom={props.safeAreaBottom}
    />
  );
}

export function ToastHost({
  hostId,
  interactionMode = "deck",
  config,
  className,
  style,
  controllerRef,
  useRNScreensOverlay,
  rnScreensOverlayViewStyle,
}: ToastHostProps) {
  const { store, defaultHostId, templates } = useToastContext();
  const snapshot = useToastStoreSnapshot();
  const resolvedHostId = hostId ?? defaultHostId;

  const keyboardHeight = useKeyboardHeight();
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = useWindowDimensions();

  const mergedConfig = useMemo(() => {
    return {
      ...config,
      className: config?.className ?? className,
      style: config?.style ?? style,
      useRNScreensOverlay: config?.useRNScreensOverlay ?? useRNScreensOverlay,
      rnScreensOverlayViewStyle:
        config?.rnScreensOverlayViewStyle ?? rnScreensOverlayViewStyle,
    };
  }, [
    className,
    config,
    rnScreensOverlayViewStyle,
    style,
    useRNScreensOverlay,
  ]);

  useEffect(() => {
    store.registerHost(resolvedHostId, mergedConfig, interactionMode);
  }, [interactionMode, mergedConfig, resolvedHostId, store]);

  useEffect(() => {
    return () => {
      store.unregisterHost(resolvedHostId);
    };
  }, [resolvedHostId, store]);

  const controller = useMemo(() => {
    return store.createController(resolvedHostId);
  }, [resolvedHostId, store]);

  useEffect(() => {
    assignRef(controllerRef, controller);
    return () => {
      assignRef(controllerRef, null);
    };
  }, [controller, controllerRef]);

  const host = snapshot.hosts[resolvedHostId];
  if (!host) {
    return null;
  }

  const orderedToasts = sortToastsByPriorityAndOrder(host.toasts, host.config);
  const resolvePosition = (toast: ToastRecord) =>
    resolveToastPosition(toast, host.config);
  const groups = splitToastsByPosition(orderedToasts, resolvePosition);
  const resolvedInteractionMode = resolveInteractionMode(host.config);

  const topLeader = groups.top[0];
  const topKeyboardAvoidance = topLeader
    ? resolveKeyboardAvoidance(topLeader, host.config)
    : host.config.keyboardAvoidance;
  const topKeyboardOffset = topLeader
    ? resolveKeyboardOffset(topLeader, host.config)
    : host.config.keyboardOffset;

  const bottomLeader = groups.bottom[0];

  const bottomKeyboardAvoidance = bottomLeader
    ? resolveKeyboardAvoidance(bottomLeader, host.config)
    : host.config.keyboardAvoidance;

  const bottomKeyboardOffset = bottomLeader
    ? resolveKeyboardOffset(bottomLeader, host.config)
    : host.config.keyboardOffset;

  const topResolvedKeyboardHeight =
    resolvedInteractionMode === "deck" && topKeyboardAvoidance ? keyboardHeight : 0;
  const bottomResolvedKeyboardHeight = bottomKeyboardAvoidance
    ? keyboardHeight
    : 0;

  const hostViewport = (
    <View
      pointerEvents="box-none"
      className={host.config.className}
      style={[
        StyleSheet.absoluteFill,
        host.config.style,
      ]}
    >
      <ToastStack
        position="top"
        toasts={groups.top}
        keyboardHeight={topResolvedKeyboardHeight}
        keyboardOffset={topKeyboardOffset}
        safeAreaInset={insets.top}
        hostId={resolvedHostId}
        hostConfig={host.config}
        templates={templates}
        store={store}
        screenHeight={screenHeight}
        safeAreaTop={insets.top}
        safeAreaBottom={insets.bottom}
      />

      <ToastStack
        position="bottom"
        toasts={groups.bottom}
        keyboardHeight={bottomResolvedKeyboardHeight}
        keyboardOffset={bottomKeyboardOffset}
        safeAreaInset={insets.bottom}
        hostId={resolvedHostId}
        hostConfig={host.config}
        templates={templates}
        store={store}
        screenHeight={screenHeight}
        safeAreaTop={insets.top}
        safeAreaBottom={insets.bottom}
      />
    </View>
  );

  const content = (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      {hostViewport}
    </View>
  );

  return (
    <ToastFullWindowOverlay
      useOverlay={host.config.useRNScreensOverlay}
      viewStyle={host.config.rnScreensOverlayViewStyle}
    >
      {content}
    </ToastFullWindowOverlay>
  );
}

export const ToastViewport = ToastHost;
